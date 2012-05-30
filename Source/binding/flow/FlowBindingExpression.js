/**
 * Creates a new instance of the photon.binding.flow.FlowBindingExpression type
 *
 * @param {String} text the text of the expression
 * @param {String} flowType
 * @param {Function} getFlowData
 * @param {photon.binding.flow.RenderTarget} applyTo
 *
 * @constructor
 * @extends photon.binding.BindingExpression
 */
photon.binding.flow.FlowBindingExpression = function (text, flowType, getFlowData, applyTo) {
    // call base with Binding constructor and original expression text
    photon.binding.flow.FlowBindingExpression.base(this, photon.binding.flow.FlowBinding, text);

    /**
     * @type {String}
     * @private
     */
    this.flowType_ = flowType;

    /**
     * @type {photon.binding.flow.RenderTarget}
     * @private
     */
    this.applyTo_ = photon.isNullOrUndefined(applyTo) ?
        photon.binding.flow.RenderTarget.Child :
        applyTo;

    /**
     * @type {Function}
     */
    this.getFlowData_ = getFlowData;
};

 /**
 * Expression type used for defining Flows
 */
photon.defineType(
    /**
     * Constructor
     */
    photon.binding.flow.FlowBindingExpression,
    /**
     * Ancestor
     */
    photon.binding.BindingExpression,
    /**
     * @lends photon.binding.flow.FlowBindingExpression
     */
    {
        /**
         * Gets the flow binding type, e.g. "if", "each"
         * @return {*}
         */
        getFlowType : function() {
            return this.flowType_;
        },
        /**
         * Gets the current source value using the specified data context
         * @param {photon.binding.DataContext} dataContext
         * @param dependencyTracker
         * @return {*}
         */
        getFlowData : function(dataContext, dependencyTracker) {
            return photon.binding.evaluateInContext(
                dataContext, this.getFlowData_, dependencyTracker);
        },
        /**
         * Gets a value indicating where in the DOM the flow template should be applied.
         * @return {photon.binding.flow.RenderTarget}
         */
        getApplyTo : function() {
            return this.applyTo_;
        }
    });

