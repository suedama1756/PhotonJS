var propertyDirectiveFactory = ['$parse', function (parse) {
    return {
        link: function (node, context, options) {
            var evaluator = parse(options.expression).evaluator;
            photon.bind(node,
                new ExpressionProperty(context, evaluator),
                new Property(node, options.qualifier));
        }
    }
}];
