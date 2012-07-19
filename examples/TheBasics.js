require(["exampleWidget"], function (exampleWidget) {
    function personScript(photon, example) {
        example.Person = photon.observable.model.define({
            firstName:{
                type:'String'
            },
            lastName:{
                type:'String'
            }
        });
    };

    function pageScript(photon, example) {
        $(function () {
            photon.binding.applyBindings(new example.Person());
        });
    }

    exampleWidget.add([
        {
            id:'example1',
            javaScript:[
                {
                    title:'Person.js',
                    code:personScript
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

