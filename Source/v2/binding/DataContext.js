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

function observer(root) {
    var _observers = null, _pathObservers = null, _rootNode = null;

    function tryObserveExpression(parsedExpression) {
        var paths = parsedExpression.paths;
        if (!parsedExpression.isObservable) { // should return merged paths
            return false;
        }

        var rootNode = _rootNode || (_rootNode = new ObservationNode(root));

        // allocate path observers
        _pathObservers = _pathObservers || {};

        // are we already watching this expression?
        var observer = _pathObservers[parsedExpression.text];
        if (!observer) {
            observer = _pathObservers[parsedExpression.text] = new ExpressionObserver(function () { // TODO, make it context.$eval?
                // TODO: Wire up to node values if possible to prevent multiple reads?
                return parsedExpression(root);
            });

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

    return {
        observe: function (parsedExpression, handler) {
            var observer = _observers && _observers[parsedExpression.text];
            if (!observer) {
                observer = tryObserveExpression(parsedExpression);
                if (!observer) {
                    if (!_observers) {
                        _observers = {};
                    }
                    observer = _observers[parsedExpression.text] = new ExpressionObserver(
                        function () {
                            return parsedExpression(root);
                        }.bind(this));
                }
            }
            observer.addHandler(handler);
        },
        sync: function () {
            if (_rootNode) {
                _rootNode.update();
            }
            Object.getOwnPropertyNames(_observers).forEach(function (name) {
                var observer = _observers[name];
                if (observer) {
                    observer.sync();
                }
            });
        }
    }
}

/**
 * Sometimes it seems to be available in chrome, but not working, so we'll test
 */
var isObserveSupportedNatively = Object.observe && (function () {
    var o = {x: 0}, changed = false;
    Object.observe(o, function () {
        changed = true;
    });
    o.x = 1;
    return changed;
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
    function ObservationNode(value) {
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

            changes.forEach(function (change) {
                var child = children[change.name];
                if (child) {
                    child.setValue(getPropertyValue(change.object, change.name));
                }
            });
        },
        syncObservers: function () {
            var observers = this._observers;
            if (observers) {
                observers.forEach(function (observer) {
                    observer.sync();
                });
            }
        },
        getOrCreateChild: function (name) {
            this._children = this._children || {};

            return this._children[name] || (this._children[name] =
                new ObservationNode(getPropertyValue(this._value, name)));
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
    function ExpressionObserver(evaluator) {
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

