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

    function addressScript(photon, example) {
        example.Address = photon.observable.model.define({
            line1 : '',
            line2 : '',
            town : '',
            county : '',
            postCode: ''
        });
    };

    function personWithAddressScript(photon, example) {
        example.Person = photon.observable.model.define({
            firstName:'',
            lastName:'',
            address : {
                initializer : function() {
                    return new example.Address();
                }
            }
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
        },
        {
            id:'exampleDataContext',
            javaScript:[
                {
                    title:'Address.js',
                    code:addressScript
                },
                {
                    title:'Person.js',
                    code:personWithAddressScript
                },
                {
                    title:'Page.js',
                    code:pageScript
                }
            ],
            css:'',
            html:'exampleDataContext'
        }
    ]);
});

