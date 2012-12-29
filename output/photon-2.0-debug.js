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
        function modernize(target, method, alternativeFactory) {
            return (method in target) ?
                target[method] :
                (target[method] = alternativeFactory());
        }
        
        function assertCallTarget(target, methodName) {
            if (isNullOrUndefined(target)) {
                throw new TypeError((methodName || '?') + ' called on null or undefined.');
            }
            return target;
        }
        
        var isArray = modernize(Array, 'isArray', function () {
            return function (obj) {
                return isType(obj, '[object Array]');
            };
        });
        
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
        
        modernize(arrayPrototype, 'filter', function () {
            return function (callback, thisObj) {
                var array = assertCallTarget(this, 'Array.filter'),
                    length = array.length,
                    result = [],
                    resultIndex = 0;
        
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
        
        modernize(stringPrototype, 'trim', function () {
            return function () {
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
                    var result = function () {
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
        
            for (var key in {toString: noop}) {
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
        
        modernize(Object, 'observe' , function() {
            return function(obj, handler) {
        
            }
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
            var _members = {},
                _staticMembers = {},
                _typeInfo = {
                    name: null,
                    baseType: null,
                    base: null,
                    type: null
                };
        
            return  {
                'name': function (name) {
                    _typeInfo.name = name;
                    return this;
                },
                'inherits': function (baseType) {
                    _typeInfo.baseType = baseType;
                    return this;
                },
                'defines': function (members) {
                    if (isFunction(members)) {
                        members = members(function () {
                            return _typeInfo.base;
                        });
                    }
                    extend(_members, members);
                    return this;
                },
                'definesStatic': function (members) {
                    if (isFunction(members)) {
                        members = members(function () {
                            return _typeInfo.base;
                        });
                    }
                    extend(_staticMembers, members);
                    return this;
                },
                'exports': function (callback) {
                    extend(_members, callback(_members));
                    return this;
                },
                'build': function () {
                    if (isNullOrUndefined(constructor)) {
                        constructor = function () {
                        };
                    }
                    _typeInfo.name = _typeInfo.name || constructor.name;
        
                    if (!_members.hasOwnProperty('toString')) {
                        _members['toString'] = function () {
                            return "[object " + (_typeInfo.name || "Object") + "]";
                        };
                    }
        
                    function Prototype() {
                    }
        
                    if (_typeInfo.baseType) {
                        _typeInfo.base = _typeInfo.baseType.prototype;
                        Prototype.prototype = _typeInfo.base;
                    }
        
                    var typeInfo = {
                        'name': function () {
                            return _typeInfo.name;
                        },
                        'baseType': function () {
                            return _typeInfo.baseType;
                        }
                    };
        
                    constructor['typeInfo'] = function () {
                        return typeInfo;
                    };
                    var prototype = constructor.prototype = new Prototype();
                    prototype.constructor = constructor;
        
                    if (_members) {
                        photon.extend(prototype, _members,
                            photon.extend.filterHasOwnProperty, function (source, propertyName) {
                                return source[propertyName];
                            });
                    }
                    prototype['__TYPE_INFO__'] = constructor['typeInfo'];
                    return extend(constructor, _staticMembers);
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
            if (isFunction(source.getEnumerator)) {
                return source.getEnumerator;
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
        var List = photon['List'] = type(
            function List() {
                this.items_ = [];
        
                // call base
                var self = this;
                Enumerable.call(this,
                    // TODO: Support versions, remove quick enumerable "wrap" solution?
                    function() {
                        return enumerable(self.items_).getEnumerator()
                    });
            })
            .defines({
                add: function (item) {
                    this.items_.push(item);
                    return this.items_.length - 1;
                },
                addRange : function(items) {
                    if (!isArray(items)) {
                        items = enumerable(items).toArray();
                    }
                    this.items_ = this.items_.concat(items);
                },
                remove: function (item) {
                    var index = this.items_.indexOf(item);
                    if (index !== -1) {
                        this.removeAt(index);
                    }
                    return index !== -1;
                },
                removeAt : function(index) {
                    this.items.splice(index, 1);
                },
                count: function () {
                    return this.items_.length;
                },
                itemAt: function (index) {
                    return this.items_[index];
                }
            })
            .inherits(
                Enumerable)
            .build();
        var strFormatRegEx = /\{(\d+)(:(([a-z])(\d*)))?\}/gi
        
        function strFormat(format /* args */) {
            var args = arguments;
            return format.replace(strFormatRegEx, function(match, position, discard1, discard2, formatter, precision) {
                var formatterFn = formatter ? assert(strFormat.formatters[formatter],
                        strFormat("Invalid format specifier '{0}'.", formatter)) : null,
                    arg = args[Number(position) + 1];
                return formatterFn ? formatterFn(arg, precision) : arg;
            });
        }
        
        function strRepeat(text, iterations) {
            iterations = isNullOrUndefined(iterations) ? 1 : iterations;
            var output = [];
            while (iterations-- > 0) {
                output.push(text);
            }
            return output.join('');
        }
        
        function strPadLeft(text, padding, iterations) {
            return strRepeat(padding, iterations) + text;
        }
        
        function strPadRight(text, padding, iterations) {
            return text + strRepeat(padding, iterations);
        }
        
        strFormat.formatters = {
            'd' : function (value, precision) {
                value = Math.floor(Number(value));
                if (isNaN(value) || !precision) {
                    return value;
                }
                value = '' + value;
                return strPadLeft(value, '0', precision - value.length);
            },
            'f' : function(value, precision) {
                value = Number(value);
                return !isNullOrUndefined(precision) ?
                    value.toFixed(precision) :
                    value;
            }
        }
        
        extend(photon, {
            'string':{
                'padLeft':strPadLeft,
                'padRight':strPadRight,
                'format':strFormat
            }
        });
        (function () {
            function rejectOrResolve(defer, isRejected, valueOrReason) {
                if (isRejected) {
                    defer.reject(valueOrReason);
                } else {
                    defer.resolve(valueOrReason);
                }
            }
        
            function isPromise(value) {
                return value && isFunction(value.then);
            }
        
            function factory(dispatcher) {
                function defer() {
                    var pending_ = [],
                        isResolved_ = false,
                        isRejected_,
                        value_;
        
                    function throwIfNotResolved() {
                        if (!isResolved_) {
                            throw new Error('Promise has not completed.')
                        }
                    }
        
                    function finalize(isRejected, value) {
                        isRejected_ = isRejected;
                        value_ = value;
                        isResolved_ = true;
                        var callbacks;
                        while (pending_.length) {
                            callbacks = pending_;
                            pending_ = [];
                            for (var i = 0, il = callbacks.length; i < il; i++) {
                                callbacks[i][Number(isRejected_)](value_);
                            }
                        }
                        pending_ = null;
                    }
        
                    function resolveOrReject(isRejected, value) {
                        if (isPromise(value)) {
                            value.then(function (value) {
                                finalize(isRejected, value);
                            }, function (reason) {
                                finalize(true, reason);
                            });
        
                        } else {
                            finalize(isRejected, value);
                        }
                    }
        
                    //noinspection JSUnusedGlobalSymbols
                    return {
                        resolve: function (value) {
                            resolveOrReject(false, value);
                        },
                        reject: function (reason) {
                            resolveOrReject(true, reason);
                        },
                        promise: {
                            fin: function (callback) {
                                var value_, reason_;
                                return this.then(
                                    function (value) {
                                        value_ = value;
                                        return callback();
                                    },function (reason) {
                                        reason_ = reason;
                                        return callback();
                                    }).then(
                                    function () {
                                        return value_;
                                    }, function (reason) {
                                        throw reason || reason_;
                                    });
                            },
                            then: function (callback, errback) {
                                var result = defer();
        
                                var wrappedCallback = function (value) {
                                    try {
                                        result.resolve(callback ? callback(value) : value);
                                    } catch (e) {
                                        result.reject(e);
                                    }
                                };
        
                                // the error callback is really a catch block, if it recovers then we resolve, otherwise we reject
                                var wrappedErrback = function (reason) {
                                    if (!errback) {
                                        result.reject(reason);
                                    } else {
                                        try {
                                            result.resolve(errback(reason));
                                        } catch (e) {
                                            result.reject(e);
                                        }
                                    }
                                };
        
                                if (pending_) {
                                    pending_.push([wrappedCallback, wrappedErrback]);
                                } else {
                                    (isRejected_ ? wrappedErrback : wrappedCallback)(value_);
                                }
        
                                return result.promise;
                            },
                            isResolved: function () {
                                return isResolved_;
                            },
                            isRejected: function () {
                                return isRejected_ == true;
                            },
                            isFulfilled: function () {
                                return isRejected_ === false;
                            },
                            valueOf: function () {
                                throwIfNotResolved();
                                return value_;
                            }
                        }
                    };
                }
        
                function resolve(value) {
                    if (isPromise(value)) {
                        return value;
                    }
                    var result = defer();
                    dispatcher(function () {
                        result.resolve(value);
                    });
                    return result.promise;
                }
        
                function reject(reason) {
                    var deferred = defer();
                    dispatcher(function () {
                        deferred.reject(reason);
                    });
                    return deferred.promise;
                }
        
                function wait(condition, msPoll, msTimeout) {
                    var deferred = defer();
        
                    function terminate() {
                        if (intervalHandle) {
                            clearInterval(intervalHandle);
                            intervalHandle = null;
                        }
                        if (timeoutHandle) {
                            clearTimeout(timeoutHandle);
                            timeoutHandle = null;
                        }
                    }
        
                    var timeoutHandle = setTimeout(function () {
                        terminate();
                        deferred.reject(new TimeoutError());
                    }, msTimeout);
        
                    var intervalHandle = setInterval(function () {
                        if (condition()) {
                            terminate();
                            deferred.resolve();
                        }
                    }, msPoll);
        
                    return deferred.promise;
                }
        
                function all(promises) {
                    if (!promises.length) {
                        return resolve([]);
                    }
        
                    var outstanding = promises.length,
                        isRejected = false,
                        deferred = defer();
        
                    function completed(isResolved) {
                        isRejected |= !isResolved;
                        if (!(--outstanding)) {
                            rejectOrResolve(deferred, isRejected, promises);
                        }
                    }
        
                    promises.map(
                        function (promise) {
                            return resolve(promise);
                        }).forEach(function (promise) {
                            promise.then(function () {
                                completed(true);
                            }, function () {
                                completed(false);
                            });
                        });
        
                    return deferred.promise;
                }
        
                function timeout(promise, ms) {
                    // if already complete then return
                    if ((promise = resolve(promise)).isResolved()) {
                        return promise;
                    }
        
                    // setup timeout
                    var deferred = defer(),
                        timeout = setTimeout(function () {
                            deferred.reject(new TimeoutError("Timed out after " + ms + " ms."))
                        }, ms || 0);
        
                    function promiseCompleted(isRejected, value) {
                        if (!deferred.promise.isResolved()) {
                            rejectOrResolve(deferred, isRejected, value);
                        }
                    }
        
                    // clear timeout it promise is resolved in time
                    promise.then(function (value) {
                        clearTimeout(timeout);
                        promiseCompleted(false, value);
                    }, function (reason) {
                        promiseCompleted(true, reason);
                    });
        
                    return deferred.promise;
                }
        
                function delay(ms, promise) {
                    var deferred = defer();
                    setTimeout(function () {
                        deferred.resolve(promise);
                    }, ms);
                    return deferred.promise;
                }
        
                var AsyncCallback = type(
                    function (callback, isErrback) {
                        this.callback = callback;
                        if (isErrback) {
                            this.isErrback = isErrback;
                        }
                    }).defines(
                    {
                        isAsyncCallback: true, isErrback: false
                    }).build();
        
                function callback(fn) {
                    return new AsyncCallback(fn, false);
                }
        
                function errback(fn) {
                    return new AsyncCallback(fn, true);
                }
        
                function invoke(fn, context /* args */) {
                    var deferred = defer(), args = enumerable(arguments).toArray().slice(2);
        
                    function makeCallback(asyncCallback) {
                        var isErrback = asyncCallback.isErrback, callback = asyncCallback.callback;
                        return function () {
                            try {
                                var result;
                                if (callback) {
                                    result = callback.apply(this, arguments);
                                    // handled, or result is a rejected promise
                                    isErrback = false;
                                } else {
                                    result = arguments[0];
                                }
                                rejectOrResolve(deferred, isErrback, result);
                            }
                            catch (e) {
                                deferred.reject(e);
                            }
                        }
                    }
        
                    for (var i = 0, l = args.length; i < l; i++) {
                        var arg = args[i];
                        if (arg && arg.isAsyncCallback) {
                            args[i] = makeCallback(arg);
                        }
                    }
        
                    fn.apply(context, args);
                    return deferred.promise;
                }
        
                return {
                    "defer": defer,
                    "reject": reject,
                    "resolve": resolve,
                    "all": all,
                    "wait": wait,
                    "delay": delay,
                    "timeout": timeout,
                    "factory": factory,
                    "invoke": invoke,
                    "callback": callback,
                    "errback": errback,
                    "TimeoutError": TimeoutError
                };
            }
        
            function synchronousDispatcher(task) {
                task();
            }
        
            photon['async'] = factory(synchronousDispatcher);
        })();
        
        /**
         * Represents a timeout error.
         * @constructor
         */
        var TimeoutError = type(function TimeoutError() {
                Error.apply(this, arguments);
            }).inherits(Error).build();
        
        var isTextContentAvailable = 'textContent' in document.createElement('span');
        
        var getNodeText = isTextContentAvailable ? function (node) {
            return (node.textContent) || '';
        } : function (node) {
            return (node.nodeType == NODE_ELEMENT ? node.innerText : node.nodeValue) || '';
        };
        
        var setNodeText = isTextContentAvailable ? function (node, text) {
            node.textContent = text ? text : '';
        } : function (node, text) {
            text = text || '';
            if (node.nodeType == NODE_ELEMENT) {
                node.innerText = text;
            } else {
                node.nodeValue = text;
            }
        };
        
        function getNodeValue(node) {
            return node.value;
        }
        
        function setNodeValue(node, newValue) {
            node.value = newValue;
        }
        
        function getNodeAttribute(node, name) {
            return node.getAttribute(name);
        }
        
        function setNodeAttribute(node, name, newValue) {
            node.setAttribute(name, newValue);
        }
        
        function getNodeStyle(node, name) {
            return node.style[name];
        }
        
        function setNodeStyle(node, name, newValue) {
            node.style[name] = newValue;
        }
        
        
        // TODO: Node functions will need to change when we support multiple, we should also provide
        function getNodeParent(node) {
            return nodes(node.parentNode);
        }
        
        function getNodeNextSibling(node) {
            return nodes(node.nextSibling);
        }
        
        
        var parseHtmlMap = {
            option: [ 1, "<select multiple='multiple'>", "</select>" ],
            legend: [ 1, "<fieldset>", "</fieldset>" ],
            thead: [ 1, "<table>", "</table>" ],
            tr: [ 2, "<table><tbody>", "</tbody></table>" ],
            td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
            col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
            area: [ 1, "<map>", "</map>" ]
        };
        
        parseHtmlMap.optgroup = parseHtmlMap.option;
        parseHtmlMap.tbody = parseHtmlMap.tfoot = parseHtmlMap.colgroup = parseHtmlMap.caption = parseHtmlMap.thead;
        parseHtmlMap.th = parseHtmlMap.td;
        
        var nodes = extend(
            function nodes(source) {
                if (source instanceof Nodes) {
                    return source;
                }
        
                if (isArray(source)) {
                    return new Nodes(source);
                }
                if (isString(source)) {
                    return nodes.parse(source);
                }
                if (source.nodeType) {
                    return new Nodes([source]);
                }
                throw new Error();
            },
            {
                parse: function (html, doc) {
                    doc = doc || document;
        
                    var container = doc.createElement("div"),
                        match = html.match(/^\s*<(t[dhr]|tbody|tfoot|thead|option|legend|col|area|optgroup|colgroup|caption)/i);
                    if (match) {
                        var wrapper = parseHtmlMap[match[1].toLowerCase()],
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
        
                    var result = enumerable(container.childNodes).toArray();
                    container.innerHTML = '';
        
                    return new Nodes(result);
                }
            });
        
        
        function cloneIf(node, condition) {
            return condition ? node.cloneNode(true) : node;
        }
        function applyNodeFunction(target, source, rel, callback) {
            var clone = false;
            nodes(target).forEach(function (targetNode) {
                source.forEach(function (sourceNode) {
                    callback(targetNode, cloneIf(sourceNode, clone), rel);
                });
                clone = true;
            });
        }
        
        function keyValueFunction(getter, setter) {
            return function (key, newValue) {
                var nodes = this._nodes;
                if (arguments.length) {
                    setter(nodes[0], key, newValue);
                    return this;
                }
                return getter(nodes[0], key);
            }
        }
        
        function keyValuesFunction(getter, setter) {
            return function (key, newValue) {
                if (arguments.length === 2) {
                    this.forEach(function (node) {
                        setter(node, key, newValue);
                    });
                    return this;
                }
                return this.select(function(node) {
                    return getter(node, key);
                });
            }
        }
        
        
        function valueFunction(getter, setter) {
            return function (newValue) {
                var nodes = this._nodes;
                if (arguments.length) {
                    if (!setter) {
                        throw new Error('Property is readonly.');
                    }
                    setter(nodes[0], newValue);
                    return this;
                }
                return getter(nodes[0]);
            }
        }
        
        function valuesFunction(getter, setter) {
            return function (newValue) {
                if (arguments.length) {
                    this.forEach(function (node) {
                        setter(node, newValue);
                    });
                    return this;
                }
                return this.select(getter);
            }
        }
        
        
        var Nodes = type(
            function Nodes(nodes) {
                this._nodes = nodes;
                Enumerable.call(this, fromArrayLike(nodes));
            })
            .name('Nodes')
            .inherits(Enumerable)
            .defines({
                value: valueFunction(
                    getNodeValue,
                    setNodeValue
                ),
                valueList: valuesFunction(
                    getNodeValue,
                    setNodeValue
                ),
                text: valueFunction(
                    getNodeText,
                    setNodeText
                ),
                textList: valuesFunction(
                    getNodeText,
                    setNodeText
                ),
                attribute: keyValueFunction(
                    getNodeAttribute,
                    setNodeAttribute
                ),
                attributeList: keyValuesFunction(
                    getNodeAttribute,
                    setNodeAttribute
                ),
                style:keyValueFunction(
                    getNodeStyle,
                    setNodeStyle
                ),
                styleList : keyValuesFunction(
                    getNodeStyle,
                    setNodeStyle
                ),
                parent: valueFunction(getNodeParent),
        
                nextSibling: valueFunction(getNodeNextSibling),
        
                on: function (name, handler) {
                    this.forEach(function (node) {
                        node.addEventListener(name, handler);
                    });
                },
                off : function(name, handler) {
                    this.forEach(function (node) {
                        node.removeEventListener(name, handler);
                    });
                },
                clone: function (deep) {
                    return new Nodes(this._nodes.map(function (node) {
                        return node.cloneNode(deep);
                    }));
                },
                replace: function (newNodes) {
                    newNodes = nodes(newNodes);
                    this.forEach(function (node) {
                        var parent = node.parentNode;
                        if (parent != null) {
                            parent.replaceChild(newNodes.first(), node);
                        }
                    });
                },
                appendTo: function (node) {
                    applyNodeFunction(node, this, null, function (targetNode, sourceNode) {
                        targetNode.appendChild(sourceNode);
                    });
                    return this;
                },
                insertBefore: function (node) {
                    var shouldClone = false, source = this;
                    nodes(node).forEach(function (relNode) {
                        var parentNode = relNode.parentNode;
                        source.forEach(function (sourceNode) {
                            parentNode.insertBefore(cloneIf(sourceNode, shouldClone), relNode);
                        });
        
                        shouldClone = true;
                    });
                },
                insertAfter: function (node) {
                    var shouldClone = false, source = this;
                    nodes(node).forEach(function (relNode) {
                        var parentNode = relNode.parentNode;
        
                        relNode = relNode.nextSibling;
        
                        source.forEach(function (sourceNode) {
                            parentNode.insertBefore(cloneIf(sourceNode, shouldClone), relNode);
                        });
        
                        shouldClone = true;
                    });
                }
            }).
            build();
        
        photon.nodes = nodes;
        function singletonLifetime(context, factory, contract, name, parameterOverrides) {
            // create objects through the root scope
            return context.root(context, factory, contract, name, parameterOverrides);
        }
        
        function transLifetime(context, factory, parameterOverrides) {
            // create object directly, not cached anywhere
            return factory(context, parameterOverrides);
        }
        
        function scopeLifetime(context, factory, contract, name, parameterOverrides) {
            // create objects through the current scope
            return context.current(context, factory, contract, name, parameterOverrides);
        }
        function analyzeDependencies(fnOrArray) {
            var fn = fnOrArray, deps = fnOrArray.$dependencies;
            if (isArray(fnOrArray)) {
                var fnIndex = fnOrArray.length - 1;
                fn = fnOrArray[fnIndex];
                deps = fnOrArray.slice(0, fnIndex);
            }
            return { fn: fn, deps: deps || []};
        }
        
        function mapArguments(dependencies, context, parameterOverrides) {
            return dependencies.map(function (dependency) {
                if (parameterOverrides && parameterOverrides.hasOwnProperty(dependency)) {
                    return parameterOverrides[dependency];
                } else {
                    return context.resolve(dependency);
                }
            });
        }
        
        function registration(contract) {
            var name, factory, lifetimeManager, memberOf;
        
            return {
                factory: function (value) {
                    var analysis = analyzeDependencies(value), deps = analysis.deps, fn = analysis.fn;
                    factory = function (context, parameterOverrides) {
                        var args = mapArguments(deps, context, parameterOverrides);
                        return fn.apply(this, args);
                    };
                    return this;
                },
                instance: function (value) {
                    factory = function () {
                        return value;
                    };
                    return this;
                },
                type: function (value) {
                    var analysis = analyzeDependencies(value), deps = analysis.deps, fn = analysis.fn;
        
                    function FactoryType() {
                    }
        
                    FactoryType.prototype = fn.prototype;
        
                    if (!(factory = fn.$containerFactory)) {
                        factory = fn.$containerFactory = function (context, parameterOverrides) {
                            var result = new FactoryType();
                            fn.apply(result, mapArguments(deps, context, parameterOverrides));
                            return result;
                        }
                    }
        
                    return this;
                },
                trans: function () {
                    lifetimeManager = transLifetime;
                    return this;
                },
                singleton: function () {
                    lifetimeManager = singletonLifetime;
                    return this;
                },
                scope: function () {
                    lifetimeManager = scopeLifetime;
                    return this;
                },
                name: function (value) {
                    name = value;
                    return this;
                },
                memberOf: function (value) {
                    memberOf = value;
                    return this;
                },
                build: function () {
                    if (!factory) {
                        throw new Error('Registration has no resolver.')
                    }
        
                    lifetimeManager = lifetimeManager || singletonLifetime;
                    return {
                        name: name,
                        memberOf: memberOf,
                        resolver: function (context, parameterOverrides) {
                            return lifetimeManager(context, factory, contract, name, parameterOverrides);
                        },
                        contract: contract
                    };
                }
            }
        }
        function module(build) {
            return function () {
                var registrations = [], builder = new ModuleBuilder(
                    function (contract) {
                        var result = registration(contract);
                        registrations.push(result);
                        return result;
                    });
                build(builder);
                return enumerable(registrations).select(function (registration) {
                    return registration.build();
                });
            };
        }
        
        var ModuleBuilder = type(
            function (registration) {
                this.registration = registration;
            }).defines(
            /**
             * @lends ModuleBuilder
             */
            {
                factory: function (contract, factory) {
                    return this.registration(contract)
                        .factory(factory);
                },
                type: function (contract, type) {
                    return this.registration(contract)
                        .type(type);
                },
                instance: function (contract, instance) {
                    return this.registration(contract)
                        .instance(instance);
                },
                directive: function (name) {
                    return this.registration('Directive')
                        .name(name);
                },
                controller: function (name) {
                    return this.registration('Controller')
                        .name(name);
                }
            }).build();
        
        photon.module = module;
        function container(modules) {
            var _configMap = {}, _context;
        
            function getResolver(contract, name) {
                var contractConfig = _configMap[contract], registration;
                if (contractConfig) {
                    if (name) {
                        registration = contractConfig.keys[name];
                    } else {
                        registration = contractConfig.main;
                    }
                }
                return registration ? registration.resolver : null;
            }
        
            function resolve(contract, name, parameterOverrides) {
                var result = tryResolve(contract, name, parameterOverrides);
                if (!result) {
                    throw new Error('Could not resolve instance: ' + contract + ':' + (name || ''));
                }
                return result;
            }
        
            function tryResolve(contract, name, parameterOverrides) {
                if (!parameterOverrides && name && !isPrimitive(name)) {
                    parameterOverrides = name;
                    name = '';
                }
        
                var resolver = getResolver(contract, name);
                return resolver ?
                    resolver(_context, parameterOverrides) :
                    null;
            }
        
            function createScope() {
                var _cache = {};
        
                function resolveInScope(context, factory, contract, name, parameterOverrides) {
                    var key = contract + ':';
                    if (name) {
                        key += name;
                    }
                    return _cache[key] || (_cache[key] = factory(context, parameterOverrides));
                }
        
                if (!_context.root) {
                    _context.current = _context.root = resolveInScope;
                }
        
                return {
                    using: function (callback) {
                        if (this._cache) {
                            throw new Error('Object disposed');
                        }
        
                        var previous = _context.current;
                        _context.current = resolveInScope;
                        try {
                            callback();
                        } finally {
                            _context.current = previous;
                        }
                    },
                    dispose: function () {
                        if (!_cache) {
                            return;
                        }
                        _cache = null;
                        _
                    }
                }
            }
        
            // initialize the content and root scope
            _context = {
                resolve: resolve
            };
            createScope();
        
            function containerConfig() {
                return {
                    main: null,
                    keys: {}
                };
            }
        
            function addCollectionMember(collection, member) {
                var collectionConfig = _configMap[collection] ||
                    (_configMap[collection] = containerConfig());
        
                if (!collectionConfig.members) {
                    collectionConfig.members = [];
                    collectionConfig.main = registration(collection).factory(function () {
                        return collectionConfig.members.map(function (member) {
                            return member.resolver(_context);
                        });
                    }).trans().build()
                }
        
                collectionConfig.members.push(member);
            }
        
            enumerable(modules).select(
                function (module) {
                    return module();
                }).forEach(function (regs) {
                    regs.forEach(function (reg) {
                        var current = _configMap[reg.contract] ||
                            (_configMap[reg.contract] = containerConfig());
        
                        if (reg.memberOf) {
                            addCollectionMember(reg.memberOf, req);
                        }
        
                        if (reg.name) {
                            current.keys[reg.name] = reg;
                        } else {
                            current.main = reg;
                        }
                    });
                });
            return {
                resolve: resolve,
                tryResolve: tryResolve,
                createScope: createScope
            }
        }
        
        photon.container = container;
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
                var result = function () {
                    return value;
                };
                result.isConstant = true;
                return result;
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
                defineTokens(['[a-z_$]{1}[\\da-z_]*'], TOKEN_IDENTIFIER, true);
                defineTokens('typeof in'.split(' '), TOKEN_KEYWORD, false);
                defineTokens('.:,;'.split(''), TOKEN_DELIMITER, false);
            
                tokenizeRegex = compileTokens();
            })();
            
            function tokenize(text, skipWhitespace) {
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
                            (match[19] && TOKEN_IDENTIFIER) || (match[13] && TOKEN_NUMBER);
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
            
                var result = new Enumerable(function() {
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
            
                if (skipWhitespace) {
                    result = result.where(function(x) {
                        return x.type !== TOKEN_WHITESPACE;
                    });
                }
            
                return result;
            }
            function generateMemberAccessCode(path) {
                var code = 'var c = $scope, d = c, u;';
                code += enumerable(path).aggregate(function (accumulated, next) {
                    return accumulated + " if ($ctx.isNullOrUndefined(c)) return u; d=c['" + next + "'];" +
                        "if ($ctx.isPropertyAccessor(d)) d = d.call(c); c = d;"
                        ;
                }, '') + ' return c';
                return code;
            }
            
            function member(path, contextFn) {
                if (path && path.length) {
                    var code = generateMemberAccessCode(path), fn = Function('$scope', '$ctx', code);
                    return extend(contextFn ? function (self) {
                        return fn(contextFn(self), ctx);
                    } : function (self) {
                        return fn(self, ctx);
                    }, {
                        setter: function (self, value) {
                            for (var i = 0, n = path.length - 1; i < n; i++) {
                                if (isPrimitive(self)) {
                                    return;
                                }
                                self = self[path[i]];
                            }
            
                            if (!isPrimitive(self)) {
                                self[path[path.length - 1]] = value;
                            }
                        },
                        context: function (self) {
                            if (contextFn) {
                                return contextFn(self);
                            }
                            return self;
                        },
                        paths: [path],
                        isObservable: !contextFn
                    });
                }
                return null;
            }
            
            function evaluationContext() {
                return {
                    has: function (obj, property) {
                        return hasProperty(obj, property);
                    },
                    isNullOrUndefined: function (obj) {
                        return isNullOrUndefined(obj);
                    },
                    isPropertyAccessor :function(obj) {
                        return isFunction(obj) && obj.isPropertyAccessor;
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
            
            function makeBinary(lhs, fn, rhs) {
                var isObservable, paths;
            
                // are the child expressions observable?
                isObservable = (lhs.isObservable && (rhs.isObservable || rhs.isConstant)) ||
                    (rhs.isObservable && (lhs.isObservable || lhs.isConstant));
            
                // if so then combine the paths
                if (isObservable) {
                    paths = lhs.paths;
                    if (!paths) {
                        paths = rhs.paths;
                    }  else if (rhs.paths) {
                        paths  = paths.concat(rhs.paths);
                    }
                }
            
                return extend(function (self, locals) {
                    return fn(self, locals, lhs, rhs);
                }, {
                    isObservable: isObservable,
                    paths: paths
                });
            }
            
            function chainBinary(lhsEvaluator, readToken, tokenMatch) {
                var result = function () {
                    var lhs = lhsEvaluator(), token;
                    if (token = readToken(tokenMatch)) {
                        lhs = makeBinary(lhs, token.fn, result());
                    }
                    return lhs;
                };
                return result;
            }
            
            var isString = isType(TOKEN_STRING),
                isOpenSquareBracket = isText('['),
                isCloseSquareBracket = isText(']'),
                matchMemberPathIndexer = [isOpenSquareBracket, isString, isCloseSquareBracket];
            
            function parser() {
                function parse(text, options) {
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
            
                    function makeError(message) {
                        return extend(new Error(strFormat("Parser error: {0} at position ({1}).", message, index)), {
                            line: 0, column: index
                        });
                    }
            
                    function expectText(text) {
                        var token, found;
                        if (!(token = readText(text))) {
                            token = tokens[index];
                            throw makeError(strFormat("expected token '{0}', but found '{1}'", text, (token && token.text) || 'EOF'));
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
            
                    function readMemberChain(getContext) {
                        var token, path, result = getContext;
                        if (token = readType(TOKEN_IDENTIFIER) || (getContext && readPattern(matchMemberPathIndexer, 1, 3))) {
                            path = [token.text];
                            while (true) {
                                if (readText('.') || peekText('[')) {
                                    token = readType(TOKEN_IDENTIFIER) || readPattern(matchMemberPathIndexer, 1, 3);
                                    if (!token) {
                                        throw new Error();
                                    }
                                    path.push(token.type === TOKEN_STRING ?
                                        unquote(token.text) :
                                        token.text);
                                } else if (readText('(')) {
                                    var getFn = result;
                                    if (path.length) {
                                        getContext = result;
                                        if (path.length > 1) {
                                            result = member(path.slice(0, path.length - 1), result);
                                            getContext = result;
                                        }
                                        getFn = member(path.slice(path.length - 1), result);
                                    }
                                    result = functionCall(getFn, getContext);
                                    getContext = function () {
                                        return window;
                                    };
                                    path = [];
                                } else {
                                    // member path has ended
                                    break;
                                }
                            }
                        }
            
                        // consume anything left in the path
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
            
                    function functionCall(getFn, getContextFn) {
                        var argEvaluators = [];
                        if (!peekText(')')) {
                            do {
                                argEvaluators.push(expression());
                            } while (readText(','));
                        }
                        expectText(')');
                        return function (self, locals) {
                            var args = [],
                                context = getContextFn ? getContextFn(self, locals) : self;
            
                            for (var i = 0; i < argEvaluators.length; i++) {
                                args.push(argEvaluators[i](self, locals));
                            }
                            var fn = getFn(self, locals) || noop;
                            if (fn.apply) {
                                return fn.apply(context, args);
                            }
                            // TODO: Must test IE "callable workaround", added from memory, should probably pull out into utility fn
                            args.unshift(context);
                            return functionPrototype.call.apply(fn, args);
                        };
                    }
            
                    function array() {
                        var elements = [];
                        if (!peekText(']')) {
                            do {
                                elements.push(expression());
                            } while (readText(','));
                        }
            
                        return function (self, locals) {
                            return elements.map(function (e) {
                                return e(self, locals);
                            });
                        }
                    }
            
                    function primary() {
                        var primary, token;
            
                        primary = readMemberChain();
                        if (!primary) {
                            if (readText('(')) {
                                primary = expression();
                                expectText(')');
                            } else if (readText('[')) {
                                primary = array();
                                expectText(']');
                            }
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
            
                            if (peekText('.') || peekText('[')) {
                                readText('.');
                                primary = readMemberChain(primary);
                            }
                        }
            
                        if (!primary) {
                            throw new Error("Invalid expression.")
                        }
                        return primary;
                    }
            
                    var evaluator = expression();
                    if (!options || !options.isBindingExpression) {
                        return evaluator;
                    }
                    var result = {
                        evaluator: evaluator,
                        parameters: {
            
                        }
                    };
                    while (readText(',')) {
                        var name = expectType(TOKEN_IDENTIFIER).text, prevIndex, token;
                        expectText('=');
                        prevIndex = index;
                        if (token = tokens[index]) {
                            index++;
                            if (token.fn && token.fn.isConstant) {
                                result.parameters[name] = token.fn();
                            } else if (token.type === TOKEN_STRING) {
                                result.parameters[name] = unquote(token.text);
                            } else {
                                index--;
                            }
                        }
                        if (prevIndex === index) {
                            throw makeError(strFormat("unexpected token '{0}', but found '{1}'", (token && token.text) || 'EOF'));
                        }
            
                    }
                    return result;
                }
            
                return {
                    parse: parse
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
        var actionDirectiveFactory = ['$parse', function (parse) {
            return {
                link: function (node, context, options) {
                    var expr = parse(options.expression), evaluate = expr.evaluator, on = expr.parameters['on'];
                    if (on) {
                        on.split(' ').forEach(function (x) {
                            node.on(x, function () {
                                evaluate(context);
                            });
                        });
                    }
                }
            }
        }];
        var attrDirectiveFactory = [function () {
            return {
                link: function (node, context, options) {
                    context.$observe(options.expression, function(newValue) {
                        node.attribute(options.qualifier, newValue)
                    });
                }
            }
        }];
        
        var eachDirectiveFactory = ['$parse', function (parse) {
            return {
                render: 'replace',
                compile: function (options) {
                    var expression = options.expression,
                        itemInTokens = photon.tokenize(expression, true)
                            .take(2).toArray();
        
                    options.itemName = 'item';
        
                    // extract the "<var> in" from expression
                    if (itemInTokens.length === 2 && itemInTokens[0].type === photon.tokenize.TOKEN_IDENTIFIER && itemInTokens[1].text === 'in') {
                        options.expression = expression.substring(itemInTokens[1].index + 2);
                        options.itemName = itemInTokens[0].text || 'item';
        
                    }
                },
                link: function (linkNode, context, options) {
                    var templateNode = nodes(options.templateNode),
                        linker = options.linker,
                        evaluator = parse(options.expression).evaluator;
        
                    linkNode = linkNode.nextSibling();
        
                    var items = evaluator(context);
                    if (items) {
                        enumerable(items).forEach(
                            function (item) {
                                var itemNode = templateNode.clone(true),
                                    childContext = context.$new();
                                itemNode.insertAfter(linkNode);
                                childContext[options.itemName] = item;
                                linker.link(itemNode.first(), childContext);
                                linkNode = linkNode.nextSibling();
                            }
                        );
                    }
        
                }
            }
        }];
        
        var modelDirectiveFactory = ['$parse', function (parse) {
            return {
                link: function (node, context, options) {
                    // TODO: input is not supported in IE8, need to use property change, should not use property change in IE9 as apparently its buggy
                    var expr = parse(options.expression), evaluator = expr.evaluator, updateOn = expr.parameters['updateOn'],
                        event = updateOn === 'change' ?  'input' : 'change';
        
                    node.on(event, function() {
                        evaluator.setter(context, node.value());
                        context.$sync();
                    });
        
                    context.$observe(options.expression, function(newValue) {
                        node.value(isNullOrUndefined(newValue) ? '' : newValue);
                    });
                }
            }
        }];
        
        var textDirectiveFactory = function () {
            return {
                link: function (linkNode, context, options) {
                    context.$observe(options.expression, function (newValue) {
                        linkNode.text(newValue);
                    });
                }
            }
        };
        
        
        var showDirectiveFactory = function () {
            return {
                link: function (linkNode, context, options) {
                    context.$observe(options.expression, function (newValue) {
                        linkNode.style('display', !!newValue ? '' : 'none');
                    });
                }
            }
        };
        
        var decorateDirectiveFactory = ['$parse', '$container', function (parse, container) {
            return {
                render: 'replace',
                link: function (linkNode, context, options) {
                    var optionsContext = context.$new(); // Probably should be detached, and compiled against supported attributes
        
                    context.$observe(options.expression, function (newValue) {
                        var expression = parse(options.expression),
                            decoratorNodes = nodes(container.resolve('Template', newValue)),
                            decoratorLinker = compile(container, decoratorNodes, {
                                content: {
                                    link: function (node) {
                                        // insert node into structure
                                        var contentNode = options.templateNode.cloneNode(true);
                                        node.replace(contentNode);
        
                                        // link
                                        options.linker.link(contentNode, context);
                                    }
                                }
                            });
        
                        decoratorNodes = decoratorNodes.clone(true);
                        decoratorNodes.insertAfter(linkNode);
        
                        // we supporting constants at the moment :(
                        Object.getOwnPropertyNames(expression.parameters).forEach(function (propertyName) {
                            optionsContext[propertyName] = expression.parameters[propertyName];
                        });
        
                        decoratorLinker.link(decoratorNodes, optionsContext);
                    });
                }
            }
        }];
        
        var onDirectiveFactory = ['$parse', function (parse) {
            return {
                link: function (node, context, options) {
                    var evaluator = parse(options.expression).evaluator;
                    node.on(options.qualifier, function () {
                        evaluator(context);
                    });
                }
            }
        }];
        
        
        var propertyDirectiveFactory = [function () {
            return {
                compile : function(options) {
                    options.propertyName = mapName(options.qualifier.split('_').map(function (x, i) {
                        return i ? x.charAt(0).toUpperCase() + x.substring(1) : x;
                    }).join(''));
                },
                link: function (node, context, options) {
                    context.$observe(options.expression, function(newValue) {
                        node[options.propertyName] = newValue;
                    });
                }
            }
        }];
        
        var controllerDirectiveFactory = ['$parse', '$container', function (parse, container) {
            return {
                context : {
        
                },
                link: function (linkNode, context, options) {
                    context.$controller = container.resolve('Controller', options.expression, { $context: context });
                }
            }
        }];
        
        
        function defaultEqualityComparer(x, y) {
            return x === y;
        }
        
        var Observable = type(
            function Observable() {
                this._observers = [];
                this._observableProperties = {};
            }).defines({
                notify: function (changes) {
                    this._observers.forEach(function (observer) {
                        observer(changes);
                    });
                },
                observe: function (callback) {
                    this._observers.push(callback);
                },
                unobserve: function (callback) {
                    var index = this._observers.indexOf(callback);
                    if (index !== -1) {
                        this._observers.splice(index, 1);
                    }
                }
            }).definesStatic({
                property: function (name, equalityComparer) {
                    equalityComparer = equalityComparer || defaultEqualityComparer;
                    return extend(function (newValue) {
                            var oldValue = this._observableProperties[name];
                            if (arguments.length) {
                                if (!equalityComparer(oldValue, newValue)) {
                                    this._observableProperties[name] = newValue;
                                    this.notify({
                                        type: "updated",
                                        name: "seen",
                                        oldValue: oldValue
                                    });
                                    return true;
                                }
                                return false;
                            }
        
                            return oldValue;
                        },
                        {
                            isPropertyAccessor: true
                        });
                }
            }).build();
        
        
        photon.Observable = Observable;
        function defineChildDataContext(parent) {
            function DataContext(parent) {
                // invoke parent constructor
                parent.constructor.call(this, parent.$parse);
        
                // update parent/child linkage
                this.$parent = parent;
                parent.$children.add(this);
            }
        
            DataContext.prototype = parent;
            return DataContext;
        }
        
        var DataContext = photon['DataContext'] = type(
            function DataContext(parse) {
                this.$children = new List();
                this.$parse = parse;
                this.$observers = {};
                this.$autoObservers = {};
            })
            .defines(
            {
                $new: function () {
                    if (!this.hasOwnProperty('$childScopeType')) {
                        this.$childScopeType = defineChildDataContext(this);
                    }
        
                    return new this.$childScopeType(this);
                },
                $eval: function (value) {
                    if (isString(value)) {
                        return this.$parse(value)(this);
                    }
                    if (isFunction(value)) {
                        return value(this);
                    }
                    throw new Error(); // TODO:
                },
                $sync: function () {
                    Object.getOwnPropertyNames(this.$observers).forEach(function (name) {
                        this.$observers[name].sync();
                    }.bind(this));
                },
                $observe: function (expression, handler) {
                    var observers = this.$observers, observer = observers[expression];
                    if (!observer) {
                        if (!observeObject(this, expression, handler)) {
                            expression = this.$parse(expression);
                            var evaluator = expression.evaluator;
                            observer = observers[expression] = new ExpressionObserver(
                                function () {
                                    return evaluator(this);
                                }.bind(this));
                        }
                    }
                    if (observer) { // TODO: Added as workaround whilst working on auto observe
                        observer.on(handler);
                    }
                }
            })
            .build();
        
        function observeObject(context, expression, handler) {
            if (!Object.observe) {
                return false;
            }
        
            var evaluator = context.$parse(expression).evaluator;
            var paths = evaluator.paths;
            if (!evaluator.isObservable) { // should return merged paths
                return false;
            }
        
            var rootNode = context.$observeRoot = (context.$observeRoot || new ObservationNode(context));
        
            // are we already watching this expression?
            var observer = context.$autoObservers[expression];
            if (observer) {
                observer.on(handler);
                return true;
            }
        
            // create new watcher for the expression
            observer = context.$autoObservers[expression] = new ExpressionObserver(function() { // TODO, make it context.$eval?
                return evaluator(context);
            });
            observer.on(handler);
        
            for (var j=0; j<paths.length; j++) {
                var path = paths[j];
                var value = context, parent = rootNode, current;
                for (var i = 0; i < path.length; i++) {
                    current = parent.getOrCreateChild(path[i]);
                    current.on(observer);
                    parent = current;
                    value = current.value;
                }
            }
        
            return true;
        }
        
        var ObservationNode = type(
            function ObservationNode(value) {
                this._children = null;
                this._observers = [];
                this._changedHandler = this.changed.bind(this);
        
                this.setValue(value);
            }).defines(
            /**
             * @lends ObservationNode.prototype
             */
            {
                changed: function (changes) {
                    var children = this._children;
                    if (!children) {
                        return;
                    }
        
                    changes.forEach(function (change) {
                        var child = children[change.name];
                        if (child) {
                            child.setValue(change.object[change.name]);
                            child._observers.forEach(function (observer) {
                                observer.sync();
                            });
                        }
                    });
                },
                getOrCreateChild: function (name) {
                    this._children = this._children || [];
        
                    return this._children[name] || (this._children[name] =
                        new ObservationNode(isNullOrUndefined(this._value) ? null : this._value[name]));
                },
                getValue: function () {
                    return this._value;
                },
                setValue: function (newValue) {
                    var oldValue = this._value;
                    if (oldValue !== newValue) {
                        var handler = this._changedHandler;
        
                        // detach from old
                        if (!isNullOrUndefined(oldValue) && !isPrimitive(oldValue)) {
                            Object.unobserve(oldValue, handler);
                        }
        
                        // attach to new
                        if (!isNullOrUndefined(newValue) && !isPrimitive(newValue)) {
                            Object.observe(newValue, handler);
                        }
        
                        this._value = newValue;
                    }
                },
                on: function (observer) {
                    this._observers.push(observer);
                }
            }).build();
        
        var ExpressionObserver = photon.type(
            function ExpressionObserver (evaluator) {
                this._handlers = new List();
                this._evaluator = evaluator;
                this._value = evaluator();
            })
            .defines({
                sync: function () {
                    var oldValue = this._value, newValue = this._value = this._evaluator();
                    if (oldValue !== newValue) {
                        this._handlers.forEach(function (handler) {
                            handler(newValue, oldValue);
                        });
                    }
                },
                on: function (handler) {
                    this._handlers.add(handler);
                    handler(this._value);
                },
                off: function (handler) {
                    this._handlers.remove(handler);
                }
            })
            .build();
        /**
         * @const
         * @type {number}
         */
        var NODE_DOCUMENT = 9;
        
        /**
         * @const
         * @type {number}
         */
        var NODE_ELEMENT = 1;
        
        /**
         * @const
         * @type {number}
         */
        var NODE_TEXT = 3;
        
        function mapName(name) {
            return nameMap[name] || (nameMap[name] = name);
        }
        
        var nameMap = {};
        
        var uiModule = module(function(x) {
            x.directive('mv-each').factory(eachDirectiveFactory);
            x.directive('mv-action').factory(actionDirectiveFactory);
            x.directive('mv-on-').factory(onDirectiveFactory);
            x.directive('mv-model').factory(modelDirectiveFactory);
            x.directive('mv-attr-').factory(attrDirectiveFactory);
            x.directive('mv-').factory(propertyDirectiveFactory);
            x.directive('mv-decorator').factory(decorateDirectiveFactory);
            x.directive('mv-text').factory(textDirectiveFactory);
            x.directive('mv-show').factory(showDirectiveFactory);
        
            x.directive('mv-controller').factory(controllerDirectiveFactory);
        
            x.factory('$parse', function() {
                var parse = photon.parser().parse;
                return function (text) {
                    return parse(text, {isBindingExpression: true});
                };
            });
            x.type('$rootContext', ['$parse', DataContext]);
        });
        
        
        
        photon.bootstrap = function (element, modules, initialData) {
            var container;
        
            modules = modules || [];
            modules.unshift(uiModule);
            modules.unshift(module(function(builder) {
                builder.factory('$container', function() {
                    return container;
                });
            }));
        
            container = photon.container(modules);
        
            var dataContext = container.resolve('$rootContext');
            element.dataContext = dataContext;
            if (initialData) {
                extend(dataContext, initialData);
            }
            var linker = compile(container, element);
            linker.link(element, dataContext);
            return dataContext;
        };
        
        photon.bind = function (element, updateSource, updateTarget) {
            element.bindings = element.bindings || [];
            var binding = {
                updateSource : updateSource,
                updateTarget : updateTarget
            };
            element.bindings.push(binding);
            return binding;
        };
        
        
        function compile(container, element, templateLinkers) {
            function getAttributeDirective(type) {
                return container.tryResolve('Directive', type);
            }
        
            function compileAttributes(node) {
                if (node.tagName === 'CONTENT') {
                    return [{
                        directive : templateLinkers.content,
                        options : {
                        }
                    }]
                }
        
                var attributes = node && node.attributes;
                return attributes ? enumerable(attributes).select(
                    function (x) {
                        var type = x.name,
                            qualifier,
                            directive;
        
                        if (!(directive = getAttributeDirective(type))) {
                            var qualifierIndex = type.lastIndexOf('-') + 1;
                            if (qualifierIndex !== 0 && (directive = getAttributeDirective(type.substring(0, qualifierIndex)))) {
                                qualifier = type.substring(qualifierIndex);
                                type = type.substring(0, qualifierIndex - 1);
                            }
                        }
                        return directive ? {
                            directive: directive,
                            options: {
                                type: type,
                                qualifier: qualifier,
                                expression: x.value
                            }
                        } : null;
                    }).where(function (x) {
                        return x;
                    }).orderBy(function (x) {
                        if (x.directive.render === 'replace') {
                            return -1;
                        }
                        return 0;
                    }).toArray() : null;
            }
        
            function makeLinkerChainFn(parent, child) {
                if (!parent && !child) {
                    return null;
                }
                if (!child) {
                    return parent;
                }
        
                return function (node, context) {
                    if (parent) {
                        parent(node, context);
                    }
                    child(node.childNodes, context);
                }
        
            }
        
            function makeLinkerFn(compileInfos, action) {
                if (compileInfos.length === 1) {
                    var compileInfo = compileInfos[0];
                    return function (node, context) {
                        action(compileInfo.directive, node, context, compileInfo.options);
                    }
                }
                return function (node, context) {
                    for (var i = 0, n = compileInfos.length; i < n; i++) {
                        action(compileInfos[i].directive, node, context, compileInfos[i].options);
                    }
                };
            }
        
            function makeLinkFn(compileInfos) {
                return makeLinkerFn(compileInfos, function (directive, node, context, options) {
                    directive.link(nodes(node), context, options);
                });
            }
        
            function makeUnlinkFn(compileInfos) {
                return makeLinkerFn(compileInfos, function (directive, node, context, options) {
                    directive.unlink(nodes(node), context, options);
                });
            }
        
            function compileNode(node, compileInfos) {
                /**
                 *
                 * @type {Array}
                 */
                var link, unlink, templateLinker, requiresNewContext = false;
                compileInfos = compileInfos || compileAttributes(node);
                if (compileInfos && compileInfos.length) {
                    if (compileInfos[0].directive.render === 'replace') {
                        compileInfos[0].options.linker = compileNode(node, compileInfos.slice(1));
                        compileInfos = compileInfos.slice(0, 1);
                    } else {
                        templateLinker = null;
                    }
        
                    // Can only walk this route with a templateLinker once due to the array reduction.
                    compileInfos.forEach(function (compileInfo) {
                        if (compileInfo.directive.context) {
                            requiresNewContext = true;
                        }
        
                        var directive = compileInfo.directive;
                        if (directive.compile) {
                            directive.compile(compileInfo.options);
                        }
                        if (compileInfo.directive.render === 'replace') {
                            compileInfo.options.templateNode = node;
                            var commentNode = document.createComment(compileInfo.type);
                            node.parentNode.replaceChild(commentNode, node);
                            node = commentNode;
                        }
                    });
        
                    link = makeLinkFn(compileInfos);
                    unlink = makeUnlinkFn(compileInfos);
                }
        
                if (node.childNodes.length) {
                    var childLinker = compileNodes(enumerable(node.childNodes));
                    if (childLinker) {
                        link = makeLinkerChainFn(link, childLinker.link);
                        unlink = makeLinkerChainFn(unlink, childLinker.unlink);
                    }
                }
        
                if (requiresNewContext) {
                    var childLink = link;
                    // big problem with unlink here as we cannot maintain context :(
                    link = function(linkNode, context, options) {
                        childLink(linkNode, context.$new(), options);
                    }
                }
        
                return link ? {
                    link: link,
                    unlink: unlink
                } : null;
            }
        
            function compileNodes(nodes) {
                nodes = nodes.toArray();
        
                var nodeLinkers = nodes.map(function (node) {
                    return compileNode(node);
                });
        
                return {
                    link: function (nodes, context) {
                        enumerable(nodes).toArray().forEach(function(x, i) {
                            var nodeLinker = nodeLinkers[i];
                            if (nodeLinker) {
                                nodeLinker.link(x, context);
                            }
                        });
                    },
                    unlink: function (nodes, context) {
                        enumerable(nodes).toArray().forEach(function(x, i) {
                            var nodeLinker = nodeLinkers[i];
                            if (nodeLinker) {
                                nodeLinker.unlink(nodes[i], context);
                            }
                        });
                    }
                };
            }
        
            if (element.getEnumerator) {
                return compileNodes(element);
            }
            if (isArrayLike(element)) {
                return compileNodes(enumerable(element));
            }
            return compileNode(element);
        }
        
        /*
         So what have we learned:
        
         2. We have a binding concept which binds source properties to target properties.
        
         3. We need to consider cleanup
        
         4. We need to consider watches
        
         5. We need to consider complex templates
        
         6. We need to consider element based directives
        
         7. Would like to flesh out the parameter parsing options for attribute directives, e.g. specify what is valid,
            parser, coercer rules.
        
         8. Need to support <control.property> syntax for complex properties, e.g. templates
        
         9. Need to optimize constant expressions
        
         10.  Need to ensure that if we provide a callback function to a binding, we do not lose its context, e.g. commands.
        
         */
        
        
    });
})(window, document);
//@ sourceMappingURL=photon-2.0-debug.js.map