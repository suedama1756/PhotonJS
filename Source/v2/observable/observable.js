function defaultEqualityComparer(x, y) {
    return x === y;
}

var accessorCounter = 0;

var Observable = type(
    function Observable() {
        this._observers = [];
        this._observableProperties = {};
    }).defines({
        notify: function (changes) {
            this._observers.forEach(function (observer) {
                observer(changes);
            });
        },
        observe: function (callback) {
            this._observers.push(callback);
        },
        unobserve: function (callback) {
            var index = this._observers.indexOf(callback);
            if (index !== -1) {
                this._observers.splice(index, 1);
            }
        }
    }).definesStatic({
        property: function (name, equalityComparer) {
            equalityComparer = equalityComparer || defaultEqualityComparer;
            return extend(function (newValue) {
                    var oldValue = this._observableProperties[name];
                    if (arguments.length) {
                        if (!equalityComparer(oldValue, newValue)) {
                            this._observableProperties[name] = newValue;
                            this.notify([{
                                object:this,
                                type: "updated",
                                name: name,
                                oldValue: oldValue
                            }]);
                            return true;
                        }
                        return false;
                    }
                    console.log('changed ' + name + (accessorCounter++));
                    return oldValue;
                },
                {
                    isPropertyAccessor: true
                });
        }
    }).build();


photon.Observable = Observable;