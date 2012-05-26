/**
 * @param {Array} data
 * @return {Object}
 */
function createDiffData(data) {
    return { length:data.length, data:data, modified:[] };
}

/**
 * Finds the Shortest Middle Snake (SMS).
 * @param {Object} dataA
 * @param {Number} lowerA
 * @param {Number} upperA
 * @param {Object} dataB
 * @param {Number} lowerB
 * @param {Number} upperB
 * @param {Function} equals
 * @return {Object}
 */
function sms(dataA, lowerA, upperA, dataB, lowerB, upperB, equals) {
    var ret = {}, MAX = dataA.length + dataB.length + 1,
        downK = lowerA - lowerB, // the k-line to start the forward search
        upK = upperA - upperB, // the k-line to start the reverse search
        delta = (upperA - lowerA) - (upperB - lowerB),
        oddDelta = (delta & 1) !== 0,
        downDelta = new Array(2 * MAX + 2), // vector for the (0,0) to (x,y) search
        upVector = new Array(2 * MAX + 2), // vector for the (u,v) to (N,M) search
        downOffset = MAX - downK,
        upOffset = MAX - upK,
        maxD = ((upperA - lowerA + upperB - lowerB) / 2) + 1;

    // init vectors
    downDelta[downOffset + downK + 1] = lowerA;
    upVector[upOffset + upK - 1] = upperA;
    var x, y;
    for (var D = 0; D <= maxD; D++) {
        // Extend the forward path.
        for (var k = downK - D; k <= downK + D; k += 2) {
            // find the only or better starting point
            if (k === downK - D) {
                x = downDelta[downOffset + k + 1]; // down
            } else {
                x = downDelta[downOffset + k - 1] + 1; // a step to the right
                if ((k < downK + D) && (downDelta[downOffset + k + 1] >= x)) {
                    x = downDelta[downOffset + k + 1]; // down
                }
            }
            y = x - k;

            // find the end of the furthest reaching forward D-path in diagonal k.
            while (x < upperA && y < upperB && equals(dataA.data[x], dataB.data[y])) {
                x++;
                y++;
            }
            downDelta[downOffset + k] = x;

            // overlap ?
            if (oddDelta && (upK - D < k) && (k < upK + D)) {
                if (upVector[upOffset + k] <= downDelta[downOffset + k]) {
                    ret.x = downDelta[downOffset + k];
                    ret.y = downDelta[downOffset + k] - k;
                    return (ret);
                }
            }
        }

        // Extend the reverse path.
        for (k = upK - D; k <= upK + D; k += 2) {
            if (k === upK + D) {
                x = upVector[upOffset + k - 1]; // up
            } else {
                x = upVector[upOffset + k + 1] - 1; // left
                if (k > upK - D && upVector[upOffset + k - 1] < x) {
                    x = upVector[upOffset + k - 1]; // up
                }
            }
            y = x - k;

            while (x > lowerA && y > lowerB && equals(dataA.data[x - 1], dataB.data[y - 1])) {
                x--;
                y--; // diagonal
            }
            upVector[upOffset + k] = x;

            // overlap ?
            if (!oddDelta && downK - D <= k && k <= downK + D) {
                if (upVector[upOffset + k] <= downDelta[downOffset + k]) {
                    ret.x = downDelta[downOffset + k];
                    ret.y = downDelta[downOffset + k] - k;
                    return (ret);
                }
            }
        }
    }
    assert(false);
}

/**
 * This is the divide-and-conquer implementation of the longest common-sub-sequence (LCS)
 * algorithm.
 *
 * @param {Array} dataA
 * @param {Number} lowerA
 * @param {Number} upperA
 * @param {Array} dataB
 * @param {Number} lowerB
 * @param {Number} upperB
 * @param {Function} equals
 */
function lcs(dataA, lowerA, upperA, dataB, lowerB, upperB, equals) {
    // Fast walk through equal items at the start
    while (lowerA < upperA && lowerB < upperB && equals(dataA.data[lowerA], dataB.data[lowerB])) {
        lowerA++;
        lowerB++;
    }

    // Fast walk through equal lines at the end
    while (lowerA < upperA && lowerB < upperB && equals(dataA.data[upperA - 1], dataB.data[upperB - 1])) {
        --upperA;
        --upperB;
    }

    if (lowerA === upperA) {
        // mark as inserted lines.
        while (lowerB < upperB) {
            dataB.modified[lowerB++] = true;
        }

    } else if (lowerB === upperB) {
        // mark as deleted lines.
        while (lowerA < upperA) {
            dataA.modified[lowerA++] = true;
        }

    } else {
        // Find the middle snake and length of an optimal path for A and B
        var smsResult = sms(dataA, lowerA, upperA, dataB, lowerB, upperB, equals);

        // The path is from LowerX to (x,y) and (x,y) to UpperX
        lcs(dataA, lowerA, smsResult.x, dataB, lowerB, smsResult.y, equals);
        lcs(dataA, smsResult.x, upperA, dataB, smsResult.y, upperB, equals);
    }
}

/**
 * @param {object} dataA
 * @param {object} dataB
 * @returns {Array}
 */
function createDiffs(dataA, dataB) {
    var result = [],
        startA, startB,
        lineA = 0, lineB = 0,
        lengthA = dataA.length,
        lengthB = dataB.length;

    while (lineA < lengthA || lineB < lengthB) {
        if ((lineA < lengthA) && (!dataA.modified[lineA]) && (lineB < lengthB) && (!dataB.modified[lineB])) {
            // equal lines
            lineA++;
            lineB++;

        } else {
            // maybe deleted and/or inserted lines
            startA = lineA;
            startB = lineB;
            while (lineA < lengthA && (lineB >= lengthB || dataA.modified[lineA])) {
                lineA++;
            }

            while (lineB < lengthB && (lineA >= lengthA || dataB.modified[lineB])) {
                lineB++;
            }

            if (startA < lineA || startB < lineB) {
                result.push({
                    startA:startA,
                    startB:startB,
                    deletedA:lineA - startA,
                    insertedB:lineB - startB
                });
            }
        }
    }
    return result;
}


/** @namespace photon.array */
provide("photon.array",
    /**
     * @lends photon.array
     */
    {
        find:function (array, fromIndex, fn, obj) {
            var i = photon.array.findIndex(array, fromIndex, fn, obj);
            return i !== -1 ? array[i] : null;
        },
        findIndex:function (array, fromIndex, fn, obj) {
            if (photon.isFunction(fromIndex)) {
                obj = fn; fn = fromIndex; fromIndex = 0;
            }
            for (var i = fromIndex, n = array.length; i < n; i++) {
                var item = array[i];
                if (fn.call(obj, item, i, array)) {
                    return i;
                }
            }
            return -1;
        },
        map:arrayNativePrototype &&
            arrayNativePrototype.map ?
            function (array, mapper, obj) {
                return arrayNativePrototype.map.call(array, mapper, obj);
            } :
            function (array, mapper, obj) {
                var length = array.length, result = new Array(length),
                    actualArray = photon.isString(array) ? array.split('') : array;
                for (var i = 0; i < length; i++) {
                    if (i in actualArray) {
                        result[i] = mapper.call(obj, actualArray[i], i, array);
                    }
                }
                return result;
            },
        filter:arrayNativePrototype &&
            arrayNativePrototype.filter ?
            function (array, filter, obj) {
                return arrayNativePrototype.filter.call(array, filter, obj);
            } :
            function (array, filter, obj) {
                var arrayLength = array.length;
                var result = [];
                var resultIndex = 0;
                var arrayToFilter = photon.isString(array) ? array.split('') : array;
                for (var index = 0; index < arrayLength; index++) {
                    if (index in arrayToFilter) {
                        var value = arrayToFilter[index];  // in case array is mutated by filter
                        if (filter.call(obj, value, index, array)) {
                            result[resultIndex++] = value;
                        }
                    }
                }
                return result;
            },
        forEach:arrayNativePrototype && arrayNativePrototype.forEach ?
            function (array, fn, obj) {
                arrayNativePrototype.forEach.call(array, fn, obj);
            } :
            function (array, fn, obj) {
                array = photon.isString(array) ? array.split('') : array;
                for (var i = 0, n = array.length; i < n; i++) {
                    if (i in array) {
                        fn.call(obj, array[i], i, array);
                    }
                }
            },
        indexOf:arrayNativePrototype && arrayNativePrototype.indexOf ?
            function (array, item, fromIndex) {
                return arrayNativePrototype.indexOf.call(array, item, fromIndex);
            } :
            function (array, item, fromIndex) {
                fromIndex = photon.isNullOrUndefined(fromIndex) ? 0
                    : (fromIndex < 0 ? Math.max(0, array.length + fromIndex) : fromIndex);

                if (photon.isString(array)) {
                    // Array.prototype.indexOf uses === so only strings should be found.
                    if (!photon.isString(item) || item.length !== 1) {
                        return -1;
                    }
                    return array.indexOf(item, fromIndex);
                }

                for (var i = fromIndex, n = array.length; i < n; i++) {
                    if (i in array && array[i] === item) {
                        return i;
                    }
                }
                return -1;
            },
        removeDuplicates:function (array, returnArray, selector, thisObj) {
            if (photon.isFunction(returnArray)) {
                thisObj = selector;
                selector = returnArray;
                returnArray = null;
            }

            returnArray = returnArray || array;

            var map = {}, insertIndex = 0, readIndex = 0;
            while (readIndex < array.length) {
                var current = array[readIndex++];

                // use selector if supplied
                if (selector) {
                    current = selector.call(thisObj, current);
                }

                // map to key
                var currentType = typeof current;
                var key = currentType === 'object' && current !== null ?
                    'o' + photon.getUID(current) :
                    currentType.charAt(0) + current;

                // lookup and add if not there
                if (!map.hasOwnProperty(key)) {
                    map[key] = true;
                    returnArray[insertIndex++] = current;
                }
            }
            returnArray.length = insertIndex;
        },
        /**
         * Returns the differences between two arrays
         * @param {Array} a
         * @param {Array} b
         * @returns {Array}
         */
        diff:function (a, b, equals) {
            var dataA = createDiffData(a),
                dataB = createDiffData(b);

            lcs(dataA, 0, dataA.length, dataB, 0, dataB.length, equals || function (a, b) {
                return a === b;
            });
            return createDiffs(dataA, dataB);
        },
        toArray:function (arrayLike,fromIndex, length) {
            if (photon.isArray(arrayLike)) {
                return arrayLike;
            }
            var result = [];
            fromIndex = fromIndex || 0;
            if (photon.isUndefined(length)) {
                length = arrayLike.length - fromIndex;
            }
            for (var i = fromIndex; i < length; i++) {
                result[i] = arrayLike[i];
            }
            return result;
        },
        remove:function (array, item) {
            var index = photon.array.indexOf(array, item);
            if (index !== -1) {
                array.splice(index, 1);
                return true;
            }
            return false;
        }
    });