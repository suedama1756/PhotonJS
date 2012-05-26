/** @namespace photon.expression */
provide("photon.expression");

photon.expression.makeScoped  = function(expression, scopes) {
    var body = expression;
    for (var i = scopes.length -1; i >= 0; i--) {
        body = "with(" + scopes[i] + ") { " + body + " } ";
    }
    return body;
};

