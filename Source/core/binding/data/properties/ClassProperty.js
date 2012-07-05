photon.defineType(
    photon.binding.data.ClassProperty = function () {
    },
    photon.binding.data.Property,
    /**
     * @lends: photon.binding.data.FocusDataBindingProperty.prototype
     */
    {
        getDefaultBindingMode:function () {
            return photon.binding.data.DataBindingMode.OneWay;
        },
        getValue:function (binding) {
            return $(binding.getTarget()).hasClass(
                binding.getExpression().getPropertyName());
        },
        setValue:function (binding) {
            var sourceValue = binding.getSourceValue();

            var className = binding.getExpression().getPropertyName();
            if (sourceValue) {
                $(binding.getTarget()).addClass(className);
            } else
            {
                $(binding.getTarget()).removeClass(className);
            }
        }
    }
);
