/** @namespace photon.examples.gadget */
defineNamespace("examples.gadget");

var ViewModel = photon.observable.model.define({
    examples:{
        type:'ObservableArray'
    },
    findExampleById:function (id) {
        return photon.array.find(this.examples().unwrap(), function (item) {
            return item.id() === id
        });
    }
});

var ExampleViewModel = photon.observable.model.define({
    id:null,
    pages:{
        type:'ObservableArray'
    },
    activePage:null
});

var PageViewModel = photon.observable.model.define({
    id:null,
    title:null,
    template:null,
    data:null
});

photon.extend(photon.examples.gadget, {
    formatScript:function (script) {
        if (photon.isFunction(script)) {
            // get text of function
            script = script.toString();

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
    createMockPhoton_:function () {
        // copy with photon
        var mockPhoton = photon.extend({}, photon);

        // copy binding (as we are going to replace bits of it)
        mockPhoton.binding = photon.extend(
            {}, photon.binding);

        var self = this;
        var oldApplyBindings = mockPhoton.binding.applyBindings;
        mockPhoton.binding.applyBindings = function (data, node) {
            if (node.id && node.id.substring(0, 7) === "example") {
                var example = self.model_.findExampleById(node.id);
                if (example) {
                    example.pages().getItem(0).data(data);
                }
            } else {
                oldApplyBindings.apply(mockPhoton.binding, arguments);
            }
        };

        return mockPhoton;
    },


    configureExample_:function ($example) {
        var buildInfo = {},
            model = new ExampleViewModel({ id : $example[0].id });

        this.configureExampleTab_(model, $example, buildInfo);
        this.configureScriptTab_(model);
        this.configureHtmlTab_(model, $example, buildInfo);
        this.configureCSSTab_(model);

        return model;
    },

    configureExampleTab_:function (model, $example, buildInfo) {
        var templateCache = photon.templating.getCache(),
            exampleHtml = buildInfo.html = $example.html(),
            templateName = photon.string.format("exampleTemplates.{0}",
                model.id());

        // add example html to the template cache
        templateCache.addHtml(templateName, exampleHtml);

        // clear the example
        $example.empty();
        $(templateCache.getHtml("exampleTemplates.pages"))
            .appendTo($example);

        model.pages().push(
            new PageViewModel({
                id:"example",
                title:"Example",
                template:templateName,
                data:null
            }));
    },

    configureScriptTab_:function (model) {
        var exampleFn = window[model.id()];
        if (photon.isFunction(exampleFn)) {
            exampleFn(this.createMockPhoton_());

            model.pages().push(new PageViewModel({
                id:"javascript",
                title:"JavaScript",
                template:'exampleTemplates.javascript',
                data:photon.examples.gadget.formatScript(exampleFn)
            }));
        }
    },
    configureHtmlTab_:function (model, $example, buildInfo) {
        model.pages().push(new PageViewModel({
            id:"html",
            title:"Html",
            template:'exampleTemplates.html',
            data:style_html(buildInfo.html)
        }));
    },
    configureCSSTab_:function (model) {
        var style = $(photon.string.format("#{0}Styles", model.id()))[0];
        if (style) {
            var data = css_beautify(style.innerText || style.textContent);
            data = photon.array.filter(data.split("\n"),function (line) {
                return photon.string.trim(line) != '';
            }).join("\n");

            model.pages().push(new PageViewModel({
                id:"css",
                title:"Css",
                template:'exampleTemplates.css',
                data:data
            }));
        }

    },
    setup:function () {
        this.model_ = new ViewModel();

        var self = this;
        $(function () {
            $(".example").each(function(i, x) {
                var exampleModel = self.configureExample_($(x));
                if (exampleModel) {
                    self.model_.examples().push(exampleModel);
                }

                photon.binding.applyBindings(exampleModel, x);
            });

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



