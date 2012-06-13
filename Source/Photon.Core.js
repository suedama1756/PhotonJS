defineNamespace = function (namespace, properties) {
    var parts = namespace.split(".");
    var currentPart = photon;
    for (var i = 0, n = parts.length; i < n; i++) {
        currentPart = (currentPart[parts[i]] = currentPart[parts[i]] || {});
    }
    return photon.extend(currentPart, properties);
};

provide = function (namespace, properties) {
    var parts = namespace.split(".");
    if (parts[0] !== "photon") {
      throw new Error();
    }
    var currentPart = photon;
    for (var i = 1, n = parts.length; i < n; i++) {
        currentPart = (currentPart[parts[i]] = currentPart[parts[i]] || {});
    }
    return photon.extend(currentPart, properties);
};

photon.provide = provide;

(function () {
    //noinspection JSValidateTypes
    var fnTest = /xyz/.test(function () {
        var xyz;
    }) ? /\bbase\b/ : /.*/;

    function createDescendantFunction(fn, superFn) {
        //var args = fn.toString().match (/function\s+\w*\s*\((.*?)\)/)[1].split (/\s*,\s*/);

        return function () {
            var oldBase = this.base;
            this.base = superFn;
            try {
                return fn.apply(this, arguments);
            }
            finally {
                this.base = oldBase;
            }
        };
    }

    /**
     * Defines a type
     * @param {Function} type
     * @param {Function|Object} [ancestor]
     * @param {object} [instanceProperties]
     * @param {object} [staticProperties]
     * @return {Function}
     */
    photon.defineType = function (type, ancestor, instanceProperties, staticProperties) {
        if (!photon.isFunction(ancestor)) {
            staticProperties = instanceProperties;
            instanceProperties = ancestor;

            ancestor = null;
        }

        // sort out inheritance chain
        function Prototype() {
        }

        var superType = null;
        if (ancestor) {
            superType = ancestor.prototype;
            Prototype.prototype = superType;
        }

        type.prototype = new Prototype();
        type.prototype.constructor = type;

        // store super type for convenient access
        type.superType = superType;
        type.base = function(instance /*  args... */) {
            if (superType) {
                type.superType.constructor.apply(instance, arrayNativePrototype.slice.call(arguments, 1));
            }
        };
        type.prototype.superType = superType;

        if (instanceProperties) {
            // Copy the properties over onto the new prototype
            photon.extend(type.prototype, instanceProperties,
                photon.extend.filterHasOwnProperty, function (source, propertyName) {
                    var propertyValue = source[propertyName];
                    var isFunctionThatCallsSuper = ancestor && photon.isFunction(propertyValue) &&
                        fnTest.test(propertyValue);
                    return isFunctionThatCallsSuper ?
                        createDescendantFunction(propertyValue, superType[propertyName]) :
                        propertyValue;
                });
        }

        if (staticProperties) {
            photon.extend(type, staticProperties);
        }

        return type;
    };
})();

var objectNativePrototype = Object.prototype;
var stringNativePrototype = String.prototype;
var arrayNativePrototype = Array.prototype;

/**
 * Returns a value indicating whether the specified value is undefined.
 * @param {*} value
 */
photon.isUndefined = function (value) {
    var x;
    return value === x;
};

/**
 * Returns a value indicating whether the specified value is null or undefined.
 * @param {*} value
 */
photon.isNullOrUndefined = function (value) {
    return value === null || photon.isUndefined(value);
};

/**
 * Returns a value indicating whether the specified value is a string.
 * @param {*} value
 */
photon.isString = function (value) {
    return typeof value === "string";
};

/**
 * Gets a value indicating whether the specified value is an element
 * @param value
 * @return {Boolean}
 */
photon.isElement = function(value) {
    return value && value.nodeType === 1;
};

photon.isDocument = function(value) {
    return value && value.nodeType === 9;
};


photon.isDocumentOrElement = function(value) {
    return value && (value.nodeType === 1 || value.nodeType === 9);
};

/**
 * Gets a value indicating whether the specified value is a document fragment
 * @param value
 * @return {Boolean}
 */
photon.isDocumentFragment = function(value) {
    return value && value.nodeType === 11;
};

/**
 * Returns a value indicating whether the specified value is a function.
 * @param {*} value
 */
photon.isFunction = function (value) {
    return typeof value === "function";
};

/**
 * Returns a value indicating whether the specified value is an array.
 * @param {*} value
 */
photon.isArray = function(value) {
    return objectNativePrototype.toString.call(value) === '[object Array]';
};

/**
 * @type {String}
 * @private
 */
photon.UID_PROPERTY_ = 'photon_uid' +
    Math.floor(Math.random() * 2147483648).toString(36);

/**
 * @type {Number}
 * @private
 */
photon.nextUID_ = 0;

/**
 * Gets a unique id for the object
 * @param obj
 * @return {*}
 */
photon.getUID = function(obj) {
    return obj[photon.UID_PROPERTY_] ||
        (obj[photon.UID_PROPERTY_] = ++photon.nextUID_);
};

/**
 * Extends a target object by copying properties from the source.
 *
 * @param {object} target The target object.
 * @param {object} source The source object.
 * @param {Function} [filter] An optional filter function that can be used to filter which source properties should be copied.
 * @param {function(object, string)} [map] An optional map function that can be used to map the source properties.
 */
photon.extend = function (target, source, filter, map) {
    for (var propertyName in source) {
        if (!filter || filter(source, propertyName)) {
            target[propertyName] = map ? map(source, propertyName) : source[propertyName];
        }
    }
    return target;
};

/**
 * Function for filtering out properties that are not owned by the specified obj.
 * @param {object} obj The object whose properties should be inspected.
 * @param {string} property The property to verify is owned by the object.
 */
photon.extend.filterHasOwnProperty = function (obj, property) {
    return obj.hasOwnProperty(property);
};
photon.extend.filterHasOwnFunction = function (obj, property) {
    return obj.hasOwnProperty(property) && photon.isFunction(obj[property]);
};

