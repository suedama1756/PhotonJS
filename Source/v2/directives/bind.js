var bindDirectiveFactory = [function (parse, container) {
    return {
        context : {

        },
        link: function (linkNode, context, options) {
            // TODO: Verify its an assignment statement
            context.$observer(options.expression, function() {
                context.$sync();
            });
        }
    }
}];


