require(["exampleWidget"], function (exampleWidget) {
    function personScript(photon, example) {
        example.Person = photon.observable.model.define({
            firstName:'',
            lastName:''
        });
    }

    function pageScript(photon, example) {
        $(function () {
            photon.binding.applyBindings(new example.Person());
        });
    }

    function multipleBindingModelScript(photon, example) {
        example.TextValue = photon.observable.model.define({
            value:{
                type:'String'
            },
            maxLength:10
        });
    }

    function multipleBindingPageScript(photon, example) {
        $(function () {
            photon.binding.applyBindings(new example.TextValue());
        });
    }

    function converterModelScript(photon, example) {
        example.Model = photon.observable.model.define({
            isReadOnly:true
        });
    }

    function converterPageScript(photon, example) {
        $(function () {
            photon.binding.applyBindings(new example.Model());
        });
    }

    function pojoPageScript(photon, example) {
        $(function () {
            photon.binding.applyBindings({
                message:'Photon Rocks!!!'
            });
        });
    }


    exampleWidget.add([
        {
            id:'examplePojo',
            javaScript:[
                {
                    title:'Page.js',
                    code:pojoPageScript
                }
            ],
            css:'',
            html:'examplePojo'
        },
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
            html:'example1'
        },
        {
            id:'exampleExpressions',
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
            html:'exampleExpressions'
        },
        {
            id:'example2',
            javaScript:[
                {
                    title:'TextValue.js',
                    code:multipleBindingModelScript
                },
                {
                    title:'Page.js',
                    code:multipleBindingPageScript
                }
            ],
            css:'',
            html:'example2'
        },
        {
            id:'example3',
            javaScript:[
                {
                    title:'Model.js',
                    code:converterModelScript
                },
                {
                    title:'Page.js',
                    code:converterPageScript
                }
            ],
            css:'',
            html:'example3'
        }
    ]);
});

