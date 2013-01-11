(function () {
    var isTextContentAvailable = 'textContent' in document.createElement('span');

    var getNodeText = isTextContentAvailable ? function (node) {
        return (node.textContent) || '';
    } : function (node) {
        return (node.nodeType == NODE_ELEMENT ? node.innerText : node.nodeValue) || '';
    };

    var setNodeText = isTextContentAvailable ? function (node, text) {
        node.textContent = text ? text : '';
    } : function (node, text) {
        text = text || '';
        if (node.nodeType == NODE_ELEMENT) {
            node.innerText = text;
        } else {
            node.nodeValue = text;
        }
    };


    var Node = type(
        function Node(node) {
            this._node = node;
        })
        .build();

    function defineProperty(name, getter, setter) {
        Node.prototype['get' + name] = getter;
        Node.prototype['set' + name] = setter;
    }

    defineProperty('text',
        function () {
            return getNodeText(this._node);
        },
        function (value) {
            setNodeText(this._node, value);
            return this;
        });

    defineProperty('value',
        function () {
            return this._node.value;
        },
        function (value) {
            this._node.value = value;
            return this;
        });

    defineProperty('style',
        function (selector) {
            var node = this._node;

            if (isString(selector)) {
                return node.styles[selector];
            }

            if (isArray(selector)) {
                var array = [];
                for (var i = 0, n = selector.length; i < n; i++) {
                    array[i] = this._node.styles[selector];
                }
                return array;
            }

            if (isObject(selector)) {
                var obj = {};
                Object.getOwnPropertyNames(selector).forEach(function(propertyName) {
                    obj[propertyName] = node.styles[propertyName];
                });
                return obj;
            }

            throw new Error();
        },
        function (selectorOrMap, value) {
            var node = this._node;

            if (isString(selectorOrMap)) {
                this._node.styles[selectorOrMap] = value;
            } else if (isArray(selectorOrMap)) {
                for (var i = 0, n = selectorOrMap.length; i < n; i++) {
                    node.styles[selectorOrMap] = value;
                }
            } else if (isObject(selectorOrMap)) {
                Object.getOwnPropertyNames(selectorOrMap).forEach(function(propertyName) {
                    node.styles[propertyName] = selectorOrMap[propertyName];
                });
            }

            return this;
        });

    // Idea: have the ability to define virtual properties, e.g. lookup getter setter dynamically


})();