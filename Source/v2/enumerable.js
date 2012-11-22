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
