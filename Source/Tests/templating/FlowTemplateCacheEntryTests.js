DefineTestSuite("FlowTemplateCacheEntry",
    {
        "When creating":{
            "Should create":function () {
                assertNotNullOrUndefined(this.systemUnderTest_);
            },
            "Should return null for parent":function () {
                assertNull(this.systemUnderTest_.getParent());
            },
            "Should return 0 for child count":function () {
                assertEquals(0, this.systemUnderTest_.getChildCount());
            },
            "Should add to flow template cache":function () {
                var cache = photon.templating.getFlowTemplateCache_();
                assertEquals(cache[this.systemUnderTest_.getKey()],
                    this.systemUnderTest_);
            },
            "Should increment keys":function () {
                var newEntry = new photon.templating.FlowTemplateCacheEntry();
                assertEquals(this.systemUnderTest_.getKey() + 1,
                    newEntry.getKey());
            }
        },
        "When preparing an elements flow bindings":{
            requiredHtmlResources:"template",
            skipCreationOfSystemUnderTest_ : true,
            becauseOf:function () {
                this.rootEntries_ = photon.templating.prepareFlowTemplates(
                    $("#testElement")[0]);
            },
            "Should identify unique root entries":function () {
                // verify we have the correct number of entries
                assertEquals(3, this.rootEntries_.length);

                // verify they are unique
                var entries = [];
                photon.array.removeDuplicates(this.rootEntries_,
                    entries, function (entry) {
                        return entry.getKey();
                    });
                assertEquals(3, entries.length);
            },
            "Should identify correct root entries":function () {
                // verify we have identified the correct number of root elements
                var rootFlowElements = $('*[id^="root"]');
                assertEquals(3, rootFlowElements.length);

                // verify the entries match the element ids
                function isMatchingEntry(entry) {
                    return entry.getKey().toString() === this.toString();
                }

                for (var i = 0; i < rootFlowElements.length; i++) {
                    var currentRootFlowElement = rootFlowElements[i];
                    assertTrue(photon.array.findIndex(this.rootEntries_,
                        isMatchingEntry, currentRootFlowElement.getAttribute("data-template-id")) !== -1);
                }
            },
            "Should remove all flow elements that are not roots from dom":function () {
                assertEquals(3, $('*[data-flow]').length);
            },
            "Should create correct structure":function () {
                //  1. check template for 1st root at root level
                var entryTemplate = this.getSelectableTemplateById("rootAtRootLevel1");
                assertEquals(3, $("div", entryTemplate).length);
                assertNull($("#rootAtRootLevel1-each",
                    entryTemplate)[0].firstChild);
                assertNull($("#rootAtRootLevel1-if",
                    entryTemplate)[0].firstChild);

                // 1.1 check templates for children of 1st root at root level
                var childEntryTemplate = this.getSelectableTemplateById("rootAtRootLevel1-each",
                    entryTemplate);
                assertHtml("<span>rootAtRootLevel1.Each</span>",
                    childEntryTemplate.innerHTML);
                childEntryTemplate = this.getSelectableTemplateById("rootAtRootLevel1-if",
                    entryTemplate);
                assertHtml("<span>rootAtRootLevel1.If</span>",
                    childEntryTemplate.innerHTML);

                //  2. check template for 2nd root at root level
                entryTemplate = this.getSelectableTemplateById("rootAtRootLevel2");
                assertHtml("<span>rootAtRootLevel2</span>",
                    entryTemplate.innerHTML);

                //  3. check template for root at child level
                entryTemplate = this.getSelectableTemplateById("rootAtChildLevel");
                assertEquals(1, $("div", entryTemplate).length);
                assertNull($("#rootAtChildLevel-each",
                    entryTemplate)[0].firstChild);

                //  3.1 check templates for children of root at child level
                childEntryTemplate = this.getSelectableTemplateById("rootAtChildLevel-each",
                    entryTemplate);
                assertHtml("<span>rootAtChildLevel.Each</span>",
                    childEntryTemplate.innerHTML);
            },
            "Should add entries to cache" : function() {
                assertEquals(6, photon.object.getOwnPropertyNames(photon.templating.getFlowTemplateCache_()).length);
            }
        },
        "When preparing element that has already been prepared": {
            requiredHtmlResources:"template",
            skipCreationOfSystemUnderTest_:true,
            becauseOf:function() {
                photon.templating.prepareFlowTemplates(
                    $("#testElement")[0]);

                this.rootEntries_ = photon.templating.prepareFlowTemplates(
                    $("#testElement")[0]);

            },
            "Should do nothing" : function() {
                assertEquals(0, this.rootEntries_.length);
            }
        },
        "When element that has been prepared is removed":{
            requiredHtmlResources:"template",
            skipCreationOfSystemUnderTest_ : true,
            becauseOf : function() {
                var testElement = $("#testElement");

                // setup flow templates
                photon.templating.prepareFlowTemplates(testElement[0]);

                var cache = photon.templating.getFlowTemplateCache_();
                this.entries_ = photon.array.map(photon.object.getOwnPropertyNames(cache),
                    function (propertyName) {
                        var entry = cache[propertyName];
                        photon.testing.mock.recordCalls(entry, "dispose");
                        return entry;
                    });

                // remove element (Effective GC root for templates)
                testElement.remove();
            },
            "Should cleanup cache" : function() {
                assertEquals(0, photon.object.getOwnPropertyNames(
                    photon.templating.getFlowTemplateCache_()).length);
            },
            "Should dispose all entries": function() {
                photon.array.forEach(this.entries_, function(entry) {
                    entry.dispose.assertWasCalled(1);
                });
            },
            "Should clear keys of all entries": function() {
                photon.array.forEach(this.entries_, function(entry) {
                    assertUndefined(entry.getKey());
                });
            }
        }
    },
    {
        createSystemUnderTest:function () {
            return this.skipCreationOfSystemUnderTest_ ? null : new photon.templating.FlowTemplateCacheEntry();
        },
        tearDown : function() {
            var cache = photon.templating.getFlowTemplateCache_();
            photon.array.forEach(photon.object.getOwnPropertyNames(cache), function(propertyName) {
                delete cache[propertyName];
            });
        },
        getElementDataTemplateId:function (element) {
            return element.getAttribute("data-template-id");
        },
        getSelectableTemplateById:function (id, context) {
            var element = $("#" + id, context)[0];
            var entry = photon.templating.getFlowTemplateCache_()[
                this.getElementDataTemplateId(element)];
            return photon.dom.wrap(entry.getFragment(), "div");
        },
        htmlResources:{
            template:function () {
                /*:DOC +=
                 <div id="testElement" >
                    <div id="rootAtRootLevel1" data-flow="if:condition()">
                        <div>
                            <div id="rootAtRootLevel1-each" data-flow="each:items()">
                                <span>rootAtRootLevel1.Each</span>
                            </div>
                        </div>
                        <div id="rootAtRootLevel1-if" data-flow="if:condition()">
                            <span>rootAtRootLevel1.If</span>
                        </div>
                    </div>
                    <div id="rootAtRootLevel2" data-flow="if:condition()">
                        <span>rootAtRootLevel2</span>
                    </div>
                    <div>
                        <div id="rootAtChildLevel" data-flow="if:condition()">
                            <div id="rootAtChildLevel-each" data-flow="each:items()" >
                                <span>rootAtChildLevel.Each</span>
                            </div>
                        </div>
                    </div>
                 </div>
                 */
            }
        }
    });

