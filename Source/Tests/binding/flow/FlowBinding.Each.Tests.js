function setupMutatorTest(arrayMutator, nodeMutator, initialData) {
    return {
        requiredHtmlResources:"eachChild",
        becauseOf:function () {
            this.initialData_ = initialData || this.defaultInitialData;
            this.bind(this.initialData_);
            this.itemNodes_ = this.extractItemNodes();
            this.rebind(this.initialData_, arrayMutator);
        },
        "Should clean unused nodes" : function() {
            var currentNodes = this.extractItemNodes();

            var nodesToClean = photon.array.filter(this.itemNodes_, function(node) {
                return photon.array.indexOf(currentNodes, node) === -1;
            }, this);

            if (this.itemNodes_.length > currentNodes.length) {
                assertEquals(nodesToClean.length, this.itemNodes_.length - currentNodes.length);
            }

            photon.array.forEach(nodesToClean, function(node) {
                assertNull(photon.binding
                    .NodeBindingInfo.getForElement(node));
                assertNull(photon.binding
                    .DataContext.getLocalForElement(node));
            })
        },
        "Should render correct items":function () {
            assertEquals(this.dataContexts_[1],
                this.extractItemValues());
        },
        "Should re-use nodes":function () {
            var actual = this.extractItemNodes();

            // mutate current nodes
            var expected = this.itemNodes_.slice(0);
            (nodeMutator || arrayMutator).call(this, expected);

            // assert lengths
            assertEquals("Node array lengths differ", expected.length, actual.length);
            for (var i = 0, n = expected.length; i < n; i++) {
                assertSame(photon.string.format("Array differ at index {0}, expectedHTML:{1}, actualHTML:{2}", i, expected[i].innerHTML, actual[i].innerHTML), expected[i], actual[i]);
            }
        },
        "Should maintain correct data context hierarchy" : function() {
            var dataContexts = photon.array.map(this.extractItemNodes(),
                function(node) {
                    return photon.binding.DataContext.getForElement(node);
                });

            function getDataContextHierarchy(dataContext) {
                var result = [];
                while (dataContext) {
                    result.push(dataContext);
                    dataContext = dataContext.getParent();
                }
                return result;
            }

            photon.array.forEach(dataContexts, function(dataContext) {
                var hierarchy = getDataContextHierarchy(dataContext);
                assertEquals(2, hierarchy.length);

                // verify we haven't been cloned (this was happening!!, BUG)
                assertNotSame(hierarchy[0], hierarchy[1]);

                // verify we are parented correctly
                assertSame(photon.binding.DataContext.getForElement(
                    this.flowElement_), hierarchy[1]);

            }, this);
        }
    };
}

var itemsRendererTests = {
    "When binding for first time":{
        requiredHtmlResources:"eachChild",
        becauseOf:function () {
            this.bind(this.defaultInitialData);
        },
        "Should render correct items":function () {
            assertEquals([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], this.extractItemValues());
        }
    },
    "When an item is deleted from middle":setupMutatorTest(
        function (data) {
            data.splice(1, 1);
        }),
    "When multiple consecutive items are deleted from middle":setupMutatorTest(
        function (data) {
            data.splice(1, 2);
        }),
    "When an item is inserted at the start":setupMutatorTest(
        function (data) {
            data.shift(20);
        },
        function (nodes) {
            nodes.shift(this.extractItemNodeByValue(20));
        }),
    "When an item is inserted in the middle":setupMutatorTest(
        function (data) {
            data.splice(2, 0, 20);
        },
        function (nodes) {
            nodes.splice(2, 0, this.extractItemNodeByValue(20));
        }),
    "When an item is inserted at the end":setupMutatorTest(
        function (data) {
            data.push(20);
        },
        function (nodes) {
            nodes.push(this.extractItemNodeByValue(20));
        }),
    "When multiple consecutive items are inserted in the middle":setupMutatorTest(
        function (data) {
            data.splice(2, 0, 20, 21);
        },
        function (nodes) {
            nodes.splice(2, 0, this.extractItemNodeByValue(20),
                this.extractItemNodeByValue(21));
        }),
    "When an item is set in the middle":setupMutatorTest(
        function (data) {
            data[2] = 20;
        },
        function () {
        }),
    "When more items are replaced by less items":setupMutatorTest(
        function (data) {
            data.splice(2, 2, 20);
        },
        function (nodes) {
            nodes.splice(2, 2, nodes[3]); // should re-use 1 of the 2 deleted slots
        }),
    "When an item is set after a delete":setupMutatorTest(
        function (data) {
            data.splice(1, 1);
            data[3] = 21;
        },
        function (nodes) {
            nodes.splice(1, 1);
            nodes[3] = this.extractItemNodeByValue(21);
        }
    ),
    "When an item is deleted after an insert":setupMutatorTest(
        function (data) {
            data.push(20);
            data.splice(3, 1);
        },
        function (nodes) {
            var copy = nodes.slice(0);
            nodes.push(copy[3]);        // should re-use deleted
            nodes.splice(3, 1);
        }
    ),
    "When an item is inserted after a delete":setupMutatorTest(
        function (data) {
            data.splice(0, 2);
            data.splice(3, 0, 20);
        },
        function (nodes) {
            var copy = nodes.slice(0);
            nodes.splice(0, 2);
            nodes.splice(3, 0, copy[0]); // should re-use deleted
        }
    ),
    /**
     * BUG: this case showed up when testing with a random mutator
     */
    "When recycling nodes from the front onto the end":setupMutatorTest(
        function (data) {
            data.splice(0, 3, 0, 9, 6, 6);
        },
        function (nodes) {
            var originalNodes = nodes.slice(0);
            nodes[0] = originalNodes[1];
            nodes[1] = originalNodes[2];
            nodes[2] = originalNodes[0];
            nodes[3] = this.extractItemNodeByValue(6, 1)
        },
        [8, 0, 0]
    ),
    "When inserting after a set":setupMutatorTest(
        function (data) {
            data[2] = 20;
            data.push(21);
            data.push(22);
        },
        function (nodes) {
            nodes.push(this.extractItemNodeByValue(21));
            nodes.push(this.extractItemNodeByValue(22));
        }),
    "When less items are replaced by more items":setupMutatorTest(
        function (data) {
            data.splice(6, 2, 20, 21, 22, 23);
        },
        function (nodes) {
            nodes.splice(6, 2, nodes[6], nodes[7],
                this.extractItemNodeByValue(22), this.extractItemNodeByValue(23));
        }),
    "When an item is inserted after less items are replaced by more":setupMutatorTest(
        function (data) {
            data.splice(6, 2, 20, 21, 22, 23, 24);
            data.push(25);
            data.push(26);
        },
        function (nodes) {
            nodes.splice(6, 2, nodes[6], nodes[7],
                this.extractItemNodeByValue(22),
                this.extractItemNodeByValue(23),
                this.extractItemNodeByValue(24));
            nodes.push(
                this.extractItemNodeByValue(25),
                this.extractItemNodeByValue(26));
        }),
    "When multiple changes occur":setupMutatorTest(
        function (data) {
            data.splice(0, 0, 20);        // insert at front (should re-use 1 node
            data.splice(2, 2);            // delete
            data[5] = 21;                 // set
            data.splice(6, 3, 21, 22);    // set 2, delete 1
            data.push(23);                // push onto end
            data.push(24);
        },
        function (nodes) {
            var copy = nodes.slice(0);
            nodes.splice(0, 0, copy[1]);          // should re-use 1 of the 2 deleted slots
            nodes.splice(2, 2);
            nodes[5] = copy[6];                   // No 5, used to be 4 (I1, D2), taking into account the 2 items
            // deleted use 6 (easier to code than to explain!!)

            nodes.splice(6, 3, copy[7], copy[8]); // No 6, 7 used to be 7, 8 and represent 2 sets out of a (D3, I2)
            nodes.push(copy[9]);                  // push onto end
            nodes.push(copy[2]);                  // push onto end
        }),
    "When multiple consecutive items are set in the middle":setupMutatorTest(
        function (data) {
            data[2] = 20;
            data[3] = 21;
        },
        function () {
        }),
    "When benchmarking changes to large data set":{
        requiredHtmlResources:"eachChild",
        becauseOf:function () {
            var data = [];
            for (var i = 0; i < 1000; i++) {
                data[i] = i;
            }
            this.bindMs = timeCall(this.bind, this, [data]);
            data = data.slice(0);
            for (i = 0; i < 250; i++) {
                switch (this.randomInt(3)) {
                    case 0:
                        data.splice(this.randomInt(data.length), 0, this.randomInt(10000));
                        break;
                    case 1:
                        data.splice(this.randomInt(data.length), 1);
                        break;
                    case 2:
                        data[this.randomInt(data.length)] = this.randomInt(10000);
                        break;
                }
            }

            this.updateMs = timeCall(function() {
                photon.binding.DataContext.getForElement(this.flowElement_)
                    .setValue(data);
                this.dataContexts_.push(data);
            }, this);
        },
        "Should perform":function () {
            jstestdriver.console.log(this.bindMs);
            jstestdriver.console.log(this.updateMs);
        }
    }
}

var itemsRendererTestPrototype = {
    defaultInitialData:[1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    createSystemUnderTest:function () {
        this.flowElement_ = $("#flow")[0];
    },
    tearDown:function () {
        photon.dom.cleanNode(document);
    },
    bind:function (data) {
        this.dataContexts_ = this.dataContexts_ || [];
        this.dataContexts_.push(data);
        photon.binding.applyBindings(data)
    },
    rebind:function (data, mutator) {
        data = data.slice(0);
        mutator.call(this, data);
        photon.binding.DataContext.getForElement(this.flowElement_)
            .setValue(data);
        this.dataContexts_.push(data);
    },
    randomInt:function (max) {
        return Math.floor(Math.random() * max);
    },
    extractItemNodeByValue:function (value, occurance) {
        return $("span.item").filter(function () {
            return Number(this.innerText) === value;
        })[occurance || 0];
    },
    extractItemNodes:function () {
        return $("span.item").toArray();
    },
    extractItemValues:function () {
        return photon.array.map(this.extractItemNodes(), function (item) {
            return Number(item.innerText);
        });
    },
    htmlResources:{
        eachChild:function () {
            /*:DOC +=
             <div id="flow" data-flow="each:$data">
                <span class='item' data-bind='innerText:$data' ></span>
             </div>
             */
        }
    }
};

DefineTestSuite("FlowBinding.Each.Child",
    itemsRendererTests,
    photon.extend(
        itemsRendererTestPrototype,
        {
            renderTarget_:photon.templating.RenderTarget.Child
        }
    )
);

DefineTestSuite("FlowBinding.Each.NextSibling",
    photon.extend(itemsRendererTests,
        {
            "When there is a static next sibling" : {
                becauseOf : function() {
                    /*:DOC +=
                     <div id="flow" data-flow="each:$data, applyTo:NextSibling">
                     <span class='item' data-bind='innerText:$data' ></span>
                     </div>
                     <div id="nextSibling">
                     Some content
                     </div>
                     */

                    var items = [1, 2, 3];
                    photon.binding.applyBindings(items);
                },
                "Should render in the correct position" : function() {
                    var lastItem = $(".item")[2];
                    assertNotNullOrUndefined(
                        lastItem.nextSibling);
                    assertSame(lastItem.nextSibling,
                        $("#nextSibling")[0]);
                }
            }
        }),
    photon.extend(
        itemsRendererTestPrototype,
        {
            renderTarget_:photon.templating.RenderTarget.NextSibling
        }
    )
);