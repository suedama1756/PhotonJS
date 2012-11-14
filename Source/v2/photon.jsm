//noinspection JSLint,UnterminatedStatementJS
(function module() {
    return {
        name:'photon',
        files:[
            'photon.js',
            'type.js',
            'enumerable.js',
            'bind.js'

        ],
        dependencies:{
            '$':{
                amd:'jquery',
                global:'jQuery'
            }
        },
        environment:{
            dependencies:['window', 'document']
        }
    };
})
