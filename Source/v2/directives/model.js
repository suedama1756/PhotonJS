var modelDirectiveFactory = ['$parse', function (parse) {
    return {
        link: function (node, context, options) {
            // TODO: input is not supported in IE8, need to use property change, should not use property change in IE9 as apparently its buggy
            var expr = parse(options.expression), evaluator = expr.evaluator, updateOn = expr.parameters['updateOn'],
                event = updateOn === 'change' ?  'input' : 'change';

            node.on(event, function() {
                evaluator.setter(context, node.value);
                context.$sync();
            });

            context.$observe(options.expression, function(newValue) {
                node.value = isNullOrUndefined(newValue) ? '' : newValue;
            });
        }
    }
}];
