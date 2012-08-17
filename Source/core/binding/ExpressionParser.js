(function () {
    /**
     * Returns a value indicating whether the token is whitespace or an expression delimiter
     * @param token
     * @return {Boolean} true if the token is whitespace or an expression delimiter; otherwise, false.
     * @private
     */
    var isWhiteSpaceOrExpressionDelimiter = function (token) {
        return photon.string.isWhiteSpace(token) || token === TOKEN_EXPRESSION_DELIMITER;
    };

    /**
     * Expression delimiter token
     * @type {String}
     * @constant
     */
    var TOKEN_EXPRESSION_DELIMITER = ',';
    /**
     * Expression start token
     * @type {String}
     * @constant
     */
    var TOKEN_EXPRESSION_START = '{';
    /**
     * Property assignment token
     * @type {String}
     * @constant
     */
    var TOKEN_PROPERTY_ASSIGNMENT = ':';
    /**
     * Expression end token
     * @type {String}
     * @constant
     */
    var TOKEN_EXPRESSION_END = '}';

    /**
     * Regular expression for determining if an expression is writable
     * @private
     */
    var isWritableExpressionRegEx_ = /^[\_$a-z][\_$a-z0-9]*(\(\))?(\[.*?\])*(\(\))?(\.[\_$a-z][\_$a-z0-9]*(\(\))?(\[.*?\])*(\(\))?)*$/i;


    photon.defineType(
        /**
         * Creates a new ExpressionParser instance for the specified expression.
         * @constructor
         * @param {String} expression The expression to parse.
         */
        photon.binding.ExpressionParser = function (bindingType, expression) {
            this.tokenizer_ = new photon.binding.ExpressionTokenizer(expression);

            this.bindingType_ = photon.isString(bindingType) ?
                photon.binding.getBindingType(bindingType) :
                bindingType;
        },
        /**
         * @lends photon.binding.ExpressionParser.prototype
         */
        {
            /**
             * Reads the next expression.
             * @return The first token encountered after skipping white space.
             * @private
             */
            readExpression_:function (terminator) {
                terminator = terminator || "";

                // Expression parsing is not very sophisticated, no attempt is made to validate the expression at
                // this stage. Nested expressions are handled simply by counting open group '{', '(', '[' and close
                // group '}', ')', ']' characters.
                var token, length = 0, depth = 0, tokenizer = this.tokenizer_,
                    start = tokenizer.getPosition() - tokenizer.currentToken().length;

                while ((token = this.tokenizer_.currentToken())) {
                    if (!depth && (token === TOKEN_EXPRESSION_DELIMITER || token === TOKEN_EXPRESSION_END || token === terminator)) {
                        break;
                    }
                    length += token.length;
                    if ("{([".indexOf(token) !== -1) {
                        depth++;
                    } else if (")}]".indexOf(token) !== -1) {
                        depth--;
                    }
                    tokenizer.nextToken();
                }

                var text = photon.string.trim(tokenizer.getText().
                    substring(start, start + length));
                return !token && !text ? null : {
                    text:text,
                    isWritable:isWritableExpressionRegEx_.test(text) &&
                        text.charAt(text.length - 1) !== ")"
                };
            },
            /**
             * @returns {BindingExpressionBuilder} The binding expression builder for the specified target type
             */
            getExpressionBuilder:function (targetSpecification) {
                // look for target type and target, if only the target is specified then get the default target type
                var parts = targetSpecification.split('-', 2);
                if (parts.length === 1) {
                    parts.unshift(this.bindingType_.getDefaultExpressionType());
                }

                var ExpressionBuilderType = this.bindingType_.getExpressionBuilderType(parts[0]);
                return new ExpressionBuilderType(parts[0], parts[1]);
            },
            /**
             * Reads the next binding expression
             * @return The next binding expression, or undefined if there are no more binding expressions to read.
             * @public
             */
            readNext:function () {
                var token,
                    propertyName,
                    propertyCount = 0,
                    tokenizer = this.tokenizer_,
                    start=tokenizer.getPosition();

                if (start) {
                    start--;
                }

                if ((token = tokenizer.skipWhiteSpace()) === TOKEN_EXPRESSION_START) {
                    token = tokenizer.skipWhiteSpace(true);
                }

                var expressionBuilder, expressionElement;
                while (token) {
                    expressionElement = null;
                    if (propertyCount === 0) {
                        // the name is option for the first property if the binding type supports default properties
                        expressionElement = this.readExpression_(TOKEN_PROPERTY_ASSIGNMENT);
                        if ((token = tokenizer.currentToken()) && token !== TOKEN_EXPRESSION_DELIMITER && token !== TOKEN_EXPRESSION_START) {
                            // we didn't encounter a default expression, so set the property name and reset expression
                            propertyName = expressionElement.text;
                            expressionElement = null;
                        }
                        else {
                            propertyName = this.bindingType_.getDefaultExpressionType(null);
                        }

                        expressionBuilder = this.getExpressionBuilder(propertyName);
                    } else {
                        propertyName = photon.string.trim(token);
                        token = tokenizer.nextToken();
                    }

                    if (expressionElement === null) {
                        if ((token = tokenizer.skipWhiteSpace()) !== TOKEN_PROPERTY_ASSIGNMENT) {
                            this.throwUnexpectedToken(TOKEN_PROPERTY_ASSIGNMENT);
                        }
                        tokenizer.nextToken();
                        expressionElement = this.readExpression_();
                        token = tokenizer.currentToken();
                    }

                    if (propertyCount++ === 0) {
                        expressionBuilder.setSource(expressionElement);
                    }
                    else {
                        var setter = "set-" + propertyName;
                        if (!photon.isFunction(expressionBuilder[setter])) {
                            throw new Error(photon.string.format("Unsupported binding property {0}.", propertyName));
                        }
                        expressionBuilder[setter](expressionElement.text);
                    }

                    // if there are no more tokens, or the expression is terminated with a '}' then we are done
                    var isComplete = !token || token === TOKEN_EXPRESSION_END;
                    expressionBuilder.setText(tokenizer.getText().substring(start, tokenizer.getPosition()));

                    // if not done then we are expecting a ','
                    if (!isComplete && token !== TOKEN_EXPRESSION_DELIMITER) {
                        this.throwUnexpectedToken(TOKEN_EXPRESSION_DELIMITER);
                    }

                    // skip any whitespaces or delimiters
                    token = tokenizer.skipWhile(isWhiteSpaceOrExpressionDelimiter, true);
                    if (isComplete) {
                        break;
                    }
                }
                return expressionBuilder ? expressionBuilder.build() : null;
            },
            throwUnexpectedToken:function (expectedTokens) {
                var token = this.tokenizer_.currentToken();

                throw new Error(photon.string.format('Unexpected token at or near position {0}, expected: \'{1}\', actual: \'{2}.\', expression\'{3}\'',
                    this.tokenizer_.getPosition() - token.length, expectedTokens, token ? token : "EOF", this.tokenizer_.getText()));
            },
            /**
             * Reads all of the remaining binding expressions
             * @return An array containing all of the remaining binding expressions, if no binding expressions are read the
             * array will be empty.
             * @public
             */
            readAllRemaining:function () {
                var bindings = [];
                var binding;
                while ((binding = this.readNext())) {
                    bindings.push(binding);
                }
                return bindings;
            }
        }
    );
})();

