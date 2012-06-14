/**
 * String format for generic attribute matching in templates
 * @type {String}
 */
var attributeRegExFormat = '(<[a-z]([a-z]|\\d)*(\\s+(?!{0}=)[a-z0-9\\-]+(=("[^"]*"|\'[^\']*\'))?)*\\s+({0}=(["\'])([\\s\\S]*?)\\7))';

/**
 * Cache for binding type regex
 * @type {Object}
 */
var bindingTypeRegExCache = {
};

var afterRenderSubscribers = [];

var escapedFromXmlMap = {
    '&amp;': '&',
    '&quot;': '"',
    '&lt;': '<',
    '&gt;': '>'
};

function decodeXml(string) {
    return string.replace(/(&quot;|&lt;|&gt;|&amp;)/g,
        function(str, item) {
            return escapedFromXmlMap[item];
        });
}

/** @namespace photon.templating */
provide("photon.templating",
    /**
     * @lends photon.templating
     */
    {
        getBindingExpressionsFromHtml:function (html, bindingType) {
            html = decodeXml(html);

            // default to data-bind
            bindingType = bindingType || "data-bind";

            // verify the bindingType exists
            assert(photon.binding.getBindingType(bindingType));

            // get regex from cache (or create)
            var regEx = bindingTypeRegExCache[bindingType];
            if (!regEx) {
                regEx = bindingTypeRegExCache[bindingType] =
                    new RegExp(photon.string.format(attributeRegExFormat, bindingType), "gi");
            }
            else {
                regEx.lastIndex = 0;
            }

            // create binding context if non-supplied
            var bindingContext = photon.binding.BindingContext.getInstance();

            // parse data-bind attributes
            var matches;
            var expressions = [];
            while ((matches = regEx.exec(html))) {
                var expressionText = matches[matches.length - 1];
                Array.prototype.push.apply(expressions, bindingContext.parseBindingExpressions(bindingType, expressionText));
            }
            return expressions;
        },

        getPrimaryDataBindingExpressionFromHtml:function (html) {
            var expressions = photon.templating.getBindingExpressionsFromHtml(html, "data-bind");
            if (expressions.length > 1) {
                expressions = photon.array.filter(expressions, function (expression) {
                    return expression.isPrimary;
                });
            }
            return expressions.length === 1 ? expressions[0] : null;
        },

        afterRender : function(nodes) {
            var subscribers = afterRenderSubscribers;
            if (subscribers.length > 0) {
                for (var i= 0,n=subscribers.length; i<n; i++) {
                    subscribers[i](nodes);
                }
            }
        },

        registerAfterRender : function(callback) {
            var subscribers = afterRenderSubscribers.slice(0);
            subscribers.push(callback);
            afterRenderSubscribers = subscribers;
        },

        /**
         *
         * @param {String} reference.url
         * @param {String} reference.name
         * @param {String} reference
         * @param {Function} [callback]
         * @param {Object} [thisObj]
         * @return {String}
         */
        getHtml:function (reference, callback, thisObj) {
            var templateName = photon.isString(reference) ?
                reference :
                reference.name;

            var result = templateCache.findHtml(templateName);
            if (result) {
                if (callback) {
                    callback.call(thisObj, {
                        template:result,
                        completedSynchronously:true
                    });
                }

            } else if (reference.url) {
                templateCache.addResourceUrl(
                    reference.url, function (event) {
                        if (callback) {
                            callback.call(thisObj, {
                                template:templateCache.findHtml(templateName),
                                completedSynchronously:event.completedSynchronously
                            });
                        }
                    }
                );
            }

            return result;
        },
        insertBefore : function(parentElement, newElement, referenceElement, dataContextParentElement) {
            var nodes = [];
            if (newElement.nodeType === 11) {
                var childNodes = newElement.childNodes;
                for (var i= 0, n=childNodes.length; i<n; i++) {
                    nodes[i] = childNodes[i];
                }
            } else {
                nodes[0] = newElement;
            }
            parentElement.insertBefore(newElement, referenceElement);

            // need to apply bindings after we've been attached to the dom, this is still inefficient when we have multiple levels of flow, need
            // to work on a post apply tree callback mechanism
            photon.array.forEach(nodes, function(node) {
                if (photon.isDocumentOrElement(node)) {
                    node.parentDataContextNode = dataContextParentElement;
                    photon.binding.updateBindings(node);
                }
            });

            photon.templating.afterRender(nodes);
            return nodes;
        },
        insertBeforeAndApplyBindings : function(parentElement, newElement, referenceElement, data, parentDataContext) {
            var nodesAppended = [];
            if (newElement.nodeType === 11) {
                var childNodes = newElement.childNodes;
                for (var i= 0, n=childNodes.length; i<n; i++) {
                    nodesAppended.push(childNodes[i]);
                }
            } else {
                nodesAppended.push(newElement);
            }
            parentElement.insertBefore(newElement, referenceElement);

            // need to apply bindings after we've been attached to the dom, this is still inefficient when we have multiple levels of flow, need
            // to work on a post apply tree callback mechanism
            photon.array.forEach(nodesAppended, function(node) {
                if (node.nodeType === 1) {
                    photon.binding.applyBindings(data, node, parentDataContext);
                }
            });

            photon.templating.afterRender(nodesAppended);
            return nodesAppended;
        }
    });