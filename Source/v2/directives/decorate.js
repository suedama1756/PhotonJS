var decorateDirectiveFactory = ['$parse', '$container', function (parse, container) {
    return {
        render: 'replace',
        link: function (linkNode, context, options) {
            var optionsContext = context.$new(); // Probably should be detached, and compiled against supported attributes

            context.$observe(options.expression, function (newValue) {
                var expression = parse(options.expression),
                    decoratorNodes = nodes(container.resolve('Template', newValue)),
                    decoratorLinker = compile(container, decoratorNodes, {
                        content: {
                            link: function (node) {
                                // insert node into structure
                                var contentNode = options.templateNode.cloneNode(true);
                                node.replace(contentNode);

                                // link
                                options.linker.link(contentNode, context);
                            }
                        }
                    });

                decoratorNodes = decoratorNodes.clone(true);
                decoratorNodes.insertAfter(linkNode);

                // we supporting constants at the moment :(
                Object.getOwnPropertyNames(expression.parameters).forEach(function (propertyName) {
                    optionsContext[propertyName] = expression.parameters[propertyName];
                });

                decoratorLinker.link(decoratorNodes, optionsContext);
            });
        }
    }
}];
