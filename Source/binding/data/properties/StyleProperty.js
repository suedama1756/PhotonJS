photon.defineType(
    photon.binding.data.StyleProperty = function () {
    },
    photon.binding.data.Property,
    /**
     * @lends: photon.binding.data.StyleDataBindingProperty.prototype
     */
    {
        getValue:function (binding) {
            return $(binding.getTarget()).css(binding.getExpression().getPropertyName());
        },
        setValue:function (binding) {
            $(binding.getTarget()).css(binding.getExpression().getPropertyName(),
                binding.getSourceValue());
        }
    }
);
