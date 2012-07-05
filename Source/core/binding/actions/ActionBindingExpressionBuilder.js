photon.defineType(
    photon.binding.actions.ActionBindingExpressionBuilder = function (targetType, target, text) {
        photon.binding.actions.ActionBindingExpressionBuilder.base(this, targetType, target, text);
    },
    photon.binding.BindingExpressionBuilder,
    /**
     * @lends photon.binding.actions.ActionBindingExpressionBuilder.prototype
     */
    {
        build:function () {
            var source = this.getSource();
            if (!source) {
                throw new Error("Binding does not contain a valid source expression.");
            }
            var action = this.makeAction(source.text, ["$event"]);
            return new photon.binding.actions.ActionBindingExpression(this.getText(),
                function($context, $event, $data) {
                   action($context || {}, $event, $data);
                }, this.events_, this.stopPropagation_);
        },
        "set-stopPropagation" : function(value) {
            this.stopPropagation_  = photon.object.toBoolean(value);
        },
        "set-events":function (events) {
            this.events_ = events;
        }
    });