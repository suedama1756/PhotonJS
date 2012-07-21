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
            var classNameOrIndex = binding.getExpression().getPropertyName(),
                classIndex = Number(classNameOrIndex);
            if (isNaN(classIndex)) {
                return $(binding.getTarget()).hasClass(
                    binding.getExpression().getPropertyName());
            } else {
                return binding.cssClasses_ && binding.cssClasses_[classIndex];
            }
        },
        setValue:function (binding) {
            var sourceValue = binding.getSourceValue(), className = binding.getExpression().getPropertyName(),
                $target = $(binding.getTarget()),
                index = Number(className);

            if (isNaN(index)) {
                if (sourceValue) {
                    $target.addClass(className);
                } else {
                    $target.removeClass(className);
                }
            } else {
                binding.cssClasses_ = binding.cssClasses_ || [];
                var oldValue = binding.cssClasses_[index];
                if (oldValue != sourceValue) {
                    if (oldValue) {
                        $target.removeClass(oldValue);
                    }
                    binding.cssClasses_[index] = className;
                    if (sourceValue) {
                        $target.addClass(sourceValue);
                    }
                }
            }
        }
    }
);