var suiteFilter = '.groupBy';

describe('enumerable', function () {
    var ERROR_NOT_STARTED = 'Enumeration has not started.';
    var ERROR_COMPLETED = 'Enumeration has completed.';
    var ERROR_NO_MATCH = 'No match found.';

    function enumerate(enumerator, count, results) {
        for (var i = 0; i < count; i++) {
            if (!enumerator.moveNext()) {
                return i;
            }

            if (results) {
                results.push(enumerator.current());
            }
        }
        return count;
    }

    function defineSuite(suiteName, enumerableFactory, expectedResults) {
        var expectedCount = expectedResults.length;
        describe(suiteName, function () {
            if (suiteFilter && suiteFilter.indexOf(suiteName) === -1) {
                return;
            }

            var enumerator = null;

            beforeEach(function () {
                enumerator = enumerableFactory().getEnumerator();
            });

            it('should throw if enumeration has not started', function () {
                expect(function () {
                    enumerator.current();
                }).toThrow(ERROR_NOT_STARTED);
            });

            it('should throw if enumeration has completed', function () {
                enumerate(enumerator, expectedCount + 1);
                expect(function () {
                    enumerator.current();
                }).toThrow(ERROR_COMPLETED);
            });

            it('should enumerate correct number of times', function () {
                expect(enumerate(enumerator, expectedCount + 1)).toBe(expectedCount);
            });

            it('should enumerate correct values', function () {
                var results = [];
                enumerate(enumerator, expectedCount, results);
                expect(results).toEqual(expectedResults);
            });

            it('should support repeatable enumerations', function () {
                var enumerable = enumerableFactory();

                // get enumerator and enumerate
                var enum1 = enumerable.getEnumerator();
                var results1 = [];
                enumerate(enum1, expectedCount + 1, results1);

                // get another enumerator (should be reset)
                var enum2 = enumerable.getEnumerator();
                var results2 = [];
                enumerate(enum2, expectedCount + 1, results2);

                expect(results1).toEqual(expectedResults);
                expect(results2).toEqual(expectedResults);
            });
        })
    }

    defineSuite('.fromArray', function () {
        return photon.enumerable([1, 2, 3]);
    }, [1, 2, 3]);

    defineSuite('.fromArguments', function () {
        return (function () {
            return photon.enumerable(arguments);
        })(1, 2, 3);
    }, [1, 2, 3]);

    defineSuite('.fromEmptyArguments', function () {
        return (function () {
            return photon.enumerable(arguments);
        })();
    }, []);

    describe('.select', function () {
        defineSuite('selector', function () {
            return photon.enumerable([1, 5, 4]).select(function (item, index) {
                return item + '@' + index;
            });
        }, ['1@0', '5@1', '4@2']);

        defineSuite('empty', function () {
            return photon.enumerable([]).select(function (item, index) {
                return item + '@' + index;
            });
        }, []);
    });

    describe('.skip', function () {
        defineSuite('by less than count', function () {
            return photon.enumerable([1, 2, 3]).skip(1);
        }, [2, 3]);

        defineSuite('by more than count', function () {
            return photon.enumerable([1, 2, 3]).skip(4);
        }, []);

        defineSuite('by count', function () {
            return photon.enumerable([1, 2, 3]).skip(3);
        }, []);

        defineSuite('by some then take', function () {
            return photon.enumerable([1, 2, 3, 4]).skip(3).take(1)
        }, [4]);
    });


    describe('.take', function () {
        defineSuite('by less than count', function () {
            return photon.enumerable([1, 2, 3]).take(1);
        }, [1]);

        defineSuite('by more than count', function () {
            return photon.enumerable([1, 2, 3]).take(4);
        }, [1, 2, 3]);

        defineSuite('by count', function () {
            return photon.enumerable([1, 2, 3]).take(3);
        }, [1, 2, 3]);
    });

    describe('.where', function () {
        var values = [1, 2, 3, 4, 5, 7];
        defineSuite('match some by value', function () {
            return photon.enumerable(values).where(function (item) {
                return (item % 2) === 1;
            });
        }, [1, 3, 5, 7]);

        defineSuite('match none', function () {
            return photon.enumerable(values).where(function () {
                return false;
            });
        }, []);

        defineSuite('match all', function () {
            return photon.enumerable(values).where(function () {
                return true;
            });
        }, values);

        defineSuite('by some by index', function () {
            return photon.enumerable(values).where(function (item, index) {
                return index > 2;
            });
        }, [4, 5, 7]);

        defineSuite('over empty', function () {
            return photon.enumerable([]).where(function () {
                throw new Error('Unexpected predicate call.');
            });
        }, []);
    });

    describe('.distinct', function () {
        defineSuite('numbers', function () {
            return photon.enumerable([1, 2, 1, 2, 2, 3, 4, 5, 4, 6, 3, 2, 1]).distinct();
        }, [1, 2, 3, 4, 5, 6]);

        defineSuite('strings', function () {
            return photon.enumerable(['one', 'two', 'one', 'three', 'two']).distinct();
        }, ['one', 'two', 'three']);

        defineSuite('dates', function () {
            return photon.enumerable([new Date(0), new Date(1), new Date(0)]).distinct();
        }, [new Date(0), new Date(1)]);


        var values = [
            {},
            {},
            {},
            {},
            {}
        ];
        defineSuite('objects', function () {
            return photon.enumerable([values[0], values[3], values[2], values[1], values[0], values[4], values[1], values[2]]).distinct();
        }, [values[0], values[3], values[2], values[1], values[4]]);

        defineSuite('mixed types', function () {
            return photon.enumerable(['1', 1, true, '2', 2, false, 1, '1', new Date(1)]).distinct();
        }, ['1', 1, true, '2', 2, false, new Date(1)]);

        defineSuite('empty', function () {
            return photon.enumerable([]).distinct();
        }, []);

        var keyedItems = [
            {key:1, value:'One'},
            {key:2, value:'Two'},
            {key:1, value:'One'}
        ];
        defineSuite('selector', function () {
            return photon.enumerable(keyedItems).distinct(function (item) {
                return item.key;
            });
        }, [keyedItems[0], keyedItems[1]]);

        defineSuite('nulls', function () {
            return photon.enumerable([1, null, 2, 1, null]).distinct();
        }, [1, null, 2]);

        var undef;
        defineSuite('undefined', function () {
            return photon.enumerable([1, undef, 2, 1, undef]).distinct();
        }, [1, undef, 2]);
    });

    describe('.groupBy', function() {
        it ('should', function() {
            var result = photon.enumerable([1, 2, 1, 2, 1, 2, 3]).groupBy();
            var endResult = result.select(function(item) {
                return item.toArray();
            }).toArray();
            expect(endResult).toEqual([[1,1,1],[2,2,2],[3]]);
        });


    });

    describe('.any', function () {
        it('should return false when empty', function () {
            expect(photon.enumerable([]).any()).toBe(false);
        });

        it('should return false when predicate finds no matches', function () {
            var matched = false;
            expect(photon.enumerable([1, 2, 3]).any(function (item) {
                if (item > 3) {
                    matched = true;
                }
                return matched;
            })).toBe(false);
            expect(matched).toBe(false);
        });

        it('should return true when predicate finds matches at start', function () {
            var matched = false;
            expect(photon.enumerable([1, 2, 3, 4]).any(function (item) {
                return matched = (item === 1);
            })).toBe(true);
            expect(matched).toBe(true);
        });

        it('should return true when predicate finds matches at the end', function () {
            var matched = false;
            expect(photon.enumerable([1, 2, 3, 4]).any(function (item) {
                return matched = item === 4;
            })).toBe(true);
            expect(matched).toBe(true);
        });
    });

    describe('.first', function () {
        it('should throw if empty', function () {
            expect(function () {
                photon.enumerable([]).first()
            }).toThrow(ERROR_NO_MATCH);
        });

        it('should return first item when not empty', function () {
            expect(photon.enumerable([1, 2, 3]).first()).toBe(1);
        });

        it('should throw when no items are matched by the predicate', function () {
            expect(function () {
                photon.enumerable([1, 2, 3]).first(function (item) {
                    return item > 3;
                })
            }).toThrow(ERROR_NO_MATCH);
        });

        it('should return first item matched by predicate', function () {
            var data = [
                {v:3},
                {v:1},
                {v:2},
                {v:1}
            ];
            expect(photon.enumerable(data).first(function (item) {
                return item.v === 1;
            })).toBe(data[1]);
        });
    });

    describe('.firstOrDefault', function () {
        it('should return first item when not empty', function () {
            expect(photon.enumerable([1, 2, 3]).firstOrDefault()).toBe(1);
        });

        describe('- with no default value', function () {
            it('should return undefined when empty', function () {
                expect(photon.enumerable([]).firstOrDefault()).toBeUndefined();
            });

            it('should return undefined when no items are matched by the predicate', function () {
                expect(
                    photon.enumerable([1, 2, 3]).firstOrDefault(function (item) {
                        return item > 3;
                    })
                ).toBeUndefined();
            });
        });

        describe('- with default value', function () {
            it('should return default value when empty', function () {
                expect(photon.enumerable([]).firstOrDefault(null, -1)).toBe(-1);
            });

            it('should return default value when no items are matched by the predicate', function () {
                expect(
                    photon.enumerable([1, 2, 3]).firstOrDefault(function (item) {
                        return item > 3;
                    }, -1)
                ).toBe(-1);
            });
        });
    });


});