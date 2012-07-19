require(["exampleWidget"], function (exampleWidget) {
    function numberSelectorScript(photon, example) {
        example.NumberSelector = photon.observable.model.define({
            name:'Model',
            options:[],
            selectedOption:{
                initialValue:0,
                type:'Number'
            }
        });
    }

    function pageScript(photon, example) {
        $(function () {
            var model = new example.NumberSelector({
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

    exampleWidget.add([
        {
            id:'example1',
            javaScript:[
                {
                    title:'NumberSelector.js',
                    code:numberSelectorScript
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