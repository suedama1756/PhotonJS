photon.dom.subscribeToCleanup(function (node) {
    // clean disposables
    var data = photon.getData(node);
    if (data) {
        if (data.disposables) {
            for (var i = 0, n = data.disposables.length; i < n; i++) {
                data.disposables[i].dispose();
            }
        }
    }
});

photon.addDisposable = function (element, disposable) {
    var data = photon.getOrCreateData(element);
    (data.disposables = data.disposables || []).push(disposable);
};

photon.rewriteTemplate = function (template) {
    var regex = /(<[a-z]([a-z]|\d)*(\s+(?!data-context=('templateSource[^']*'|"templateSource[^']*"))[a-z0-9\-]+(=("[^"]*"|'[^']*'))?)*\s+(data-context=((["'])templateSource:([\s\S]*?))\9))/gi;

    return template.replace(regex, function () {
        var argumentsLength = arguments.length;
        var result = new photon.StringBuilder();
        var temp = arguments[0];
        result.push(temp.substring(0, temp.length - arguments[argumentsLength - 6].length));
        result.push('data-context-id=');
        var delimiter = arguments[argumentsLength - 4];
        result.push(delimiter);
        photon.rewriteScriptFragment(result, '=context.identity(' + arguments[argumentsLength - 3] + ')');
        result.push(delimiter);
        return result.get();
    });
};


photon.rewriteScriptFragment = function (builder, script) {
    builder.pushAll(['<%', script, '%>']);
};


photon.getOrCreateData = function (node) {
    return node.photonData || (node.photonData = {});
};

photon.getData = function (node) {
    return node.photonData;
};

(function () {
    var fnDataElementSelector = document.querySelectorAll
        ?
        //        function (element, bindingTypes, callback) {
        //            for (var i = 0, n = bindingTypes.length; i < n; i++) {
        //                var bindingType = bindingTypes[i];
        //                photon.array.forEach(
        //                    element.querySelectorAll("*[" + bindingType + "]"),
        //                    function (element) {
        //                        callback(element, bindingType, element.getAttribute(bindingType));
        //                    }
        //                );
        //            }
        //        }
        // TODO: Still need to do more work to find best overall solution
        function (element, bindingTypes, callback) {
            var types = "*[" + bindingTypes.join("], *[") + "]";
            if (element.nodeType === 1) {
                for (var j = 0, nj = bindingTypes.length; j < nj; j++) {
                    var bindingType = bindingTypes[j];
                    var bindingValue = element.getAttribute(bindingType);
                    if (bindingValue) {
                        callback(element, bindingType, bindingValue);
                    }
                }
            }
            photon.array.forEach(
                element.querySelectorAll(types), function (currentElement) {
                    for (var j = 0, nj = bindingTypes.length; j < nj; j++) {
                        var bindingType = bindingTypes[j];
                        var bindingValue = currentElement.getAttribute(bindingType);
                        if (bindingValue) {
                            callback(currentElement, bindingType, bindingValue);
                        }
                    }
                });

        }
        :
        function (element, bindingTypes, callback) {
            if (element.nodeType === 1) {
                for (var j = 0, nj = bindingTypes.length; j < nj; j++) {
                    var bindingType = bindingTypes[j];
                    var bindingValue = element.getAttribute(bindingType);
                    if (bindingValue) {
                        callback(element, bindingType, bindingValue);
                    }
                }
            }
            var elements = element.getElementsByTagName("*");
            for (var i = 0, ni = elements.length; i < ni; i++) {
                var currentElement = elements[i];
                for (var j = 0, nj = bindingTypes.length; j < nj; j++) {
                    var bindingType = bindingTypes[j];
                    var bindingValue = currentElement.getAttribute(bindingType);
                    if (bindingValue) {
                        callback(currentElement, bindingType, bindingValue);
                    }
                }
            }
        };

    photon.binding.forEachBoundElement = function (element, bindingTypes, callback) {
        element = element || document;
        if (!element) {
            return;
        }
        if (photon.isString(bindingTypes)) {
            bindingTypes = [bindingTypes];
        }
        fnDataElementSelector(element, bindingTypes, callback);
    };
})();
