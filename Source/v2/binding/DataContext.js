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
        this.$observers = {};
    })
    .defines(
    {
        $new: function () {
            if (!this.hasOwnProperty('$childScopeType')) {
                this.$childScopeType = defineChildDataContext(this);
            }

            return new this.$childScopeType(this);
        },
        $eval: function (value) {
            if (isString(value)) {
                return this.$parse(value)(this);
            }
            if (isFunction(value)) {
                return value(this);
            }
            throw new Error(); // TODO:
        },
        $sync: function () {
            Object.getOwnPropertyNames(this.$observers).forEach(function (name) {
                this.$observers[name].sync();
            }.bind(this));
        },
        $observe: function (expression, handler) {
            var observers = this.$observers, observer = observers[expression];
            if (!observer) {
                if (!autoObserve(this, expression, handler)) {
                    expression = this.$parse(expression);
                    var evaluator = expression.evaluator;
                    observer = observers[expression] = new ExpressionObserver(
                        function () {
                            return evaluator(this);
                        }.bind(this));
                }
            }
            if (observer) { // TODO: Added as workaround whilst working on auto observe
            observer.on(handler);
            }
        }
    })
    .build();

function observe(entry) {
    if (!entry.observerFn) {
        entry.observerFn = function(changes) {
            changes.forEach(function(change) {
                var child = entry.children[change.name];
                if (child) {
                    child.watchers.forEach(function(fn) {
                        fn();
                    });
                }
            });
        };
        Object.observe(entry.value, entry.observerFn);
    }
    return entry;
}

function autoObserve(context, expression, handler) {
    var evaluator = context.$parse(expression).evaluator;

    var path = evaluator.path;
    if (!Object.observe || !path || evaluator.context.fn) { // should return merged paths
        return false;
    }

    var data = context._autoObjserveData = context._autoObjserveData || {
        watchers : {},
        root : {
            value : context,
            children : []
        }

    };

    // are we already watching this expression?
    var watcher = data.watchers[expression];
    if (watcher) {
        watcher.handlers.push(handler);
        return;
    }

    // create new watcher for the expression
    var oldValue = evaluator(context);
    watcher = data.watchers[expression] = function () {
        var newValue = evaluator(context);
        if (oldValue !== newValue) {
            watcher.handlers.forEach(function (handler) {
                handler(newValue, oldValue);
            });
        }
    };
    watcher.handlers = [handler];
    handler(oldValue);

    var value = context, parent = data.root;
    for (var i = 0; i < path.length; i++) {
        observe(parent);
        var memberName = path[i];
        var entry = parent.children[memberName] = parent.children[memberName] || {
            value : value[memberName],
            watchers : [],
            children : {}
        };
        entry.watchers.push(watcher);

        parent = entry;

        value = entry.value;

        /* This is the basic structure, needs far more testing */
    }

    return true;
}

var ExpressionObserver = photon.type(
    function (evaluator) {
        this._handlers = new List();
        this._evaluator = evaluator;
        this._value = evaluator();
    })
    .defines({
        sync: function () {
            var oldValue = this._value, newValue = this._value = this._evaluator();
            if (oldValue !== newValue) {
                this._handlers.forEach(function (handler) {
                    handler(newValue, oldValue);
                });
            }
        },
        on: function (handler) {
            this._handlers.add(handler);
            handler(this._value);
        },
        off: function (handler) {
            this._handlers.remove(handler);
        }
    })
    .build();