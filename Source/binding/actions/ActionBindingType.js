photon.defineType(
    /**
     * Creates a new instance of the ActionBindingType type.
     * @class represents an action binding type
     * @extends photon.binding.BindingType
     */
    photon.binding.actions.ActionBindingType = function () {
    },
    photon.binding.BindingType,
    /**
     * @lends photon.binding.actions.ActionBindingType
     */
    {
        getDefaultExpressionType:function () {
            return "action";
        },
        getExpressionBuilderType:function () {
            return photon.binding.actions.ActionBindingExpressionBuilder;
        }
    });

photon.binding.registerBindingType("data-action", new photon.binding.actions.ActionBindingType());

