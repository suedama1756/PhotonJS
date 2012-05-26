photon.defineType(
    photon.binding.BindingType = function () {
    },
    /**
     * @lends photon.binding.BindingType.prototype
     */
    {
        /**
         * Gets the default target for the binding type
         */
        getDefaultExpressionType:function () {
            throw photon.errors.notImplemented();
        },
        /**
         * Gets the expression builder type
         */
        getExpressionBuilderType:function () {
            throw photon.errors.notImplemented();
        }
    },
    /**
     * @lends photon.binding.BindingType
     */
    {
        getBindingType : function(bindingType) {
            if (bindingType instanceof photon.binding.BindingType) {
                return bindingType;
            }
            return photon.binding.getBindingType(bindingType);
        }
    });
