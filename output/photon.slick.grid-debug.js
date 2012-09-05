(function(document){
    (function(factory) {
        if (typeof define === 'function' && define.amd) {
            define(['exports', 'photon', 'jquery', 'slick.core', 'slick.grid'], factory);
        } else if (window) {
            var nsi = 'photon.slickGrid'.split('.'), ns = window;
            for (var i= 0, n=nsi.length; i<n; i++) {
                ns = ns[nsi[i]] = ns[nsi[i]] || {};
            }
            factory(ns, window.photon, window.jQuery);
        }
    })(function(slickGrid, photon, $) {
        photon.slickGrid = photon.slickGrid || {};
        
        photon.slickGrid.create = function (container, data, columns, options) {
            return (new photon.slickGrid.Control(container, data, columns, options)).grid_;
        };
        
        photon.slickGrid.dataItemColumnValueExtractor = function (item, column) {
            return column.bindingExpression ? column.bindingExpression.getGetter()(item) : item[column.field];
        };
        
        photon.slickGrid.defaultEditor = function (args) {
            var $input;
            var defaultValue;
        
            this.init = function () {
                $input = $("<input type=text class='editor-text' />");
        
                $input.bind("keydown.nav", function (e) {
                    if (e.keyCode === $.ui.keyCode.LEFT || e.keyCode === $.ui.keyCode.RIGHT) {
                        e.stopImmediatePropagation();
                    }
                });
        
                $input.appendTo(args.container);
                $input.focus().select();
            };
        
            this.destroy = function () {
                $input.remove();
            };
        
            this.focus = function () {
                $input.focus();
            };
        
            this.loadValue = function (item) {
                defaultValue = args.column.bindingExpression.getGetter()(item);
                $input.val(defaultValue);
                $input[0].defaultValue = defaultValue;
                $input.select();
            };
        
            this.serializeValue = function () {
                return $input.val();
            };
        
            this.applyValue = function (item, state) {
                args.column.bindingExpression.getSetter()(item, state);
            };
        
            this.isValueChanged = function () {
                return (!($input.val() === "" && defaultValue === null)) && ($input.val() !== defaultValue);
            };
        
            this.validate = function () {
                return {valid:true};
            };
        
            this.init();
        };
        
        photon.slickGrid.defaultMultiColumnSort = function (e, args) {
            var cols = args.sortCols;
            var extractor = args.grid.getOptions().dataItemColumnValueExtractor;
            if (!extractor) {
                extractor = function (item, column) {
                    return item[column.field];
                };
            }
        
            args.grid.getData().sort(function (dataRow1, dataRow2) {
                for (var i = 0, l = cols.length; i < l; i++) {
                    var sign = cols[i].sortAsc ? 1 : -1;
                    var value1 = extractor(dataRow1, cols[i].sortCol);
                    var value2 = extractor(dataRow2, cols[i].sortCol);
                    var result = (value1 === value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
                    if (result !== 0) {
                        return result;
                    }
                }
                return 0;
            });
            args.grid.invalidate();
            args.grid.render();
        };
        
        photon.slickGrid.ItemsProperty = function () {
        };
        
        photon.defineType(
            photon.slickGrid.ItemsProperty,
            photon.binding.data.Property,
            {
                getValue:function (binding) {
                    var slickGrid = binding.getTarget().slickGrid;
                    return slickGrid ? slickGrid.getData() : null;
                },
                setValue:function (binding) {
                    var slickGrid = binding.getTarget().slickGrid;
                    if (!slickGrid) {
                        return;
                    }
                    var newValue = binding.getSourceValue(),
                        oldData = slickGrid.getData(),
                        newData = photon.observable.unwrap(newValue);
        
                    if (oldData !== newData) {
                        if (binding.subscriber_) {
                            binding.subscriber_.dispose();
                            binding.subscriber = null;
                        }
        
                        if (newValue && newValue.subscribe) {
                            binding.subscriber_ = newValue.subscribe(function () {
                                this.onItemsChanged_(binding);
                            }, this);
                        }
        
                        setTimeout(function () {
                            slickGrid.setData(newData);
                            slickGrid.render();
                        }, 0);
        
                    }
                },
                onItemsChanged_:function (binding) {
                    var slickGrid = binding.getTarget().slickGrid;
                    if (slickGrid) {
                        var newData = photon.observable.unwrap(binding.getSourceValue());
                        if (slickGrid.getData() !== newData) {
                            slickGrid.setData(newData || []);
                        }
                        slickGrid.invalidate();
                    }
                }
            });
        
        photon.slickGrid.SelectedItemProperty = function () {
        };
        
        photon.defineType(
            photon.slickGrid.SelectedItemProperty,
            photon.binding.data.Property, {
                getDefaultBindingMode:function () {
                    return photon.binding.data.DataBindingMode.TwoWay;
                },
                bindUpdateSourceTriggers:function () {
        
                },
                ensureInitialized_:function (binding) {
                    if (!binding.isInit_) {
                        binding.isInit_ = true;
                        var slickGrid = binding.getTarget().slickGrid;
                        if (!slickGrid.getSelectionModel()) {
                            slickGrid.setSelectionModel(new Slick.RowSelectionModel());
                        }
        
                        slickGrid.onSelectedRowsChanged.subscribe(function () {
                            binding.updateSource();
                        });
                    }
                },
                getValue:function (binding) {
                    this.ensureInitialized_(binding);
                    var slickGrid = binding.getTarget().slickGrid, rows = slickGrid.getSelectedRows();
                    return rows.length > 0 ? slickGrid.getDataItem(rows[0]) : null;
                },
                setValue:function (binding) {
                    this.ensureInitialized_(binding);
                    var slickGrid = binding.getTarget().slickGrid;
                    var value = binding.getSourceValue();
                    if (value === null) {
                        slickGrid.setSelectedRows([]);
                    }
                    else {
                        for (var i = 0, n = slickGrid.getDataLength(); i < n; i++) {
                            var item = slickGrid.getDataItem(i);
                            if (item === value) {
                                slickGrid.setSelectedRows([i]);
                            }
                        }
                    }
                }
            });
        
        
        photon.binding.data.properties["slick.items"] = new photon.slickGrid.ItemsProperty();
        photon.binding.data.properties["slick.selectedItem"] = new photon.slickGrid.SelectedItemProperty();
        
        photon.slickGrid.Control = function (container, data, columns, options) {
            var bindingContext = photon.binding.BindingContext.getInstance(), self = this;
            for (var i = 0; i < columns.length; i++) {
                var column = columns[i];
        
                if (column.binding) {
                    // setup default editor if no other formatter has been explicitly set
                    if (column.editable && !column.editor) {
                        column.editor = photon.slickGrid.defaultEditor;
                    }
        
                    options.dataItemColumnValueExtractor = options.dataItemColumnValueExtractor ||
                        photon.slickGrid.dataItemColumnValueExtractor;
        
                    if (!column.bindingExpression) {
                        column.bindingExpression = bindingContext.parseBindingExpressions("data-bind", "null:" + column.binding)[0];
                    }
                }
        
                if (column.bindingTemplate) {
                    // setup default formatter if no other formatter has been explicitly set
                    if (!column.formatter) {
                        column.formatter = this.createTemplateFormatter_(options.enableAsyncPostRender);
                    }
        
                    if (!column.binding && !column.bindingExpression) {
                        column.bindingExpression = photon.templating.getPrimaryDataBindingExpressionFromHtml(
                            column.bindingTemplate);
                    }
        
                    if (options.enableAsyncPostRender) {
                        var originalAsyncPostRender = column.asyncPostRender;
                        column.asyncPostRender = function (node, row, data, column) {
                            self.postRender_(node, row, data, column);
                            if (originalAsyncPostRender) {
                                originalAsyncPostRender(node, row, data, column);
                            }
                        }
                    }
        
                }
            }
        
            this.nodeCleaner_ = new photon.dom.NodeGarbageCollector();
        
            this.grid_ = $(container)[0].slickGrid = new Slick.Grid(container, data, columns, options);
        };
        
        photon.defineType(photon.slickGrid.Control,
            {
                postRender_:function (node, row, data, column) {
                    photon.binding.applyBindings(data, node);
                    this.nodeCleaner_.monitor(node);
                    this.nodeCleaner_.postCollect();
                },
                createTemplateFormatter_:function (usePostRender) {
                    var self = this;
                    if (usePostRender) {
                        return function (row, cell, value, column) {
                            return column.bindingTemplate;
                        }
                    }
                    return function (row, cell, value, column) {
                        var result = column.bindingTemplate;
                        self.enqueueBinding_({
                            row:row,
                            cell:cell
                        });
                        return result;
                    };
                },
                applyBindings_:function () {
                    var bindings = this.pendingBindings_, grid = this.grid_;
                    this.pendingBindings_ = null;
                    for (var i = 0, n = bindings.length; i < n; i++) {
                        var binding = bindings[i];
                        var node = grid.getCellNode(binding.row, binding.cell);
                        if (node) {
                            photon.binding.applyBindings(grid.getDataItem(binding.row), node);
                            this.nodeCleaner_.monitor(node);
                            this.nodeCleaner_.postCollect();
                        }
                    }
                },
                enqueueBinding_:function (cell) {
                    if (this.pendingBindings_) {
                        this.pendingBindings_.push(cell);
                    }
                    else {
                        this.pendingBindings_ = [cell];
                        var self = this;
                        setTimeout(function () {
                            self.applyBindings_();
                        }, 0);
                    }
                }
            });
        
        
        photon.dom.NodeGarbageCollector = function () {
            this.nodes_ = [];
        };
        
        photon.defineType(
            photon.dom.NodeGarbageCollector,
            {
                monitor:function (node) {
                    if (photon.array.indexOf(this.nodes_, node) === -1) {
                        this.nodes_.push(node);
                    }
                },
                postCollect:function () {
                    if (this.collectPending_) {
                        return;
                    }
                    this.collectPending_ = true;
        
                    var self = this;
                    setTimeout(function () {
                        try {
                            self.collect();
                        }
                        finally {
                            self.collectPending_ = false;
                        }
                    }, 0);
                },
                collect:function () {
                    var nodesIn = this.nodes_, nodesOut = [], nodesOutIndex = 0;
                    for (var i = 0, n = nodesIn.length; i < n; i++) {
                        var node = nodesIn[i];
                        if (!document.body.contains(node)) {
                            photon.dom.cleanNode(node);
                        } else {
                            nodesOut[nodesOutIndex++] = node;
                        }
                    }
                    this.nodes_ = nodesOut;
                }
            });
    });
})(document);
//@ sourceMappingURL=photon.slick.grid-debug.js.map