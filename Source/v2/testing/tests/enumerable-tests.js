describe('enumerable', function () {
    var NotStartedError = 'Enumeration has not started.';
    var CompletedError = 'Enumeration has completed.';

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
});