DefineTestSuite("DataBinding", {
        /**
         * Bug: Issue was due to an 'optimization' which prevented the if expression from being evaluated with a
         * dependency tracked when evaluated as the result of a change trigger.
         */
        "When using an AND condition that incrementally evaluates its parts to true due to shortcut evaluation":{
            requiredHtmlResources:"CompositeAndCondition",
            becauseOf:function () {
                var Model = photon.observable.model.define({
                    x:false, y:false
                });
                var model = new Model();
                photon.binding.applyBindings(model);

                // update incrementally
                model.x(true);
                model.y(true);
            },
            "Should re-evaluate correctly":function () {
                assertEquals('true', $("#value").text());
            }
        }
    },
    {
        tearDown:function () {
            photon.dom.cleanNode(document);
        },
        htmlResources:{
            CompositeAndCondition:function () {
                /*:DOC +=
                 <span id="value" data-bind="text:x() && y()">
                 */
            }
        }
    }
);

