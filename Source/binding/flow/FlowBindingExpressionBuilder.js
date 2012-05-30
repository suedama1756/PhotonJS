/**
 * Creates an instance of the FlowBindingExpressionBuilder type.
 *
 * @param {String} type The type of the expression, e.g. "flow"
 * @param {String} subtype The sub type of the expression, e.g. "if", "each"
 * @param text
 * @constructor
 * @extends photon.binding.BindingExpressionBuilder
 */
photon.binding.flow.FlowBindingExpressionBuilder = function (type, subtype) {
    photon.binding.flow.FlowBindingExpressionBuilder.base(this, type, subtype);
};

photon.defineType(
    /**
     * Constructor
     */
    photon.binding.flow.FlowBindingExpressionBuilder,
    /**
     *  Ancestor
     */
    photon.binding.BindingExpressionBuilder,
    /**
     * @lends photon.binding.flow.FlowBindingExpressionBuilder.prototype
     * */
    {
        build:function () {
            var getFlowData = this.makeGetter(
                this.getSourceOrThrow().text);
            return new photon.binding.flow.FlowBindingExpression(this.getText(),
                this.getSubType(), getFlowData, this.applyTo_);
        },
        "set-applyTo":function (value) {
            assert(photon.binding.flow.RenderTarget.hasOwnProperty(value),
                "Invalid applyTo value '{0}'.", value);
            this.applyTo_ = photon.binding.flow.RenderTarget[value];
        }
    });