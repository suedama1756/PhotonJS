/**
 * @const
 * @type {number}
 */
var NODE_DOCUMENT = 9;

/**
 * @const
 * @type {number}
 */
var NODE_ELEMENT = 1;

/**
 * @const
 * @type {number}
 */
var NODE_TEXT = 3;

function mapName(name) {
    return nameMap[name] || (nameMap[name] = name);
}

var nameMap = {};

var uiModule = module(function(x) {
    x.directive('mv-each').factory(eachDirectiveFactory);
    x.directive('mv-action').factory(actionDirectiveFactory);
    x.directive('mv-on-').factory(onDirectiveFactory);
    x.directive('mv-model').factory(modelDirectiveFactory);
    x.directive('mv-attr-').factory(attrDirectiveFactory);
    x.directive('mv-').factory(propertyDirectiveFactory);
    x.directive('mv-decorator').factory(decorateDirectiveFactory);
    x.directive('mv-text').factory(textDirectiveFactory);
    x.directive('mv-show').factory(showDirectiveFactory);
    x.directive('mv-name').factory(nameDirectiveFactory);

    x.directive('mv-controller').factory(controllerDirectiveFactory);

    x.factory('$parse', function() {
        var parse = photon.parser().parse;
        return function (text) {
            return parse(text, {isBindingExpression: true});
        };
    });
    x.type('$rootContext', ['$parse', DataContext]);
});



photon.bootstrap = function (element, modules, initialData) {
    var container;

    modules = modules || [];
    modules.unshift(uiModule);
    modules.unshift(module(function(builder) {
        builder.factory('$container', function() {
            return container;
        });
    }));

    container = photon.container(modules);

    var dataContext = container.resolve('$rootContext');
    element.dataContext = dataContext;
    if (initialData) {
        extend(dataContext, initialData);
    }
    var linker = compile(container, element);
    linker.link(element, dataContext);
    return dataContext;
};

photon.bind = function (element, updateSource, updateTarget) {
    element.bindings = element.bindings || [];
    var binding = {
        updateSource : updateSource,
        updateTarget : updateTarget
    };
    element.bindings.push(binding);
    return binding;
};


function compile(container, element, templateLinkers) {
    function getAttributeDirective(type) {
        return container.tryResolve('Directive', type);
    }

    function compileAttributes(node) {
        if (node.tagName === 'CONTENT') {
            return [{
                directive : templateLinkers.content,
                options : {
                }
            }]
        }

        var attributes = node && node.attributes;
        return attributes ? enumerable(attributes).select(
            function (x) {
                var type = x.name,
                    qualifier,
                    directive;

                if (!(directive = getAttributeDirective(type))) {
                    var qualifierIndex = type.lastIndexOf('-') + 1;
                    if (qualifierIndex !== 0 && (directive = getAttributeDirective(type.substring(0, qualifierIndex)))) {
                        qualifier = type.substring(qualifierIndex);
                        type = type.substring(0, qualifierIndex - 1);
                    }
                }
                return directive ? {
                    directive: directive,
                    options: {
                        type: type,
                        qualifier: qualifier,
                        expression: x.value
                    }
                } : null;
            }).where(function (x) {
                return x;
            }).orderBy(function (x) {
                if (x.directive.render === 'replace') {
                    return -1;
                }
                return 0;
            }).toArray() : null;
    }

    function makeLinkerChainFn(parent, child) {
        if (!parent && !child) {
            return null;
        }
        if (!child) {
            return parent;
        }

        return function (node, context) {
            if (parent) {
                parent(node, context);
            }
            child(node.childNodes, context);
        }

    }

    function makeLinkerFn(compileInfos, action) {
        if (compileInfos.length === 1) {
            var compileInfo = compileInfos[0];
            return function (node, context) {
                action(compileInfo.directive, node, context, compileInfo.options);
            }
        }
        return function (node, context) {
            for (var i = 0, n = compileInfos.length; i < n; i++) {
                action(compileInfos[i].directive, node, context, compileInfos[i].options);
            }
        };
    }

    function makeLinkFn(compileInfos) {
        return makeLinkerFn(compileInfos, function (directive, node, context, options) {
            directive.link(nodes(node), context, options);
        });
    }

    function makeUnlinkFn(compileInfos) {
        return makeLinkerFn(compileInfos, function (directive, node, context, options) {
            directive.unlink(nodes(node), context, options);
        });
    }

    function compileNode(node, compileInfos) {
        /**
         *
         * @type {Array}
         */
        var link, unlink, templateLinker, requiresNewContext = false;
        compileInfos = compileInfos || compileAttributes(node);
        if (compileInfos && compileInfos.length) {
            if (compileInfos[0].directive.render === 'replace') {
                compileInfos[0].options.linker = compileNode(node, compileInfos.slice(1));
                compileInfos = compileInfos.slice(0, 1);
            } else {
                templateLinker = null;
            }

            // Can only walk this route with a templateLinker once due to the array reduction.
            compileInfos.forEach(function (compileInfo) {
                if (compileInfo.directive.context) {
                    requiresNewContext = true;
                }

                var directive = compileInfo.directive;
                if (directive.compile) {
                    directive.compile(compileInfo.options);
                }
                if (compileInfo.directive.render === 'replace') {
                    compileInfo.options.templateNode = node;
                    var commentNode = document.createComment(compileInfo.type);
                    node.parentNode.replaceChild(commentNode, node);
                    node = commentNode;
                }
            });

            link = makeLinkFn(compileInfos);
            unlink = makeUnlinkFn(compileInfos);
        }

        if (node.childNodes.length) {
            var childLinker = compileNodes(enumerable(node.childNodes));
            if (childLinker) {
                link = makeLinkerChainFn(link, childLinker.link);
                unlink = makeLinkerChainFn(unlink, childLinker.unlink);
            }
        }

        if (requiresNewContext) {
            var childLink = link;
            // big problem with unlink here as we cannot maintain context :(
            link = function(linkNode, context, options) {
                childLink(linkNode, context.$new(), options);
            }
        }

        return link ? {
            link: link,
            unlink: unlink
        } : null;
    }

    function compileNodes(nodes) {
        nodes = nodes.toArray();

        var nodeLinkers = nodes.map(function (node) {
            return compileNode(node);
        });

        return {
            link: function (nodes, context) {
                enumerable(nodes).toArray().forEach(function(x, i) {
                    var nodeLinker = nodeLinkers[i];
                    if (nodeLinker) {
                        nodeLinker.link(x, context);
                    }
                });
            },
            unlink: function (nodes, context) {
                enumerable(nodes).toArray().forEach(function(x, i) {
                    var nodeLinker = nodeLinkers[i];
                    if (nodeLinker) {
                        nodeLinker.unlink(nodes[i], context);
                    }
                });
            }
        };
    }

    if (element.getEnumerator) {
        return compileNodes(element);
    }
    if (isArrayLike(element)) {
        return compileNodes(enumerable(element));
    }
    return compileNode(element);
}

/*
 So what have we learned:

 2. We have a binding concept which binds source properties to target properties.

 3. We need to consider cleanup

 4. We need to consider watches

 5. We need to consider complex templates

 6. We need to consider element based directives

 7. Would like to flesh out the parameter parsing options for attribute directives, e.g. specify what is valid,
    parser, coercer rules.

 8. Need to support <control.property> syntax for complex properties, e.g. templates

 9. Need to optimize constant expressions

 10.  Need to ensure that if we provide a callback function to a binding, we do not lose its context, e.g. commands.

 */

