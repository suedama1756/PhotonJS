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


var ctx = evaluationContext();


function parser() {
    function parse(text) {
        var tokens = tokenize(text).where(function (x) {
                return x.type !== TOKEN_WHITESPACE;
            }).toArray(),
            index = 0,
            length = tokens.length;

        function peek(e1, e2, e3, e4) {
            if (index < length - 1) {
                var token = tokens[index];
                var t = token.text;
                if (t == e1 || t == e2 || t == e3 || t == e4 ||
                    (!e1 && !e2 && !e3 && !e4)) {
                    return token;
                }
            }
            return false;
        }

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


        var isDot = isText('.'),
            isIdent = isType(TOKEN_IDENTIFIER),
            notIsOpenBrace = not(isText('(')),
            isOpenSquareBracket = isText('['),
            isCloseSquareBracket = isText(']'),
            isString = isType(TOKEN_STRING);


        function match(matches, consume) {
            var l = index + matches.length;
            if (l > length) {
                return false;
            }

            for (var i = index, j = 0; i < l; i++, j++) {
                if (!matches[j](tokens[i])) {
                    return false;
                }
            }
            return take(consume || matches.length);
        }


        function take(amount) {
            var result = tokens.slice(index, index + amount);
            index += amount;
            return result;
        }

        function unquote(text) {
            return text.substring(1, text.length - 1);
        }

        function readMemberPath() {
            var matches, path;
            if (matches = match([isIdent, notIsOpenBrace], 1)) {
                path = [matches[0].text];
                while (true) {
                    if (matches = match([isDot, isIdent, notIsOpenBrace], 2)) {
                        path.push(matches[1].text);
                    } else if (matches = match([isOpenSquareBracket, isString, isCloseSquareBracket])) {
                        path.push(unquote(matches[1].text));
                    } else {
                        break;
                    }
                }
                return path;
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

        function readText(e1, e2, e3, e4) {
            var token = peek(e1, e2, e3, e4);
            if (token) {
                index++;
                return token;
            }
            return false;
        }

        function consume(e1) {
            if (!readText(e1)) {
                throw new Error("is unexpected, expecting [" + e1 + "]");
            }
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

        function logicalOR() {
            var lhs = logicalAND(), token;
            while (true) {
                if (token = readText('||')) {
                    lhs = binaryFn(lhs, token.fn, logicalAND());
                } else {
                    return lhs;
                }
            }
        }

        function logicalAND() {
            var lhs = equality(), token;
            if (token = readText('&&')) {
                lhs = binaryFn(lhs, token.fn, logicalAND());
            }
            return lhs;
        }

        function equality() {
            var lhs = relational(), token;
            if (token = readType(TOKEN_EQUALITY)) {
                lhs = binaryFn(lhs, token.fn, equality());
            }
            return lhs;
        }

        function relational() {
            var lhs = additive(), token;
            if (token = readType(TOKEN_RELATIONAL)) {
                lhs = binaryFn(lhs, token.fn, relational());
            }
            return lhs;
        }

        function additive() {
            var lhs = multiplicative(), token;
            while (token = readType(TOKEN_ADDITIVE)) {
                lhs = binaryFn(lhs, token.fn, multiplicative());
            }
            return lhs;
        }

        function multiplicative() {
            var lhs = unary(), token;
            while (token = readType(TOKEN_MULTIPLICATIVE)) {
                lhs = binaryFn(lhs, token.fn, unary());
            }
            return lhs;
        }

        function unary() {
            var token;
            if (readText('+')) {
                return primary();
            }
            if (token = readText('-')) {
                return binaryFn(ZERO, token.fn, unary());
            }
            if (token = readText('!')) {
                return unaryFn(token.fn, unary());
            }
            return primary();
        }

        function unaryFn(fn, right) {
            return function (self, locals) {
                return fn(self, locals, right);
            };
        }

        function binaryFn(left, fn, right) {
            return function (self, locals) {
                return fn(self, locals, left, right);
            };
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