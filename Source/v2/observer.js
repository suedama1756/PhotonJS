function objectObserver(root) {
    var _observers = null;

    return {
        observe: function (expression, handler) {
            var observer = _observers && _observers[expression.text];
            if (!observer) {
                if (!_observers) {
                    _observers = {};
                }
                observer = _observers[expression.text] = new Observer(result, expression);

            }
            observer.addHandler(handler);
        },
        root : function() {
            return root;
        }
    }
}

var Observer = photon.type(
    function Observer(observer, expression) {
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

// try to get property from local, if not available then step up parents until we get it, once we have it subscribe
// to parent syncs for that property only.


/*
    The good,
 */




// TODO: Can probably get away with not storing the observer in Observer, e.g. supply the sync root when calling sync.