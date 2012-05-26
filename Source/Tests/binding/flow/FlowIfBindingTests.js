DefineTestSuite("FlowIfBindingTests",
    {
        "When data context changes but condition does not":{
            requiredHtmlResources:"simpleIfFlowBinding",
            becauseOf:function () {
                var rootElement = $("#root")[0];
                var flowElement = $("#flow")[0];

                // setup initial binding
                photon.binding.applyBindings({
                    condition:true,
                    value:'Test'
                }, rootElement);

                assertEquals('Test', $("#test")[0].innerText);

                // switch data source on the binding without changing the condition
                var binding = photon.binding.NodeBindingInfo.getOrCreateForElement(flowElement)
                    .getBindingByExpression(flowElement.getAttribute("data-flow"));
                binding.getDataContext()
                    .setValue({
                        condition:true,
                        value:'Test Changed'
                    });
            },
            "Should propagate data source change to child bindings":function () {
                assertEquals('Test Changed', $("#test")[0].innerText);
            }
        }
    },
    {
        htmlResources:{
            simpleIfFlowBinding:function () {
                /*:DOC +=
                 <div id="root">
                 <div id="flow" data-flow="if:condition">
                 <span id='test' data-bind='innerText:value'></span>
                 </div>
                 </div>
                 */
            }
        }
    }
);
