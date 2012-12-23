var decorateDirectiveFactory = ['$parse', '$container', function (parse, container) {
    return {
        render: 'replace',
        compile: function (options) {
            options.decoratorNodes = element(container.resolve('Template', parse(options.expression).evaluator(null)));
            options.decoratorLinker = compile(container, options.decoratorNodes);
        },
        link: function (linkNode, context, options) {
            var parentNode = linkNode.parentNode, relNode = linkNode.nextSibling,
                decoratorNodes = options.decoratorNodes.cloneNode(true);

            parentNode.insertBefore(decoratorNodes, relNode);

            var optionsContext = context.$new();
            var exp = parse(options.expression);

            // only supporting constants at the moment
            Object.getOwnPropertyNames(exp.parameters).forEach(function(propertyName) {
                optionsContext[propertyName] = exp.parameters[propertyName];
            });


            options.decoratorLinker.link(decoratorNodes, optionsContext);
            var content = decoratorNodes.querySelector('content');
            var node = options.templateNode.cloneNode(true);
            content.parentNode.replaceChild(node, content);
            options.linker.link(node, context);
        }
    }
}];
