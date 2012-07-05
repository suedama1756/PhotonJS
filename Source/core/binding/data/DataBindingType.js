/**
 * Creates a new instance of the photon.binding.data.DataBindType type
 * @constructor
 */
photon.binding.data.DataBindType = function () {
};

photon.defineType(
    /**
     * Constructor
     */
    photon.binding.data.DataBindType,
    /**
     * Ancestor
     */
    photon.binding.BindingType,
    /**
     * @lends photon.binding.data.DataBindType.prototype
     */
    {
        getDefaultExpressionType:function () {
            return "property";
        },
        /**
         * @return {photon.binding.data.DataBindingExpressionBuilder}
         */
        getExpressionBuilderType:function () {
            return photon.binding.data.DataBindingExpressionBuilder;
        }
    });

photon.binding.registerBindingType("data-bind", new photon.binding.data.DataBindType());