DefineTestSuite("FlowBinding.DataContext", {
        "When if in if":{
            requiredHtmlResources:"IfInIf",
            "Should attach data contexts correctly:":function () {
                photon.binding.applyBindings({
                    condition1:true,
                    condition2:true,
                    value:'test'
                });
                var elements = this.getIfInIfElements();
                assertSame(
                    photon.binding.DataContext.getForElement(elements.if1),
                    photon.binding.DataContext.getForElement(elements.if2));
                assertEquals(
                    "test", elements.value.innerText);
            }
        },
        "When if in if in each":{
            requiredHtmlResources:"IfInEach",
            "Should attach data contexts correctly:":function () {
                photon.binding.applyBindings({
                    items:[
                        {
                            condition1:true,
                            condition2:false,
                            value:1
                        },
                        {
                            condition1:false,
                            condition2:true,
                            value:2
                        },
                        {
                            condition1:true,
                            condition2:true,
                            value:3
                        }
                    ]
                });

                var elements = this.getEachInIfElements(), items = elements.items;

                // Item 0
                assertSame(
                    photon.binding.DataContext.getForElement(items[0].if1),
                    photon.binding.DataContext.getForElement(items[0].if2));
                assertUndefined(items[0].value);

                // Item 1
                assertUndefined(items[1].if2);
                assertUndefined(items[1].value);

                // Item 2
                assertSame(
                    photon.binding.DataContext.getForElement(items[2].if1),
                    photon.binding.DataContext.getForElement(items[2].if2));
                assertEquals(3, items[2].value.innerText);
            }
        }
    },
    {
        tearDown:function() {
            photon.dom.cleanNode(document);
        },
        /**
         * @return {*}
         */
        getIfInIfElements:function () {
            return bindNodeObject({
                if1:null,
                if2:null,
                value:null
            });
        },
        getEachInIfElements:function () {
            var result = bindNodeObject({
                each1:null
            });
            result.items = $(".if1").map(function (i, x) {
                var result = {
                    if1:x,
                    if2:$("div", x)[0] || undefined,
                    value:$("span", x)[0] || undefined
                };
                return result;
            });
            return result;
        },
        htmlResources:{
            IfInIf:function () {
                /*:DOC +=
                 <div id="if1" data-flow="if:condition1">
                 <div id="if2" data-flow="if:condition2">
                 <span id="value" data-bind="innerText:value" ></span>
                 </div>
                 </div>
                 */
            },
            IfInEach:function () {
                /*:DOC +=
                 <div id="each1" data-flow="each:items">
                 <div class="if1" data-flow="if:condition1">
                 <div class="if2" data-flow="if:condition2">
                 <span class="value" data-bind="innerText:value" ></span>
                 </div>
                 </div>
                 </div>
                 */
            }
        }
    });
