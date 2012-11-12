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
            "getUID":getUID
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
        
        // Even if we use the enumerator type we must wrap it before returning as an 'real' enumerator (to ensure privacy is maintained)
        // 5692
        
        var enumerable = (function () {
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
            /**
             * @const
             * @type {object}
             */
            var NO_VALUE = {};
        
            /**
             * Creates an enumerator from the specified moveNext and current functions. This function ensures enumerator
             * functions are exported correctly in the minified code.
             *
             * @param {function} moveNext The 'moveNext' function for the enumerator.
             * @param {function} current The 'current' function for the enumerator.
             */
            function exportEnumerator(moveNext, current) {
                return {
                    'moveNext':moveNext,
                    'current':current
                };
            }
        
            /**
             *
             * @param {Enumerable} [enumerable]
             * @param {function} [selector]
             * @return {Object}
             */
            function iterator(enumerable, selector) {
                var enumerator = enumerable ? enumerable['getEnumerator']() : null,
                    state = STATE_NOT_STARTED,
                    curr,
                    index = -1;
        
                function progress(value) {
                    curr = selector ? selector(value, ++index) : value;
                    return !!(state = STATE_IN_PROGRESS);
                }
        
                function completed() {
                    return !(state = STATE_COMPLETED);
                }
        
                function isCompleted() {
                    return state === STATE_COMPLETED;
                }
        
                function isStarted() {
                    return state !== STATE_NOT_STARTED;
                }
        
                function current() {
                    if (!isStarted()) {
                        throw new Error('Enumeration has not started.');
                    }
                    if (isCompleted()) {
                        throw new Error('Enumeration has completed.');
                    }
                    return curr;
                }
        
                function moveNext() {
                    return state !== STATE_COMPLETED && enumerator['moveNext']() ?
                        progress(enumerator['current']()) :
                        completed();
                }
        
                return {
                    moveNext:moveNext,
                    current:current,
                    completed:completed,
                    isComplete:isCompleted,
                    isStarted:isStarted,
                    progress:progress
                };
            }
        
            function makeSelector(selector) {
                return isString(selector) ? function (x) {
                    return x[selector];
                } : selector || defaultSelector;
        
            }
        
            function makeSelectors(selectors) {
                if (isString(selectors)) {
                    selectors = [selectors];
                }
                return selectors ?
                    enumerable(selectors).select(makeSelector) :
                    enumerable(defaultSelector);
            }
        
            function fromArrayLike(arrayLike) {
                return function () {
                    var i = -1, iter = iterator();
                    return exportEnumerator(
                        function () {
                            if (!iter.isComplete()) {
                                var l = arrayLike.length;
                                while (++i < l) {
                                    if (i in arrayLike) {
                                        return iter.progress(arrayLike[i]);
                                    }
                                }
                            }
        
                            return iter.completed();
                        },
                        iter.current);
                };
            }
        
            function fromString(text) {
                return function () {
                    var i = -1, l = text.length, iter = iterator();
                    return exportEnumerator(
                        function () {
                            return !iter.isComplete() && ++i < l ?
                                iter.progress(text.charAt(i)) :
                                iter.completed();
                        },
                        iter.current);
                };
            }
        
            function makeComparer(orderByDescriptors, isTail) {
                if (orderByDescriptors.moveNext()) {
                    var curr = orderByDescriptors.current(),
                        next = makeComparer(orderByDescriptors, true),
                        keySelector = makeSelector(curr.keySelector),
                        direction = curr.direction,
                        comparer = curr.comparer;
        
        
                    var result = function (x, y) {
                        return comparer(keySelector(x), keySelector(y)) || next(x, y);
                    };
        
                    return !isTail && direction === -1 ? function (x, y) {
                        return result(x, y) * -1;
                    } : result;
        
                }
                return function () {
                    return 0;
                };
            }
        
            function orderByNext(e, keySelectors, comparer, direction) {
                return extend(
                    new Enumerable(function () {
                        // double wrap for consistent lazy evaluation
                        return enumerable(e['toArray']().sort(
                            makeComparer(iterator(keySelectors, function (keySelector) {
                                return {
                                    keySelector:keySelector,
                                    direction:direction,
                                    comparer:comparer || defaultComparer
                                };
                            }))))['getEnumerator']();
                    }),
                    {
                        'thenBy':function (keySelector, comparer) {
                            return orderByNext(e, keySelectors.concat(makeSelectors(keySelector)), comparer, 1);
                        },
                        'thenByDesc':function (keySelector, comparer) {
                            return orderByNext(e, keySelectors.concat(makeSelectors(keySelector)), comparer, -1);
                        }
                    });
            }
        
            function where(e, predicateOrFactory, isFactory) {
                return function () {
                    var iter = iterator(e), index = -1, predicate = isFactory ? predicateOrFactory() : predicateOrFactory;
                    return exportEnumerator(
                        function () {
                            while (iter.moveNext()) {
                                if (predicate(iter.current(), ++index)) {
                                    return true;
                                }
                            }
        
                            return iter.completed();
                        },
                        iter.current);
                };
            }
        
            function predicateTrue() {
                return true;
            }
        
            function findNext(iter, predicate) {
                predicate = predicate || predicateTrue;
                while (iter.moveNext()) {
                    var current = iter.current();
                    if (predicate(current)) {
                        return current;
                    }
                }
        
                return NO_VALUE;
            }
        
            function findLast(iter, predicate) {
                var lastFound = NO_VALUE, current;
                while ((current = findNext(iter, predicate)) !== NO_VALUE) {
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
        
            function aggregate(enumerable, accumulator, seed, empty) {
                var enumerator = enumerable['getEnumerator'](), index = 0;
                while (enumerator['moveNext']()) {
                    seed = accumulator(seed, enumerator['current'](), index++);
                }
                return index ? seed : empty;
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
        
            function defaultSelector(item) {
                return item;
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
        
            function extremum(enumerable, comparer, direction) {
                comparer = comparer || defaultComparer;
                return aggregate(enumerable, function (accumulated, next) {
                    return isUndefined(accumulated) || comparer(next, accumulated) === direction ?
                        next :
                        accumulated;
                });
            }
        
            function Enumerable(getEnumerator) {
                if (!(this instanceof Enumerable)) {
                    return new Enumerable(getEnumerator);
                }
        
                this['getEnumerator'] = getEnumerator;
            }
        
            type(Enumerable)['defines'](
                {
                    'where':function (predicate) {
                        return new Enumerable(where(this, predicate));
                    },
                    'select':function (selector) {
                        var self = this;
                        return new Enumerable(function () {
                            var iter = iterator(self, selector);
                            return exportEnumerator(
                                iter.moveNext,
                                iter.current);
                        });
                    },
                    'distinct':function (keySelector) {
                        keySelector = keySelector || defaultSelector;
                        return new Enumerable(where(this,
                            function () {
                                var seen = {};
                                return function (item) {
                                    var key = getKey(keySelector(item));
                                    return seen.hasOwnProperty(key) ?
                                        false :
                                        seen[key] = true;
                                };
                            }, true));
        
                    },
                    'skip':function (count) {
                        return count > 0 ? new Enumerable(where(this, function (x, i) {
                            return i >= count;
                        })) : this;
                    },
                    'take':function (count) {
                        var self = this;
                        return new Enumerable(function () {
                            var iter = iterator(self), taken = 0;
                            return exportEnumerator(function () {
                                if (taken < count && iter.moveNext()) {
                                    taken++;
                                    return true;
                                }
                                return iter.completed();
        
                            }, iter.current);
                        });
                    },
                    'concat':function () {
                        var self = this, args = arguments;
                        return new Enumerable(function () {
                            var iter = iterator(),
                                currIter = iterator(self),
                                nextIter = iterator(enumerable(args), function (x) {
                                    return iterator(enumerable(x));
                                });
        
                            return exportEnumerator(function () {
                                    while (!currIter.moveNext()) {
                                        if (nextIter.moveNext()) {
                                            currIter = nextIter.current();
                                        } else {
                                            return iter.completed();
                                        }
                                    }
                                    return iter.progress(currIter.current());
                                },
                                iter.current);
        
                        });
                    },
                    'groupBy':function (keySelector) {
                        keySelector = keySelector || defaultSelector;
                        var self = this;
                        return new Enumerable(function () {
                            var groups = {},
                                iter = iterator(self),
                                current,
                                pendingGroups = [],
                                pendingGroupIndex = 0;
        
                            function createGetEnumerator(items, itemLookup) {
                                return function () {
                                    var groupIter = iterator(), itemIndex = 0;
                                    return exportEnumerator(function () {
                                            return (itemIndex < items.length || moveNext(true, itemLookup)) ?
                                                groupIter.progress(items[itemIndex++]) :
                                                groupIter.completed();
                                        },
                                        groupIter.current);
                                };
                            }
        
                            function moveNext(matchKey, keyToMatch) {
                                if (!matchKey) {
                                    if (pendingGroupIndex === pendingGroups.length) {
                                        pendingGroups = [];
                                    } else if (pendingGroupIndex < pendingGroups.length) {
                                        current = pendingGroups[pendingGroupIndex++].enumerable;
                                        return true;
                                    }
                                }
        
                                while (iter.moveNext()) {
                                    var item = iter.current(),
                                        itemKey = keySelector(item),
                                        itemLookup = getKey(itemKey);
        
                                    if (groups.hasOwnProperty(itemLookup)) {
                                        groups[itemLookup].items.push(item);
                                    } else {
                                        var items = [item];
                                        current = new Enumerable(
                                            createGetEnumerator(items, itemLookup));
                                        current.key = itemKey;
                                        var group = groups[itemLookup] = {
                                            items:items,
                                            enumerable:current
                                        };
        
                                        if (matchKey) {
                                            pendingGroups.push(group);
                                        }
                                    }
        
                                    if (!matchKey || keyToMatch === itemLookup) {
                                        return true;
                                    }
                                }
                                return iter.completed();
                            }
        
                            return exportEnumerator(
                                function () {
                                    return moveNext(false, null);
                                },
                                function () {
                                    return (!iter.isComplete() || pendingGroups.length) && iter.isStarted() ?
                                        current :
                                        iter.current();
        
                                });
                        });
                    },
                    'first':function (predicate) {
                        return valueOrThrow(
                            findNext(iterator(this), predicate));
                    },
                    'firstOrDefault':function (predicate, defaultValue) {
                        return valueOrDefault(
                            findNext(iterator(this), predicate), defaultValue);
                    },
                    'last':function (predicate) {
                        return valueOrThrow(findLast(iterator(this), predicate));
                    },
                    'lastOrDefault':function (predicate, defaultValue) {
                        return valueOrDefault(findLast(iterator(this), predicate), defaultValue);
                    },
                    'any':function (predicate) {
                        return findNext(iterator(this), predicate) !== NO_VALUE;
                    },
                    'min':function (comparer) {
                        return extremum(this, comparer, -1);
                    },
                    'max':function (comparer) {
                        return extremum(this, comparer, 1);
                    },
                    'sum':function () {
                        return aggregate(this, function (accumulated, next) {
                            return accumulated + toNumber(next);
                        }, 0, NaN);
                    },
                    'orderBy':function (keySelector, comparer) {
                        return orderByNext(this,
                            makeSelectors(keySelector), comparer, 1);
                    },
                    'orderByDesc':function (keySelector, comparer) {
                        return orderByNext(this,
                            makeSelectors(keySelector), comparer, -1);
                    },
                    'average':function () {
                        var count = 0;
                        return aggregate(this, function (accumulated, next) {
                            count++;
                            return accumulated + toNumber(next);
                        }, 0, NaN) / count;
                    },
                    'aggregate':function (accumulator, seed) {
                        return aggregate(this, accumulator, seed);
                    },
                    'count':function () {
                        return aggregate(this, function (accumulated) {
                            return accumulated + 1;
                        }, 0);
                    },
                    'reverse':function () {
                        return enumerable(this['toArray']().reverse());
                    },
                    'toArray':function () {
                        var result = [], index = 0, iter = iterator(this);
                        while (iter.moveNext()) {
                            result[index++] = iter.current();
                        }
                        return result;
                    }
                })['build']();
        
            var EMPTY = new Enumerable(function () {
                var iter = iterator();
                return exportEnumerator(
                    iter.completed, iter.current);
            });
        
            var enumerable = function (enumerable) {
                if (isUndefined(enumerable) && !arguments.length) {
                    return EMPTY;
                }
        
                if (hasProperty(enumerable, 'getEnumerator')) {
                    return enumerable;
                }
        
                if (isString(enumerable)) {
                    return new Enumerable(fromString(enumerable));
                }
        
                return new Enumerable(fromArrayLike(isArrayLike(enumerable) ? enumerable : [enumerable]));
            };
        
            photon['enumerable'] = enumerable;
            photon['Enumerable'] = Enumerable;
        })();
    });
})(window, document);
//@ sourceMappingURL=photon-2.0-debug.js.map