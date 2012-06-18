photon.defineType(
    photon.binding.data.DataContextProperty = function() {
    },
    photon.binding.data.Property,
    {
        getValue:function (binding) {
            return photon.binding.DataContext.getForElement(binding.getTarget()).getSource();
        },
        setValue:function (binding) {
            photon.binding.DataContext.getForElement(binding.getTarget()).setSource(
                binding.getSourceValue());
        }
    });
