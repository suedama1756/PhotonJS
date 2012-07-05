/**
 * Pools nodes for rendering
 *
 * @private
 * @param {photon.templating.Template} template
 * @constructor
 */
var TemplatePool = function (template) {
    this.pool_ = [];
    this.poolIndex_ = 0;
    this.template_ = template;
};

photon.defineType(TemplatePool,
    /**
     * @lends TemplatePool.prototype
     */
    {
        addToPool:function (templateNodes) {
            this.pool_.push(templateNodes);

            // remove from from (if attached)
            photon.array.forEach(templateNodes,
                photon.dom.remove);
        },
        /**
         * Gets a template from the pool
         * @return {*}
         */
        getFragment:function () {
            if (this.poolIndex_ < this.pool_.length) {
                // grab node(s) from pool
                var result = this.pool_[this.poolIndex_++];

                // if single node then return
                if (result.length === 1) {
                    return result[0];
                }

                // otherwise add to fragment
                var fragment = document.createDocumentFragment();
                for (var i = 0, n = result.length; i < n; i++) {
                    fragment.appendChild(result[i]);
                }
                return fragment;
            }
            return this.template_.getFragment();
        },
        dispose:function () {
            for (var i = this.poolIndex_, n = this.pool_.length; i < n; i++) {
                photon.dom.cleanNodes(this.pool_[i]);
            }
            this.pool_ = this.poolIndex_ = undefined;
        }
    });
