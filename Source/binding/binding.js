/** @namespace photon.binding */
provide("photon.binding");

(function () {
    var bindingTypes = {};
    var typeNames = [];

    var evaluationDataContext;

    var evaluationContext = {
        $dataContext:function (indexOrName) {
            var dataContext = evaluationDataContext
                .get(indexOrName);
            return dataContext ? dataContext.getValue() : null;
        },
        $imports:{
            photon:photon
        },
        $metaData : photon.observable.model.metaData
    };

    photon.extend(photon.binding,
        /**
         * lends photon.binding
         */
        {
            getBindingTagNames:function () {
                // TODO:clone?
                return typeNames;
            },
            getBindingType:function (tagName) {
                return bindingTypes[tagName];
            },
            registerBindingType:function (tagName, bindingType) {
                if (photon.array.indexOf(typeNames, tagName) === -1) {
                    typeNames.push(tagName);
                }

                bindingTypes[tagName] = bindingType;
            },
            evaluateInContext:function (dataContext, fn, dependencyTracker, arg0, arg1, arg2) {
                // get capture first as this operation may fail and we are always invoked before a try finally block
                if (!photon.isNullOrUndefined(dependencyTracker)) {
                    dependencyTracker.beginCapture();
                }
                evaluationDataContext = dataContext;

                try {
                    return fn(evaluationContext, dataContext.getValue(), arg0, arg1, arg2);
                }
                finally {
                    evaluationDataContext = null;
                    if (!photon.isNullOrUndefined(dependencyTracker)) {
                        dependencyTracker.endCapture();
                    }
                }
            },
            updateBindings:function (element) {
                if (!photon.isDocumentOrElement(element)) {
                    return;
                }

                var bindingContext = photon.binding.BindingContext.getInstance();

                photon.templating.prepareFlowTemplates(element);

                photon.binding.forEachBoundElement(element, photon.binding.getBindingTagNames(),
                    function (element, attributeName, attributeValue) {
                        var expressions = bindingContext.parseBindingExpressions(attributeName, attributeValue);
                        var bindings = [];
                        var contexts = [];
                        for (var i = 0, n = expressions.length; i < n; i++) {
                            var expression = expressions[i];

                            var nodeBindingInfo = photon.binding.NodeBindingInfo.getOrCreateForElement(element);

                            var binding = nodeBindingInfo.getBindingByExpression(expression);
                            if (!binding) {
                                binding = expressions[i].createBinding(element);
                                nodeBindingInfo.addBinding(binding);
                            }

                            if (expression instanceof photon.binding.data.DataBindingExpression &&
                                expression.getPropertyType() === "data" && expression.getPropertyName() === "context") {
                                contexts.push(binding);
                            }
                            else {
                                bindings.push(binding);
                            }
                        }
                        photon.array.forEach(contexts, function (binding) {
                            binding.bind();
                        });

                        photon.array.forEach(bindings, function (binding) {
                            binding.beginInitialize();
                        });
                        photon.array.forEach(bindings, function (binding) {
                            binding.bind();
                        });
                        photon.array.forEach(bindings, function (binding) {
                            binding.endInitialize();
                        });
                    });
            },
            // TODO: We use the parentDataContext in the template for-each to save looking it up, but why do we bother looking up parents
            // for explicit data contexts, AH, so we can access them in the things!!
            applyBindings:function (data, element, name, parentDataContext) {
                if (photon.isString(element)) {
                    parentDataContext = name;
                    name = element;
                    element = undefined;
                }

                if (!photon.isString(name)) {
                    parentDataContext = name;
                    name = undefined;
                }

                if (!element) {
                    element = document.body;
                }
                if (!photon.isDocumentOrElement(element)) {
                    return;
                }

                var dataContext = photon.binding.NodeBindingInfo.getOrCreateForElement(element)
                    .getOrCreateDataContext();
                dataContext.setParent(parentDataContext ||
                    photon.binding.DataContext.getForElement(element.parentNode));
                dataContext.setSource(data);
                dataContext.setName(name);

                photon.binding.updateBindings(element);
            },

            registerImport : function(name, value) {
                evaluationContext.$imports[name] = value;
            }
        });
})();
