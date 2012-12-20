var onDirectiveFactory = ['$parse', function (parse) {
    return {
        link: function (node, context, options) {
            var evaluator = parse(options.expression).evaluator;
            node.addEventListener(options.qualifier, function () {
                evaluator(context);
            });
        }
    }
}];

