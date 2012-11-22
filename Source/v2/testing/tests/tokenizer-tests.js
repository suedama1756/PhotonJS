describe('tokenize -', function () {
    var tokenize = photon.tokenize;

    function tokenizeText(text) {
        return tokenize(text).select(function (x) {
            delete x['fn'];
            return x;
        }).where(function (x) {
                return x.type !== tokenize.TOKEN_EOF;
            }).toArray();
    }

    function token(text, type, index) {
        return {
            text:text,
            type:type,
            index:index || 0
        }
    }

    function tokenizeAndExpect(text, expected) {
        var actual = tokenizeText(text);
        actual.slice(0, actual.length - 2);
        expect(actual).toEqual(Array.prototype.slice.call(arguments, 1));
    }

    function itShouldTokenizeTo(description, text, tokens) {
        var args = Array.prototype.slice.call(arguments, 2);
        args.unshift(text);
        it(description, function () {
            tokenizeAndExpect.apply(null, args);
        });
    }

    describe('numbers', function () {
        it("should parse integers", function () {
            tokenizeAndExpect('1', token('1', tokenize.TOKEN_NUMBER));
            tokenizeAndExpect('123456', token('123456', tokenize.TOKEN_NUMBER));
        });

        it("should parse floats", function () {
            tokenizeAndExpect('1.1', token('1.1', tokenize.TOKEN_NUMBER));
            tokenizeAndExpect('12345.1', token('12345.1', tokenize.TOKEN_NUMBER));
            tokenizeAndExpect('.1', token('.1', tokenize.TOKEN_NUMBER));
            tokenizeAndExpect('.12345', token('.12345', tokenize.TOKEN_NUMBER));
            tokenizeAndExpect('12345.12345', token('12345.12345', tokenize.TOKEN_NUMBER));
        });
    });

    describe('strings', function () {
        describe('that are \'"\' Delimited', function () {
            it("should parse empty", function () {
                tokenizeAndExpect('""', token('""', tokenize.TOKEN_STRING));
            });

            it("should parse words", function () {
                tokenizeAndExpect('"Test"', token('"Test"', tokenize.TOKEN_STRING));
            });


            it("should parse escaped", function () {
                tokenizeAndExpect('"a\\rb\\nc\\td\\""', token('"a\\rb\\nc\\td\\""', tokenize.TOKEN_STRING));
            });

            it("should parse containing white space", function () {
                tokenizeAndExpect('"White Space"', token('"White Space"', tokenize.TOKEN_STRING));
            });

            it("should parse containing punctuation", function () {
                tokenizeAndExpect('"Contains, Punctuation."', token('"Contains, Punctuation."', tokenize.TOKEN_STRING));
            });
        });

        describe('that are "\'" Delimited', function () {
            it("should parse empty", function () {
                tokenizeAndExpect("''", token("''", tokenize.TOKEN_STRING));
            });

            it("should parse words", function () {
                tokenizeAndExpect("'Test'", token("'Test'", tokenize.TOKEN_STRING));
            });


            it("should parse escaped", function () {
                tokenizeAndExpect("'a\\rb\\nc\\td\\''", token("'a\\rb\\nc\\td\\''", tokenize.TOKEN_STRING));
            });

            it("should parse containing white space", function () {
                tokenizeAndExpect("'White Space'", token("'White Space'", tokenize.TOKEN_STRING));
            });

            it("should parse containing punctuation", function () {
                tokenizeAndExpect("'Contains, Punctuation.'", token("'Contains, Punctuation.'", tokenize.TOKEN_STRING));
            });
        });
    });

    describe('booleans', function () {
        itShouldTokenizeTo('should parse true', 'true', token('true', tokenize.TOKEN_BOOLEAN));
        itShouldTokenizeTo('should parse false', 'false', token('false', tokenize.TOKEN_BOOLEAN));

    });

    describe('identifier', function () {
        itShouldTokenizeTo('should parse alpha', 'alpha', token('alpha', tokenize.TOKEN_IDENTIFIER));
        itShouldTokenizeTo('should parse alpha_numeric', 'alpha123beta', token('alpha123beta', tokenize.TOKEN_IDENTIFIER));
        itShouldTokenizeTo('should parse $ prefix', '$test', token('$test', tokenize.TOKEN_IDENTIFIER));
        itShouldTokenizeTo('should parse _ prefix', '_test', token('_test', tokenize.TOKEN_IDENTIFIER));
    });

    describe('operators_', function () {
        itShouldTokenizeTo('should parse +', '+', token('+', tokenize.TOKEN_OPERATOR));
        itShouldTokenizeTo('should parse -', '-', token('-', tokenize.TOKEN_OPERATOR));
        itShouldTokenizeTo('should parse /', '/', token('/', tokenize.TOKEN_OPERATOR));
        itShouldTokenizeTo('should parse *', '*', token('*', tokenize.TOKEN_OPERATOR));
        itShouldTokenizeTo('should parse %', '%', token('%', tokenize.TOKEN_OPERATOR));
        itShouldTokenizeTo('should parse ===', '===', token('===', tokenize.TOKEN_OPERATOR));
        itShouldTokenizeTo('should parse ==', '==', token('==', tokenize.TOKEN_OPERATOR));
        itShouldTokenizeTo('should parse =', '=', token('=', tokenize.TOKEN_OPERATOR));
        itShouldTokenizeTo('should parse !==', '!==', token('!==', tokenize.TOKEN_OPERATOR));
        itShouldTokenizeTo('should parse !=', '!=', token('!=', tokenize.TOKEN_OPERATOR));
        itShouldTokenizeTo('should parse !=', '!=', token('!=', tokenize.TOKEN_OPERATOR));
        itShouldTokenizeTo('should parse ==', '==', token('==', tokenize.TOKEN_OPERATOR));
        itShouldTokenizeTo('should parse =', '=', token('=', tokenize.TOKEN_OPERATOR));
        itShouldTokenizeTo('should parse !==', '!==', token('!==', tokenize.TOKEN_OPERATOR));
        itShouldTokenizeTo('should parse !=', '!=', token('!=', tokenize.TOKEN_OPERATOR));
        itShouldTokenizeTo('should parse !=', '!=', token('!=', tokenize.TOKEN_OPERATOR));
    });
});