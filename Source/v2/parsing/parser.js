function generateMemberAccessCode(path) {
    var code = 'var c = $scope, u;';
    code += enumerable(path).aggregate(function (accumulated, next) {
        return accumulated + " if ($ctx.isNullOrUndefined(c)) return u; c=c['" + next + "'];";
    }, '') + ' return c';
    return code;
}

function member(path, contextFn) {
    if (path && path.length) {
        var code = generateMemberAccessCode(path), fn = Function('$scope', '$ctx', code);
        return contextFn ? function (self) {
            return fn(contextFn(self), ctx);
        } : function (self) {
            return fn(self, ctx);
        };
    }
    return null;
}

function evaluationContext() {
    return {
        has:function (obj, property) {
            return hasProperty(obj, property);
        },
        isNullOrUndefined:function (obj) {
            return isNullOrUndefined(obj);
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
    var result = function () {
        var lhs = lhsEvaluator(), token;
        if (token = readToken(tokenMatch)) {
            lhs = makeBinary(lhs, token.fn, result());
        }
        return lhs;
    }
    return result;
}

var isString = isType(TOKEN_STRING),
    isOpenSquareBracket = isText('['),
    isCloseSquareBracket = isText(']'),
    matchMemberPathIndexer = [isOpenSquareBracket, isString, isCloseSquareBracket];

function parser() {
    function parse(text) {
        var tokens = tokenize(text).where(function (x) {
                return x.type !== TOKEN_WHITESPACE;
            }).toArray(),
            index = 0,
            length = tokens.length;

        function peekText(text) {
            if (index < length - 1) {
                var token = tokens[index];
                if (!text || token.text === text) {
                    return token;
                }
            }
            return null;
        }

        function peekType(type) {
            if (index < length - 1) {
                var token = tokens[index];
                if (!type || token.type === type) {
                    return token;
                }
            }
            return null;
        }

        function makeError(message) {
            return extend(new Error(strFormat("Parser error: {0} at position ({1}).", message, index)), {
                line:0, column:index
            });
        }

        function expectText(text) {
            var token, found;
            if (!(token = readText(text))) {
                token = tokens[index];
                throw makeError(strFormat("expected token '{0}', but found '{1}'", text, (token && token.text) || 'EOF'));
            }
            return token;
        }

        function expectType(type) {
            var token;
            if (!(token = readType(type))) {
                throw new Error('Unexpected token');
            }
            return token;
        }

        function readText(text) {
            var token = peekText(text);
            if (token) {
                index++;
            }
            return token;
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

        function readPattern(pattern, acceptIndex, moveBy) {
            var l = index + pattern.length, result;
            if (l > length) {
                return null;
            }

            for (var i = index, j = 0; i < l; i++, j++) {
                if (!pattern[j](tokens[i])) {
                    return null;
                }
            }

            result = tokens[index + acceptIndex];
            index += moveBy;
            return result;
        }

        function readMemberChain(getContext) {
            var token, path, result = getContext;
            if (token = readType(TOKEN_IDENTIFIER) || (getContext && readPattern(matchMemberPathIndexer, 1, 3))) {
                path = [token.text];
                while (true) {
                    if (readText('.') || peekText('[')) {
                        token = readType(TOKEN_IDENTIFIER) || readPattern(matchMemberPathIndexer, 1, 3);
                        if (!token) {
                            throw new Error();
                        }
                        path.push(token.type === TOKEN_STRING ?
                            unquote(token.text) :
                            token.text);
                    } else if (readText('(')) {
                        var getFn = result;
                        if (path.length) {
                            getContext = result;
                            if (path.length > 1) {
                                result = member(path.slice(0, path.length - 1), result);
                                getContext = result;
                            }
                            getFn = member(path.slice(path.length - 1), result);
                        }
                        result = functionCall(getFn, getContext);
                        getContext = function () {
                            return window;
                        };
                        path = [];
                    } else {
                        // member path has ended
                        break;
                    }
                }
            }

            // consume anything left in the path
            if (path && path.length) {
                result = member(path, result);
            }

            return result;
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

        function functionCall(getFn, getContextFn) {
            var argEvaluators = [];
            if (!peekText(')')) {
                do {
                    argEvaluators.push(expression());
                } while (readText(','));
            }
            expectText(')');
            return function (self, locals) {
                var args = [],
                    context = getContextFn ? getContextFn(self, locals) : self;

                for (var i = 0; i < argEvaluators.length; i++) {
                    args.push(argEvaluators[i](self, locals));
                }
                var fn = getFn(self, locals) || noop;
                if (fn.apply) {
                    return fn.apply(context, args);
                }
                // TODO: Must test IE "callable workaround", added from memory, should probably pull out into utility fn
                args.unshift(context);
                return functionPrototype.apply.call(fn, args);
            };
        }

        function array() {
            var elements = [];
            if (!peekText(']')) {
                do {
                    elements.push(expression());
                } while (readText(','));
            }

            return function (self, locals) {
                return elements.map(function (e) {
                    return e(self, locals);
                });
            }
        }

        function primary() {
            var primary, token;

            primary = readMemberChain();
            if (!primary) {
                if (readText('(')) {
                    primary = expression();
                    expectText(')');
                } else if (readText('[')) {
                    primary = array();
                    expectText(']');
                }
            }

            if (!primary) {
                token = readText();
                primary = token.fn;
                if (!primary) {
                    if ((token.type & 32) === 32) {
                        switch (token.type) {
                            case TOKEN_NUMBER:
                                primary = compileConstant(Number(token.text));
                                break;
                            case TOKEN_IDENTIFIER:
                                primary = member([readType(TOKEN_IDENTIFIER)]);
                                break;
                            case TOKEN_STRING:
                                primary = compileConstant(unquote(token.text));
                                break;
                        }
                    }
                }

                if (peekText('.') || peekText('[')) {
                    readText('.');
                    primary = readMemberChain(primary);
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