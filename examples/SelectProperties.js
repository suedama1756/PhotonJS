require(["exampleWidget"], function (photon) {
    function rootViewModelScript(photon) {
        photon.RootViewModel = photon.observable.model.define({
            name:'Model',
            options:[],
            selectedOption:{
                initialValue:0,
                type:'Number'
            }
        });
    }

    function pageScript(photon) {
        $(function () {
            var model = new photon.RootViewModel({
                options:[
                    { Id:1, DisplayName:"One"},
                    { Id:2, DisplayName:"Two"},
                    { Id:3, DisplayName:"Three"},
                    { Id:4, DisplayName:"Four"}
                ]
            });

            photon.binding.applyBindings(model);
        });
    }

    photon.examples.initialize([
        {
            id:'example1',
            javaScript:[
                {
                    title:'Model.js',
                    code:rootViewModelScript
                },
                {
                    title:'Page.js',
                    code:pageScript
                }
            ],
            css:'',
            html:'example1'
        }
    ]);
});