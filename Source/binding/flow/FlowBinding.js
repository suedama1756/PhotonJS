
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

    if (this.getExpression().getFlowType() === "if") {
        this.renderer_ = new photon.templating.ConditionalRenderer(
            target, this.getExpression().getApplyTo(), photon.templating.FlowTemplate.getForElement(target)
        );
    } else {
        this.renderer_ = new photon.templating.ItemsRenderer(
            target, this.getExpression().getApplyTo(), photon.templating.FlowTemplate.getForElement(target)
        );
    }
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
            this.superType.dispose.call(this);
            if (this.renderer_) {
                this.renderer_.dispose();
                this.renderer_ = null;
            }
        },
        dataSourceChanged:function () {
            if (this.getDataContext()) {
                this.updateFlowData(this.dependencyTracker_);
            }
            else {
                this.renderer_.setData(undefined);
            }
        },
        updateFlowData:function (dependencyTracker) {
            var data = this.getExpression().getFlowData(
                this.getDataContext(), dependencyTracker);
            this.renderer_.setData(data);

        },
        bind:function () {
            if (!this.isInitialized_) {
                this.dependencyTracker_ = new photon.observable.DependencyTracker(
                    function () {
                        this.updateFlowData(this.dependencyTracker_);
                    }, this);
                photon.addDisposable(this.target_, this.dependencyTracker_);

                // mark as initialized
                this.isInitialized_ = true;
            }

            this.updateDataContext();
        }
    });