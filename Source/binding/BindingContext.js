photon.defineType(
    photon.binding.BindingContext = function () {
        this._cache = {};
        this._bindingExpressionCache = {};
    },
    /**
     * @lends photon.binding.BindingContext.prototype
     */
    {
        nextId_:0,

        identity:function (obj) {
            var result = obj["photon.identity"];
            if (!result) {
                result = this.nextId_++;
                obj["photon.identity"] = result;
            }
            this._cache[result] = obj;
            return result;
        },

        parseBindingExpressions:function (bindingType, expression) {
            bindingType = photon.binding.BindingType.getBindingType(bindingType);

            var cacheKey = bindingType + "-" + expression;

            return this._bindingExpressionCache[cacheKey] ||
                (this._bindingExpressionCache[cacheKey] = new photon.binding.ExpressionParser(bindingType, expression).readAllRemaining());
        },

        lookup:function (id) {
            return this._cache[id];
        }
    });

photon.binding.BindingContext.getInstance = function() {
    return photon.binding.BindingContext.instance_ ||
        (photon.binding.BindingContext.instance_ = new photon.binding.BindingContext());
};