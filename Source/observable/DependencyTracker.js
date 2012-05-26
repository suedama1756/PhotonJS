(function () {
    var captures = [];
    var currentCapture = null;

    function indexOfSubscriber(subscribers, target, propertyName) {
        if (subscribers) {
            for (var i = 0, n = subscribers.length; i < n; i++) {
                if (subscribers[i] && subscribers[i].isSubscribedTo(target, propertyName)) {
                    return i;
                }
            }
        }
        return -1;
    }

    photon.defineType(
        photon.observable.DependencyTracker = function (callback, callbackTarget) {
            this.callbackTarget_ = callbackTarget;
            this.callback_ = callback;
            this.subscribers_ = null;
        },
        /**
         * @lends photon.observable.DependencyTracker
         */
        {
            dispose:function () {
                this.resetSubscribers(null);
                this.callback_ = this.callbackTarget_ = null;
            },

            resetSubscribers:function (subscribers) {
                if (this.subscribers_) {
                    for (var i = 0, n = this.subscribers_.length; i < n; i++) {
                        if (this.subscribers_[i] !== null) {
                            this.subscribers_[i].dispose();
                        }
                    }
                }
                this.subscribers_ = subscribers;
            },

            beginCapture:function () {
//                if (currentCapture !== null) {
//                    throw new Error("Nested capture scopes are not supported.");
//                }
                captures.push(currentCapture);
                currentCapture = {
                    tracker:this,
                    subscribers:[]
                };
            },

            endCapture:function () {
                if (!(currentCapture && currentCapture.tracker === this)) {
                    throw new Error("Tracker does not have capture.");
                }
                this.resetSubscribers(currentCapture.subscribers);
                currentCapture = captures.pop();
            }
        },
        {
            registerDependency:function (source, propertyName) {
                if (currentCapture !== null) {
                    // has the dependency already been registered within the current capture?
                    if (indexOfSubscriber(currentCapture.subscribers, source, propertyName) !== -1) {
                        return;
                    }

                    // get tracker
                    var tracker = currentCapture.tracker;

                    // was the dependency registered in the previous capture?
                    var i = indexOfSubscriber(tracker.subscribers_, source, propertyName);
                    if (i !== -1) {
                        // re-use the subscription
                        currentCapture.subscribers.push(tracker.subscribers_[i]);
                        tracker.subscribers_[i] = null;
                    }
                    else {
                        // create a new subscription
                        currentCapture.subscribers.push(source.subscribe(currentCapture.tracker.callback_,
                            currentCapture.tracker.callbackTarget_, propertyName));
                    }
                }
            }
        });
})();