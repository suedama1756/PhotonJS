photon.templating.ItemsRenderer = function (referenceElement, renderTarget, template) {
    photon.templating.ItemsRenderer.base(this, referenceElement, renderTarget, template);
};

photon.defineType(
    photon.templating.ItemsRenderer,
    photon.templating.Renderer,
    /**
     * @lends photon.templating.ItemsRenderer.prototype
     */
    {
        dispose:function () {
            this.subscribe_(null);
            this.superType.dispose.call(this);

            /*  Clear node references, there should be no need to clean the nodes as
                they will be cleaned during dom cleanup. */
            this.renderedNodes_ = null;
        },
        /**
         * Refreshes the rendered view
         */
        refresh:function () {
            if (this.data_) {
                var data = this.data_;
                this.subscribe_(data);
                data = photon.observable.unwrap(data) || [];
                this.render_(this.itemsCopy_ || [], data);
                this.itemsCopy_ = data.slice(0);
            }
        },
        /**
         * @param items
         * @private
         */
        subscribe_:function (items) {
            var subscriber = this.subscriber_;
            if (subscriber && subscriber.getOwner() !== items) {
                subscriber.dispose();
                this.subscriber_ = subscriber = null;
            }

            if (!subscriber && items && items.subscribe) {
                this.subscriber_ = items.subscribe(this.refresh, this);
            }
        },
        /**
         * @param {Array} oldItems
         * @param {Array} newItems
         * @private
         */
        render_:function (oldItems, newItems) {
            this.renderedNodes_ = this.renderedNodes_ || [];

            var diffs = photon.array.diff(oldItems, newItems),
                diff,
                startA,
                referenceElement = this.referenceElement_,
                nodeSets = this.renderedNodes_,
                nodeSet,
                offset = 0,
                defaultReferenceNode = null,
                templatePool = new TemplatePool(this.template_),
                parentNode = this.renderTarget_ === photon.templating.RenderTarget.Child ?
                    referenceElement :
                    referenceElement.parentNode,
                dataContext = photon.binding.DataContext.getForElement(referenceElement);

            // process set/delete
            for (var diffIndex = 0, diffLength = diffs.length; diffIndex < diffLength; diffIndex++) {
                // get current diff
                diff = diffs[diffIndex];

                // get the number of items that could be set (rather than delete/insert)
                var setLength = Math.min(diff.deletedA, diff.insertedB);

                // extract deletions into pool
                startA = diff.startA - offset;
                for (var delIndex = startA, delEnd = startA + diff.deletedA - setLength; delIndex < delEnd; delIndex++, offset++) {
                    templatePool.addToPool(nodeSets[delIndex]);
                }

                // update node sets
                nodeSets.splice(startA, diff.deletedA - setLength);

                // apply set operations
                for (var setIndex = 0; setIndex < setLength; setIndex++) {
                    var nodeSet = nodeSets[startA++];
                    var node = photon.array.find(nodeSet, function(node) {
                        return photon.binding.DataContext.getLocalForElement(node) != null
                    })
                    if (node) {
                        photon.binding.DataContext.getLocalForElement(node).setValue(newItems[diff.startB + setIndex]);
                    }
                }

                // update diff (should now only contain adjusted inserts)
                diff.startA = startA;
                diff.startB = diff.startB + setLength;
                diff.insertedB = diff.insertedB - setLength;
                diff.deletedA = 0;
            }

            if (this.renderTarget_ === photon.templating.RenderTarget.NextSibling) {
                if (nodeSets.length > 0) {
                    var nodeSet = nodeSets[nodeSets.length - 1],
                        defaultReferenceNode = nodeSet[nodeSet.length - 1].nextSibling;
                }
                else {
                    defaultReferenceNode = referenceElement.nextSibling;
                }
            }

            // process inserts
            offset = 0;
            for (diffIndex = 0; diffIndex < diffLength; diffIndex++) {
                diff = diffs[diffIndex];

                startA = diff.startA + offset;

                var referenceNode = nodeSets[startA] ? nodeSets[startA][0] : defaultReferenceNode;
                for (var insIndex = diff.startB, insLength = insIndex + diff.insertedB; insIndex < insLength; insIndex++, offset++) {
                    nodeSets.splice(startA++, 0, photon.templating.insertBeforeAndApplyBindings(
                        parentNode, templatePool.getFragment(), referenceNode, newItems[insIndex], dataContext));
                }
            }

            // clean remaining nodes
            templatePool.dispose();
        }
    }
);