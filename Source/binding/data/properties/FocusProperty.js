photon.defineType(
    photon.binding.data.FocusProperty = function () {
    },
    photon.binding.data.Property,
    /**
     * @lends: photon.binding.data.FocusDataBindingProperty.prototype
     */
    {
        bindUpdateSourceTriggers:function (binding) {
            binding.bindUpdateSourceEvent("focus blur");
        },
        getDefaultBindingMode:function () {
            return photon.binding.data.DataBindingMode.TwoWay;
        },
        getValue:function (binding) {
            return photon.dom.hasFocus(binding.getTarget());
        },
        setValue:function (binding) {
            photon.dom.hasFocus(binding.getTarget(), binding.getSourceValue());
        }
    }
);