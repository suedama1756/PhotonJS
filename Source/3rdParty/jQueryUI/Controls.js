(function() {
    var controlPropertyPrototype = {
        beginInitialize:function (binding) {
            this.getControl(binding).beginInitialize();
        },
        endInitialize:function (binding) {
            this.getControl(binding).endInitialize();
        },
        /**
         * Gets the value of the property from the underlying control
         * @param binding
         * @return {*}
         */
        getValue:function (binding) {
            return this.getControl(binding)[this.propertyName_];
        },
        /**
         * Sets the value of the property on the underlying control
         * @param binding
         */
        setValue:function (binding) {
            var control = this.getControl(binding), propertyName = this.propertyName_,
                oldValue = control[propertyName], newValue = binding.getSourceValue();
            if (oldValue !== newValue) {
                control[propertyName] = newValue;
                control.onPropertyChanged(propertyName, oldValue, newValue);
            }
        }
    };

    var invalidateControls;

    var invalidateControl = function (control) {
        if (!invalidateControls) {
            invalidateControls = [];
            setTimeout(function () {
                var list = invalidateControls.slice(0);
                invalidateControls = null;
                for (var i = 0, n = list.length; i < n; i++) {
                    list[i].invalidated();
                }
            }, 0)
        }
        invalidateControls.push(control);
    };

    function defineControlProperty(ctor) {
        var constructor = function (propertyName) {
            this.propertyName_ = propertyName;
        };

        return photon.defineType(constructor,
            photon.binding.data.Property,
            photon.extend({
                getControl:function (binding) {
                    var target = binding.getTarget(), data = photon.getOrCreateData(target);
                    if (!data.control) {
                        var ctrl = new ctor(target);
                        photon.addDisposable(target,
                            data.control = ctrl);
                        var self = this;
                        ctrl.subscribe(function (propertyName) {
                            if (self.propertyName_ === propertyName) {
                                binding.updateSource();
                            }
                        });
                    }
                    return data.control;
                }
            }, controlPropertyPrototype));
    }

    photon.ui.defineControl = function (name, constructor, ancestor, definition) {
        var definitionCopy = photon.extend({}, definition);
        if (definitionCopy.properties) {
            photon.object.forEachOwnProperty(definitionCopy.properties, function (propertyName) {
                var type = defineControlProperty(constructor);
                photon.binding.data.properties[name + "." + propertyName] = new type(propertyName);
            });

            // no longer required
            delete definitionCopy.properties;
        }

        return photon.defineType(constructor, ancestor || photon.ui.Control, definitionCopy);
    };

    photon.ui.Control = function (target) {
        this.target_ = target;
        this.initializeCount_ = 0;
    };

    photon.defineType(
        photon.ui.Control,
        {
            getTarget:function () {
                return this.target_;
            },
            dispose:function () {
                this.target_ = null;
            },
            beginInitialize:function () {
                this.initializeCount_++;
            },
            endInitialize:function () {
                if (!--this.initializeCount_) {
                    this.invalidate();
                }
            },
            onPropertyChanged:function (propertyName, oldValue, newValue) {
                this.invalidate();
            },
            subscribe:function (callback) {
                if (this.subscribers_) {
                    this.subscribers_.push(callback);
                } else {
                    this.subscribers_ = [callback];
                }
            },
            notifyPropertyChanged:function (propertyName) {
                var subscribers = this.subscribers_;
                if (subscribers) {
                    photon.array.forEach(subscribers, function (subscriber) {
                        subscriber(propertyName);
                    });
                }
            },
            invalidate:function () {
                if (!this.isInvalidated_) {
                    this.isInvalidated_ = true;
                    invalidateControl(this);
                }
            },
            invalidated:function () {
                this.isInvalidated_ = false;
                this.onInvalidated();
            },
            onInvalidated:function () {

            },
            isInitializing:function () {
                return this.initializeCount_ > 0;
            }
        });
})();

