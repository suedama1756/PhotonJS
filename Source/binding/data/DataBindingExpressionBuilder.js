(function () {
    var ARG_VALUE = "$value";

    var defaultContext = {
        $imports: {
            photon:photon
        }
    };

    /**
     * Creates a new instance of the photon.binding.data.DataBindingExpressionBuilder type
     * @param {String} type
     * @param {String} subtype
     * @constructor
     * @extends photon.binding.BindingExpressionBuilder
     */
    photon.binding.data.DataBindingExpressionBuilder = function (type, subtype) {
        photon.binding.data.DataBindingExpressionBuilder.base(this, type, subtype);
    };

    photon.defineType(
        /**
         * Constructor
         */
        photon.binding.data.DataBindingExpressionBuilder,
        /**
         * Ancestor
         */
        photon.binding.BindingExpressionBuilder,
        /**
         * @lends photon.binding.data.DataBindingExpressionBuilder.prototype
         */
        {
            /**
             * Builds the binding expression
             */
            build:function () {
                var source = this.getSourceOrThrow();

                if (photon.isUndefined(this.mode_)) {
                    this.mode_ = photon.binding.data.DataBindingMode.Default;
                }
                if (!source.isWritable) {
                    assert(this.mode_ !== photon.binding.data.DataBindingMode.TwoWay,
                        "Binding mode is TwoWay, but the source expression is not writable.");

                    if (this.mode_ === photon.binding.data.DataBindingMode.Default) {
                        this.mode_ = photon.binding.data.DataBindingMode.OneWay;
                    }
                }

                var underlyingGetter = this.makeGetter(source.text),
                    convertFrom = this.convertFrom_;
                var getter = function ($context, $data) {
                    if ($data === undefined) {
                        $data = $context;
                        $context = defaultContext;
                    }
                    var value = underlyingGetter($context, $data);
                    if (convertFrom) {
                        value = convertFrom(value);
                    }
                    return value;
                };

                var setter;
                if (this.isWritableMode_(this.mode_) && source.isWritable) {
                    var underlyingSetter = this.makeSetter(source.text),
                        convertTo = this.convertTo_;
                    setter = function ($context, $data, $value) {
                        if (arguments.length < 3) {
                            $value = $data;
                            $data = $context;
                            $context = defaultContext;
                        }
                        if (convertTo) {
                            $value = convertTo($value);
                        }
                        underlyingSetter($context || defaultContext, $data, $value);
                    };
                }

                return new photon.binding.data.DataBindingExpression(this.getText(), this.getType(), this.getSubType(),
                    getter, setter, this.mode_, this.name_, this.isPrimary_);
            },
            /**
             * Sets the mode of the binding, the mode must be in ["OneTime", "TwoWay", "OneWay"]
             * @param {String} value
             */
            "set-mode":function (value) {
                assert(photon.binding.data.DataBindingMode.hasOwnProperty(value),
                    "Invalid binding mode '{0}'.", value);
                this.mode_ = photon.binding.data.DataBindingMode[value];
            },
            /**
             * Sets the name of the expression
             * @param {String} value
             */
            "set-name":function(value) {
                this.name_ = value;
            },
            /**
             * Sets the convertFrom expression of the binding.
             * @param {String} value
             */
            "set-convertFrom":function (value) {
                this.convertFrom_ = this.getConverter_(value);
            },
            /**
             * Sets the convertTo expression of the binding.
             * @param {String} value
             */
            "set-convertTo":function (value) {
                this.convertTo_ = this.getConverter_(value);
            },
            /**
             * Sets a value indicating whether this binding is the primary binding, useful for deriving primary bindings from templates.
             * @param {Boolean} value
             */
            "set-isPrimary":function (value) {
                this.isPrimary_ = photon.object.toBoolean(value);
            },
            /**
             * Gets a value indicating whether the mode is a writable mode
             * @param {photon.binding.data.DataBindingMode} mode
             * @return {Boolean}
             * @private
             */
            isWritableMode_:function (mode) {
                return mode === photon.binding.data.DataBindingMode.Default ||
                    mode === photon.binding.data.DataBindingMode.TwoWay;
            },
            /**
             * Generates a converter Function from the specified expression.
             * @param {String} expression
             * @private
             */
            getConverter_:function (expression) {
                return new Function(ARG_VALUE, "return " + expression);
            }
        }
    );
})();