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
