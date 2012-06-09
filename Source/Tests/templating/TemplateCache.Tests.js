DefineTestSuite("TemplateCache",
    {
        "When finding a fragment and no template with the specified name exists":{
            "Should return null":function () {
                assertNull(this.systemUnderTest_.findFragment("notFound"));
            }
        },
        "When getting a fragment and no template with the specified name exists":{
            "Should throw error":function () {
                assertException(function () {
                    this.systemUnderTest_.getFragment("notFound");
                }, new Error("No template could be found with key 'notFound'."), this);
            }
        },
        "When finding html and no template with the specified name exists":{
            "Should return null":function () {
                assertNull(this.systemUnderTest_.findHtml("notFound"));
            }
        },
        "When getting html and no template with the specified name exists":{
            "Should throw error":function () {
                assertException(function () {
                    this.systemUnderTest_.getHtml("notFound");
                }, new Error("No template could be found with key 'notFound'."), this);
            }
        },
        "When adding html":{
            becauseOf:function () {
                this.testHtml_ = "<div><span>Test</span></div>";
                this.systemUnderTest_.addHtml("name", this.testHtml_);
            },
            "Should be able to get html using the supplied name":function () {
                assertHtml(this.testHtml_, this.systemUnderTest_.getHtml("name"));
            },
            "Should be able to get fragment using the supplied name":function () {
                assertFragmentHtml(this.testHtml_,
                    this.systemUnderTest_.getFragment("name"));
            }
        },
        "When adding an element" : {
            requiredHtmlResources:"nonCommentDelimitedTemplate",
            becauseOf:function () {
                this.systemUnderTest_.addElement("template");
            },
            "Should be able to get html":function () {
                assertHtml(this.htmlResources.nonCommentDelimitedTemplate.expectedTemplateHtml,
                    this.systemUnderTest_.getHtml("template"));
            },
            "Should be able to get fragment":function () {
                assertFragmentHtml(this.htmlResources.nonCommentDelimitedTemplate.expectedTemplateHtml,
                    this.systemUnderTest_.getFragment("template"));
            }
        },
        "When adding an element by id and no name is specified":{
            requiredHtmlResources:"nonCommentDelimitedTemplate",
            becauseOf:function () {
                this.systemUnderTest_.addElement("template");
            },
            "Should be able to get entry using the element id as the name":function () {
                assertNotNullOrUndefined(this.systemUnderTest_.getTemplate("template"));
            }
        },
        "When adding an element and no name is specified":{
            requiredHtmlResources:"nonCommentDelimitedTemplate",
            becauseOf:function () {
                this.systemUnderTest_.addElement($("#template")[0]);
            },
            "Should be able to get entry using the element id as the name":function () {
                assertNotNullOrUndefined(this.systemUnderTest_.getTemplate("template"));
            }
        },
        "When adding an element by id and a name has been specified":{
            requiredHtmlResources:"nonCommentDelimitedTemplate",
            becauseOf:function () {
                this.systemUnderTest_.addElement("template", "alternativeName");
            },
            "Should get entry by specified name ":function () {
                assertNotNullOrUndefined(this.systemUnderTest_.getTemplate("alternativeName"));
            }
        },
        "When adding an element and a name has been specified":{
            requiredHtmlResources:"nonCommentDelimitedTemplate",
            becauseOf:function () {
                this.systemUnderTest_.addElement($("#template")[0], "alternativeName");
            },
            "Should get entry by specified name ":function () {
                assertNotNullOrUndefined(this.systemUnderTest_.getTemplate("alternativeName"));
            }
        },
        "When adding an element with no id and no name has been specified":{
            "Should throw error":function () {
                assertException(function () {
                    this.systemUnderTest_.addElement(document.createElement("div"));
                }, new Error("A name must be specified if the element does not have an id."), this);
            }
        },
        "When adding an element resource by id that contains multiple comment delimited templates":{
            requiredHtmlResources:"commentDelimitedMultiTemplate",
            becauseOf:function () {
                this.systemUnderTest_.addResourceElement("templates");
            },
            "Should add correctly named template entries":function () {
                assertNotNullOrUndefined(this.systemUnderTest_.getTemplate("templates.Template1"));
                assertNotNullOrUndefined(this.systemUnderTest_.getTemplate("templates.Template2"));
            }
        },
        "When adding an element resource that contains multiple comment delimited templates":{
            requiredHtmlResources:"commentDelimitedMultiTemplate",
            becauseOf:function () {
                this.systemUnderTest_.addResourceElement($("#templates")[0]);
            },
            "Should add correctly named template entries":function () {
                assertNotNullOrUndefined(this.systemUnderTest_.getTemplate("templates.Template1"));
                assertNotNullOrUndefined(this.systemUnderTest_.getTemplate("templates.Template2"));
            }
        },
        "When adding an element resource by id that contains multiple comment delimited templates and a name has been specified":{
            requiredHtmlResources:"commentDelimitedMultiTemplate",
            becauseOf:function () {
                this.systemUnderTest_.addResourceElement("templates", "alternativeName");
            },
            "Should add correctly named template entries":function () {
                assertNotNullOrUndefined(this.systemUnderTest_.getTemplate("alternativeName.Template1"));
                assertNotNullOrUndefined(this.systemUnderTest_.getTemplate("alternativeName.Template2"));
            }
        },
        "When adding an element resource that contains multiple comment delimited templates and a name has been specified":{
            requiredHtmlResources:"commentDelimitedMultiTemplate",
            becauseOf:function () {
                this.systemUnderTest_.addResourceElement($("#templates")[0], "alternativeName");
            },
            "Should add correctly named template entries":function () {
                assertNotNullOrUndefined(this.systemUnderTest_.getTemplate("alternativeName.Template1"));
                assertNotNullOrUndefined(this.systemUnderTest_.getTemplate("alternativeName.Template2"));
            }
        },
        "When adding an element resource by id that does not contain template comment delimiters":{
            requiredHtmlResources:"nonCommentDelimitedTemplate",
            becauseOf:function () {
                this.systemUnderTest_.addResourceElement("template");
            },
            "Should set the templates name to the if of the element":function () {
                assertNotNullOrUndefined(this.systemUnderTest_.getTemplate("template"));
            },
            "Should successfully get as html":function () {
                assertHtml(this.htmlResources.nonCommentDelimitedTemplate.expectedTemplateHtml,
                    this.systemUnderTest_.getHtml("template"));
            },
            "Should successfully get as fragment":function() {
                assertFragmentHtml(this.htmlResources.nonCommentDelimitedTemplate.expectedTemplateHtml,
                    this.systemUnderTest_.getFragment("template"));
            }
        },
        "When adding html that contains a single data-flow instruction":{
            becauseOf:function () {
                this.systemUnderTest_.addHtml('template', '<div id="singleFlow" data-flow="if:condition()">' +
                    '<span>data flow content</span></div>');
                this.template_ = this.systemUnderTest_.getTemplate('template');
            },
            "Should remove flow element content":function () {
                var flowElement = this.queryFragment('template', '#singleFlow');
                assertNull(flowElement.firstChild);
            },
            "Should add data template id reference to flow element":function () {
                var flowElement = this.queryFragment('template', '#singleFlow');

                // assert id exists
                var templateId = this.getElementDataTemplateId(flowElement);
                assertNotNullOrUndefined(templateId);

                // assert ids match
                assertEquals(templateId, this.template_.getChild(0).getKey());
            },
            "Should attach child flow dependency to entry":function() {
                // get child "flow" dependancy and verify link to parent
                assertEquals(1, this.template_.getChildCount());

                var flowTemplate = this.template_.getChild(0);
                assertNotNullOrUndefined(flowTemplate);
                assertEquals(this.template_, flowTemplate.getParent());
            }
        },
        "When removing a template" : {
            becauseOf:function () {
                this.systemUnderTest_.addHtml('template', '<div id="singleFlow" data-flow="if:condition()">' +
                    '<span>data flow content</span></div>');

                // get cache entry
                this.template_ = this.systemUnderTest_.getTemplate('template');

                // record calls to dispose
                photon.testing.mock.recordCalls(this.template_, "dispose");

                // remove the entry
                this.systemUnderTest_.remove('template');
            },
            "Should remove entry" : function() {
                assertNull(this.systemUnderTest_.findHtml('template'));
                assertNull(this.systemUnderTest_.findFragment('template'));
            },
            "Should invoke dispose on entry" : function() {
                this.template_.dispose.assertWasCalled(1);
            }
        },
        "When clearing" : {
            becauseOf:function () {
                this.systemUnderTest_.addHtml('template1', '<div>Template1</div>');
                this.systemUnderTest_.addHtml('template2', '<div>Template2</div>');

                // get cache entry
                this.cacheEntry1_ = this.systemUnderTest_.getTemplate('template1');
                this.cacheEntry2_ = this.systemUnderTest_.getTemplate('template2');

                // record calls to dispose
                photon.testing.mock.recordCalls(this.cacheEntry1_, "dispose");
                photon.testing.mock.recordCalls(this.cacheEntry2_, "dispose");

                // remove the entry
                this.systemUnderTest_.clear();
            },
            "Should remove all entries" : function() {
                assertNull(this.systemUnderTest_.findHtml('template1'));
                assertNull(this.systemUnderTest_.findFragment('template1'));
                assertNull(this.systemUnderTest_.findHtml('template2'));
                assertNull(this.systemUnderTest_.findFragment('template2'));
            },
            "Should invoke dispose on all removed entries" : function() {
                this.cacheEntry1_.dispose.assertWasCalled(1);
                this.cacheEntry2_.dispose.assertWasCalled(1);
            }
        }
    },
    {
        /**
         * @return {photon.templating.TemplateCache}
         */
        createSystemUnderTest:function () {
            return new photon.templating.TemplateCache();
        },
        tearDown : function() {
            var cache = photon.templating.getFlowTemplateCache_();

            photon.array.forEach(photon.object.getOwnPropertyNames(cache), function(propertyName) {
                delete cache[propertyName];
            });
        },
        getElementDataTemplateId : function(element) {
            return element.getAttribute("data-template-id");
        },
        queryFragment : function(name, selector) {
            return this.queryFragmentAll(name, selector)[0];
        },
        queryFragmentAll : function(name, selector) {
            var div = document.createElement("div");
            div.appendChild(
                this.systemUnderTest_.getFragment(name));
            if (selector) {
                return $(selector, div).toArray();
            }
            return $("*", div).toArray();

        },
        htmlResources : {
            "commentDelimitedMultiTemplate" : function() {
                /*:DOC +=
                 <script type='text/html' id="templates">
                    <!-- Template: Template1 -->
                    <span>Test2</span>
                    <!-- Template: Template2 -->
                    <span>Test2</span>
                 </script>
                 */
            },
            "nonCommentDelimitedTemplate" : photon.extend(function() {
                /*:DOC +=
                 <script type='text/html' id="template">
                    <span>Test1</span>
                 </script>
                 */
            }, { expectedTemplateHtml:"<span>Test1</span>" }),
            "singleDataFlow" : photon.extend(function() {
                /*:DOC +=
                 <script type='text/html' id="template">
                    <div id="singleFlow" data-flow="if:condition()">
                        <span>data flow content</span>
                    </div>
                 </script>
                */
            }, { expectedFlowTemplate : "<span>data flow content</span>" })
        }
    }
);

