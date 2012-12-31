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
        this.$observer = observer(this);
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
            this.$observer.sync();
        },
        $observe: function (expression, handler) {
            this.$observer.observe(this.$parse(expression).evaluator, handler);
        }
    })
    .build();

var ObserverScope = type(function Scope() {
    this._count = 0;
    this._observers = null;
}).defines({
        begin: function () {
            this._count++;
        },
        end: function () {
            if ((--this._count) === 0) {
                var observers = this._observers;
                this._observers = null;
                if (observers) {
                    observers.forEach(function (observer) {
                        observer.sync();
                    });
                }
            }
        },
        addObserver: function (observer) {
            if (this._count === 0) {
                observer.sync();
            } else if (!this._observers) {
                this._observers = [observer];
            } else if (this._observers.indexOf(observer) === -1) {
                this._observers.push(observer);
            }
        }
    }).build();

function observer(root) {
    var _observers = null, _pathObservers = null, _rootNode = null, _scope = new ObserverScope();

    function tryObserveExpression(parsedExpression) {
        var paths = parsedExpression.paths;
        if (!parsedExpression.isObservable) { // should return merged paths
            return false;
        }

        var rootNode = _rootNode || (_rootNode = new ObservationNode(_scope, root));

        // allocate path observers
        _pathObservers = _pathObservers || {};

        // are we already watching this expression?
        var observer = _pathObservers[parsedExpression.text];
        if (!observer) {
            observer = _pathObservers[parsedExpression.text] = new ExpressionObserver(result, parsedExpression);
            for (var j = 0; j < paths.length; j++) {
                var path = paths[j], parent = rootNode, current;
                for (var i = 0; i < path.length; i++) {
                    current = parent.getOrCreateChild(path[i]);
                    parent = current;
                }
                current.addObserver(observer);
            }
        }

        return observer;
    }

    var result = {
        observe: function (parsedExpression, handler) {
            var observer = _observers && _observers[parsedExpression.text];
            if (!observer) {
                observer = tryObserveExpression(parsedExpression);
                if (!observer) {
                    if (!_observers) {
                        _observers = {};
                    }
                    observer = _observers[parsedExpression.text] = new ExpressionObserver(result, parsedExpression);
                }
            }
            observer.addHandler(handler);
        },
        root: function () {
            return root;
        },
        sync: function () {
            _scope.begin();
            try {
                if (_rootNode) {
                    _rootNode.update();
                }

                if (_observers) {
                    Object.getOwnPropertyNames(_observers).forEach(function (name) {
                        _scope.addObserver(_observers[name]);
                    });
                }
            }
            finally {
                _scope.end();
            }
        }
    };
    return result;
}

/**
 * Sometimes it seems to be available in chrome but not working, so we'll test
 */
var isObserveSupportedNatively = false;
Object.observe && (function () {
    var o = {x: 0};
    Object.observe(o, function () {
        isObserveSupportedNatively = true;
    });
    o.x = 1;
})();

function observe(obj, callback) {
    if (isFunction(obj.observe)) {
        obj.observe(callback);
        return true;
    }
    if (isObserveSupportedNatively) {
        Object.observe(obj, callback);
        return true;
    }
    return false;
}

function unobserve(obj, callback) {
    if (isFunction(obj.unobserve)) {
        obj.unobserve(callback);
    } else if (isObserveSupportedNatively) {
        Object.unobserve(obj, callback);
    }
}

function isPropertyAccessor(value) {
    return isFunction(value) && value.isPropertyAccessor;
}

function getPropertyValue(obj, propertyName) {
    var value;
    if (!isNullOrUndefined(obj)) {
        value = obj[propertyName];
        value = isPropertyAccessor(value) ? value.call(obj) : value;
    }
    return value;
}


var ObservationNode = type(
    function ObservationNode(scope, value) {
        this._scope = scope;
        this._children = null;
        this._observers = null;
        this._changedHandler = this.changed.bind(this);
        this._isObserving = false;
        this.setValue(value);
    }).defines(
    /**
     * @lends ObservationNode.prototype
     */
    {
        update: function (valueChanged) {
            if (valueChanged) {
                this.syncObservers();
            }

            var children = this._children, isObserving = this._isObserving, value = this._value;
            if (!children) {
                return;
            }

            Object.getOwnPropertyNames(children).forEach(function (propertyName) {
                var child = children[propertyName];
                if (valueChanged || !isObserving) {
                    if (!child.setValue(getPropertyValue(value, propertyName))) {
                        child.update();
                    }
                } else {
                    child.update();
                }
            });
        },
        changed: function (changes) {
            var children = this._children;
            if (!children) {
                return;
            }

            this._scope.begin();
            try {
                changes.forEach(function (change) {
                    var child = children[change.name];
                    if (child) {
                        child.setValue(getPropertyValue(change.object, change.name));
                    }
                });
            }
            finally {
                this._scope.end();
            }
        },
        syncObservers: function () {
            var observers = this._observers;
            if (observers) {
                var scope = this._scope;
                observers.forEach(function (observer) {
                    scope.addObserver(observer);
                });
            }
        },
        getOrCreateChild: function (name) {
            this._children = this._children || {};

            return this._children[name] || (this._children[name] =
                new ObservationNode(this._scope, getPropertyValue(this._value, name)));
        },
        getValue: function () {
            return this._value;
        },
        setValue: function (newValue) {
            var oldValue = this._value;
            if (oldValue !== newValue) {
                var handler = this._changedHandler;

                if (!isNullOrUndefined(oldValue) && !isPrimitive(oldValue)) {
                    unobserve(oldValue, handler);
                }

                this._value = newValue;

                if (!isNullOrUndefined(newValue) && !isPrimitive(newValue)) {
                    this._isObserving = observe(newValue, handler);
                } else {
                    // it's not really observing, as if we are null or primitive then the value is constant
                    this._isObserving = false;
                }

                this.update(true);

                return true;
            }
            return false;
        },
        addObserver: function (observer) {
            var observers = this._observers || (this._observers = []);
            observers.push(observer);
        }
    }).build();

var ExpressionObserver = photon.type(
    function ExpressionObserver(observer, expression) {
        this._observer = observer;
        this._handlers = new List();
        this._expression = expression;
        this._value = expression(observer.root());
    })
    .defines({
        sync: function () {
            var oldValue = this._value, newValue = this._value = this._expression(this._observer.root());
            if (oldValue !== newValue) {
                this._handlers.forEach(function (handler) {
                    handler(newValue, oldValue);
                });
            }
        },
        addHandler: function (handler) {
            this._handlers.add(handler);
            handler(this._value);
        },
        removeHandler: function (handler) {
            this._handlers.remove(handler);
        }
    })
    .build();

// it may get tempting to get an observer to read its value from ObservationNodes. The problem with this is that
// we need to ensure the whole tree of observations is up to date before we trigger the notification.
//
// We also need to be aware that we cannot track the value if the expression has some king of adapter, e.g.
// -,method(path, etc.)
//
// Optimizations,
//   Create a shadow object, which can be used to perform fast atomic reads of the expressions
//   We still want to avoid to many evaluations don't we?
//      So we need to pass in scope manager.


photon.observer = observer;