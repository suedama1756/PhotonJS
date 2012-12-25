var isTextContentAvailable = 'textContent' in document.createElement('span');

var getNodeText = isTextContentAvailable ? function (node) {
    return node.textContent;
} : function (node) {
    return node.nodeType == NODE_ELEMENT ? node.innerText : node.nodeValue;
};

var setNodeText = isTextContentAvailable ? function (node, text) {
    node.textContent = text;
} : function (node, text) {
    if (node.nodeType == NODE_ELEMENT) {
        node.innerText = text;
    } else {
        node.nodeValue = text;
    }
};

function getNodeValue(node) {
    return node.value;
}

function setNodeValue(node, newValue) {
    node.value = newValue;
}

function getNodeAttribute(node, name) {
    return node.getAttribute(name);
}

function setNodeAttribute(node, name, newValue) {
    node.setAttribute(name, newValue);
}

function getNodeStyle(node, name) {
    return node.style[name];
}

function setNodeStyle(node, name, newValue) {
    node.style[name] = newValue;
}


// TODO: Node functions will need to change when we support multiple, we should also provide
function getNodeParent(node) {
    return nodes(node.parentNode);
}

function getNodeNextSibling(node) {
    return nodes(node.nextSibling);
}


var parseHtmlMap = {
    option: [ 1, "<select multiple='multiple'>", "</select>" ],
    legend: [ 1, "<fieldset>", "</fieldset>" ],
    thead: [ 1, "<table>", "</table>" ],
    tr: [ 2, "<table><tbody>", "</tbody></table>" ],
    td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
    col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
    area: [ 1, "<map>", "</map>" ]
};

parseHtmlMap.optgroup = parseHtmlMap.option;
parseHtmlMap.tbody = parseHtmlMap.tfoot = parseHtmlMap.colgroup = parseHtmlMap.caption = parseHtmlMap.thead;
parseHtmlMap.th = parseHtmlMap.td;

var nodes = extend(
    function nodes(source) {
        if (source instanceof Nodes) {
            return source;
        }

        if (isArray(source)) {
            return new Nodes(source);
        }
        if (isString(source)) {
            return nodes.parse(source);
        }
        if (source.nodeType) {
            return new Nodes([source]);
        }
        throw new Error();
    },
    {
        parse: function (html, doc) {
            doc = doc || document;

            var container = doc.createElement("div"),
                match = html.match(/^\s*<(t[dhr]|tbody|tfoot|thead|option|legend|col|area|optgroup|colgroup|caption)/i);
            if (match) {
                var wrapper = parseHtmlMap[match[1].toLowerCase()],
                    wrapperDepth = wrapper[0];
                container.innerHTML = wrapper[1] + html + wrapper[2];
                while (wrapperDepth--) {
                    container = container.lastChild;
                }
            }
            else {
                container.innerHTML = '<br>' + html;
                container.removeChild(container.firstChild);
            }

            var result = enumerable(container.childNodes).toArray();
            container.innerHTML = '';

            return new Nodes(result);
        }
    });


function cloneIf(node, condition) {
    return condition ? node.cloneNode(true) : node;
}
function applyNodeFunction(target, source, rel, callback) {
    var clone = false;
    nodes(target).forEach(function (targetNode) {
        source.forEach(function (sourceNode) {
            callback(targetNode, cloneIf(sourceNode, clone), rel);
        });
        clone = true;
    });
}

function keyValueFunction(getter, setter) {
    return function (key, newValue) {
        var nodes = this._nodes;
        if (arguments.length) {
            setter(nodes[0], key, newValue);
            return this;
        }
        return getter(nodes[0], key);
    }
}

function keyValuesFunction(getter, setter) {
    return function (key, newValue) {
        if (arguments.length === 2) {
            this.forEach(function (node) {
                setter(node, key, newValue);
            });
            return this;
        }
        return this.select(function(node) {
            return getter(node, key);
        });
    }
}


function valueFunction(getter, setter) {
    return function (newValue) {
        var nodes = this._nodes;
        if (arguments.length) {
            if (!setter) {
                throw new Error('Property is readonly.');
            }
            setter(nodes[0], newValue);
            return this;
        }
        return getter(nodes[0]);
    }
}

function valuesFunction(getter, setter) {
    return function (newValue) {
        if (arguments.length) {
            this.forEach(function (node) {
                setter(node, newValue);
            });
            return this;
        }
        return this.select(getter);
    }
}


var Nodes = type(
    function Nodes(nodes) {
        this._nodes = nodes;
        Enumerable.call(this, fromArrayLike(nodes));
    })
    .name('Nodes')
    .inherits(Enumerable)
    .defines({
        value: valueFunction(
            getNodeValue,
            setNodeValue
        ),
        allValues: valuesFunction(
            getNodeValue,
            setNodeValue
        ),
        text: valueFunction(
            getNodeText,
            setNodeText
        ),
        allTexts: valuesFunction(
            getNodeText,
            setNodeText
        ),
        attribute: keyValueFunction(
            getNodeAttribute,
            setNodeAttribute
        ),
        allAttributes: keyValuesFunction(
            getNodeAttribute,
            setNodeAttribute
        ),
        style:keyValueFunction(
            getNodeStyle,
            setNodeStyle
        ),
        allStyles : keyValuesFunction(
            getNodeStyle,
            setNodeStyle
        ),
        parent: valueFunction(getNodeParent),

        nextSibling: valueFunction(getNodeNextSibling),

        on: function (name, handler) {
            this.forEach(function (node) {
                node.addEventListener(name, handler);
            });
        },
        off : function(name, handler) {
            this.forEach(function (node) {
                node.removeEventListener(name, handler);
            });
        },
        clone: function (deep) {
            return new Nodes(this._nodes.map(function (node) {
                return node.cloneNode(deep);
            }));
        },
        replace: function (newNodes) {
            newNodes = nodes(newNodes);
            this.forEach(function (node) {
                var parent = node.parentNode;
                if (parent != null) {
                    parent.replaceChild(newNodes.first(), node);
                }
            });
        },
        appendTo: function (node) {
            applyNodeFunction(node, this, null, function (targetNode, sourceNode) {
                targetNode.appendChild(sourceNode);
            });
            return this;
        },
        insertBefore: function (node) {
            var shouldClone = false, source = this;
            nodes(node).forEach(function (relNode) {
                var parentNode = relNode.parentNode;
                source.forEach(function (sourceNode) {
                    parentNode.insertBefore(cloneIf(sourceNode, shouldClone), relNode);
                });

                shouldClone = true;
            });
        },
        insertAfter: function (node) {
            var shouldClone = false, source = this;
            nodes(node).forEach(function (relNode) {
                var parentNode = relNode.parentNode;

                relNode = relNode.nextSibling;

                source.forEach(function (sourceNode) {
                    parentNode.insertBefore(cloneIf(sourceNode, shouldClone), relNode);
                });

                shouldClone = true;
            });
        }
    }).
    build();

photon.nodes = nodes;