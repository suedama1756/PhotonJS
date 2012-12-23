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

function element(html, doc) {
    doc = doc || document;

    var container = doc.createElement("div"),
        match = html.match(/^\s*<(t[dhr]|tbody|tfoot|thead|option|legend|col|area|optgroup|colgroup|caption)/i);
    if (match){
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
}