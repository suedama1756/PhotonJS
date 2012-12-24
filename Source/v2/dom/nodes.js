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


var Nodes = type(
    function Nodes(nodes) {
        this._nodes = nodes;
        Enumerable.call(this, fromArrayLike(nodes));
    })
    .name('Nodes')
    .inherits(Enumerable)
    .defines({
        appendTo: function (node) {
            applyNodeFunction(node, this, null, function (targetNode, sourceNode) {
                targetNode.appendChild(sourceNode);
            });
            return this;
        },
        clone: function (deep) {
            return new Nodes(this._nodes.map(function (node) {
                return node.cloneNode(deep);
            }));
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
        on : function(name, handler) {
            this.forEach(function(node) {
                node.addEventListener(name, handler);
            });
        },
        attr: function (name, value) {
            if (arguments.length === 0) {
                return this.select(function(node) {
                    return node.getAttribute(name);
                });
            }
            this.forEach(function (node) {
                node.setAttribute(name, value);
            });
            return this;
        },
        text: function (text) {
            if (arguments.length === 0) {
                return this.select(getNodeText);
            }
            this.forEach(function (node) {
                setNodeText(node, text);
            });
            return this;
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