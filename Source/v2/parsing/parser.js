function generateMemberAccessCode(path) {
    var code = 'var c = $scope, u; return ';
    code += enumerable(path).aggregate(function (accumulated, next) {
        if (accumulated !== '') {
            accumulated += ' && ';
        }
        return accumulated + "c && (c=$ctx.has(c, '" + next + "')?c['" + next + "']:u)";
    }, '');
    return code;
}

function memberEvaluator(path) {
    var code = generateMemberAccessCode(path), fn = Function('$scope', '$ctx', code);
    return function (scope) {
        return fn(scope, ctx);
    };
}

function evaluationContext() {
    return {
        has:function (obj, property) {
            return hasProperty(obj, property);
        }
    }
}

var ctx = evaluationContext();

function isType(type) {
    return function (token) {
        return token.type === type;
    }
}

function isText(text) {
    return function (token) {
        return token.text === text;
    }
}

function not(fn) {
    return function (token) {
        return !fn(token);
    }
}

function unquote(text) {
    return text.substring(1, text.length - 1);
}

function makeUnary(fn, right) {
    return function (self, locals) {
        return fn(self, locals, right);
    };
}

function makeBinary(left, fn, right) {
    return function (self, locals) {
        return fn(self, locals, left, right);
    };
}

function chainBinary(lhsEvaluator, readToken, tokenMatch) {
    var result = function() {
        var lhs = lhsEvaluator(), token;
        if (token = readToken(tokenMatch)) {
            lhs = makeBinary(lhs, token.fn, result());
        }
        return lhs;
    }
    return result;
}

var isDot = isText('.'),
    isIdent = isType(TOKEN_IDENTIFIER),
    isString = isType(TOKEN_STRING),
    isNotOpenBrace = not(isText('(')),
    isOpenSquareBracket = isText('['),
    isCloseSquareBracket = isText(']'),
    matchMemberPathStart = [isIdent, isNotOpenBrace],
    matchMemberPathDotIdent = [isDot, isIdent, isNotOpenBrace],
    matchMemberPathIndexer = [isOpenSquareBracket, isString, isCloseSquareBracket];

function parser() {
    function parse(text) {
        var tokens = tokenize(text).where(function (x) {
                return x.type !== TOKEN_WHITESPACE;
            }).toArray(),
            index = 0,
            length = tokens.length;

        function readText(text) {
            if (index < length - 1) {
                var token = tokens[index];
                if (!text || token.text === text) {
                    index++;
                    return token;
                }
            }
            return null;
        }

        function readType(type) {
            var token;
            if (index < length - 1) {
                token = tokens[index];
                if (token.type === type) {
                    index++;
                    return token;
                }
            }
            return null;
        }

        function readPattern(pattern, take) {
            var l = index + pattern.length, result;
            if (l > length) {
                return null;
            }

            for (var i = index, j = 0; i < l; i++, j++) {
                if (!pattern[j](tokens[i])) {
                    return null;
                }
            }

            result = tokens.slice(index, index + take);
            index += take;
            return result;
        }

        function readMemberPath() {
            var matches, path;
            if (matches = readPattern(matchMemberPathStart, 1)) {
                path = [matches[0].text];
                while (true) {
                    if (matches = readPattern(matchMemberPathDotIdent, 2)) {
                        path.push(matches[1].text);
                    } else if (matches = readPattern(matchMemberPathIndexer, 3)) {
                        path.push(unquote(matches[1].text));
                    } else {
                        break;
                    }
                }
                return path;
            }
            return null;
        }

        function expression() {
            return assignment();
        }

        function assignment() {
            var lhs = logicalOR(), rhs, token;
            if (token = readText('=')) {
                if (!lhs.assign) {
                    throw new Error("implies assignment but [" +
                        text.substring(0, token.index) + "] can not be assigned to", token);
                }
                rhs = logicalOR();
                return function (self, locals) {
                    return lhs.assign(self, rhs(self, locals), locals);
                };
            }
            return lhs;
        }

        var logicalAND = chainBinary(
            chainBinary(
                chainBinary(
                    chainBinary(
                        chainBinary(unary, readType, TOKEN_MULTIPLICATIVE),
                        readType, TOKEN_ADDITIVE),
                    readType, TOKEN_RELATIONAL),
                readType, TOKEN_EQUALITY),
            readText, '&&');

        function logicalOR() {
            var lhs = logicalAND(), token;
            while (token = readText('||')) {
                lhs = makeBinary(lhs, token.fn, logicalAND());
            }
            return lhs;
        }

        function unary() {
            var token;
            if (readText('+')) {
                return primary();
            }
            if (token = readText('-')) {
                return makeBinary(ZERO, token.fn, unary());
            }
            if (token = readText('!')) {
                return makeUnary(token.fn, unary());
            }
            return primary();
        }

        function primary() {
            var primary, memberPath = readMemberPath(), token;
            if (memberPath) {
                primary = memberEvaluator(memberPath);
            } else {
                token = readText();
                primary = token.fn;
                if (!primary) {
                    if ((token.type & 32) === 32) {
                        switch (token.type) {
                            case TOKEN_NUMBER:
                                primary = compileConstant(Number(token.text));
                                break;
                            case TOKEN_STRING:
                                primary = compileConstant(unquote(token.text));
                                break;
                        }
                    }
                }

            }
            if (!primary) {
                throw new Error("Invalid expression.")
            }
            return primary;
        }

        return expression();
    }

    return {
        parse:parse
    }
}

photon.parser = parser;