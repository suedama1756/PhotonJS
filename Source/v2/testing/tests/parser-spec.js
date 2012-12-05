describe('parser - ', function () {
    function evaluate(expression, target) {
        return photon.parser().parse(expression)(target);
    }

    function itShouldEvaluate(expression, target, result) {
        it("should evaluate '" + expression + "'", function () {
            expect(evaluate(expression, target)).toBe(result);
        });
    }

    function itShouldThrowUnexpected(expression, target, expected, actual, line, column) {
        var message = photon.string.format("expected token '{0}', but found '{1}'", expected, actual);
        itShouldThrow(expression, target, message, line, column);
    }

    function itShouldThrow(expression, target, message, line, column) {
        message = photon.string.format("Parser error: {0} at position ({1}).", message, column);

        it("should throw when evaluating '" + expression + "'", function () {
            var exception;
            try {
                evaluate(expression, target);
            }
            catch (e) {
                exception = e;
            }

            expect(exception).toBeDefined();
            expect(exception.message).toBe(message);
            expect(exception.line).toBe(line);
            expect(exception.column).toBe(column);
        });
    }

    describe('constants', function () {
        describe('strings', function () {
            itShouldEvaluate('"test"', null, 'test');
            itShouldEvaluate("'test'", null, 'test');
        });

        describe('numbers', function () {
            itShouldEvaluate('1', null, 1);
            itShouldEvaluate('1.1', null, 1.1);
        });

        describe('booleans', function () {
            itShouldEvaluate('true', null, true);
            itShouldEvaluate('false', null, false);
        });

        describe('null', function () {
            itShouldEvaluate('null', null, null);
        });

        describe('undefined', function () {
            itShouldEvaluate('undefined', null, undefined);
        });
    });

    describe('single member paths', function () {
        describe('that exist', function () {
            itShouldEvaluate('a', {a:1}, 1);
        });

        describe('that do not exists', function () {
            itShouldEvaluate('a', {b:1}, undefined);
        });
    });

    describe('multi member paths', function () {
        describe('using dot notation', function () {
            describe('that exist', function () {
                itShouldEvaluate('a.b.c', {a:{b:{c:1}}}, 1);
            });

            describe('that do not exist', function () {
                itShouldEvaluate('a.b.c', {a:{e:{c:1}}}, undefined);
                itShouldEvaluate('a.b.c', {a:{b:{d:1}}}, undefined);
            });
        });

        describe('using indexer notation', function () {
            describe('that exist', function () {
                itShouldEvaluate('a["b"][\'c\']', {a:{b:{c:1}}}, 1);
            });

            describe('that do not exist', function () {
                itShouldEvaluate('a["b"]["c"]', {a:{e:{c:1}}}, undefined);
                itShouldEvaluate('a["b"]["c"]', {a:{b:{d:1}}}, undefined);
            });
        });

        describe('using mixed dot/indexer notation', function () {
            describe('that exist', function () {
                itShouldEvaluate('a["b"].c', {a:{b:{c:1}}}, 1);
            });

            describe('that do not exist', function () {
                itShouldEvaluate('a["b"]c', {a:{e:{c:1}}}, undefined);
                itShouldEvaluate('a.b["c"]', {a:{b:{d:1}}}, undefined);
            });
        });
    });

    describe('operators', function () {
        describe('additive', function () {
            itShouldEvaluate('1 + 1', null, 2);
            itShouldEvaluate('1 - 1', null, 0);
        });

        describe('multiplicative', function () {
            itShouldEvaluate('4 / 2', null, 2);
            itShouldEvaluate('4 * 2', null, 8);
            itShouldEvaluate('3 % 2', null, 1);
        });

        describe('unary', function () {
            itShouldEvaluate('+1', null, 1);
            itShouldEvaluate('-1', null, -1);
        });

        describe('relational', function () {
            itShouldEvaluate('4 === 4', null, true);
            itShouldEvaluate('4 === 2', null, false);
            itShouldEvaluate('4 !== 2', null, true);
            itShouldEvaluate('4 !== 4', null, false);

            itShouldEvaluate('4 == 4', null, true);
            itShouldEvaluate('4 == "4"', null, true);
            itShouldEvaluate('4 == 2', null, false);
            itShouldEvaluate('4 == "2"', null, false);

            itShouldEvaluate('4 != 4', null, false);
            itShouldEvaluate('4 != "4"', null, false);
            itShouldEvaluate('4 != 2', null, true);
            itShouldEvaluate('4 != "2"', null, true);

            itShouldEvaluate('1 < 2', null, true);
            itShouldEvaluate('1 < 1', null, false);
            itShouldEvaluate('1 <= 2', null, true);
            itShouldEvaluate('1 <= 1', null, true);
            itShouldEvaluate('1 <= 0', null, false);

            itShouldEvaluate('2 > 1', null, true);
            itShouldEvaluate('1 > 1', null, false);
            itShouldEvaluate('2 >= 1', null, true);
            itShouldEvaluate('1 >= 1', null, true);
            itShouldEvaluate('0 >= 1', null, false);
        });
    });

    describe('groups', function () {
        itShouldEvaluate('(1+2)*3', null, 9);
        itShouldEvaluate('(3-1)*3', null, 6);
        itShouldEvaluate('((3-1)*3)', null, 6);

        itShouldThrowUnexpected('((3-1)*6', null, ')', 'EOF', 0, 8);
    });

    describe('function', function () {
        function sum() {
            var result = photon.enumerable(arguments).sum();
            return isNaN(result) ? 0 : result;
        }

        describe('passing arguments', function () {
            var self = {
                sum:sum
            };

            itShouldEvaluate('sum()', self, 0);
            itShouldEvaluate('sum(1)', self, 1);
            itShouldEvaluate('sum(1, 2)', self, 3);
            itShouldEvaluate('sum(1, 2, 3)', self, 6);
            itShouldEvaluate('sum(1, 2, 3, 4)', self, 10);
        });

        describe('chaining', function () {
            itShouldEvaluate('true.toString()', {}, "true");

            describe('functions that return functions', function () {
                itShouldEvaluate('getSum()(1,2,3)',
                    {
                        getSum:function () {
                            return sum;
                        }
                    }, 6);

                itShouldEvaluate('getSum()(1,2,3).toString()',
                    {
                        getSum:function () {
                            return sum;
                        }
                    }, "6");
            });
        });

        describe('context propagation', function () {
            var root = {
                    a1:function () {
                        return this;
                    },
                    b1:{
                        b2:function () {
                            return this;
                        }
                    },
                    c1:{
                        c2:{
                            c3:function () {
                                return this;
                            }
                        }
                    },
                    d1:function () {
                        return child;
                    }
                },
                child = {
                    a1:function () {
                        return this;
                    },
                    b1:{
                        b2:function () {
                            return this;
                        }
                    }
                };


            itShouldEvaluate('a1()', root, root);
            itShouldEvaluate('b1.b2()', root, root.b1);
            itShouldEvaluate('c1.c2.c3()', root, root.c1.c2);
            itShouldEvaluate('d1().a1()', root, child);
            itShouldEvaluate('d1().b1.b2()', root, child.b1);

            // Should it get window, or expression global?
            itShouldEvaluate('getFnThatGetsThis()()', {
                getFnThatGetsThis:function () {
                    return function () {
                        return this;
                    }
                }
            }, window);
        });
    });
});

