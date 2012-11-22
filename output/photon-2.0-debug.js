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
        
        var toString = Object.prototype.toString, arrayPrototype = Array.prototype;
        
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
            return !isPrimitive(obj) && property in obj;
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
                        return (x.getEnumerator ||
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
                any : function(predicate) {
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
        
        enumerable.regexExec = function (regEx, text, startIndex) {
            return enumerable(function () {
                var source = enumerator(), index = startIndex, restoreLastIndex;
                return exportEnumerator(function () {
                        var match, result;
                        restoreLastIndex = regEx.lastIndex, regEx.lastIndex = index;
        
                        // next
                        result = (match = regEx.exec(text)) ? source.progress(match) : source.end();
        
                        // save current position, then restore previous regex position
                        index = regEx.lastIndex, regEx.lastIndex = restoreLastIndex;
                        return result;
        
                    },
                    source.current
                )
            });
        }
        
        photon.enumerable = enumerable;
        //// Even if we use the enumerator type we must wrap it before returning as an 'real' enumerator (to ensure privacy is maintained)
        //// 5692
        //
        //var enumerable = (function () {
        //    /**
        //     * @const
        //     * @type {Number}
        //     */
        //    var STATE_NOT_STARTED = 0;
        //    /**
        //     * @const
        //     * @type {Number}
        //     */
        //    var STATE_IN_PROGRESS = 1;
        //    /**
        //     * @const
        //     * @type {Number}
        //     */
        //    var STATE_COMPLETED = 3;
        //    /**
        //     * @const
        //     * @type {object}
        //     */
        //    var NO_VALUE = {};
        //
        //    /**
        //     * Creates an enumerator from the specified moveNext and current functions. This function ensures enumerator
        //     * functions are exported correctly in the minified code.
        //     *
        //     * @param {function} moveNext The 'moveNext' function for the enumerator.
        //     * @param {function} current The 'current' function for the enumerator.
        //     */
        //    function exportEnumerator(moveNext, current) {
        //        return {
        //            'moveNext':moveNext,
        //            'current':current
        //        };
        //    }
        //
        //    /**
        //     *
        //     * @param {Enumerable} [enumerable]
        //     * @param {function} [selector]
        //     * @return {Object}
        //     */
        //    function iterator(enumerable, selector) {
        //        var enumerator = enumerable ? enumerable['getEnumerator']() : null,
        //            state = STATE_NOT_STARTED,
        //            curr,
        //            index = -1;
        //
        //        function progress(value) {
        //            curr = selector ? selector(value, ++index) : value;
        //            return !!(state = STATE_IN_PROGRESS);
        //        }
        //
        //        function completed() {
        //            return !(state = STATE_COMPLETED);
        //        }
        //
        //        function isCompleted() {
        //            return state === STATE_COMPLETED;
        //        }
        //
        //        function isStarted() {
        //            return state !== STATE_NOT_STARTED;
        //        }
        //
        //        function current() {
        //            if (!isStarted()) {
        //                throw new Error('Enumeration has not started.');
        //            }
        //            if (isCompleted()) {
        //                throw new Error('Enumeration has completed.');
        //            }
        //            return curr;
        //        }
        //
        //        function moveNext() {
        //            return state !== STATE_COMPLETED && enumerator['moveNext']() ?
        //                progress(enumerator['current']()) :
        //                completed();
        //        }
        //
        //        return {
        //            moveNext:moveNext,
        //            current:current,
        //            completed:completed,
        //            isComplete:isCompleted,
        //            isStarted:isStarted,
        //            progress:progress
        //        };
        //    }
        //
        //    function makeSelector(selector) {
        //        return isString(selector) ? function (x) {
        //            return x[selector];
        //        } : selector || defaultSelector;
        //
        //    }
        //
        //    function makeSelectors(selectors) {
        //        if (!isArray(selectors)) {
        //            selectors = [selectors || defaultSelector];
        //        }
        //        return enumerable(selectors).select(makeSelector);
        //
        //    }
        //
        //    function fromArrayLike(arrayLike) {
        //        return function () {
        //            var i = -1, iter = iterator();
        //            return exportEnumerator(
        //                function () {
        //                    if (!iter.isComplete()) {
        //                        var l = arrayLike.length;
        //                        while (++i < l) {
        //                            if (i in arrayLike) {
        //                                return iter.progress(arrayLike[i]);
        //                            }
        //                        }
        //                    }
        //
        //                    return iter.completed();
        //                },
        //                iter.current);
        //        };
        //    }
        //
        //    function fromString(text) {
        //        return function () {
        //            var i = -1, l = text.length, iter = iterator();
        //            return exportEnumerator(
        //                function () {
        //                    return !iter.isComplete() && ++i < l ?
        //                        iter.progress(text.charAt(i)) :
        //                        iter.completed();
        //                },
        //                iter.current);
        //        };
        //    }
        //
        //    function makeComparer(orderByDescriptors) {
        //        if (orderByDescriptors.moveNext()) {
        //            var curr = orderByDescriptors.current(),
        //                next = makeComparer(orderByDescriptors),
        //                selector = makeSelector(curr.selector),
        //                direction = curr.direction,
        //                comparer = curr.comparer;
        //
        //
        //            return function (x, y) {
        //                return (comparer(selector(x), selector(y)) * direction) || next(x, y);
        //            };
        //        }
        //        return function () {
        //            return 0;
        //        };
        //    }
        //
        //    function makeOrderByDescriptors(selectors, comparer, direction) {
        //        return makeSelectors(selectors).select(function (selector) {
        //            return {
        //                selector:selector,
        //                direction:direction,
        //                comparer:comparer || defaultComparer
        //            };
        //        });
        //    }
        //
        //    function orderByNext(e, orderByDescriptors) {
        //        return extend(
        //            new Enumerable(function () {
        //                // double wrap for consistent lazy evaluation
        //                return enumerable(e.toArray().sort(
        //                    makeComparer(iterator(orderByDescriptors))))['getEnumerator']();
        //            }),
        //            {
        //                'thenBy':function (keySelectors, comparer) {
        //                    return orderByNext(e, orderByDescriptors.concat(makeOrderByDescriptors(keySelectors, comparer, 1)));
        //                },
        //                'thenByDesc':function (keySelector, comparer) {
        //                    return orderByNext(e, orderByDescriptors.concat(makeOrderByDescriptors(keySelector, comparer, -1)));
        //                }
        //            });
        //    }
        //
        //    function where(e, predicateOrFactory, isFactory) {
        //        return function () {
        //            var iter = iterator(e), index = -1, predicate = isFactory ? predicateOrFactory() : predicateOrFactory;
        //            return exportEnumerator(
        //                function () {
        //                    while (iter.moveNext()) {
        //                        if (predicate(iter.current(), ++index)) {
        //                            return true;
        //                        }
        //                    }
        //
        //                    return iter.completed();
        //                },
        //                iter.current);
        //        };
        //    }
        //
        //    function select(e, selector) {
        //        return function () {
        //            var iter = iterator(e, selector);
        //            return exportEnumerator(
        //                iter.moveNext,
        //                iter.current);
        //        }
        //    }
        //
        //    function concat(e, args) {
        //        return function () {
        //            var iter = iterator(),
        //                currIter = iterator(e),
        //                nextIter = iterator(enumerable(args), function (x) {
        //                    return iterator(enumerable(x));
        //                });
        //
        //            return exportEnumerator(function () {
        //                    while (!currIter.moveNext()) {
        //                        if (!nextIter.moveNext()) {
        //                            return iter.completed();
        //                        }
        //                        currIter = nextIter.current();
        //                    }
        //                    return iter.progress(currIter.current());
        //                },
        //                iter.current);
        //
        //        };
        //    }
        //
        //    function predicateTrue() {
        //        return true;
        //    }
        //
        //    function findNext(iter, predicate) {
        //        predicate = predicate || predicateTrue;
        //        while (iter.moveNext()) {
        //            var current = iter.current();
        //            if (predicate(current)) {
        //                return current;
        //            }
        //        }
        //
        //        return NO_VALUE;
        //    }
        //
        //    function findLast(iter, predicate) {
        //        var lastFound = NO_VALUE, current;
        //        while ((current = findNext(iter, predicate)) !== NO_VALUE) {
        //            lastFound = current;
        //        }
        //        return lastFound;
        //    }
        //
        //    function valueOrThrow(value) {
        //        if (value === NO_VALUE) {
        //            throw new Error('No match found.');
        //        }
        //        return value;
        //    }
        //
        //    function valueOrDefault(value, defaultValue) {
        //        return value === NO_VALUE ? defaultValue : value;
        //    }
        //
        //    function aggregate(e, accumulator, seed, empty) {
        //        var iter = iterator(e), index = 0;
        //        while (iter.moveNext()) {
        //            seed = accumulator(seed, iter.current(), index++);
        //        }
        //        return index ? seed : empty;
        //    }
        //
        //    function defaultComparer(x, y) {
        //        if (x === y) {
        //            return 0;
        //        }
        //
        //        if (x < y) {
        //            return -1;
        //        }
        //
        //        if (x > y) {
        //            return 1;
        //        }
        //
        //        return -2;
        //    }
        //
        //    function defaultSelector(item) {
        //        return item;
        //    }
        //
        //    function getObjectKey(obj) {
        //        var type = Object.prototype.toString.call(obj);
        //        return type === '[object Object]' || obj.valueOf() === obj ?
        //            'o' + getUID(obj) :
        //            type + obj.valueOf();
        //    }
        //
        //    function getKey(obj) {
        //        var type = typeof obj;
        //        return type === 'object' && obj !== null ?
        //            getObjectKey(obj) :
        //            type.charAt(0) + obj;
        //    }
        //
        //    function extremum(enumerable, comparer, direction) {
        //        comparer = comparer || defaultComparer;
        //        return aggregate(enumerable, function (accumulated, next) {
        //            return isUndefined(accumulated) || comparer(next, accumulated) === direction ?
        //                next :
        //                accumulated;
        //        });
        //    }
        //
        //    function Enumerable(getEnumerator) {
        //        if (!(this instanceof Enumerable)) {
        //            return enumerable(getEnumerator);
        //        }
        //
        //        this['getEnumerator'] = getEnumerator;
        //    }
        //
        //    type(Enumerable)['defines'](
        //        {
        //            where:function (predicate) {
        //                return enumerable(where(this, predicate));
        //            },
        //            select:function (selector) {
        //                return enumerable(select(this, selector));
        //            },
        //            distinct:function (keySelector) {
        //                keySelector = keySelector || defaultSelector;
        //                return enumerable(where(this,
        //                    function () {
        //                        var seen = {};
        //                        return function (item) {
        //                            var key = getKey(keySelector(item));
        //                            return !seen.hasOwnProperty(key) && (seen[key] = true);
        //                        };
        //                    }, true));
        //
        //            },
        //            skip:function (count) {
        //                return count > 0 ? enumerable(where(this, function (x, i) {
        //                    return i >= count;
        //                })) : this;
        //            },
        //            take:function (count) {
        //                var self = this;
        //                return enumerable(function () {
        //                    var iter = iterator(self), taken = 0;
        //                    return exportEnumerator(function () {
        //                        if (taken < count && iter.moveNext()) {
        //                            taken++;
        //                            return true;
        //                        }
        //                        return iter.completed();
        //
        //                    }, iter.current);
        //                });
        //            },
        //            concat:function () {
        //                return enumerable(concat(this, arguments));
        //            },
        //            groupBy:function (keySelector) {
        //                keySelector = keySelector || defaultSelector;
        //                var self = this;
        //                return enumerable(function () {
        //                    var groups = {},
        //                        iter = iterator(self),
        //                        current,
        //                        pendingGroups = [],
        //                        pendingGroupIndex = 0;
        //
        //                    function createGetEnumerator(items, itemLookup) {
        //                        return function () {
        //                            var groupIter = iterator(), itemIndex = 0;
        //                            return exportEnumerator(function () {
        //                                    return (itemIndex < items.length || moveNext(true, itemLookup)) ?
        //                                        groupIter.progress(items[itemIndex++]) :
        //                                        groupIter.completed();
        //                                },
        //                                groupIter.current);
        //                        };
        //                    }
        //
        //                    function moveNext(matchKey, keyToMatch) {
        //                        if (!matchKey) {
        //                            if (pendingGroupIndex === pendingGroups.length) {
        //                                pendingGroups = [];
        //                            } else if (pendingGroupIndex < pendingGroups.length) {
        //                                current = pendingGroups[pendingGroupIndex++].enumerable;
        //                                return true;
        //                            }
        //                        }
        //
        //                        while (iter.moveNext()) {
        //                            var item = iter.current(),
        //                                itemKey = keySelector(item),
        //                                itemLookup = getKey(itemKey);
        //
        //                            if (groups.hasOwnProperty(itemLookup)) {
        //                                groups[itemLookup].items.push(item);
        //                            } else {
        //                                var items = [item];
        //                                current = enumerable(
        //                                    createGetEnumerator(items, itemLookup));
        //                                current.key = itemKey;
        //                                var group = groups[itemLookup] = {
        //                                    items:items,
        //                                    enumerable:current
        //                                };
        //
        //                                if (matchKey) {
        //                                    pendingGroups.push(group);
        //                                }
        //                            }
        //
        //                            if (!matchKey || keyToMatch === itemLookup) {
        //                                return true;
        //                            }
        //                        }
        //                        return iter.completed();
        //                    }
        //
        //                    return exportEnumerator(
        //                        function () {
        //                            return moveNext(false, null);
        //                        },
        //                        function () {
        //                            return (!iter.isComplete() || pendingGroups.length) && iter.isStarted() ?
        //                                current :
        //                                iter.current();
        //
        //                        });
        //                });
        //            },
        //            first:function (predicate) {
        //                return valueOrThrow(
        //                    findNext(iterator(this), predicate));
        //            },
        //            firstOrDefault:function (predicate, defaultValue) {
        //                return valueOrDefault(
        //                    findNext(iterator(this), predicate), defaultValue);
        //            },
        //            last:function (predicate) {
        //                return valueOrThrow(findLast(iterator(this), predicate));
        //            },
        //            lastOrDefault:function (predicate, defaultValue) {
        //                return valueOrDefault(findLast(iterator(this), predicate), defaultValue);
        //            },
        //            any:function (predicate) {
        //                return findNext(iterator(this), predicate) !== NO_VALUE;
        //            },
        //            min:function (comparer) {
        //                return extremum(this, comparer, -1);
        //            },
        //            max:function (comparer) {
        //                return extremum(this, comparer, 1);
        //            },
        //            sum:function () {
        //                return aggregate(this, function (accumulated, next) {
        //                    return accumulated + toNumber(next);
        //                }, 0, NaN);
        //            },
        //            orderBy:function (keySelector, comparer) {
        //                return orderByNext(this,
        //                    makeOrderByDescriptors(keySelector, comparer, 1));
        //            },
        //            orderByDesc:function (keySelector, comparer) {
        //                return orderByNext(this,
        //                    makeOrderByDescriptors(keySelector, comparer, -1));
        //            },
        //            average:function () {
        //                var count = 0;
        //                return aggregate(this, function (accumulated, next) {
        //                    count++;
        //                    return accumulated + toNumber(next);
        //                }, 0, NaN) / count;
        //            },
        //            aggregate:function (accumulator, seed) {
        //                return aggregate(this, accumulator, seed);
        //            },
        //            count:function () {
        //                return aggregate(this, function (accumulated) {
        //                    return accumulated + 1;
        //                }, 0);
        //            },
        //            reverse:function () {
        //                return enumerable(this.toArray().reverse());
        //            },
        //            forEach:function (callback, thisObj) {
        //                var iter = iterator(this), i = 0;
        //                while (iter.moveNext()) {
        //                    callback.call(thisObj, iter.current(), i++);
        //                }
        //            },
        //            toArray:function () {
        //                var result = [], index = 0, iter = iterator(this);
        //                while (iter.moveNext()) {
        //                    result[index++] = iter.current();
        //                }
        //                return result;
        //            }
        //        })['exports'](function (o) {
        //        return {
        //            'toArray':o.toArray,
        //            'forEach':o.forEach,
        //            'reverse':o.reverse,
        //            'count':o.count,
        //            'aggregate':o.aggregate,
        //            'average':o.average,
        //            'orderByDesc':o.orderByDesc,
        //            'orderBy':o.orderBy,
        //            'sum':o.sum,
        //            'min':o.min,
        //            'max':o.max,
        //            'where':o.where,
        //            'select':o.select,
        //            'distinct':o.distinct,
        //            'skip':o.skip,
        //            'take':o.take,
        //            'concat':o.concat,
        //            'groupBy':o.groupBy,
        //            'first':o.first,
        //            'firstOrDefault':o.firstOrDefault,
        //            'last':o.last,
        //            'lastOrDefault':o.lastOrDefault,
        //            'any':o.any
        //        }
        //    })['build']();
        //
        //    var EMPTY = new Enumerable(function () {
        //        var iter = iterator();
        //        return exportEnumerator(
        //            iter.completed, iter.current);
        //    });
        //
        //    var enumerable = function (source) {
        //        if (isUndefined(source) && !arguments.length) {
        //            return EMPTY;
        //        }
        //
        //        if (hasProperty(source, 'getEnumerator')) {
        //            return source;
        //        }
        //
        //        if (isString(source)) {
        //            return new Enumerable(fromString(source));
        //        }
        //
        //        if (isFunction(source)) {
        //            return new Enumerable(source);
        //        }
        //
        //        return new Enumerable(fromArrayLike(isArrayLike(source) ? source : [source]));
        //    };
        //
        //    photon['enumerable'] = enumerable;
        //    photon['Enumerable'] = Enumerable;
        //})();
        //
        
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
                TOKEN_OPERATOR = 1,
                TOKEN_KEYWORD = 4,
                TOKEN_IDENTIFIER = 8,
                TOKEN_GROUP = 16,
                TOKEN_STRING = 32,
                TOKEN_NUMBER = 33,
                TOKEN_BOOLEAN = 34,
                TOKEN_NULL = 35,
                TOKEN_DELIMITER = 64,
                TOKEN_WHITESPACE = 128,
                ZERO;
            
            var tokenTextToTypeMap_ = {},
                tokenTextToFnMap_ = {},
                tokenizeRegex;
            
            function compileBinary(tokenText) {
                return Function('s', 'l', 'x', 'y', 'return x(s, l)' + tokenText + 'y(s, l);');
            }
            
            function compileConstant(value) {
                return function () {
                    return value;
                }
            }
            
            (function() {
                var expressionSets = [];
            
                function regexEscape(token) {
                    return enumerable(token).select(function (c) {
                        return '\\[]{}().+*^'.indexOf(c) !== -1 ? '\\' + c : c;
                    }).toArray().join('');
                }
            
                function defineTokens(expressions, type, isPattern, compiler) {
                    if (!isPattern) {
                        expressions.forEach(function (expression, index) {
                            tokenTextToTypeMap_[expression] = type;
                            if (compiler) {
                                tokenTextToFnMap_[expression] = isFunction(compiler) ? compiler(expression) : compiler[index];
                            }
                        });
            
                        expressions = expressions.map(regexEscape);
                    }
            
                    expressionSets.push(expressions);
                }
            
                function compileTokens() {
                    var text = enumerable(expressionSets).select(function (tokenSet) {
                        return tokenSet.join('|');
                    }).aggregate(function (accumulator, next) {
                            if (accumulator) {
                                accumulator += '|';
                            }
                            return accumulator + '(' + next + '){1}';
                        }, '');
                    return new RegExp(text, 'gi');
            
                }
            
                ZERO = compileConstant(0);
            
                defineTokens('\\s,\\r,\\t,\\n, '.split(','), TOKEN_WHITESPACE, false);
                defineTokens('+ - * % / === == = !== != <<= << <= < >>= >= > &' .split(' '), TOKEN_OPERATOR, false, compileBinary);
                defineTokens(['()[]{}'.split('')], TOKEN_GROUP, false);
                defineTokens(['"([^\\\\"]*(\\\\[rtn"])?)*"', "'([^\\\\']*(\\\\[rtn'])?)*'"], TOKEN_STRING, true);
                defineTokens(['([-+]?[0-9]*[.]?[0-9]+([eE][-+]?[0-9]+)?)'], TOKEN_NUMBER, true);
                defineTokens(['true', 'false'], TOKEN_BOOLEAN, false, [compileConstant(true), compileConstant(false)]);
                defineTokens(['null'], TOKEN_NULL, false, [compileConstant(null)]);
                defineTokens('typeof in'.split(' '), TOKEN_KEYWORD, false);
                defineTokens(['[a-z_$]{1}[\\da-z_]*'], TOKEN_IDENTIFIER, true);
                defineTokens(['.', ':', ','], TOKEN_DELIMITER, true);
            
                tokenizeRegex = compileTokens();
            })();
            
            function tokenize(text) {
                function isWhiteSpace(value) {
                    return !/[^\t\n\r ]/.test(value);
                }
            
                function getTokenType(text) {
                    var tokenType = tokenTextToTypeMap_[text];
                    if (tokenType) {
                        return tokenType;
                    }
                    if (isWhiteSpace(text)) {
                        return TOKEN_WHITESPACE;
                    }
                    if ('"\''.indexOf(text.charAt(0)) !== -1) {
                        return TOKEN_STRING;
                    }
                    if (!isNaN(Number(text))) {
                        return TOKEN_NUMBER;
                    }
                    return TOKEN_IDENTIFIER;
                }
            
                function makeToken(text, index) {
                    var type = text ? getTokenType(text) : TOKEN_EOF;
                    return {
                        text:text,
                        index:index,
                        fn:tokenTextToFnMap_[text],
                        type:type
                    };
                }
            
                return enumerable.regexExec(tokenizeRegex, text, 0).select(function (x) {
                    return makeToken(x[0], x.index);
                }).concat([makeToken(null, text.length)]);
            }
            extend(photon.tokenize = tokenize, {
                TOKEN_EOF:TOKEN_EOF,
                TOKEN_OPERATOR:TOKEN_OPERATOR,
                TOKEN_KEYWORD:TOKEN_KEYWORD,
                TOKEN_IDENTIFIER:TOKEN_IDENTIFIER,
                TOKEN_GROUP:TOKEN_GROUP,
                TOKEN_STRING:TOKEN_STRING,
                TOKEN_NUMBER:TOKEN_NUMBER,
                TOKEN_BOOLEAN:TOKEN_BOOLEAN,
                TOKEN_NULL:TOKEN_NULL,
                TOKEN_DELIMITER:TOKEN_DELIMITER,
                TOKEN_WHITESPACE:TOKEN_WHITESPACE
            });
            
            
            function memberEvaluator(path) {
                var code = generateMemberAccessCode(path), fn = Function('$scope', '$ctx', code);
                return function (scope) {
                    return fn(scope, ctx);
                };
            }
            
            function evaluationContext() {
                return {
                    has:function (obj, property) {
                        return hasProperty(obj, property);
                    }
                }
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
            
            
            var ctx = evaluationContext();
            
            
            
            function parser() {
                function parse(text) {
                    var tokens = tokenize(text).where(function (x) {
                            return x.type !== TOKEN_WHITESPACE;
                        }).toArray(),
                        index = 0,
                        length = tokens.length;
            
                    function peek(e1, e2, e3, e4) {
                        if (index < length - 1) {
                            var token = tokens[index];
                            var t = token.text;
                            if (t == e1 || t == e2 || t == e3 || t == e4 ||
                                (!e1 && !e2 && !e3 && !e4)) {
                                return token;
                            }
                        }
                        return false;
                    }
            
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
            
            
                    var isDot = isText('.'),
                        isIdent = isType(TOKEN_IDENTIFIER),
                        notIsOpenBrace = not(isText('(')),
                        isOpenSquareBracket = isText('['),
                        isCloseSquareBracket = isText(']'),
                        isString = isType(TOKEN_STRING);
            
            
                    function match(matches, consume) {
                        var l = index + matches.length;
                        if (l > length) {
                            return false;
                        }
            
                        for (var i = index, j = 0; i < l; i++, j++) {
                            if (!matches[j](tokens[i])) {
                                return false;
                            }
                        }
                        return take(consume || matches.length);
                    }
            
            
                    function take(amount) {
                        var result = tokens.slice(index, index + amount);
                        index += amount;
                        return result;
                    }
            
                    function unquote(text) {
                        return text.substring(1, text.length - 1);
                    }
            
                    function readMemberPath() {
                        var matches, path;
                        if (matches = match([isIdent, notIsOpenBrace], 1)) {
                            path = [matches[0].text];
                            while (true) {
                                if (matches = match([isDot, isIdent, notIsOpenBrace], 2)) {
                                    path.push(matches[1].text);
                                } else if (matches = match([isOpenSquareBracket, isString, isCloseSquareBracket])) {
                                    path.push(unquote(matches[1].text));
                                } else {
                                    break;
                                }
                            }
                            return path;
                        }
                        return null;
                    }
            
            
                    function read(e1, e2, e3, e4) {
                        var token = peek(e1, e2, e3, e4);
                        if (token) {
                            index++;
                            return token;
                        }
                        return false;
                    }
            
                    function consume(e1) {
                        if (!read(e1)) {
                            throw new Error("is unexpected, expecting [" + e1 + "]");
                        }
                    }
            
                    function expression() {
                        return assignment();
                    }
            
                    function assignment() {
                        var left = logicalOR();
                        var right;
                        var token;
                        if ((token = read('='))) {
                            if (!left.assign) {
                                throw new Error("implies assignment but [" +
                                    text.substring(0, token.index) + "] can not be assigned to", token);
                            }
                            right = logicalOR();
                            return function (self, locals) {
                                return left.assign(self, right(self, locals), locals);
                            };
                        } else {
                            return left;
                        }
                    }
            
                    function logicalOR() {
                        var left = logicalAND();
                        var token;
                        while (true) {
                            if ((token = read('||'))) {
                                left = binaryFn(left, token.fn, logicalAND());
                            } else {
                                return left;
                            }
                        }
                    }
            
                    function logicalAND() {
                        var left = equality();
                        var token;
                        if ((token = read('&&'))) {
                            left = binaryFn(left, token.fn, logicalAND());
                        }
                        return left;
                    }
            
                    function equality() {
                        var left = relational();
                        var token;
                        if ((token = read('==', '!='))) {
                            left = binaryFn(left, token.fn, equality());
                        }
                        return left;
                    }
            
                    function relational() {
                        var lhs = additive(), token;
                        if ((token = read('<', '>', '<=', '>='))) {
                            lhs = binaryFn(lhs, token.fn, relational());
                        }
                        return lhs;
                    }
            
                    function additive() {
                        var left = multiplicative();
                        var token;
                        while ((token = read('+', '-'))) {
                            left = binaryFn(left, token.fn, multiplicative());
                        }
                        return left;
                    }
            
                    function multiplicative() {
                        var left = unary();
                        var token;
                        while ((token = read('*', '/', '%'))) {
                            left = binaryFn(left, token.fn, unary());
                        }
                        return left;
                    }
            
                    function unary() {
                        var token;
                        if (read('+')) {
                            return primary();
                        } else if ((token = read('-'))) {
                            return binaryFn(ZERO, token.fn, unary());
                        } else if ((token = read('!'))) {
                            return unaryFn(token.fn, unary());
                        } else {
                            return primary();
                        }
                    }
            
                    function unaryFn(fn, right) {
                        return function (self, locals) {
                            return fn(self, locals, right);
                        };
                    }
            
                    function binaryFn(left, fn, right) {
                        return function (self, locals) {
                            return fn(self, locals, left, right);
                        };
                    }
            
            
                    function primary() {
                        var primary, memberPath = readMemberPath(), token;
                        if (memberPath) {
                            primary = memberEvaluator(memberPath);
                        } else {
                            token = read();
                            primary = token.fn;
                            if (!primary) {
                                if ((token.type & 32) === 32) {
                                    switch (token.type) {
                                        case TOKEN_NUMBER:
                                            primary = compileConstant(Number(token.text));
                                            break;
                                        case TOKEN_STRING:
                                            primary = compileConstant(unquote(token.text));
                                            break;
                                    }
                                }
                            }
            
                        }
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
            
            
        })();
    });
})(window, document);
//@ sourceMappingURL=photon-2.0-debug.js.map