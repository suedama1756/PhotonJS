/**
 * Creates a new instance of the photon.binding.BindingExpression type
 *
 * @param {Function} createBinding Function for creating a binding from the expression.
 * @param {String} text The text of the expression.
 * @constructor
 */
photon.binding.BindingExpression = function (createBinding, text) {
    this.createBinding_ = createBinding;
    this.text_ = text;
};

photon.defineType(
    /**
     * Constructor
     */
    photon.binding.BindingExpression,
    /**
     * @lends photon.binding.BindingExpression.prototype
     */
    {
        /**
         * Gets the text of the expression
         *
         * @return {String}
         */
        getText:function () {
            return this.text_;
        },
        /**
         * Creates a new binding instance for the expression
         *
         * @param {HTMLElement} element
         * @return {photon.binding.BindingBase}
         */
        createBinding:function (element) {
            return new this.createBinding_(element, this);
        }
    }
);

