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
            this.clearNodeSets();
            this.setDataContext(null);
            if (this.itemsRenderer_) {
                this.itemsRenderer_.dispose();
                this.itemsRenderer_ = null;
            }
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

                var fragment = photon.templating.FlowTemplate.
                    getForElement(target).getFragment();
                if (applyTo === photon.templating.RenderTarget.Child) {
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
            var target = this.getTarget();

            this.itemsRenderer_ = this.itemsRenderer_ || new photon.templating.ItemsRenderer(
                target, this.getExpression().getApplyTo(), photon.templating.FlowTemplate.getForElement(target)
            );
            this.itemsRenderer_.setItems(this.flowData_);
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


