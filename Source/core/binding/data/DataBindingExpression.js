/**
 * Creates an instance of the photon.binding.data.DataBindingExpression type
 * @param {String} text
 * @param {String} propertyType
 * @param {String} propertyName
 * @param {Function} getter
 * @param {Function} setter
 * @param {photon.binding.data.DataBindingMode} mode
 * @param {String} name
 * @param {Boolean} isPrimary
 * @constructor
 * @extends photon.binding.data.DataBindingExpression
 */
photon.binding.data.DataBindingExpression = function (text, propertyType, propertyName, getter, setter, mode, name, isPrimary) {
    photon.binding.data.DataBindingExpression.base(this, photon.binding.data.DataBinding, text);

    // assign properties
    this.propertyType_ = propertyType;
    this.propertyName_ = propertyName;
    this.getter_ = getter;
    this.setter_ = setter;
    this.mode_ = mode;
    this.name_ = name;
    this.isPrimary_ = isPrimary;

    // lookup property handler
    var propertyHandler = photon.binding.data.properties[propertyType + "." + propertyName] ||
        photon.binding.data.properties[propertyType];
    this.propertyHandler_ = assert(propertyHandler,
        "Unsupported data binding type'{0}'", propertyType);
};

photon.defineType(
    /**
     * Constructor
     */
    photon.binding.data.DataBindingExpression,
    /**
     * Ancestor
     */
    photon.binding.BindingExpression,
    /**
     * @lends photon.binding.data.DataBindingExpression.prototype
     */
    {
        getName:function() {
            return this.name_;
        },
        getMode:function() {
            return this.mode_;
        },
        getIsPrimary:function() {
            return this.isPrimary_;
        },
        getGetter:function() {
            return this.getter_;
        },
        getSetter:function() {
            return this.setter_;
        },
        getPropertyHandler:function() {
            return this.propertyHandler_;
        },
        getPropertyType:function() {
            return this.propertyType_;
        },
        getPropertyName:function() {
            return this.propertyName_;
        },
        getSourceValue : function(dataContext, templateParent, dependencyTracker) {
            return photon.binding.evaluateInContext(dataContext,
                this.getter_, dependencyTracker);
        },
        setSourceValue : function(dataContext, dependencyTracker, value) {
            return photon.binding.evaluateInContext(dataContext,
                this.setter_, dependencyTracker, value);
        }
    }
);