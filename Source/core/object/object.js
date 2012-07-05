/** @namespace photon.object */
provide("photon.object",
    {
        toBoolean:function (value) {
            if (typeof value == "boolean") {
                return value;
            }

            if (photon.isString(value)) {
                value = value.toLowerCase();

                if (photon.object.toBoolean.map.hasOwnProperty(value)) {
                    return photon.object.toBoolean.map[value];
                }
            }

            return value ? true : false;
        },

        toNullableBoolean:function (value) {
            return photon.isNullOrUndefined(value) ? null : photon.object.toBoolean(value);
        },

        toText:function (value) {
            // names toText to work around stupid IE issues with naming methods toString!!
            return "" + value;
        },

        toNullableText:function (value) {
            return photon.isNullOrUndefined(value) ? null : photon.object.toString(value);
        },

        toNumber:function (value) {
            return Number(value);
        },

        toNullableNumber:function (value) {
            var result = Number(value);
            if (result === 0 && photon.string.isWhiteSpace(value)) {
                return null;
            }
            return result;
        },
        equals:function (x, y, stack) {
            stack = stack || [];
            if (x === y) {
                return x !== 0 || 1 / x == 1 / y;
            }

            if (photon.isNullOrUndefined(x) || photon.isNullOrUndefined(y)) {
                return x === y;
            }

            // Unwrap any wrapped objects.
            if (x._chain) {
                x = x._wrapped;
            }
            if (y._chain) {
                y = y._wrapped;
            }

            if (x.equals && _.isFunction(x.equals)) {
                return x.equals(y);
            }

            if (y.equals && _.isFunction(y.equals)) {
                return y.equals(x);
            }

            // Compare `[[Class]]` names.
            var className = objectNativePrototype.toString.call(x);
            if (className !== objectNativePrototype.toString.call(y)) {
                return false;
            }

            switch (className) {
                // Strings, numbers, dates, and booleans are compared by value.
                case '[object String]':
                    // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
                    // equivalent to `new String("5")`.
                    return x === String(y);
                case '[object Number]':
                    // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
                    // other numeric values.
                    return x !== +x ? y !== +y : (x === 0 ? 1 / x === 1 / y : x === +y);
                case '[object Date]':
                case '[object Boolean]':
                    // Coerce dates and booleans to numeric primitive values. Dates are compared by their
                    // millisecond representations. Note that invalid dates with millisecond representations
                    // of `NaN` are not equivalent.
                    return +x === +y;
                // RegExps are compared by their source patterns and flags.
                case '[object RegExp]':
                    return x.source === y.source && x.global === y.global &&
                        x.multiline === y.multiline && x.ignoreCase === y.ignoreCase;
            }

            if (typeof x !== 'object' || typeof y !== 'object') {
                return false;
            }

            // Assume equality for cyclic structures. The algorithm for detecting cyclic
            // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
            var length = stack.length;
            while (length--) {
                // Linear search. Performance is inversely proportional to the number of
                // unique nested structures.
                if (stack[length] === x) {
                    return true;
                }
            }

            // Add the first object to the stack of traversed objects.
            stack.push(x);

            var size = 0, result = true;

            // Recursively compare objects and arrays.
            if (className === '[object Array]') {
                // Compare array lengths to determine if a deep comparison is necessary.
                size = x.length;
                result = size === y.length;
                if (result) {
                    // Deep compare the contents, ignoring non-numeric properties.
                    while (size--) {
                        // Ensure commutative equality for sparse arrays.
                        if (!(result = size in x === size in y && photon.object.equals(x[size], y[size], stack))) {
                            break;
                        }
                    }
                }
            } else {
                // Objects with different constructors are not equivalent.
                if ('constructor' in x !== 'constructor' in y || x.constructor !== y.constructor) {
                    return false;
                }

                // Deep compare objects.
                for (var key in x) {
                    if (x.hasOwnProperty(key)) {
                        // Count the expected number of properties.
                        size++;
                        // Deep compare each member.
                        if (!(result = y.hasOwnProperty(key) && photon.object.equals(x[key], y[key], stack))) {
                            break;
                        }
                    }
                }
                // Ensure that both objects contain the same number of properties.
                if (result) {
                    for (key in y) {
                        if (y.hasOwnProperty(key) && !(size--)) {
                            break;
                        }
                    }
                    result = !size;
                }
            }

            // Remove the first object from the stack of traversed objects.
            stack.pop();

            return result;
        },
        getPropertyNames:function (obj) {
            var result = [], i = 0;
            for (var property in obj) {
                result[i++] = property;
            }
            return result;
        },
        getOwnPropertyNames:function (obj) {
            var result = [], i = 0;
            for (var property in obj) {
                if (obj.hasOwnProperty(property)) {
                    result[i++] = property;
                }
            }

            return result;
        },
        forEachOwnProperty:function(obj, callback, thisObj) {
            for (var propertyName in obj) {
                if (obj.hasOwnProperty(propertyName)) {
                    callback.call(thisObj, propertyName);
                }
            }
        }

    });

photon.object.toBoolean.map = {
    "true":true,
    "yes":true,
    "1":true,
    "y":true,
    "false":false,
    "no":false,
    "0":false,
    "n":false
};