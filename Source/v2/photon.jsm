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
            'core/core.js',
            'core/core-ecma5.js',
            'type.js',
            'collections/enumerable.js',
            'collections/List.js',
            'string.js',

            'async/async.js',
            'async/TimeoutError.js',

            'dom/nodes.js',

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
            'directives/text.js',
            'directives/decorate.js',
            'directives/on.js',
            'directives/property.js',

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
