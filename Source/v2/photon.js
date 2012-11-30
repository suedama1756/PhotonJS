/*jslint sub:true */

var toString = Object.prototype.toString, arrayPrototype = Array.prototype,
    functionPrototype = Function.prototype;

var undef;

function assert(condition, msg) {
    if (!condition) {
        throw new Error(msg);
    }
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

function hasOwnProperty(obj, property) {
    return !isPrimitive(obj) && obj.hasOwnProperty(property);
}

function hasProperty(obj, property) {
    return obj && !isPrimitive(obj) && property in obj;
}

var toNumber = Number;

/**
 * @const
 * @type string
 */
var UID_PROPERTY = '0c8c22e83e7245adb341d6df8973ea63';

var nextUID = 0;

function getUID(obj) {
    return obj[UID_PROPERTY] || (obj[UID_PROPERTY] = ++nextUID);
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

function modernize(source, name, alternative) {
    if (source[name]) {
        return source[name];
    }
    return source[name] = alternative();
}

function noop() {
}

function isArrayLike(obj) {
    var l = 0;
    return isArray(obj) ||
        (isObject(obj) && isNumber(l = obj.length) && (l === 0 || (l > 0 && '0' in obj && l - 1 in obj)));
}

var isArray = modernize(Array, 'isArray', function () {
    return function () {
        return isType('[object Array');
    };
});

modernize(Object, 'getOwnPropertyNames', function () {
    var result = function (obj) {
        var keys = [], i = 0;
        for (var key in obj) {
            keys[i++] = key;
        }
    };

    // work around bug in IE where it does not enumerate properties overriding native methods.
    var natives = [
        'valueOf',
        'toString'
    ];
    for (var key in {valueOf:noop}) {
        if (key === natives[0]) {
            return result;
        }
    }
    return function (obj) {
        var keys = result(obj);
        for (var i = 0, n = natives.length; i < n; i++) {
            var key = natives[i];
            if (obj.hasOwnProperty(key)) {
                keys.push(key);
            }
        }
        return keys;
    };
});

modernize(arrayPrototype, 'forEach', function () {
    return function (fn, obj) {
        var array = this;
        for (var i = 0, n = array.length; i < n; i++) {
            if (i in array) {
                fn.call(obj, array[i], i, array);
            }
        }
    };
});

modernize(arrayPrototype, 'map', function () {
    return function (mapper, obj) {
        var length = this.length, result = new Array(length), actualArray = this;
        for (var i = 0; i < length; i++) {
            if (i in actualArray) {
                result[i] = mapper.call(obj, actualArray[i], i, actualArray);
            }
        }
        return result;
    };
});

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

