/**
 * Creates a new instance of the FlowBinding type.
 *
 * @param {HTMLElement|HTMLDocument} target The target element to bind to.
 * @param {photon.binding.flow.FlowBindingExpression} expression
 * @constructor
 */
photon.binding.flow.FlowBinding = function (target, expression) {
    photon.binding.flow.FlowBinding.base(this, target, expression);
    photon.addDisposable(target, this);
};

var TemplatePool = function (cacheEntry) {
    this.pool_ = [];
    this.poolIndex_ = 0;
    this.cacheEntry_ = cacheEntry;
};

photon.defineType(TemplatePool, {
    addToPool:function (templateNodes) {
        this.pool_.push(templateNodes);

        // remove from from (if attached)
        photon.array.forEach(templateNodes,
            photon.dom.remove);
    },
    getTemplate:function () {
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
        return this.cacheEntry_.getFragment();
    },
    dispose:function () {
        for (var i = this.poolIndex_, n = this.pool_.length; i < n; i++) {
            photon.dom.cleanNodes(this.pool_[i]);
        }
        this.pool_ = this.poolIndex_ = undefined;
    }
});

photon.defineType(
    /**
     * Constructor
     */
    photon.binding.flow.FlowBinding,
    /**
     * Ancestor
     */
    photon.binding.BindingBase,
    /**
     * @lends photon.binding.flow.FlowBinding.prototype
     */
    {
        dispose:function () {
            if (this.arraySubscriber_) {
                this.arraySubscriber_.dispose();
                this.arraySubscriber_ = null;
            }
            this.clearNodeSets();
            this.setDataContext(null);
        },
        dataSourceChanged:function () {
            if (this.getDataContext()) {
                this.updateFlowData(this.dependencyTracker);
            }
            else {
                this.clearNodeSets();
            }
        },
        updateFlowData:function (dependencyTracker) {
            var expression = this.getExpression();

            var flowData = expression.getFlowData(this.getDataContext(),
                dependencyTracker);

            if (this.flowData_ !== flowData) {
                this.flowData_ = flowData;
                this.flowDataChanged();
            }
        },
        flowDataChanged:function () {
            if (this.getExpression().getFlowType() === "if") {
                this.applyIf();
            } else {
                this.applyEach();
            }
        },
        bind:function () {
            if (!this.isInitialized_) {
                this.dependencyTracker = new photon.observable.DependencyTracker(
                    function () {
                        this.updateFlowData(null);
                    }, this);
                photon.addDisposable(this.target_, this.dependencyTracker);

                // mark as initialized
                this.isInitialized_ = true;
            }

            this.updateDataContext();
        },
        applyIf:function () {
            var sourceValue = this.flowData_, target = this.getTarget(),
                applyTo = this.getExpression().getApplyTo();

            if (sourceValue) {
                if (this.nodeSets_) {
                    return;
                }

                var fragment = photon.templating.FlowTemplateCacheEntry.
                    getForElement(target).getFragment();
                if (applyTo === photon.binding.flow.FlowRenderTarget.Child) {
                    this.nodeSets_ = [photon.binding.data.properties["data.template"]
                        .insertBefore2(target, fragment, null)];
                } else {
                    this.nodeSets_ = [photon.binding.data.properties["data.template"]
                        .insertBefore2(target.parentNode, fragment, target.nextSibling)];
                }
            }
            else {
                this.clearNodeSets();
            }
        },
        applyEach:function () {
            var sourceValue = this.flowData_, target = this.getTarget(),
                applyTo = this.getExpression().getApplyTo();

            if (this.arraySubscriber_) {
                if (this.arraySubscriber_.getOwner() !== sourceValue) {
                    this.arraySubscriber_.dispose();
                    this.arraySubscriber_ = null;
                }
            }

            if (!this.arraySubscriber_ && sourceValue && sourceValue.subscribe) {
                this.arraySubscriber_ = sourceValue.subscribe(this.flowDataChanged, this);
            }

            sourceValue = photon.observable.unwrap(sourceValue) || [];
            this.renderEach(this.oldSourceValue_ || [], sourceValue);
            this.oldSourceValue_ = sourceValue.slice(0);
        },
        renderEach:function (oldValue, newValue) {
            this.nodeSets_ = this.nodeSets_ || [];

            var diffs = photon.array.diff(oldValue, newValue),
                diff,
                startA,
                target = this.getTarget(),
                nodeSets = this.nodeSets_,
                nodeSet,
                offset = 0,
                templatePool = new TemplatePool(photon.templating.FlowTemplateCacheEntry.getForElement(target)),
                defaultReferenceNode = this.getExpression().getApplyTo() === photon.binding.flow.FlowRenderTarget.Child ?
                    null :
                    target.nextSibling,
                parentNode = this.getExpression().getApplyTo() === photon.binding.flow.FlowRenderTarget.Child ?
                    target :
                    target.parentNode,
                dataContext = this.getDataContext();

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
                        photon.binding.applyBindings(newValue[diff.startB + setIndex], nodeSet[nodeIndex], dataContext);
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
                        .insertBefore(parentNode, templatePool.getTemplate(), referenceNode, newValue[insIndex], dataContext));
                }
            }

            // clean remaining nodes
            templatePool.dispose();
        },
        clearNodeSets:function () {
            var nodeSets = this.nodeSets_;
            if (nodeSets) {
                for (var i = 0, n = nodeSets.length; i < n; i++) {
                    photon.array.forEach(nodeSets[i], photon.dom.removeAndClean);
                }
                this.nodeSets_ = undefined;
            }
        }
    });


