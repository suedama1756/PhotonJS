require(["exampleWidget"], function (exampleWidget) {
    function modelWithDerivedPropertyScript(photon, example) {
        example.Account = photon.observable.model.define({
            balance:{
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

    function modelBasicScript(photon, example) {
        example.Account = photon.observable.model.define({
            balance:0
        });
    }

    function pageScript(photon, example) {
        $(function () {
            photon.binding.applyBindings(new example.Account());
        });
    }

    exampleWidget.add([
        {
            id:"example1",
            javaScript:[
                {
                    title:'Account.js',
                    code:modelWithDerivedPropertyScript,
                    isRunnable:true
                },
                {
                    title:'Page.js',
                    code:pageScript,
                    isRunnable:true
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
                    title:'Account.js',
                    code:modelBasicScript,
                    isRunnable:true
                },
                {
                    title:'Page.js',
                    code:pageScript,
                    isRunnable:true
                }
            ],
            css:'exampleStyles',
            html:'example2'
        }
    ]);
});