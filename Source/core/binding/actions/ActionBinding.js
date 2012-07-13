photon.defineType(
    /***
     * Creates a new instance of the ActionBinding type.
     *
     * @class Represents an action binding
     *
     * @extends photon.binding.BindingBase
     *
     * @param {HTMLElement|HTMLDocument} target The target element to bind to.
     * @param {photon.binding.actions.ActionBindingExpression} expression
     */
    photon.binding.actions.ActionBinding = function (target, expression) {
        photon.binding.actions.ActionBinding.base(this, target, expression);
    },
    photon.binding.BindingBase,
    /**
     * @lends photon.binding.actions.ActionBinding.prototype
     */
    {
        onTriggered_:function (event) {
            event.data.invoke(event);
        },
        bind:function () {
            if (!this.isInitialized_) {
                photon.events.add(this.getTarget(), this.getExpression().getEvents(), this, this.onTriggered_);
                this.isInitialized_ = true;
            }

            this.setDataContext(photon.binding.DataContext.getForElement(this.getTarget()));
        },
        invoke:function (event) {
            var expression = this.getExpression();
            if (expression.getStopPropagation()) {
                event.stopPropagation();
            }
            if (expression.getPreventDefault()) {
                event.preventDefault();
            }

            photon.binding.evaluateInContext(
                this.dataContext_, expression.getAction(), null, event
            );
        }
    });


