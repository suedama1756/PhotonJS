(function (window) {
    (function(factory) {
        // Support three module loading scenarios
        if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
            // CommonJS/Node.js
            factory(module['exports'] || exports);
        } else if (typeof define === 'function' && define['amd']) {
            // AMD anonymous module
            define(['exports', "jquery"], factory);
        } else {
            // No module loader - put directly in global namespace
            window.photon = window.photon || {};
            factory(window.photon, window.$);
        }
    })(function(photon, $) {

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
	    }) ? /\bsuperType\b/ : /.*/;
	
	    function createDescendantFunction(fn, superType) {
	        return function () {
	            var oldSuperType = this.superType;
	
	            this.superType = superType;
	            try {
	                return fn.apply(this, arguments);
	            }
	            finally {
	                this.superType = oldSuperType;
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
	
	        if (instanceProperties) {
	
	            // Copy the properties over onto the new prototype
	            photon.extend(type.prototype, instanceProperties,
	                photon.extend.filterHasOwnProperty, function (source, propertyName) {
	                    var propertyValue = source[propertyName];
	                    var isFunctionThatCallsSuper = ancestor && photon.isFunction(propertyValue) &&
	                        fnTest.test(propertyValue);
	                    return isFunctionThatCallsSuper ?
	                        createDescendantFunction(propertyValue, superType) :
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
	/** @namespace photon.string */
	provide("photon.string",
	    /**
	     * @lends photon.string
	     */
	    {
	        /**
	         * Empty string
	         * @type {String}
	         * @const
	         */
	        EMPTY:"",
	
	        format:function (format /* arg1, arg2... */) {
	            if (arguments.length === 0) {
	                return undefined;
	            }
	
	            if (arguments.length === 1) {
	                return format;
	            }
	
	            var args = $.makeArray(arguments).slice(1);
	            return format.replace(/\{\{|\}\}|\{(\d+)\}/g, function (m, n) {
	                if (m === "{{") {
	                    return "{";
	                }
	                if (m === "}}") {
	                    return "}";
	                }
	                return args[n];
	            });
	        },
	
	        isWhiteSpace:function (value) {
	            return !/[^\t\n\r ]/.test(value);
	        },
	
	        trim:stringNativePrototype && stringNativePrototype.trim ?
	            function (value) {
	                return stringNativePrototype.trim.call(value);
	            } :
	            function (value) {
	                return value.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
	            },
	
	        split:("-A-B-A-C".split(/-(A)-/).length === 5) ?
	            function (str, separator, limit) {
	                return stringNativePrototype.split.call(str, separator, limit);
	            } :
	            (function () {
	                // ********************************************************************
	                // Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
	                // Available under the MIT License
	                // ********************************************************************
	                var compliantExecNpcg = /()??/.exec("")[1] === undefined;
	                var makeConsistentCG = function () {
	                    for (var i = 1; i < arguments.length - 2; i++) {
	                        if (arguments[i] === undefined) {
	                            match[i] = undefined;
	                        }
	                    }
	                };
	
	                return function (str, separator, limit) {
	                    // If `separator` is not a regex, use `nativeSplit`
	                    if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
	                        return stringNativePrototype.split.call(str, separator, limit);
	                    }
	
	                    var output = [],
	                        flags = (separator.ignoreCase ? "i" : "") +
	                            (separator.multiline ? "m" : "") +
	                            (separator.extended ? "x" : "") + // Proposed for ES6
	                            (separator.sticky ? "y" : ""), // Firefox 3+
	                        lastLastIndex = 0, separator2, match, lastIndex, lastLength;
	                    separator = new RegExp(separator.source, flags + "g");
	                    str += ""; // Type-convert
	                    if (!compliantExecNpcg) {
	                        // Doesn't need flags gy, but they don't hurt
	                        separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
	                    }
	                    /* Values for `limit`, per the spec:
	                     * If undefined: 4294967295 // Math.pow(2, 32) - 1
	                     * If 0, Infinity, or NaN: 0
	                     * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
	                     * If negative number: 4294967296 - Math.floor(Math.abs(limit))
	                     * If other: Type-convert, then use the above rules
	                     */
	                    limit = limit === undefined ?
	                        -1 >>> 0 : // Math.pow(2, 32) - 1
	                        limit >>> 0; // ToUint32(limit)
	                    while ((match = separator.exec(str))) {
	                        // `separator.lastIndex` is not reliable cross-browser
	                        lastIndex = match.index + match[0].length;
	                        if (lastIndex > lastLastIndex) {
	                            output.push(str.slice(lastLastIndex, match.index));
	                            // Fix browsers whose `exec` methods don't consistently return `undefined` for
	                            // nonparticipating capturing groups
	                            if (!compliantExecNpcg && match.length > 1) {
	                                match[0].replace(separator2, makeConsistentCG);
	                            }
	                            if (match.length > 1 && match.index < str.length) {
	                                Array.prototype.push.apply(output, match.slice(1));
	                            }
	                            lastLength = match[0].length;
	                            lastLastIndex = lastIndex;
	                            if (output.length >= limit) {
	                                break;
	                            }
	                        }
	                        if (separator.lastIndex === match.index) {
	                            separator.lastIndex++; // Avoid an infinite loop
	                        }
	                    }
	                    if (lastLastIndex === str.length) {
	                        if (lastLength || !separator.test("")) {
	                            output.push("");
	                        }
	                    } else {
	                        output.push(str.slice(lastLastIndex));
	                    }
	                    return output.length > limit ? output.slice(0, limit) : output;
	                };
	            })()
	    });
	/** @namespace photon.errors */
	provide("photon.errors", {
	    notImplemented:function() {
	        return new Error("Not implemented");
	    },
	    objectDisposed:function() {
	        return new Error("Object disposed");
	    }
	});
	
	var assert = function(value, message /* ,args... */) {
	    if (!value) {
	        throw new Error(message ?
	            photon.string.format.apply(null, [message].concat(arrayNativePrototype.slice.call(arguments, 2))) :
	            "Value required.");
	    }
	    return value;
	};
	
	photon.assert = assert;
	/** @namespace photon.expression */
	provide("photon.expression");
	
	photon.expression.makeScoped  = function(expression, scopes) {
	    var body = expression;
	    for (var i = scopes.length -1; i >= 0; i--) {
	        body = "with(" + scopes[i] + ") { " + body + " } ";
	    }
	    return body;
	};
	/** @namespace photon.functions */
	provide("photon.functions");
	
	photon.functions.makeScoped = function(expression, scopes, args) {
	    if (arguments.length < 3) {
	        args = scopes;
	    }
	
	    return new Function(args, photon.expression.makeScoped(expression, scopes));
	};
	/**
	 * @param {Array} data
	 * @return {Object}
	 */
	function createDiffData(data) {
	    return { length:data.length, data:data, modified:[] };
	}
	
	/**
	 * Finds the Shortest Middle Snake (SMS).
	 * @param {Object} dataA
	 * @param {Number} lowerA
	 * @param {Number} upperA
	 * @param {Object} dataB
	 * @param {Number} lowerB
	 * @param {Number} upperB
	 * @param {Function} equals
	 * @return {Object}
	 */
	function sms(dataA, lowerA, upperA, dataB, lowerB, upperB, equals) {
	    var ret = {}, MAX = dataA.length + dataB.length + 1,
	        downK = lowerA - lowerB, // the k-line to start the forward search
	        upK = upperA - upperB, // the k-line to start the reverse search
	        delta = (upperA - lowerA) - (upperB - lowerB),
	        oddDelta = (delta & 1) !== 0,
	        downDelta = new Array(2 * MAX + 2), // vector for the (0,0) to (x,y) search
	        upVector = new Array(2 * MAX + 2), // vector for the (u,v) to (N,M) search
	        downOffset = MAX - downK,
	        upOffset = MAX - upK,
	        maxD = ((upperA - lowerA + upperB - lowerB) / 2) + 1;
	
	    // init vectors
	    downDelta[downOffset + downK + 1] = lowerA;
	    upVector[upOffset + upK - 1] = upperA;
	    var x, y;
	    for (var D = 0; D <= maxD; D++) {
	        // Extend the forward path.
	        for (var k = downK - D; k <= downK + D; k += 2) {
	            // find the only or better starting point
	            if (k === downK - D) {
	                x = downDelta[downOffset + k + 1]; // down
	            } else {
	                x = downDelta[downOffset + k - 1] + 1; // a step to the right
	                if ((k < downK + D) && (downDelta[downOffset + k + 1] >= x)) {
	                    x = downDelta[downOffset + k + 1]; // down
	                }
	            }
	            y = x - k;
	
	            // find the end of the furthest reaching forward D-path in diagonal k.
	            while (x < upperA && y < upperB && equals(dataA.data[x], dataB.data[y])) {
	                x++;
	                y++;
	            }
	            downDelta[downOffset + k] = x;
	
	            // overlap ?
	            if (oddDelta && (upK - D < k) && (k < upK + D)) {
	                if (upVector[upOffset + k] <= downDelta[downOffset + k]) {
	                    ret.x = downDelta[downOffset + k];
	                    ret.y = downDelta[downOffset + k] - k;
	                    return (ret);
	                }
	            }
	        }
	
	        // Extend the reverse path.
	        for (k = upK - D; k <= upK + D; k += 2) {
	            if (k === upK + D) {
	                x = upVector[upOffset + k - 1]; // up
	            } else {
	                x = upVector[upOffset + k + 1] - 1; // left
	                if (k > upK - D && upVector[upOffset + k - 1] < x) {
	                    x = upVector[upOffset + k - 1]; // up
	                }
	            }
	            y = x - k;
	
	            while (x > lowerA && y > lowerB && equals(dataA.data[x - 1], dataB.data[y - 1])) {
	                x--;
	                y--; // diagonal
	            }
	            upVector[upOffset + k] = x;
	
	            // overlap ?
	            if (!oddDelta && downK - D <= k && k <= downK + D) {
	                if (upVector[upOffset + k] <= downDelta[downOffset + k]) {
	                    ret.x = downDelta[downOffset + k];
	                    ret.y = downDelta[downOffset + k] - k;
	                    return (ret);
	                }
	            }
	        }
	    }
	    assert(false);
	}
	
	/**
	 * This is the divide-and-conquer implementation of the longest common-sub-sequence (LCS)
	 * algorithm.
	 *
	 * @param {Array} dataA
	 * @param {Number} lowerA
	 * @param {Number} upperA
	 * @param {Array} dataB
	 * @param {Number} lowerB
	 * @param {Number} upperB
	 * @param {Function} equals
	 */
	function lcs(dataA, lowerA, upperA, dataB, lowerB, upperB, equals) {
	    // Fast walk through equal items at the start
	    while (lowerA < upperA && lowerB < upperB && equals(dataA.data[lowerA], dataB.data[lowerB])) {
	        lowerA++;
	        lowerB++;
	    }
	
	    // Fast walk through equal lines at the end
	    while (lowerA < upperA && lowerB < upperB && equals(dataA.data[upperA - 1], dataB.data[upperB - 1])) {
	        --upperA;
	        --upperB;
	    }
	
	    if (lowerA === upperA) {
	        // mark as inserted lines.
	        while (lowerB < upperB) {
	            dataB.modified[lowerB++] = true;
	        }
	
	    } else if (lowerB === upperB) {
	        // mark as deleted lines.
	        while (lowerA < upperA) {
	            dataA.modified[lowerA++] = true;
	        }
	
	    } else {
	        // Find the middle snake and length of an optimal path for A and B
	        var smsResult = sms(dataA, lowerA, upperA, dataB, lowerB, upperB, equals);
	
	        // The path is from LowerX to (x,y) and (x,y) to UpperX
	        lcs(dataA, lowerA, smsResult.x, dataB, lowerB, smsResult.y, equals);
	        lcs(dataA, smsResult.x, upperA, dataB, smsResult.y, upperB, equals);
	    }
	}
	
	/**
	 * @param {object} dataA
	 * @param {object} dataB
	 * @returns {Array}
	 */
	function createDiffs(dataA, dataB) {
	    var result = [],
	        startA, startB,
	        lineA = 0, lineB = 0,
	        lengthA = dataA.length,
	        lengthB = dataB.length;
	
	    while (lineA < lengthA || lineB < lengthB) {
	        if ((lineA < lengthA) && (!dataA.modified[lineA]) && (lineB < lengthB) && (!dataB.modified[lineB])) {
	            // equal lines
	            lineA++;
	            lineB++;
	
	        } else {
	            // maybe deleted and/or inserted lines
	            startA = lineA;
	            startB = lineB;
	            while (lineA < lengthA && (lineB >= lengthB || dataA.modified[lineA])) {
	                lineA++;
	            }
	
	            while (lineB < lengthB && (lineA >= lengthA || dataB.modified[lineB])) {
	                lineB++;
	            }
	
	            if (startA < lineA || startB < lineB) {
	                result.push({
	                    startA:startA,
	                    startB:startB,
	                    deletedA:lineA - startA,
	                    insertedB:lineB - startB
	                });
	            }
	        }
	    }
	    return result;
	}
	
	
	/** @namespace photon.array */
	provide("photon.array",
	    /**
	     * @lends photon.array
	     */
	    {
	        find:function (array, fromIndex, fn, obj) {
	            var i = photon.array.findIndex(array, fromIndex, fn, obj);
	            return i !== -1 ? array[i] : null;
	        },
	        findIndex:function (array, fromIndex, fn, obj) {
	            if (photon.isFunction(fromIndex)) {
	                obj = fn; fn = fromIndex; fromIndex = 0;
	            }
	            for (var i = fromIndex, n = array.length; i < n; i++) {
	                var item = array[i];
	                if (fn.call(obj, item, i, array)) {
	                    return i;
	                }
	            }
	            return -1;
	        },
	        map:arrayNativePrototype &&
	            arrayNativePrototype.map ?
	            function (array, mapper, obj) {
	                return arrayNativePrototype.map.call(array, mapper, obj);
	            } :
	            function (array, mapper, obj) {
	                var length = array.length, result = new Array(length),
	                    actualArray = photon.isString(array) ? array.split('') : array;
	                for (var i = 0; i < length; i++) {
	                    if (i in actualArray) {
	                        result[i] = mapper.call(obj, actualArray[i], i, array);
	                    }
	                }
	                return result;
	            },
	        filter:arrayNativePrototype &&
	            arrayNativePrototype.filter ?
	            function (array, filter, obj) {
	                return arrayNativePrototype.filter.call(array, filter, obj);
	            } :
	            function (array, filter, obj) {
	                var arrayLength = array.length;
	                var result = [];
	                var resultIndex = 0;
	                var arrayToFilter = photon.isString(array) ? array.split('') : array;
	                for (var index = 0; index < arrayLength; index++) {
	                    if (index in arrayToFilter) {
	                        var value = arrayToFilter[index];  // in case array is mutated by filter
	                        if (filter.call(obj, value, index, array)) {
	                            result[resultIndex++] = value;
	                        }
	                    }
	                }
	                return result;
	            },
	        forEach:arrayNativePrototype && arrayNativePrototype.forEach ?
	            function (array, fn, obj) {
	                arrayNativePrototype.forEach.call(array, fn, obj);
	            } :
	            function (array, fn, obj) {
	                array = photon.isString(array) ? array.split('') : array;
	                for (var i = 0, n = array.length; i < n; i++) {
	                    if (i in array) {
	                        fn.call(obj, array[i], i, array);
	                    }
	                }
	            },
	        indexOf:arrayNativePrototype && arrayNativePrototype.indexOf ?
	            function (array, item, fromIndex) {
	                return arrayNativePrototype.indexOf.call(array, item, fromIndex);
	            } :
	            function (array, item, fromIndex) {
	                fromIndex = photon.isNullOrUndefined(fromIndex) ? 0
	                    : (fromIndex < 0 ? Math.max(0, array.length + fromIndex) : fromIndex);
	
	                if (photon.isString(array)) {
	                    // Array.prototype.indexOf uses === so only strings should be found.
	                    if (!photon.isString(item) || item.length !== 1) {
	                        return -1;
	                    }
	                    return array.indexOf(item, fromIndex);
	                }
	
	                for (var i = fromIndex, n = array.length; i < n; i++) {
	                    if (i in array && array[i] === item) {
	                        return i;
	                    }
	                }
	                return -1;
	            },
	        removeDuplicates:function (array, returnArray, selector, thisObj) {
	            if (photon.isFunction(returnArray)) {
	                thisObj = selector;
	                selector = returnArray;
	                returnArray = null;
	            }
	
	            returnArray = returnArray || array;
	
	            var map = {}, insertIndex = 0, readIndex = 0;
	            while (readIndex < array.length) {
	                var current = array[readIndex++];
	
	                // use selector if supplied
	                if (selector) {
	                    current = selector.call(thisObj, current);
	                }
	
	                // map to key
	                var currentType = typeof current;
	                var key = currentType === 'object' && current !== null ?
	                    'o' + photon.getUID(current) :
	                    currentType.charAt(0) + current;
	
	                // lookup and add if not there
	                if (!map.hasOwnProperty(key)) {
	                    map[key] = true;
	                    returnArray[insertIndex++] = current;
	                }
	            }
	            returnArray.length = insertIndex;
	        },
	        /**
	         * Returns the differences between two arrays
	         * @param {Array} a
	         * @param {Array} b
	         * @returns {Array}
	         */
	        diff:function (a, b, equals) {
	            var dataA = createDiffData(a),
	                dataB = createDiffData(b);
	
	            lcs(dataA, 0, dataA.length, dataB, 0, dataB.length, equals || function (a, b) {
	                return a === b;
	            });
	            return createDiffs(dataA, dataB);
	        },
	        toArray:function (arrayLike,fromIndex, length) {
	            if (photon.isArray(arrayLike)) {
	                return arrayLike;
	            }
	            var result = [];
	            fromIndex = fromIndex || 0;
	            if (photon.isUndefined(length)) {
	                length = arrayLike.length - fromIndex;
	            }
	            for (var i = fromIndex; i < length; i++) {
	                result[i] = arrayLike[i];
	            }
	            return result;
	        },
	        remove:function (array, item) {
	            var index = photon.array.indexOf(array, item);
	            if (index !== -1) {
	                array.splice(index, 1);
	                return true;
	            }
	            return false;
	        }
	    });
	photon.StringBuilder = function () {
	    this.bufferLength_ = 0;
	    this.buffer_ = [];
	};
	
	photon.defineType(photon.StringBuilder, {
	    getLength:function () {
	        return this.toString().length;
	    },
	    clear:function () {
	        this.bufferLength_ = this.buffer_.length = 0;
	    },
	    push:function (value) {
	        this.buffer_[this.bufferLength_++] = value;
	    },
	    pushAll:function (values) {
	        for (var i = 0, n = values.length; i < n; i++) {
	            this.push(values[i]);
	        }
	    },
	    get:function () {
	        var result = this.buffer_.join('');
	        this.set(result);
	        return result;
	    },
	    set:function (value) {
	        this.clear();
	        this.push(value);
	    }
	});
	/** @namespace photon.dom */
	provide("photon.dom");
	
	photon.dom.wrap = function(element, tagName, doc) {
	    doc = doc || document;
	    var result = doc.createElement(tagName);
	    result.appendChild(element);
	    return result;
	};
	
	photon.dom.getHtml = function(node) {
	    if (photon.isDocumentFragment(node)) {
	        // must lift into "real" element to get innerHTML
	        var tempDiv = document.createElement("div");
	        tempDiv.appendChild(node);
	
	        // save html
	        var result = tempDiv.innerHTML;
	
	        // move content back again
	        while (tempDiv.firstChild) {
	            node.appendChild(tempDiv.firstChild);
	        }
	
	        return result;
	    }
	    return node.innerHTML;
	}
	
	var parseHtmlWrapper = {
	        option: [ 1, "<select multiple='multiple'>", "</select>" ],
	        legend: [ 1, "<fieldset>", "</fieldset>" ],
	        thead: [ 1, "<table>", "</table>" ],
	        tr: [ 2, "<table><tbody>", "</tbody></table>" ],
	        td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
	        col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
	        area: [ 1, "<map>", "</map>" ]
	    };
	parseHtmlWrapper.optgroup =
	    parseHtmlWrapper.option;
	parseHtmlWrapper.tbody =
	    parseHtmlWrapper.tfoot =
	    parseHtmlWrapper.colgroup =
	    parseHtmlWrapper.caption =
	    parseHtmlWrapper.thead;
	parseHtmlWrapper.th =
	    parseHtmlWrapper.td;
	
	photon.dom.htmlToFragmentOrNode = function (html, doc) {
	    doc = doc || document;
	
	    var container = doc.createElement("div"),
	        match = html.match(/^\s*<(t[dhr]|tbody|tfoot|thead|option|legend|col|area|optgroup|colgroup|caption)/i);
	    if (match){
	        var wrapper = parseHtmlWrapper[match[1].toLowerCase()],
	            wrapperDepth = wrapper[0];
	        container.innerHTML = wrapper[1] + html + wrapper[2];
	        while (wrapperDepth--) {
	            container = container.lastChild;
	        }
	    }
	    else {
	        container.innerHTML = '<br>' + html;
	        container.removeChild(container.firstChild);
	    }
	
	    // convert to fragment
	    if (container.childNodes.length === 1) {
	        return (container.removeChild(container.firstChild));
	    } else {
	        var fragment = doc.createDocumentFragment();
	        while (container.firstChild) {
	            fragment.appendChild(container.firstChild);
	        }
	        return fragment;
	    }
	};
	
	photon.dom.findParent = function(element, predicate, obj) {
	    if (!element) {
	        return null;
	    }
	    var parent = element.parentNode;
	    while (parent && !predicate.call(obj, parent, element)) {
	        parent = parent.parentNode;
	    }
	    return parent;
	};
	
	/**
	 * Gets or sets whether a HTMLElement has focus.
	 * @param {HTMLElement|DocumentView} element
	 * @param {boolean} [value]
	 */
	photon.dom.hasFocus = function (element, value) {
	    if (arguments.length === 1) {
	        return (element === document.activeElement);
	    }
	    else if (value) {
	        element.focus();
	    }
	    else {
	        element.blur();
	    }
	};
	
	(function () {
	    var jQueryAvailable = !photon.isNullOrUndefined($);
	    var cleanupSubscribers = [];
	
	    var cleanupNode = function(node)  {
	        for (var i= 0, n=cleanupSubscribers.length; i<n; i++) {
	            cleanupSubscribers[i](node);
	        }
	        if (node.nodeType === 1 || node.nodeType === 9) {
	            node.photonData = undefined;
	        }
	    };
	
	    var cleanupNodes = function(nodes)  {
	        nodes = photon.array.toArray(nodes);
	        for (var i = 0, n = nodes.length; i < n; i++) {
	            cleanupNode(nodes[i]);
	        }
	    };
	
	    if (jQueryAvailable) {
	        if (!$.cleanData) {
	            throw new Error("Could not override jQuery 'cleanData'!!");
	        }
	
	        // hook into jquery data cleanup
	        var oldCleanData = $.cleanData;
	        $.cleanData = function (elems) {
	            cleanupNodes(elems);
	            oldCleanData(elems);
	        };
	    }
	
	    photon.dom.subscribeToCleanup = function(callback) {
	        cleanupSubscribers.push(callback);
	    };
	
	    photon.dom.cleanNodes = function(nodes) {
	        for (var i= 0,n=nodes.length;i<n;i++) {
	            this.cleanNode(nodes[i]);
	        }
	    };
	
	    photon.dom.remove = function(node) {
	        var parentNode = node.parentNode;
	        if (parentNode) {
	            parentNode.removeChild(node);
	        }
	    };
	
	    photon.dom.removeAndClean = function(node) {
	        photon.dom.remove(node);
	        photon.dom.cleanNode(node);
	    };
	
	    photon.dom.cleanNode = jQueryAvailable ?
	        function(node) {
	            if (node.nodeType === 1 || node.nodeType === 9) {
	                $.cleanData(node.getElementsByTagName("*"));
	            }
	             $.cleanData([node]);
	        } :
	        function(node) {
	            if (node.nodeType === 1 || node.nodeType === 9) {
	                cleanupNodes(node.getElementsByTagName("*"));
	            }
	            cleanupNode(node);
	        };
	
	    photon.dom.empty = function(node) {
	        while (node.firstChild ) {
	            photon.dom.cleanNode(node.firstChild);
	            node.removeChild(node.firstChild );
	        }
	    };
	})();
	/** @namespace photon.events */
	provide("photon.events", {
	    // jQuery events are dog slow on IE so we'll invert our dependency and hopefully put in something faster at some point
	    add : function(target, events, data, handler) {
	        $(target).on(events, data, handler);
	    }
	});
	/** @namespace photon.observable **/
	provide("photon.observable");
	
	photon.observable.unwrap = function(value) {
	    if (photon.isNullOrUndefined(value)) {
	        return value;
	    }
	
	    if (value.isObservable === true && value.unwrap) {
	        return value.unwrap(value);
	    }
	
	    return value;
	};
	var metaDataRecursion = 0;
	
	/** @namespace photon.observable.model */
	provide("photon.observable.model",
	    {
	        createPropertyChangeNotifier_:function (name) {
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
	
	            if (photon.isString(property.beforeChange)) {
	                property.beforeChange = this.createPropertyChangeNotifier_(property.beforeChange);
	            }
	            if (photon.isString(property.afterChange)) {
	                property.afterChange = this.createPropertyChangeNotifier_(property.afterChange);
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
	                if (property.beforeChange) {
	                    property.beforeChange.call(this, oldValue, value);
	                }
	                for (var i = 0; i < extensions.length; i++) {
	                    extensions[i].beforeChange(this, property, oldValue, value);
	                }
	
	                this.propertyValues_[propertyName] = value;
	
	                // after change is for notification
	                if (property.afterChange) {
	                    property.afterChange.call(this, oldValue, value);
	                }
	                for (i = 0; i < extensions.length; i++) {
	                    extensions[i].afterChange(this, property, oldValue, value);
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
	/** @namespace photon.observable.model.types */
	provide("photon.observable.model.types");
	
	photon.extend(photon.observable.model.types, {
	    "Boolean":{
	        coerce:photon.object.toBoolean,
	        initialValue:false
	    },
	
	    "Boolean?":{
	        coerce:photon.object.toNullableBoolean,
	        initialValue:null
	    },
	
	    "String":{
	        coerce:photon.object.toText,
	        initialValue:""
	    },
	
	    "String?":{
	        coerce:photon.object.toNullableText,
	        initialValue:null
	    },
	
	    "Number":{
	        coerce:photon.object.toNumber,
	        initialValue:false
	    },
	
	    "Number?":{
	        coerce:photon.object.toNullableNumber,
	        initialValue:false
	    },
	
	    "ObservableArray": {
	        coerce:function(newValue, oldValue) {
	            if (photon.isNullOrUndefined(newValue)) {
	                return newValue;
	            }
	
	            if (!oldValue) {
	                oldValue = new photon.observable.Array();
	            }
	            oldValue.set(newValue);
	
	            return oldValue;
	        },
	        initializer:function() {
	            return new photon.observable.Array();
	        }
	    }
	});
	/**
	 *
	 * @param {object} owner
	 * @param {function} callback
	 * @param {object} [callbackTarget]
	 * @param {string} [propertyName]
	 * @param {*} [data]
	 */
	photon.observable.Subscriber = function (owner, callback, callbackTarget, propertyName, data) {
	    this.owner_ = owner;
	    this.callback_ = callback;
	
	    if (callbackTarget) {
	        this.callbackTarget_ = callbackTarget;
	    }
	
	    if (propertyName) {
	        this.propertyName_ = propertyName;
	    }
	
	    if (typeof data !== "undefined") {
	        this.data_ = data;
	    }
	};
	
	photon.extend(photon.observable.Subscriber.prototype, {
	    /**
	     * Disposes the subscriber
	     */
	    dispose:function () {
	        if (this.owner_) {
	            this.owner_.unsubscribe(this);
	        }
	        this.callback_ = null;
	        this.owner_ = null;
	    },
	    /**
	     * Invokes the subscribers callback with the specified event.
	     * @param {event} event The event.
	     */
	    notify:function (event) {
	        if (this.callback_) {
	            event.data = this.data_;
	            if (!this.propertyName_ || event.propertyName === this.propertyName_) {
	                this.callback_.call(this.callbackTarget_ || null, event);
	            }
	        }
	    },
	    /**
	     * Gets a value indicating whether the subscriber is subscribed to the specified owner and property
	     * @param {object} owner The owner
	     * @param {string} propertyName The property name.
	     * @returns {boolean}
	     */
	    isSubscribedTo : function(owner, propertyName) {
	        return this.owner_ === owner && this.propertyName_ === propertyName;
	    },
	    /**
	     * Gets the subscriber's owner
	     * @returns {object}
	     */
	    getOwner:function() {
	        return this.owner_;
	    },
	    /**
	     * Gets the subscriber's callback target
	     * @returns {string}
	     */
	    propertyName:function ()
	    {
	        return this.propertyName_;
	    },
	    /**
	     * Gets the subscriber's callback target
	     * @returns {object}
	     */
	    callbackTarget:function()
	    {
	        return this.callbackTarget_;
	    },
	    /**
	     * Gets the subscriber's callback function
	     * @returns {function(event)}
	     */
	    callback:function() {
	        return this.callback_;
	    },
	    /**
	     * Gets the subscriber's owner
	     * @returns {object}
	     */
	    data:function() {
	        return this.data_;
	    }
	});
	photon.defineType(
	    /**
	     * @param {Array} array
	     */
	    photon.observable.Array = function (array) {
	        this.array_ = array || [];
	    },
	    /**
	     * @lends photon.observable.Array.prototype
	     */
	    {
	        isObservable:true,
	        /**
	         * Pushes items into the array.
	         * @return {Object}
	         */
	        push:function () {
	            var newLength = arrayNativePrototype.push.apply(this.array_, arguments);
	            this.notifyChanged(true);
	            return newLength;
	        },
	        /**
	         * Removes the last item from the array
	         * @return {object} the removed item
	         */
	        pop:function () {
	            if (this.array_.length > 0) {
	                var removedItem = this.array_.pop();
	                this.notifyChanged(true);
	                return removedItem;
	            }
	
	            return undefined;
	        },
	        /**
	         * Removes the first item of the array.
	         * @return {object} the item that was removed.
	         */
	        shift:function () {
	            if (this.array_.length > 0) {
	                var removedItem = this.array_.shift();
	                this.notifyChanged(true);
	                return removedItem;
	            }
	
	            return undefined;
	        },
	        /**
	         * Adds  new items to the beginning of the array.
	         * @return {Object} Returns the new length, or in IE8 and below returns undefined.
	         */
	        unshift:function () {
	            var newLength = arrayNativePrototype.unshift.apply(this.array_, arguments);
	            this.notifyChanged(true);
	            return newLength;
	        },
	        /**
	         * Reverses the array
	         * @return {Array} returns this instance, sorted.
	         */
	        reverse:function () {
	            this.array_.reverse();
	            this.notifyChanged(false);
	            return this;
	        },
	        /**
	         * Sorts the array
	         * @param {function} compareFn, the optional comparer function.
	         * @return {Array} return this instance, sorted
	         */
	        sort:function (compareFn) {
	            this.array_.sort(compareFn);
	            this.notifyChanged(false);
	            return this;
	        },
	        /**
	         * Slices the array between the specified indexes.
	         * @param start
	         * @param end
	         * @return {photon.observable.Array} the sliced array.
	         */
	        slice:function (start, end) {
	            return new photon.observable.Array(this.array_.slice(start, end));
	        },
	        /**
	         * Splices the array between the specified indices.
	         * @param number
	         * @param deleteCount
	         * @return {Array} the items that were removed.
	         */
	        splice:function (number, deleteCount, items /* ... */) {
	            var array = this.array_,
	                oldLength = array.length;
	            var removedItems = arrayNativePrototype.splice.apply(array, arguments);
	            this.notifyChanged(array.length !== oldLength);
	            return removedItems;
	        },
	        set:function (value) {
	            if (this === value) {
	                return;
	            }
	
	            if (value) {
	                var unwrappedValue = photon.observable.unwrap(value);
	
	                // is the value changing?
	                if (this.array_ !== unwrappedValue) {
	                    var oldLength = this.length();
	
	                    if (!photon.isArray(unwrappedValue) || value !== unwrappedValue) {
	                        var array = [];
	                        for (var i = 0, n = unwrappedValue.length; i < n; i++) {
	                            array[i] = unwrappedValue[i];
	                        }
	                        unwrappedValue = array;
	                    }
	
	                    this.array_ = unwrappedValue;
	
	                    var lengthChanged = oldLength !== this.length();
	                    if (lengthChanged || oldLength > 0) {
	                        this.notifyChanged(lengthChanged);
	                    }
	                }
	            }
	            else if (this.length() > 0) {
	                this.set([]);
	            }
	
	        },
	        /**
	         * Removes the specified item from the array
	         * @param item
	         * @return {Boolean} true if the item was removed.
	         */
	        remove:function (item) {
	            var result = photon.array.remove(this.array_, item);
	            if (result) {
	                this.notifyChanged(true);
	            }
	
	            return result;
	        },
	        /**
	         * Concatenates the array with the items passed in.
	         * @param items
	         * @return {photon.observable.Array}
	         */
	        concat:function () {
	            return new photon.observable.Array(arrayNativePrototype.concat.apply(this.array_, arguments));
	        },
	        join:function (separator) {
	            return new photon.observable.Array(this.array_.join(separator));
	        },
	        valueOf:function () {
	            return this.array_.valueOf();
	        },
	        toString:function () {
	            return this.array_.toString();
	        },
	        getItem:function (index) {
	            return this.array_[index];
	        },
	        setItem:function (index, value) {
	            var oldLength = this.array_.length;
	            this.array_[index] = value;
	            this.notifyChanged(oldLength !== this.array_.length);
	        },
	        /**
	         *
	         * @param {function} callback
	         * @param {object} [callbackTarget]
	         * @param {string} [propertyName]
	         * @param {*} [data]
	         */
	        subscribe:function (callback, callbackTarget, data) {
	            this.subscribers_ = this.subscribers_ || [];
	            var result = new photon.observable.Subscriber(this, callback, callbackTarget, null, data);
	            this.subscribers_.push(result);
	            return result;
	        },
	        unsubscribe:function (subscriber) {
	            return photon.array.remove(this.subscribers_, subscriber);
	        },
	        notifyChanged:function (lengthChanged) {
	            var subscribers = this.subscribers_;
	            if (subscribers) {
	                subscribers = subscribers.slice(0);
	                photon.array.forEach(subscribers, function (item) {
	                    if (!item.propertyName() || (lengthChanged && item.propertyName() === 'length')) {
	                        item.notify({ data:{}}); // TODO: Why are we passing data here?
	                    }
	                });
	            }
	        },
	        forEach : function(callback, thisObj) {
	           photon.array.forEach(this.array_, callback, thisObj);
	        },
	        length:function () {
	            photon.observable.DependencyTracker.registerDependency(this, "length");
	            return this.array_.length;
	        },
	        indexOf:function (item, fromIndex) {
	            return photon.array.indexOf(this.array_, item, fromIndex);
	        },
	        findIndex:function (predicate, obj) {
	            return photon.array.findIndex(this.array_, predicate, obj);
	        },
	        unwrap:function () {
	            return this.array_;
	        }
	    });
	(function () {
	    var captures = [];
	    var currentCapture = null;
	
	    function indexOfSubscriber(subscribers, target, propertyName) {
	        if (subscribers) {
	            for (var i = 0, n = subscribers.length; i < n; i++) {
	                if (subscribers[i] && subscribers[i].isSubscribedTo(target, propertyName)) {
	                    return i;
	                }
	            }
	        }
	        return -1;
	    }
	
	    photon.defineType(
	        photon.observable.DependencyTracker = function (callback, callbackTarget) {
	            this.callbackTarget_ = callbackTarget;
	            this.callback_ = callback;
	            this.subscribers_ = null;
	        },
	        /**
	         * @lends photon.observable.DependencyTracker
	         */
	        {
	            dispose:function () {
	                this.resetSubscribers(null);
	                this.callback_ = this.callbackTarget_ = null;
	            },
	
	            resetSubscribers:function (subscribers) {
	                if (this.subscribers_) {
	                    for (var i = 0, n = this.subscribers_.length; i < n; i++) {
	                        if (this.subscribers_[i] !== null) {
	                            this.subscribers_[i].dispose();
	                        }
	                    }
	                }
	                this.subscribers_ = subscribers;
	            },
	
	            beginCapture:function () {
	//                if (currentCapture !== null) {
	//                    throw new Error("Nested capture scopes are not supported.");
	//                }
	                captures.push(currentCapture);
	                currentCapture = {
	                    tracker:this,
	                    subscribers:[]
	                };
	            },
	
	            endCapture:function () {
	                if (!(currentCapture && currentCapture.tracker === this)) {
	                    throw new Error("Tracker does not have capture.");
	                }
	                this.resetSubscribers(currentCapture.subscribers);
	                currentCapture = captures.pop();
	            }
	        },
	        {
	            registerDependency:function (source, propertyName) {
	                if (currentCapture !== null) {
	                    // has the dependency already been registered within the current capture?
	                    if (indexOfSubscriber(currentCapture.subscribers, source, propertyName) !== -1) {
	                        return;
	                    }
	
	                    // get tracker
	                    var tracker = currentCapture.tracker;
	
	                    // was the dependency registered in the previous capture?
	                    var i = indexOfSubscriber(tracker.subscribers_, source, propertyName);
	                    if (i !== -1) {
	                        // re-use the subscription
	                        currentCapture.subscribers.push(tracker.subscribers_[i]);
	                        tracker.subscribers_[i] = null;
	                    }
	                    else {
	                        // create a new subscription
	                        currentCapture.subscribers.push(source.subscribe(currentCapture.tracker.callback_,
	                            currentCapture.tracker.callbackTarget_, propertyName));
	                    }
	                }
	            }
	        });
	})();
	photon.observable.model.Extension = function() {
	
	};
	
	photon.defineType(
	    photon.observable.model.Extension,
	    {
	        define : function(definition) {
	        },
	        beforeChange : function(model, property, oldValue, newValue) {
	        },
	        afterChange : function(model, property, oldValue, newValue) {
	        }
	    });
	/** @namespace photon.binding */
	provide("photon.binding");
	
	(function () {
	    var bindingTypes = {};
	    var typeNames = [];
	
	    var evaluationDataContext;
	
	    var evaluationContext = {
	        $dataContext:function (indexOrName) {
	            var dataContext = evaluationDataContext
	                .get(indexOrName);
	            return dataContext ? dataContext.getValue() : null;
	        },
	        $imports:{
	            photon:photon
	        },
	        $metaData : photon.observable.model.metaData
	    };
	
	    photon.extend(photon.binding,
	        /**
	         * lends photon.binding
	         */
	        {
	            getBindingTagNames:function () {
	                // TODO:clone?
	                return typeNames;
	            },
	            getBindingType:function (tagName) {
	                return bindingTypes[tagName];
	            },
	            registerBindingType:function (tagName, bindingType) {
	                if (photon.array.indexOf(typeNames, tagName) === -1) {
	                    typeNames.push(tagName);
	                }
	
	                bindingTypes[tagName] = bindingType;
	            },
	            evaluateInContext:function (dataContext, fn, dependencyTracker, arg0, arg1, arg2) {
	                // get capture first as this operation may fail and we are always invoked before a try finally block
	                if (!photon.isNullOrUndefined(dependencyTracker)) {
	                    dependencyTracker.beginCapture();
	                }
	                evaluationDataContext = dataContext;
	
	                try {
	                    return fn(evaluationContext, dataContext.getValue(), arg0, arg1, arg2);
	                }
	                finally {
	                    evaluationDataContext = null;
	                    if (!photon.isNullOrUndefined(dependencyTracker)) {
	                        dependencyTracker.endCapture();
	                    }
	                }
	            },
	            updateBindings:function (element) {
	                if (!photon.isDocumentOrElement(element)) {
	                    return;
	                }
	
	                var bindingContext = photon.binding.BindingContext.getInstance();
	
	                photon.templating.prepareFlowTemplates(element);
	
	                photon.binding.forEachBoundElement(element, photon.binding.getBindingTagNames(),
	                    function (element, attributeName, attributeValue) {
	                        var expressions = bindingContext.parseBindingExpressions(attributeName, attributeValue);
	                        var bindings = [];
	                        var contexts = [];
	                        for (var i = 0, n = expressions.length; i < n; i++) {
	                            var expression = expressions[i];
	
	                            var nodeBindingInfo = photon.binding.NodeBindingInfo.getOrCreateForElement(element);
	
	                            var binding = nodeBindingInfo.getBindingByExpression(expression);
	                            if (!binding) {
	                                binding = expressions[i].createBinding(element);
	                                nodeBindingInfo.addBinding(binding);
	                            }
	
	                            if (expression instanceof photon.binding.data.DataBindingExpression &&
	                                expression.getPropertyType() === "data" && expression.getPropertyName() === "context") {
	                                contexts.push(binding);
	                            }
	                            else {
	                                bindings.push(binding);
	                            }
	                        }
	                        photon.array.forEach(contexts, function (binding) {
	                            binding.bind();
	                        });
	
	                        photon.array.forEach(bindings, function (binding) {
	                            binding.beginInitialize();
	                        });
	                        photon.array.forEach(bindings, function (binding) {
	                            binding.bind();
	                        });
	                        photon.array.forEach(bindings, function (binding) {
	                            binding.endInitialize();
	                        });
	                    });
	            },
	            // TODO: We use the parentDataContext in the template for-each to save looking it up, but why do we bother looking up parents
	            // for explicit data contexts, AH, so we can access them in the things!!
	            applyBindings:function (data, element, name, parentDataContext) {
	                if (photon.isString(element)) {
	                    parentDataContext = name;
	                    name = element;
	                    element = undefined;
	                }
	
	                if (!photon.isString(name)) {
	                    parentDataContext = name;
	                    name = undefined;
	                }
	
	                if (!element) {
	                    element = document.body;
	                }
	                if (!photon.isDocumentOrElement(element)) {
	                    return;
	                }
	
	                var dataContext = photon.binding.NodeBindingInfo.getOrCreateForElement(element)
	                    .getOrCreateDataContext();
	                dataContext.setParent(parentDataContext ||
	                    photon.binding.DataContext.getForElement(element.parentNode));
	                dataContext.setSource(data);
	                dataContext.setName(name);
	
	                photon.binding.updateBindings(element);
	            },
	
	            registerImport : function(name, value) {
	                evaluationContext.$imports[name] = value;
	            }
	        });
	})();
	photon.defineType(
	    photon.binding.BindingType = function () {
	    },
	    /**
	     * @lends photon.binding.BindingType.prototype
	     */
	    {
	        /**
	         * Gets the default target for the binding type
	         */
	        getDefaultExpressionType:function () {
	            throw photon.errors.notImplemented();
	        },
	        /**
	         * Gets the expression builder type
	         */
	        getExpressionBuilderType:function () {
	            throw photon.errors.notImplemented();
	        }
	    },
	    /**
	     * @lends photon.binding.BindingType
	     */
	    {
	        getBindingType : function(bindingType) {
	            if (bindingType instanceof photon.binding.BindingType) {
	                return bindingType;
	            }
	            return photon.binding.getBindingType(bindingType);
	        }
	    });
	photon.defineType(
	    photon.binding.BindingBase = function (target, expression) {
	        this.target_ = target;
	        this.expression_ = expression;
	    },
	    /**
	     * @lends photon.binding.BindingBase.prototype
	     */
	    {
	        dispose : function() {
	            this.target_ = null;
	            this.setDataContext(null);
	        },
	        getTarget:function () {
	            return this.target_;
	        },
	        beginInitialize:function() {
	            this.isInitializing_ = true;
	        },
	        endInitialize:function() {
	            this.isInitializing_ = false;
	        },
	        /**
	         *
	         * @return {photon.binding.BindingExpression}
	         */
	        getExpression:function () {
	            return this.expression_;
	        },
	        getDataContext:function () {
	            return this.dataContext_;
	        },
	        getDataSource:function () {
	            return this.dataSource_;
	        },
	        setDataContext:function (value) {
	            var oldValue = this.dataContext_;
	            if (oldValue !== value) {
	                // remove from previous data context
	                if (oldValue) {
	                    oldValue.removeSubscriber(this);
	                }
	
	                // add to new data context
	                if (value) {
	                    value.addSubscriber(this);
	                }
	
	                // assign
	                this.dataContext_ = value;
	
	                // notify
	                this.dataContextChanged();
	            }
	        },
	        dataContextValueChanged:function (dataContext, value) {
	            this.updateDataSource();
	        },
	        dataContextChanged:function () {
	            this.updateDataSource();
	        },
	        updateDataContext:function () {
	            // condition is hack to support detached dom's (why oh why did I not write a test case?)
	            if (this.target_.parentNode) {
	                this.setDataContext(
	                    photon.binding.DataContext.getForElement(this.getTarget()));
	            }
	        },
	        updateDataSource:function () {
	            // if the data context is null then the binding is either not initialized, or disposed.
	            if (this.dataContext_ === null) {
	                return;
	            }
	
	            var newValue = this.dataContext_.getValue();
	            if (newValue !== this.dataSource_) {
	                this.dataSource_ = newValue;
	                this.dataSourceChanged();
	            }
	        },
	        dataSourceChanged:function () {
	            /* for descendants */
	        }
	    });
	/**
	 * Creates a new instance of the photon.binding.BindingExpression type
	 *
	 * @param {Function} createBinding Function for creating a binding from the expression.
	 * @param {String} text The text of the expression.
	 * @constructor
	 */
	photon.binding.BindingExpression = function (createBinding, text) {
	    this.createBinding_ = createBinding;
	    this.text_ = text;
	};
	
	photon.defineType(
	    /**
	     * Constructor
	     */
	    photon.binding.BindingExpression,
	    /**
	     * @lends photon.binding.BindingExpression.prototype
	     */
	    {
	        /**
	         * Gets the text of the expression
	         *
	         * @return {String}
	         */
	        getText:function () {
	            return this.text_;
	        },
	        /**
	         * Creates a new binding instance for the expression
	         *
	         * @param {HTMLElement} element
	         * @return {photon.binding.BindingBase}
	         */
	        createBinding:function (element) {
	            return new this.createBinding_(element, this);
	        }
	    }
	);
	(function() {
	    var ARG_DATA = "$data", ARG_CONTEXT = "$context", ARG_VALUE = "$value";
	
	    /**
	     * Creates a new instance of the photon.binding.BindingExpressionBuilder type.
	     *
	     * @param {String} type The type of the expression, e.g. "flow", "property", "attribute", etc.
	     * @param {String} subtype The sub type of the expression, e.g. "if", "each", "innerText", etc.
	     * @constructor
	     */
	    photon.binding.BindingExpressionBuilder = function(type, subtype) {
	        /**
	         * The target type of the binding
	         * @type {string}
	         * @private
	         */
	        this.type_ = type;
	        /**
	         * The target of the binding
	         * @type {string}
	         * @private
	         */
	        this.subtype_ = subtype;
	    };
	
	    photon.defineType(
	        /**
	         * Constructor
	         */
	        photon.binding.BindingExpressionBuilder,
	        /**
	         * @lends photon.binding.BindingExpressionBuilder.prototype
	         */
	        {
	            getSourceOrThrow : function() {
	                var source = this.getSource();
	                if (!source) {
	                    throw new Error("Binding does not contain a valid source expression.");
	                }
	                return source;
	            },
	            setSource :function(value) {
	                this.source_ = value;
	            },
	            getSource:function() {
	                return this.source_;
	            },
	            /**
	             * Gets the type of the binding expression, for example: property, attribute, style, etc.
	             * @return {string}
	             */
	            getType : function() {
	                return this.type_;
	            },
	            /**
	             * Gets the target of the binding expression, for example: innerText, src, width, etc.
	             * @return {*}
	             */
	            getSubType : function() {
	                return this.subtype_;
	            },
	            /**
	             * Gets the full text of the binding expression
	             * @return {String}
	             */
	            getText : function() {
	                return this.text_;
	            },
	            /**
	             * Sets the full text of the binding expression
	             * @param {String} value
	             */
	            setText : function(value) {
	                this.text_ = photon.string.trim(value);
	            } ,
	            /**
	             * Generates a getter Function from the specified expression
	             * @param {String} expression
	             * @protected
	             */
	            makeGetter:function (expression) {
	                return photon.functions.makeScoped(
	                    photon.string.format("return ($imports.photon.observable.model.isPropertyAccessor({0})) ? {0}() : {0};", expression),
	                    [ARG_CONTEXT, ARG_DATA]);
	            },
	            /**
	             * Generates a setter Function from the specified expression
	             * @param {String} expression
	             * @protected
	             */
	            makeSetter:function (expression) {
	                return photon.functions.makeScoped(
	                    photon.string.format("if ($imports.photon.observable.model.isPropertyAccessor({0})) {0}({1}); else {0} = {1};", expression, ARG_VALUE),
	                    [ARG_CONTEXT, ARG_DATA],
	                    [ARG_CONTEXT, ARG_DATA, ARG_VALUE]);
	            },
	            /**
	             * Generates a setter Function from the specified expression
	             * @param {String} expression
	             * @param {String[]} args Additional arguments for the action
	             * @private
	             */
	            makeAction:function (expression, args) {
	                var ARG_CONTEXT = "$context", ARG_DATA = "$data", ARG_EVENT = "$event";
	                return photon.functions.makeScoped(expression, [ARG_CONTEXT, ARG_DATA], [ARG_CONTEXT, ARG_DATA].concat(args || []));
	            }
	        }
	    );
	})();
	photon.defineType(
	    photon.binding.BindingContext = function () {
	        this._cache = {};
	        this._bindingExpressionCache = {};
	    },
	    /**
	     * @lends photon.binding.BindingContext.prototype
	     */
	    {
	        nextId_:0,
	
	        identity:function (obj) {
	            var result = obj["photon.identity"];
	            if (!result) {
	                result = this.nextId_++;
	                obj["photon.identity"] = result;
	            }
	            this._cache[result] = obj;
	            return result;
	        },
	
	        parseBindingExpressions:function (bindingType, expression) {
	            bindingType = photon.binding.BindingType.getBindingType(bindingType);
	
	            var cacheKey = bindingType + "-" + expression;
	
	            return this._bindingExpressionCache[cacheKey] ||
	                (this._bindingExpressionCache[cacheKey] = new photon.binding.ExpressionParser(bindingType, expression).readAllRemaining());
	        },
	
	        lookup:function (id) {
	            return this._cache[id];
	        }
	    });
	
	photon.binding.BindingContext.getInstance = function() {
	    return photon.binding.BindingContext.instance_ ||
	        (photon.binding.BindingContext.instance_ = new photon.binding.BindingContext());
	};
	(function () {
	    /**
	     * Returns a value indicating whether the token is whitespace or an expression delimiter
	     * @param token
	     * @return {Boolean} true if the token is whitespace or an expression delimiter; otherwise, false.
	     * @private
	     */
	    var isWhiteSpaceOrExpressionDelimiter = function (token) {
	        return photon.string.isWhiteSpace(token) || token === TOKEN_EXPRESSION_DELIMITER;
	    };
	
	    /**
	     * Expression delimiter token
	     * @type {String}
	     * @constant
	     */
	    var TOKEN_EXPRESSION_DELIMITER = ',';
	    /**
	     * Expression start token
	     * @type {String}
	     * @constant
	     */
	    var TOKEN_EXPRESSION_START = '{';
	    /**
	     * Property assignment token
	     * @type {String}
	     * @constant
	     */
	    var TOKEN_PROPERTY_ASSIGNMENT = ':';
	    /**
	     * Expression end token
	     * @type {String}
	     * @constant
	     */
	    var TOKEN_EXPRESSION_END = '}';
	
	    /**
	     * Regular expression for determining if an expression is writable
	     * @private
	     */
	    var isWritableExpressionRegEx_ = /^[\_$a-z][\_$a-z0-9]*(\(\))?(\[.*?\])*(\(\))?(\.[\_$a-z][\_$a-z0-9]*(\(\))?(\[.*?\])*(\(\))?)*$/i;
	
	
	    photon.defineType(
	        /**
	         * Creates a new ExpressionParser instance for the specified expression.
	         * @constructor
	         * @param {String} expression The expression to parse.
	         */
	        photon.binding.ExpressionParser = function (bindingType, expression) {
	            this.tokenizer_ = new photon.binding.ExpressionTokenizer(expression);
	
	            this.bindingType_ = photon.isString(bindingType) ?
	                photon.binding.getBindingType(bindingType) :
	                bindingType;
	        },
	        /**
	         * @lends photon.binding.ExpressionParser.prototype
	         */
	        {
	            /**
	             * Reads the next expression.
	             * @return The first token encountered after skipping white space.
	             * @private
	             */
	            readExpression_:function (terminator) {
	                terminator = terminator || "";
	
	                // Expression parsing is not very sophisticated, no attempt is made to validate the expression at
	                // this stage. Nested expressions are handled simply by counting open group '{', '(', '[' and close
	                // group '}', ')', ']' characters.
	                var token, length = 0, depth = 0, tokenizer = this.tokenizer_,
	                    start = tokenizer.getPosition() - tokenizer.currentToken().length;
	
	                while ((token = this.tokenizer_.currentToken())) {
	                    if (!depth && (token === TOKEN_EXPRESSION_DELIMITER || token === TOKEN_EXPRESSION_END || token === terminator)) {
	                        break;
	                    }
	                    length += token.length;
	                    if ("{([".indexOf(token) !== -1) {
	                        depth++;
	                    } else if (")}]".indexOf(token) !== -1) {
	                        depth--;
	                    }
	                    tokenizer.nextToken();
	                }
	
	                var text = photon.string.trim(tokenizer.getText().
	                    substring(start, start + length));
	                return !token && !text ? null : {
	                    text:text,
	                    isWritable:isWritableExpressionRegEx_.test(text) &&
	                        text.charAt(text.length - 1) !== ")"
	                };
	            },
	            /**
	             * @returns {BindingExpressionBuilder} The binding expression builder for the specified target type
	             */
	            getExpressionBuilder:function (targetSpecification) {
	                // look for target type and target, if only the target is specified then get the default target type
	                var parts = targetSpecification.split('-', 2);
	                if (parts.length === 1) {
	                    parts.unshift(this.bindingType_.getDefaultExpressionType());
	                }
	
	                // get builder type
	                var expressionBuilderType = this.bindingType_.getExpressionBuilderType(parts[0]);
	
	                // create!!
	                return new expressionBuilderType(parts[0], parts[1]);
	            },
	            /**
	             * Reads the next binding expression
	             * @return The next binding expression, or undefined if there are no more binding expressions to read.
	             * @public
	             */
	            readNext:function () {
	                var token,
	                    propertyName,
	                    propertyCount = 0,
	                    tokenizer = this.tokenizer_,
	                    start=tokenizer.getPosition();
	
	                if (start) {
	                    start--;
	                }
	
	                if ((token = tokenizer.skipWhiteSpace()) === TOKEN_EXPRESSION_START) {
	                    token = tokenizer.skipWhiteSpace(true);
	                }
	
	                var expressionBuilder, expressionElement;
	                while (token) {
	                    expressionElement = null;
	                    if (propertyCount === 0) {
	                        // the name is option for the first property if the binding type supports default properties
	                        expressionElement = this.readExpression_(TOKEN_PROPERTY_ASSIGNMENT);
	                        if ((token = tokenizer.currentToken()) && token !== TOKEN_EXPRESSION_DELIMITER && token !== TOKEN_EXPRESSION_START) {
	                            // we didn't encounter a default expression, so set the property name and reset expression
	                            propertyName = expressionElement.text;
	                            expressionElement = null;
	                        }
	                        else {
	                            propertyName = this.bindingType_.getDefaultExpressionType(null);
	                        }
	
	                        expressionBuilder = this.getExpressionBuilder(propertyName);
	                    } else {
	                        propertyName = photon.string.trim(token);
	                        token = tokenizer.nextToken();
	                    }
	
	                    if (expressionElement === null) {
	                        if ((token = tokenizer.skipWhiteSpace()) !== TOKEN_PROPERTY_ASSIGNMENT) {
	                            this.throwUnexpectedToken(TOKEN_PROPERTY_ASSIGNMENT);
	                        }
	                        tokenizer.nextToken();
	                        expressionElement = this.readExpression_();
	                        token = tokenizer.currentToken();
	                    }
	
	                    if (propertyCount++ === 0) {
	                        expressionBuilder.setSource(expressionElement);
	                    }
	                    else {
	                        var setter = "set-" + propertyName;
	                        if (!photon.isFunction(expressionBuilder[setter])) {
	                            throw new Error(photon.string.format("Unsupported binding property {0}.", propertyName));
	                        }
	                        expressionBuilder[setter](expressionElement.text);
	                    }
	
	                    // if there are no more tokens, or the expression is terminated with a '}' then we are done
	                    var isComplete = !token || token === TOKEN_EXPRESSION_END;
	                    expressionBuilder.setText(tokenizer.getText().substring(start, tokenizer.getPosition()));
	
	                    // if not done then we are expecting a ','
	                    if (!isComplete && token !== TOKEN_EXPRESSION_DELIMITER) {
	                        this.throwUnexpectedToken(TOKEN_EXPRESSION_DELIMITER);
	                    }
	
	                    // skip any whitespaces or delimiters
	                    token = tokenizer.skipWhile(isWhiteSpaceOrExpressionDelimiter, true);
	                    if (isComplete) {
	                        break;
	                    }
	                }
	                return expressionBuilder ? expressionBuilder.build() : null;
	            },
	            throwUnexpectedToken:function (expectedTokens) {
	                var token = this.tokenizer_.currentToken();
	
	                throw new Error(photon.string.format('Unexpected token at or near position {0}, expected: \'{1}\', actual: \'{2}.\', expression\'{3}\'',
	                    this.tokenizer_.getPosition() - token.length, expectedTokens, token ? token : "EOF", this.tokenizer_.getText()));
	            },
	            /**
	             * Reads all of the remaining binding expressions
	             * @return An array containing all of the remaining binding expressions, if no binding expressions are read the
	             * array will be empty.
	             * @public
	             */
	            readAllRemaining:function () {
	                var bindings = [];
	                var binding;
	                while ((binding = this.readNext())) {
	                    bindings.push(binding);
	                }
	                return bindings;
	            }
	        }
	    );
	})();
	(function () {
	    /**
	     * Define the tokens we are interested in.
	     * @private
	     * @constant
	     */
	    var tokens = {
	        "{":"{",
	        "}":"}",
	        "(":"(",
	        ")":")",
	        ",":",",
	        ".":".",
	        ":":":",
	        ";":";",
	        "[":"[",
	        "]":"]"
	    };
	
	    /**
	     * Simple tokenizer for binding expressions
	     *
	     * @param {string} expression The expression to tokenize
	     */
	    photon.binding.ExpressionTokenizer = function (text) {
	        // The tokenizer is NOT a full javascript tokenizer, it goes just far enough for us to extract
	        // what we need for binding.
	        var position = 0;
	        var current;
	
	        /**
	         * Gets the expression being parsed by the tokenizer
	         * returns {String}
	         */
	        this.getText = function () {
	            return text;
	        };
	
	        /**
	         * Gets the current position of the tokenizer.
	         */
	        this.getPosition = function () {
	            return position;
	        };
	
	        this.currentToken = function () {
	            return current;
	        };
	
	        /**
	         * Gets the next token, or undefined if there are no more tokens.
	         */
	        this.nextToken = function () {
	            var start = position;
	            var c;
	            while ((c = text.charAt(position))) {
	                if (tokens.hasOwnProperty(c)) {
	                    if (position > start) {
	                        break;
	                    }
	
	                    position++;
	                    return (current = c);
	                }
	
	                if (c === "\"" || c === "\'") {
	                    if (position > start) {
	                        break;
	                    }
	
	                    position++;
	                    var terminator = c;
	                    while ((c = text.charAt(position++))) {
	                        if (c === terminator) {
	                            return (current = text.substring(start, position));
	                        } else if (c === "\\") {
	                            // TODO: perform proper escape character handling
	                            position++;
	                        }
	                    }
	
	                    throw new Error("Syntax error, unterminated string literal.");
	                }
	                position++;
	            }
	
	            return position > start ?
	                (current = text.substring(start, position)) :
	                (current = "");
	
	        };
	
	        /**
	         * Skips white space.
	         * @param {Boolean} [readNextToken] if true the next token is always consumed.
	         * @return {String} The first token encountered after skipping white space.
	         * @private
	         */
	        this.skipWhiteSpace = function (readNextToken) {
	            return this.skipWhile(photon.string.isWhiteSpace, readNextToken);
	        };
	
	        /**
	         * Reads characters until the predicate fails
	         * @param {Function(string}] predicate The predicate to use.
	         * @param @param {Boolean} readNextToken if true the next token is always consumed.
	         * @return {String}
	         */
	        this.readWhile = function (predicate, readNextToken) {
	            var length = 0, start = position,
	                token = readNextToken || !start ? this.nextToken() : current;
	
	            // read whilst condition is true
	            while (token && predicate(token)) {
	                length += (token = this.nextToken()).length;
	            }
	
	            return length > 0 ?
	                text.substring(start, start + length) :
	                "";
	        };
	
	        /**
	         * Skips tokens whilst the predicate condition is true;
	         * @param fn
	         * @param @param {Boolean} readNextToken if true the next token is always consumed.
	         * @return {*}
	         */
	        this.skipWhile = function (fn, readNextToken) {
	            var token = readNextToken || !position ? this.nextToken() : current;
	
	            // read whilst condition is true
	            while (token && fn(token)) {
	                token = this.nextToken();
	            }
	            return token;
	        };
	    };
	})();
	/** @namespace photon.binding.data */
	provide("photon.binding.data");
	photon.binding.data.DataBindingMode = {
	    /**
	     * @constant
	     */
	    Default:0,
	    /**
	     * @constant
	     */
	    OneWay:1,
	    /**
	     * @constant
	     */
	    TwoWay:2,
	    /**
	     * @constant
	     */
	    OneTime:3
	};
	/**
	 * Creates a new instance of the photon.binding.data.DataBinding type
	 * @param {HTMLElement} target
	 * @param {photon.binding.data.DataBindingExpression) expression
	 * @constructor
	 * @extends photon.binding.BindingBase
	 */
	photon.binding.data.DataBinding = function (target, expression) {
	    photon.binding.data.DataBinding.base(this, target, expression);
	};
	
	photon.defineType(
	    /**
	     * Constructor
	     */
	    photon.binding.data.DataBinding,
	    /**
	     * Ancestor
	     */
	    photon.binding.BindingBase,
	    /**
	     * @lends photon.binding.data.DataBinding.prototype
	     */
	    {
	        dispose : function() {
	            this.superType.dispose.call(this);
	            if (this.dependencyTracker_) {
	                this.dependencyTracker_.dispose();
	                this.dependencyTracker_ = null;
	            }
	        },
	        beginInitialize : function() {
	            photon.binding.data.DataBinding
	                .superType.beginInitialize.call(this);
	           this.getExpression().getPropertyHandler().beginInitialize(this);
	        },
	        endInitialize : function() {
	            photon.binding.data.DataBinding
	                .superType.endInitialize.call(this);
	            this.getExpression().getPropertyHandler().endInitialize(this);
	        },
	        bindUpdateSourceEvent:function (eventTypes) {
	            if (photon.isArray(eventTypes)) {
	                eventTypes = eventTypes.join(" ");
	            }
	            $(this.target_).bind(eventTypes, this, this.targetChanged);
	        },
	        targetChanged:function (event) {
	            event.data.updateSource(event);
	        },
	        updateSource:function () {
	            var expression = this.getExpression();
	            expression.setSourceValue(this.getDataContext(), null,
	                expression.getPropertyHandler().getValue(this));
	        },
	        getSourceValue:function () {
	           return this.getExpression().getSourceValue(this.getDataContext(),
	               this.dependencyTracker_);
	        },
	        getBindingMode:function () {
	            var bindingMode = this.expression_.getMode() || photon.binding.data.DataBindingMode.Default;
	            var propertyHandler = this.getExpression().getPropertyHandler();
	            if (bindingMode === photon.binding.data.DataBindingMode.Default) {
	                bindingMode = propertyHandler.getDefaultBindingMode ?
	                    propertyHandler.getDefaultBindingMode(this) :
	                    photon.binding.data.DataBindingMode.OneWay;
	            }
	            return bindingMode;
	        },
	
	        dataSourceChanged : function() {
	            this.updateSourceValue(this.dependencyTracker_);
	        },
	
	        updateSourceValue : function(dependencyTracker) {
	            var expression = this.getExpression();
	
	            var sourceValue = expression.getSourceValue(this.getDataContext(),
	                dependencyTracker);
	
	            if (this.sourceValue_ !== sourceValue) {
	                this.sourceValue_ = sourceValue;
	                this.sourceValueChanged();
	            }
	        },
	
	        sourceValueChanged : function() {
	            this.getExpression().getPropertyHandler().setValue(this);
	        },
	
	        ensureInitialized : function() {
	           if (!this.isInitialized_) {
	               this.dependencyTracker_ = new photon.observable.DependencyTracker(
	                   function() {
	                       this.updateSourceValue(null);
	                   }, this);
	               photon.addDisposable(this.target_, this.dependencyTracker_);
	
	               var bindingMode = this.getBindingMode();
	               if (bindingMode === photon.binding.data.DataBindingMode.TwoWay) {
	                   this.expression_.getPropertyHandler().bindUpdateSourceTriggers(this);
	               }
	
	               this.isInitialized_ = true;
	           }
	        },
	
	        bind:function () {
	            this.ensureInitialized();
	
	            // TODO: this has bitten once, really need to look into it
	            var expression = this.getExpression();
	            if (expression.getPropertyType() === "data" && expression.getPropertyName() === "context") {
	                var target = this.getTarget();
	
	                var localDataContext = photon.binding.DataContext.getLocalForElement(target);
	                if (localDataContext && !localDataContext.isInherited) {
	                    localDataContext.setName(expression.getName());
	                    localDataContext.setBinding(this);
	                }
	                else {
	                    localDataContext = photon.binding.NodeBindingInfo.getOrCreateForElement(target)
	                        .getOrCreateDataContext();
	                    localDataContext.setName(expression.getName());
	                    localDataContext.setParent(
	                        photon.binding.DataContext.getForElement(target.parentNode));
	
	                    // TODO: Hacky, should be able to set whether the value is inherited as part of setting options
	                    // on a data context. Should also look at setting options on a data context atomically.
	                    localDataContext.isInherited = true;
	
	                    // track the parent data context, when it changes update the binding
	                    this.setDataContext(localDataContext.getParent());
	                }
	            }
	            else {
	                this.updateDataContext();
	            }
	        }
	    });
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
	        getSourceValue : function(dataContext, dependencyTracker) {
	            return photon.binding.evaluateInContext(dataContext,
	                this.getter_, dependencyTracker);
	        },
	        setSourceValue : function(dataContext, dependencyTracker, value) {
	            return photon.binding.evaluateInContext(dataContext,
	                this.setter_, dependencyTracker, value);
	        }
	    }
	);
	(function () {
	    var ARG_VALUE = "$value";
	
	    var defaultContext = {
	        $imports: {
	            photon:photon
	        }
	    };
	
	    /**
	     * Creates a new instance of the photon.binding.data.DataBindingExpressionBuilder type
	     * @param {String} type
	     * @param {String} subtype
	     * @constructor
	     * @extends photon.binding.BindingExpressionBuilder
	     */
	    photon.binding.data.DataBindingExpressionBuilder = function (type, subtype) {
	        photon.binding.data.DataBindingExpressionBuilder.base(this, type, subtype);
	    };
	
	    photon.defineType(
	        /**
	         * Constructor
	         */
	        photon.binding.data.DataBindingExpressionBuilder,
	        /**
	         * Ancestor
	         */
	        photon.binding.BindingExpressionBuilder,
	        /**
	         * @lends photon.binding.data.DataBindingExpressionBuilder.prototype
	         */
	        {
	            /**
	             * Builds the binding expression
	             */
	            build:function () {
	                var source = this.getSourceOrThrow();
	
	                if (photon.isUndefined(this.mode_)) {
	                    this.mode_ = photon.binding.data.DataBindingMode.Default;
	                }
	                if (!source.isWritable) {
	                    assert(this.mode_ !== photon.binding.data.DataBindingMode.TwoWay,
	                        "Binding mode is TwoWay, but the source expression is not writable.");
	
	                    if (this.mode_ === photon.binding.data.DataBindingMode.Default) {
	                        this.mode_ = photon.binding.data.DataBindingMode.OneWay;
	                    }
	                }
	
	                var underlyingGetter = this.makeGetter(source.text),
	                    convertFrom = this.convertFrom_;
	                var getter = function ($context, $data) {
	                    if ($data === undefined) {
	                        $data = $context;
	                        $context = defaultContext;
	                    }
	                    var value = underlyingGetter($context, $data);
	                    if (convertFrom) {
	                        value = convertFrom(value);
	                    }
	                    return value;
	                };
	
	                var setter;
	                if (this.isWritableMode_(this.mode_) && source.isWritable) {
	                    var underlyingSetter = this.makeSetter(source.text),
	                        convertTo = this.convertTo_;
	                    setter = function ($context, $data, $value) {
	                        if (arguments.length < 3) {
	                            $value = $data;
	                            $data = $context;
	                            $context = defaultContext;
	                        }
	                        if (convertTo) {
	                            $value = convertTo($value);
	                        }
	                        underlyingSetter($context || defaultContext, $data, $value);
	                    };
	                }
	
	                return new photon.binding.data.DataBindingExpression(this.getText(), this.getType(), this.getSubType(),
	                    getter, setter, this.mode_, this.name_, this.isPrimary_);
	            },
	            /**
	             * Sets the mode of the binding, the mode must be in ["OneTime", "TwoWay", "OneWay"]
	             * @param {String} value
	             */
	            "set-mode":function (value) {
	                assert(photon.binding.data.DataBindingMode.hasOwnProperty(value),
	                    "Invalid binding mode '{0}'.", value);
	                this.mode_ = photon.binding.data.DataBindingMode[value];
	            },
	            /**
	             * Sets the name of the expression
	             * @param {String} value
	             */
	            "set-name":function(value) {
	                this.name_ = value;
	            },
	            /**
	             * Sets the convertFrom expression of the binding.
	             * @param {String} value
	             */
	            "set-convertFrom":function (value) {
	                this.convertFrom_ = this.getConverter_(value);
	            },
	            /**
	             * Sets the convertTo expression of the binding.
	             * @param {String} value
	             */
	            "set-convertTo":function (value) {
	                this.convertTo_ = this.getConverter_(value);
	            },
	            /**
	             * Sets a value indicating whether this binding is the primary binding, useful for deriving primary bindings from templates.
	             * @param {Boolean} value
	             */
	            "set-isPrimary":function (value) {
	                this.isPrimary_ = photon.object.toBoolean(value);
	            },
	            /**
	             * Gets a value indicating whether the mode is a writable mode
	             * @param {photon.binding.data.DataBindingMode} mode
	             * @return {Boolean}
	             * @private
	             */
	            isWritableMode_:function (mode) {
	                return mode === photon.binding.data.DataBindingMode.Default ||
	                    mode === photon.binding.data.DataBindingMode.TwoWay;
	            },
	            /**
	             * Generates a converter Function from the specified expression.
	             * @param {String} expression
	             * @private
	             */
	            getConverter_:function (expression) {
	                return new Function(ARG_VALUE, "return " + expression);
	            }
	        }
	    );
	})();
	/**
	 * Creates a new instance of the photon.binding.data.DataBindType type
	 * @constructor
	 */
	photon.binding.data.DataBindType = function () {
	};
	
	photon.defineType(
	    /**
	     * Constructor
	     */
	    photon.binding.data.DataBindType,
	    /**
	     * Ancestor
	     */
	    photon.binding.BindingType,
	    /**
	     * @lends photon.binding.data.DataBindType.prototype
	     */
	    {
	        getDefaultExpressionType:function () {
	            return "property";
	        },
	        /**
	         * @return {photon.binding.data.DataBindingExpressionBuilder}
	         */
	        getExpressionBuilderType:function () {
	            return photon.binding.data.DataBindingExpressionBuilder;
	        }
	    });
	
	photon.binding.registerBindingType("data-bind", new photon.binding.data.DataBindType());
	photon.defineType(
	    photon.binding.data.Property = function () {
	    },
	    /**
	     * @lends photon.binding.data.PropertyBase.prototype
	     */
	    {
	        beginInitialize : function(binding) {
	        },
	        endInitialize : function(binding) {
	
	        },
	        getDefaultBindingMode:function () {
	            return photon.binding.data.DataBindingMode.OneWay;
	        },
	        getValue:function (binding) {
	            return binding.getTarget()[binding.getExpression().getPropertyName()];
	        },
	        setValue:function (binding) {
	            binding.getTarget()[binding.getExpression().getPropertyName()] = binding.getSourceValue();
	        }
	    });
	photon.defineType(
	    photon.binding.data.InputProperty = function () {
	    },
	    photon.binding.data.Property,
	    /**
	     * @lends: photon.binding.data.InputDataBindingProperty.prototype
	     */
	    {
	        getDefaultBindingMode:function () {
	            return photon.binding.data.DataBindingMode.TwoWay;
	        },
	        bindUpdateSourceTriggers:function (binding) {
	            binding.bindUpdateSourceEvent("change");
	        }
	    }
	);
	photon.defineType(
	    photon.binding.data.FocusProperty = function () {
	    },
	    photon.binding.data.Property,
	    /**
	     * @lends: photon.binding.data.FocusDataBindingProperty.prototype
	     */
	    {
	        bindUpdateSourceTriggers:function (binding) {
	            binding.bindUpdateSourceEvent("focus blur");
	        },
	        getDefaultBindingMode:function () {
	            return photon.binding.data.DataBindingMode.TwoWay;
	        },
	        getValue:function (binding) {
	            return photon.dom.hasFocus(binding.getTarget());
	        },
	        setValue:function (binding) {
	            photon.dom.hasFocus(binding.getTarget(), binding.getSourceValue());
	        }
	    }
	);
	photon.defineType(
	    photon.binding.data.StyleProperty = function () {
	    },
	    photon.binding.data.Property,
	    /**
	     * @lends: photon.binding.data.StyleDataBindingProperty.prototype
	     */
	    {
	        getValue:function (binding) {
	            return $(binding.getTarget()).css(binding.getExpression().getPropertyName());
	        },
	        setValue:function (binding) {
	            $(binding.getTarget()).css(binding.getExpression().getPropertyName(),
	                binding.getSourceValue());
	        }
	    }
	);
	photon.defineType(
	    photon.binding.data.DataContextProperty = function() {
	    },
	    photon.binding.data.Property,
	    {
	        getValue:function (binding) {
	            return photon.binding.DataContext.getForElement(binding.getTarget()).getSource();
	        },
	        setValue:function (binding) {
	            photon.binding.DataContext.getForElement(binding.getTarget()).setSource(
	                binding.getSourceValue());
	        }
	    });
	photon.defineType(
	    photon.binding.data.AttributeProperty = function () {
	    },
	    photon.binding.data.Property,
	    /**
	     * @lends: photon.binding.data.AttributeDataBindingProperty.prototype
	     */
	    {
	        getValue:function (binding) {
	            binding.getTarget().getAttribute(
	                binding.getExpression().getPropertyName());
	        },
	        setValue:function (binding) {
	            binding.getTarget().setAttribute(binding.getExpression().getPropertyName(),
	                binding.getSourceValue());
	        }
	    }
	);
	photon.defineType(
	    photon.binding.data.DataTemplateProperty = function () {
	    },
	    photon.binding.data.Property,
	    {
	        getValue:function (binding) {
	            return binding.template;
	        },
	        templatesEqual:function (x, y) {
	            if (x === y || (photon.isNullOrUndefined(x) && photon.isNullOrUndefined(y))) {
	                return true;
	            }
	
	            if (photon.isNullOrUndefined(x) || photon.isNullOrUndefined(y)) {
	                return false;
	            }
	
	            return x.name === y.name && x.data === y.data && x.each === y.each;
	        },
	        getFragment:function (name) {
	            var templateCache =  photon.templating.getCache();
	
	            var result = templateCache.findFragment(name);
	            if (!result) {
	                templateCache.addElement(name);
	                result = templateCache.findFragment(name);
	            }
	
	            return result;
	        },
	        collectionChanged:function (event) {
	            this.setValue(event.data, true);
	        },
	        setValue:function (binding, force) {
	            var oldValue = binding.template;
	            var newValue = binding.getSourceValue();
	            if (!force && this.templatesEqual(oldValue, newValue)) {
	                return;
	            }
	            binding.template = newValue;
	
	            var target = binding.getTarget(),
	                fragment = this.getFragment(newValue.name);
	
	            // we know the parent, we don't need to look for it, so set it explicitly, faster!!
	            var parentDataContext = photon.binding.DataContext.getForElement(target);
	            if (newValue.each) {
	                // TODO: If the template has changed we will need to re-render everything!!
	                if (!binding.renderer_ || !binding.renderer_.getReferenceElement()) {
	                    binding.renderer_ = new photon.templating.ItemsRenderer(
	                        target, photon.templating.RenderTarget.NextSibling, photon.templating.getCache().getTemplate(newValue.name)
	                    );
	                    photon.addDisposable(target, binding.renderer_);
	                }
	                binding.renderer_.setData(newValue.each);
	            }
	            else {
	                photon.dom.empty(target);
	                photon.templating.insertBeforeAndApplyBindings(target, fragment, null, newValue.data, parentDataContext);
	            }
	        }
	    });
	photon.defineType(
	    photon.binding.data.ClassProperty = function () {
	    },
	    photon.binding.data.Property,
	    /**
	     * @lends: photon.binding.data.FocusDataBindingProperty.prototype
	     */
	    {
	        getDefaultBindingMode:function () {
	            return photon.binding.data.DataBindingMode.OneWay;
	        },
	        getValue:function (binding) {
	            return $(binding.getTarget()).hasClass(
	                binding.getExpression().getPropertyName());
	        },
	        setValue:function (binding) {
	            var sourceValue = binding.getSourceValue();
	
	            var className = binding.getExpression().getPropertyName();
	            if (sourceValue) {
	                $(binding.getTarget()).addClass(className);
	            } else
	            {
	                $(binding.getTarget()).removeClass(className);
	            }
	        }
	    }
	);
	photon.defineType(
	    photon.binding.data.TextProperty = function () {
	    },
	    photon.binding.data.Property,
	    /**
	     * @lends: photon.binding.data.StyleDataBindingProperty.prototype
	     */
	    {
	        getValue:function (binding) {
	            return $(binding.getTarget()).text();
	        },
	        setValue:function (binding) {
	            $(binding.getTarget()).text(binding.getSourceValue());
	        }
	    }
	);
	/**
	 *  @namespace 'photon.binding.data.properties'
	 */
	provide('photon.binding.data.properties');
	
	photon.extend(photon.binding.data.properties,
	    /**
	     * @lends photon.binding.data.properties
	     */
	    {
	        'null':{},
	        'property':new photon.binding.data.Property(),
	        'property.value':new photon.binding.data.InputProperty(),
	        'property.checked':new photon.binding.data.InputProperty(),
	        'property.focus':new photon.binding.data.FocusProperty(),
	        'property.text':new photon.binding.data.TextProperty(),
	        'style':new photon.binding.data.StyleProperty(),
	        'attribute':new photon.binding.data.AttributeProperty(),
	        'data.context':new photon.binding.data.DataContextProperty(),
	        'data.template':new photon.binding.data.DataTemplateProperty(),
	        'class':new photon.binding.data.ClassProperty()
	    }
	);
	/** @namespace photon.binding.actions */
	provide("photon.binding.actions");
	photon.defineType(
	    /***
	     * Creates a new instance of the ActionBinding type.
	     *
	     * @class Represents an action binding
	     *
	     * @extends photon.binding.BindingBase
	     *
	     * @param {HTMLElement|HTMLDocument} target The target element to bind to.
	     * @param {photon.binding.actions.ActionBindingExpression} expression
	     */
	    photon.binding.actions.ActionBinding = function (target, expression) {
	        photon.binding.actions.ActionBinding.base(this, target, expression);
	    },
	    photon.binding.BindingBase,
	    /**
	     * @lends photon.binding.actions.ActionBinding.prototype
	     */
	    {
	        onTriggered_:function (event) {
	            event.data.invoke(event);
	        },
	        bind:function () {
	            if (!this.isInitialized_) {
	                photon.events.add(this.getTarget(), this.getExpression().getEvents(), this, this.onTriggered_);
	                this.isInitialized_ = true;
	            }
	
	            this.setDataContext(photon.binding.DataContext.getForElement(this.getTarget()));
	        },
	        invoke:function (event) {
	            var expression = this.getExpression();
	            if (expression.getStopPropagation()) {
	                event.stopPropagation();
	            }
	            if (expression.getPreventDefault()) {
	                event.preventDefault();
	            }
	
	            photon.binding.evaluateInContext(
	                this.dataContext_, expression.getAction(), null, event
	            );
	        }
	    });
	/**
	 * Expression type used for defining actions
	 */
	photon.defineType(
	    photon.binding.actions.ActionBindingExpression = function (text, action, events, stopPropagation, preventDefault) {
	        // call base with Binding constructor and original expression text
	        photon.binding.actions.ActionBindingExpression.base(this, photon.binding.actions.ActionBinding, text);
	
	        // initialize
	        this.action_ = action;
	        if (!events) {
	            events = "click";
	        }
	        this.events_ = events.split(/\W+/).join(".photon ") + ".photon";
	        this.stopPropagation_ = photon.isUndefined(stopPropagation) ? false : (stopPropagation ? true : false);
	        this.preventDefault_ = photon.isUndefined(preventDefault) ? false : (preventDefault ? true : false);
	    },
	    photon.binding.BindingExpression,
	    /**
	     * @lends photon.binding.actions.ActionBindingExpression
	     */
	    {
	        getAction : function() {
	            return this.action_;
	        },
	        getStopPropagation : function() {
	            return this.stopPropagation_;
	        },
	        getPreventDefault : function() {
	            return this.preventDefault_;
	        },
	        getEvents : function() {
	            return this.events_;
	        }
	    });
	photon.defineType(
	    photon.binding.actions.ActionBindingExpressionBuilder = function (targetType, target, text) {
	        photon.binding.actions.ActionBindingExpressionBuilder.base(this, targetType, target, text);
	    },
	    photon.binding.BindingExpressionBuilder,
	    /**
	     * @lends photon.binding.actions.ActionBindingExpressionBuilder.prototype
	     */
	    {
	        build:function () {
	            var source = this.getSource();
	            if (!source) {
	                throw new Error("Binding does not contain a valid source expression.");
	            }
	            var action = this.makeAction(source.text, ["$event"]);
	            return new photon.binding.actions.ActionBindingExpression(this.getText(),
	                function($context, $event, $data) {
	                   action($context || {}, $event, $data);
	                }, this.events_, this.stopPropagation_, this.preventDefault_);
	        },
	        "set-stopPropagation" : function(value) {
	            this.stopPropagation_  = photon.object.toBoolean(value);
	        },
	        "set-preventDefault" : function(value) {
	            this.preventDefault_ = photon.object.toBoolean(value);
	        },
	        "set-events":function (events) {
	            this.events_ = events;
	        }
	    });
	photon.defineType(
	    /**
	     * Creates a new instance of the ActionBindingType type.
	     * @class represents an action binding type
	     * @extends photon.binding.BindingType
	     */
	    photon.binding.actions.ActionBindingType = function () {
	    },
	    photon.binding.BindingType,
	    /**
	     * @lends photon.binding.actions.ActionBindingType
	     */
	    {
	        getDefaultExpressionType:function () {
	            return "action";
	        },
	        getExpressionBuilderType:function () {
	            return photon.binding.actions.ActionBindingExpressionBuilder;
	        }
	    });
	
	photon.binding.registerBindingType("data-action", new photon.binding.actions.ActionBindingType());
	/** @namespace photon.binding.flow */
	provide("photon.binding.flow");
	/**
	 * Creates a new instance of the FlowBinding type.
	 *
	 * @param {HTMLElement|HTMLDocument} target The target element to bind to.
	 * @param {photon.binding.flow.FlowBindingExpression} expression
	 * @constructor
	 */
	photon.binding.flow.FlowBinding = function (target, expression) {
	    photon.binding.flow.FlowBinding.base(this, target, expression);
	    photon.addDisposable(target, this);
	
	    if (this.getExpression().getFlowType() === "if") {
	        this.renderer_ = new photon.templating.ConditionalRenderer(
	            target, this.getExpression().getApplyTo(), photon.templating.FlowTemplate.getForElement(target)
	        );
	    } else {
	        this.renderer_ = new photon.templating.ItemsRenderer(
	            target, this.getExpression().getApplyTo(), photon.templating.FlowTemplate.getForElement(target)
	        );
	    }
	};
	
	photon.defineType(
	    /**
	     * Constructor
	     */
	    photon.binding.flow.FlowBinding,
	    /**
	     * Ancestor
	     */
	    photon.binding.BindingBase,
	    /**
	     * @lends photon.binding.flow.FlowBinding.prototype
	     */
	    {
	        dispose:function () {
	            this.superType.dispose.call(this);
	            if (this.renderer_) {
	                this.renderer_.dispose();
	                this.renderer_ = null;
	            }
	        },
	        dataSourceChanged:function () {
	            if (this.getDataContext()) {
	                this.updateFlowData(this.dependencyTracker_);
	            }
	            else {
	                this.renderer_.setData(undefined);
	            }
	        },
	        updateFlowData:function (dependencyTracker) {
	            var data = this.getExpression().getFlowData(
	                this.getDataContext(), dependencyTracker);
	            this.renderer_.setData(data);
	
	        },
	        bind:function () {
	            if (!this.isInitialized_) {
	                this.dependencyTracker_ = new photon.observable.DependencyTracker(
	                    function () {
	                        this.updateFlowData(this.dependencyTracker_);
	                    }, this);
	                photon.addDisposable(this.target_, this.dependencyTracker_);
	
	                // mark as initialized
	                this.isInitialized_ = true;
	            }
	
	            this.updateDataContext();
	        }
	    });
	/**
	 * Creates a new instance of the photon.binding.flow.FlowBindingExpression type
	 *
	 * @param {String} text the text of the expression
	 * @param {String} flowType
	 * @param {Function} getFlowData
	 * @param {photon.templating.RenderTarget} applyTo
	 *
	 * @constructor
	 * @extends photon.binding.BindingExpression
	 */
	photon.binding.flow.FlowBindingExpression = function (text, flowType, getFlowData, applyTo) {
	    // call base with Binding constructor and original expression text
	    photon.binding.flow.FlowBindingExpression.base(this, photon.binding.flow.FlowBinding, text);
	
	    /**
	     * @type {String}
	     * @private
	     */
	    this.flowType_ = flowType;
	
	    /**
	     * @type {photon.templating.RenderTarget}
	     * @private
	     */
	    this.applyTo_ = photon.isNullOrUndefined(applyTo) ?
	        photon.templating.RenderTarget.Child :
	        applyTo;
	
	    /**
	     * @type {Function}
	     */
	    this.getFlowData_ = getFlowData;
	};
	
	 /**
	 * Expression type used for defining Flows
	 */
	photon.defineType(
	    /**
	     * Constructor
	     */
	    photon.binding.flow.FlowBindingExpression,
	    /**
	     * Ancestor
	     */
	    photon.binding.BindingExpression,
	    /**
	     * @lends photon.binding.flow.FlowBindingExpression
	     */
	    {
	        /**
	         * Gets the flow binding type, e.g. "if", "each"
	         * @return {*}
	         */
	        getFlowType : function() {
	            return this.flowType_;
	        },
	        /**
	         * Gets the current source value using the specified data context
	         * @param {photon.binding.DataContext} dataContext
	         * @param dependencyTracker
	         * @return {*}
	         */
	        getFlowData : function(dataContext, dependencyTracker) {
	            return photon.binding.evaluateInContext(
	                dataContext, this.getFlowData_, dependencyTracker);
	        },
	        /**
	         * Gets a value indicating where in the DOM the flow template should be applied.
	         * @return {photon.templating.RenderTarget}
	         */
	        getApplyTo : function() {
	            return this.applyTo_;
	        }
	    });
	/**
	 * Creates an instance of the FlowBindingExpressionBuilder type.
	 *
	 * @param {String} type The type of the expression, e.g. "flow"
	 * @param {String} subtype The sub type of the expression, e.g. "if", "each"
	 * @param text
	 * @constructor
	 * @extends photon.binding.BindingExpressionBuilder
	 */
	photon.binding.flow.FlowBindingExpressionBuilder = function (type, subtype) {
	    photon.binding.flow.FlowBindingExpressionBuilder.base(this, type, subtype);
	};
	
	photon.defineType(
	    /**
	     * Constructor
	     */
	    photon.binding.flow.FlowBindingExpressionBuilder,
	    /**
	     *  Ancestor
	     */
	    photon.binding.BindingExpressionBuilder,
	    /**
	     * @lends photon.binding.flow.FlowBindingExpressionBuilder.prototype
	     * */
	    {
	        build:function () {
	            var getFlowData = this.makeGetter(
	                this.getSourceOrThrow().text);
	            return new photon.binding.flow.FlowBindingExpression(this.getText(),
	                this.getSubType(), getFlowData, this.applyTo_);
	        },
	        "set-applyTo":function (value) {
	            assert(photon.templating.RenderTarget.hasOwnProperty(value),
	                "Invalid applyTo value '{0}'.", value);
	            this.applyTo_ = photon.templating.RenderTarget[value];
	        }
	    });
	/**
	 * Creates a new instance of the FlowBindingType type.
	 * @extends photon.binding.BindingType
	 */
	photon.binding.flow.FlowBindingType = function () {
	};
	
	photon.defineType(
	    /**
	     * Constructor
	     */
	    photon.binding.flow.FlowBindingType,
	    /**
	     * Ancestor
	     */
	    photon.binding.BindingType,
	    /**
	     * @lends photon.binding.actions.ActionBindingType
	     */
	    {
	        getDefaultExpressionType:function () {
	            return "flow";
	        },
	        getExpressionBuilderType:function () {
	            return photon.binding.flow.FlowBindingExpressionBuilder;
	        }
	    });
	
	/**
	 * Register the data-flow binding type
	 */
	photon.binding.registerBindingType("data-flow", new photon.binding.flow.FlowBindingType());
	photon.dom.subscribeToCleanup(function (node) {
	    // clean disposables
	    var data = photon.getData(node);
	    if (data) {
	        if (data.disposables) {
	            for (var i = 0, n = data.disposables.length; i < n; i++) {
	                data.disposables[i].dispose();
	            }
	        }
	    }
	});
	
	photon.addDisposable = function (element, disposable) {
	    var data = photon.getOrCreateData(element);
	    (data.disposables = data.disposables || []).push(disposable);
	};
	
	photon.rewriteTemplate = function (template) {
	    var regex = /(<[a-z]([a-z]|\d)*(\s+(?!data-context=('templateSource[^']*'|"templateSource[^']*"))[a-z0-9\-]+(=("[^"]*"|'[^']*'))?)*\s+(data-context=((["'])templateSource:([\s\S]*?))\9))/gi;
	
	    return template.replace(regex, function () {
	        var argumentsLength = arguments.length;
	        var result = new photon.StringBuilder();
	        var temp = arguments[0];
	        result.push(temp.substring(0, temp.length - arguments[argumentsLength - 6].length));
	        result.push('data-context-id=');
	        var delimiter = arguments[argumentsLength - 4];
	        result.push(delimiter);
	        photon.rewriteScriptFragment(result, '=context.identity(' + arguments[argumentsLength - 3] + ')');
	        result.push(delimiter);
	        return result.get();
	    });
	};
	
	
	photon.rewriteScriptFragment = function (builder, script) {
	    builder.pushAll(['<%', script, '%>']);
	};
	
	
	photon.getOrCreateData = function (node) {
	    return node.photonData || (node.photonData = {});
	};
	
	photon.getData = function (node) {
	    return node.photonData;
	};
	
	(function () {
	    var fnDataElementSelector = document.querySelectorAll
	        ?
	        //        function (element, bindingTypes, callback) {
	        //            for (var i = 0, n = bindingTypes.length; i < n; i++) {
	        //                var bindingType = bindingTypes[i];
	        //                photon.array.forEach(
	        //                    element.querySelectorAll("*[" + bindingType + "]"),
	        //                    function (element) {
	        //                        callback(element, bindingType, element.getAttribute(bindingType));
	        //                    }
	        //                );
	        //            }
	        //        }
	        // TODO: Still need to do more work to find best overall solution
	        function (element, bindingTypes, callback) {
	            var types = "*[" + bindingTypes.join("], *[") + "]";
	            if (element.nodeType === 1) {
	                for (var j = 0, nj = bindingTypes.length; j < nj; j++) {
	                    var bindingType = bindingTypes[j];
	                    var bindingValue = element.getAttribute(bindingType);
	                    if (bindingValue) {
	                        callback(element, bindingType, bindingValue);
	                    }
	                }
	            }
	            photon.array.forEach(
	                element.querySelectorAll(types), function (currentElement) {
	                    for (var j = 0, nj = bindingTypes.length; j < nj; j++) {
	                        var bindingType = bindingTypes[j];
	                        var bindingValue = currentElement.getAttribute(bindingType);
	                        if (bindingValue) {
	                            callback(currentElement, bindingType, bindingValue);
	                        }
	                    }
	                });
	
	        }
	        :
	        function (element, bindingTypes, callback) {
	            if (element.nodeType === 1) {
	                for (var j = 0, nj = bindingTypes.length; j < nj; j++) {
	                    var bindingType = bindingTypes[j];
	                    var bindingValue = element.getAttribute(bindingType);
	                    if (bindingValue) {
	                        callback(element, bindingType, bindingValue);
	                    }
	                }
	            }
	            var elements = element.getElementsByTagName("*");
	            for (var i = 0, ni = elements.length; i < ni; i++) {
	                var currentElement = elements[i];
	                for (var j = 0, nj = bindingTypes.length; j < nj; j++) {
	                    var bindingType = bindingTypes[j];
	                    var bindingValue = currentElement.getAttribute(bindingType);
	                    if (bindingValue) {
	                        callback(currentElement, bindingType, bindingValue);
	                    }
	                }
	            }
	        };
	
	    photon.binding.forEachBoundElement = function (element, bindingTypes, callback) {
	        element = element || document;
	        if (!element) {
	            return;
	        }
	        if (photon.isString(bindingTypes)) {
	            bindingTypes = [bindingTypes];
	        }
	        fnDataElementSelector(element, bindingTypes, callback);
	    };
	})();
	/**
	 * String format for generic attribute matching in templates
	 * @type {String}
	 */
	var attributeRegExFormat = '(<[a-z]([a-z]|\\d)*(\\s+(?!{0}=)[a-z0-9\\-]+(=("[^"]*"|\'[^\']*\'))?)*\\s+({0}=(["\'])([\\s\\S]*?)\\7))';
	
	/**
	 * Cache for binding type regex
	 * @type {Object}
	 */
	var bindingTypeRegExCache = {
	};
	
	var afterRenderSubscribers = [];
	
	var escapedFromXmlMap = {
	    '&amp;': '&',
	    '&quot;': '"',
	    '&lt;': '<',
	    '&gt;': '>'
	};
	
	function decodeXml(string) {
	    return string.replace(/(&quot;|&lt;|&gt;|&amp;)/g,
	        function(str, item) {
	            return escapedFromXmlMap[item];
	        });
	}
	
	/** @namespace photon.templating */
	provide("photon.templating",
	    /**
	     * @lends photon.templating
	     */
	    {
	        getBindingExpressionsFromHtml:function (html, bindingType) {
	            html = decodeXml(html);
	
	            // default to data-bind
	            bindingType = bindingType || "data-bind";
	
	            // verify the bindingType exists
	            assert(photon.binding.getBindingType(bindingType));
	
	            // get regex from cache (or create)
	            var regEx = bindingTypeRegExCache[bindingType];
	            if (!regEx) {
	                regEx = bindingTypeRegExCache[bindingType] =
	                    new RegExp(photon.string.format(attributeRegExFormat, bindingType), "gi");
	            }
	            else {
	                regEx.lastIndex = 0;
	            }
	
	            // create binding context if non-supplied
	            var bindingContext = photon.binding.BindingContext.getInstance();
	
	            // parse data-bind attributes
	            var matches;
	            var expressions = [];
	            while ((matches = regEx.exec(html))) {
	                var expressionText = matches[matches.length - 1];
	                Array.prototype.push.apply(expressions, bindingContext.parseBindingExpressions(bindingType, expressionText));
	            }
	            return expressions;
	        },
	
	        getPrimaryDataBindingExpressionFromHtml:function (html) {
	            var expressions = photon.templating.getBindingExpressionsFromHtml(html, "data-bind");
	            if (expressions.length > 1) {
	                expressions = photon.array.filter(expressions, function (expression) {
	                    return expression.isPrimary;
	                });
	            }
	            return expressions.length === 1 ? expressions[0] : null;
	        },
	
	        afterRender : function(nodes) {
	            var subscribers = afterRenderSubscribers;
	            if (subscribers.length > 0) {
	                for (var i= 0,n=subscribers.length; i<n; i++) {
	                    subscribers[i](nodes);
	                }
	            }
	        },
	
	        registerAfterRender : function(callback) {
	            var subscribers = afterRenderSubscribers.slice(0);
	            subscribers.push(callback);
	            afterRenderSubscribers = subscribers;
	        },
	
	        /**
	         *
	         * @param {String} reference.url
	         * @param {String} reference.name
	         * @param {String} reference
	         * @param {Function} [callback]
	         * @param {Object} [thisObj]
	         * @return {String}
	         */
	        getHtml:function (reference, callback, thisObj) {
	            var templateName = photon.isString(reference) ?
	                reference :
	                reference.name;
	
	            var result = templateCache.findHtml(templateName);
	            if (result) {
	                if (callback) {
	                    callback.call(thisObj, {
	                        template:result,
	                        completedSynchronously:true
	                    });
	                }
	
	            } else if (reference.url) {
	                templateCache.addResourceUrl(
	                    reference.url, function (event) {
	                        if (callback) {
	                            callback.call(thisObj, {
	                                template:templateCache.findHtml(templateName),
	                                completedSynchronously:event.completedSynchronously
	                            });
	                        }
	                    }
	                );
	            }
	
	            return result;
	        },
	        insertBefore : function(parentElement, newElement, referenceElement, dataContextParentElement) {
	            var nodes = [];
	            if (photon.isDocumentFragment(newElement)) {
	                var childNodes = newElement.childNodes;
	                for (var i= 0, n=childNodes.length; i<n; i++) {
	                    nodes[i] = childNodes[i];
	                }
	            } else {
	                nodes[0] = newElement;
	            }
	            parentElement.insertBefore(newElement, referenceElement);
	
	            // need to apply bindings after we've been attached to the dom, this is still inefficient when we have multiple levels of flow, need
	            // to work on a post apply tree callback mechanism
	            photon.array.forEach(nodes, function(node) {
	                if (photon.isDocumentOrElement(node)) {
	                    node.parentDataContextNode = dataContextParentElement;
	                    photon.binding.updateBindings(node);
	                }
	            });
	
	            photon.templating.afterRender(nodes);
	            return nodes;
	        },
	        insertBeforeAndApplyBindings : function(parentElement, newElement, referenceElement, data, parentDataContext) {
	            var nodesAppended = [];
	            if (photon.isDocumentFragment(newElement)) {
	                var childNodes = newElement.childNodes;
	                for (var i= 0, n=childNodes.length; i<n; i++) {
	                    nodesAppended.push(childNodes[i]);
	                }
	            } else {
	                nodesAppended.push(newElement);
	            }
	            parentElement.insertBefore(newElement, referenceElement);
	
	            // need to apply bindings after we've been attached to the dom, this is still inefficient when we have multiple levels of flow, need
	            // to work on a post apply tree callback mechanism
	            photon.array.forEach(nodesAppended, function(node) {
	                if (photon.isDocumentOrElement(node)) {
	                    photon.binding.applyBindings(data, node, parentDataContext);
	                }
	            });
	
	            photon.templating.afterRender(nodesAppended);
	            return nodesAppended;
	        }
	    });
	photon.defineType(
	    photon.templating.TemplateCache = function () {
	        /**
	         * Template storage
	         * @private
	         */
	        this.templates_ = {};
	    },
	    /**
	     * @lends photon.templating.TemplateCache.prototype
	     */
	    {
	        resourceDelimiterRegEx:/<!--\s*Template:\s*([\w\.]*)\s*-->/,
	        /**
	         * Gets a template by name, an exception is thrown if the template cannot be found.
	         * @private
	         * @returns {photon.templating.Template}
	         */
	        getTemplate:function (name) {
	            return assert(this.templates_[name],
	                "No template could be found with key '{0}'.", name);
	        },
	        /**
	         * Finds an template by name;
	         * @param name
	         * @return {photon.templating.Template}
	         */
	        findTemplate:function(name) {
	            return this.templates_[name];
	        },
	        /**
	         * Removes the template with the specified name
	         * @param {string} name
	         * @returns {boolean} true; if the template was removed; otherwise, false.
	         */
	        remove:function (name) {
	            var template = this.templates_[name];
	            if (template) {
	                template.dispose();
	            }
	            return delete this.templates_[name];
	        },
	        /**
	         * Clears the cache
	         */
	        clear:function () {
	            photon.array.forEach(photon.object.getOwnPropertyNames(this.templates_), function (name) {
	                this.remove(name);
	            }, this);
	        },
	        /**
	         * Gets the template with the specified name as a html fragment, an exception is thrown if the template does not exist.
	         *
	         * A clone of the fragment stored in the cache is returned each time this method is called.
	         *
	         * @param {String} name The name of the template to find.
	         * @returns {String} The template
	         */
	        getFragment:function (name) {
	            return this.getTemplate(name).getFragment();
	        },
	        /**
	         * Finds the template with the specified name, no exception is thrown if the template does not exist.
	         *
	         * A clone of the fragment stored in the cache is returned each time this method is called.
	         *
	         * @param {String} name The name of the template to find.
	         * @returns {String} The template
	         */
	        findFragment:function (name) {
	            var result = this.templates_[name];
	            return result ? result.getFragment() : null;
	        },
	        /**
	         * Gets the template with the specified name as a html string, an exception is thrown if the template does not exist.
	         *
	         * @param {String} name The name of the template to find.
	         * @returns {String} The template
	         */
	        getHtml:function (name) {
	            return this.getTemplate(name).getHtml();
	        },
	        /**
	         * Finds the template with the specified name, no exception is thrown if the template does not exist.
	         *
	         * @param {String} name The name of the template to find.
	         * @returns {String} The template
	         */
	        findHtml:function (name) {
	            var result = this.templates_[name];
	            return result ? result.template : null;
	        },
	        /**
	         * Adds a template to the cache.
	         * @param {string} name The template name
	         * @param {string} html The template
	         */
	        addHtml:function (name, html) {
	            // always remove
	            this.remove(name);
	
	            // wrap in "div" to ensure query selectors and work!!
	            var templateElement = photon.dom.wrap(
	                photon.dom.htmlToFragmentOrNode(html), "div");
	
	            var childEntries = photon.templating.prepareFlowTemplates(
	                templateElement);
	
	            var entry = new photon.templating.Template(null, name);
	            if (childEntries.length > 0) {
	                entry.setTemplate(templateElement.innerHTML);
	                photon.array.forEach(childEntries, function (childEntry) {
	                    this.addChild(childEntry);
	                }, entry);
	            }
	            else {
	                entry.setTemplate(html);
	            }
	
	            this.templates_[name] = entry;
	        },
	        /**
	         * Adds an a template to the cache based on an element's inner HTML. If no name is supplied the elements
	         * id is used to identify the template in the cache.
	         *
	         * @param {HTMLElement|String} elementOrId The element, or id of the element to get
	         * the template from.
	         * @param {String} [name] Alternative name to use for the template.
	         */
	        addElement:function (elementOrId, name) {
	            var element = photon.isElement(elementOrId) ? elementOrId : document.getElementById(elementOrId);
	            assert(element,
	                "Invalid element specification {0}.", elementOrId);
	            assert(name ? name : name = element.id,
	                "A name must be specified if the element does not have an id.");
	            this.addHtml(name, element.innerHTML);
	        },
	        /**
	         * Adds templates to the cache based on a "resource" element's inner HTML. "Resource" elements define multiple
	         * templates delimited by comments in the form: &lt;!-- Template:<Name> --&gt;
	         *
	         * Example:
	         * <script id="person">
	         *      &lt;!-- Template:firstName --&gt;
	         *      <span>firstName: <span data-bind="firstName"></span></span>
	         *      &lt;!-- Template:surname --&gt;
	         *      <span>surname: <span data-bind="surname"></span></span>
	         * </script>
	         *
	         * If no name parameter is supplied the elements id is used as the base name for the templates. The above
	         * example will add two templates, person.firstName, and person.surname.
	         *
	         * @param {HTMLElement|String} elementOrId The element, or id of the element to get
	         * the template from.
	         * @param {String} [name] Alternative base name to use for the template.
	         */
	        addResourceElement:function (elementOrId, name) {
	            var element = photon.isElement(elementOrId) ? elementOrId : document.getElementById(elementOrId);
	            assert(element,
	                "Invalid element specification {0}.", elementOrId);
	            this.addResourceHtml(name || element.id, element.innerHTML);
	        },
	        /**
	         * Adds templates to the cache from "resource" html snippet. "Resource" html snippets define multiple
	         * templates delimited by comments in the form: &lt;!-- Template:<Name> --&gt;
	         *
	         * Example:
	         *      &lt;!-- Template:firstName --&gt;
	         *      <span>firstName: <span data-bind="firstName"></span></span>
	         *      &lt;!-- Template:surname --&gt;
	         *      <span>surname: <span data-bind="surname"></span></span>
	         *
	         * @param {string} name The root name to use for templates loaded from the resource. Names will be
	         * added in the form 'rootName.<name>'.
	         * @param {string} html A resource containing templates.
	         * @param {RegExp} [templateDelimiter] Optional delimiter for overriding the default regex used to
	         * split the templates.
	         */
	        addResourceHtml:function (name, html, templateDelimiter) {
	            html = photon.string.trim(html);
	            var templateParts = photon.string.split(html,
	                templateDelimiter || this.resourceDelimiterRegEx);
	
	            if (templateParts.length === 1) {
	                this.addHtml(name, templateParts[0]);
	            }
	            else {
	                name = name ? name + "." : "";
	                for (var i = templateParts[0] ? 0 : 1, n = templateParts.length; i < n; i += 2) {
	                    if (i === n) {
	                        break;
	                    }
	                    this.addHtml(name + templateParts[i],
	                        photon.string.trim(templateParts[i + 1]));
	                }
	            }
	        },
	        /**
	         * Adds template resources from a url
	         * @param {String|Array} resourceUrl
	         * @param {Function} callback
	         * @param {RegExp} [templateSplitRegEx]
	         */
	        addResourceUrl:function (resourceUrl, callback, templateSplitRegEx) {
	            var self = this;
	
	            if (!photon.isArray(resourceUrl)) {
	                resourceUrl = [resourceUrl];
	            }
	
	            var completedSynchronously = true;
	
	            var event = {
	                isSuccess:true
	            };
	
	            function complete(success) {
	                event.isSuccess = event.isSuccess && success;
	                if (!(--remaining) && callback) {
	                    event.completedSynchronously = completedSynchronously;
	                    callback(event);
	                }
	            }
	
	            function getTemplate(url) {
	                $.ajax({
	                    type:"GET",
	                    url:url
	                })
	                    .done(function (template) {
	                        var isSuccess = true;
	                        try {
	                            $(template).filter('script').each(function (i, x) {
	                                self.addResourceHtml(x.id, $(x).html(), templateSplitRegEx);
	                            });
	                        } catch (e) {
	                            isSuccess = false;
	                            if (!callback) {
	                                throw e;
	                            }
	                        }
	
	                        complete(isSuccess);
	                    })
	                    .fail(function () {
	                        complete(false);
	                    });
	            }
	
	            // load templates
	            var remaining = resourceUrl.length;
	            for (var i = 0, n = remaining; i < n; i++) {
	                getTemplate(resourceUrl[i]);
	            }
	
	            // if this variable is written before the callbacks are complete then we didn't complete synchronously
	            completedSynchronously = false;
	        }
	    });
	
	/**
	 * The default template cache
	 * @type {photon.templating.TemplateCache}
	 */
	var templateCache = new photon.templating.TemplateCache();
	
	/**
	 * Gets the default template cache
	 * @return {photon.templating.TemplateCache}
	 */
	photon.templating.getCache = function () {
	    return templateCache;
	};
	photon.defineType(
	    /**
	     * @param {photon.templating.Template} [parent]
	     */
	    photon.templating.Template = function (parent, key) {
	        this.parent_ = null;
	        if (parent) {
	            parent.addChild(this);
	        }
	
	        if (key) {
	            this.key_ = key;
	        }
	    },
	    /**
	     * lends : photon.templating.Template.prototype
	     */
	    {
	        /**
	         * Releases resources associated with the entry
	         */
	        dispose:function () {
	            var children = this.children_;
	            if (children) {
	                for (var i = 0, n = children.length; i < n; i++) {
	                    children[i].dispose();
	                }
	            }
	        },
	        /**
	         * Gets the entries key
	         * @return {*}
	         */
	        getKey:function () {
	            return this.key_;
	        },
	        /**
	         * Adds a child entry
	         * @param {photon.templating.Template} value
	         */
	        addChild:function (value) {
	            value.parent_ = this;
	
	            var children = this.children_;
	            if (children) {
	                children.push(value);
	            } else {
	                /**
	                 * Stores child entries
	                 * @type {Array}
	                 * @private
	                 */
	                this.children_ = [value];
	            }
	        },
	        /**
	         * Gets a child entry by index
	         * @param {Number} index
	         * @return {photon.templating.Template}
	         */
	        getChild:function (index) {
	            return this.children_ ? this.children_[index] : 0;
	        },
	        /**
	         * Gets the number of child entries contained by the entry
	         * @return {Number}
	         */
	        getChildCount:function () {
	            return this.children_ ? this.children_.length : 0;
	        },
	        /**
	         * Gets the entries parent
	         * @return {photon.templating.Template}
	         */
	        getParent:function () {
	            return this.parent_;
	        },
	        /**
	         * Sets the template associated with the entry
	         * @param {String|DocumentFragment} value
	         */
	        setTemplate:function (value) {
	            if (this.html_ || this.fragment_) {
	                throw new Error("Template cannot be modified once set.");
	            }
	
	            if (photon.isDocumentFragment(value)) {
	                /**
	                 * @type {DocumentFragment}
	                 * @private
	                 */
	                this.fragment_ = value;
	            } else {
	                /**
	                 * @type {String}
	                 * @private
	                 */
	                this.html_ = value;
	            }
	        },
	        /**
	         * Gets the template as a html string.
	         * @return {String}
	         */
	        getHtml:function () {
	            if (!this.html_) {
	                if (!this.fragment_) {
	                    return null;
	                }
	                this.html_ = photon.dom.getHtml(this.fragment_);
	            }
	            return this.html_;
	        },
	        /**
	         * Gets the template as a document fragment
	         * @return {DocumentFragment}
	         */
	        getFragment:function () {
	            if (!this.fragment_) {
	                if (!this.html_) {
	                    return this.fragment_ = document.createDocumentFragment();
	                }
	
	                // parse html
	                var fragmentOrNode = photon.dom.htmlToFragmentOrNode(this.html_);
	
	                // if not already a fragment then wrap in fragment
	                var fragment = fragmentOrNode;
	                if (!photon.isDocumentFragment(fragmentOrNode)) {
	                    fragment = document.createDocumentFragment();
	                    fragment.appendChild(fragmentOrNode);
	                }
	
	                // set template fragment
	                this.fragment_ = fragment;
	            }
	
	            // always return a copy
	            return this.fragment_.cloneNode(true);
	        },
	        insertBefore : function(parentElement, referenceElement, dataContextParentElement) {
	            return photon.templating.insertBefore(parentElement, this.getFragment(), referenceElement, dataContextParentElement);
	        }
	    });
	/**
	 * Cache storage for flow templates
	 * @private
	 * @type {Object}
	 */
	var flowTemplateCache = {};
	
	/**
	 * Next key for a flow template
	 * @private
	 * @type {Number}
	 */
	var nextFlowTemplateKey = 0;
	
	/**
	 * Attribute name for data template identifiers
	 * @const
	 * @type {String}
	 */
	var ATTR_TEMPLATE_ID = "data-template-id";
	
	function isFlowTemplateParent(element) {
	    return this === element || element.flowTemplate_;
	}
	
	function findFlowTemplateParent(element, rootElement) {
	    if (element === rootElement) {
	        return null;
	    }
	    var parent = photon.dom.findParent(element,
	        isFlowTemplateParent, rootElement);
	    return parent ? parent.flowTemplate_ : null;
	}
	
	function createFlowTemplate(rootEntries, element, rootElement) {
	    // find parent
	    var parent = findFlowTemplateParent(element, rootElement);
	
	    // create template node
	    var template = new photon.templating.FlowTemplate(parent);
	    if (!template.getParent()) {
	        rootEntries.push(template);
	    }
	
	    // associate items
	    template.element_ = element;
	    element.flowTemplate_ = template;
	
	    // associate key
	    element.setAttribute(ATTR_TEMPLATE_ID,
	        template.getKey());
	}
	
	function prepareFlowTemplate(template) {
	    var element = template.element_;
	    if (element) {
	        // prepare children
	        var children = template.children_;
	        if (children) {
	            for (var i = 0, n = children.length; i < n; i++) {
	                prepareFlowTemplate(children[i]);
	            }
	        }
	
	        // extract template
	        template.setTemplate(element.innerHTML);
	        photon.dom.empty(element);
	
	        // remove target association, its no longer required and the node is likely to be removed anyway
	        delete template.element_;
	    }
	}
	
	photon.defineType(
	    /**
	     * @param {Template} parent
	     */
	    photon.templating.FlowTemplate = function (parent) {
	        flowTemplateCache[++nextFlowTemplateKey] = this;
	        photon.templating.FlowTemplate.base(this, parent,
	            nextFlowTemplateKey);
	
	    },
	    photon.templating.Template,
	    /**
	     * @lends  photon.templating.FlowTemplate.prototype
	     */
	    {
	        dispose:function () {
	            // already disposed?
	            var key = this.key_;
	            if (!key) {
	                return;
	            }
	
	            // invoke base dispose
	            photon.templating.FlowTemplate
	                .superType.dispose.call(this);
	
	            // remove ourselves from the cache
	            delete flowTemplateCache[key];
	            delete this.key_;
	        }
	    },
	    /**
	     * @lends photon.templating.FlowTemplate
	     */
	    {
	        getForElement:function (element) {
	            return flowTemplateCache[element.getAttribute(ATTR_TEMPLATE_ID)];
	        }
	    });
	
	/**
	 * Prepares flow templates on the specified element
	 *
	 * @param {HTMLElement} element
	 */
	photon.templating.prepareFlowTemplates = function (element) {
	    var rootTemplates = [];
	    if (element.nodeType === 1 && element.getAttribute("data-flow") && !element.getAttribute(ATTR_TEMPLATE_ID)) {
	        createFlowTemplate(rootTemplates, element, element);
	    }
	    $('*[data-flow]:not(*[data-template-id])', element).each(function (i, current) {
	        createFlowTemplate(rootTemplates, current, element);
	    });
	
	    for (var i = 0, n = rootTemplates.length; i < n; i++) {
	        prepareFlowTemplate(rootTemplates[i]);
	    }
	
	    return rootTemplates;
	};
	
	/**
	 * Gets the flow template cache, DO NOT ACCESS DIRECTLY, used only for debug and test purposes
	 *
	 * @return {Object}
	 * @private
	 */
	photon.templating.getFlowTemplateCache_ = function () {
	    return flowTemplateCache;
	};
	
	/**
	 * Subscribe to node cleanup events so we can remove flow templates
	 */
	photon.dom.subscribeToCleanup(function (node) {
	    if (photon.isElement(node)) {
	        var template = node.flowTemplate_;
	        if (template) {
	            if (!template.getParent()) {
	                template.dispose();
	            }
	            node.flowTemplate_ = undefined;
	        }
	    }
	});
	/**
	 * Pools nodes for rendering
	 *
	 * @private
	 * @param {photon.templating.Template} template
	 * @constructor
	 */
	var TemplatePool = function (template) {
	    this.pool_ = [];
	    this.poolIndex_ = 0;
	    this.template_ = template;
	};
	
	photon.defineType(TemplatePool,
	    /**
	     * @lends TemplatePool.prototype
	     */
	    {
	        addToPool:function (templateNodes) {
	            this.pool_.push(templateNodes);
	
	            // remove from from (if attached)
	            photon.array.forEach(templateNodes,
	                photon.dom.remove);
	        },
	        /**
	         * Gets a template from the pool
	         * @return {*}
	         */
	        getFragment:function () {
	            if (this.poolIndex_ < this.pool_.length) {
	                // grab node(s) from pool
	                var result = this.pool_[this.poolIndex_++];
	
	                // if single node then return
	                if (result.length === 1) {
	                    return result[0];
	                }
	
	                // otherwise add to fragment
	                var fragment = document.createDocumentFragment();
	                for (var i = 0, n = result.length; i < n; i++) {
	                    fragment.appendChild(result[i]);
	                }
	                return fragment;
	            }
	            return this.template_.getFragment();
	        },
	        dispose:function () {
	            for (var i = this.poolIndex_, n = this.pool_.length; i < n; i++) {
	                photon.dom.cleanNodes(this.pool_[i]);
	            }
	            this.pool_ = this.poolIndex_ = undefined;
	        }
	    });
	photon.templating.Renderer = function (referenceElement, renderTarget, template) {
	    this.referenceElement_ = referenceElement;
	    this.renderTarget_ = renderTarget;
	    this.template_ = template;
	}
	
	photon.defineType(photon.templating.Renderer,
	    /**
	     * @lends photon.templating.Renderer.prototype
	     */
	    {
	        dispose:function () {
	            this.referenceElement_ = this.data_ = this.template_ = undefined;
	        },
	        /**
	         * Gets the reference element
	         * @return {*}
	         */
	        getReferenceElement:function () {
	            return this.referenceElement_;
	        },
	        /**
	         * Sets the renderer data
	         * @param {Object} value
	         * @param {Boolean} [refresh] A value indicating whether a refresh should be performed even if the data has not changed.
	         */
	        setData:function (value, refresh) {
	            if (this.data_ !== value) {
	                this.data_ = value;
	                this.onDataChanged();
	            } else if (refresh) {
	                this.refresh();
	            }
	        },
	        /**
	         * Gets the renderer data
	         * @return {*}
	         */
	        getData:function () {
	            return this.data_;
	        },
	        /**
	         * Called when the renderer data has changed
	         * @protected
	         */
	        onDataChanged:function () {
	            this.refresh();
	        },
	        /**
	         * Refreshes the rendered view
	         * @public
	         */
	        refresh:function () {
	        }
	    });
	photon.templating.ConditionalRenderer = function (referenceElement, renderTarget, template) {
	    photon.templating.ConditionalRenderer.base(this, referenceElement, renderTarget, template);
	}
	
	photon.defineType(photon.templating.ConditionalRenderer,
	    photon.templating.Renderer,
	    /**
	     * @lends photon.templating.Renderer.prototype
	     */
	    {
	        refresh:function () {
	            var renderedNodes = this.renderedNodes_, referenceElement = this.referenceElement_;
	            if (this.data_) {
	                if (renderedNodes) {
	                    return;
	                }
	                var renderedNodes = this.renderedNodes_ = this.renderTarget_ === photon.templating.RenderTarget.Child ?
	                    this.template_.insertBefore(referenceElement, null) :
	                    this.template_.insertBefore(referenceElement.parentNode, referenceElement.nextSibling, referenceElement);
	            }
	            else if (renderedNodes) {
	                photon.array.forEach(renderedNodes,
	                    photon.dom.removeAndClean);
	                this.renderedNodes_ = null;
	            }
	        }
	    });
	photon.templating.ItemsRenderer = function (referenceElement, renderTarget, template) {
	    photon.templating.ItemsRenderer.base(this, referenceElement, renderTarget, template);
	};
	
	photon.defineType(
	    photon.templating.ItemsRenderer,
	    photon.templating.Renderer,
	    /**
	     * @lends photon.templating.ItemsRenderer.prototype
	     */
	    {
	        dispose:function () {
	            this.subscribe_(null);
	            this.superType.dispose.call(this);
	
	            /*  Clear node references, there should be no need to clean the nodes as
	                they will be cleaned during dom cleanup. */
	            this.renderedNodes_ = null;
	        },
	        /**
	         * Refreshes the rendered view
	         */
	        refresh:function () {
	            if (this.data_) {
	                var data = this.data_;
	                this.subscribe_(data);
	                data = photon.observable.unwrap(data) || [];
	                this.render_(this.itemsCopy_ || [], data);
	                this.itemsCopy_ = data.slice(0);
	            }
	        },
	        /**
	         * @param items
	         * @private
	         */
	        subscribe_:function (items) {
	            var subscriber = this.subscriber_;
	            if (subscriber && subscriber.getOwner() !== items) {
	                subscriber.dispose();
	                this.subscriber_ = subscriber = null;
	            }
	
	            if (!subscriber && items && items.subscribe) {
	                this.subscriber_ = items.subscribe(this.refresh, this);
	            }
	        },
	        /**
	         * @param {Array} oldItems
	         * @param {Array} newItems
	         * @private
	         */
	        render_:function (oldItems, newItems) {
	            this.renderedNodes_ = this.renderedNodes_ || [];
	
	            var diffs = photon.array.diff(oldItems, newItems),
	                diff,
	                startA,
	                referenceElement = this.referenceElement_,
	                nodeSets = this.renderedNodes_,
	                nodeSet,
	                offset = 0,
	                defaultReferenceNode = null,
	                templatePool = new TemplatePool(this.template_),
	                parentNode = this.renderTarget_ === photon.templating.RenderTarget.Child ?
	                    referenceElement :
	                    referenceElement.parentNode,
	                dataContext = photon.binding.DataContext.getForElement(referenceElement);
	
	            // process set/delete
	            for (var diffIndex = 0, diffLength = diffs.length; diffIndex < diffLength; diffIndex++) {
	                // get current diff
	                diff = diffs[diffIndex];
	
	                // get the number of items that could be set (rather than delete/insert)
	                var setLength = Math.min(diff.deletedA, diff.insertedB);
	
	                // extract deletions into pool
	                startA = diff.startA - offset;
	                for (var delIndex = startA, delEnd = startA + diff.deletedA - setLength; delIndex < delEnd; delIndex++, offset++) {
	                    templatePool.addToPool(nodeSets[delIndex]);
	                }
	
	                // update node sets
	                nodeSets.splice(startA, diff.deletedA - setLength);
	
	                // apply set operations
	                for (var setIndex = 0; setIndex < setLength; setIndex++) {
	                    var nodeSet = nodeSets[startA++];
	                    var node = photon.array.find(nodeSet, function(node) {
	                        return photon.binding.DataContext.getLocalForElement(node) != null
	                    })
	                    if (node) {
	                        photon.binding.DataContext.getLocalForElement(node).setSource(newItems[diff.startB + setIndex]);
	                    }
	                }
	
	                // update diff (should now only contain adjusted inserts)
	                diff.startA = startA;
	                diff.startB = diff.startB + setLength;
	                diff.insertedB = diff.insertedB - setLength;
	                diff.deletedA = 0;
	            }
	
	            if (this.renderTarget_ === photon.templating.RenderTarget.NextSibling) {
	                if (nodeSets.length > 0) {
	                    var nodeSet = nodeSets[nodeSets.length - 1];
	                    defaultReferenceNode = nodeSet[nodeSet.length - 1].nextSibling;
	                }
	                else {
	                    defaultReferenceNode = referenceElement.nextSibling;
	                }
	            }
	
	            // process inserts
	            offset = 0;
	            for (diffIndex = 0; diffIndex < diffLength; diffIndex++) {
	                diff = diffs[diffIndex];
	
	                startA = diff.startA + offset;
	
	                var referenceNode = nodeSets[startA] ? nodeSets[startA][0] : defaultReferenceNode;
	                for (var insIndex = diff.startB, insLength = insIndex + diff.insertedB; insIndex < insLength; insIndex++, offset++) {
	                    nodeSets.splice(startA++, 0, photon.templating.insertBeforeAndApplyBindings(
	                        parentNode, templatePool.getFragment(), referenceNode, newItems[insIndex], dataContext));
	                }
	            }
	
	            // clean remaining nodes
	            templatePool.dispose();
	        }
	    }
	);
	/**
	 * @enum {Number}
	 */
	photon.templating.RenderTarget = {
	    /**
	     * @constant
	     */
	    Child:0,
	    /**
	     * @constant
	     */
	    NextSibling:1
	};
	photon.defineType(
	    photon.binding.DataContext = function () {
	        this.value_ = undefined;
	    },
	    /**
	     * @lends photon.binding.DataContext.prototype
	     */
	    {
	        dispose:function () {
	            this.removeFromParent_();
	            delete this.parent_
	        },
	        removeFromParent_:function () {
	            var parent = this.parent_;
	            if (parent) {
	                photon.array.remove(parent.children_, this);
	                if (parent.children_.length === 0) {
	                    delete parent.children_;
	                }
	            }
	        },
	        setParent:function (value) {
	            if (!photon.isNullOrUndefined(value) && !value instanceof photon.binding.DataContext) {
	                throw new Error("Value must be of type DataContext.");
	            }
	
	            var parent = this.parent_;
	            if (parent !== value) {
	                this.removeFromParent_();
	                if (value) {
	                    this.parent_ = value;
	                    if (value.children_) {
	                        value.children_.push(this);
	                    }
	                    else {
	                        value.children_ = [this];
	                    }
	                }
	                else {
	                    delete this.parent_;
	                }
	
	                this.parentChanged();
	            }
	        },
	        getParent:function () {
	            return this.parent_;
	        },
	        getChild:function (index) {
	            return this.children_ ? this.children_[index] : null;
	        },
	        getSource:function () {
	            return this.source_;
	        },
	        setSource:function (value) {
	            if (this.source_ != value) {
	                this.source_ = value;
	                this.updateValue_();
	            }
	        },
	        setBinding : function(value) {
	            if (this.binding_ != value) {
	                this.binding_ =  value;
	                this.updateValue_();
	            }
	        },
	        getBinding : function() {
	           return this.binding_;
	        },
	        updateValue_ : function() {
	            var source = this.source_;
	            if (this.binding_) {
	                // backup the current value
	                var oldValue = this.value_;
	
	                // set to source for the purposes of the evaluation (other options are too expensive)
	                this.value_ = source;
	
	                // evaluate
	                var newValue = this.value_ = this.binding_.getExpression().getSourceValue(this);
	                if (oldValue !== newValue) {
	                    this.onValueChanged_();
	                }
	            }
	            else if (this.value_ !== source) {
	                this.value_ = source;
	                this.onValueChanged_();
	            }
	        },
	        getValue:function () {
	            return this.value_;
	        },
	        setName:function (value) {
	            this.name_ = value;
	        },
	        getName:function () {
	            return this.name_;
	        },
	        onValueChanged_:function () {
	            var subscribers = this.subscribers_;
	            if (subscribers) {
	                subscribers = subscribers.slice(0);
	                photon.array.forEach(subscribers, this.notifyValueChanged, this);
	            }
	        },
	        /**
	         * Adds a subscriber to the data context
	         *
	         * Subscribers must implement the following functions
	         *
	         * dataContextValueChanged : function(dataContext, value) {
	         * }
	         *
	         * @param {object} subscriber
	         * @param {function} subscriber.dataContextValueChanged
	         */
	        addSubscriber:function (subscriber) {
	            if (this.subscribers_) {
	                this.subscribers_.push(subscriber);
	            }
	            else {
	                this.subscribers_ = [subscriber];
	            }
	        },
	        /**
	         * Removes a subscriber from the data context
	         *
	         * @param {Object} subscriber
	         * @returns {Boolean} true if the subscriber was removed; otherwise, false.
	         */
	        removeSubscriber:function (subscriber) {
	            var result = false;
	            if (this.subscribers_) {
	                result = photon.array.remove(this.subscribers_, subscriber);
	                if (this.subscribers_.length === 0) {
	                    delete this.subscribers_;
	                }
	            }
	
	            return result;
	        },
	        notifyValueChanged:function (subscriber) {
	            subscriber.dataContextValueChanged(this, this.value_);
	        },
	        getChildCount:function () {
	            return this.children_ ? this.children_.length : 0;
	        },
	        parentChanged:function () {
	        },
	        get:function (indexOrName) {
	            if (arguments.length === 0) {
	                return this;
	            }
	
	            // TODO: find efficient way to add parents as dependencies
	            var current = this;
	            if (photon.isString(indexOrName)) {
	                while (current && current.getName() !== indexOrName) {
	                    current = current.parent_;
	                }
	            }
	            else {
	                var index = 0;
	                while (index++ < indexOrName && current) {
	                    current = current.parent_;
	                }
	            }
	            return current;
	        }
	    },
	    /**
	     * @lends photon.binding.DataContext
	     */
	    {
	        /**
	         * @static
	         */
	        getForElement:function (element) {
	            for (var current = element; current; current = current.parentDataContextNode || current.parentNode) {
	                var result = this.getLocalForElement(current);
	                if (result) {
	                    return result;
	                }
	            }
	            return null;
	        },
	        getLocalForElement:function (element) {
	            var nodeBindingInfo = photon.binding.NodeBindingInfo.getForElement(element);
	            if (nodeBindingInfo) {
	                var dataContext = nodeBindingInfo.getDataContext();
	                if (dataContext) {
	                    return dataContext;
	                }
	            }
	            return null;
	        }
	    });
	/**
	 * Stores binding information relating to a node
	 * @class
	 */
	photon.binding.NodeBindingInfo = function () {
	};
	
	photon.defineType(
	    photon.binding.NodeBindingInfo,
	    /**
	     * @lends photon.binding.NodeBindingInfo.prototype
	     */
	    {
	        dispose : function() {
	            if (this.dataContext_) {
	                this.dataContext_.dispose();
	                this.dataContext = null;
	            }
	            if (this.bindings_) {
	                // TODO: for now the NodeBindingInfo class is the only thing that disposes of bindings, if that changes this will NOT work.
	                photon.array.forEach(this.bindings_, function(binding) {
	                    binding.dispose();
	                });
	                this.bindings_ = null;
	            }
	        },
	        getBindingCount:function () {
	            return this.bindings_ ? this.bindings_.length : 0;
	        },
	        getBinding:function (index) {
	            return this.bindings_ ? this.bindings_[index] : null;
	        },
	        /**
	         *
	         * @param fn
	         * @param obj
	         * @return {photon.Binding.BindingBase}
	         */
	        findBinding : function(fn, obj) {
	            return this.bindings_ ? photon.array.find(this.bindings_, fn, obj) : null;
	        },
	        addBinding:function (binding) {
	            if (this.bindings_) {
	                this.bindings_.push(binding);
	            }
	            else {
	                this.bindings_ = [binding];
	            }
	        },
	        getBindingByExpression:function (expression) {
	            var expressionText = expression;
	            if (!photon.isString(expression)) {
	                expressionText = expression.getText();
	            }
	
	            return this.bindings_ ?
	                photon.array.find(this.bindings_, function (item) {
	                    return expressionText === item.getExpression().getText();
	                }) :
	                null;
	        },
	        /**
	         *
	         * @return {photon.binding.DataContext}
	         */
	        getDataContext:function () {
	            return this.dataContext_;
	        },
	        /**
	         *
	         * @return {photon.binding.DataContext}
	         */
	        getOrCreateDataContext:function () {
	            return this.dataContext_ ? this.dataContext_ : (this.dataContext_ = new photon.binding.DataContext());
	        }
	    },
	    /* static members */
	    {
	        /**
	         * Gets the NodeBindingInfo instance associated with the node.
	         * @param {Node} element
	         * @returns {photon.binding.NodeBindingInfo}
	         */
	        getForElement:function (element) {
	            var data = photon.getData(element);
	            return data ? data.nodeBindingInfo : null;
	        },
	        getOrCreateForElement:function (element) {
	            var data = photon.getOrCreateData(element);
	            if (data.nodeBindingInfo) {
	                return data.nodeBindingInfo;
	            }
	            data.nodeBindingInfo = new photon.binding.NodeBindingInfo();
	            // TODO: hacky
	            (data.disposables = data.disposables || []).push(data.nodeBindingInfo);
	            return data.nodeBindingInfo;
	        }
	    });
	/** @namespace photon.ui */
	provide("photon.ui");
	photon.defineType(
	    photon.ui.Selector = function (target) {
	        photon.addDisposable(
	            this.target_ = target, this);
	
	        this.items_ = null;
	        this.initializeCount_ = 0;
	        this.evaluationDataContext_ = new photon.binding.DataContext();
	    },
	    /**
	     * lends: photon.ui.Selector.prototype
	     */
	    {
	        dispose:function () {
	            this.disposeSubscriber_();
	        },
	        disposeSubscriber_:function () {
	            var subscriber = this.subscriber_;
	            if (subscriber) {
	                subscriber.dispose();
	                this.subscriber_ = null;
	            }
	        },
	        beginInitialize:function () {
	            if (++this.initializeCount_ === 1) {
	                this.initializeStore_ = {
	                    selectedItem:this.getSelectedItem()
	                };
	            }
	        },
	        endInitialize:function () {
	            if (!--this.initializeCount_) {
	                var store = this.initializeStore_;
	                this.initializeStore_ = null;
	                this.update();
	                this.setSelectedItem(store.selectedItem);
	            }
	        },
	        getInContext:function (dataContext, fn, data) {
	            var evaluationDataContext = dataContext;
	            if (!evaluationDataContext) {
	                evaluationDataContext = this.evaluationDataContext_;
	                evaluationDataContext.setParent(photon.binding.DataContext.getForElement(this.target_));
	                evaluationDataContext.setSource(data);
	            }
	            try {
	                return photon.binding.evaluateInContext(
	                    evaluationDataContext, fn, null);
	            }
	            finally {
	                if (!dataContext) {
	                    evaluationDataContext.setParent(null);
	                    evaluationDataContext.setSource(null);
	                }
	            }
	        },
	        getDisplay:function (item) {
	            if (this.displayEvaluator_) {
	                return this.getInContext(null, this.displayEvaluator_, item);
	            }
	            return item ? item.toString() : "";
	        },
	        getValue:function (item) {
	            if (this.valueEvaluator_) {
	                return this.getInContext(null, this.valueEvaluator_, item);
	            }
	            return item;
	        },
	        getItem_:function (index) {
	            var items = photon.observable.unwrap(this.items_);
	            return items ? items[index] : undefined;
	        },
	        setValueEvaluator:function (value) {
	            if (this.valueEvaluator_ === value) {
	                return;
	            }
	            this.valueEvaluator_ = value;
	        },
	        getValueEvaluator:function () {
	            return this.valueEvaluator_;
	        },
	        setDisplayEvaluator:function (value) {
	            if (this.displayEvaluator_ === value) {
	                return;
	            }
	            this.displayEvaluator_ = value;
	            this.update();
	        },
	        getDisplayEvaluator:function () {
	            return this.displayEvaluator_;
	        },
	        getTarget:function () {
	            return this.target_;
	        },
	        getItems:function () {
	            return this.items_;
	        },
	        setItems:function (value) {
	            if (this.items_ === value) {
	                return;
	            }
	
	            this.disposeSubscriber_();
	
	            this.items_ = value;
	            if (value && value.isObservable) {
	                this.subscriber_ = value.subscribe(this.update, this);
	            }
	
	            this.update();
	        },
	        update:function () {
	            if (this.initializeStore_) {
	                return;
	            }
	
	            var target = this.target_;
	
	            // must store before clearing the dom
	            var currentSelectedItem = this.getSelectedItem();
	
	            // clear current items
	            photon.dom.empty(this.target_);
	
	            if (this.items_) {
	                var items = photon.observable.unwrap(this.items_), text = [], i = 0;
	                photon.array.forEach(items, function (item) {
	                    text[i++] = "<option>";
	                    text[i++] = this.getDisplay(item);
	                    text[i++] = "</option>";
	                }, this);
	
	                $(text.join('')).appendTo(target);
	
	                target.selectedIndex = this.findIndexByValue(currentSelectedItem);
	            }
	        },
	        getSelectedItem:function () {
	            if (this.initializeStore_) {
	                return this.initializeStore_.selectedItem;
	            }
	
	            var index = this.target_.selectedIndex;
	            if (index === -1) {
	                return null;
	            }
	
	            var selectedItem = this.getItem_(index);
	            return this.getValue(selectedItem);
	        },
	        setSelectedItem:function (value) {
	            if (this.getSelectedItem() === value) {
	                return;
	            }
	
	            if (this.initializeStore_) {
	                this.initializeStore_.selectedItem = value;
	            }
	            else {
	                this.getTarget().selectedIndex = this.findIndexByValue(value);
	            }
	        },
	        findIndexByValue:function (value) {
	            if (this.items_) {
	                return photon.array.findIndex(photon.observable.unwrap(this.items_), function (item) {
	                    return this.getValue(item) === value;
	                }, this);
	            }
	            return -1;
	        }
	    });
	
	
	photon.defineType(
	    photon.ui.SelectorProperty = function (propertyName) {
	        this.propertyName_ = propertyName;
	    },
	    photon.binding.data.Property,
	    {
	        getSelector:function (binding) {
	            var data = photon.getOrCreateData(binding.getTarget());
	            return data.control = data.control ||
	                new photon.ui.Selector(binding.getTarget());
	        },
	        beginInitialize:function (binding) {
	            var target = binding.getTarget();
	            if (target.tagName !== "SELECT") {
	                throw new Error("Expected selector");
	            }
	
	            this.getSelector(binding).beginInitialize();
	        },
	        endInitialize:function (binding) {
	            this.getSelector(binding).endInitialize();
	        },
	        getValue:function (binding) {
	            return this.getSelector(binding)["get" + this.propertyName_]();
	        },
	        setValue:function (binding) {
	            this.getSelector(binding)["set" + this.propertyName_](binding.getSourceValue());
	        }
	    });
	
	photon.defineType(
	    photon.ui.SelectorItemsProperty = function () {
	        photon.ui.SelectorItemsProperty.base(this, "Items");
	    },
	    photon.ui.SelectorProperty);
	
	photon.defineType(
	    photon.ui.SelectorSelectedItemProperty = function () {
	        photon.ui.SelectorSelectedItemProperty.base(this, "SelectedItem");
	    },
	    photon.ui.SelectorProperty,
	    /**
	     * @lends: photon.binding.data.SelectorSelectedItemProperty.prototype
	     */
	    {
	        getDefaultBindingMode:function () {
	            return photon.binding.data.DataBindingMode.TwoWay;
	        },
	        bindUpdateSourceTriggers:function (binding) {
	            binding.bindUpdateSourceEvent("change");
	        }
	    }
	);
	
	photon.defineType(
	    photon.ui.SelectorDisplayProperty = function () {
	        photon.ui.SelectorDisplayProperty.base("DisplayEvaluator");
	    },
	    photon.ui.SelectorProperty,
	    {
	        setValue:function (binding) {
	            var evaluator = binding.getSourceValue();
	            var expression = photon.binding.BindingContext.getInstance().parseBindingExpressions(
	                "data-bind", "null:" + evaluator)[0];
	            this.getSelector(binding).setDisplayEvaluator(expression.getGetter());
	        }
	    }
	);
	
	photon.defineType(
	    photon.ui.SelectorValueProperty = function () {
	        photon.ui.SelectorValueProperty.base("ValueEvaluator");
	    },
	    photon.ui.SelectorProperty,
	    {
	        setValue:function (binding) {
	            var evaluator = binding.getSourceValue();
	            var expression = photon.binding.BindingContext.getInstance().parseBindingExpressions("data-bind",
	                "null:" + evaluator)[0];
	            this.getSelector(binding).setValueEvaluator(expression.getGetter());
	        }
	    }
	);
	
	photon.binding.data.properties["select.selectedItem"] = new photon.ui.SelectorSelectedItemProperty();
	photon.binding.data.properties["select.items"] = new photon.ui.SelectorItemsProperty();
	photon.binding.data.properties["select.value"] = new photon.ui.SelectorValueProperty();
	photon.binding.data.properties["select.display"] = new photon.ui.SelectorDisplayProperty();

    });
})(window);
