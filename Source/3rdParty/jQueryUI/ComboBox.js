$.widget("ui.combobox", {
    _create:function () {
        var input,
            self = this,
            select = this.element.hide(),
            selected = select.children(":selected"),
            value = selected.val() ? selected.text() : "",
            wrapper = this.wrapper = $("<span>")
                .addClass("ui-combobox")
                .insertAfter(select);

        this.input = input = $("<input>")
            .appendTo(wrapper)
            .val(value)
            .addClass("ui-state-default ui-combobox-input")
            .autocomplete({
                delay:0,
                minLength:0,
                source:function (request, response) {
                    var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i"),
                        control = self.options.control, items = photon.observable.unwrap(control.items),
                        result = [];

                    if (items) {
                        var control = self.options.control;
                        control.updateContext();

                        for (var i = 0, j = 0, n = items.length; i < n; i++) {
                            var item = items[i], text = control.getDisplay(item);
                            if (!request.term || matcher.test(text)) {
                                result[j++] = {
                                    label:text,
                                    value:text,
                                    item:item
                                }
                            }

                        }
                    }

                    response(result);
                },
                select:function (event, ui) {
                    self._trigger("selected", event, {
                        item:ui.item.item
                    });
                },
                change:function (event, ui) {
                    if (!ui.item) {
                        var $this = $(this), matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex($this.val()) + "$", "i");

                        var control = self.options.control;
                        control.updateContext();

                        var items = photon.observable.unwrap(self.control.items), item =
                            photon.array.find(items, function(x) {
                                return control.getDisplay(x).match(matcher);
                            });

                        if (!item) {
                            $this.val('');
                            input.data('autocomplete').term = '';
                            self._trigger("selected", event, {
                                item:null
                            });
                            return false;
                        }
                    }
                }
            })
            .addClass("ui-widget ui-widget-content ui-corner-left");

        input.data("autocomplete")._renderItem = function (ul, item) {
            return $("<li></li>")
                .data("item.autocomplete", item)
                .append("<a>" + item.label + "</a>")
                .appendTo(ul);
        };

        $("<a>")
            .attr("tabIndex", -1)
            .attr("title", "Show All Items")
            .appendTo(wrapper)
            .button({
                icons:{
                    primary:"ui-icon-triangle-1-s"
                },
                text:false
            })
            .removeClass("ui-corner-all")
            .addClass("ui-corner-right ui-combobox-toggle")
            .click(function () {
                // close if already visible
                if (input.autocomplete("widget").is(":visible")) {
                    input.autocomplete("close");
                    return;
                }

                // work around a bug (likely same cause as #5265)
                $(this).blur();

                // pass empty string as value to search for, displaying all results
                input.autocomplete("search", "");
                input.focus();
            });
    },

    destroy:function () {
        this.wrapper.remove();
        this.element.show();
        $.Widget.prototype.destroy.call(this);
    }
});

photon.ui.ComboBox = function (target) {
    photon.ui.ComboBox.base(this, target);
    this.dataContext_ = new photon.binding.DataContext();
};

photon.ui.defineControl("comboBox",
    photon.ui.ComboBox,
    photon.ui.Control,
    {
        properties:{
            selectedItem:null,
            items:null,
            value:null,
            display:null
        },
        updateContext:function () {
            this.dataContext_.setParent(
                photon.binding.DataContext.getForElement(this.target_));
        },
        evaluateInContext:function (fn, data) {
            var dataContext = this.dataContext_;
            dataContext.setSource(data);
            return photon.binding.evaluateInContext(dataContext, fn);
        },
        getDisplay:function (item) {
            if (item && this.displayEvaluator_) {
                return this.evaluateInContext(this.displayEvaluator_, item);
            }
            return item ? item.toString() : "";
        },
        getValue:function (item) {
            return item && this.valueEvaluator_ ?
                this.evaluateInContext(this.valueEvaluator_, item) :
                item;
        },
        onInvalidated:function () {
            // create the combo box if we haven't already
            if (!this.comboBox_) {
                var $target = $(this.target_), self = this;
                $target.combobox({
                    selected:function (event, data) {
                        if (self.selectedItem !== data.item) {
                            self.selectedItem = data.item;
                            self.notifyPropertyChanged("selectedItem")
                        }
                    },
                    control:this
                });
                this.comboBox_ = $target.data("combobox");
            }

            // update display/value evaluators
            this.displayEvaluator_ = this.createEvaluator_(this.display);
            this.valueEvaluator_ = this.createEvaluator_(this.value);

            $(this.comboBox_.input).val(this.getDisplay(this.selectedItem));

        },
        createEvaluator_:function (evaluator) {
            return evaluator ?
                photon.binding.BindingContext.getInstance().parseBindingExpressions("data-bind", "null:" + evaluator)[0].getGetter() :
                null;
        }
    });

