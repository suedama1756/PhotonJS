require(["exampleWidget"], function (photon) {
    function modelScript(photon) {
        photon.RootViewModel = photon.observable.model.define({
            firstName:{
                type:'String'
            },
            lastName:{
                type:'String'
            }
        });
    };

    function pageScript(photon) {
        $(function () {
            photon.binding.applyBindings(new photon.RootViewModel());
        });
    }

    photon.examples.initialize([
        {
            id:'example1',
            javaScript:[
                {
                    title:'Model.js',
                    code:modelScript
                },
                {
                    title:'Page.js',
                    code:pageScript
                }
            ],
            css:'',
            html:'example'
        }
    ]);
});

