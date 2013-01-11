var nameDirectiveFactory = ['$parse', function (parse) {
    return {
        link: function (node, context, options) {
            var name = options.expression;

            if (context.$controller) {
                context.$controller[name] = node;
            }
        }
    }
}];
