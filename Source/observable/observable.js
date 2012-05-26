/** @namespace photon.observable **/
provide("photon.observable");

photon.observable.unwrap = function(value) {
    if (photon.isNullOrUndefined(value)) {
        return value;
    }

    if (value.isObservable === true && value.unwrap) {
        return value.unwrap(value);
    }

    return value;
};
