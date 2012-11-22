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
            'enumerable.js',
            'bind.js',
            beginEnclosure,
            'parsing/tokenize.js',
            'parsing/tokenize.testing.js',
            'parsing/parser.js',
            endEnclosure
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
