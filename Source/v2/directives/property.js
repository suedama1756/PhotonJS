var propertyDirectiveFactory = [function () {
    return {
        compile : function(options) {
            options.propertyName = mapName(options.qualifier.split('_').map(function (x, i) {
                return i ? x.charAt(0).toUpperCase() + x.substring(1) : x;
            }).join(''));
        },
        link: function (node, context, options) {
            context.$observe(options.expression, function(newValue) {
                node[options.propertyName] = newValue;
            });
        }
    }
}];
