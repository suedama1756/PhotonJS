/**
 * Stores binding information relating to a node
 * @class
 */
photon.binding.NodeBindingInfo = function () {
};

photon.defineType(
    photon.binding.NodeBindingInfo,
    /**
     * @lends photon.binding.NodeBindingInfo.prototype
     */
    {
        dispose : function() {
            if (this.dataContext_) {
                this.dataContext_.dispose();
                this.dataContext = null;
            }
            if (this.bindings_) {
                // TODO: for now the NodeBindingInfo class is the only thing that disposes of bindings, if that changes this will NOT work.
                photon.array.forEach(this.bindings_, function(binding) {
                    binding.dispose();
                });
                this.bindings_ = null;
            }
        },
        getBindingCount:function () {
            return this.bindings_ ? this.bindings_.length : 0;
        },
        getBinding:function (index) {
            return this.bindings_ ? this.bindings_[index] : null;
        },
        /**
         *
         * @param fn
         * @param obj
         * @return {photon.Binding.BindingBase}
         */
        findBinding : function(fn, obj) {
            return this.bindings_ ? photon.array.find(this.bindings_, fn, obj) : null;
        },
        addBinding:function (binding) {
            if (this.bindings_) {
                this.bindings_.push(binding);
            }
            else {
                this.bindings_ = [binding];
            }
        },
        getBindingByExpression:function (expression) {
            var expressionText = expression;
            if (!photon.isString(expression)) {
                expressionText = expression.getText();
            }

            return this.bindings_ ?
                photon.array.find(this.bindings_, function (item) {
                    return expressionText === item.getExpression().getText();
                }) :
                null;
        },
        /**
         *
         * @return {photon.binding.DataContext}
         */
        getDataContext:function () {
            return this.dataContext_;
        },
        /**
         *
         * @return {photon.binding.DataContext}
         */
        getOrCreateDataContext:function (dataContext) {
            return this.dataContext_ ? this.dataContext_ : (this.dataContext_ = dataContext || new photon.binding.DataContext());
        }
    },
    /* static members */
    {
        /**
         * Gets the NodeBindingInfo instance associated with the node.
         * @param {Node} element
         * @returns {photon.binding.NodeBindingInfo}
         */
        getForElement:function (element) {
            var data = photon.getData(element);
            return data ? data.nodeBindingInfo : null;
        },
        getOrCreateForElement:function (element) {
            var data = photon.getOrCreateData(element);
            if (data.nodeBindingInfo) {
                return data.nodeBindingInfo;
            }
            data.nodeBindingInfo = new photon.binding.NodeBindingInfo();
            // TODO: hacky
            (data.disposables = data.disposables || []).push(data.nodeBindingInfo);
            return data.nodeBindingInfo;
        }
    });
