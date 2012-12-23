var attrDirectiveFactory = [function () {
    return {
        link: function (node, context, options) {
            context.$observe(options.expression, function(newValue) {
                node.setAttribute(options.qualifier, newValue)
            });
        }
    }
}];
