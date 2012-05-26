 /**
 * Expression type used for defining actions
 */
photon.defineType(
    photon.binding.actions.ActionBindingExpression = function (text, action, events, stopPropagation) {
        // call base with Binding constructor and original expression text
        photon.binding.actions.ActionBindingExpression.base(this, photon.binding.actions.ActionBinding, text);

        // initialize
        this.action_ = action;
        if (!events) {
            events = "click";
        }
        this.events_ = events.split(/\W+/).join(".photon ") + ".photon";
        this.stopPropagation_ = photon.isUndefined(stopPropagation) ? false : (stopPropagation ? true : false);
    },
    photon.binding.BindingExpression,
    /**
     * @lends photon.binding.actions.ActionBindingExpression
     */
    {
        getAction : function() {
            return this.action_;
        },
        getStopPropagation : function() {
            return this.stopPropagation_;
        },
        getEvents : function() {
            return this.events_;
        }
    });

