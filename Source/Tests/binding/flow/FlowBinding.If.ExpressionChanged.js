DefineTestSuite("FlowBinding.If.ExpressionChanged",
    {
        "When data context changes but condition remains true":{
            requiredHtmlResources:"singleIfFlowBinding",
            becauseOf:function () {
                var rootElement = $("#root")[0];
                var flowElement = $("#flow")[0];

                // setup initial binding
                photon.binding.applyBindings({
                    condition:true,
                    value:'Test'
                }, rootElement);

                assertEquals('Test', $(".testValue")[0].innerText);

                // switch data source on the binding without changing the condition
                var binding = photon.binding.NodeBindingInfo.getForElement(flowElement)
                    .getBindingByExpression(flowElement.getAttribute("data-flow"));
                binding.getDataContext()
                    .setValue({
                        condition:1, // use another different truthy value to verify correct handling
                        value:'Test Changed'
                    });
            },
            /*
             * BUG: There was a bug here due to the way data contexts used to get added for each node in an if,
             * they are no longer handled in this way, but lets stay vigilant.
             */
            "Should propagate data source change to child bindings":function () {
                assertEquals('Test Changed', $(".testValue")[0].innerText);
            },
            "Should not re-apply template" : function() {
                assertEquals(1, $(".testValue").length);
            }
        }
    },
    {
        htmlResources:{
            singleIfFlowBinding:function () {
                /*:DOC +=
                 <div id="root">
                    <div id="flow" data-flow="if:condition">
                        <span class="testValue" data-bind='innerText:value'></span>
                    </div>
                 </div>
                 */
            }
        } ,
        tearDown:function() {
            photon.dom.cleanNode(document);
        }
    }
);
