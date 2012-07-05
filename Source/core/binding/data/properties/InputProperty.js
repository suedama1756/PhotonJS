photon.defineType(
    photon.binding.data.InputProperty = function () {
    },
    photon.binding.data.Property,
    /**
     * @lends: photon.binding.data.InputDataBindingProperty.prototype
     */
    {
        getDefaultBindingMode:function () {
            return photon.binding.data.DataBindingMode.TwoWay;
        },
        bindUpdateSourceTriggers:function (binding) {
            binding.bindUpdateSourceEvent("change");
        }
    }
);