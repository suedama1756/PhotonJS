(function () {
    var IfInIfModel = photon.observable.model.define({
        condition1:false,
        condition2:false,
        value:'test'
    });

    DefineTestSuite("FlowBinding.DataContext", {
            "When if1 is true and child if2 is true":{
                requiredHtmlResources:"IfInIf",
                becauseOf:function () {
                    photon.binding.applyBindings(new IfInIfModel({
                        condition1:true,
                        condition2:true
                    }));

                    this.elements_ = assertElements({
                        if1:null,
                        if2:null,
                        value:null
                    });
                },
                "Should share the root data context across all elements":function () {
                    assertSame(
                        photon.binding.DataContext.getForElement(this.elements_.if1),
                        photon.binding.DataContext.getForElement(this.elements_.if2));
                    assertSame(
                        photon.binding.DataContext.getForElement(this.elements_.if2),
                        photon.binding.DataContext.getForElement(this.elements_.value));
                },
                "Should not attach a local data context to any of the elements":function () {
                    assertNull(photon.binding.DataContext.getLocalForElement(this.elements_.if1));
                    assertNull(photon.binding.DataContext.getLocalForElement(this.elements_.if1));
                    assertNull(photon.binding.DataContext.getLocalForElement(this.elements_.value));
                },
                "Should update bindings":function () {
                    assertEquals(
                        "test", this.elements_.value.innerText);
                }
            },
            "When if1 is true and child if2 is false then if2 becomes true":{
                requiredHtmlResources:"IfInIf",
                becauseOf:function () {
                    var model = new IfInIfModel({condition1:true, condition2:false});
                    photon.binding.applyBindings(model);
                    assertElements({
                        if1:null,
                        if2:null,
                        value:'!'
                    });

                    model.condition2(true);
                    this.elements_ = assertElements({
                        if1:null,
                        if2:null,
                        value:null
                    });
                },
                "Should share the root data context across all elements":function () {
                    assertSame(
                        photon.binding.DataContext.getForElement(this.elements_.if1),
                        photon.binding.DataContext.getForElement(this.elements_.if2));
                    assertSame(
                        photon.binding.DataContext.getForElement(this.elements_.if2),
                        photon.binding.DataContext.getForElement(this.elements_.value));
                },
                "Should not attach a local data context to any of the elements":function () {
                    assertNull(photon.binding.DataContext.getLocalForElement(this.elements_.if1));
                    assertNull(photon.binding.DataContext.getLocalForElement(this.elements_.if1));
                    assertNull(photon.binding.DataContext.getLocalForElement(this.elements_.value));
                },
                "Should update bindings:":function () {
                    assertEquals(
                        "test", this.elements_.value.innerText);
                }
            },
            "When each has child if1 and if1 has child if2":{
                requiredHtmlResources:"IfInEach",
                becauseOf:function () {
                    photon.binding.applyBindings({
                        items:[
                            new IfInIfModel(
                                {
                                    condition1:true,
                                    condition2:false,
                                    value:1
                                }),
                            new IfInIfModel({
                                condition1:false,
                                condition2:true,
                                value:2
                            }),
                            new IfInIfModel({
                                condition1:true,
                                condition2:true,
                                value:3
                            })
                        ]
                    });

                    this.elements_ = this.getEachInIfElements();

                },
                "Should create a data context for each item and share it amongst its children:":function () {
                    var items = this.elements_.items;
                    assertSame(
                        photon.binding.DataContext.getForElement(items[0].if1),
                        photon.binding.DataContext.getForElement(items[0].if2));
                    assertNull(items[0].value);

                    // Item 1
                    assertNull(items[1].if2);
                    assertNull(items[1].value);

                    // Item 2
                    assertSame(
                        photon.binding.DataContext.getForElement(items[2].if1),
                        photon.binding.DataContext.getForElement(items[2].if2));
                    assertEquals(3, items[2].value.innerText);
                }
            },

            "When if1 is an object exists condition and there are child bindings dependent on the objects existence and the condition transitions from exists to not exists":{
                requiredHtmlResources:"IfObjectExists",
                becauseOf:function () {
                    photon.binding.applyBindings({
                        data:{
                            value:1
                        }
                    });

                    // verify our assumption
                    assertEquals(1, $(".value").length);

                    // apply bindings
                    photon.binding.applyBindings({
                        data:undefined
                    })
                },
                "Should update correctly":function () {
                    assertEquals(0, $(".value").length);
                }
            },
            "When if1 is an object exists condition and there are child bindings dependent on the objects existence and the condition transitions from not exists to exists":{
                requiredHtmlResources:"IfObjectExists",
                becauseOf:function () {
                    photon.binding.applyBindings({ data:undefined });
                    assertEquals(0, $(".value").length);
                    photon.binding.applyBindings({
                        data:{
                            value:1
                        }
                    });
                },
                "Should update correctly":function () {
                    assertEquals('1', $(".value").text());

            "When next sibling if in each":{
                requiredHtmlResources : "IfInEachNextSibling",
                becauseOf: function() {
                    var data = {
                        items : [{
                            condition:true,
                            value:"Correct"
                        }],
                        value : "Incorrect"
                    }
                    photon.binding.applyBindings(data);
                },
                "Should inherit correct data context" : function() {
                     assertEquals("Correct", $(".value").text());
                }
            }
        },
        {
            tearDown:function () {
                photon.dom.cleanNode(document);
            },
            getEachInIfElements:function () {
                var result = assertElements({
                    each1:null
                });
                result.items = $(".if1").map(function (i, x) {
                    return assertElements({
                        if1:x,
                        if2:"? .if2",
                        value:"? span"
                    }, x);
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
                },

                IfObjectExists:function () {
                    /*:DOC +=
                     <div class="if1" data-flow="if:data">
                     <span class="value" data-bind="innerText:data.value" ></span>

                IfInEachNextSibling:function () {
                    /*:DOC +=
                     <div id="each1" data-flow="each:items">
                     <div class="if1" data-flow="if:condition,applyTo:NextSibling">
                        <span class="value" data-bind="innerText:value" ></span>
                     </div>
                     </div>
                     </div>
                     */
                }
            }
        });
})();
