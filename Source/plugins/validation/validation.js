/** @namespace photon.validation */
photon.provide("photon.validation");

/**
 * Creates a new instance of the photon.validation.ValidationExtension type
 * @constructor
 * @extends photon.observable.model.Extension
 */
photon.validation.ValidationExtension = function () {
    photon.validation.ValidationExtension.base(this);
};

photon.defineType(
    /**
     * Constructor
     */
    photon.validation.ValidationExtension,
    /**
     * Ancestor
     */
    photon.observable.model.Extension,
    /**
     * @lends photon.validation.ValidationExtension.prototype
     */
    {
        define:function (definition) {
            // add errors collection
            var self = this;
            photon.extend(definition,
                {
                    errors:{
                        type:'ObservableArray'
                    },
                    isValidated:{
                        isReadOnly:true,
                        type:'Boolean'
                    },
                    validate:function () {
                        this.set("isValidated", true);

                        var isValid = photon.isFunction(this.onValidate) ?
                            this.onValidate() :
                            true;

                        self.validateModel(this);
                        return isValid && this.errors().length() === 0;
                    }
                });

            photon.object.forEachOwnProperty(definition, function (propertyName) {
                var member = definition[propertyName];
                if (member && typeof member === "object") {
                    var validationRules = member.validationRules;
                    if (!validationRules) {
                        return;
                    }

                    var rules = [];
                    photon.object.forEachOwnProperty(validationRules, function (ruleName) {
                        var ruleType = photon.assert(photon.validation.rules[ruleName],
                            "Unknown rule type {0}.", ruleName);
                        rules.push(new ruleType(validationRules[ruleName]));
                    });

                    definition[propertyName].validationRules = rules;
                }
            });

        },
        findRuleError:function (model, rule) {
            var errors = model.errors().unwrap();
            return photon.array.findIndex(errors, function (error) {
                return error.getRule() === rule;
            });
        },
        afterChange:function (model, property, oldValue, newValue) {
            var isDeferred = model.getValidationStrategy &&
                model.getValidationStrategy() === photon.validation.ValidatationStrategy.Deferred;
            if (model.isValidated() || !isDeferred) {
                this.validateProperty(model, property, newValue);
            }
        },
        validateModel:function (model) {
            var definition = model.definition_;
            photon.object.forEachOwnProperty(definition.properties, function (propertyName) {
                var property = definition.properties[propertyName];
                if (property.validationRules) {
                    this.validateProperty(model, property, model.get(propertyName));
                }
            }, this);
        },
        validateProperty:function (model, property, value) {
            var rules = property.validationRules;
            if (rules) {
                for (var i = 0, n = rules.length; i < n; i++) {
                    var rule = rules[i];
                    var index = this.findRuleError(model, rule);
                    var error = rule.validate(model, property, value);
                    if (error) {
                        if (index === -1) {
                            model.errors().push(error);
                        }
                    } else {
                        if (index !== -1) {
                            model.errors().splice(index, 1);
                        }
                    }
                }
            }
        }
    });

/**
 * Register the validation extension
 * @type {photon.validation.ValidationExtension}
 */
photon.observable.model.extensions.validation = new photon.validation.ValidationExtension();

/**
 * Creates a new instance of the photon.validation.Rule type
 * @param definition
 * @constructor
 */
photon.validation.Rule = function (definition) {
    photon.extend(this, definition);
};

photon.defineType(photon.validation.Rule,
    {
        validate:function (model, property, value) {
            if (!this.isValid(model, property, value)) {
                return new photon.validation.Error(this, property, this.formatError(model, property, value));
            }
            return null;
        },
        isValid:function (model, property, value) {
            return true;
        },
        formatError:function (model, property, value) {
            var self = this;
            return this.message.replace(/\{\{|\}\}|\{(\w+(\.\w+)*)\}/gi, function (m, n) {
                if (m === "{{") {
                    return "{";
                }
                if (m === "}}") {
                    return "}";
                }

                var parts = n.split('.');
                if (parts.length === 1) {
                    if (parts[0] === 'value') {
                        return value;
                    }
                } else if (parts[0] === 'property') {
                    var metaDataValue = property.metaData[parts[1]];
                    if (metaDataValue.isPropertyAccessor) {
                        return property.metaData[parts[1]]();
                    }
                    return metaDataValue;
                } else if (parts[0] === 'rule') {
                    return self[parts[1]];
                }
                return '';
            });
        }
    });

photon.validation.rules = {};

photon.validation.Error = function (rule, property, message) {
    this.rule_ = rule;
    this.property_ = property;
    this.message_ = message;
};

photon.defineType(photon.validation.Error,
    {
        getProperty:function () {
            return this.property_;
        },
        getMessage:function () {
            return this.message_;
        },
        getRule:function () {
            return this.rule_;
        }
    });

photon.validation.defineRule = function (name, definition) {
    var rule = photon.validation.rules[name] = function (ruleDefinition) {
        rule.base(this, ruleDefinition);
    };

    photon.defineType(rule, photon.validation.Rule, photon.extend(
        definition, {
            getName: function() {
                return name;
            }
        })
    );
};

photon.validation.defineRule('length', {
    isValid:function (model, property, value) {
        return value.length >= this.minLength && value.length <= this.maxLength;
    },
    message:"'{property.displayName}' must be between {rule.minLength} and {rule.maxLength} characters in length.",
    minLength:0,
    maxLength:Number.MAX_VALUE
});

photon.validation.defineRule('required', {
    isValid:function (model, property, value) {
        return !photon.isNullOrUndefined(value) && value !== '';
    },
    message:"'{property.displayName}' must have a value."
});

photon.validation.defineRule('regex', {
    isValid:function (model, property, value) {
        return value && value.match(this.regex) !== null;
    },
    regex:undefined,
    message:"'{property.displayName}' does not match the expected input format."
});

photon.validation.defineRule('number', {
    isValid:function (model, property, value) {
        return !isNaN(Number(value));
    },
    message:"'{property.displayName}' must be a number."
});

photon.validation.defineRule('in', {
    isValid:function (model, property, value) {
        return photon.array.indexOf(this.values, value) !== -1;
    },
    values:[],
    message:"'{property.displayName}' must be one of the following values {rule.values}."
});

photon.validation.ValidatationStrategy = {
    Default : 0,
    Deferred   : 1
};