/**
 *
 * @param {object} owner
 * @param {function} callback
 * @param {object} [callbackTarget]
 * @param {string} [propertyName]
 * @param {*} [data]
 */
photon.observable.Subscriber = function (owner, callback, callbackTarget, propertyName, data) {
    this.owner_ = owner;
    this.callback_ = callback;

    if (callbackTarget) {
        this.callbackTarget_ = callbackTarget;
    }

    if (propertyName) {
        this.propertyName_ = propertyName;
    }

    if (typeof data !== "undefined") {
        this.data_ = data;
    }
};

photon.extend(photon.observable.Subscriber.prototype, {
    /**
     * Disposes the subscriber
     */
    dispose:function () {
        if (this.owner_) {
            this.owner_.unsubscribe(this);
        }
        this.callback_ = null;
        this.owner_ = null;
    },
    /**
     * Invokes the subscribers callback with the specified event.
     * @param {event} event The event.
     */
    notify:function (event) {
        if (this.callback_) {
            event.data = this.data_;
            if (!this.propertyName_ || event.propertyName === this.propertyName_) {
                this.callback_.call(this.callbackTarget_ || null, event);
            }
        }
    },
    /**
     * Gets a value indicating whether the subscriber is subscribed to the specified owner and property
     * @param {object} owner The owner
     * @param {string} propertyName The property name.
     * @returns {boolean}
     */
    isSubscribedTo : function(owner, propertyName) {
        return this.owner_ === owner && this.propertyName_ === propertyName;
    },
    /**
     * Gets the subscriber's owner
     * @returns {object}
     */
    getOwner:function() {
        return this.owner_;
    },
    /**
     * Gets the subscriber's callback target
     * @returns {string}
     */
    propertyName:function ()
    {
        return this.propertyName_;
    },
    /**
     * Gets the subscriber's callback target
     * @returns {object}
     */
    callbackTarget:function()
    {
        return this.callbackTarget_;
    },
    /**
     * Gets the subscriber's callback function
     * @returns {function(event)}
     */
    callback:function() {
        return this.callback_;
    },
    /**
     * Gets the subscriber's owner
     * @returns {object}
     */
    data:function() {
        return this.data_;
    }
});
