var controllerDirectiveFactory = ['$parse', '$container', function (parse, container) {
    return {
        context : {

        },
        link: function (linkNode, context, options) {
            context.$controller = container.resolve('Controller', options.expression, { $context: context });
        }
    }
}];

