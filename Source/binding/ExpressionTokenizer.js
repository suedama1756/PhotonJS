(function () {
    /**
     * Define the tokens we are interested in.
     * @private
     * @constant
     */
    var tokens = {
        "{":"{",
        "}":"}",
        "(":"(",
        ")":")",
        ",":",",
        ".":".",
        ":":":",
        ";":";",
        "[":"[",
        "]":"]"
    };

    /**
     * Simple tokenizer for binding expressions
     *
     * @param {string} expression The expression to tokenize
     */
    photon.binding.ExpressionTokenizer = function (text) {
        // The tokenizer is NOT a full javascript tokenizer, it goes just far enough for us to extract
        // what we need for binding.
        var position = 0;
        var current;

        /**
         * Gets the expression being parsed by the tokenizer
         * returns {String}
         */
        this.getText = function () {
            return text;
        };

        /**
         * Gets the current position of the tokenizer.
         */
        this.getPosition = function () {
            return position;
        };

        this.currentToken = function () {
            return current;
        };

        /**
         * Gets the next token, or undefined if there are no more tokens.
         */
        this.nextToken = function () {
            var start = position;
            var c;
            while ((c = text.charAt(position))) {
                if (tokens.hasOwnProperty(c)) {
                    if (position > start) {
                        break;
                    }

                    position++;
                    return (current = c);
                }

                if (c === "\"" || c === "\'") {
                    if (position > start) {
                        break;
                    }

                    position++;
                    var terminator = c;
                    while ((c = text.charAt(position++))) {
                        if (c === terminator) {
                            return (current = text.substring(start, position));
                        } else if (c === "\\") {
                            // TODO: perform proper escape character handling
                            position++;
                        }
                    }

                    throw new Error("Syntax error, unterminated string literal.");
                }
                position++;
            }

            return position > start ?
                (current = text.substring(start, position)) :
                (current = "");

        };

        /**
         * Skips white space.
         * @param {Boolean} [readNextToken] if true the next token is always consumed.
         * @return {String} The first token encountered after skipping white space.
         * @private
         */
        this.skipWhiteSpace = function (readNextToken) {
            return this.skipWhile(photon.string.isWhiteSpace, readNextToken);
        };

        /**
         * Reads characters until the predicate fails
         * @param {Function(string}] predicate The predicate to use.
         * @param @param {Boolean} readNextToken if true the next token is always consumed.
         * @return {String}
         */
        this.readWhile = function (predicate, readNextToken) {
            var length = 0, start = position,
                token = readNextToken || !start ? this.nextToken() : current;

            // read whilst condition is true
            while (token && predicate(token)) {
                length += (token = this.nextToken()).length;
            }

            return length > 0 ?
                text.substring(start, start + length) :
                "";
        };

        /**
         * Skips tokens whilst the predicate condition is true;
         * @param fn
         * @param @param {Boolean} readNextToken if true the next token is always consumed.
         * @return {*}
         */
        this.skipWhile = function (fn, readNextToken) {
            var token = readNextToken || !position ? this.nextToken() : current;

            // read whilst condition is true
            while (token && fn(token)) {
                token = this.nextToken();
            }
            return token;
        };
    };
})();
