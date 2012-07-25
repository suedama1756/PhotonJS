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

    function nodeScript(photon, example) {
        example.Node = photon.observable.model.define({
            value : '',
            next : null
        });
    }

    function nodePageScript(photon, example) {
        $(function () {
            photon.binding.applyBindings(new example.Node({
                next : new example.Node({
                    next : new example.Node()
                })
            }));
        });
    }

    exampleWidget.add([
        {
            id:'examplePojo',
            javaScript:[
                {
                    title:'Page.js',
                    code:pojoPageScript,
                    isRunnable:true
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
                    code:personScript,
                    isRunnable:true
                },
                {
                    title:'Page.js',
                    code:pageScript,
                    isRunnable:true
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
                    code:personScript,
                    isRunnable:true
                },
                {
                    title:'Page.js',
                    code:pageScript,
                    isRunnable:true
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
                    code:multipleBindingModelScript,
                    isRunnable:true
                },
                {
                    title:'Page.js',
                    code:multipleBindingPageScript,
                    isRunnable:true
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
                    code:converterModelScript,
                    isRunnable:true
                },
                {
                    title:'Page.js',
                    code:converterPageScript,
                    isRunnable:true
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
                    code:addressScript,
                    isRunnable:true
                },
                {
                    title:'Person.js',
                    code:personWithAddressScript,
                    isRunnable:true
                },
                {
                    title:'Page.js',
                    code:pageScript,
                    isRunnable:true
                }
            ],
            css:'',
            html:'exampleDataContext'
        },
        {
            id:'exampleParentDataContext',
            javaScript:[
                {
                    title:'Node.js',
                    code:nodeScript,
                    isRunnable:true
                },
                {
                    title:'Page.js',
                    code:nodePageScript,
                    isRunnable:true
                }
            ],
            css:'',
            html:'exampleParentDataContext'
        }
    ]);
});

