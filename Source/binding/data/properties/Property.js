photon.defineType(
    photon.binding.data.Property = function () {
    },
    /**
     * @lends photon.binding.data.PropertyBase.prototype
     */
    {
        beginInitialize : function(binding) {
        },
        endInitialize : function(binding) {

        },
        getDefaultBindingMode:function () {
            return photon.binding.data.DataBindingMode.OneWay;
        },
        getValue:function (binding) {
            return binding.getTarget()[binding.getExpression().getPropertyName()];
        },
        setValue:function (binding) {
            binding.getTarget()[binding.getExpression().getPropertyName()] = binding.getSourceValue();
        }
    });
