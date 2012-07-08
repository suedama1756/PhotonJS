/** @namespace photon.examples.gadget */
defineNamespace("examples.gadget")


var TabsModel = photon.observable.model.define({
    tabs:{
        type:'ObservableArray'
    },
    activeTab:null
});

var TabModel = photon.observable.model.define({
    id:null,
    title:null,
    template:null,
    data:null
});

photon.extend(photon.examples.gadget, {
    formatScript:function (script) {
        if (photon.isFunction(script)) {
            // get text of function
            var script = script.toString();

            // split into lines
            var scriptLines = photon.string.split(script, "\n");

            // remove declaration and trailing } (assuming format here)
            scriptLines = photon.array.map(scriptLines.slice(1, scriptLines.length - 2),
                function (line) {
                    return photon.string.trim(line);
                });

            script = scriptLines.join("\n");
        }

        // get script
        return js_beautify(script);
    },
    formatHtml:function (html) {
        return style_html(html);
    },
    setup:function () {
        var tabsModel = new TabsModel({
            tabs:[
                new TabModel({
                    id:"example",
                    title:"Example",
                    template:'exampleTemplates.example'
                }),
                new TabModel({
                    id:"javascript",
                    title:"JavaScript",
                    template:'exampleTemplates.javascript'
                }),
                new TabModel({
                    id:"html",
                    title:"Html",
                    template:'exampleTemplates.html'
                })
            ]});

        var exampleTab = tabsModel.tabs().getItem(0);
        tabsModel.activeTab(exampleTab);

        var mockPhoton = photon.extend({}, photon);
        mockPhoton.binding = photon.extend(
            {}, photon.binding);
        mockPhoton.binding.applyBindings = function (data) {
            exampleTab.data(data);
        };

        var exampleJs = window.example;
        if (exampleJs) {
            exampleJs(mockPhoton);
        }

        var self = this;
        $(function () {
            // grab example html from body
            var $body = $("body"), exampleHtml = $body.html(), templateCache = photon.templating.getCache();

            // add example html to the template cache
            templateCache.addHtml("exampleTemplates.example", exampleHtml);

            $body.empty();
            $(photon.templating.getCache().getHtml("exampleTemplates.tabs"))
                .appendTo($("body"));

            photon.binding.applyBindings(tabsModel);
            self.setupScript(exampleJs);
            self.setupHtml(exampleHtml);
            hljs.initHighlightingOnLoad();
        });


    },
    setupScript:function (script) {
        $("#codeJs").text(photon.examples.gadget.formatScript(script));
    },
    setupHtml:function (html) {
        var $codeHtml = $("#codeHtml");
        $codeHtml.text(this.formatHtml("<body>" + html + "</body>"));

    }
});

$(function() {
    // add example html to the template cache
    photon.templating.getCache().addResourceUrl("Gadget.Templates.html", function() {
        photon.examples.gadget.setup();
    });
});



