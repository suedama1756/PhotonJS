photon.defineType(
    photon.binding.DataContext = function () {
        this.value_ = undefined;
    },
    /**
     * @lends photon.binding.DataContext.prototype
     */
    {
        dispose:function () {
            this.removeFromParent_();
            delete this.parent_
        },
        removeFromParent_:function () {
            var parent = this.parent_;
            if (parent) {
                photon.array.remove(parent.children_, this);
                if (parent.children_.length === 0) {
                    delete parent.children_;
                }
            }
        },
        setParent:function (value) {
            if (!photon.isNullOrUndefined(value) && !value instanceof photon.binding.DataContext) {
                throw new Error("Value must be of type DataContext.");
            }

            var parent = this.parent_;
            if (parent !== value) {
                this.removeFromParent_();
                if (value) {
                    this.parent_ = value;
                    if (value.children_) {
                        value.children_.push(this);
                    }
                    else {
                        value.children_ = [this];
                    }
                }
                else {
                    delete this.parent_;
                }

                this.parentChanged();
            }
        },
        getParent:function () {
            return this.parent_;
        },
        getChild:function (index) {
            return this.children_ ? this.children_[index] : null;
        },
        getValue:function () {
            return this.value_;
        },
        setName:function(value) {
            this.name_ = value;
        },
        getName:function() {
            return this.name_;
        },
        setValue:function (value) {
            if (this.value_ !== value) {
                this.value_ = value;
                var subscribers = this.subscribers_;
                if (subscribers) {
                    subscribers = subscribers.slice(0);
                    photon.array.forEach(subscribers, this.notifyValueChanged, this);
                }
            }
        },
        /**
         * Adds a subscriber to the data context
         *
         * Subscribers must implement the following functions
         *
         * dataContextValueChanged : function(dataContext, value) {
         * }
         *
         * @param {object} subscriber
         * @param {function} subscriber.dataContextValueChanged
         */
        addSubscriber:function (subscriber) {
            if (this.subscribers_) {
                this.subscribers_.push(subscriber);
            }
            else {
                this.subscribers_ = [subscriber];
            }
        },
        /**
         * Removes a subscriber from the data context
         *
         * @param {Object} subscriber
         * @returns {Boolean} true if the subscriber was removed; otherwise, false.
         */
        removeSubscriber:function (subscriber) {
            var result = false;
            if (this.subscribers_) {
                result = photon.array.remove(this.subscribers_, subscriber);
                if (this.subscribers_.length === 0) {
                    delete this.subscribers_;
                }
            }

            return result;
        },
        notifyValueChanged:function (subscriber) {
            subscriber.dataContextValueChanged(this, this.value_);
        },
        getChildCount:function () {
            return this.children_ ? this.children_.length : 0;
        },
        parentChanged:function () {
        },
        get:function (indexOrName) {
            if (arguments.length === 0) {
                return this;
            }

            // TODO: find efficient way to add parents as dependencies
            var current = this;
            if(photon.isString(indexOrName)) {
                while (current && current.getName() !== indexOrName) {
                    current = current.parent_;
                }
            }
            else {
                var index = 0;
                while (index++ < indexOrName && current) {
                    current = current.parent_;
                }
            }
            return current;
        }
    },
    /**
     * @lends photon.binding.DataContext
     */
    {
        /**
         * @static
         */
        getForElement:function (element) {
            for (var current = element; current; current = current.parentDataContextNode || current.parentNode) {
                var result = this.getLocalForElement(current);
                if (result) {
                    return result;
                }
            }
            return null;
        },
        getLocalForElement : function(element) {
            var nodeBindingInfo = photon.binding.NodeBindingInfo.getForElement(element);
            if (nodeBindingInfo) {
                var dataContext = nodeBindingInfo.getDataContext();
                if (dataContext) {
                    return dataContext;
                }
            }
            return null;
        }
    });
