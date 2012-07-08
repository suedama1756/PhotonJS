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
    createMockPhoton_:function () {
        // copy with photon
        var mockPhoton = photon.extend({}, photon);

        // copy binding (as we are going to replace bits of it)
        mockPhoton.binding = photon.extend(
            {}, photon.binding);

        var self = this;
        mockPhoton.binding.applyBindings = function (data) {
            var exampleTab = photon.array.find(self.model_.tabs().unwrap(), function (tab) {
                return tab.id() === 'example';
            });
            if (exampleTab) {
                exampleTab.data(data);
            }
        };

        return mockPhoton;
    },
    configureExample_:function () {
        var $example = $("#example"), templateCache = photon.templating.getCache();
        if ($example) {
            var exampleHtml = $example.html();

            // add example html to the template cache
            templateCache.addHtml("exampleTemplates.example", exampleHtml);

            // clear the example
            $example.empty();
            $(templateCache.getHtml("exampleTemplates.tabs"))
                .appendTo($example);

            this.configureExampleTab_();
            this.configureScriptTab_();
            this.configureHtmlTab_(exampleHtml);
            this.configureCSSTab_();
        }
    },
    configureExampleTab_ : function() {
        this.model_.tabs().push(
            new TabModel({
                id:"example",
                title:"Example",
                template:'exampleTemplates.example',
                data:null
            }));
    },

    configureScriptTab_ : function() {
        var exampleFn = window.example;
        if (exampleFn) {
            exampleFn(this.createMockPhoton_());

            this.model_.tabs().push(new TabModel({
                id:"javascript",
                title:"JavaScript",
                template:'exampleTemplates.javascript',
                data : photon.examples.gadget.formatScript(exampleFn)
            }));
        }
    },
    configureHtmlTab_:function (html) {
        this.model_.tabs().push(new TabModel({
            id:"html",
            title:"Html",
            template:'exampleTemplates.html',
            data : html
        }));
    },
    configureCSSTab_ : function() {
        var style = $("head style")[0];
        if (style) {
            var data = css_beautify(style.innerText || style.textContent);
            data = photon.array.filter(data.split("\n"), function(line) {
                return photon.string.trim(line) != '';
            }).join("\n");

            this.model_.tabs().push(new TabModel({
                id:"css",
                title:"Css",
                template:'exampleTemplates.css',
                data : data
            }));
        }

    },
    setup:function () {
        this.model_ = new TabsModel();
        var self = this;
        $(function () {
            self.configureExample_();

            photon.binding.applyBindings(self.model_);

            hljs.initHighlighting();
        });
    }
});

$(function () {
    // add example html to the template cache
    photon.templating.getCache().addResourceUrl("Gadget.Templates.html", function () {
        photon.examples.gadget.setup();
    });
});



