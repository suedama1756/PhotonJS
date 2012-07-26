require(["exampleWidget"], function (exampleWidget) {
    function pointScript(photon, example) {
        // define a Point type with observable properties x & y
        example.Point = photon.observable.model.define({
            x:0,
            y:0
        });

        // create a new Point object
        var point = new example.Point();
    }

    function accessorFunctionsScript(photon, example) {
        // set x & y to 20
        point.x(20);
        point.y(20);

        // format values as "(x, y)"
        var text = photon.string.format('({0}, {1})', point.x(), point.y());
    }

    function coercedPointScript(photon, example) {
        function coerceNumber(value) {
            var result = Number(value);
            return isNaN(result) ?
                0 :
                result;
        }

        example.Point = photon.observable.model.define({
            x:{
                initialValue:0,
                coerce:coerceNumber
            },
            y:{
                initialValue:0,
                coerce:coerceNumber
            }
        });
    }

    function coercedPointPageScript(photon, example) {
        $(function () {
            photon.binding.applyBindings(new example.Point());
        });
    }

    function accessorProperties(photon, example) {
        photon.observable.model.defaultPropertyMode === 'property';

        example.Point = photon.observable.model.define({
            x:0,
            y:0
        });

        var point = new example.Point();

        // no need to use accessor functions!!
        point.x = 20;
        point.y = 20;
    }

    function passingInitialValuesScript(photon, example) {
        // create a new Point initialing x to 3, and y to 4
        var point = new example.Point({
            x:3,
            y:4
        });
    }

    function multipleCoercersScript(photon, example) {
        function trim(value) {
            return value ? photon.string.trim(value) : '';
        }

        function upper(value) {
            var text = String(value);
            return text ? text.toUpperCase() : '';
        }

        example.Person = photon.observable.model.define({
            name:{
                initialValue:'',
                coerce:[trim, upper]
            }
        });
    }

    function sharedCoercersScript(photon, exanmple) {
        photon.observable.model.coercers.upper = function (value) {
            var text = String(value);
            return text ? text.toUpperCase() : '';
        }

        photon.observable.model.coercers.trim = function (value) {
            return value ? photon.string.trim(value) : '';
        }
    }

    function sharedCoercersPersonScript(photon, example) {
        example.Person = photon.observable.model.define({
            name:{
                initialValue:'',
                coerce:['trim', 'upper']
            }
        });
    }


    function personPageScript(photon, example) {
        $(function () {
            photon.binding.applyBindings(new example.Person());
        });
    }


    exampleWidget.add(
        [
            {
                id:'exampleSimple',
                javaScript:[
                    {
                        title:'Point.js',
                        code:pointScript,
                        isRunnable:false
                    }
                ],
                html:'exampleSimple'
            },
            {
                id:'exampleAccessorFunctions',
                javaScript:[
                    {
                        title:'Accessor Functions',
                        code:accessorFunctionsScript,
                        isRunnable:false
                    }
                ],
                html:'exampleAccessorFunctions'
            },
            {
                id:'exampleAccessorProperties',
                javaScript:[
                    {
                        title:'Accessor Properties',
                        code:accessorProperties,
                        isRunnable:false
                    }
                ],
                html:'exampleAccessorProperties'
            },
            {
                id:'exampleOverridingInitialValues',
                javaScript:[
                    {
                        title:'Overriding Initial Values',
                        code:passingInitialValuesScript,
                        isRunnable:false
                    }
                ],
                html:'exampleOverridingInitialValues'
            },
            {
                id:'exampleCoercers1',
                javaScript:[
                    {
                        title:'Point.js',
                        code:coercedPointScript,
                        isRunnable:true
                    },
                    {
                        title:'Page.js',
                        code:coercedPointPageScript,
                        isRunnable:true
                    }
                ],
                html:'exampleCoercers1'
            },
            {
                id:'exampleChainingCoercers',
                javaScript:[
                    {
                        title:'Person.js',
                        code:multipleCoercersScript,
                        isRunnable:true
                    },
                    {
                        title:'Page.js',
                        code:personPageScript,
                        isRunnable:true
                    }
                ],
                html:'exampleChainingCoercers'
            } ,
            {
                id:'exampleSharedCoercers',
                javaScript:[
                    {
                        title:'Coercers.js',
                        code:sharedCoercersScript,
                        isRunnable:true
                    },
                    {
                        title:'Person.js',
                        code:sharedCoercersPersonScript,
                        isRunnable:true
                    },
                    {
                        title:'Page.js',
                        code:personPageScript,
                        isRunnable:true
                    }
                ],
                html:'exampleSharedCoercers'
            }
        ]
    )
});