
    requirejs.config({
        baseUrl : '..',
        shim: {
           'exampleWidget' : {
               deps:['jquery', 'photon', 'highlight', 'beautifyCss', 'beautifyHtml', 'beautifyJavaScript']
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
                'scripts/examples/ExampleWidget'
            ]
        }
    });



