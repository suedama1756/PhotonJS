define(['photon'], function (photon) {
    var example = {
        models:{
        },
        presenters:{
        },
        views:{
        },
        scripts:{
        }
    };

    function runScripts(scripts) {
        photon.array.forEach(scripts, function (script) {
            script(photon, example);
        });
    }

    function modelsRootScript(photon, example) {
        example.models.Root = photon.observable.model.define({
            examples:{
                type:'ObservableArray'
            }
        });
    }

    function modelsExampleScript(photon, example) {
        example.models.Example = photon.observable.model.define({
            id:null,
            codeSnippets:{
                type:'ObservableArray'
            },
            activeCodeSnippet:null,
            data:null,
            jsFiddle:{
                initializer:function () {
                    return {
                        css:'',
                        html:'',
                        javascript:'example = {};\n\n'
                    }
                }
            }
        });
    }

    function modelsCodeSnippetScript(photon, example) {
        example.models.CodeSnippet = photon.observable.model.define({
            id:null,
            title:null,
            template:null,
            data:null
        });
    }

    function viewsHighlightPropertyScript(photon, example) {
        var highlightProperty = example.views.HighlightedTextProperty = function () {
            highlightProperty.base(this);
        };

        photon.defineType(highlightProperty, photon.binding.data.Property,
            {
                getValue:function (binding) {
                    return binding.rawValue_;
                },
                setValue:function (binding) {
                    var oldValue = binding.rawValue_, newValue = binding.getSourceValue();
                    if (oldValue !== newValue) {
                        // update raw value
                        binding.rawValue_ = newValue;

                        // replace target content
                        var $target = $(binding.getTarget());
                        $target.empty()
                            .text(newValue);
                        $target.addClass(binding.getExpression().getPropertyName());

                        // highlight
                        hljs.highlightBlock(binding.getTarget());
                    }
                }
            }
        );

        photon.binding.data.properties["highlight"] = new highlightProperty();
    }

    function presentersScript(photon, example) {
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

                script = scriptLines.join("\r\n");
            }

            // get script
            return js_beautify(script, {
                preserve_newlines:true
            });
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
            example.presenters.ExampleBuilder = function () {
            },
            /**
             * @lends example.presenters.ExampleBuilder.prototype
             */
            {
                build:function (configuration) {
                    var buildInfo = {},
                        model = new example.models.Example({
                            id:configuration.id
                        });

                    if (!model.id()) {
                        throw new Error("Example elements must provide a unique 'id' attribute, e.g. '<div class=\"example\" id=\"actionExample\">' .")
                    }
                    var $example = $('#' + configuration.html);

                    this.configureExampleTab_(model, $example, buildInfo);
                    this.configureHtmlTab_(model, $example, buildInfo);
                    this.configureScriptTab_(model, configuration);
                    this.configureCSSTab_(model, configuration);

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
                    var $exampleDescription = $(photon.string.format("#{0}-description", model.id()));
                    if ($exampleDescription.length) {
                        templateCache.addHtml(templateName + "-description", $exampleDescription.html());
                    } else {
                        templateCache.addHtml(templateName + "-description", '');
                    }
                    $exampleDescription.remove();

                    // clear the example
                    $example.remove();
                },
                forEachConfigurationOption:function (option, fn) {
                    if (!option) {
                        return;
                    }
                    if (!photon.isArray(option)) {
                        fn.call(this, option);
                    }
                    photon.array.forEach(option, fn, this);
                },
                configureScriptTab_:function (model, configuration) {
                    var mockPhoton = this.mockPhoton_(model), exampleNs = {
                        models:{
                        },
                        presenters:{
                        },
                        views:{
                            properties:{
                            }
                        },
                        scripts:{
                        }
                    };
                    this.forEachConfigurationOption(configuration.javaScript, function (option) {
                        var exampleFn = photon.isFunction(option) ? option : option.code;
                        if (!photon.isFunction(exampleFn)) {
                            throw new Error(photon.string.format('Unable to find global example startup method \'{0}\'.', model.id()));
                        }

                        exampleFn(mockPhoton, exampleNs);

                        var script = formatScript(exampleFn);
                        model.codeSnippets().push(new example.models.CodeSnippet({
                            id:"javascript",
                            title:option.title || 'JavaScript',
                            template:'exampleTemplates.javascript',
                            data:script
                        }));

                        model.jsFiddle().javascript += script + "\n\n";
                    });
                },
                configureHtmlTab_:function (model, $example, buildInfo) {
                    var html = style_html(decodeXml(buildInfo.html));
                    model.codeSnippets().push(new example.models.CodeSnippet({
                        id:"html",
                        title:"Html",
                        template:'exampleTemplates.html',
                        data:html
                    }));
                    model.jsFiddle().html = html;
                },
                configureCSSTab_:function (model, configuration) {
                    if (!configuration.css) {
                        return;
                    }

                    var style = $(photon.string.format("#{0}", configuration.css))[0];
                    if (style) {
                        var data = photon.string.trim(style.innerText || style.textContent || '');
                        if (!data) {
                            return;
                        }
                        data = css_beautify(data);
                        data = photon.array.filter(data.split("\n"),function (line) {
                            return photon.string.trim(line) != '';
                        }).join("\n");

                        model.codeSnippets().push(new example.models.CodeSnippet({
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
    }

    runScripts([
        modelsRootScript,
        modelsExampleScript,
        modelsCodeSnippetScript,
        viewsHighlightPropertyScript,
        presentersScript
    ]);

    var rootModel = new example.models.Root();
    example.addSelf = function () {
        example.add({
            id:"example",
            javaScript:[
                {
                    title:'Root.js',
                    code:modelsRootScript
                },
                {
                    title:'Example.js',
                    code:modelsExampleScript
                },
                {
                    title:'CodeSnippet.js',
                    code:modelsCodeSnippetScript
                },
                {
                    title:'HighlightProperty.js',
                    code:viewsHighlightPropertyScript
                },
                {
                    title:'ExampleBuilder.js',
                    code:presentersScript
                }
            ],
            html:'example'
        });
    };

    example.add = function (configuration) {
        var exampleBuilder = new example.presenters.ExampleBuilder();

        configuration = photon.isArray(configuration) ? configuration : [configuration];
        photon.array.forEach(configuration, function (item) {
            var exampleViewModel = exampleBuilder.build(item);
            if (exampleViewModel) {
                rootModel.examples().push(exampleViewModel);
                if (exampleViewModel.codeSnippets().length()) {
                    exampleViewModel.activeCodeSnippet(exampleViewModel.codeSnippets().getItem(0));
                }
            }
        });
    };

    $(function () {
        photon.templating.getCache().addResourceUrl(bootstrapper.baseUrl + "templates/example-templates.html", function () {
            $("#exampleWrapper").append(
                photon.templating.getCache().getHtml("exampleTemplates.examples"));
            photon.binding.applyBindings(rootModel, $("#examples")[0]);

            $("body").show();
        });
    });

    return example;
})
;

