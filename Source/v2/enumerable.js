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

    function valueOrThrow(value) {
        if (value === NO_VALUE) {
            throw new Error();
        }
        return value;
    }

    function valueOrDefault(value, defaultValue) {
        return value === NO_VALUE ? defaultValue : value;
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
                return findNext(this, predicate) !== NO_VALUE;
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


