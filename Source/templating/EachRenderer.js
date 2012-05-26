photon.templating.itemsRenderer = function (target, renderTargetType, itemTemplateEntry) {
    this.target_ = target;
    this.renderTargetType_ = renderTargetType;
    this.itemTemplateEntry_ = itemTemplateEntry;
};

photon.defineType(photon.templating.itemsRenderer,
    {
        dispose:function () {
            this.subscribe(null);

            var nodeSets = this.nodeSets_;
            if (nodeSets) {
                for (var i = 0, n = nodeSets.length; i < n; i++) {
                    photon.array.forEach(nodeSets[i], photon.dom.removeAndClean);
                }
                this.nodeSets_ = null;
            }

            this.setDataContext(null);
        },
        update:function (items) {
            if (this.items_ !== items) {
                this.items_ = items;
                this.itemsChanged();
            }
        },
        subscribe : function(items) {
            var subscriber = this.subscriber_;
            if (subscriber && subscriber.getOwner() !== items) {
                subscriber.dispose();
                this.subscriber_ = subscriber = null;
            }

            if (!subscriber && items && items.subscribe) {
                this.subscriber_ = items.subscribe(this.itemsChanged, this);
            }
        },
        itemsChanged:function () {
            var items = photon.observable.unwrap(items) || [];
            this.subscribe(items);
            this.render(this.itemsCopy_ || [], items);
            this.itemsCopy_ = items.slice(0);
        },
        render:function (oldItems, newItems) {
            this.nodeSets_ = this.nodeSets_ || [];

            var diffs = photon.array.diff(oldItems, newItems),
                diff,
                startA,
                target = this.getTarget(),
                nodeSets = this.nodeSets_,
                nodeSet,
                offset = 0,
                templatePool = new TemplatePool(this.itemTemplateEntry_),
                defaultReferenceNode = this.renderTargetType_ === photon.binding.flow.FlowRenderTarget.Child ?
                    null :
                    target.nextSibling,
                parentNode = this.renderTargetType_ === photon.binding.flow.FlowRenderTarget.Child ?
                    target :
                    target.parentNode,
                dataContext = photon.binding.DataContext.getForElement(this.target_);

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
