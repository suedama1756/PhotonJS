/**
 * Internal helper method used to add modern JS features to legacy browsers.
 *
 * @param {*} target
 * @param {string} method
 * @param {function} alternativeFactory
 * @return {*}
 */
function modernize(target, method, alternativeFactory) {
    return (method in target) ?
        target[method] :
        (target[method] = alternativeFactory());
}

/**
 * Defines Array.isArray if not already supported by the browser.
 *
 * @type {function(*) :boolean}
 */
modernize(Array, 'isArray', function () {
    return function (obj) {
        return instanceOf(obj, '[object Array]');
    };
});

/**
 * Defines Array.prototype.forEach if not already supported by the browser.
 */
modernize(arrayPrototype, 'forEach', function () {
    return function (callback, thisObj) {
        // verify target
        var array = assertCallTarget(this, 'Array.forEach');

        // if its a string then split it (IE does not support string indexers)
        array = isString(array) ?
            array.split('') :
            array;

        //  invoke for each
        for (var i = 0, n = this.length; i < n; i++) {
            if (i in array) {
                callback.call(thisObj, array[i], i, array);
            }
        }
    };
});

/**
 * Defines Array.prototype.filter if not already supported by the browser
 */
modernize(arrayPrototype, 'filter', function () {
    return function (callback, thisObj) {
        var array = assertCallTarget(this, 'Array.filter');

        var length = array.length,
            result = [],
            resultIndex = 0,
            array = isString(array) ?
                array.split('') :
                array;

        for (var index = 0; index < length; index++) {
            if (index in array) {
                var value = array[index];
                if (callback.call(thisObj, value, index, array)) {
                    result[resultIndex++] = value;
                }
            }
        }

        return result;
    }
});

/**
 * Defines Array.prototype.indexOf if not already supported by the browser
 */
modernize(arrayPrototype, 'indexOf', function () {
    return function (searchElement, fromIndex) {
        var array = assertCallTarget(this, 'Array.indexOf');

        fromIndex = isNullOrUndefined(fromIndex) ? 0
            : (fromIndex < 0 ? Math.max(0, array.length + fromIndex) : fromIndex);

        if (isString(array)) {
            // Array.prototype.indexOf uses === so only strings should be found.
            return !isString(searchElement) || searchElement.length !== 1 ?
                -1 :
                array.indexOf(searchElement, fromIndex);
        }

        for (var i = fromIndex, n = array.length; i < n; i++) {
            if (i in array && array[i] === searchElement) {
                return i;
            }
        }
        return -1;
    };
});

modernize(arrayPrototype, 'map', function () {
    return function (mapper, obj) {
        var array = assertCallTarget(this, 'Array.map');
        var length = array.length,
            result = new Array(length),
            actualArray = isString(array) ?
                array.split('') :
                array;

        for (var i = 0; i < length; i++) {
            if (i in actualArray) {
                result[i] = mapper.call(obj, actualArray[i], i, array);
            }
        }

        return result;
    };
});

modernize(stringPrototype, 'trim', function() {
    return function() {
        return assertCallTarget(this).replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
    }
});

modernize(functionPrototype, 'bind', function () {
    var ctor = function () {
    };
    return function (context /*, args.. */) {
        var fn = this,
            bound,
            args = arrayPrototype.slice.call(arguments, 1);

        if (typeof fn === 'object') {
            var result = function() {
                var args = [context].concat(arrayPrototype.slice.call(arguments));
                return Function.prototype.call.apply(fn, args);
            };
            return result.bind.apply(result, arguments);
        }

        return (bound = function () {
            if (!(this instanceof bound)) {
                return fn.apply(context, args.concat(arrayPrototype.slice.call(arguments)));
            }

            ctor.prototype = fn.prototype;
            var self = new ctor,
                result = fn.apply(self, args.concat(arrayPrototype.slice.call(arguments)));
            return Object(result) === result ?
                result :
                self;
        });
    };
});

/**
 * Cross browser method for getting all the owned property names of an object.
 * @type {function(*) : Array.<string>}
 */
modernize(Object, 'getOwnPropertyNames', function () {
    // basic version
    var result = function (obj) {
        var names = [], i = 0;
        for (var name in obj) {
            if (obj.hasOwnProperty(name)) {
                names[i++] = name;
            }
        }
        return names;
    };

    // <= IE8 won't enumerate toString or valueOf correctly, so we test for this and create a work around.
    var natives = [
        'toString',
        'valueOf'
    ];

    for (var key in {toString:noop}) {
        if (key === natives[0]) {
            return result;  // no work around required
        }
    }

    // wrap with work around
    return function (obj) {
        var names = result(obj);
        natives.forEach(function (name) {
            if (obj.hasOwnProperty(name)) {
                names.push(name);
            }
        });
        return names;
    };
});