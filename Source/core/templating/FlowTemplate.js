/**
 * Cache storage for flow templates
 * @private
 * @type {Object}
 */
var flowTemplateCache = {};

/**
 * Next key for a flow template
 * @private
 * @type {Number}
 */
var nextFlowTemplateKey = 0;

/**
 * Attribute name for data template identifiers
 * @const
 * @type {String}
 */
var ATTR_TEMPLATE_ID = "data-template-id";

function isFlowTemplateParent(element) {
    return this === element || element.flowTemplate_;
}

function findFlowTemplateParent(element, rootElement) {
    if (element === rootElement) {
        return null;
    }
    var parent = photon.dom.findParent(element,
        isFlowTemplateParent, rootElement);
    return parent ? parent.flowTemplate_ : null;
}

function createFlowTemplate(rootEntries, element, rootElement) {
    // find parent
    var parent = findFlowTemplateParent(element, rootElement);

    // create template node
    var template = new photon.templating.FlowTemplate(parent);
    if (!template.getParent()) {
        rootEntries.push(template);
    }

    // associate items
    template.element_ = element;
    element.flowTemplate_ = template;

    // associate key
    element.setAttribute(ATTR_TEMPLATE_ID,
        template.getKey());
}

function prepareFlowTemplate(template) {
    var element = template.element_;
    if (element) {
        // prepare children
        var children = template.children_;
        if (children) {
            for (var i = 0, n = children.length; i < n; i++) {
                prepareFlowTemplate(children[i]);
            }
        }

        // extract template
        template.setTemplate(element.innerHTML);
        photon.dom.empty(element);

        // remove target association, its no longer required and the node is likely to be removed anyway
        delete template.element_;
    }
}

photon.defineType(
    /**
     * @param {Template} parent
     */
    photon.templating.FlowTemplate = function (parent) {
        flowTemplateCache[++nextFlowTemplateKey] = this;
        photon.templating.FlowTemplate.base(this, parent,
            nextFlowTemplateKey);

    },
    photon.templating.Template,
    /**
     * @lends  photon.templating.FlowTemplate.prototype
     */
    {
        dispose:function () {
            // already disposed?
            var key = this.key_;
            if (!key) {
                return;
            }

            // invoke base dispose
            photon.templating.FlowTemplate
                .superType.dispose.call(this);

            // remove ourselves from the cache
            delete flowTemplateCache[key];
            delete this.key_;
        }
    },
    /**
     * @lends photon.templating.FlowTemplate
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
    var rootTemplates = [];
    if (element.nodeType === 1 && element.getAttribute("data-flow") && !element.getAttribute(ATTR_TEMPLATE_ID)) {
        createFlowTemplate(rootTemplates, element, element);
    }
    $('*[data-flow]:not(*[data-template-id])', element).each(function (i, current) {
        createFlowTemplate(rootTemplates, current, element);
    });

    for (var i = 0, n = rootTemplates.length; i < n; i++) {
        prepareFlowTemplate(rootTemplates[i]);
    }

    return rootTemplates;
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
        var template = node.flowTemplate_;
        if (template) {
            if (!template.getParent()) {
                template.dispose();
            }
            node.flowTemplate_ = undefined;
        }
    }
});
