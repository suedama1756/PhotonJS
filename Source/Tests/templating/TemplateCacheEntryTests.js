DefineTestSuite("TemplateCacheEntry",
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
            }
        },
        "When creating children":{
            becauseOf:function () {
                this.child1_ = new photon.templating.TemplateCacheEntry(this.systemUnderTest_);
                this.child2_ = new photon.templating.TemplateCacheEntry(this.systemUnderTest_);
            },
            "Should have correct child count":function () {
                assertEquals(2, this.systemUnderTest_.getChildCount());
            },
            "Should have correct parent for children":function () {
                assertEquals(this.systemUnderTest_, this.child1_.getParent());
                assertEquals(this.systemUnderTest_, this.child2_.getParent());
            },
            "Should have correct children":function () {
                assertEquals(this.child1_, this.systemUnderTest_.getChild(0));
                assertEquals(this.child2_, this.systemUnderTest_.getChild(1));
            }
        },
        "When setting template html":{
            becauseOf:function () {
                this.systemUnderTest_.setTemplate("<div>Test</div>");
            },
            "Should get correct html":function () {
                assertHtml("<div>Test</div>", this.systemUnderTest_.getHtml());
            },
            "Should get correct fragment":function () {
                assertFragmentHtml("<div>Test</div>", this.systemUnderTest_.getFragment());
            }
        },
        "When setting template fragment":{
            becauseOf:function () {
                var fragment = document.createDocumentFragment();
                fragment.appendChild(photon.dom.htmlToFragmentOrNode("<div>Test</div>"));
                this.systemUnderTest_.setTemplate(fragment);
            },
            "Should get correct html":function () {
                assertHtml("<div>Test</div>", this.systemUnderTest_.getHtml());
            },
            "Should get correct fragment":function () {
                assertFragmentHtml("<div>Test</div>", this.systemUnderTest_.getFragment());
            },
            "Should get correct fragment after getting html":function () {
                // due to the mechanism used to get html we need to ensure fragment is still intact!!
                assertHtml("<div>Test</div>", this.systemUnderTest_.getHtml());
                assertFragmentHtml("<div>Test</div>", this.systemUnderTest_.getFragment());
            }
        }
    },
    {
        createSystemUnderTest:function () {
            /**
             * @type {photon.binding.TemplateCacheEntry}
             * @private
             */
            this.systemUnderTest_ = new photon.templating.TemplateCacheEntry();
            return this.systemUnderTest_;
        }
    }
)
;
