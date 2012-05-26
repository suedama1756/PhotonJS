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



