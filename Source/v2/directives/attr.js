var attrDirectiveFactory = [function () {
    return {
        link: function (node, context, options) {
            context.$observe(options.expression, function(newValue) {
                node.attr(options.qualifier, newValue)
            });
        }
    }
}];
