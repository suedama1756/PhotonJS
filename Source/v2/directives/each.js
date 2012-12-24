var eachDirectiveFactory = ['$parse', function (parse) {
    return {
        render: 'replace',
        compile: function (options) {
            var expression = options.expression,
                itemInTokens = photon.tokenize(expression, true)
                    .take(2).toArray();

            options.itemName = 'item';

            // extract the "<var> in" from expression
            if (itemInTokens.length === 2 && itemInTokens[0].type === photon.tokenize.TOKEN_IDENTIFIER && itemInTokens[1].text === 'in') {
                options.expression = expression.substring(itemInTokens[1].index + 2);
                options.itemName = itemInTokens[0].text || 'item';

            }
        },
        link: function (linkNode, context, options) {
            var templateNode = nodes(options.templateNode),
                linker = options.linker,
                evaluator = parse(options.expression).evaluator;

            linkNode = linkNode.nextSibling();

            var items = evaluator(context);
            if (items) {
                enumerable(items).forEach(
                    function (item) {
                        var itemNode = templateNode.clone(true),
                            childContext = context.$new();
                        itemNode.insertAfter(linkNode);
                        childContext[options.itemName] = item;
                        linker.link(itemNode.first(), childContext);
                        linkNode = linkNode.nextSibling();
                    }
                );
            }

        }
    }
}];