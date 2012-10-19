describe('enumerable', function () {
    var NotStartedError = 'Enumeration has not started.';
    var CompletedError = 'Enumeration has completed.';
    var NoMatchFoundError = 'No match found.';

    function enumerate(enumerable, count, results) {
        for (var i = 0; i < count; i++) {
            if (!enumerable.moveNext()) {
                return i;
            }

            if (results) {
                results.push(enumerable.current());
            }
        }
        return count;
    }

    function defineSuite(name, enumerableFactory, expectedResults) {
        var expectedCount = expectedResults.length;
        describe(name, function () {
            var enumerator = null;

            beforeEach(function () {
                enumerator = enumerableFactory().getEnumerator();
            });

            it('should throw if enumeration has not started', function () {
                expect(function () {
                    enumerator.current();
                }).toThrow(NotStartedError);
            });

            it('should throw if enumeration has completed', function () {
                enumerate(enumerator, expectedCount + 1);
                expect(function () {
                    enumerator.current();
                }).toThrow(CompletedError);
            });

            it('should enumerate correct number of times', function () {
                expect(enumerate(enumerator, expectedCount + 1)).toBe(expectedCount);
            });

            it('should enumerate correct values', function () {
                var results = [];
                enumerate(enumerator, expectedCount, results);
                expect(results).toEqual(expectedResults);
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

    defineSuite('.select', function () {
        return photon.enumerable([1, 2, 3]).select(function (item) {
            return 'Item ' + item;
        });
    }, ['Item 1', 'Item 2', 'Item 3']);

    defineSuite('.skip', function () {
        return photon.enumerable([1, 2, 3]).skip(1);
    }, [2, 3]);

    defineSuite('.where', function () {
        return photon.enumerable([1, 2, 3, 4, 5]).where(function (item) {
            return (item % 2) === 1;
        });
    }, [1, 3, 5]);

    describe('.any', function() {
        it ('should return false when empty', function() {
            expect(photon.enumerable([]).any()).toBe(false);
        });

        it ('should return false when predicate finds no matches', function() {
            var matched = false;
            expect(photon.enumerable([1,2,3]).any(function(item) {
                if (item > 3) {
                    matched = true;
                }
                return matched;
            })).toBe(false);
            expect(matched).toBe(false);
        });

        it ('should return true when predicate finds matches at start', function() {
            var matched = false;
            expect(photon.enumerable([1,2,3, 4]).any(function(item) {
                return matched = (item === 1);
            })).toBe(true);
            expect(matched).toBe(true);
        });

        it ('should return true when predicate finds matches at the end', function() {
            var matched = false;
            expect(photon.enumerable([1,2,3, 4]).any(function(item) {
                return matched = item === 4;
            })).toBe(true);
            expect(matched).toBe(true);
        });
    });

    describe('.first', function() {
        it ('should throw if empty', function() {
            expect(function() {
                photon.enumerable([]).first()
            }).toThrow(NoMatchFoundError);
        });

        it ('should return first item when not empty', function() {
            expect(photon.enumerable([1,2,3]).first()).toBe(1);
        });

        it ('should throw when no items are matched by the predicate', function() {
            expect(function() {
                photon.enumerable([1,2,3]).first(function(item) {
                    return item > 3;
                })
            }).toThrow(NoMatchFoundError);
        });

        it ('should return first item matched by predicate', function() {
            var data = [{v:3}, {v:1}, {v:2}, {v:1}];
            expect(photon.enumerable(data).first(function(item) {
                return item.v === 1;
            })).toBe(data[1]);
        });
    });

    describe('.firstOrDefault', function() {
        it ('should return first item when not empty', function() {
            expect(photon.enumerable([1,2,3]).firstOrDefault()).toBe(1);
        });

        describe('- with no default value', function() {
            it ('should return undefined when empty', function() {
                expect(photon.enumerable([]).firstOrDefault()).toBeUndefined();
            });

            it ('should return undefined when no items are matched by the predicate', function() {
                expect(
                    photon.enumerable([1,2,3]).firstOrDefault(function(item) {
                        return item > 3;
                    })
                ).toBeUndefined();
            });
        });

        describe('- with default value', function() {
            it ('should return default value when empty', function() {
                expect(photon.enumerable([]).firstOrDefault(null, -1)).toBe(-1);
            });

            it ('should return default value when no items are matched by the predicate', function() {
                expect(
                    photon.enumerable([1,2,3]).firstOrDefault(function(item) {
                        return item > 3;
                    }, -1)
                ).toBe(-1);
            });
        });
    });
});