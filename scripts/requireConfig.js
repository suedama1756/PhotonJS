
    requirejs.config({
        baseUrl : '..',
        shim: {
           'exampleWidget' : {
               deps:['jquery', 'photon']
           }
        },
        paths:{
            'jquery':[
                'libs/jquery/jquery-1.7.2'
            ],
            'highlight':[
                'libs/highlight/highlight.pack'
            ],
            'beautifyCss':[
                'libs/beautify/beautify-css'
            ],
            'beautifyHtml':[
                'libs/beautify/beautify-html'
            ],
            'beautifyJavaScript':[
                'libs/beautify/beautify'
            ],
            'photon':[
                'scripts/Photon-debug'
            ],
            'exampleWidget': [
                'scripts/ExampleWidget'
            ]
        }
    });

    require(['jquery', 'photon', 'highlight', 'beautifyCss', 'beautifyHtml', 'beautifyJavaScript', 'exampleWidget'], function($, photon) {
        $(function() {
            photon.examples.initialize();
        });
    });

