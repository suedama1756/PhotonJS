photon.templating.ItemsRenderer = function (referenceElement, renderTarget, templateEntry) {
    this.referenceElement_ = referenceElement;
    this.renderTarget_ = renderTarget;
    this.templateEntry_ = templateEntry;
};

photon.defineType(
    photon.templating.ItemsRenderer,
    {
        dispose:function () {
            this.subscribe_(null);

            var nodeSets = this.nodeSets_;
            if (nodeSets) {
                for (var i = 0, n = nodeSets.length; i < n; i++) {
                    photon.array.forEach(nodeSets[i], photon.dom.removeAndClean);
                }
                this.nodeSets_ = null;
            }
        },
        getReferenceElement : function() {
            return this.referenceElement_;
        },
        setItems:function (value, refresh) {
            if (this.items_ !== value) {
                this.items_ = value;
                this.itemsChanged_();
            } else if (refresh) {
                this.itemsChanged_();
            }
        },
        getItems:function () {
            return this.items_;
        },
        refresh : function() {
            if (this.items_) {
                this.itemsChanged_();
            }
        },
        subscribe_:function (items) {
            var subscriber = this.subscriber_;
            if (subscriber && subscriber.getOwner() !== items) {
                subscriber.dispose();
                this.subscriber_ = subscriber = null;
            }

            if (!subscriber && items && items.subscribe) {
                this.subscriber_ = items.subscribe(this.itemsChanged_, this);
            }
        },
        itemsChanged_:function () {
            var items = this.items_;
            this.subscribe_(items);
            items = photon.observable.unwrap(items) || [];
            this.render_(this.itemsCopy_ || [], items);
            this.itemsCopy_ = items.slice(0);
        },
        render_:function (oldItems, newItems) {
            this.nodeSets_ = this.nodeSets_ || [];

            var diffs = photon.array.diff(oldItems, newItems),
                diff,
                startA,
                referenceElement = this.referenceElement_,
                nodeSets = this.nodeSets_,
                nodeSet,
                offset = 0,
                defaultReferenceNode = null,
                templatePool = new TemplatePool(this.templateEntry_),
                parentNode = this.renderTarget_ === photon.binding.flow.RenderTarget.Child ?
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
                    nodeSet = nodeSets[startA++];
                    for (var nodeIndex = 0, nodeCount = nodeSet.length; nodeIndex < nodeCount; nodeIndex++) {
                        photon.binding.applyBindings(newItems[diff.startB + setIndex], nodeSet[nodeIndex], dataContext);
                    }
                }

                // update diff (should now only contain adjusted inserts)
                diff.startA = startA;
                diff.startB = diff.startB + setLength;
                diff.insertedB = diff.insertedB - setLength;
                diff.deletedA = 0;
            }

            if (this.renderTarget_ === photon.binding.flow.RenderTarget.NextSibling && nodeSets.length > 0) {
                var nodeSet = nodeSets[nodeSets.length - 1],
                    defaultReferenceNode = nodeSet[nodeSet.length - 1].nextSibling;
            }

            // process inserts
            offset = 0;
            for (diffIndex = 0; diffIndex < diffLength; diffIndex++) {
                diff = diffs[diffIndex];

                startA = diff.startA + offset;

                var referenceNode = nodeSets[startA] ? nodeSets[startA][0] : defaultReferenceNode;
                for (var insIndex = diff.startB, insLength = insIndex + diff.insertedB; insIndex < insLength; insIndex++, offset++) {
                    nodeSets.splice(startA++, 0, photon.binding.data.properties["data.template"]
                        .insertBefore(parentNode, templatePool.getTemplate(), referenceNode, newItems[insIndex], dataContext));
                }
            }

            // clean remaining nodes
            templatePool.dispose();
        }
    }
);




