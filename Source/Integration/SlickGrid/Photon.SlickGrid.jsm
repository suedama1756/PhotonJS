({
    name:'photon.slickGrid',
    files:[
        'Photon.SlickGrid.js'
    ],
    dependencies:{
        '$':{
            amd:'jquery',
            global:'jQuery'
        },
        'photon' : {
            amd:'photon',
            global:'photon'
        },
        'slick' : {
            amd : ['slick.core', 'slick.grid'],
            global : 'Slick'
        }
    },
    environment:{
        dependencies:['document']
    }
});
