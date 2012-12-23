function defineChildDataContext(parent) {
    function DataContext(parent) {
        // invoke parent constructor
        parent.constructor.call(this, parent.$parse);

        // update parent/child linkage
        this.$parent = parent;
        parent.$children.add(this);
    }
    DataContext.prototype = parent;
    return DataContext;
}

var DataContext = photon['DataContext'] = type(
    function DataContext(parse) {
        this.$children = new List();
        this.$parse = parse;
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
                return this.$parse(value)(this);
            }
            if (isFunction(value)) {
                return value(this);
            }
            throw new Error(); // TODO:
        },
        $sync : function() {
            Object.getOwnPropertyNames(this.$observers).forEach(function(name) {
               this.$observers[name].sync();
            }.bind(this));
        },
        $observe : function(expression, handler) {
            var observers = this.$observers || (this.$observers = {}), observer = observers[expression];
            if (!observer) {
                var evaluator = this.$parse(expression).evaluator;
                observer = observers[expression] = new ExpressionObserver(
                    function() {
                        return evaluator(this);
                    }.bind(this));
            }
            observer.on(handler);
        }
    })
    .build();

var ExpressionObserver = photon.type(
    function(evaluator) {
        this._handlers = new List();
        this._evaluator = evaluator;
        this._value = evaluator();
    })
    .defines({
        sync : function() {
            var oldValue = this._value, newValue = this._evaluator();
            if (oldValue !== newValue) {
                this._handlers.forEach(function(handler) {
                    handler(newValue, oldValue);
                });
            }
        },
        on : function(handler) {
            this._handlers.add(handler);
            handler(this._value);
        },
        off : function(handler) {
            this._handlers.remove(handler);
        }
    })
    .build();