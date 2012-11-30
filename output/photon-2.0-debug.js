(function(window, document){
    (function(factory) {
        if (typeof define === 'function' && define.amd) {
            define(['exports', 'jquery'], factory);
        } else if (window) {
            var ns = window['photon'] = window['photon'] || {};
            factory(ns, window['jQuery']);
        }
    })(function(photon, $) {
        "use strict";    photon.version = '0.7.0.1';
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
        
        
        /**
         * @typedef {
         *     defines : (function(function|object) : TypeBuilder)
         * }
         */
        var TypeBuilder;
        
        
        /**
         * @param constructor
         * @return {TypeBuilder}
         */
        function type(constructor) {
            var members_ = {
        
            };
        
            var typeInfo_ = {
                name : null,
                baseType : null,
                base : null,
                type : null
            };
        
            return  {
                'name':function (name) {
                    typeInfo_.name = name;
                    return this;
                },
                'inherits':function (baseType) {
                    typeInfo_.baseType = baseType;
                    return this;
                },
                'defines':function (members) {
                    if (isFunction(members)) {
                        members = members(function() {
                            return typeInfo_.base;
                        });
                    }
                    extend(members_, members);
                    return this;
                },
                'exports' : function(callback) {
                    extend(members_, callback(members_));
                    return this;
                },
                'build':function () {
                    if (isNullOrUndefined(constructor)) {
                        constructor = function () {
                        };
                    }
                    typeInfo_.name = typeInfo_.name || constructor.name;
        
        
                    // how do we avoid this, can we simply create a constructor with two many arguments? is that faster?
                    /*
                        Why are we trying to do this again? Because we can FIX methods like toString, valueOf in IE...
                        Should also copy existing methods from constructor prototype.
                        Calling base on toString for types in IE will probably fail, we need to validate this.
                     */
        
                    if (!members_.hasOwnProperty('toString')) {
                        members_['toString'] = function() {
                            return "[object " + (typeInfo_.name || "Object") + "]";
                        };
                    }
        
                    function Prototype() {
                    }
        
                    if (typeInfo_.baseType) {
                        typeInfo_.base = typeInfo_.baseType.prototype;
                        Prototype.prototype = typeInfo_.base;
                    }
        
                    var typeInfo = {
                        'name':function () {
                            return typeInfo_.name;
                        },
                        'baseType':function () {
                            return typeInfo_.baseType;
                        }
                    };
        
                    constructor['typeInfo'] = function () {
                        return typeInfo;
                    };
                    var prototype = constructor.prototype = new Prototype();
                    prototype.constructor = constructor;
        
                    if (members_) {
                        photon.extend(prototype, members_,
                            photon.extend.filterHasOwnProperty, function (source, propertyName) {
                                return source[propertyName];
                            });
                    }
                    prototype['__TYPE_INFO__'] = constructor['typeInfo'];
                    return constructor;
                }
            };
        }
        
        photon['typeInfo'] = function (obj) {
            return obj['__TYPE_INFO__']();
        };
        
        photon['type'] = type;
        
        // TODO: Work through details of minification of enumerators.
        // Concat will currently fail when working with non-enumerable values, e.g. concat([1,2,3], 4);
        
        
        var NO_VALUE = {};
        /**
         * @const
         * @type {Number}
         */
        var STATE_NOT_STARTED = 0;
        /**
         * @const
         * @type {Number}
         */
        var STATE_IN_PROGRESS = 1;
        /**
         * @const
         * @type {Number}
         */
        var STATE_COMPLETED = 3;
        
        function defaultSelector(item) {
            return item;
        }
        
        
        function toSelector(selector) {
            return isString(selector) ? function (x) {
                return x[selector];
            } : selector || defaultSelector;
        }
        
        function defaultComparer(x, y) {
            if (x === y) {
                return 0;
            }
        
            if (x < y) {
                return -1;
            }
        
            if (x > y) {
                return 1;
            }
        
            return -2;
        }
        
        
        function enumerator() {
            var _state = STATE_NOT_STARTED,
                _value;
        
            function progress(value) {
                _value = value;
                return !!(_state = STATE_IN_PROGRESS);
            }
        
            function end() {
                return !(_state = STATE_COMPLETED);
            }
        
        
            function current() {
                if (_state === STATE_NOT_STARTED) {
                    throw new Error('Enumeration has not started.');
                }
                if (_state === STATE_COMPLETED) {
                    throw new Error('Enumeration has completed.');
                }
                return _value;
            }
        
            return {
                current:current,
                progress:progress,
                end:end
            };
        }
        
        function fromArrayLike(arrayLike) {
            return function () {
                var index = -1, controller = enumerator();
                return exportEnumerator(function () {
                        if (index !== -2) {
                            var length = arrayLike.length;
                            while (++index < length) {
                                if (index in arrayLike) {
                                    return controller.progress(arrayLike[index]);
                                }
                            }
                            index = -2;
                        }
        
                        return controller.end();
                    },
                    controller.current);
            };
        }
        
        function fromString(text) {
            return function () {
                var index = -1, length = text.length, controller = enumerator();
                return exportEnumerator(function () {
                        if (index !== -2) {
                            return ++index < length ? controller.progress(text.charAt(index)) :
                                index = -2 && controller.end();
                        }
                        return false;
        
                    },
                    controller.current);
            };
        }
        
        function getObjectKey(obj) {
            var type = Object.prototype.toString.call(obj);
            return type === '[object Object]' || obj.valueOf() === obj ?
                'o' + getUID(obj) :
                type + obj.valueOf();
        }
        
        function getKey(obj) {
            var type = typeof obj;
            return type === 'object' && obj !== null ?
                getObjectKey(obj) :
                type.charAt(0) + obj;
        }
        
        function makeGetEnumerator(source) {
            if (isArray(source) || isArrayLike(source)) {
                return fromArrayLike(source);
            }
            if (isString(source)) {
                return fromString(source);
            }
            if (isFunction(source)) {
                return source;
            }
        }
        
        function select(getEnumerator, selector) {
            selector = toSelector(selector);
            return function () {
                var controller = enumerator(), source = getEnumerator(), index = 0;
                return exportEnumerator(function () {
                    return (source.moveNext() && controller.progress(selector(source.current(), index++))) || controller.end();
                }, controller.current);
            }
        }
        
        function where(getEnumerator, predicate) {
            return function () {
                var controller = enumerator(), source = getEnumerator(), index = 0;
                return exportEnumerator(function () {
                        while (source.moveNext()) {
                            var value = source.current();
                            if (predicate(value, index++)) {
                                return controller.progress(value);
                            }
                        }
                        return controller.end();
                    },
                    controller.current);
            }
        }
        
        function concat(getEnumerator, values) {
            return function () {
                var controller = enumerator(),
                    current = getEnumerator(),
                    next = select(makeGetEnumerator(values), function (x) {
                        return ((x && isObject(x) && x.getEnumerator) ||
                            makeGetEnumerator(Array.isArray(x) ? x : [x]))();
                    })();
        
                return exportEnumerator(function () {
                        while (!current.moveNext()) {
                            if (!next.moveNext()) {
                                return controller.end();
                            }
                            current = next.current();
                        }
                        return controller.progress(current.current());
                    },
                    controller.current);
            };
        }
        
        function groupBy(getEnumerator, keySelector) {
            keySelector = keySelector || defaultSelector;
            return function () {
                var groups = {},
                    source = getEnumerator(),
                    controller = enumerator(),
                    pendingGroups = [],
                    pendingGroupIndex = 0;
        
                function addGroup(itemKey, items, groupKey) {
                    var groupSource = enumerable(
                        function () {
                            var groupSource = enumerator(), itemIndex = 0;
                            return exportEnumerator(function () {
                                    return (itemIndex < items.length || moveNext(true, groupKey)) ?
                                        groupSource.progress(items[itemIndex++]) :
                                        groupSource.end();
                                },
                                groupSource.current);
                        });
                    groupSource.key = itemKey;
        
                    return groups[groupKey] = {
                        items:items,
                        groupSource:groupSource
                    }
                }
        
                function moveNext(matchKey, keyToMatch) {
                    if (!matchKey) {
                        if (pendingGroupIndex < pendingGroups.length) {
                            return controller.progress(pendingGroups[pendingGroupIndex++].groupSource);
                        } else if (pendingGroupIndex !== 0) {
                            pendingGroups = [];
                            pendingGroupIndex = 0;
                        }
                    }
        
                    while (source.moveNext()) {
                        var item = source.current(),
                            itemKey = keySelector(item),
                            groupKey = getKey(itemKey);
        
                        if (groups.hasOwnProperty(groupKey)) {
                            groups[groupKey].items.push(item);
                            if (matchKey && keyToMatch === groupKey) {
                                return true;
                            }
                        } else {
                            var group = addGroup(itemKey, [item], groupKey);
                            if (matchKey) {
                                pendingGroups.push(group);
                            } else {
                                controller.progress(group.groupSource);
                            }
        
                            if (!matchKey) {
                                return true;
                            }
                        }
        
                    }
                    return matchKey ? false : controller.end();
                }
        
                return exportEnumerator(
                    function () {
                        return moveNext(false);
                    },
                    controller.current);
            };
        }
        
        
        function aggregate(getEnumerator, accumulator, seed, empty) {
            var source = getEnumerator(), index = 0;
            while (source.moveNext()) {
                seed = accumulator(seed, source.current(), index++);
            }
            return index ? seed : empty;
        }
        
        function exportEnumerator(moveNext, current) {
            return {
                moveNext:moveNext,
                current:current
            };
        }
        
        function extremum(getEnumerator, comparer, direction) {
            comparer = comparer || defaultComparer;
            return aggregate(getEnumerator, function (accumulated, next, index) {
                return !index || comparer(next, accumulated) === direction ?
                    next :
                    accumulated;
            }, undef, NO_VALUE);
        }
        
        function min(getEnumerator, comparer) {
            return valueOrDefault(extremum(getEnumerator, comparer, -1));
        }
        
        function max(getEnumerator, comparer) {
            return valueOrDefault(extremum(getEnumerator, comparer, 1));
        }
        
        function skip(getEnumerator, count) {
            return function () {
                var source = getEnumerator(), index = -1;
                return exportEnumerator(function () {
                        var result;
                        while (index < count && (result = source.moveNext())) {
                            index++;
                        }
                        return result || source.moveNext();
                    },
                    source.current);
        
            }
        }
        
        function take(getEnumerator, count) {
            return function () {
                var source = getEnumerator(), controller = enumerator(), taken = 0;
                return exportEnumerator(function () {
                        if (taken < count && source.moveNext()) {
                            taken++;
                            return controller.progress(source.current());
                        }
                        return controller.end();
                    },
                    controller.current);
            }
        }
        
        function distinct(getEnumerator, keySelector) {
            keySelector = keySelector || defaultSelector;
            return function () {
                var seen;
                return where(function () {
                    seen = {};
                    return getEnumerator();
                }, function (item) {
                    var key = getKey(keySelector(item));
                    return !seen.hasOwnProperty(key) && (seen[key] = true);
                })();
            }
        }
        
        
        function toArray(getEnumerator) {
            var result = [], index = 0, source = getEnumerator();
            while (source.moveNext()) {
                result[index++] = source.current();
            }
            return result;
        }
        
        function findNext(enumerator, predicate) {
            while (enumerator.moveNext()) {
                var current = enumerator.current();
                if (!predicate || predicate(current)) {
                    return current;
                }
            }
        
            return NO_VALUE;
        }
        
        function findLast(enumerator, predicate) {
            var lastFound = NO_VALUE, current;
            while ((current = findNext(enumerator, predicate)) !== NO_VALUE) {
                lastFound = current;
            }
            return lastFound;
        }
        
        function valueOrThrow(value) {
            if (value === NO_VALUE) {
                throw new Error('No match found.');
            }
            return value;
        }
        
        function valueOrDefault(value, defaultValue) {
            return value === NO_VALUE ? defaultValue : value;
        }
        
        function enumerable(source) {
            if (source instanceof Enumerable) {
                return source;
            }
            return new Enumerable(makeGetEnumerator(source));
        }
        
        function Enumerable(getEnumerator) {
            this['getEnumerator'] = this.getEnumerator_ = getEnumerator;
        }
        
        function forEach(getEnumerator, callback, thisObj) {
            var source = getEnumerator(), index = 0;
            while (source.moveNext()) {
                callback.call(thisObj, source.current(), index++);
            }
        }
        function reverse(getEnumerator) {
            return function () {
                return fromArrayLike(toArray(getEnumerator).reverse())();
            };
        }
        
        function makeSelector(selector) {
            return isString(selector) ? function (x) {
                return x[selector];
            } : selector || defaultSelector;
        }
        
        function makeSelectors(selectors) {
            if (!isArray(selectors)) {
                selectors = [selectors || defaultSelector];
            }
            return select(makeGetEnumerator(selectors), makeSelector);
        }
        
        function makeComparer(orderByDescriptors) {
            if (orderByDescriptors.moveNext()) {
                var curr = orderByDescriptors.current(),
                    next = makeComparer(orderByDescriptors),
                    selector = makeSelector(curr.selector),
                    direction = curr.direction,
                    comparer = curr.comparer;
        
        
                return function (x, y) {
                    return (comparer(selector(x), selector(y)) * direction) || next(x, y);
                };
            }
            return function () {
                return 0;
            };
        }
        
        function makeOrderByDescriptors(selectors, comparer, direction) {
            return select(makeSelectors(selectors), function (selector) {
                return {
                    selector:selector,
                    direction:direction,
                    comparer:comparer || defaultComparer
                };
            });
        }
        
        function orderByNext(getEnumerator, orderByDescriptors) {
            return extend(
                enumerable(function () {
                    return makeGetEnumerator(toArray(getEnumerator).sort(
                        makeComparer(orderByDescriptors())))();
                }),
                {
                    'thenBy':function (selectors, comparer) {
                        return orderByNext(getEnumerator, concat(orderByDescriptors,
                            makeOrderByDescriptors(selectors, comparer, 1)));
                    },
                    'thenByDesc':function (selectors, comparer) {
                        return orderByNext(getEnumerator, concat(orderByDescriptors,
                            makeOrderByDescriptors(selectors, comparer, -1)));
                    }
                });
        }
        
        extend(
            Enumerable.prototype,
            {
                select:function (selector) {
                    return enumerable(select(this.getEnumerator_, selector));
                },
                where:function (predicate) {
                    return enumerable(where(this.getEnumerator_, predicate));
                },
                first:function (predicate) {
                    return valueOrThrow(
                        findNext(this.getEnumerator_(), predicate));
                },
                firstOrDefault:function (predicate, defaultValue) {
                    return valueOrDefault(
                        findNext(this.getEnumerator_(), predicate), defaultValue);
                },
                last:function (predicate) {
                    return valueOrThrow(
                        findLast(this.getEnumerator_(), predicate));
                },
                lastOrDefault:function (predicate, defaultValue) {
                    return valueOrDefault(
                        findLast(this.getEnumerator_(), predicate), defaultValue);
                },
                toArray:function () {
                    return toArray(this.getEnumerator_);
                },
                aggregate:function (accumulator, seed, empty) {
                    return aggregate(this.getEnumerator_, accumulator,
                        seed, empty);
                },
                min:function (comparer) {
                    return min(this.getEnumerator_, comparer);
                },
                max:function (comparer) {
                    return max(this.getEnumerator_, comparer);
                },
                extremum:function (comparer) {
                    return extremum(this.getEnumerator_, comparer);
                },
                sum:function () {
                    return aggregate(this.getEnumerator_, function (accumulated, next) {
                        return accumulated + toNumber(next);
                    }, 0, NaN);
                },
                any:function (predicate) {
                    return findNext(this.getEnumerator_(), predicate) !== NO_VALUE;
                },
                skip:function (count) {
                    return enumerable(skip(this.getEnumerator_, count));
                },
                take:function (count) {
                    return enumerable(take(this.getEnumerator_, count));
                },
                distinct:function (keySelector) {
                    return enumerable(distinct(this.getEnumerator_, keySelector));
                },
                groupBy:function (keySelector) {
                    return enumerable(groupBy(this.getEnumerator_, keySelector));
                },
                average:function () {
                    var count = 0;
                    return aggregate(this.getEnumerator_, function (accumulated, next) {
                        count++;
                        return accumulated + toNumber(next);
                    }, 0, NaN) / count;
                },
                forEach:function (callback, thisObj) {
                    forEach(this.getEnumerator_, callback, thisObj);
                },
                reverse:function () {
                    return enumerable(reverse(this.getEnumerator_));
                },
                orderBy:function (selectors, comparer) {
                    return orderByNext(this.getEnumerator_, makeOrderByDescriptors(selectors, comparer, 1));
                },
                concat:function () {
                    return enumerable(concat(this.getEnumerator_, arrayPrototype.slice.call(arguments)));
                },
                orderByDesc:function (selectors, comparer) {
                    return orderByNext(this.getEnumerator_, makeOrderByDescriptors(selectors, comparer, -1));
                }
            });
        
        
        //enumerable.regexExec = function (regex, text, startIndex, includeTerminal) {
        //    return enumerable(function () {
        //        var controller = enumerator(), index = startIndex, restoreLastIndex;
        //        return exportEnumerator(function () {
        //                var match, result;
        //                if (index === text.length) {
        //                    result = includeTerminal ? controller.progress(null) : controller.end(), index = -1;
        //                } else if (index === -1) {
        //                    result = controller.end();
        //                } else {
        //                    restoreLastIndex = regex.lastIndex, regex.lastIndex = index;
        //                    result = (match = regex.exec(text)) ?
        //                        controller.progress(match) :
        //                        controller.end();
        //                    index = regex.lastIndex, regex.lastIndex = restoreLastIndex;
        //                }
        //                return result;
        //
        //            },
        //            controller.current
        //        )
        //    });
        //}
        
        function regexExec(regex, text, startIndex, terminal) {
            return function () {
                var controller = enumerator(), index = startIndex, restoreLastIndex;
                return exportEnumerator(function () {
                        var match, result;
                        if (index === text.length) {
                            result = !isUndefined(terminal) ? controller.progress(terminal) : controller.end(), index = -1;
                        } else if (index === -1) {
                            result = controller.end();
                        } else {
                            restoreLastIndex = regex.lastIndex, regex.lastIndex = index;
                            result = (match = regex.exec(text)) ?
                                controller.progress(match) :
                                controller.end();
                            index = regex.lastIndex, regex.lastIndex = restoreLastIndex;
                        }
                        return result;
        
                    },
                    controller.current
                )
            };
        }
        
        enumerable.regexExec = function (regex, text, startIndex) {
            return enumerable(regexExec(regex, text, startIndex));
        }
        
        
        enumerable.value = function (value) {
            var isComplete = false;
            return enumerable(exportEnumerator(function () {
                if (!isComplete) {
                    return isComplete = true;
                }
                return false;
            }, function () {
                if (isComplete) {
                    throw new Error();
                }
                return value;
            }))
        }
        
        enumerable.sequence = function (fromInclusive, toExclusive, selector) {
            return enumerable(function () {
                var controller = enumerator();
                return exportEnumerator(function () {
                        return fromInclusive < toExclusive ?
                            controller.progress(selector ? selector(fromInclusive++) : fromInclusive++) :
                            controller.end();
        
                    },
                    controller.current
                )
            });
        }
        
        photon.enumerable = enumerable;
        function scope(parent) {
            function ctor() {
            }
        
            ctor.prototype = parent || new (function () {
            });
            return new ctor();
        }
        
        
        photon['scope'] = scope;
        
        
        function rootScope() {
        }
        
        type(rootScope)['defines'](
            {
                $new: function() {
        
                }
            }
        );
        (function() {
            var TOKEN_EOF = -1,
                TOKEN_KEYWORD = 2,
                TOKEN_IDENTIFIER = 3,
                TOKEN_GROUP = 4,
                TOKEN_OPERATOR = 16,
                TOKEN_EQUALITY = 17,
                TOKEN_RELATIONAL = 18,
                TOKEN_MULTIPLICATIVE = 19,
                TOKEN_ADDITIVE = 20,
                TOKEN_STRING = 32,
                TOKEN_NUMBER = 33,
                TOKEN_BOOLEAN = 34,
                TOKEN_NULL = 35,
                TOKEN_UNDEFINED = 36,
                TOKEN_DELIMITER = 64,
                TOKEN_WHITESPACE = 128,
                ZERO;
            
            var tokenInfoMap_ = {},
                tokenizeRegex;
            
            function compileBinary(tokenText) {
                return Function('s', 'l', 'x', 'y', 'return x(s, l)' + tokenText + 'y(s, l);');
            }
            
            function compileConstant(value) {
                return function () {
                    return value;
                }
            }
            
            (function () {
                ZERO = compileConstant(0);
            
                var expressionSets = [];
            
                function regexEscape(token) {
                    return enumerable(token).select(function (c) {
                        return '\\[]{}().+*^|'.indexOf(c) !== -1 ? '\\' + c : c;
                    }).toArray().join('');
                }
            
                function defineTokens(expressions, type, isPattern, compiler) {
                    if (!isPattern) {
                        expressions.forEach(function (expression, index) {
                            tokenInfoMap_[expression] = {
                                type:type,
                                fn:compiler && (isFunction(compiler) ? compiler(expression) : compiler[index])
                            };
                        });
            
                        expressions = expressions.map(regexEscape);
                    }
            
                    expressionSets.push(expressions);
                }
            
                function compileTokens() {
                    var text = enumerable(expressionSets).select(function (tokenSet) {
                        return tokenSet.join('|');
                    }).aggregate(function (accumulator, next) {
                        return (accumulator ? accumulator + '|(' : '(') + next + ')';
                    }, '');
                    return new RegExp(text, 'gi');
            
                }
            
                defineTokens('\\s,\\r,\\t,\\n, '.split(','), TOKEN_WHITESPACE, false);
                defineTokens('=== == !== !='.split(' '), TOKEN_EQUALITY, false, compileBinary);
            
                defineTokens('<= < >= >'.split(' '), TOKEN_RELATIONAL, false, compileBinary);
                defineTokens('* % /'.split(' '), TOKEN_MULTIPLICATIVE, false, compileBinary);
                defineTokens('+ -'.split(' '), TOKEN_ADDITIVE, false, compileBinary);
                defineTokens('&& || = <<= << >>= & | ^'.split(' '), TOKEN_OPERATOR, false, compileBinary);
                defineTokens('()[]{}'.split(''), TOKEN_GROUP, false);
                defineTokens(['"([^\\\\"]*(\\\\[rtn"])?)*"', "'([^\\\\']*(\\\\[rtn'])?)*'"], TOKEN_STRING, true);
                defineTokens(['[-+]?[0-9]*[.]?[0-9]+([eE][-+]?[0-9]+)?'], TOKEN_NUMBER, true);
                defineTokens(['NaN'], TOKEN_NUMBER, false, [compileConstant(NaN)]);
                defineTokens(['true', 'false'], TOKEN_BOOLEAN, false, [compileConstant(true), compileConstant(false)]);
                defineTokens(['null'], TOKEN_NULL, false, [compileConstant(null)]);
                defineTokens(['undefined'], TOKEN_UNDEFINED, false, [noop]);
                defineTokens('typeof in'.split(' '), TOKEN_KEYWORD, false);
                defineTokens(['[a-z_$]{1}[\\da-z_]*'], TOKEN_IDENTIFIER, true);
                defineTokens('.:,;'.split(''), TOKEN_DELIMITER, false);
            
                tokenizeRegex = compileTokens();
            })();
            
            function tokenize(text) {
                var nextTokenIndex = 0;
            
                function createToken(type, text, index, fn) {
                    return {
                        type:type,
                        text:text,
                        index:index,
                        fn:fn
                    };
                }
            
                function checkIndex(index) {
                    if (nextTokenIndex !== index) {
                        var err = 'at (', c = text.charAt(nextTokenIndex);
                        if (c === '"' || c === "'") {
                            err = 'Unterminated string detected ' + err;
                        }
                        throw new Error('INVALID TOKEN: ' + err + nextTokenIndex + ').');
                    }
                }
            
                function nextToken(match) {
                    var tokenType, tokenText, entry, index;
            
                    if (match) {
                        tokenText = match[0];
                        tokenType = (match[8] && TOKEN_STRING) || (match[1] && TOKEN_WHITESPACE) ||
                            (match[20] && TOKEN_IDENTIFIER) || (match[13] && TOKEN_NUMBER);
                        checkIndex(index = match.index);
                        nextTokenIndex += tokenText.length;
                    } else {
                        checkIndex(index = text.length);
                        tokenType = TOKEN_EOF;
                    }
            
                    // match based on group
                    if (tokenType) {
                        return createToken(tokenType, tokenText, index, null);
                    }
            
                    // lookup entry
                    entry = tokenInfoMap_[tokenText];
                    return createToken(entry.type, tokenText, index, entry.fn);
                }
            
                return new Enumerable(function() {
                    var controller = enumerator(), index = 0, restoreLastIndex;
                    return exportEnumerator(function () {
                            var match, result;
                            if (index === text.length) {
                                return index = -1, controller.progress(nextToken(null));
                            }
                            if (index === -1) {
                                return false;
                            }
                            restoreLastIndex = tokenizeRegex.lastIndex, tokenizeRegex.lastIndex = index;
                            result = (match = tokenizeRegex.exec(text)) ?
                                controller.progress(nextToken(match)) :
                                controller.end();
                            index = tokenizeRegex.lastIndex, tokenizeRegex.lastIndex = restoreLastIndex;
                            return result;
            
                        },
                        controller.current
                    )
                });
            }
            function generateMemberAccessCode(path) {
                var code = 'var c = $scope, u; return ';
                code += enumerable(path).aggregate(function (accumulated, next) {
                    if (accumulated !== '') {
                        accumulated += ' && ';
                    }
                    return accumulated + "c && (c=$ctx.has(c, '" + next + "')?c['" + next + "']:u)";
                }, '');
                return code;
            }
            
            function member(path, contextFn) {
                if (path && path.length) {
                    var code = generateMemberAccessCode(path), fn = Function('$scope', '$ctx', code);
                    return contextFn ? function (self) {
                        return fn(contextFn(self), ctx);
                    } : function (self) {
                        return fn(self, ctx);
                    };
                }
                return null;
            }
            
            function evaluationContext() {
                return {
                    has:function (obj, property) {
                        return hasProperty(obj, property);
                    }
                }
            }
            
            var ctx = evaluationContext();
            
            function isType(type) {
                return function (token) {
                    return token.type === type;
                }
            }
            
            function isText(text) {
                return function (token) {
                    return token.text === text;
                }
            }
            
            function not(fn) {
                return function (token) {
                    return !fn(token);
                }
            }
            
            function unquote(text) {
                return text.substring(1, text.length - 1);
            }
            
            function makeUnary(fn, right) {
                return function (self, locals) {
                    return fn(self, locals, right);
                };
            }
            
            function makeBinary(left, fn, right) {
                return function (self, locals) {
                    return fn(self, locals, left, right);
                };
            }
            
            function chainBinary(lhsEvaluator, readToken, tokenMatch) {
                var result = function () {
                    var lhs = lhsEvaluator(), token;
                    if (token = readToken(tokenMatch)) {
                        lhs = makeBinary(lhs, token.fn, result());
                    }
                    return lhs;
                }
                return result;
            }
            
            var isDot = isText('.'),
                isIdent = isType(TOKEN_IDENTIFIER),
                isString = isType(TOKEN_STRING),
                isNotOpenBrace = not(isText('(')),
                isOpenSquareBracket = isText('['),
                isCloseSquareBracket = isText(']'),
                matchMemberPathDotIdent = [isDot, isIdent],
                matchMemberPathIndexer = [isOpenSquareBracket, isString, isCloseSquareBracket];
            
            function parser() {
                function parse(text) {
                    var tokens = tokenize(text).where(function (x) {
                            return x.type !== TOKEN_WHITESPACE;
                        }).toArray(),
                        index = 0,
                        length = tokens.length;
            
                    function peekText(text) {
                        if (index < length - 1) {
                            var token = tokens[index];
                            if (!text || token.text === text) {
                                return token;
                            }
                        }
                        return null;
                    }
            
                    function peekType(type) {
                        if (index < length - 1) {
                            var token = tokens[index];
                            if (!type || token.type === type) {
                                return token;
                            }
                        }
                        return null;
                    }
            
                    function expectText(text) {
                        var token;
                        if (!(token = readText(text))) {
                            throw new Error('Unexpected token');
                        }
                        return token;
                    }
            
                    function expectType(type) {
                        var token;
                        if (!(token = readType(type))) {
                            throw new Error('Unexpected token');
                        }
                        return token;
                    }
            
                    function readText(text) {
                        var token = peekText(text);
                        if (token) {
                            index++;
                        }
                        return token;
                    }
            
                    function readType(type) {
                        var token;
                        if (index < length - 1) {
                            token = tokens[index];
                            if (token.type === type) {
                                index++;
                                return token;
                            }
                        }
                        return null;
                    }
            
                    function readPattern(pattern, acceptIndex, moveBy) {
                        var l = index + pattern.length, result;
                        if (l > length) {
                            return null;
                        }
            
                        for (var i = index, j = 0; i < l; i++, j++) {
                            if (!pattern[j](tokens[i])) {
                                return null;
                            }
                        }
            
                        result = tokens[index + acceptIndex];
                        index += moveBy;
                        return result;
                    }
            
                    function readMemberName() {
                        var match;
                        if (match = (readType(TOKEN_IDENTIFIER) || readPattern(matchMemberPathIndexer, 1, 3))) {
                            return match.type === TOKEN_STRING ?
                                unquote(match.text) :
                                match.text;
                        }
                        return null;
                    }
            
                    function readMemberChain() {
                        var name, token, path, thisObj, result = null;
                        if (name = readMemberName()) {
                            path = [name];
                            while (true) {
                                if (readText('.') || peekText('[')) {
                                    token = readType(TOKEN_IDENTIFIER) || readPattern(matchMemberPathIndexer, 1, 3);
                                    if (!token) {
                                        throw new Error();
                                    }
                                    path.push(token.type === TOKEN_STRING ? unquote(match.text) : token.text);
                                } else if (readText('(')) {
                                    thisObj = path.length > 1 ?
                                        member(path.slice(0, path.length - 1), result) :
                                        result;
                                    result = functionCall(member(path.slice(path.length - 1)), thisObj);
                                    path = [];
                                } else {
                                    break;
                                }
                            }
                        }
            
                        if (path && path.length) {
                            result = member(path, result);
                        }
            
                        return result;
                    }
            
                    function expression() {
                        return assignment();
                    }
            
                    function assignment() {
                        var lhs = logicalOR(), rhs, token;
                        if (token = readText('=')) {
                            if (!lhs.assign) {
                                throw new Error("implies assignment but [" +
                                    text.substring(0, token.index) + "] can not be assigned to", token);
                            }
                            rhs = logicalOR();
                            return function (self, locals) {
                                return lhs.assign(self, rhs(self, locals), locals);
                            };
                        }
                        return lhs;
                    }
            
                    var logicalAND = chainBinary(
                        chainBinary(
                            chainBinary(
                                chainBinary(
                                    chainBinary(unary, readType, TOKEN_MULTIPLICATIVE),
                                    readType, TOKEN_ADDITIVE),
                                readType, TOKEN_RELATIONAL),
                            readType, TOKEN_EQUALITY),
                        readText, '&&');
            
                    function logicalOR() {
                        var lhs = logicalAND(), token;
                        while (token = readText('||')) {
                            lhs = makeBinary(lhs, token.fn, logicalAND());
                        }
                        return lhs;
                    }
            
                    function unary() {
                        var token;
                        if (readText('+')) {
                            return primary();
                        }
                        if (token = readText('-')) {
                            return makeBinary(ZERO, token.fn, unary());
                        }
                        if (token = readText('!')) {
                            return makeUnary(token.fn, unary());
                        }
                        return primary();
                    }
            
                    function functionCall(getMember, target) {
                        var argEvaluators = [];
                        if (!peekText(')')) {
                            do {
                                argEvaluators.push(expression());
                            } while (readText(','));
                        }
                        expectText(')');
                        return function (self, locals) {
                            var args = [],
                                context = target ? target(self, locals) : self;
            
                            for (var i = 0; i < argEvaluators.length; i++) {
                                args.push(argEvaluators[i](self, locals));
                            }
                            var fn = getMember(context, locals) || noop;
                            if (fn.apply) {
                                return fn.apply(context, args);
                            }
                            // TODO: Must test IE "callable workaround", added from memory, should probably pull out into utility fn
                            args.unshift(context);
                            return functionPrototype.apply.call(fn, args);
                        };
                    }
            
            
                    function primary() {
                        var primary, token;
                        if (peekType(TOKEN_IDENTIFIER)) {
                            primary = readMemberChain();
                        }
            
                        if (!primary) {
                            token = readText();
                            primary = token.fn;
                            if (!primary) {
                                if ((token.type & 32) === 32) {
                                    switch (token.type) {
                                        case TOKEN_NUMBER:
                                            primary = compileConstant(Number(token.text));
                                            break;
                                        case TOKEN_IDENTIFIER:
                                            primary = member([readType(TOKEN_IDENTIFIER)]);
                                            break;
                                        case TOKEN_STRING:
                                            primary = compileConstant(unquote(token.text));
                                            break;
                                    }
                                }
                            }
                        }
            
                        var thisObj, next;
                        while (index < tokens.length) {
                            if (readText('.') || peekText('[')) {
                                if (next = member(readMemberChain(), primary)) {
                                    primary = next;
                                    thisObj = primary;
                                } else {
                                    thisObj = primary;
                                    primary = member([readMemberName(true)]);
                                }
                            } else if (readText('(')) {
                                primary = functionCall(primary, thisObj);
                                thisObj = null;
                            } else {
                                break;
                            }
                        }
            //            var fnName;
            //            if (matches = readPattern([isIdent, isText('(')], 2)) {
            //                fnName = matches[0].text;
            //            } else if (matches = readPattern([isOpenSquareBracket, isString, isCloseSquareBracket, isText('(')], 4)) {
            //                fnName = unquote(matches[1].text);
            //            }
            //            if (fnName) {
            //                primary = functionCall(memberEvaluator([fnName]), primary);
            //            }
            //
            //            while (token = readText('(')) {
            //                primary = functionCall(primary, undef);
            //            }
            
            
                        if (!primary) {
                            throw new Error("Invalid expression.")
                        }
                        return primary;
                    }
            
                    return expression();
                }
            
                return {
                    parse:parse
                }
            }
            
            photon.parser = parser;
            function execFactory(parser) {
                var cache = {};
                var result = function(expression, target) {
                    return (cache[expression] || (cache[expression] = parser.parse(expression)))(target);
                }
                result.clearCache = function() {
                    cache = {};
                }
                return result;
            }
            
            extend(photon.tokenize = tokenize, {
                TOKEN_EOF:TOKEN_EOF,
                TOKEN_OPERATOR:TOKEN_OPERATOR,
                TOKEN_EQUALITY:TOKEN_EQUALITY,
                TOKEN_RELATIONAL:TOKEN_RELATIONAL,
                TOKEN_MULTIPLICATIVE:TOKEN_MULTIPLICATIVE,
                TOKEN_ADDITIVE:TOKEN_ADDITIVE,
                TOKEN_KEYWORD:TOKEN_KEYWORD,
                TOKEN_IDENTIFIER:TOKEN_IDENTIFIER,
                TOKEN_GROUP:TOKEN_GROUP,
                TOKEN_STRING:TOKEN_STRING,
                TOKEN_NUMBER:TOKEN_NUMBER,
                TOKEN_BOOLEAN:TOKEN_BOOLEAN,
                TOKEN_NULL:TOKEN_NULL,
                TOKEN_UNDEFINED:TOKEN_UNDEFINED,
                TOKEN_DELIMITER:TOKEN_DELIMITER,
                TOKEN_WHITESPACE:TOKEN_WHITESPACE
            });
            
            photon.execFactory = execFactory;
            photon.exec = execFactory(parser());
        })();
    });
})(window, document);
//@ sourceMappingURL=photon-2.0-debug.js.map