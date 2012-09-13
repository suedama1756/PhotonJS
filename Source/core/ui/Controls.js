(function() {
    var controlPropertyPrototype = {
        beginInitialize:function (binding) {
            this.getControl(binding).beginInitialize();
        },
        endInitialize:function (binding) {
            this.getControl(binding).endInitialize();
            this.setValue(binding);
        },
        /**
         * Gets the value of the property from the underlying control
         * @param binding
         * @return {*}
         */
        getValue:function (binding) {
            return this.getControl(binding).get(this.propertyName_);
        },
        /**
         * Sets the value of the property on the underlying control
         * @param binding
         */
        setValue:function (binding) {
            var control = this.getControl(binding), propertyName = this.propertyName_,
                oldValue = control[propertyName], newValue = binding.getSourceValue();
            if (oldValue !== newValue) {
                control.set(propertyName, newValue);
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
            }, 0);
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
                    }
                    if (!binding.isSubscribed_)
                    {
                        binding.isSubscribed_ = true;

                        var self = this;
                        data.control.subscribe(function (propertyName) {
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
            photon.extend(definitionCopy, definitionCopy.properties);
            delete definitionCopy.properties;
        }

        return photon.observable.model.define(constructor, ancestor || photon.ui.Control, definitionCopy);
    };

    photon.ui.Control = function (target) {
        photon.ui.Control.base(this);
        this.target_ = target;
        this.initializeCount_ = 0;
        var self = this;
        this.subscribe(function() {
            self.invalidate();
        });
    };

    photon.observable.model.define(
        photon.ui.Control,
        {
            applyTemplate : function(template) {
                if (photon.isString(template)) {
                    template = photon.templating.getCache().getTemplate(template);
                }

                var fragment = template.getFragment(), target = this.target_;

                photon.controlScope.push(this);

                while (fragment.firstChild) {
                    var element =  fragment.firstChild;
                    target.appendChild(element);

                    photon.binding.updateBindings(element);
                }

                photon.controlScope.pop();
            },
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

