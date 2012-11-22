var TOKEN_EOF = -1,
    TOKEN_OPERATOR = 1,
    TOKEN_KEYWORD = 4,
    TOKEN_IDENTIFIER = 8,
    TOKEN_GROUP = 16,
    TOKEN_STRING = 32,
    TOKEN_NUMBER = 33,
    TOKEN_BOOLEAN = 34,
    TOKEN_NULL = 35,
    TOKEN_DELIMITER = 64,
    TOKEN_WHITESPACE = 128,
    ZERO;

var tokenTextToTypeMap_ = {},
    tokenTextToFnMap_ = {},
    tokenizeRegex;

function compileBinary(tokenText) {
    return Function('s', 'l', 'x', 'y', 'return x(s, l)' + tokenText + 'y(s, l);');
}

function compileConstant(value) {
    return function () {
        return value;
    }
}

(function() {
    var expressionSets = [];

    function regexEscape(token) {
        return enumerable(token).select(function (c) {
            return '\\[]{}().+*^'.indexOf(c) !== -1 ? '\\' + c : c;
        }).toArray().join('');
    }

    function defineTokens(expressions, type, isPattern, compiler) {
        if (!isPattern) {
            expressions.forEach(function (expression, index) {
                tokenTextToTypeMap_[expression] = type;
                if (compiler) {
                    tokenTextToFnMap_[expression] = isFunction(compiler) ? compiler(expression) : compiler[index];
                }
            });

            expressions = expressions.map(regexEscape);
        }

        expressionSets.push(expressions);
    }

    function compileTokens() {
        var text = enumerable(expressionSets).select(function (tokenSet) {
            return tokenSet.join('|');
        }).aggregate(function (accumulator, next) {
                if (accumulator) {
                    accumulator += '|';
                }
                return accumulator + '(' + next + '){1}';
            }, '');
        return new RegExp(text, 'gi');

    }

    ZERO = compileConstant(0);

    defineTokens('\\s,\\r,\\t,\\n, '.split(','), TOKEN_WHITESPACE, false);
    defineTokens('+ - * % / === == = !== != <<= << <= < >>= >= > &' .split(' '), TOKEN_OPERATOR, false, compileBinary);
    defineTokens(['()[]{}'.split('')], TOKEN_GROUP, false);
    defineTokens(['"([^\\\\"]*(\\\\[rtn"])?)*"', "'([^\\\\']*(\\\\[rtn'])?)*'"], TOKEN_STRING, true);
    defineTokens(['([-+]?[0-9]*[.]?[0-9]+([eE][-+]?[0-9]+)?)'], TOKEN_NUMBER, true);
    defineTokens(['true', 'false'], TOKEN_BOOLEAN, false, [compileConstant(true), compileConstant(false)]);
    defineTokens(['null'], TOKEN_NULL, false, [compileConstant(null)]);
    defineTokens('typeof in'.split(' '), TOKEN_KEYWORD, false);
    defineTokens(['[a-z_$]{1}[\\da-z_]*'], TOKEN_IDENTIFIER, true);
    defineTokens(['.', ':', ','], TOKEN_DELIMITER, true);

    tokenizeRegex = compileTokens();
})();

function tokenize(text) {
    function isWhiteSpace(value) {
        return !/[^\t\n\r ]/.test(value);
    }

    function getTokenType(text) {
        var tokenType = tokenTextToTypeMap_[text];
        if (tokenType) {
            return tokenType;
        }
        if (isWhiteSpace(text)) {
            return TOKEN_WHITESPACE;
        }
        if ('"\''.indexOf(text.charAt(0)) !== -1) {
            return TOKEN_STRING;
        }
        if (!isNaN(Number(text))) {
            return TOKEN_NUMBER;
        }
        return TOKEN_IDENTIFIER;
    }

    function makeToken(text, index) {
        var type = text ? getTokenType(text) : TOKEN_EOF;
        return {
            text:text,
            index:index,
            fn:tokenTextToFnMap_[text],
            type:type
        };
    }

    return enumerable.regexExec(tokenizeRegex, text, 0).select(function (x) {
        return makeToken(x[0], x.index);
    }).concat([makeToken(null, text.length)]);
}