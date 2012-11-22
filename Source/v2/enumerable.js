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