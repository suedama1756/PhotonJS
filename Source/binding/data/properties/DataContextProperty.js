photon.defineType(
    photon.binding.data.DataContextProperty = function() {
    },
    photon.binding.data.Property,
    {
        getValue:function (binding) {
            return photon.binding.DataContext.getForElement(binding.getTarget()).getValue();
        },
        setValue:function (binding) {
            photon.binding.DataContext.getForElement(binding.getTarget()).setValue(
                binding.getSourceValue());
        }
    });
