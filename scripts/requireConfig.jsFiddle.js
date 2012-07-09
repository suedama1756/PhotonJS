
    requirejs.config({
        baseUrl : '..',
        shim: {
           'exampleWidget' : {
               deps:['jquery', 'photon']
           }
        },
        paths:{
            'jquery':[
                'http://suedama1756.github.com/Photon/libs/jquery/jquery-1.7.2'
            ],
            'highlight':[
                'http://suedama1756.github.com/Photon/libs/highlight/highlight.pack'
            ],
            'beautifyCss':[
                'http://suedama1756.github.com/Photon/libs/beautify/beautify-css'
            ],
            'beautifyHtml':[
                'http://suedama1756.github.com/Photon/libs/beautify/beautify-html'
            ],
            'beautifyJavaScript':[
                'http://suedama1756.github.com/Photon/libs/beautify/beautify'
            ],
            'photon':[
                'http://suedama1756.github.com/Photon/scripts/Photon-debug'
            ],
            'exampleWidget': [
                'http://suedama1756.github.com/Photon/scripts/ExampleWidget'
            ]
        }
    });

    require(['jquery', 'highlight', 'beautifyCss', 'beautifyHtml', 'beautifyJavaScript', 'exampleWidget'], function() {

    });

