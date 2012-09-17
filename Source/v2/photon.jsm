(function module(properties) {
    var result = {
        name:'photon',
        files:[
            'Photon.js'
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

    return result;
})
