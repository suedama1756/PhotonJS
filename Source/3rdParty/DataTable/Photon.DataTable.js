photon.dataTable = photon.dataTable || {};

photon.dataTable.create = function (container, options) {
    var $container = $(container);

    var bindingContext = new photon.binding.BindingContext.getInstance();

    // ensure we have registered a row binding callback
    var originalRowCallback = options.fnRowCallback;
    options.fnRowCallback = function (nRow, aData, iDisplayIndex) {
        if (originalRowCallback) {
            originalRowCallback(nRow, aData, iDisplayIndex);
        }

        photon.binding.applyBindings(aData, nRow,
            photon.binding.DataContext.getForElement($container[0]));

        $(nRow).bind('click', {
            container:$container,
            row:nRow,
            rowData:aData
        }, function (event) {
            var data = event.data;

            // notify the
            var nodeBindingInfo = photon.binding.NodeBindingInfo.getForElement(container);
            if (nodeBindingInfo) {
                var binding = nodeBindingInfo.findBinding(function (binding) {
                    return binding.getExpression().getPropertyHandler() instanceof photon.dataTable.SelectedItemProperty;
                });

                if (binding) {
                    if (binding.selectedRowElement) {
                        $(binding.selectedRowElement).toggleClass('selected');
                        delete binding.selectedRowElement;
                    }

                    $(data.row).toggleClass('selected');

                    binding.selectedRowElement = data.row;
                    binding.selectedItem_ = data.rowData;
                    binding.updateSource();
                }
            }
        });


        $(nRow).bind('dblclick', {
            container:$container,
            row:nRow,
            rowData:aData
        }, function (event) {
            var data = event.data;

            var nodeBindingInfo = photon.binding.NodeBindingInfo.getForElement($(data.container)[0]);
            var optionsBinding = nodeBindingInfo.findBinding(function (binding) {
                return binding.getExpression().getPropertyHandler() instanceof photon.dataTable.OptionsProperty;
            });

            if(optionsBinding && optionsBinding.options_){
                var options = optionsBinding.options_;
                if(options.fnRowDoubleClickCallback){
                    options.fnRowDoubleClickCallback(data.rowData);
                }
            }
        });

    };

    if (options.aoColumns) {
        var dataContext = new photon.binding.DataContext();
        photon.array.forEach(options.aoColumns, function (column) {
            if (column.bindingTemplate) {
                if (!column.binding) {
                    column.bindingExpression = photon.templating.getPrimaryDataBindingExpressionFromHtml(
                        column.bindingTemplate);
                }
            }
            if (column.binding) {
                if (!column.bindingExpression) {
                    column.bindingExpression = bindingContext.parseBindingExpressions("data-bind", "null:" + column.binding)[0];
                }
            }

            if (column.binding || column.bindingTemplate) {
                column.mDataProp = function (obj, type, value) {
                    switch (type) {
                        case "display":
                            return column.bindingTemplate ?
                                column.bindingTemplate :
                                column.bindingExpression.getGetter()(obj);
                        case "set":
                            column.bindingExpression.getSetter()(obj, value);
                            break;
                        default:
                            return column.bindingExpression ? column.bindingExpression.getGetter()(obj) : null;
                    }
                };
            }
        });
    }

    var result = $container.dataTable(options);

    // remove copies of data-bind attribute that get cloned all over the place!!!
    $(".dataTable[data-bind]").filter(
        function (i, x) {
            return x !== $container[0];
        }).removeAttr("data-bind");

    // return
    return result;
};

photon.defineType(photon.dataTable.DataProperty = function () {

},
    photon.binding.data.Property,
    {
        dataChanged:function (event) {
            this.updateData($(event.data.getTarget()).dataTable(), event.data.getSourceValue());
        },
        updateData:function (dataTable, data) {
            data = photon.observable.unwrap(data);
            if (dataTable) {
                dataTable.fnClearTable();
                dataTable.fnAddData(data);
            }
        },
        getValue:function (binding) {
            return binding.data_;
        },
        setValue:function (binding) {
            if (!binding.isInitialized) {
                binding.isInitialized = true;
                var target = binding.getTarget(), dataTable = $(target).dataTable();
                var newValue = binding.getSourceValue();
                var oldValue = binding.data_;
                if (newValue !== oldValue) {
                    if (binding.dataSubscriber_) {
                        binding.dataSubscriber_.dispose();
                        delete binding.dataSubscriber_;
                    }
                    binding.data_ = newValue;
                    if (newValue && newValue.subscribe) {
                        binding.dataSubscriber_ = newValue.subscribe(this.dataChanged, this, binding);
                    }
                    this.updateData(dataTable, newValue);
                }
            }

        }
    });

photon.defineType(photon.dataTable.OptionsProperty = function () {
},
    photon.binding.data.Property,
    {
        getValue:function (binding) {
            return binding.options_;
        },
        setValue:function (binding) {
            if (binding.options_) {
                return;
            }
            binding.options_ = binding.getSourceValue();
            photon.dataTable.create(binding.getTarget(), binding.options_);
        }
    });

photon.defineType(photon.dataTable.SelectedItemProperty = function () {
},
    photon.binding.data.Property,
    {
        getValue:function (binding) {
            return binding.selectedItem_;
        },
        setValue:function (binding) {
            binding.selectedItem_ = binding.getSourceValue();
        }
    }
);

photon.defineType(photon.dataTable.HiddenColumnsProperty = function () {
},
    photon.binding.data.Property,
    {
        getDefaultBindingMode:function () {
            return photon.binding.data.DataBindingMode.OneWay;
        },
        getValue:function (binding) {
            return binding.hiddenColumns;
        },
        setValue:function (binding) {
            if (!binding.isInitialized) {
                binding.isInitialized = true;
                var target = binding.getTarget(), dataTable = $(target).dataTable();
                var newValue = binding.getSourceValue();
                var oldValue = binding.data_;
                if (newValue !== oldValue) {
                    if (binding.dataSubscriber_) {
                        binding.dataSubscriber_.dispose();
                        delete binding.dataSubscriber_;
                    }
                    binding.data_ = newValue;
                    if (newValue && newValue.subscribe) {
                        binding.dataSubscriber_ = newValue.subscribe(this.dataChanged, this, binding);
                    }
                    this.updateData(dataTable, newValue);
                }
            }
        },
        dataChanged:function (event) {
            this.updateData($(event.data.getTarget()).dataTable(), event.data.getSourceValue());
        },
        updateData:function (dataTable, data) {
            var hiddenColumns = photon.observable.unwrap(data);
            if (dataTable) {
                var columns = dataTable.fnSettings().aoColumns;
                var aoColumnMap = {};

                var isMatchingColumn = function (c) {
                    return c === this.sName;
                };

                for (var i = 0, n = columns.length; i < n; i++) {
                    var column = columns[i];
                    aoColumnMap[column.sName] = {column:column, index:i};
                    var index = photon.array.findIndex(hiddenColumns, isMatchingColumn, column);
                    if (index < 0) {
                        dataTable.fnSetColumnVis(i, true);
                    }
                }

                for (var j = 0, m = hiddenColumns.length; j < m; j++) {
                    var hiddenColumn = hiddenColumns[j];
                    if (aoColumnMap.hasOwnProperty(hiddenColumn)) {
                        dataTable.fnSetColumnVis(aoColumnMap[hiddenColumn].index, false);
                    }
                }
            }
        }
    }
);

photon.binding.data.properties["dataTable.data"] = new photon.dataTable.DataProperty();
photon.binding.data.properties["dataTable.options"] = new photon.dataTable.OptionsProperty();
photon.binding.data.properties["dataTable.selectedItem"] = new photon.dataTable.SelectedItemProperty();
photon.binding.data.properties["dataTable.hiddenColumns"] = new photon.dataTable.HiddenColumnsProperty();
