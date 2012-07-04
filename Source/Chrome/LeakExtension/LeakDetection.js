var attachLeakDetector = function () {
    function printStackTrace() {
        return new printStackTrace.implementation().run();
    }

    printStackTrace.implementation = function () {
    };

    printStackTrace.implementation.prototype = {
        run:function () {
            var e = this.createException();
            var stack = (e.stack + '\n').replace(/^\S[^\(]+?[\n$]/gm, '').
                replace(/^\s+(at eval )?at\s+/gm, '').
                replace(/^([^\(]+?)([\n$])/gm, '{anonymous}()@$1$2').
                replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}()@$1').split('\n');
            stack.pop();
            return stack;
        },

        createException:function () {
            try {
                this.undef();
            } catch (e) {
                return e;
            }
        }
    };

    document.addEventListener("DOMNodeRemoved", function (event) {
        var potentialLeaks = [], stackTrace = printStackTrace();

        function getLeakedData(node) {
            var jQuery = window.jQuery || window.$, jQueryData, photonData;
            if (jQuery) {
                jQueryData = node.nodeType ? jQuery.cache[node[jQuery.expando]] : node[jQuery.expando]
            }

            if (window.photon) {
                photonData = window.photon.getData(node);
            }

            if (photonData || jQueryData) {
                return {
                    photon: photonData,
                    jQuery : jQueryData
                }
            }

            return null;
        }

        function visitNode(node) {
            if (getLeakedData(node)) {
                potentialLeaks.push(node);
            }

            var childNodes = node.childNodes;
            if (childNodes) {
                for (var i = 0; i < childNodes.length; i++) {
                    visitNode(childNodes[i]);
                }
            }
        }

        visitNode(event.target);

        setTimeout(function () {
            var hasReported = false;
            for (var i = 0, n = potentialLeaks.length; i < n; i++) {
                var potentialLeak = potentialLeaks[i], data = getLeakedData(potentialLeak);
                if (data) {
                    if (document.body && !document.body.contains(potentialLeak)) {
                        if (!hasReported) {
                            console.error("Potential Leak Detected");
                            for (var j = 0; j < stackTrace.length; j++) {
                                console.log(stackTrace[j]);
                            }
                            hasReported = true;
                        }
                        console.log(potentialLeak, data);
                    }
                }
            }
        }, 0);
    });
};

var enableLeakDetection = function () {
    chrome.devtools.inspectedWindow.reload({
        injectedScript:'(' + attachLeakDetector.toString() + ')();'
    });
};


chrome.devtools.panels.elements.createSidebarPane("Leak Detection",
    function (sidebar) {
        sidebar.setPage("SideBar.html");
        sidebar.setHeight("8ex");
        sidebar.onShown.addListener(function (window) {
            var element = window.document.getElementById("reload");
            if (element) {
                element.addEventListener("click", function () {
                    try {
                        enableLeakDetection();
                    } catch (e) {
                        alert(e);
                    }
                });
            }
        });
    });
