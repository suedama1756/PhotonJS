function defaultEqualityComparer(x, y) {
    return x === y;
}

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
                            this.notify({
                                type: "updated",
                                name: "seen",
                                oldValue: oldValue
                            });
                            return true;
                        }
                        return false;
                    }

                    return oldValue;
                },
                {
                    isPropertyAccessor: true
                });
        }
    }).build();


photon.Observable = Observable;