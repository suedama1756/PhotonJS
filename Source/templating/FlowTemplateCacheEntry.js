var flowTemplateCache = {};

var nextFlowTemplateCacheId = 0;

var ATTR_TEMPLATE_ID = "data-template-id";

function isFlowTemplateEntryParent(element) {
    return this === element || element.flowTemplateEntry_;
}

function findFlowTemplateEntryParent(element, rootElement) {
    if (element === rootElement) {
        return null;
    }
    var parent = photon.dom.findParent(element,
        isFlowTemplateEntryParent, rootElement);
    return parent ? parent.flowTemplateEntry_ : null;
}

function createFlowTemplateEntry(rootEntries, element, rootElement) {
    // find parent
    var parent = findFlowTemplateEntryParent(element, rootElement);

    // create template node
    var entry = new photon.templating.FlowTemplateCacheEntry(parent);
    if (!entry.getParent()) {
        rootEntries.push(entry);
    }

    // associate items
    entry.element_ = element;
    element.flowTemplateEntry_ = entry;

    // associate key
    element.setAttribute(ATTR_TEMPLATE_ID,
        entry.getKey());
}

function prepareFlowTemplateEntry(entry) {
    var element = entry.element_;
    if (element) {
        // prepare children
        var children = entry.children_;
        if (children) {
            for (var i = 0, n = children.length; i < n; i++) {
                prepareFlowTemplateEntry(children[i]);
            }
        }

        // extract template
        entry.setTemplate(element.innerHTML);
        photon.dom.empty(element);

        // remove target association, its no longer required and the node is likely to be removed anyway
        delete entry.element_;
    }
}

photon.defineType(
    /**
     * @param {TemplateCacheEntry} parent
     */
    photon.templating.FlowTemplateCacheEntry = function (parent) {
        flowTemplateCache[++nextFlowTemplateCacheId] = this;
        photon.templating.FlowTemplateCacheEntry.base(this, parent,
            nextFlowTemplateCacheId);

    },
    photon.templating.TemplateCacheEntry,
    /**
     * @lends  photon.templating.FlowTemplateCacheEntry.prototype
     */
    {
        dispose:function () {
            // already disposed?
            var key = this.key_;
            if (!key) {
                return;
            }

            // invoke base dispose
            photon.templating.FlowTemplateCacheEntry
                .superType.dispose.call(this);

            // remove ourselves from the cache
            delete flowTemplateCache[key];
            delete this.key_;
        }
    },
    /**
     * @lends photon.templating.FlowTemplateCacheEntry
     */
    {
        getForElement:function (element) {
            return flowTemplateCache[element.getAttribute(ATTR_TEMPLATE_ID)];
        }
    });

/**
 * Prepares flow templates on the specified element
 *
 * @param {HTMLElement} element
 */
photon.templating.prepareFlowTemplates = function (element) {
    var rootEntries = [];
    if (element.nodeType === 1 && element.getAttribute("data-flow") && !element.getAttribute(ATTR_TEMPLATE_ID)) {
        createFlowTemplateEntry(rootEntries, element, element);
    }
    $('*[data-flow]:not(*[data-template-id])', element).each(function (i, current) {
        createFlowTemplateEntry(rootEntries, current, element);
    });

    for (var i = 0, n = rootEntries.length; i < n; i++) {
        prepareFlowTemplateEntry(rootEntries[i]);
    }

    return rootEntries;
};

/**
 * Gets the flow template cache, DO NOT ACCESS DIRECTLY, used only for debug and test purposes
 *
 * @return {Object}
 * @private
 */
photon.templating.getFlowTemplateCache_ = function () {
    return flowTemplateCache;
};

/**
 * Subscribe to node cleanup events so we can remove flow templates
 */
photon.dom.subscribeToCleanup(function (node) {
    if (photon.isElement(node)) {
        var entry = node.flowTemplateEntry_;
        if (entry) {
            if (!entry.getParent()) {
                entry.dispose();
            }
            node.flowTemplateEntry_ = undefined;
        }
    }
});
