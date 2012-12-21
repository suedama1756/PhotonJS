//noinspection JSLint,UnterminatedStatementJS
(function module() {
    function beginEnclosure(writer) {
        writer.writeln('(function() {');
        writer.increaseIndent();
    }

    function endEnclosure(writer) {
        writer.decreaseIndent();
        writer.writeln('})();');
    }


    return {
        name:'photon',
        files:[
            'photon.js',
            'type.js',
            'collections/enumerable.js',
            'collections/List.js',
            'string.js',

            'ioc/lifetimes.js',
            'ioc/registration.js',
            'ioc/module.js',
            'ioc/container.js',

            beginEnclosure,
            'parsing/tokenize.js',
            'parsing/parser.js',
            'parsing/exec.js',
            'parsing/testing.js',
            endEnclosure,

            'directives/action.js',
            'directives/attr.js',
            'directives/each.js',
            'directives/model.js',
            'directives/on.js',
            'directives/property.js',

            'binding/properties/AttributeProperty.js',
            'binding/properties/ExpressionProperty.js',
            'binding/properties/ObjectProperty.js',
            'binding/properties/ModelProperty.js',

            'binding/DataContext.js',
            'binding/bind.js'
        ],
        dependencies:{
            '$':{
                amd:'jquery',
                global:'jQuery'
            }
        },
        environment:{
            dependencies:['window', 'document']
        }
    };
})
