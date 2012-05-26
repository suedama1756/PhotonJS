(function() {
    var ARG_DATA = "$data", ARG_CONTEXT = "$context", ARG_VALUE = "$value";

    /**
     * Creates a new instance of the photon.binding.BindingExpressionBuilder type.
     *
     * @param {String} type The type of the expression, e.g. "flow", "property", "attribute", etc.
     * @param {String} subtype The sub type of the expression, e.g. "if", "each", "innerText", etc.
     * @constructor
     */
    photon.binding.BindingExpressionBuilder = function(type, subtype) {
        /**
         * The target type of the binding
         * @type {string}
         * @private
         */
        this.type_ = type;
        /**
         * The target of the binding
         * @type {string}
         * @private
         */
        this.subtype_ = subtype;
    };

    photon.defineType(
        /**
         * Constructor
         */
        photon.binding.BindingExpressionBuilder,
        /**
         * @lends photon.binding.BindingExpressionBuilder.prototype
         */
        {
            getSourceOrThrow : function() {
                var source = this.getSource();
                if (!source) {
                    throw new Error("Binding does not contain a valid source expression.");
                }
                return source;
            },
            setSource :function(value) {
                this.source_ = value;
            },
            getSource:function() {
                return this.source_;
            },
            /**
             * Gets the type of the binding expression, for example: property, attribute, style, etc.
             * @return {string}
             */
            getType : function() {
                return this.type_;
            },
            /**
             * Gets the target of the binding expression, for example: innerText, src, width, etc.
             * @return {*}
             */
            getSubType : function() {
                return this.subtype_;
            },
            /**
             * Gets the full text of the binding expression
             * @return {String}
             */
            getText : function() {
                return this.text_;
            },
            /**
             * Sets the full text of the binding expression
             * @param {String} value
             */
            setText : function(value) {
                this.text_ = photon.string.trim(value);
            } ,
            /**
             * Generates a getter Function from the specified expression
             * @param {String} expression
             * @protected
             */
            makeGetter:function (expression) {
                return photon.functions.makeScoped(
                    photon.string.format("return ($imports.photon.observable.model.isPropertyAccessor({0})) ? {0}() : {0};", expression),
                    [ARG_CONTEXT, ARG_DATA]);
            },
            /**
             * Generates a setter Function from the specified expression
             * @param {String} expression
             * @protected
             */
            makeSetter:function (expression) {
                return photon.functions.makeScoped(
                    photon.string.format("if ($imports.photon.observable.model.isPropertyAccessor({0})) {0}({1}); else {0} = {1};", expression, ARG_VALUE),
                    [ARG_CONTEXT, ARG_DATA],
                    [ARG_CONTEXT, ARG_DATA, ARG_VALUE]);
            },
            /**
             * Generates a setter Function from the specified expression
             * @param {String} expression
             * @param {String[]} args Additional arguments for the action
             * @private
             */
            makeAction:function (expression, args) {
                var ARG_CONTEXT = "$context", ARG_DATA = "$data", ARG_EVENT = "$event";
                return photon.functions.makeScoped(expression, [ARG_CONTEXT, ARG_DATA], [ARG_CONTEXT, ARG_DATA].concat(args || []));
            }
        }
    );
})();

