function defineChildDataContext(parent) {
    function DataContext() {
        this.$parent = parent;
        parent.$children.add(this);
    }
    DataContext.prototype = parent;
    return DataContext;
}

var DataContext = photon['DataContext'] = type(
    function DataContext() {
        this.$children = new List();
    })
    .defines(
    {
        $new: function () {
            if (!this.hasOwnProperty('$childScopeType')) {
                this.$childScopeType = defineChildDataContext(this);
            }

            return new this.$childScopeType(this);
        },
        $eval:function(value) {
            if (isString(value)) {
                return photon.parser().parse(value)(this);
            }
            if (isFunction(value)) {
                return value(this);
            }
            throw new Error(); // TODO:
        }
    })
    .build();
