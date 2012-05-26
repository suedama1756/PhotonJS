/** @namespace photon.dom */
provide("photon.dom");

photon.dom.wrap = function(element, tagName, doc) {
    doc = doc || document;
    var result = doc.createElement(tagName);
    result.appendChild(element);
    return result;
};

photon.dom.getHtml = function(node) {
    if (photon.isDocumentFragment(node)) {
        // must lift into "real" element to get innerHTML
        var tempDiv = document.createElement("div");
        tempDiv.appendChild(node);

        // save html
        var result = tempDiv.innerHTML;

        // move content back again
        while (tempDiv.firstChild) {
            node.appendChild(tempDiv.firstChild);
        }

        return result;
    }
    return node.innerHTML;
}

var parseHtmlWrapper = {
        option: [ 1, "<select multiple='multiple'>", "</select>" ],
        legend: [ 1, "<fieldset>", "</fieldset>" ],
        thead: [ 1, "<table>", "</table>" ],
        tr: [ 2, "<table><tbody>", "</tbody></table>" ],
        td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
        col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
        area: [ 1, "<map>", "</map>" ]
    };
parseHtmlWrapper.optgroup =
    parseHtmlWrapper.option;
parseHtmlWrapper.tbody =
    parseHtmlWrapper.tfoot =
    parseHtmlWrapper.colgroup =
    parseHtmlWrapper.caption =
    parseHtmlWrapper.thead;
parseHtmlWrapper.th =
    parseHtmlWrapper.td;

photon.dom.htmlToFragmentOrNode = function (html, doc) {
    doc = doc || document;

    var container = doc.createElement("div"),
        match = html.match(/^\s*<(t[dhr]|tbody|tfoot|thead|option|legend|col|area|optgroup|colgroup|caption)/i);
    if (match){
        var wrapper = parseHtmlWrapper[match[1].toLowerCase()],
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

    // convert to fragment
    if (container.childNodes.length === 1) {
        return (container.removeChild(container.firstChild));
    } else {
        var fragment = doc.createDocumentFragment();
        while (container.firstChild) {
            fragment.appendChild(container.firstChild);
        }
        return fragment;
    }
};

photon.dom.findParent = function(element, predicate, obj) {
    if (!element) {
        return null;
    }
    var parent = element.parentNode;
    while (parent && !predicate.call(obj, parent, element)) {
        parent = parent.parentNode;
    }
    return parent;
};

/**
 * Gets or sets whether a HTMLElement has focus.
 * @param {HTMLElement|DocumentView} element
 * @param {boolean} [value]
 */
photon.dom.hasFocus = function (element, value) {
    if (arguments.length === 1) {
        return (element === document.activeElement);
    }
    else if (value) {
        element.focus();
    }
    else {
        element.blur();
    }
};

(function () {
    var jQueryAvailable = !photon.isNullOrUndefined($);
    var cleanupSubscribers = [];

    var cleanupNode = function(node)  {
        for (var i= 0, n=cleanupSubscribers.length; i<n; i++) {
            cleanupSubscribers[i](node);
        }
        if (node.nodeType === 1 || node.nodeType === 9) {
            node.photonData = undefined;
        }
    };

    var cleanupNodes = function(nodes)  {
        nodes = photon.array.toArray(nodes);
        for (var i = 0, n = nodes.length; i < n; i++) {
            cleanupNode(nodes[i]);
        }
    };

    if (jQueryAvailable) {
        if (!$.cleanData) {
            throw new Error("Could not override jQuery 'cleanData'!!");
        }

        // hook into jquery data cleanup
        var oldCleanData = $.cleanData;
        $.cleanData = function (elems) {
            cleanupNodes(elems);
            oldCleanData(elems);
        };
    }

    photon.dom.subscribeToCleanup = function(callback) {
        cleanupSubscribers.push(callback);
    };

    photon.dom.cleanNodes = function(nodes) {
        for (var i= 0,n=nodes.length;i<n;i++) {
            this.cleanNode(nodes[i]);
        }
    };

    photon.dom.remove = function(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    };

    photon.dom.removeAndClean = function(node) {
        photon.dom.remove(node);
        photon.dom.cleanNode(node);
    };

    photon.dom.cleanNode = jQueryAvailable ?
        function(node) {
            if (node.nodeType === 1 || node.nodeType === 9) {
                $.cleanData(node.getElementsByTagName("*"));
            }
             $.cleanData([node]);
        } :
        function(node) {
            if (node.nodeType === 1 || node.nodeType === 9) {
                cleanupNodes(node.getElementsByTagName("*"));
            }
            cleanupNode(node);
        };

    photon.dom.empty = function(node) {
        while (node.firstChild ) {
            photon.dom.cleanNode(node.firstChild);
            node.removeChild(node.firstChild );
        }
    };
})();