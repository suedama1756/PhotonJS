var textDirectiveFactory = function () {
    return {
        link: function (linkNode, context, options) {
            context.$observe(options.expression, function (newValue) {
                linkNode.text(newValue);
            });
        }
    }
};
