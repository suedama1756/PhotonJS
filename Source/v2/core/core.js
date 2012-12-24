/*jslint sub:true */

var toString = Object.prototype.toString,
    arrayPrototype = Array.prototype,
    functionPrototype = Function.prototype,
    stringPrototype = String.prototype,
    undef,
    toNumber = Number;



function assert(condition, msg) {
    if (!condition) {
        throw new Error(msg);
    }
    return condition;
}

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
    return obj === undef;
}

function isObject(obj) {
    return typeof obj === 'object';
}

function isPrimitive(obj) {
    return !(isObject(obj) || isFunction(obj));
}

function isNullOrUndefined(obj) {
    return obj === null || obj === undef;
}

function isArrayLike(obj) {
    var l;
    return isArray(obj) ||
        (isObject(obj) && isNumber(l = obj.length) && (l === 0 || (l > 0 && '0' in obj && l - 1 in obj)));
}

function hasOwnProperty(obj, property) {
    return !isPrimitive(obj) && obj.hasOwnProperty(property);
}

function hasProperty(obj, property) {
    return obj && !isPrimitive(obj) && property in obj;
}

function noop() {
}

/**
 * @const
 * @type string
 */
var UID_PROPERTY = '0c8c22e83e7245adb341d6df8973ea63';
var uidNext = 0;

function getUID(obj) {
    return obj[UID_PROPERTY] || (obj[UID_PROPERTY] = ++uidNext);
}

/**
 * Extends a target object by copying properties from the source.
 *
 * @param {object} target The target object.
 * @param {object} source The source object.
 * @param {function(Object, String, Object) : boolean} [filter] An optional filter function that can be used to filter which source properties should be copied.
 * @param {function(object, string, object) : *} [map] An optional map function that can be used to map the source properties.
 */
function extend(target, source, filter, map) {
    //noinspection JSUnfilteredForInLoop
    for (var propertyName in source) {
        if (!filter || filter(source, propertyName, target)) {
            target[propertyName] = map ? map(source, propertyName, target) : source[propertyName];
        }
    }
    return target;
}

/**
 * Function for filtering out properties that are not owned by the specified obj.
 * @param {object} obj The object whose properties should be inspected.
 * @param {string} property The property to verify is owned by the object.
 */
extend['filterHasOwnProperty'] = function (obj, property) {
    return obj.hasOwnProperty(property);
};

extend(photon, {
    "isString":isString,
    "isNumber":isNumber,
    "isBoolean":isBoolean,
    "isFunction":isFunction,
    "isUndefined":isUndefined,
    "isNullOrUndefined":isNullOrUndefined,
    "extend":extend,
    "getUID":getUID,
    "noop":noop
});