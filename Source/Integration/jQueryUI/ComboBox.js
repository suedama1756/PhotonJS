if ($.widget) {
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
                .css('width', this.element.width())
                .autocomplete({
                    delay:0,
                    minLength:0,
                    source:function (request, response) {
                        var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i"),
                            control = self.options.control, items = photon.observable.unwrap(control.items),
                            result = [];

                        if (items) {
                            control.updateContext_();

                            for (var i = 0, j = 0, n = items.length; i < n; i++) {
                                var item = items[i], text = control.getDisplay_(item);
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
                            control.updateContext_();

                            var items = photon.observable.unwrap(control.items), item =
                                photon.array.find(items, function (x) {
                                    return control.getDisplay_(x).match(matcher);
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


    photon.jQuery.ui.ComboBox = function (target) {
        photon.jQuery.ui.ComboBox.base(this, target);
        this.isValid = true;
        this.dataContext_ = new photon.binding.DataContext();
    };

    photon.ui.defineControl("comboBox",
        photon.jQuery.ui.ComboBox,
        photon.ui.Control,
        {
            properties:{
                selectedValue:null,
                items:null,
                value:null,
                display:null,
                isValid:null
            },
            updateContext_:function () {
                this.dataContext_.setParent(
                    photon.binding.DataContext.getForElement(this.target_));
            },
            evaluateInContext_:function (fn, data) {
                var dataContext = this.dataContext_;
                dataContext.setSource(data);
                return photon.binding.evaluateInContext(dataContext, fn);
            },
            getDisplay_:function (item) {
                if (item && this.displayEvaluator_) {
                    return this.evaluateInContext_(this.displayEvaluator_, item);
                }
                return item ? item.toString() : '';
            },
            getValue_:function (item) {
                return item && this.valueEvaluator_ ?
                    this.evaluateInContext_(this.valueEvaluator_, item) :
                    item;
            },
            updateSelection_:function () {
                var items = photon.observable.unwrap(this.items), selectedValue = this.selectedValue, found = false,
                    text = '';

                if (items) {
                    this.updateContext_();
                    for (var i = 0, n = items.length; i < n; i++) {
                        var item = items[i];
                        if (found = this.getValue_(item) === selectedValue) {
                            text = this.getDisplay_(item);
                            break;
                        }
                    }
                }

                if (!found && selectedValue) {
                    this.selectedValue = null;
                    this.notifyPropertyChanged("selectedValue");
                }

                $(this.comboBox_.input).val(text);
            },
            onInvalidated:function () {
                // create the combo box if we haven't already
                if (!this.comboBox_) {
                    var $target = $(this.target_), self = this;
                    $target.combobox({
                        selected:function (event, data) {
                            var value = self.getValue_(data.item);
                            if (self.selectedValue !== value) {
                                self.selectedValue = value;
                                self.notifyPropertyChanged("selectedValue")
                            }
                        },
                        control:this
                    });
                    this.comboBox_ = $target.data("combobox");
                }

                // update display/value evaluators
                this.displayEvaluator_ = this.createEvaluator_(this.display);
                this.valueEvaluator_ = this.createEvaluator_(this.value);

                if (this.isValid) {
                    this.comboBox_.wrapper.removeClass("ui-combobox-error");
                } else {
                    this.comboBox_.wrapper.addClass("ui-combobox-error");
                }

                this.updateSelection_();
            },
            createEvaluator_:function (evaluator) {
                return evaluator ?
                    photon.binding.BindingContext.getInstance().parseBindingExpressions("data-bind", "null:" + evaluator)[0].getGetter() :
                    null;
            }
        });
}