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

    function itShouldEvaluateTo(text, value) {
        it("should evaluate '" + text + "' as '" + value + "'", function() {
            var fn = tokenize(text).first().fn, result = fn();
            if (isNaN(value)) {
                expect(isNaN(result)).toBe(true);
            } else
            {
                expect(result).toBe(value);
            }
        });
    }


    function itShouldTokenizeTo(description, text, tokens) {
        var args = Array.prototype.slice.call(arguments, 2);
        args.unshift(text);
        it(description, function () {
            tokenizeAndExpect.apply(null, args);
        });
    }

    function itShouldTokenizeAndThrow(description, text, message) {
        it(description, function () {
            expect(function() {
                tokenize(text).toArray();
            }).toThrow(message);
        });
    }

    describe('numbers', function () {
        itShouldTokenizeTo('should parse small integers', '1', token('1', tokenize.TOKEN_NUMBER));
        itShouldTokenizeTo('should parse large integers', '12345678910', token('12345678910', tokenize.TOKEN_NUMBER));
        itShouldTokenizeTo('should parse small [number][dot][number] floats', '1.1', token('1.1', tokenize.TOKEN_NUMBER));
        itShouldTokenizeTo('should parse large [number][dot][number] floats', '12345678.87654321', token('12345678.87654321', tokenize.TOKEN_NUMBER));
        itShouldTokenizeTo('should parse small [dot][number] floats', '.1', token('.1', tokenize.TOKEN_NUMBER));
        itShouldTokenizeTo('should parse large [dot][number] floats', '.12345678', token('.12345678', tokenize.TOKEN_NUMBER));
        itShouldTokenizeTo('should parse scientific [number][e-] floats', '34e-10', token('34e-10', tokenize.TOKEN_NUMBER));
        itShouldTokenizeTo('should parse scientific [number][dot][number][e-] floats', '34.4e-10', token('34.4e-10', tokenize.TOKEN_NUMBER));
        itShouldTokenizeTo('should parse scientific [number][e+] floats', '34.4e+10', token('34.4e+10', tokenize.TOKEN_NUMBER));
        itShouldTokenizeTo('should parse scientific [number][dot][number][e+] floats', '34.4e+10', token('34.4e+10', tokenize.TOKEN_NUMBER));
        itShouldTokenizeTo('should parse NaN', 'NaN', token('NaN', tokenize.TOKEN_NUMBER));
        itShouldEvaluateTo('NaN', NaN);
    });

    describe('strings', function () {
        describe('that are \'"\' Delimited', function () {
            itShouldTokenizeTo('should parse empty', '""', token('""', tokenize.TOKEN_STRING));
            itShouldTokenizeTo('should parse words', '"Test"', token('"Test"', tokenize.TOKEN_STRING));
            itShouldTokenizeTo('should parse escaped', '"a\\rb\\nc\\td\\""', token('"a\\rb\\nc\\td\\""', tokenize.TOKEN_STRING));
            itShouldTokenizeTo('should parse containing white space', '"White Space"', token('"White Space"', tokenize.TOKEN_STRING));
            itShouldTokenizeTo('should parse containing punctuation', '"Contains, Punctuation"', token('"Contains, Punctuation"', tokenize.TOKEN_STRING));
            itShouldTokenizeAndThrow("if single unterminated should throw", "'unterminated", "INVALID TOKEN: Unterminated string detected at (0).");
            itShouldTokenizeAndThrow("if flow of unterminated should throw", "'terminated''unterminated", "INVALID TOKEN: Unterminated string detected at (12).");
        });

        describe('that are "\'" Delimited', function () {
            itShouldTokenizeTo('should parse empty', "''", token("''", tokenize.TOKEN_STRING));
            itShouldTokenizeTo('should parse words', "'Test'", token("'Test'", tokenize.TOKEN_STRING));
            itShouldTokenizeTo('should parse escaped',"'a\\rb\\nc\\td\\''", token("'a\\rb\\nc\\td\\''", tokenize.TOKEN_STRING));
            itShouldTokenizeTo('should parse containing white space', "'White Space'", token("'White Space'", tokenize.TOKEN_STRING));
            itShouldTokenizeTo('should parse containing punctuation', "'Contains, Punctuation'", token("'Contains, Punctuation'", tokenize.TOKEN_STRING));
            itShouldTokenizeAndThrow("if single unterminated should throw", '"unterminated', "INVALID TOKEN: Unterminated string detected at (0).");
            itShouldTokenizeAndThrow("if flow of unterminated should throw", '"terminated""unterminated', "INVALID TOKEN: Unterminated string detected at (12).");
        });
    });

    describe('booleans', function () {
        itShouldTokenizeTo('should parse true', 'true', token('true', tokenize.TOKEN_BOOLEAN));
        itShouldTokenizeTo('should parse false', 'false', token('false', tokenize.TOKEN_BOOLEAN));
        itShouldEvaluateTo('true', true);
        itShouldEvaluateTo('false', false);

    });

    describe('nulls', function () {
        itShouldTokenizeTo('should parse null', 'null', token('null', tokenize.TOKEN_NULL));
        itShouldEvaluateTo('null', null);
    });

    describe('undefined', function () {
        itShouldTokenizeTo('should parse undefined', 'undefined', token('undefined', tokenize.TOKEN_UNDEFINED));
        itShouldEvaluateTo('undefined', undefined);
    });

    describe('identifier', function () {
        itShouldTokenizeTo('should parse alpha', 'alpha', token('alpha', tokenize.TOKEN_IDENTIFIER));
        itShouldTokenizeTo('should parse alpha_numeric', 'alpha123beta', token('alpha123beta', tokenize.TOKEN_IDENTIFIER));
        itShouldTokenizeTo('should parse $ prefix', '$test', token('$test', tokenize.TOKEN_IDENTIFIER));
        itShouldTokenizeTo('should parse _ prefix', '_test', token('_test', tokenize.TOKEN_IDENTIFIER));
    });

    describe('operators', function () {
        itShouldTokenizeTo('should parse +', '+', token('+', tokenize.TOKEN_ADDITIVE));
        itShouldTokenizeTo('should parse -', '-', token('-', tokenize.TOKEN_ADDITIVE));

        itShouldTokenizeTo('should parse ||', '||', token('||', tokenize.TOKEN_OPERATOR));
        itShouldTokenizeTo('should parse &&', '&&', token('&&', tokenize.TOKEN_OPERATOR));
        itShouldTokenizeTo('should parse |', '|', token('|', tokenize.TOKEN_OPERATOR));
        itShouldTokenizeTo('should parse &', '&', token('&', tokenize.TOKEN_OPERATOR));
        itShouldTokenizeTo('should parse ^', '^', token('^', tokenize.TOKEN_OPERATOR));
        itShouldTokenizeTo('should parse =', '=', token('=', tokenize.TOKEN_OPERATOR));

        itShouldTokenizeTo('should parse /', '/', token('/', tokenize.TOKEN_MULTIPLICATIVE));
        itShouldTokenizeTo('should parse *', '*', token('*', tokenize.TOKEN_MULTIPLICATIVE));
        itShouldTokenizeTo('should parse %', '%', token('%', tokenize.TOKEN_MULTIPLICATIVE));

        itShouldTokenizeTo('should parse ===', '===', token('===', tokenize.TOKEN_EQUALITY));
        itShouldTokenizeTo('should parse ==', '==', token('==', tokenize.TOKEN_EQUALITY));
        itShouldTokenizeTo('should parse !==', '!==', token('!==', tokenize.TOKEN_EQUALITY));
        itShouldTokenizeTo('should parse !=', '!=', token('!=', tokenize.TOKEN_EQUALITY));

        itShouldTokenizeTo('should parse >=', '>=', token('>=', tokenize.TOKEN_RELATIONAL));
        itShouldTokenizeTo('should parse >', '>', token('>', tokenize.TOKEN_RELATIONAL));
        itShouldTokenizeTo('should parse <=', '<=', token('<=', tokenize.TOKEN_RELATIONAL));
        itShouldTokenizeTo('should parse <', '<', token('<', tokenize.TOKEN_RELATIONAL));
    });

    describe('groups', function() {
        itShouldTokenizeTo('should parse (', '(', token('(', tokenize.TOKEN_GROUP));
        itShouldTokenizeTo('should parse )', ')', token(')', tokenize.TOKEN_GROUP));
        itShouldTokenizeTo('should parse {', '{', token('{', tokenize.TOKEN_GROUP));
        itShouldTokenizeTo('should parse }', '}', token('}', tokenize.TOKEN_GROUP));
        itShouldTokenizeTo('should parse [', '[', token('[', tokenize.TOKEN_GROUP));
        itShouldTokenizeTo('should parse ]', ']', token(']', tokenize.TOKEN_GROUP));
    });

    describe('delimiters', function() {
        itShouldTokenizeTo('should parse .', '.', token('.', tokenize.TOKEN_DELIMITER));
        itShouldTokenizeTo('should parse :', ':', token(':', tokenize.TOKEN_DELIMITER));
        itShouldTokenizeTo('should parse ,', ',', token(',', tokenize.TOKEN_DELIMITER));
        itShouldTokenizeTo('should parse ;', ';', token(';', tokenize.TOKEN_DELIMITER));
    });

    describe('expressions', function() {
        itShouldTokenizeTo('should parse expression (1+2-3/4*5%7)', '1+2-3/4*5%6',
            token('1', tokenize.TOKEN_NUMBER),
            token('+', tokenize.TOKEN_ADDITIVE, 1),
            token('2', tokenize.TOKEN_NUMBER, 2),
            token('-', tokenize.TOKEN_ADDITIVE, 3),
            token('3', tokenize.TOKEN_NUMBER, 4),
            token('/', tokenize.TOKEN_MULTIPLICATIVE, 5),
            token('4', tokenize.TOKEN_NUMBER, 6),
            token('*', tokenize.TOKEN_MULTIPLICATIVE, 7),
            token('5', tokenize.TOKEN_NUMBER, 8),
            token('%', tokenize.TOKEN_MULTIPLICATIVE, 9),
            token('6', tokenize.TOKEN_NUMBER, 10)
        );
        itShouldTokenizeTo('should parse expression (a&&b||c)', 'a&&b||c',
            token('a', tokenize.TOKEN_IDENTIFIER),
            token('&&', tokenize.TOKEN_OPERATOR, 1),
            token('b', tokenize.TOKEN_IDENTIFIER, 3),
            token('||', tokenize.TOKEN_OPERATOR, 4),
            token('c', tokenize.TOKEN_IDENTIFIER, 6)
        );
        itShouldTokenizeTo('should parse expression (a===b)', 'a===b',
            token('a', tokenize.TOKEN_IDENTIFIER),
            token('===', tokenize.TOKEN_EQUALITY, 1),
            token('b', tokenize.TOKEN_IDENTIFIER, 4)
        );
        itShouldTokenizeTo('should parse expression (a==b)', 'a==b',
            token('a', tokenize.TOKEN_IDENTIFIER),
            token('==', tokenize.TOKEN_EQUALITY, 1),
            token('b', tokenize.TOKEN_IDENTIFIER, 3)
        );
        itShouldTokenizeTo('should parse expression (a!==b)', 'a!==b',
            token('a', tokenize.TOKEN_IDENTIFIER),
            token('!==', tokenize.TOKEN_EQUALITY, 1),
            token('b', tokenize.TOKEN_IDENTIFIER, 4)
        );
        itShouldTokenizeTo('should parse expression (a&b)', 'a&b',
            token('a', tokenize.TOKEN_IDENTIFIER),
            token('&', tokenize.TOKEN_OPERATOR, 1),
            token('b', tokenize.TOKEN_IDENTIFIER, 2)
        );
        itShouldTokenizeTo('should parse expression (a^b)', 'a^b',
            token('a', tokenize.TOKEN_IDENTIFIER),
            token('^', tokenize.TOKEN_OPERATOR, 1),
            token('b', tokenize.TOKEN_IDENTIFIER, 2)
        );
        itShouldTokenizeTo('should parse expression (a.b.c)', 'a.b.c',
            token('a', tokenize.TOKEN_IDENTIFIER),
            token('.', tokenize.TOKEN_DELIMITER, 1),
            token('b', tokenize.TOKEN_IDENTIFIER, 2),
            token('.', tokenize.TOKEN_DELIMITER, 3),
            token('c', tokenize.TOKEN_IDENTIFIER, 4)
        );
        itShouldTokenizeTo('should parse expression (a.b["c"])', 'a.b["c"]',
            token('a', tokenize.TOKEN_IDENTIFIER),
            token('.', tokenize.TOKEN_DELIMITER, 1),
            token('b', tokenize.TOKEN_IDENTIFIER, 2),
            token('[', tokenize.TOKEN_GROUP, 3),
            token('"c"', tokenize.TOKEN_STRING, 4),
            token(']', tokenize.TOKEN_GROUP, 7)
        );
    });
});