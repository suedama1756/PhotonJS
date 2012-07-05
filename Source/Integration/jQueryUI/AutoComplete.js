photon.defineType(
    photon.jQuery.ui.AutoCompleteOptionsProperty = function () {
    },
    photon.binding.data.Property,
    {
        replaceMethod:function (autoComplete, methodName, newFn) {
            var oldFn = autoComplete[methodName];
            if (oldFn !== newFn && !oldFn.originalFn_) {
                autoComplete[methodName] = newFn;
                autoComplete.originalFn_ = newFn;
            }
        },
        resetMethod:function (autoComplete, methodName) {
            var fn = autoComplete[methodName];
            if (fn.originalFn_) {
                autoComplete[methodName] = fn.originalFn_;
            }
        },
        getValue:function (binding) {
            return binding.options;
        },
        setValue:function (binding) {
            var newValue = binding.getSourceValue();
            var oldValue = binding.options;
            if (!photon.object.equals(oldValue, newValue)) {
                binding.options = newValue;

                var target = $(binding.getTarget());
                var autoComplete = $(target).autocomplete(newValue)
                    .data("autocomplete");

                var originalSuggest = autoComplete._suggest;
                this.replaceMethod(autoComplete, "_suggest",
                    function (items) {
                        if (!binding.selectionExecuted) {
                            originalSuggest.call(autoComplete, items);
                        }
                    });

                this.replaceMethod(autoComplete, "_resizeMenu",
                    function () {
                        var ul = autoComplete.menu.element;
                        ul.outerWidth(target.outerWidth());
                    });

                if (newValue.menuTemplate && newValue.itemTemplate) {
                    throw new Error("Cannot specify both menuTemplate and itemTemplate.");
                }

                if (newValue.menuTemplate) {
                    this.replaceMethod(autoComplete, "_renderMenu",
                        function (ul, item) {
                            applyTemplateText(ul, binding.getDataContext().getValue(), newValue.menuTemplate);
                            return ul;
                        });
                }
                else {
                    this.resetMethod(autoComplete, "_renderMenu");
                }

                if (newValue.itemTemplate) {
                    this.replaceMethod(autoComplete, "_renderItem",
                        function (ul, item) {
                            applyTemplateText(ul, item, newValue.itemTemplate);
                            return ul;
                        });
                }
                else {
                    this.resetMethod(autoComplete, "_renderItem");
                }

                if (newValue.submit) {
                    target.bind("keydown.autocomplete", function (event) {
                        var keyCode = $.ui.keyCode;
                        if (event.keyCode === keyCode.ENTER || event.keyCode === keyCode.NUMPAD_ENTER) {
                            newValue.submit(target.val());
                            target.autocomplete("widget").hide();
                            binding.selectionExecuted = true;
                        }
                        else {
                            binding.selectionExecuted = false;
                        }
                    });
                }
            }
        }
    })
;

photon.defineType(photon.jQuery.ui.AutoCompleteItemProperty = function () {

},
    photon.binding.data.Property,
    {
        getValue:function (binding) {
            return $(binding.getTarget()).data("item.autocomplete");
        },
        setValue:function (binding) {
            $(binding.getTarget()).data("item.autocomplete", binding.getSourceValue());
        }
    });

photon.binding.data.properties["autoComplete.options"] = new photon.jQuery.ui.AutoCompleteOptionsProperty();
photon.binding.data.properties["autoComplete.item"] = new photon.jQuery.ui.AutoCompleteItemProperty();

function applyTemplate(element, data, template) {
    $(photon.string.trim(template)).appendTo(element)
        .each(function (i, x) {
            if (x.nodeType === 1) {
                photon.binding.applyBindings(data, x);
            }
        });
}

function applyTemplateText(element, data, template) {
    if (photon.isString(template)) {
        applyTemplate(element, data, template);
    }
    else {
        photon.templating.getHtml(template, function (args) {
            applyTemplate(element, data, args.template);
        });
    }
}
