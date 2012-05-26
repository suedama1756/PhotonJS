/**
 * Creates a new instance of the FlowBindingType type.
 * @extends photon.binding.BindingType
 */
photon.binding.flow.FlowBindingType = function () {
};

photon.defineType(
    /**
     * Constructor
     */
    photon.binding.flow.FlowBindingType,
    /**
     * Ancestor
     */
    photon.binding.BindingType,
    /**
     * @lends photon.binding.actions.ActionBindingType
     */
    {
        getDefaultExpressionType:function () {
            return "flow";
        },
        getExpressionBuilderType:function () {
            return photon.binding.flow.FlowBindingExpressionBuilder;
        }
    });

/**
 * Register the data-flow binding type
 */
photon.binding.registerBindingType("data-flow", new photon.binding.flow.FlowBindingType());

