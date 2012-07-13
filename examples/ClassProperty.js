require(["exampleWidget"], function (photon) {
    function modelWithDerivedPropertyScript(photon) {
        photon.ExampleViewModel = photon.observable.model.define({
            amount:{
                initialValue:0,
                afterChange:function (oldValue, newValue) {
                    this.set("isInTheRed", newValue < 0);
                }
            },
            isInTheRed:{
                type:'Boolean',
                isReadOnly:true
            }
        });
    }

    function modelBasicScript(photon) {
        photon.ExampleViewModel = photon.observable.model.define({
            amount:0
        });
    }

    function pageScript(photon) {
        $(function () {
            photon.binding.applyBindings(new photon.ExampleViewModel());
        });
    }

    photon.examples.initialize([
        {
            id:"example1",
            javaScript:[
                {
                    title:'Model.js',
                    code:modelWithDerivedPropertyScript
                },
                {
                    title:'Page.js',
                    code:pageScript
                }
            ],
            css:'exampleStyles',
            html:'example1'
        }
        ,
        {
            id:"example2",
            javaScript:[
                {
                    title:'Model.js',
                    code:modelBasicScript
                },
                {
                    title:'Page.js',
                    code:pageScript
                }
            ],
            css:'exampleStyles',
            html:'example2'
        }
    ]);
});