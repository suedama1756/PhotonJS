photon.defineType(
    photon.binding.BindingBase = function (target, expression) {
        this.target_ = target;
        this.expression_ = expression;
    },
    /**
     * @lends photon.binding.BindingBase.prototype
     */
    {
        getTarget:function () {
            return this.target_;
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
            var newValue = null;
            if (this.dataContext_) {
                newValue = this.dataContext_.getValue();
            }
            if (newValue !== this.dataSource_) {
                this.dataSource_ = newValue;
                this.dataSourceChanged();
            }
        },
        dataSourceChanged:function () {
            /* for descendants */
        }
    });


