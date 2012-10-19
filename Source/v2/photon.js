/*jslint sub:true */

var toString = Object.prototype.toString;

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

function isNullOrUndefined(obj) {
    return obj === null || obj === undef;
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
    return obj && 'length' in obj;
}


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

extend(photon, {
    "isString":isString,
    "isNumber":isNumber,
    "isBoolean":isBoolean,
    "isFunction":isFunction,
    "isUndefined":isUndefined,
    "isNullOrUndefined":isNullOrUndefined,
    "extend":extend
});

