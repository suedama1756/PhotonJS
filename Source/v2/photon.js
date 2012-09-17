var toString = Object.prototype.toString;

function isType(obj, type) {
    return toString.call(obj) === type;
}

function isString(obj) {
    return isType(obj, '[object String]');
}

function isBoolean(obj) {
    return isType(obj, '[object Boolean]');
}

function isNumber(obj) {
    return isType(obj, '[object Number]');
}

function isFunction(obj) {
    return typeof obj === 'function';
}

function isUndefined(obj) {
    return obj === undefined;
}

function isNullOrUndefined(obj) {
    return obj === null || obj === undefined;
}

/**
 * Extends a target object by copying properties from the source.
 *
 * @param {object} target The target object.
 * @param {object} source The source object.
 * @param {function} [filter] An optional filter function that can be used to filter which source properties should be copied.
 * @param {function(object, string)} [map] An optional map function that can be used to map the source properties.
 */
function extend(target, source, filter, map) {
    for (var propertyName in source) {
        if (!filter || filter(source, propertyName)) {
            target[propertyName] = map ? map(source, propertyName) : source[propertyName];
        }
    }
    return target;
}

/**
 * Function for filtering out properties that are not owned by the specified obj.
 * @param {object} obj The object whose properties should be inspected.
 * @param {string} property The property to verify is owned by the object.
 */
extend.filterHasOwnProperty = function (obj, property) {
    return obj.hasOwnProperty(property);
};

extend(photon, {
   "isString" : isString,
   "isNumber" : isNumber,
   "isBoolean" : isBoolean
});

