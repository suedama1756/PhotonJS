var strFormatRegEx = /\{(\d+)(:(([a-z])(\d*)))?\}/gi

function strFormat(format /* args */) {
    var args = arguments;
    return format.replace(strFormatRegEx, function(match, position, discard1, discard2, formatter, precision) {
        var formatterFn = formatter ? assert(strFormat.formatters[formatter],
                strFormat("Invalid format specifier '{0}'.", formatter)) : null,
            arg = args[Number(position) + 1];
        return formatterFn ? formatterFn(arg, precision) : arg;
    });
}

function strRepeat(text, iterations) {
    iterations = isNullOrUndefined(iterations) ? 1 : iterations;
    var output = [];
    while (iterations-- > 0) {
        output.push(text);
    }
    return output.join('');
}

function strPadLeft(text, padding, iterations) {
    return strRepeat(padding, iterations) + text;
}

function strPadRight(text, padding, iterations) {
    return text + strRepeat(padding, iterations);
}

strFormat.formatters = {
    'd' : function (value, precision) {
        value = Math.floor(Number(value));
        if (isNaN(value) || !precision) {
            return value;
        }
        value = '' + value;
        return strPadLeft(value, '0', precision - value.length);
    },
    'f' : function(value, precision) {
        value = Number(value);
        return !isNullOrUndefined(precision) ?
            value.toFixed(precision) :
            value;
    }
}

extend(photon, {
    'string':{
        'padLeft':strPadLeft,
        'padRight':strPadRight,
        'format':strFormat
    }
});