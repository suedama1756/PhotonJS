photon.defineType(
    photon.binding.data.TextProperty = function () {
    },
    photon.binding.data.Property,
    /**
     * @lends: photon.binding.data.StyleDataBindingProperty.prototype
     */
    {
        getValue:function (binding) {
            return $(binding.getTarget()).text();
        },
        setValue:function (binding) {
            $(binding.getTarget()).text(binding.getSourceValue());
        }
    }
);
