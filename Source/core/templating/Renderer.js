photon.templating.Renderer = function (referenceElement, renderTarget, template) {
    this.referenceElement_ = referenceElement;
    this.renderTarget_ = renderTarget;
    this.template_ = template;
};

photon.defineType(photon.templating.Renderer,
    /**
     * @lends photon.templating.Renderer.prototype
     */
    {
        dispose:function () {
            this.referenceElement_ = this.data_ = this.template_ = undefined;
        },
        /**
         * Gets the reference element
         * @return {*}
         */
        getReferenceElement:function () {
            return this.referenceElement_;
        },
        /**
         * Sets the renderer data
         * @param {Object} value
         * @param {Boolean} [refresh] A value indicating whether a refresh should be performed even if the data has not changed.
         */
        setData:function (value, refresh) {
            if (this.data_ !== value) {
                this.data_ = value;
                this.onDataChanged();
            } else if (refresh) {
                this.refresh();
            }
        },
        /**
         * Gets the renderer data
         * @return {*}
         */
        getData:function () {
            return this.data_;
        },
        /**
         * Called when the renderer data has changed
         * @protected
         */
        onDataChanged:function () {
            this.refresh();
        },
        /**
         * Refreshes the rendered view
         * @public
         */
        refresh:function () {
        }
    });
