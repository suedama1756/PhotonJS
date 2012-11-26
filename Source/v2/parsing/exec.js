function execFactory(parser) {
    var cache = {};
    var result = function(expression, target) {
        return (cache[expression] || (cache[expression] = parser.parse(expression)))(target);
    }
    result.clearCache = function() {
        cache = {};
    }
    return result;
}
