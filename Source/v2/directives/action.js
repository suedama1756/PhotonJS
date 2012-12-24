var actionDirectiveFactory = ['$parse', function (parse) {
    return {
        link: function (node, context, options) {
            var expr = parse(options.expression), evaluate = expr.evaluator, on = expr.parameters['on'];
            if (on) {
                on.split(' ').forEach(function (x) {
                    node.on(x, function () {
                        evaluate(context);
                    });
                });
            }
        }
    }
}];