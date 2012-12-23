var decorateDirectiveFactory = ['$parse', function (parse) {
    return {
        render: 'replace',
        compile: function (options) {
            options.decoratorNodes = element('<div><h2 mdx-inner_text="label"></h2><content></content></div>');
            options.decoratorLinker = compile(options.decoratorNodes);
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


//            options.decoratorLinker.link(decoratorNodes, optionsContext, {
//                contentLinker : {
//                    link : function() {
//
//                    },
//                    unlink : function() {
//
//                    }
//                }
//            });
            // using a selector here is a pain, we should be able to pass in a function that can be used to
            // set the correct context,
            //
            // THINK..., what we are really doing is creating a function that is compiled up for
            // the


            var content = decoratorNodes.querySelector('content');
            var node = options.templateNode.cloneNode(true);
            content.parentNode.replaceChild(node, content);
            options.linker.link(node, context);
        }
    }
}];
