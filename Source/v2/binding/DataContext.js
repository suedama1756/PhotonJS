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
        this.$autoObservers = {};
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
                if (!observeObject(this, expression, handler)) {
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

function observeObject(context, expression, handler) {
    if (!Object.observe) {
        return false;
    }

    var evaluator = context.$parse(expression).evaluator;
    var paths = evaluator.paths;
    if (!evaluator.isObservable) { // should return merged paths
        return false;
    }

    var rootNode = context.$observeRoot = (context.$observeRoot || new ObservationNode(context));

    // are we already watching this expression?
    var observer = context.$autoObservers[expression];
    if (observer) {
        observer.on(handler);
        return true;
    }

    // create new watcher for the expression
    observer = context.$autoObservers[expression] = new ExpressionObserver(function() { // TODO, make it context.$eval?
        return evaluator(context);
    });
    observer.on(handler);

    for (var j=0; j<paths.length; j++) {
        var path = paths[j];
        var value = context, parent = rootNode, current;
        for (var i = 0; i < path.length; i++) {
            current = parent.getOrAddChild(path[i]);
            current.on(observer);
            parent = current;
            value = current.value;
        }
    }

    return true;
}

var ObservationNode = type(
    function ObservationNode(value) {
        this._children = null;
        this._handlers = [];
        this._changedHandler = this.changed.bind(this);

        this.setValue(value);
    }).defines(
    /**
     * @lends ObservationNode.prototype
     */
    {
        changed: function (changes) {
            var children = this._children;
            if (!children) {
                return;
            }

            changes.forEach(function (change) {
                var child = children[change.name];
                if (child) {
                    child.setValue(change.object[change.name]);
                    child._handlers.forEach(function (handler) {
                        handler.sync();
                    });
                }
            });
        },
        getOrAddChild: function (name) {
            this._children = this._children || [];

            return this._children[name] || (this._children[name] =
                new ObservationNode(isNullOrUndefined(this._value) ? null : this._value[name]));
        },
        getValue: function () {
            return this._value;
        },
        setValue: function (newValue) {
            var oldValue = this._value;
            if (oldValue !== newValue) {
                var handler = this._changedHandler;

                // detach from old
                if (!isNullOrUndefined(oldValue) && !isPrimitive(oldValue)) {
                    Object.unobserve(oldValue, handler);
                }

                // attach to new
                if (!isNullOrUndefined(newValue) && !isPrimitive(newValue)) {
                    Object.observe(newValue, handler);
                }

                this._value = newValue;
            }
        },
        on: function (handler) {
            this._handlers.push(handler);
        }
    }).build();

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