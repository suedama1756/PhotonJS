var ExpressionProperty = photon.type(
    function ExpressionProperty(target, evaluator) {
        this.target_ = target;
        this.getter_ = evaluator;
        this.setter_ = evaluator.setter;
    })
    .defines({
        setValue: function (value) {
            var setter = this.setter_;
            if (setter) {
                setter(this.target_, value);
            }
        },
        getValue: function () {
            return this.getter_(this.target_);
        }
    })
    .build();
