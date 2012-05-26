/** @namespace photon.errors */
provide("photon.errors", {
    notImplemented:function() {
        return new Error("Not implemented");
    }
});

var assert = function(value, message /* ,args... */) {
    if (!value) {
        throw new Error(message ?
            photon.string.format.apply(null, [message].concat(arrayNativePrototype.slice.call(arguments, 2))) :
            "Value required.");
    }
    return value;
};

photon.assert = assert;