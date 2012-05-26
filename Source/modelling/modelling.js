var metaDataRecursion = 0;

/** @namespace photon.modelling */
provide("photon.modelling");

photon.modelling.memberInfo = function(name) {
    this.name_ = name;
};

photon.defineType(photon.modelling.memberInfo, {
    getName : function() {
        return this.name_;
    }
});

photon.modelling.propertyInfo = function(name, definition) {
    photon.modelling.propertyInfo.base(this, name);

    definition = this.inheritDefinition_(definition);

    this.changing_ = this.mapFunctions_(
        definition.changing, this.createChangeNotifier);
    this.changed_ = this.mapFunctions_(
        definition.changed, this.createChangeNotifier);

    if (definition.coerce) {
        var coercers = this.mapFunctions_(definition.coerce, function (x) {
            return assert(photon.modelling.coercers[x],
                "Coercion type '{0}' is not registered", x);
        });

        this.coerce_ = coercers.length === 1 ? coercers[0] : function (value) {
            for (var i = 0, n = coercers.length; i < n; i++) {
                value = coercers[i](value);
            }
            return value;
        };
    }

    if (!metaDataRecursion) {
        property.metaData = property.metaData || {};
        photon.extend(property.metaData,
            this.getDefaultPropertyMetaData(property));
    }

    metaDataRecursion++;
    try {
        if (property.metaData) {
            var metaModelType = photon.observable.model.define(property.metaData);
            property.metaData = new metaModelType();
        }
    } finally {
        metaDataRecursion--;
    }

    return property;
};

photon.defineType(
    photon.modelling.propertyInfo,
    photon.modelling.memberInfo,
    {
        inheritDefinition_ : function(definition) {
            var property = {}, propertyType = definition.type, baseDefinition = null;
            if (propertyType) {
                baseDefinition = assert(photon.modelling.types[propertyType],
                    "Type '{0}' has not been registered", propertyType);
            }
            var propertyNames = photon.object.getOwnPropertyNames(definition);
            if (baseDefinition) {
                propertyNames = propertyNames.concat(photon.object.getOwnPropertyNames(baseDefinition));
                photon.array.removeDuplicates(propertyNames);
            }
            photon.array.forEach(propertyNames, function() {
                assert(photon.modelling.propertyFeature[propertyName], "Undefined property feature '{0}'.",
                    propertyName).define(property, definition[propertyName],
                        baseDefinition ? baseDefinition[propertyName] : null, propertyName);
            });
            return property;
        },
        mapFunctions_ : function(value, methodFactory) {
           if (!photon.isArray(value)) {
               value = [value];
           }
           return photon.array.map(value, function(item) {
               return photon.isFunction(item) ? item : methodFactory(item);
           }, this);
        },
        createChangeNotifier:function (name) {
            return new Function("oldValue", "newValue",
                photon.string.format("this.{0}(oldValue, newValue)", name));
        }
    });

photon.model



photon.extend(photon.modelling,
    {
        createChangeNotifier:function (name) {
            return function (oldValue, newValue) {
                this[name].call(this, oldValue, newValue);
            };
        },
        createPropertySetter_:function (propertyName) {
            return function (value) {
                return this.set(propertyName, value);
            };
        },
        createPropertyGetter_:function (propertyName) {
            return function () {
                return this.get(propertyName);
            };
        },
        createPropertyAccessor_:function (propertyName, isReadOnly) {
            var accessor = function (value) {
                if (value || arguments.length > 0) {
                    assert(!isReadOnly,
                        "Property '{0}' is read only.", propertyName);

                    return this.set(propertyName, arguments[0]);
                } else {
                    return this.get(propertyName);
                }
            };
            accessor.isPropertyAccessor = true;
            return accessor;
        },
        defineProperties_:function (prototype, properties, style) {
            photon.object.forEachOwnProperty(properties,
                function (propertyName) {
                    if (style === "property") {
                        Object.defineProperty(prototype, propertyName, {
                            get:this.createPropertyGetter_(propertyName),
                            set:property.isReadOnly ?
                                null :
                                this.createPropertySetter_(propertyName),
                            enumerable:true,
                            configurable:false
                        });
                    } else {
                        prototype[propertyName] = this.createPropertyAccessor_(propertyName,
                            properties[propertyName].isReadOnly);
                    }
                }, this);
        },
        /**
         * Gets the default display name for a member, the default display name is created by splitting
         * a camel cased identifier into a sequence of words with the first character of the first word
         * converted to upper case.
         *
         * @param name
         * @return {String}
         * @private
         */
        getDefaultDisplayName_:function (name) {
            var result = name.replace(/([A-Z])/g, " $1");
            return result.charAt(0).toUpperCase() +
                result.substring(1);
        },
        addExtension_:function (modelDefinition, extensionName, extension) {
            if (extension) {
                extension.define(modelDefinition);
            }
        },
        prepareModelDefinition_:function (definition, ancestorDefinition) {
            // define definition type
            var result = {
                extensions:[],
                properties:{},
                methods:{}
            };

            // add ancestor definitions
            if (ancestorDefinition) {
                photon.extend(result.properties, ancestorDefinition.properties);
                photon.extend(result.methods, ancestorDefinition.methods);
            }

            var globalExtensions = photon.observable.model.extensions;
            photon.object.forEachOwnProperty(globalExtensions, function (propertyName) {
                var extension = globalExtensions[propertyName];
                this.addExtension_(definition, propertyName, extension);
                result.extensions.push(extension);
            }, this);

            photon.object.forEachOwnProperty(definition, function (memberName) {
                var member = definition[memberName];
                if (photon.isFunction(member)) {
                    result.methods[memberName] = {
                        methodName:memberName,
                        method:member
                    };
                }
                else {
                    if (!member || photon.array.indexOf(["number", "string", "boolean"], typeof member) !== -1) {
                        member = {
                            initialValue:member
                        };
                    }
                    member.propertyName = memberName;
                    result.properties[memberName] =
                        this.preparePropertyDefinition_(member);
                }
            }, this);

            return result;
        },
        preparePropertyDefinition_:function (definition) {
            var property = {}, propertyType = definition.type;
            if (propertyType) {
                photon.extend(property, assert(photon.observable.model.types[propertyType],
                    "Model type '{0}' has not been registered", propertyType));
            }
            photon.extend(property, definition);

            if (photon.isString(property.changing)) {
                property.changing = this.createChangeNotifier(property.changing);
            }
            if (photon.isString(property.changed)) {
                property.changed = this.createChangeNotifier(property.changed);
            }

            if (property.coerce && !photon.isFunction(property.coerce)) {
                if (photon.isString(property.coerce)) {
                    property.coerce = photon.observable.model.coercers[property.coerce];
                } else if (photon.isArray(property.coerce)) {
                    var coercers = photon.array.map(property.coerce, function (item) {
                        var result = photon.isFunction(item) ?
                            item :
                            photon.observable.model.coercers[item];
                        return assert(result, "Coercion type '{0}' is not registered", item);
                    });
                    property.coerce = function (value) {
                        for (var i = 0, n = coercers.length; i < n; i++) {
                            value = coercers[i](value);
                        }
                        return value;
                    };
                }
            }

            if (!metaDataRecursion) {
                property.metaData = property.metaData || {};
                photon.extend(property.metaData,
                    this.getDefaultPropertyMetaData(property));
            }

            metaDataRecursion++;
            try {
                if (property.metaData) {
                    var metaModelType = photon.observable.model.define(property.metaData);
                    property.metaData = new metaModelType();
                }
            } finally {
                metaDataRecursion--;
            }

            return property;
        },
        define:function (constructor, ancestor, definition) {
            if (arguments.length === 1) {
                definition = constructor;
                constructor = ancestor = null;
            } else if (arguments.length === 2) {
                definition = ancestor;
                ancestor = null;
            }

            definition = this.prepareModelDefinition_(definition, ancestor ?
                ancestor.prototype.definition_ :
                null);

            if (!ancestor) {
                ancestor = photon.observable.model.Base;
            }

            // create a default constructor
            if (!constructor) {
                constructor = function (initialValues) {
                    constructor.base(this, initialValues);
                };
            }

            photon.defineType(constructor, ancestor, {
                definition_:definition
            });

            // get prototype after defining the type (as it is replaced)
            var prototype = constructor.prototype;

            this.defineProperties_(prototype, definition.properties,
                photon.observable.model.defaultPropertyMode);

            // map methods
            photon.extend(constructor.prototype, definition.methods, photon.extend.filterHasOwnProperty,
                function (o, m) {
                    return o[m].method;
                });

            // return
            return constructor;
        },
        isPropertyAccessor:function (target) {
            return photon.isFunction(target) && target.isPropertyAccessor;
        }
    });

photon.observable.model.defaultPropertyMode = "function";

photon.observable.model.getDefaultPropertyMetaData = function(property) {
    return {
        displayName:{
            initialValue:this.getDefaultDisplayName_(property.propertyName)
        }
    };
};

photon.observable.model.extensions = {};

photon.observable.model.coercers = {};

photon.observable.model.metaData = function(modelOrType, propertyName) {
    var definition = photon.isFunction(modelOrType) ?
        modelOrType.prototype.definition_ :
        modelOrType.definition_;
    if (definition) {
        return definition.properties[propertyName].metaData;
    }
    return null;
};

photon.observable.model.Base = function (initialValues) {
    this.initialize(initialValues);
    if (photon.isFunction(this.onInitialize)) {
        this.onInitialize();
    }
};

photon.defineType(
    photon.observable.model.Base,
    {
        /**
         * Gets a property value
         * @param {String} propertyName
         * @return {*}
         * @protected
         */
        get:function (propertyName) {
            photon.observable.DependencyTracker.registerDependency(this, propertyName);
            return this.propertyValues_[propertyName];
        },
        /**
         * Sets a property value
         * @param {String} propertyName
         * @param {*} value
         * @return {Boolean} True if the value was changed, otherwise; false.
         * @protected
         */
        set:function (propertyName, value) {
            var extensions = this.definition_.extensions;

            var property = this.definition_.properties[propertyName];
            if (!property) {
                throw new Error();
            }

            var oldValue = this.propertyValues_[propertyName];
            if (oldValue !== value) {
                // the value may no longer be changing due to coercion, however, validate strategies etc, will most likely still want to get involved, more though should go into this.
                if (property.coerce) {
                    value = property.coerce(value, oldValue);
                }

                // before change is for hard validation (not for coercion)
                if (property.changing) {
                    property.changing.call(this, oldValue, value);
                }
                for (var i = 0; i < extensions.length; i++) {
                    extensions[i].changing(this, property, oldValue, value);
                }

                this.propertyValues_[propertyName] = value;

                // after change is for notification
                if (property.changed) {
                    property.changed.call(this, oldValue, value);
                }
                for (i = 0; i < extensions.length; i++) {
                    extensions[i].changed(this, property, oldValue, value);
                }

                this.notifyPropertyChanged(propertyName, oldValue, value);
                return true;
            }
            return false;
        },
        notifyPropertyChanged:function (propertyName, oldValue, newValue) {
            if (this.subscribers_) {
                var event = { sender:this, propertyName:propertyName, oldValue:oldValue, newValue:newValue };
                // TODO: Clone for notification?
                for (var subscriberIndex = 0, subscriberCount = this.subscribers_.length; subscriberIndex < subscriberCount; subscriberIndex++) {
                    var subscriber = this.subscribers_[subscriberIndex];
                    if (subscriber) {
                        this.subscribers_[subscriberIndex].notify(event);
                    }
                }
            }
        },
        /**
         *
         * @param {function} callback
         * @param {object} [callbackTarget]
         * @param {string} [propertyName]
         * @param {*} [data]
         */
        subscribe:function (callback, callbackTarget, propertyName, data) {
            if (arguments.length < 4) {
                if (typeof callbackTarget === "String") {
                    data = propertyName;
                    propertyName = callbackTarget;
                    callbackTarget = null;
                }
            }

            if (propertyName) {
                if (this.definition_.properties[propertyName]) { // TODO: If is a hack for calculated ATM
                    propertyName = this.definition_.properties[propertyName].propertyName;
                }
            }

            this.subscribers_ = this.subscribers_ || [];
            var result = new photon.observable.Subscriber(this, callback, callbackTarget, propertyName, data);
            this.subscribers_.push(result);
            return result;
        },
        unsubscribe:function (subscriber) {
            return photon.array.remove(this.subscribers_, subscriber);
        },
        initialize:function (initialValues) {
            this.propertyValues_ = {};

            var self = this;
            photon.extend(this.propertyValues_, this.definition_.properties, photon.extend.filterHasOwnProperty,
                function (o, m) {
                    var property = o[m], propertyValue =
                        property.initializer ? property.initializer(self) : property.initialValue;
                    if (initialValues && property.propertyName in initialValues) {
                        propertyValue = initialValues[property.propertyName];
                    }
                    return property.coerce ? property.coerce(propertyValue, undefined) : propertyValue;
                }
            );
        },
        isObservable:true
    });

photon.observable.model.coercers.trim = function (value) {
    return value ? photon.string.trim(value) : '';
};

photon.observable.model.coercers.initCaps = function (value) {
    var result = value.split(' ');
    for (var i = 0; i < result.length; i++) {
        if (result.length > 0) {
            result[i] = result[i].charAt(0).toUpperCase() + result[i].substring(1);
        }
    }
    return result.join(' ');
};

photon.observable.model.coercers.upper = function (value) {
    return value ? value.toUpperCase() : '';
};

photon.observable.model.coercers.lower = function (value) {
    return value ? value.toUpperCase() : '';
};
