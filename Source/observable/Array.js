photon.defineType(
    /**
     * @param {Array} array
     */
    photon.observable.Array = function (array) {
        this.array_ = array || [];
    },
    /**
     * @lends photon.observable.Array.prototype
     */
    {
        isObservable:true,
        /**
         * Pushes items into the array.
         * @return {Object}
         */
        push:function () {
            var newLength = arrayNativePrototype.push.apply(this.array_, arguments);
            this.notifyChanged(true);
            return newLength;
        },
        /**
         * Removes the last item from the array
         * @return {object} the removed item
         */
        pop:function () {
            if (this.array_.length > 0) {
                var removedItem = this.array_.pop();
                this.notifyChanged(true);
                return removedItem;
            }

            return undefined;
        },
        /**
         * Removes the first item of the array.
         * @return {object} the item that was removed.
         */
        shift:function () {
            if (this.array_.length > 0) {
                var removedItem = this.array_.shift();
                this.notifyChanged(true);
                return removedItem;
            }

            return undefined;
        },
        /**
         * Adds  new items to the beginning of the array.
         * @return {Object} Returns the new length, or in IE8 and below returns undefined.
         */
        unshift:function () {
            var newLength = arrayNativePrototype.unshift.apply(this.array_, arguments);
            this.notifyChanged(true);
            return newLength;
        },
        /**
         * Reverses the array
         * @return {Array} returns this instance, sorted.
         */
        reverse:function () {
            this.array_.reverse();
            this.notifyChanged(false);
            return this;
        },
        /**
         * Sorts the array
         * @param {function} compareFn, the optional comparer function.
         * @return {Array} return this instance, sorted
         */
        sort:function (compareFn) {
            this.array_.sort(compareFn);
            this.notifyChanged(false);
            return this;
        },
        /**
         * Slices the array between the specified indexes.
         * @param start
         * @param end
         * @return {photon.observable.Array} the sliced array.
         */
        slice:function (start, end) {
            return new photon.observable.Array(this.array_.slice(start, end));
        },
        /**
         * Splices the array between the specified indices.
         * @param number
         * @param deleteCount
         * @return {Array} the items that were removed.
         */
        splice:function (number, deleteCount, items /* ... */) {
            var array = this.array_,
                oldLength = array.length;
            var removedItems = arrayNativePrototype.splice.apply(array, arguments);
            this.notifyChanged(array.length !== oldLength);
            return removedItems;
        },
        set:function (value) {
            if (this === value) {
                return;
            }

            if (value) {
                var unwrappedValue = photon.observable.unwrap(value);

                // is the value changing?
                if (this.array_ !== unwrappedValue) {
                    var oldLength = this.length();

                    if (!photon.isArray(unwrappedValue) || value !== unwrappedValue) {
                        var array = [];
                        for (var i = 0, n = unwrappedValue.length; i < n; i++) {
                            array[i] = unwrappedValue[i];
                        }
                        unwrappedValue = array;
                    }

                    this.array_ = unwrappedValue;

                    var lengthChanged = oldLength !== this.length();
                    if (lengthChanged || oldLength > 0) {
                        this.notifyChanged(lengthChanged);
                    }
                }
            }
            else if (this.length() > 0) {
                this.set([]);
            }

        },
        /**
         * Removes the specified item from the array
         * @param item
         * @return {Boolean} true if the item was removed.
         */
        remove:function (item) {
            var result = photon.array.remove(this.array_, item);
            if (result) {
                this.notifyChanged(true);
            }

            return result;
        },
        /**
         * Concatenates the array with the items passed in.
         * @param items
         * @return {photon.observable.Array}
         */
        concat:function () {
            return new photon.observable.Array(arrayNativePrototype.concat.apply(this.array_, arguments));
        },
        join:function (separator) {
            return new photon.observable.Array(this.array_.join(separator));
        },
        valueOf:function () {
            return this.array_.valueOf();
        },
        toString:function () {
            return this.array_.toString();
        },
        getItem:function (index) {
            return this.array_[index];
        },
        setItem:function (index, value) {
            var oldLength = this.array_.length;
            this.array_[index] = value;
            this.notifyChanged(oldLength !== this.array_.length);
        },
        /**
         *
         * @param {function} callback
         * @param {object} [callbackTarget]
         * @param {string} [propertyName]
         * @param {*} [data]
         */
        subscribe:function (callback, callbackTarget, data) {
            this.subscribers_ = this.subscribers_ || [];
            var result = new photon.observable.Subscriber(this, callback, callbackTarget, null, data);
            this.subscribers_.push(result);
            return result;
        },
        unsubscribe:function (subscriber) {
            return photon.array.remove(this.subscribers_, subscriber);
        },
        notifyChanged:function (lengthChanged) {
            var subscribers = this.subscribers_;
            if (subscribers) {
                subscribers = subscribers.slice(0);
                photon.array.forEach(subscribers, function (item) {
                    if (!item.propertyName() || (lengthChanged && item.propertyName() === 'length')) {
                        item.notify({ data:{}}); // TODO: Why are we passing data here?
                    }
                });
            }
        },
        length:function () {
            photon.observable.DependencyTracker.registerDependency(this, "length");
            return this.array_.length;
        },
        indexOf:function (item, fromIndex) {
            return photon.array.indexOf(this.array_, item, fromIndex);
        },
        findIndex:function (predicate, obj) {
            return photon.array.findIndex(this.array_, predicate, obj);
        },
        unwrap:function () {
            return this.array_;
        }
    });
