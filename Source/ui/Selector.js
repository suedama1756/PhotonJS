photon.defineType(
    photon.ui.Selector = function (target) {
        this.target_ = target;
        this.items_ = null;
        this.initializeCount_ = 0;
        this.evaluationDataContext_ = new photon.binding.DataContext();
    },
    /**
     * lends: photon.ui.Selector.prototype
     */
    {
        beginInitialize:function () {
            if (++this.initializeCount_ === 1) {
                this.initializeStore_ = {
                    selectedItem:this.getSelectedItem()

                };
            }
        },
        endInitialize:function () {
            if (!--this.initializeCount_) {
                var store = this.initializeStore_;
                this.initializeStore_ = null;
                this.update();
                this.setSelectedItem(store.selectedItem);
            }
        },
        getItem_:function (index) {
            var items = photon.observable.unwrap(this.items_);
            return items ? items[index] : undefined;
        },
        getInContext:function (dataContext, fn, data) {
            var evaluationDataContext = dataContext;
            if (!evaluationDataContext) {
                evaluationDataContext = this.evaluationDataContext_;
                evaluationDataContext.setParent(photon.binding.DataContext.getForElement(this.target_));
                evaluationDataContext.setSource(data);
            }
            try {
                return photon.binding.evaluateInContext(
                    evaluationDataContext, fn, null);
            }
            finally {
                if (!dataContext) {
                    evaluationDataContext.setParent(null);
                    evaluationDataContext.setSource(null);
                }
            }
        },
        getDisplay:function (item) {
            if (this.displayEvaluator_) {
                return this.getInContext(null, this.displayEvaluator_, item);
            }
            return item ? item.toString() : "";
        },
        getValue:function (item) {
            if (this.valueEvaluator_) {
                return this.getInContext(null, this.valueEvaluator_, item);
            }
            return item;
        },
        setValueEvaluator:function (value) {
            if (this.valueEvaluator_ === value) {
                return;
            }
            this.valueEvaluator_ = value;
        },
        getValueEvaluator:function () {
            return this.valueEvaluator_;
        },
        setDisplayEvaluator:function (value) {
            if (this.displayEvaluator_ === value) {
                return;
            }
            this.displayEvaluator_ = value;
            this.update();
        },
        getDisplayEvaluator:function () {
            return this.displayEvaluator_;
        },
        getTarget:function () {
            return this.target_;
        },
        getItems:function () {
            return this.items_;
        },
        setItems:function (value) {
            if (this.items_ === value) {
                return;
            }

            if (this.subscriber_) {
                this.subscriber_.dispose();
                delete this.subscriber_;
            }
            this.items_ = value;
            if (value && value.isObservable) {
                this.subscriber_ = value.subscribe(this.update, this);
            }

            this.update();
        },
        update:function () {
            if (this.initializeStore_) {
                return;
            }

            var target = this.target_;

            // must store before clearing the dom
            var currentSelectedItem = this.getSelectedItem();

            // clear current items
            while (target.firstChild) {
                target.removeChild(target.firstChild);
            }

            if (this.items_) {
                var items = photon.observable.unwrap(this.items_), text = [], i = 0;
                photon.array.forEach(items, function (item) {
                    text[i++] = "<option>";
                    text[i++] = this.getDisplay(item);
                    text[i++] = "</option>";
                }, this);

                $(text.join('')).appendTo(target);

                target.selectedIndex = this.findIndexByValue(currentSelectedItem);
            }
        },
        getSelectedItem:function () {
            if (this.initializeStore_) {
                return this.initializeStore_.selectedItem;
            }

            var index = this.target_.selectedIndex;
            if (index === -1) {
                return null;
            }

            var selectedItem = this.getItem_(index);
            return this.getValue(selectedItem);
        },
        setSelectedItem:function (value) {
            if (this.getSelectedItem() === value) {
                return;
            }

            if (this.initializeStore_) {
                this.initializeStore_.selectedItem = value;
            }
            else {
                this.getTarget().selectedIndex = this.findIndexByValue(value);
            }
        },
        findIndexByValue:function (value) {
            if (this.items_) {
                return photon.array.findIndex(photon.observable.unwrap(this.items_), function (item) {
                    return this.getValue(item) === value;
                }, this);
            }
            return -1;
        }
    });


photon.defineType(
    photon.ui.SelectorProperty = function (propertyName) {
        this.propertyName_ = propertyName;
    },
    photon.binding.data.Property,
    {
        getSelector : function(binding) {
            var data = photon.getOrCreateData(binding.getTarget());
            return data.control = data.control ||
                new photon.ui.Selector(binding.getTarget());
        },
        beginInitialize:function (binding) {
            var target = binding.getTarget();
            if (target.tagName !== "SELECT") {
                throw new Error("Expected selector");
            }

            this.getSelector(binding).beginInitialize();
        },
        endInitialize:function (binding) {
            this.getSelector(binding).endInitialize();
        },
        getValue:function (binding) {
            return this.getSelector(binding)["get" + this.propertyName_]();
        },
        setValue:function (binding) {
            this.getSelector(binding)["set" + this.propertyName_](binding.getSourceValue());
        }
    });

photon.defineType(
    photon.ui.SelectorItemsProperty = function () {
        photon.ui.SelectorItemsProperty.base(this, "Items");
    },
    photon.ui.SelectorProperty);

photon.defineType(
    photon.ui.SelectorSelectedItemProperty = function () {
        photon.ui.SelectorSelectedItemProperty.base(this, "SelectedItem");
    },
    photon.ui.SelectorProperty,
    /**
     * @lends: photon.binding.data.SelectorSelectedItemProperty.prototype
     */
    {
        getDefaultBindingMode:function () {
            return photon.binding.data.DataBindingMode.TwoWay;
        },
        bindUpdateSourceTriggers:function (binding) {
            binding.bindUpdateSourceEvent("change");
        }
    }
);

photon.defineType(
    photon.ui.SelectorDisplayProperty = function () {
        photon.ui.SelectorDisplayProperty.base("DisplayEvaluator");
    },
    photon.ui.SelectorProperty,
    {
        setValue:function (binding) {
            var evaluator = binding.getSourceValue();
            var expression = photon.binding.BindingContext.getInstance().parseBindingExpressions(
                "data-bind", "null:" + evaluator)[0];
            this.getSelector(binding).setDisplayEvaluator(expression.getGetter());
        }
    }
);

photon.defineType(
    photon.ui.SelectorValueProperty = function () {
        photon.ui.SelectorValueProperty.base("ValueEvaluator");
    },
    photon.ui.SelectorProperty,
    {
        setValue:function (binding) {
            var evaluator = binding.getSourceValue();
            var expression = photon.binding.BindingContext.getInstance().parseBindingExpressions("data-bind",
                "null:" + evaluator)[0];
            this.getSelector(binding).setValueEvaluator(expression.getGetter());

        }
    }
);

photon.binding.data.properties["select.selectedItem"] = new photon.ui.SelectorSelectedItemProperty();
photon.binding.data.properties["select.items"] = new photon.ui.SelectorItemsProperty();
photon.binding.data.properties["select.value"] = new photon.ui.SelectorValueProperty();
photon.binding.data.properties["select.display"] = new photon.ui.SelectorDisplayProperty();