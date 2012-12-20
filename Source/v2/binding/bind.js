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

var AttributeProperty = photon.type(
    function AttributeProperty(element, name) {
        this.element_ = element;
        this.name_ = mapName(name);
    })
    .defines(
    {
        setValue: function (value) {
            this.element_.setAttribute(this.name_, value);
        }
    })
    .build();

var Property = photon.type(
    function Property(target, name) {
        this.target_ = target;
        name = name.split('_').map(function (x, i) {
            return i ? x.charAt(0).toUpperCase() + x.substring(1) : x;
        }).join('');
        this.name_ = mapName(name);
    })
    .defines({
        setValue: function (value) {
            this.target_[this.name_] = value;
        },
        getValue: function () {
            return this.target_[this.name_];
        }
    })
    .build();

var ExpressionProperty = photon.type(
    function ExpressionProperty(target, evaluator) {
        this.target_ = target;
        this.getter_ = evaluator;
        this.setter_ = evaluator.setter;
    })
    .defines({
        setValue: function (value) {
            var setter = this.setter_;
            if (setter) {
                setter(this.target_, value);
            }
        },
        getValue: function () {
            return this.getter_(this.target_);
        }
    })
    .build();

var ModelProperty = photon.type(
    function ModelProperty(target, name, updateTriggers) {
        Property.call(this, target, name);
        var changed = this.changed_.bind(this);
        updateTriggers.split(' ').forEach(function (x) {
            target.addEventListener(x, changed);
        });

    })
    .inherits(Property)
    .defines({
        changed_: function () {
            if (this.changed) {
                this.changed();
            }
        }
    })
    .build();

function mapName(name) {
    return nameMap[name] || (nameMap[name] = name);
}

var nameMap = {};

var uiModule = module(function(x) {
    x.directive('mdx-each').factory(eachDirectiveFactory);
    x.directive('mdx-action').factory(actionDirectiveFactory);
    x.directive('mdx-on-').factory(onDirectiveFactory);
    x.directive('mdx-model').factory(modelDirectiveFactory);
    x.directive('mdx-attr-').factory(attrDirectiveFactory);
    x.directive('mdx-').factory(propertyDirectiveFactory);
    x.factory('$parse', function() {
        var parse = photon.parser().parse;
        return function (text) {
            return parse(text, {isBindingExpression: true});
        };
    });
});

var uiContainer = container([uiModule]);

function getAttributeDirective(type) {
    return uiContainer.tryResolve('Directive', type);
}

function compileAttributes(node) {
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

    // what we are really doing here is searching ahead for complex attributes, we could
    // inspect their types by querying the directive, e.g. is it a template, etc.
//    if (node.nodeType === NODE_ELEMENT && node.childNodes.length) {
//        enumerable(node.childNodes).where(function(x) {
//            return x.nodeType === NODE_ELEMENT && x.tagName.substring(0, node.tagName.length) === x.tagName + '.';
//
//
//        })
//    }
}


photon.bootstrap = function (element, initialData) {
    var dataContext = new DataContext();
    element.dataContext = dataContext;
    if (initialData) {
        extend(dataContext, initialData);
    }
    var linker = compile(element);
    linker.link(element, dataContext);
    return dataContext;
};


var Binding = type(
    function Binding(source, target) {
        this.source_ = source;
        this.target_ = target;
        this.target_.changed = this.updateSource.bind(this);
        this.updateTarget();
    })
    .defines({
        updateSource: function () {
            this.source_.setValue(this.target_.getValue());
        },
        updateTarget: function () {
            this.target_.setValue(this.source_.getValue());
        }
    })
    .build();

photon.bind = function (element, source, target) {
    element.bindings = element.bindings || [];
    element.bindings.push(new Binding(source, target));
};


function compile(element) {
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
            directive.link(node, context, options);
        });
    }

    function makeUnlinkFn(compileInfos) {
        return makeLinkerFn(compileInfos, function (directive, node, context, options) {
            directive.unlink(node, context, options);
        });
    }


    function compileNode(node, compileInfos) {
        /**
         *
         * @type {Array}
         */
        var link, unlink, templateLinker;
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
                var directive = compileInfo.directive;
                if (directive.compile) {
                    directive.compile(compileInfo.options);
                    if (compileInfo.directive.render === 'replace') {
                        compileInfo.options.templateNode = node;
                        node.parentNode.replaceChild(document.createComment(compileInfo.type), node);
                    }
                }
            });

            link = makeLinkFn(compileInfos);
            unlink = makeUnlinkFn(compileInfos);
        }

        if (node.childNodes.length) {
            var childLinker = compileNodes(node.childNodes);
            if (childLinker) {
                link = makeLinkerChainFn(link, childLinker.link);
                unlink = makeLinkerChainFn(unlink, childLinker.unlink);
            }
        }

        return link ? {
            link: link,
            unlink: unlink
        } : null;
    }

    function compileNodes(nodeList) {
        var nodeLinkers = enumerable(nodeList)
            .select(function (node) {
                return compileNode(node);
            })
            .toArray();
        return {
            link: function (nodeList, context) {
                for (var i = 0, n = nodeList.length; i < n; i++) {
                    var nodeLinker = nodeLinkers[i];
                    if (nodeLinker) {
                        nodeLinker.link(nodeList[i], context);
                    }
                }
            },
            unlink: function (nodeList, context) {
                for (var i = 0, n = nodeList.length; i < n; i++) {
                    var nodeLinker = nodeLinkers[i];
                    if (nodeLinker) {
                        nodeLinker.unlink(nodeList[i], context);
                    }
                }
            }
        };
    }


    return compileNode(element);
}

/*
 Binding Options:

 API 1.

 var binding = binding.create(source, target);
 binding.updateSource();
 binding.updateTarget();


 The idea of being able to bind any property to another property is appealing, but does it fit within the
 whole "dataContext" model;

 The data context acts as a source of data, but what are the real use cases?



 Regardless of whether we are hanging simple properties from the context or complex nested model structures, the
 context acts as the entry point for binding.

 It is responsible for monitoring changes to bound expressions and notifying observers.

 It should monitoring objects that deliver change notification, as well as pojo's in an optimized manner.

 There are several options here:

 For example, with pojo's, given a.b, a.c we could either.

 1) listen to changes in a.b and a.c, which would cause two evaluations of a to occur.

 b) build a watch tree that would monitor a, then b & c separately. This would result in a only being
 evaluated once per cycle.

 NOTE: Property update triggers could make a big difference here. For example, if we are updating and
 re-evaluating pojo's expressions on every key press rather than on commit.

 IDEA: Operators in bindings are just a convenience method for multi-bindings in WPF. The key difference is that
 in WPF we are always explicitly monitoring changes in property paths, with operators in bindings we need to derive
 this information.


 BINDING SYNTAX:

 CONSTANTS: Often properties can be set to constant values, the fact that everything is seen as an expression is
 awkward. There should be a distinct different between binding syntax and constants. Binding syntax should also support
 extensions.

 <component width="20">       // can be validated and rejected an run time (or during template compilation)
 <component width="{value}">  //

 We should be able to pick the default binding handler for a property, for example, with click as a command.

 <component click="{update}">  // model = { update : function(a, b), canUpdate : function(a, b) }

 We also need a generic way to bind to certain events.

 <component action={update => (a, b), on=click,mousedown}>

 <button mvx-action="{(a, b) => update, on=click,mousedown}" mvx-text="{firstName}" />
 <img mvx-attr-src="{}" />
 <input mvx-text="salary, converter=expandNumber" />

 So what have we learned:

 1. We need IoC quickly

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

