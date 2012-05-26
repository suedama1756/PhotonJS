SetDataContextTestCase = function (scenario, obj) {
    var base = {
        /**
         *
         * @param node
         * @return {photon.binding.NodeBindingInfo}
         */
        assertNodeBindingInfo:function (node) {
            assertNotNullOrUndefined("An null or undefined node was passed to assertNodeBindingInfo", node);

            var nodeBindingInfo = photon.binding.NodeBindingInfo.getForElement(node);
            assertNotNullOrUndefined("The node does not have a NodeBindingInfo object associated with it.", nodeBindingInfo);
            return nodeBindingInfo;
        },
        /**
         * Asserts the node has a DataContext associated with it.
         * @param {HTMLElement} node
         * @return {photon.binding.DataContext}
         */
        assertHasDataContext:function (node) {
            var nodeBindingInfo = this.assertNodeBindingInfo(node);
            assertNotNullOrUndefined("The node does not have a data context assigned",
                nodeBindingInfo.getDataContext());

            return nodeBindingInfo.getDataContext();
        },
        assertHasSingleBinding:function (node) {
            var nodeBindingInfo = this.assertNodeBindingInfo(node);

            assertEquals("There are two many bindings associated with the node",
                1, nodeBindingInfo.getBindingCount());
            return nodeBindingInfo.getBinding(0);
        },
        scenarios:function() {
            var self = this;

            var Scenarios = function() {
                /**
                 * Configures a single node
                 * @return {Scenarios}
                 */
                this.withSingleNode = function () {
                    /*:DOC += <div id="node">Single Node</div>*/

                    // bind the node object to the DOM structure
                    bindNodeObject(self.nodeObject = {
                        node:null
                    });
                    self.nodeData1 = {Value:1};
                    self.nodeData2 = {Value:2};

                    return this;
                };
                /**
                 * Configures a multi node
                 * @return {Scenarios}
                 */
                this.withMultiNode = function() {
                    /*:DOC +=
                     <div id="root">
                        <div id="level1A" data-bind="data-context:level1">
                            <div id="inject">
                                <div id="level1A2A" data-bind="data-context:level2"></div>
                            </div>
                        </div>
                        <div id="level1B" data-bind="data-context:level1">
                            <div>
                                <div id="level1B2A" data-bind="data-context:level2"></div>
                            </div>
                        </div>
                     </div>
                     */

                    bindNodeObject(self.nodeObject = {
                        "root":null,
                        "level1A":null,
                        "level1B":null,
                        "level1A2A":null,
                        "level1B2A":null,
                        "inject":null
                    });

                    self.nodeData1 = {
                        value:10,
                        level1:{
                            value:11,
                            level2:{
                                value:12
                            }
                        }
                    };

                    self.nodeData2 = {
                        value:20,
                        level1:{
                            value:21,
                            level2:{
                                value:22
                            }
                        }
                    };
                    return this;
                };
                /**
                 * Configures a multi node
                 * @return {Scenarios}
                 */
                this.withBindings = function() {
                    /*:DOC +=
                     <div id="root">
                        <div id="level1" data-bind="data-context:level1">
                            <span id="level1Binding" data-bind="innerText:value" ></span>
                            <div id="levelInject">
                                <span id="levelInjectBinding" data-bind="innerText:value" ></span>
                                <div id="level2" data-bind="data-context:level2">
                                    <span id="level2Binding" data-bind="innerText:value" ></span>
                                </div>
                            </div>
                        </div>
                     </div>
                     */

                    bindNodeObject(self.bindingsNodeObject = {
                        "root":null,
                        "level1":null,
                        "level1Binding":null,
                        "levelInject":null,
                        "levelInjectBinding":null,
                        "level2":null,
                        "level2Binding":null
                    });

                    self.bindingsNodeData1 = {
                        value:10,
                        level1:{
                            value:11,
                            level2:{
                                value:12
                            }
                        }
                    };

                    self.bindingsNodeData2 = {
                        value:20,
                        level1:{
                            value:21,
                            level2:{
                                value:22
                            }
                        }
                    };
                    return this;
                };
                /**
                 * Sets the data context
                 * @param node
                 * @param data
                 * @returns {Scenarios)
                 */
                this.withDataContext = function (node, data) {
                    photon.binding.applyBindings(data, node);
                    return this;
                };
            };
            return new Scenarios();
        }
    };

    return TestCase("photon.binding.setDataContext: " + scenario, photon.extend(obj, base));
};

SetDataContextTestCase("If data context is set on a node that has no data context.",
    {
        setUp:function () {
            this.scenarios()
                .withSingleNode()
                .withDataContext(this.nodeObject.node, this.nodeData1);
        },
        "test: should associate a new data context with the node":function () {
            this.assertHasDataContext(this.nodeObject.node);
        },
        "test: should set the data context's explicit data source":function () {
            assertEquals(this.nodeData1, this.assertHasDataContext(this.nodeObject.node).getValue());
        }
    });

SetDataContextTestCase("If data context is set on a node that has an existing data context.",
    {
        setUp:function() {
            // set initial data context
            this.scenarios()
                .withSingleNode()
                .withDataContext(this.nodeObject.node, this.nodeData1);
            this.originalDataContext = this.assertHasDataContext(this.nodeObject.node);

            // set new data context
            this.scenarios()
                .withDataContext(this.nodeObject.node, this.nodeData2);
            this.modifiedDataContext = this.assertHasDataContext(this.nodeObject.node);

        },
        "test: should re-use the existing data context for the node":function() {
            assertSame(this.originalDataContext, this.modifiedDataContext);
        },
        "test: should update the data context's explicit data source" : function() {
            assertEquals(this.nodeData2, this.modifiedDataContext.getValue());
        }
    });

SetDataContextTestCase("If data context is set on a node that has unbound child data-context bindings",
    {
        rootDataContext:null,
        level1ADataContext:null,
        level1A2ADataContext:null,
        level1BDataContext:null,
        level1B2ADataContext:null,
        setUp:function () {
            this.scenarios()
                .withMultiNode()
                .withDataContext(this.nodeObject.root, this.nodeData1);

            this.rootDataContext = this.assertHasDataContext(this.nodeObject.root);
            this.level1ADataContext = this.assertHasDataContext(this.nodeObject.level1A);
            this.level1A2ADataContext = this.assertHasDataContext(this.nodeObject.level1A2A);
            this.level1BDataContext = this.assertHasDataContext(this.nodeObject.level1B);
            this.level1B2ADataContext = this.assertHasDataContext(this.nodeObject.level1B2A);
        },
        "test: should associate a new data context with the root node":function () {
            this.assertHasDataContext(this.nodeObject.root);
        },
        "test: should set explicit data source for root nodes data context":function () {
            assertEquals(this.nodeData1, this.rootDataContext.getValue());
        },
        "test: should create correct hierarchy of data contexts":function () {
            assertEquals(2, this.rootDataContext.getChildCount());
            assertArrayContains(this.rootDataContext.children_, this.level1ADataContext);
            assertSame(this.level1ADataContext.getParent(), this.rootDataContext);
            assertArrayContains(this.rootDataContext.children_, this.level1BDataContext);
            assertSame(this.level1BDataContext.getParent(), this.rootDataContext);

            assertEquals(1, this.level1ADataContext.getChildCount());
            assertArrayContains(this.level1ADataContext.children_, this.level1A2ADataContext);
            assertSame(this.level1A2ADataContext.getParent(), this.level1ADataContext);

            assertEquals(1, this.level1BDataContext.getChildCount());
            assertArrayContains(this.level1BDataContext.children_, this.level1B2ADataContext);
            assertSame(this.level1B2ADataContext.getParent(), this.level1BDataContext);
        }
    });

SetDataContextTestCase("If data context is set on a node that has bound child data-context bindings",
    {
        originalRootDataContext:null,
        originalLevel1ADataContext:null,
        originalLevel1A2ADataContext:null,
        originalLevel1BDataContext:null,
        originalLevel1B2ADataContext:null,
        modifiedRootDataContext:null,
        modifiedLevel1ADataContext:null,
        modifiedLevel1A2ADataContext:null,
        modifiedLevel1BDataContext:null,
        modifiedLevel1B2ADataContext:null,
        setUp:function () {
            this.scenarios()
                .withMultiNode()
                .withDataContext(this.nodeObject.root, this.nodeData1);

            this.originalRootDataContext = this.assertHasDataContext(this.nodeObject.root);
            this.originalLevel1ADataContext = this.assertHasDataContext(this.nodeObject.level1A);
            this.originalLevel1A2ADataContext = this.assertHasDataContext(this.nodeObject.level1A2A);
            this.originalLevel1BDataContext = this.assertHasDataContext(this.nodeObject.level1B);
            this.originalLevel1B2ADataContext = this.assertHasDataContext(this.nodeObject.level1B2A);

            this.scenarios()
                .withDataContext(this.nodeObject.root, this.nodeData2);

            this.modifiedRootDataContext = this.assertHasDataContext(this.nodeObject.root);
            this.modifiedLevel1ADataContext = this.assertHasDataContext(this.nodeObject.level1A);
            this.modifiedLevel1A2ADataContext = this.assertHasDataContext(this.nodeObject.level1A2A);
            this.modifiedLevel1BDataContext = this.assertHasDataContext(this.nodeObject.level1B);
            this.modifiedLevel1B2ADataContext = this.assertHasDataContext(this.nodeObject.level1B2A);
        },
        "test: should maintain correct hierarchy of data contexts":function () {
            assertEquals(2, this.modifiedRootDataContext.getChildCount());
            assertArrayContains(this.modifiedRootDataContext.children_, this.modifiedLevel1ADataContext);
            assertSame(this.modifiedLevel1ADataContext.getParent(), this.modifiedRootDataContext);
            assertArrayContains(this.modifiedRootDataContext.children_, this.modifiedLevel1BDataContext);
            assertSame(this.modifiedLevel1BDataContext.getParent(), this.modifiedRootDataContext);

            assertEquals(1, this.modifiedLevel1ADataContext.getChildCount());
            assertArrayContains(this.modifiedLevel1ADataContext.children_, this.modifiedLevel1A2ADataContext);
            assertSame(this.modifiedLevel1A2ADataContext.getParent(), this.modifiedLevel1ADataContext);

            assertEquals(1, this.modifiedLevel1BDataContext.getChildCount());
            assertArrayContains(this.modifiedLevel1BDataContext.children_, this.modifiedLevel1B2ADataContext);
            assertSame(this.modifiedLevel1B2ADataContext.getParent(), this.modifiedLevel1BDataContext);
        },
        "test: should re-use existing data contexts for nodes":function () {
            assertSame(this.originalRootDataContext,       this.modifiedRootDataContext);
            assertSame(this.originalLevel1ADataContext,    this.modifiedLevel1ADataContext);
            assertSame(this.originalLevel1A2ADataContext,  this.modifiedLevel1A2ADataContext);
            assertSame(this.originalLevel1BDataContext,    this.modifiedLevel1BDataContext);
            assertSame(this.originalLevel1B2ADataContext,  this.modifiedLevel1B2ADataContext);
        }
    });

SetDataContextTestCase("If data context is injected between data-context bindings",
    {
        rootDataContext:null,
        level1ADataContext:null,
        level1A2ADataContext:null,
        level1BDataContext:null,
        level1B2ADataContext:null,
        injectDataContext:null,
        setUp:function () {
            this.scenarios()
                .withMultiNode()
                .withDataContext(this.nodeObject.root, this.nodeData1);


            this.scenarios()
                .withDataContext(this.nodeObject.inject, {level2:"injected"});

            this.rootDataContext = this.assertHasDataContext(this.nodeObject.root);
            this.injectDataContext = this.assertHasDataContext(this.nodeObject.inject);
            this.level1ADataContext = this.assertHasDataContext(this.nodeObject.level1A);
            this.level1A2ADataContext = this.assertHasDataContext(this.nodeObject.level1A2A);
            this.level1BDataContext = this.assertHasDataContext(this.nodeObject.level1B);
            this.level1B2ADataContext = this.assertHasDataContext(this.nodeObject.level1B2A);
        },
        "test: should re-arrange hierarchy of data contexts correctly":function () {
            assertEquals(2, this.rootDataContext.getChildCount());
            assertArrayContains(this.rootDataContext.children_, this.level1ADataContext);
            assertSame(this.level1ADataContext.getParent(), this.rootDataContext);
            assertArrayContains(this.rootDataContext.children_, this.level1BDataContext);
            assertSame(this.level1BDataContext.getParent(), this.rootDataContext);

            assertEquals(1, this.level1ADataContext.getChildCount());
            assertArrayContains(this.level1ADataContext.children_, this.injectDataContext);
            assertSame(this.injectDataContext.getParent(), this.level1ADataContext);

            assertEquals(1, this.injectDataContext.getChildCount());
            assertArrayContains(this.injectDataContext.children_, this.level1A2ADataContext);
            assertSame(this.level1A2ADataContext.getParent(), this.injectDataContext);

            assertEquals(1, this.level1BDataContext.getChildCount());
            assertArrayContains(this.level1BDataContext.children_, this.level1B2ADataContext);
            assertSame(this.level1B2ADataContext.getParent(), this.level1BDataContext);
        }
    });

SetDataContextTestCase("If data context is set on a node that has no data context and there are child bindings.",
    {
        setUp:function () {
            this.scenarios()
                .withBindings()
                .withDataContext(this.bindingsNodeObject.root, this.bindingsNodeData1);

            this.rootDataContext = this.assertHasDataContext(this.bindingsNodeObject.root);
            this.level1DataContext = this.assertHasDataContext(this.bindingsNodeObject.level1);
            this.level1Binding = this.assertHasSingleBinding(this.bindingsNodeObject.level1Binding);
            this.levelInjectBinding = this.assertHasSingleBinding(this.bindingsNodeObject.levelInjectBinding);
            this.level2DataContext = this.assertHasDataContext(this.bindingsNodeObject.level2);
            this.level2Binding = this.assertHasSingleBinding(this.bindingsNodeObject.level2Binding);
        },
        "test: should set correct data context on bindings" : function() {
            assertSame(this.level1DataContext, this.level1Binding.getDataContext());
            assertSame(this.level1DataContext, this.levelInjectBinding.getDataContext());
            assertSame(this.level2DataContext, this.level2Binding.getDataContext());
        },
        "test: should add bindings to correct data context" : function() {
            assertArrayContains(this.level1DataContext.subscribers_, this.level1Binding);
            assertArrayContains(this.level1DataContext.subscribers_, this.levelInjectBinding);
            assertArrayContains(this.level2DataContext.subscribers_, this.level2Binding);
        }
    });

SetDataContextTestCase("If data context is set on a node that already has a data context and there are child bindings.",
    {
        setUp:function () {
            this.scenarios()
                .withBindings()
                .withDataContext(this.bindingsNodeObject.root, this.bindingsNodeData1);

            this.originalRootDataContext = this.assertHasDataContext(this.bindingsNodeObject.root);
            this.originalLevel1DataContext = this.assertHasDataContext(this.bindingsNodeObject.level1);
            this.originalLevel1Binding = this.assertHasSingleBinding(this.bindingsNodeObject.level1Binding);
            this.originalLevelInjectBinding = this.assertHasSingleBinding(this.bindingsNodeObject.levelInjectBinding);
            this.originalLevel2DataContext = this.assertHasDataContext(this.bindingsNodeObject.level2);
            this.originalLevel2Binding = this.assertHasSingleBinding(this.bindingsNodeObject.level2Binding);

            this.scenarios()
                .withDataContext(this.bindingsNodeObject.root, this.bindingsNodeData2);

            this.modifiedRootDataContext = this.assertHasDataContext(this.bindingsNodeObject.root);
            this.modifiedLevel1DataContext = this.assertHasDataContext(this.bindingsNodeObject.level1);
            this.modifiedLevel1Binding = this.assertHasSingleBinding(this.bindingsNodeObject.level1Binding);
            this.modifiedLevelInjectBinding = this.assertHasSingleBinding(this.bindingsNodeObject.levelInjectBinding);
            this.modifiedLevel2DataContext = this.assertHasDataContext(this.bindingsNodeObject.level2);
            this.modifiedLevel2Binding = this.assertHasSingleBinding(this.bindingsNodeObject.level2Binding);
        },
        "test: should re-use data-contexts" : function() {
            assertSame(this.originalRootDataContext, this.modifiedRootDataContext);
            assertSame(this.originalLevel1DataContext, this.modifiedLevel1DataContext);
            assertSame(this.originalLevel2DataContext, this.modifiedLevel2DataContext);
        },
        "test: should re-use bindings" : function() {
            assertSame(this.originalLevel1Binding, this.modifiedLevel1Binding);
            assertSame(this.originalLevel2Binding, this.modifiedLevel2Binding);
            assertSame(this.originalLevelInjectBinding, this.modifiedLevelInjectBinding);
        }
    });

SetDataContextTestCase("If explicit data context injected between data-context bindings and there are child bindings.",
    {
        setUp:function () {
            this.scenarios()
                .withBindings()
                .withDataContext(this.bindingsNodeObject.root, this.bindingsNodeData1);

            this.originalRootDataContext = this.assertHasDataContext(this.bindingsNodeObject.root);
            this.originalLevel1DataContext = this.assertHasDataContext(this.bindingsNodeObject.level1);
            this.originalLevel1Binding = this.assertHasSingleBinding(this.bindingsNodeObject.level1Binding);
            this.orginalInjectBinding = this.assertHasSingleBinding(this.bindingsNodeObject.levelInjectBinding);
            this.originalLevel2DataContext = this.assertHasDataContext(this.bindingsNodeObject.level2);
            this.originalLevel2Binding = this.assertHasSingleBinding(this.bindingsNodeObject.level2Binding);

            this.scenarios()
                .withDataContext(this.bindingsNodeObject.levelInject, this.bindingsNodeData2.level1);

            this.modifiedRootDataContext = this.assertHasDataContext(this.bindingsNodeObject.root);
            this.modifiedLevel1DataContext = this.assertHasDataContext(this.bindingsNodeObject.level1);
            this.modifiedLevel1Binding = this.assertHasSingleBinding(this.bindingsNodeObject.level1Binding);
            this.modifiedInjectBinding = this.assertHasSingleBinding(this.bindingsNodeObject.levelInjectBinding);
            this.modifiedLevel2DataContext = this.assertHasDataContext(this.bindingsNodeObject.level2);
            this.modifiedLevel2Binding = this.assertHasSingleBinding(this.bindingsNodeObject.level2Binding);
        },
        "test: should re-use data-contexts" : function() {
            assertSame(this.originalRootDataContext, this.modifiedRootDataContext);
            assertSame(this.originalLevel1DataContext, this.modifiedLevel1DataContext);
            assertSame(this.originalLevel2DataContext, this.modifiedLevel2DataContext);
        },
        "test: should re-use bindings" : function() {
            assertSame(this.originalLevel1Binding, this.modifiedLevel1Binding);
            assertSame(this.originalLevel2Binding, this.modifiedLevel2Binding);
        }
    });