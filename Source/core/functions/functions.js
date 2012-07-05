/** @namespace photon.functions */
provide("photon.functions");

photon.functions.makeScoped = function(expression, scopes, args) {
    if (arguments.length < 3) {
        args = scopes;
    }

    return new Function(args, photon.expression.makeScoped(expression, scopes));
};