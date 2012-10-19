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
            var STATE_DEFERRED = 2;
            /**
             * @const
             * @type {Number}
             */
            var STATE_COMPLETE = 3;
            /**
             * @const
             * @type {object}
             */
            var NO_VALUE = {};
        
            var EMPTY_ARRAY = [];
        
            /**
             * Throws an exception if the state is STATE_NOT_STARTED or STATE_COMPLETE
             * @param state
             * @return {number}
             */
            function throwIfNotStartedOrComplete(state) {
                if (state === STATE_NOT_STARTED) {
                    throw new Error('Enumeration has not started.');
                }
        
                if (state === STATE_COMPLETE) {
                    throw new Error('Enumeration has completed.');
                }
                return state;
            }
        
            /**
             * Creates an enumerator from the specified moveNext and current functions
             */
            function createEnumerator(moveNext, current) {
                return {
                    'moveNext':moveNext,
                    'current':current
                };
            }
        
            function pendingOrComplete(condition) {
                return condition ? STATE_IN_PROGRESS : STATE_COMPLETE;
            }
        
            function where(enumerable, predicate) {
                return function () {
                    var state = STATE_NOT_STARTED, current, enumerator = enumerable['getEnumerator']();
                    return createEnumerator(
                        function () {
                            if (state !== STATE_COMPLETE) {
                                state = STATE_COMPLETE;
                                while (enumerator['moveNext']()) {
                                    var source = enumerator['current']();
                                    if (predicate(source)) {
                                        state = STATE_IN_PROGRESS;
                                        current = source;
                                        return true;
                                    }
                                }
                            }
        
                            return false;
                        },
                        function () {
                            throwIfNotStartedOrComplete(state);
                            return current;
                        });
                };
            }
        
            function select(enumerable, selector) {
                return function () {
                    var state = STATE_NOT_STARTED, pending, current, enumerator = enumerable['getEnumerator']();
                    return createEnumerator(
                        function () {
                            if ((state = enumerator['moveNext']() ? STATE_DEFERRED : STATE_COMPLETE) === STATE_DEFERRED) {
                                // take a copy of the source value as we have no versioning
                                pending = enumerator['current']();
                            }
        
                            return state !== STATE_COMPLETE;
                        },
                        function () {
                            if (throwIfNotStartedOrComplete(state) === STATE_DEFERRED) {
                                state = STATE_IN_PROGRESS;
                                // transform source value
                                current = selector(pending);
                            }
        
                            return current;
                        });
                };
            }
        
            function skip(enumerable, count) {
                return function () {
                    var state = STATE_NOT_STARTED, current, enumerator = enumerable['getEnumerator']();
                    return createEnumerator(function () {
                            if (state === STATE_NOT_STARTED) {
                                //noinspection StatementWithEmptyBodyJS
                                for (var i = 0; enumerator['moveNext']() && i < count; i++);
                                state = pendingOrComplete(i === count);
                            } else if (state === STATE_IN_PROGRESS) {
                                state = pendingOrComplete(enumerator['moveNext']());
                            }
                            current = state === STATE_IN_PROGRESS ?
                                enumerator['current']() :
                                null;
                            return state !== STATE_COMPLETE;
                        },
                        function () {
                            throwIfNotStartedOrComplete(state);
                            return current;
                        });
                };
            }
        
            function fromArrayLike(array) {
                return function () {
                    var index = -1, state = STATE_NOT_STARTED, current;
                    return createEnumerator(
                        function () {
                            if (state !== STATE_COMPLETE) {
                                state = STATE_COMPLETE;
        
                                var l = array.length;
                                while (++index < l) {
                                    if (index in array) {
                                        current = array[index];
                                        state = STATE_IN_PROGRESS;
                                        return true;
                                    }
                                }
                            }
        
                            return false;
                        },
                        function () {
                            throwIfNotStartedOrComplete(state);
                            return current;
                        });
                };
            }
        
            function any() {
                return true;
            }
        
            function findNext(enumerator, predicate) {
                predicate = predicate || any;
                while (enumerator['moveNext']()) {
                    var current = enumerator['current']();
                    if (predicate(current)) {
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
        
            function aggregate(enumerable, accumulator, seed) {
                var enumerator = enumerable['getEnumerator']();
                while (enumerator['moveNext']()) {
                    seed = accumulator(seed, enumerator['current']());
                }
                return seed;
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
        
            function Enumerable(getEnumerator) {
                this['getEnumerator'] = getEnumerator;
            }
        
            type(Enumerable)['defines'](
                {
                    'where':function (predicate) {
                        return new Enumerable(where(this, predicate));
                    },
                    'select':function (selector) {
                        return new Enumerable(select(this, selector));
                    },
                    'skip':function (count) {
                        return count > 0 ? new Enumerable(skip(this, count)) : this;
                    },
                    'first':function (predicate) {
                        return valueOrThrow(
                            findNext(this['getEnumerator'](), predicate));
                    },
                    'firstOrDefault':function (predicate, defaultValue) {
                        return valueOrDefault(
                            findNext(this['getEnumerator'](), predicate), defaultValue);
                    },
                    'last':function (predicate) {
                        return valueOrThrow(findLast(this['getEnumerator'](), predicate));
                    },
                    'lastOrDefault':function (predicate, defaultValue) {
                        return valueOrDefault(findLast(this['getEnumerator'](), predicate), defaultValue);
                    },
                    'any':function (predicate) {
                        return findNext(this['getEnumerator'](), predicate) !== NO_VALUE;
                    },
                    'min' : function(comparer) {
                        comparer = comparer || defaultComparer;
                        return aggregate(this, function(accumulated, next) {
                            return isUndefined(accumulated) || comparer(next, accumulated) === -1 ?
                                next :
                                accumulated;
                        });
                    },
                    'max' : function(comparer) {
                        comparer = comparer || defaultComparer;
                        return aggregate(this, function(accumulated, next) {
                            return isUndefined(accumulated) || comparer(next, accumulated) === 1 ?
                                next :
                                accumulated;
                        });
                    },
                    'sum' : function() {
                        return aggregate(this, function(accumulated, next) {
                            return accumulated + Number(next);
                        }, 0);
                    },
                    'average' : function() {
                        var count = 0;
                        return aggregate(this, function(accumulated, next) {
                            count++;
                            return accumulated + Number(next);
                        }, 0) / count;
                    },
                    'aggregate' : function(accumulator, seed) {
                        return aggregate(this, accumulator, seed);
                    },
                    'count' : function() {
                        return aggregate(this, function(accumulated) {
                            return accumulated + 1;
                        }, 0)
                    },
                    'reverse' : function() {
                        return enumerable(this['toArray']().reverse());
                    },
                    'toArray':function () {
                        var result = [], i = 0, enumerator = this['getEnumerator']();
                        while (enumerator['moveNext']()) {
                            result[i++] = enumerator['current']();
                        }
                        return result;
                    }
                })['build']();
        
            return function (iteratable) {
                return isFunction(iteratable['moveNext']) && isFunction(iteratable['current']) ?
                    new Enumerable(iteratable) :
                    new Enumerable(fromArrayLike(isArrayLike(iteratable) ?
                        (isNullOrUndefined(iteratable) ?
                            EMPTY_ARRAY :
                            iteratable)
                        : [iteratable]));
            };
        })();
        
        photon['enumerable'] = enumerable;
        
        
        
    });
})(window, document);
//@ sourceMappingURL=photon-2.0-debug.js.map