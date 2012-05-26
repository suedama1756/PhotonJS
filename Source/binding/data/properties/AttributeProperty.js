photon.defineType(
    photon.binding.data.AttributeProperty = function () {
    },
    photon.binding.data.Property,
    /**
     * @lends: photon.binding.data.AttributeDataBindingProperty.prototype
     */
    {
        getValue:function (binding) {
            binding.getTarget().getAttribute(
                binding.getExpression().getPropertyName());
        },
        setValue:function (binding) {
            binding.getTarget().setAttribute(binding.getExpression().getPropertyName(),
                binding.getSourceValue());
        }
    }
);
