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
        if (!isArray(selectors)) {
            selectors = [selectors || defaultSelector];
        }
        return enumerable(selectors).select(makeSelector);

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
        return enumerable(select(makeSelectors(selectors), function (selector) {
            return {
                selector:selector,
                direction:direction,
                comparer:comparer || defaultComparer
            };
        }));
    }

    function orderByNext(e, orderByDescriptors) {
        return extend(
            new Enumerable(function () {
                // double wrap for consistent lazy evaluation
                return enumerable(e['toArray']().sort(
                    makeComparer(iterator(orderByDescriptors))))['getEnumerator']();
            }),
            {
                'thenBy':function (keySelectors, comparer) {
                    return orderByNext(e, orderByDescriptors.concat(makeOrderByDescriptors(keySelectors, comparer, 1)));
                },
                'thenByDesc':function (keySelector, comparer) {
                    return orderByNext(e, orderByDescriptors.concat(makeOrderByDescriptors(keySelector, comparer, -1)));
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

    function select(e, selector) {
        return function () {
            var iter = iterator(e, selector);
            return exportEnumerator(
                iter.moveNext,
                iter.current);
        }
    }

    function concat(e, args) {
        return function () {
            var iter = iterator(),
                currIter = iterator(e),
                nextIter = iterator(enumerable(args), function (x) {
                    return iterator(enumerable(x));
                });

            return exportEnumerator(function () {
                    while (!currIter.moveNext()) {
                        if (!nextIter.moveNext()) {
                            return iter.completed();
                        }
                        currIter = nextIter.current();
                    }
                    return iter.progress(currIter.current());
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

    function aggregate(e, accumulator, seed, empty) {
        var iter = iterator(e), index = 0;
        while (iter.moveNext()) {
            seed = accumulator(seed, iter.current(), index++);
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
            return enumerable(getEnumerator);
        }

        this['getEnumerator'] = getEnumerator;
    }

    type(Enumerable)['defines'](
        {
            'where':function (predicate) {
                return enumerable(where(this, predicate));
            },
            'select':function (selector) {
                return enumerable(select(this, selector));
            },
            'distinct':function (keySelector) {
                keySelector = keySelector || defaultSelector;
                return enumerable(where(this,
                    function () {
                        var seen = {};
                        return function (item) {
                            var key = getKey(keySelector(item));
                            return !seen.hasOwnProperty(key) && (seen[key] = true);
                        };
                    }, true));

            },
            'skip':function (count) {
                return count > 0 ? enumerable(where(this, function (x, i) {
                    return i >= count;
                })) : this;
            },
            'take':function (count) {
                var self = this;
                return enumerable(function () {
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
                return enumerable(concat(this, arguments));
            },
            'groupBy':function (keySelector) {
                keySelector = keySelector || defaultSelector;
                var self = this;
                return enumerable(function () {
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
                                current = enumerable(
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
                    makeOrderByDescriptors(keySelector, comparer, 1));
            },
            'orderByDesc':function (keySelector, comparer) {
                return orderByNext(this,
                    makeOrderByDescriptors(keySelector, comparer, -1));
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

    var enumerable = function (source) {
        if (isUndefined(source) && !arguments.length) {
            return EMPTY;
        }

        if (hasProperty(source, 'getEnumerator')) {
            return source;
        }

        if (isString(source)) {
            return new Enumerable(fromString(source));
        }

        if (isFunction(source)) {
            return new Enumerable(source);
        }

        return new Enumerable(fromArrayLike(isArrayLike(source) ? source : [source]));
    };

    photon['enumerable'] = enumerable;
    photon['Enumerable'] = Enumerable;
})();