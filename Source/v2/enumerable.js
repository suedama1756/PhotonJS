// Even if we use the enumerator type we must wrap it before returning as an 'real' enumerator (to ensure privacy is maintained)

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
    var STATE_COMPLETE = 3;
    /**
     * @const
     * @type {object}
     */
    var NO_VALUE = {};

    var EMPTY = new Enumerable(function () {
        var e = iterator();
        return exportEnumerator(
            e.completed,
            e.current);
    });

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
            return !(state = STATE_COMPLETE);
        }

        function isComplete() {
            return state === STATE_COMPLETE;
        }

        function current() {
            if (state === STATE_NOT_STARTED) {
                throw new Error('Enumeration has not started.');
            }

            if (state === STATE_COMPLETE) {
                throw new Error('Enumeration has completed.');
            }

            return curr;
        }

        function moveNext() {
            return state !== STATE_COMPLETE && enumerator['moveNext']() ?
                progress(enumerator['current']()) :
                completed();
        }

        return {
            moveNext:moveNext,
            current:current,
            completed:completed,
            isComplete:isComplete,
            progress:progress
        }
    }

    function fromArrayLike(array) {
        return function () {
            var i = -1, e = iterator();
            return exportEnumerator(
                function () {
                    if (!e.isComplete()) {
                        var l = array.length;
                        while (++i < l) {
                            if (i in array) {
                                return e.progress(array[i]);
                            }
                        }
                    }

                    return e.completed();
                },
                e.current);
        };
    }

    function where(enumerable, predicateOrFactory, isFactory) {
        return function () {
            var i = iterator(enumerable), index = -1, predicate = isFactory ? predicateOrFactory() : predicateOrFactory;
            return exportEnumerator(
                function () {
                    while (i.moveNext()) {
                        if (predicate(i.current(), ++index)) {
                            return true
                        }
                    }

                    return i.completed();
                },
                i.current);
        };
    }

    function any() {
        return true;
    }

    function findNext(iter, predicate) {
        predicate = predicate || any;
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

    function aggregate(enumerable, accumulator, seed) {
        var enumerator = enumerable['getEnumerator']();
        while (enumerator['moveNext']()) {
            seed = accumulator(seed, enumerator['current']());
        }
        return seed;
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
                return new Enumerable(where(this,
                    function () {
                        var seen = {};
                        return function (item) {
                            var key = getKey(keySelector ? keySelector(item) : item);
                            return seen.hasOwnProperty(key) ? false : seen[key] = true;
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
            'groupBy':function (keySelector) {
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
                        }
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
                                itemKey = keySelector ? keySelector(item) : item,
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
                            return !iter.isComplete() || pendingGroups.length ?
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
                }, 0);
            },
            'average':function () {
                var count = 0;
                return aggregate(this, function (accumulated, next) {
                    count++;
                    return accumulated + toNumber(next);
                }, 0) / count;
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
                var result = [], i = 0, e = iterator(this);
                while (e.moveNext()) {
                    result[i++] = e.current();
                }
                return result;
            }
        })['build']();

    return function (enumerable) {
        if (isNullOrUndefined(enumerable)) {
            return EMPTY;
        }

        if (isFunction(enumerable['getEnumerator'])) {
            return new Enumerable(function () {
                return enumerable['getEnumerator'];
            });
        }

        return new Enumerable(isArrayLike(enumerable) ? fromArrayLike(enumerable) : [enumerable]);
    };
})();

photon['enumerable'] = enumerable;