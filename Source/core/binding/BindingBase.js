photon.defineType(
    photon.binding.BindingBase = function (target, expression) {
        this.target_ = target;
        this.expression_ = expression;
        this.templateParent_ = photon.controlScope ? photon.controlScope[0] : undefined;
    },
    /**
     * @lends photon.binding.BindingBase.prototype
     */
    {
        dispose : function() {
            this.target_ = null;
            this.setDataContext(null);
        },
        getTarget:function () {
            return this.target_;
        },
        beginInitialize:function() {
            this.isInitializing_ = true;
        },
        endInitialize:function() {
            this.isInitializing_ = false;
        },
        /**
         *
         * @return {photon.binding.BindingExpression}
         */
        getExpression:function () {
            return this.expression_;
        },
        getDataContext:function () {
            return this.dataContext_;
        },
        getDataSource:function () {
            return this.dataSource_;
        },
        setDataContext:function (value) {
            var oldValue = this.dataContext_;
            if (oldValue !== value) {
                // remove from previous data context
                if (oldValue) {
                    oldValue.removeSubscriber(this);
                }

                // add to new data context
                if (value) {
                    value.addSubscriber(this);
                }

                // assign
                this.dataContext_ = value;

                // notify
                this.dataContextChanged();
            }
        },
        dataContextValueChanged:function (dataContext, value) {
            this.updateDataSource();
        },
        dataContextChanged:function () {
            this.updateDataSource();
        },
        updateDataContext:function () {
            // condition is hack to support detached dom's (why oh why did I not write a test case?)
            if (this.target_.parentNode) {
                this.setDataContext(
                    photon.binding.DataContext.getForElement(this.getTarget()));
            }
        },
        updateDataSource:function () {
            // if the data context is null then the binding is either not initialized, or disposed.
            if (this.dataContext_ === null) {
                return;
            }

            var newValue = this.dataContext_.getValue();
            if (newValue !== this.dataSource_) {
                this.dataSource_ = newValue;
                this.dataSourceChanged();
            }
        },
        dataSourceChanged:function () {
            /* for descendants */
        }
    });


