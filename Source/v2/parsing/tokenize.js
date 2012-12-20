var TOKEN_EOF = -1,
    TOKEN_KEYWORD = 2,
    TOKEN_IDENTIFIER = 3,
    TOKEN_GROUP = 4,
    TOKEN_OPERATOR = 16,
    TOKEN_EQUALITY = 17,
    TOKEN_RELATIONAL = 18,
    TOKEN_MULTIPLICATIVE = 19,
    TOKEN_ADDITIVE = 20,
    TOKEN_STRING = 32,
    TOKEN_NUMBER = 33,
    TOKEN_BOOLEAN = 34,
    TOKEN_NULL = 35,
    TOKEN_UNDEFINED = 36,
    TOKEN_DELIMITER = 64,
    TOKEN_WHITESPACE = 128,
    ZERO;

var tokenInfoMap_ = {},
    tokenizeRegex;

function compileBinary(tokenText) {
    return Function('s', 'l', 'x', 'y', 'return x(s, l)' + tokenText + 'y(s, l);');
}

function compileConstant(value) {
    var result = function () {
        return value;
    };
    result.isPrimitive = isPrimitive(value);
    return result;
}

(function () {
    ZERO = compileConstant(0);

    var expressionSets = [];

    function regexEscape(token) {
        return enumerable(token).select(function (c) {
            return '\\[]{}().+*^|'.indexOf(c) !== -1 ? '\\' + c : c;
        }).toArray().join('');
    }

    function defineTokens(expressions, type, isPattern, compiler) {
        if (!isPattern) {
            expressions.forEach(function (expression, index) {
                tokenInfoMap_[expression] = {
                    type:type,
                    fn:compiler && (isFunction(compiler) ? compiler(expression) : compiler[index])
                };
            });

            expressions = expressions.map(regexEscape);
        }

        expressionSets.push(expressions);
    }

    function compileTokens() {
        var text = enumerable(expressionSets).select(function (tokenSet) {
            return tokenSet.join('|');
        }).aggregate(function (accumulator, next) {
            return (accumulator ? accumulator + '|(' : '(') + next + ')';
        }, '');
        return new RegExp(text, 'gi');

    }

    defineTokens('\\s,\\r,\\t,\\n, '.split(','), TOKEN_WHITESPACE, false);
    defineTokens('=== == !== !='.split(' '), TOKEN_EQUALITY, false, compileBinary);
    defineTokens('<= < >= >'.split(' '), TOKEN_RELATIONAL, false, compileBinary);
    defineTokens('* % /'.split(' '), TOKEN_MULTIPLICATIVE, false, compileBinary);
    defineTokens('+ -'.split(' '), TOKEN_ADDITIVE, false, compileBinary);
    defineTokens('&& || = <<= << >>= & | ^'.split(' '), TOKEN_OPERATOR, false, compileBinary);
    defineTokens('()[]{}'.split(''), TOKEN_GROUP, false);
    defineTokens(['"([^\\\\"]*(\\\\[rtn"])?)*"', "'([^\\\\']*(\\\\[rtn'])?)*'"], TOKEN_STRING, true);
    defineTokens(['[-+]?[0-9]*[.]?[0-9]+([eE][-+]?[0-9]+)?'], TOKEN_NUMBER, true);
    defineTokens(['NaN'], TOKEN_NUMBER, false, [compileConstant(NaN)]);
    defineTokens(['true', 'false'], TOKEN_BOOLEAN, false, [compileConstant(true), compileConstant(false)]);
    defineTokens(['null'], TOKEN_NULL, false, [compileConstant(null)]);
    defineTokens(['undefined'], TOKEN_UNDEFINED, false, [noop]);
    defineTokens(['[a-z_$]{1}[\\da-z_]*'], TOKEN_IDENTIFIER, true);
    defineTokens('typeof in'.split(' '), TOKEN_KEYWORD, false);
    defineTokens('.:,;'.split(''), TOKEN_DELIMITER, false);

    tokenizeRegex = compileTokens();
})();

function tokenize(text, skipWhitespace) {
    var nextTokenIndex = 0;

    function createToken(type, text, index, fn) {
        return {
            type:type,
            text:text,
            index:index,
            fn:fn
        };
    }

    function checkIndex(index) {
        if (nextTokenIndex !== index) {
            var err = 'at (', c = text.charAt(nextTokenIndex);
            if (c === '"' || c === "'") {
                err = 'Unterminated string detected ' + err;
            }
            throw new Error('INVALID TOKEN: ' + err + nextTokenIndex + ').');
        }
    }

    function nextToken(match) {
        var tokenType, tokenText, entry, index;

        if (match) {
            tokenText = match[0];
            tokenType = (match[8] && TOKEN_STRING) || (match[1] && TOKEN_WHITESPACE) ||
                (match[19] && TOKEN_IDENTIFIER) || (match[13] && TOKEN_NUMBER);
            checkIndex(index = match.index);
            nextTokenIndex += tokenText.length;
        } else {
            checkIndex(index = text.length);
            tokenType = TOKEN_EOF;
        }

        // match based on group
        if (tokenType) {
            return createToken(tokenType, tokenText, index, null);
        }

        // lookup entry
        entry = tokenInfoMap_[tokenText];
        return createToken(entry.type, tokenText, index, entry.fn);
    }

    var result = new Enumerable(function() {
        var controller = enumerator(), index = 0, restoreLastIndex;
        return exportEnumerator(function () {
                var match, result;
                if (index === text.length) {
                    return index = -1, controller.progress(nextToken(null));
                }
                if (index === -1) {
                    return false;
                }
                restoreLastIndex = tokenizeRegex.lastIndex, tokenizeRegex.lastIndex = index;
                result = (match = tokenizeRegex.exec(text)) ?
                    controller.progress(nextToken(match)) :
                    controller.end();
                index = tokenizeRegex.lastIndex, tokenizeRegex.lastIndex = restoreLastIndex;
                return result;

            },
            controller.current
        )
    });

    if (skipWhitespace) {
        result = result.where(function(x) {
            return x.type !== TOKEN_WHITESPACE;
        });
    }

    return result;
}