(function () {
    /** @namespace photon.examples */
    photon.provide("photon.examples");

    /** @namespace photon.examples.viewModels */
    photon.provide("photon.examples.viewModels", {

    });

    photon.examples.viewModels.RootViewModel = photon.observable.model.define({
        examples:{
            type:'ObservableArray'
        }
    });

    photon.examples.viewModels.ExampleViewModel = photon.observable.model.define({
        id:null,
        pages:{
            type:'ObservableArray'
        },
        activePage:null,
        data:null,
        jsFiddle : {
            initializer : function() {
                return {
                    css :'',
                    html :'',
                    javascript:''
                }
            }
        }
    });

    photon.examples.viewModels.PageViewModel = photon.observable.model.define({
        id:null,
        title:null,
        style:'code',
        template:null,
        data:null
    });

    function formatScript(script) {
        if (photon.isFunction(script)) {
            // get text of function
            script = script.toString();

            // split into lines
            var scriptLines = photon.string.split(script, "\n");

            // remove declaration and trailing } (assuming format here)
            scriptLines = photon.array.map(scriptLines.slice(1, scriptLines.length - 1),
                function (line) {
                    return photon.string.trim(line);
                });

            script = scriptLines.join("\n");
        }

        // get script
        return js_beautify(script);
    }

    var escapedFromXmlMap = {
        '&amp;':'&',
        '&quot;':'"',
        '&lt;':'<',
        '&gt;':'>'
    };

    function decodeXml(string) {
        return string.replace(/(&quot;|&lt;|&gt;|&amp;)/g,
            function (str, item) {
                return escapedFromXmlMap[item];
            });
    }

    photon.defineType(
        photon.examples.ExampleViewModelBuilder = function () {
        },
        /**
         * @lends photon.examples.ExampleViewModelBuilder.prototype
         */
        {
            build:function ($example) {
                var buildInfo = {},
                    model = new photon.examples.viewModels.ExampleViewModel({
                        id:$example[0].id
                    });

                if (!model.id()) {
                   throw new Error("Example elements must provide a unique 'id' attribute, e.g. '<div class=\"example\" id=\"actionExample\">' .")
                }

                this.configureExampleTab_(model, $example, buildInfo);
                this.configureScriptTab_(model);
                this.configureHtmlTab_(model, $example, buildInfo);
                this.configureCSSTab_(model);

                var lines = [
                    '<!-- Hack due to jsFiddle issue: http://goo.gl/BUfGZ -->',
                    '</style>',
                    '<link rel="stylesheet"; href="http://twitter.github.com/bootstrap/assets/css/bootstrap.css">',
                    '<script src="http://suedama1756.github.com/Photon/libs/jquery/jquery-1.7.2.js"></script>',
                    '<script src="http://suedama1756.github.com/Photon/scripts/Photon-debug.js"></script>',
                    '<style>',
                    model.jsFiddle().css];

                model.jsFiddle().css = lines.join("\n");

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
                $(templateCache.getHtml("exampleTemplates.container"))
                    .appendTo($example);
            },

            configureScriptTab_:function (model) {
                var exampleFn = window[model.id()];
                if (!photon.isFunction(exampleFn)) {
                    throw new Error(photon.string.format('Unable to find global example startup method \'{0}\'.', model.id()));
                }

                exampleFn(this.mockPhoton_(model));

                var script = formatScript(exampleFn);
                model.pages().push(new photon.examples.viewModels.PageViewModel({
                    id:"javascript",
                    title:"JavaScript",
                    template:'exampleTemplates.javascript',
                    data:script
                }));
                model.jsFiddle().javascript = script;
            },
            configureHtmlTab_:function (model, $example, buildInfo) {
                var html = style_html(decodeXml(buildInfo.html));
                model.pages().push(new photon.examples.viewModels.PageViewModel({
                    id:"html",
                    title:"Html",
                    template:'exampleTemplates.html',
                    data:html
                }));
                model.jsFiddle().html = html;
            },
            configureCSSTab_:function (model) {
                var style = $(photon.string.format("#{0}Styles", model.id()))[0];
                if (style) {
                    var data = photon.string.trim(style.innerText || style.textContent || '');
                    if (!data) {
                        return;
                    }
                    data = css_beautify(data);
                    data = photon.array.filter(data.split("\n"),function (line) {
                        return photon.string.trim(line) != '';
                    }).join("\n");

                    model.pages().push(new photon.examples.viewModels.PageViewModel({
                        id:"css",
                        title:"Css",
                        template:'exampleTemplates.css',
                        data:data
                    }));

                    model.jsFiddle().css = data;
                }

            },
            mockPhoton_:function (model) {
                // copy with photon
                var mockPhoton = photon.extend({}, photon);

                // copy binding (as we are going to replace bits of it)
                mockPhoton.binding = photon.extend(
                    {}, photon.binding);

                var oldApplyBindings = mockPhoton.binding.applyBindings;
                mockPhoton.binding.applyBindings = function (data, node) {
                    if (!node || (node.id && node.id === model.id())) {
                        model.data(data);
                    } else {
                        oldApplyBindings.apply(mockPhoton.binding, arguments);
                    }
                };

                return mockPhoton;
            }
        });

    photon.examples.initialize = function() {
        $(function () {
            photon.templating.getCache().addResourceUrl("Example.Templates.html", function () {
                var viewModel = new photon.examples.viewModels.RootViewModel(), exampleBuilder =
                    new photon.examples.ExampleViewModelBuilder();

                var $examples = $(".example");
                if (!$examples.length) {
                    $("body").html(
                        "<div class='example' id='example'>" + $("body").html() + "</div>");
                    $examples = $(".example");
                }

                $examples.each(function (i, x) {
                    var exampleViewModel = exampleBuilder.build($(x));
                    if (exampleViewModel) {
                        viewModel.examples().push(exampleViewModel);
                        if (exampleViewModel.pages().length()) {
                            exampleViewModel.activePage(exampleViewModel.pages().getItem(0));
                        }
                    }
                    photon.binding.applyBindings(exampleViewModel, x);
                });

                setTimeout(function() {
                    hljs.initHighlighting();
                }, 0);
            });
        });
    }
})();
