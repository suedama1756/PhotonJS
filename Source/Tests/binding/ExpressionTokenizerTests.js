photon.binding.ExpressionTokenizer.Tests = TestCase("photon.binding.ExpressionTokenizer.Tests",
    {
        tokenize:function (expression) {
            var tokenizer = new photon.binding.ExpressionTokenizer(expression);
            var result = [];
            for (var token = tokenizer.nextToken(); token; token = tokenizer.nextToken()) {
                result.push(token);
            }
            return result;
        },
        "test: should tokenize symbols":function () {
            var symbols = ["{", "}", "(", ")", ",", ".", ":", ";", "[", "]"];
            for (var i = 0; i < symbols.length; i++) {
                var tokens = this.tokenize(" " + symbols[i] + " ");
                assertEquals("Failed to parse symbol " + symbols[i], [" ", symbols[i], " "], tokens);
            }
        },
        "test: should tokenize single quoted strings":function () {
            assertEquals(["'One'", " ", "'Two'"], this.tokenize("'One' 'Two'"));
        },
        "test: should tokenize strings with escaped quotes":function () {
            assertEquals(["'Isn\\\'t'", " ", "'Is'"], this.tokenize('\'Isn\\\'t\' \'Is\''));
            assertEquals(["\"\\\"Quoted as saying\\\"\""], this.tokenize("\"\\\"Quoted as saying\\\"\""));
        },
        "test: should throw on unterminated string":function () {
            var self = this;
            assertException(function () {
                self.tokenize("'Unterminated string");
            }, new Error("Syntax error, unterminated string literal."));
        },
        "test: should tokenize empty string":function () {
            assertEquals(0, this.tokenize("").length);
        },
        "test: should tokenize expressions":function () {
            assertEquals([
                "this", ".", "test = function", "(", ")", " ", "{", " return ", "{",
                " property1 ", ":", " 0", ",", " property2 ", ":", " ", "'Two'", " ", "}", ";", " ", "}"],
                this.tokenize("this.test = function() { return { property1 : 0, property2 : 'Two' }; }"));
        }
    }
);