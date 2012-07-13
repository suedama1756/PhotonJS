 /**
 * Expression type used for defining actions
 */
photon.defineType(
    photon.binding.actions.ActionBindingExpression = function (text, action, events, stopPropagation, preventDefault) {
        // call base with Binding constructor and original expression text
        photon.binding.actions.ActionBindingExpression.base(this, photon.binding.actions.ActionBinding, text);

        // initialize
        this.action_ = action;
        if (!events) {
            events = "click";
        }
        this.events_ = events.split(/\W+/).join(".photon ") + ".photon";
        this.stopPropagation_ = photon.isUndefined(stopPropagation) ? false : (stopPropagation ? true : false);
        this.preventDefault_ = photon.isUndefined(preventDefault) ? false : (preventDefault ? true : false);
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
        getPreventDefault : function() {
            return this.preventDefault_;
        },
        getEvents : function() {
            return this.events_;
        }
    });

