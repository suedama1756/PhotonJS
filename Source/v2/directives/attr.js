var attrDirectiveFactory = ['$parse', function (parse) {
    return {
        link: function (node, dataContext, options) {
            var evaluator = parse(options.expression).evaluator;
            photon.bind(node,
                new ExpressionProperty(dataContext, evaluator),
                new AttributeProperty(node, options.qualifier));

        }
    }
}];
