describe('parser - ', function () {
    function evaluate(expression, target) {
        return photon.parser().parse(expression)(target);
    }

    function shouldEvaluateToBe(expression, target, result) {
        it("should evaluate '" + expression + "'", function () {
            expect(evaluate(expression, target)).toBe(result);
        });
    }

    function shouldEvaluateToEqual(expression, target, result) {
        it("should evaluate '" + expression + "'", function () {
            expect(evaluate(expression, target)).toEqual(result);
        });
    }

    function shouldEvaluateAndThrowUnexpected(expression, target, expected, actual, line, column) {
        var message = photon.string.format("expected token '{0}', but found '{1}'", expected, actual);
        shouldEvaluateAndThrow(expression, target, message, line, column);
    }

    function shouldEvaluateAndThrow(expression, target, message, line, column) {
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
            shouldEvaluateToBe('"test"', null, 'test');
            shouldEvaluateToBe("'test'", null, 'test');
        });

        describe('numbers', function () {
            shouldEvaluateToBe('1', null, 1);
            shouldEvaluateToBe('1.1', null, 1.1);
        });

        describe('booleans', function () {
            shouldEvaluateToBe('true', null, true);
            shouldEvaluateToBe('false', null, false);
        });

        describe('null', function () {
            shouldEvaluateToBe('null', null, null);
        });

        describe('undefined', function () {
            shouldEvaluateToBe('undefined', null, undefined);
        });
    });

    describe('single member paths', function () {
        describe('that exist', function () {
            shouldEvaluateToBe('a', {a:1}, 1);
        });

        describe('that do not exists', function () {
            shouldEvaluateToBe('a', {b:1}, undefined);
        });
    });

    describe('multi member paths', function () {
        describe('using dot notation', function () {
            describe('that exist', function () {
                shouldEvaluateToBe('a.b.c', {a:{b:{c:1}}}, 1);
            });

            describe('that do not exist', function () {
                shouldEvaluateToBe('a.b.c', {a:{e:{c:1}}}, undefined);
                shouldEvaluateToBe('a.b.c', {a:{b:{d:1}}}, undefined);
            });
        });

        describe('using indexer notation', function () {
            describe('that exist', function () {
                shouldEvaluateToBe('a["b"][\'c\']', {a:{b:{c:1}}}, 1);
            });

            describe('that do not exist', function () {
                shouldEvaluateToBe('a["b"]["c"]', {a:{e:{c:1}}}, undefined);
                shouldEvaluateToBe('a["b"]["c"]', {a:{b:{d:1}}}, undefined);
            });
        });

        describe('using mixed dot/indexer notation', function () {
            describe('that exist', function () {
                shouldEvaluateToBe('a["b"].c', {a:{b:{c:1}}}, 1);
            });

            describe('that do not exist', function () {
                shouldEvaluateToBe('a["b"]c', {a:{e:{c:1}}}, undefined);
                shouldEvaluateToBe('a.b["c"]', {a:{b:{d:1}}}, undefined);
            });
        });
    });

    describe('operators', function () {
        describe('additive', function () {
            shouldEvaluateToBe('1 + 1', null, 2);
            shouldEvaluateToBe('1 - 1', null, 0);
        });

        describe('multiplicative', function () {
            shouldEvaluateToBe('4 / 2', null, 2);
            shouldEvaluateToBe('4 * 2', null, 8);
            shouldEvaluateToBe('3 % 2', null, 1);
        });

        describe('unary', function () {
            shouldEvaluateToBe('+1', null, 1);
            shouldEvaluateToBe('-1', null, -1);
        });

        describe('relational', function () {
            shouldEvaluateToBe('4 === 4', null, true);
            shouldEvaluateToBe('4 === 2', null, false);
            shouldEvaluateToBe('4 !== 2', null, true);
            shouldEvaluateToBe('4 !== 4', null, false);

            shouldEvaluateToBe('4 == 4', null, true);
            shouldEvaluateToBe('4 == "4"', null, true);
            shouldEvaluateToBe('4 == 2', null, false);
            shouldEvaluateToBe('4 == "2"', null, false);

            shouldEvaluateToBe('4 != 4', null, false);
            shouldEvaluateToBe('4 != "4"', null, false);
            shouldEvaluateToBe('4 != 2', null, true);
            shouldEvaluateToBe('4 != "2"', null, true);

            shouldEvaluateToBe('1 < 2', null, true);
            shouldEvaluateToBe('1 < 1', null, false);
            shouldEvaluateToBe('1 <= 2', null, true);
            shouldEvaluateToBe('1 <= 1', null, true);
            shouldEvaluateToBe('1 <= 0', null, false);

            shouldEvaluateToBe('2 > 1', null, true);
            shouldEvaluateToBe('1 > 1', null, false);
            shouldEvaluateToBe('2 >= 1', null, true);
            shouldEvaluateToBe('1 >= 1', null, true);
            shouldEvaluateToBe('0 >= 1', null, false);
        });
    });

    describe('groups', function () {
        shouldEvaluateToBe('(1+2)*3', null, 9);
        shouldEvaluateToBe('(3-1)*3', null, 6);
        shouldEvaluateToBe('((3-1)*3)', null, 6);

        shouldEvaluateAndThrowUnexpected('((3-1)*6', null, ')', 'EOF', 0, 8);
    });

    describe('arrays', function () {
        shouldEvaluateToEqual('[1,"2",true, a()]', {a:function () {
            return 3;
        }}, [1, "2", true, 3]);
    });

    describe('functions', function () {
        function sum() {
            var result = photon.enumerable(arguments).sum();
            return isNaN(result) ? 0 : result;
        }

        describe('passing arguments', function () {
            var self = {
                sum:sum
            };

            shouldEvaluateToBe('sum()', self, 0);
            shouldEvaluateToBe('sum(1)', self, 1);
            shouldEvaluateToBe('sum(1, 2)', self, 3);
            shouldEvaluateToBe('sum(1, 2, 3)', self, 6);
            shouldEvaluateToBe('sum(1, 2, 3, 4)', self, 10);
        });

        describe('chaining', function () {
            shouldEvaluateToBe('true.toString()', {}, "true");

            describe('functions that return functions', function () {
                shouldEvaluateToBe('getSum()(1,2,3)',
                    {
                        getSum:function () {
                            return sum;
                        }
                    }, 6);

                shouldEvaluateToBe('getSum()(1,2,3).toString()',
                    {
                        getSum:function () {
                            return sum;
                        }
                    }, "6");
            });
        });

        describe('undefined', function() {
            shouldEvaluateToBe('a()', null, undefined);
            shouldEvaluateToBe('a()', {}, undefined);
        });

//        describe('when not a function', function() {
//            // TODO: Due to IE we cannot determine if a non-function might still be callable....
//            //shouldEvaluateAndThrow('a()', {a:1}, undefined);
//        });

        describe('callables', function() {
            shouldEvaluateToBe('getElementsByTagName("foo").length', document, 0);
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


            shouldEvaluateToBe('a1()', root, root);
            shouldEvaluateToBe('b1.b2()', root, root.b1);
            shouldEvaluateToBe('c1.c2.c3()', root, root.c1.c2);
            shouldEvaluateToBe('d1().a1()', root, child);
            shouldEvaluateToBe('d1().b1.b2()', root, child.b1);

            // Should it get window, or expression global?
            shouldEvaluateToBe('getFnThatGetsThis()()', {
                getFnThatGetsThis:function () {
                    return function () {
                        return this;
                    }
                }
            }, window);
        });
    });
});

