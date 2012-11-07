var suiteFilter; // = 'Perf';

function getFullSuiteDescription(suite) {
    var result = [];
    while (suite) {
        result.unshift(suite.description);
        suite = suite.parentSuite;
    }
    return result.join(' ');
}


function matchOddNumbers(x) {
    return x % 2 === 1;
}

describe('enumerable', function () {
    if (suiteFilter) {
        jasmine.getEnv().specFilter = function (spec) {
            var suiteDescription = getFullSuiteDescription(spec.suite) + ' ' + spec.description;
            return suiteDescription.indexOf(suiteFilter) !== -1;
        };
    }

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


    function describeNonScalar(suiteName, enumerableFactory, expectedResults, additionalTests) {
        var expectedCount = expectedResults.length;
        describe(suiteName, function () {
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

            if (additionalTests) {
                additionalTests();
            }
        })
    }

    function describeScalar(suiteName, enumerableFactory, getter, expectedResult, additionalTests) {
        describe(suiteName, function () {
            var suiteDescription = getFullSuiteDescription();

            console.log('Suite: %s', suiteDescription);

            if (suiteFilter && suiteDescription.indexOf(suiteFilter) === -1) {
                return;
            }

            var enumerable = null;

            function verifyResult(result) {
                if (typeof expectedResult === 'number' && isNaN(expectedResult)) {
                    expect(isNaN(result)).toBe(true);
                } else {
                    expect(result).toBe(expectedResult);
                }
            }

            beforeEach(function () {
                enumerable = enumerableFactory();
            });

            it('should return correct value', function () {
                var result = getter(enumerable);
                verifyResult(result);
            });

            it('should support repeatable enumerations', function () {
                var result1 = getter(enumerable);
                verifyResult(result1);
                var result2 = getter(enumerable);
                verifyResult(result2);
            });

            if (additionalTests) {
                additionalTests();
            }
        })
    }

    describe('- creating,', function () {
        describe('from enumerable', function () {
            it('should return original enumerable object', function () {
                var original = photon.enumerable([1, 2, 3]);
                expect(photon.enumerable(original)).toBe(original);
            })
        });

        describeNonScalar('from empty arguments', function () {
            return (function () {
                return photon.enumerable(arguments);
            })();
        }, []);

        describeNonScalar('from arguments', function () {
            return (function () {
                return photon.enumerable(arguments);
            })(1, 2, 3);
        }, [1, 2, 3]);

        describeNonScalar('from array', function () {
            return photon.enumerable([1, 2, 3]);
        }, [1, 2, 3]);
    });

    describe('- select,', function () {
        describeNonScalar('using value and index', function () {
            return photon.enumerable([1, 5, 4]).select(function (item, index) {
                return item + '@' + index;
            });
        }, ['1@0', '5@1', '4@2']);

        describeNonScalar('is empty', function () {
            return photon.enumerable([]).select(function (item, index) {
                return item + '@' + index;
            });
        }, []);
    });

    describe('- skip,', function () {
        describeNonScalar('less than count', function () {
            return photon.enumerable([1, 2, 3]).skip(1);
        }, [2, 3]);

        describeNonScalar('more than count', function () {
            return photon.enumerable([1, 2, 3]).skip(4);
        }, []);

        describeNonScalar('count', function () {
            return photon.enumerable([1, 2, 3]).skip(3);
        }, []);

        describeNonScalar('some then take', function () {
            return photon.enumerable([1, 2, 3, 4]).skip(3).take(1)
        }, [4]);
    });

    describe('- take,', function () {
        describeNonScalar('less than count', function () {
            return photon.enumerable([1, 2, 3]).take(1);
        }, [1]);

        describeNonScalar('more than count', function () {
            return photon.enumerable([1, 2, 3]).take(4);
        }, [1, 2, 3]);

        describeNonScalar('count', function () {
            return photon.enumerable([1, 2, 3]).take(3);
        }, [1, 2, 3]);
    });

    describe('- where,', function () {
        var values = [1, 2, 3, 4, 5, 7];
        describeNonScalar('matching some by value', function () {
            return photon.enumerable(values).where(function (item) {
                return (item % 2) === 1;
            });
        }, [1, 3, 5, 7]);

        describeNonScalar('matching some by index', function () {
            return photon.enumerable(values).where(function (item, index) {
                return index > 2;
            });
        }, [4, 5, 7]);

        describeNonScalar('matching none', function () {
            return photon.enumerable(values).where(function () {
                return false;
            });
        }, []);

        describeNonScalar('matching all', function () {
            return photon.enumerable(values).where(function () {
                return true;
            });
        }, values);

        describeNonScalar('is empty', function () {
            return photon.enumerable([]).where(function () {
                throw new Error('Unexpected predicate call.');
            });
        }, []);
    });

    describe('- distinct,', function () {
        describe('has no key selector,', function () {
            describeNonScalar('contains only number types', function () {
                return photon.enumerable([1, 2, 1, 2, 2, 3, 4, 5, 4, 6, 3, 2, 1]).distinct();
            }, [1, 2, 3, 4, 5, 6]);

            describeNonScalar('contains only string types', function () {
                return photon.enumerable(['one', 'two', 'one', 'three', 'two']).distinct();
            }, ['one', 'two', 'three']);

            describeNonScalar('contains only date types', function () {
                return photon.enumerable([new Date(0), new Date(1), new Date(0)]).distinct();
            }, [new Date(0), new Date(1)]);

            var values = [
                {},
                {},
                {},
                {},
                {}
            ];
            describeNonScalar('contains only object types', function () {
                return photon.enumerable([values[0], values[3], values[2], values[1], values[0], values[4], values[1], values[2]]).distinct();
            }, [values[0], values[3], values[2], values[1], values[4]]);

            describeNonScalar('contains mixed types', function () {
                return photon.enumerable(['1', 1, true, '2', 2, false, 1, '1', new Date(1)]).distinct();
            }, ['1', 1, true, '2', 2, false, new Date(1)]);

            describeNonScalar('is empty', function () {
                return photon.enumerable([]).distinct();
            }, []);

            describeNonScalar('contains nulls', function () {
                return photon.enumerable([1, null, 2, 1, null]).distinct();
            }, [1, null, 2]);

            var undef;
            describeNonScalar('contains undefined', function () {
                return photon.enumerable([1, undef, 2, 1, undef]).distinct();
            }, [1, undef, 2]);
        });

        describe('has key selector,', function () {
            var keyedItems = [
                {key:1, value:'One'},
                {key:2, value:'Two'},
                {key:1, value:'One'}
            ];
            describeNonScalar('contains groups', function () {
                return photon.enumerable(keyedItems).distinct(function (item) {
                    return item.key;
                });
            }, [keyedItems[0], keyedItems[1]]);
        });
    });

    describe('- groupBy,', function () {
        describe('has no key selector,', function () {
            describeNonScalar('contains only numeric values', function () {
                return photon.enumerable([1, 2, 1, 2, 2, 3, 4, 5, 4, 6, 3, 2, 1]).groupBy()
                    .select(function (x) {
                        return x.toArray();
                    });
            }, [
                [1, 1, 1],
                [2, 2, 2, 2],
                [3, 3],
                [4, 4],
                [5],
                [6]
            ]);

            describeNonScalar('contains only string values', function () {
                return photon.enumerable(['one', 'two', 'one', 'three', 'two']).groupBy()
                    .select(function (x) {
                        return x.toArray();
                    });
            }, [
                ['one', 'one'],
                ['two', 'two'],
                ['three']
            ]);

            describeNonScalar('contains only date values', function () {
                return photon.enumerable([new Date(0), new Date(1), new Date(0)]).groupBy()
                    .select(function (x) {
                        return x.toArray();
                    });
            }, [
                [new Date(0), new Date(0)],
                [new Date(1)]
            ]);

            var values = [
                {},
                {},
                {},
                {},
                {}
            ];
            describeNonScalar('contains only object values', function () {
                return photon.enumerable([values[0], values[3], values[2], values[1], values[0], values[4], values[1], values[2]]).groupBy()
                    .select(function (x) {
                        return x.toArray();
                    });
            }, [
                [values[0], values[0]],
                [values[3]],
                [values[2], values[2]],
                [values[1], values[1]],
                [values[4]]
            ]);

            describeNonScalar('contains mixed types', function () {
                return photon.enumerable(['1', 1, true, '2', 2, false, 1, '1', new Date(1)]).groupBy()
                    .select(function (x) {
                        return x.toArray();
                    });
            }, [
                ['1', '1'],
                [1, 1],
                [true],
                ['2'],
                [2],
                [false],
                [new Date(1)]
            ]);

            describeNonScalar('contains nulls', function () {
                return photon.enumerable([1, null, 2, 1, null]).groupBy()
                    .select(function (x) {
                        return x.toArray();
                    });
            }, [
                [1, 1],
                [null, null],
                [2]
            ]);


            var undef;
            describeNonScalar('contains undefined', function () {
                return photon.enumerable([1, undef, 2, 1, undef]).groupBy()
                    .select(function (x) {
                        return x.toArray();
                    })
            }, [
                [1, 1],
                [undef, undef],
                [2]
            ]);

            describeNonScalar('is empty', function () {
                return photon.enumerable([]).groupBy();
            }, []);
        });

        describe('has key selector,', function () {
            var keyedItems = [
                {key:1, value:'One'},
                {key:2, value:'Two'},
                {key:1, value:'One'}
            ];
            describeNonScalar('contains groups', function () {
                return photon.enumerable(keyedItems).groupBy(
                    function (item) {
                        return item.key;
                    }).select(
                    function (x) {
                        return x.toArray();
                    });
            }, [
                [keyedItems[0], keyedItems[2]],
                [keyedItems[1]]
            ]);
        });
    });

    describe('- any,', function () {
        describe('has no predicate,', function () {
            function getter(enumerable) {
                return enumerable.any();
            }

            describeScalar('is empty', function () {
                return photon.enumerable([]);
            }, getter, false);

            describeScalar('is not empty', function () {
                return photon.enumerable([1]);
            }, getter, true);
        });

        describe('has predicate,', function () {
            var matched;

            function getter(enumerable) {
                return enumerable.any(matchOddNumbers);
            }

            describeScalar('is empty', function () {
                return photon.enumerable([]);
            }, getter, false);

            describeScalar('has matches', function () {
                return photon.enumerable([2, 3, 4, 5]);
            }, getter, true, function () {
                var matched;
                beforeEach(function () {
                    matched = {};
                });

                it('should stop iterating once matched', function () {
                    photon.enumerable([2, 3, 4, 5]).any(function (x) {
                        matched = x;
                        return matchOddNumbers(x);
                    });
                    expect(matched).toBe(3);
                });
            });

            describeScalar('has matches at start', function () {
                return photon.enumerable([3, 4, 6]);
            }, getter, true);

            describeScalar('has matches at end', function () {
                return photon.enumerable([4, 6, 7]);
            }, getter, true);
        });
    });

    describe('- last,', function () {
        describe('has no predicate,', function () {
            function getter(enumerable) {
                return enumerable.last();
            }

            describe('is empty', function () {
                it('should throw error', function () {
                    expect(function () {
                        photon.enumerable([]).last()
                    }).toThrow(ERROR_NO_MATCH);
                });
            });

            describeScalar('is not empty',
                function () {
                    return photon.enumerable([1, 2, 3]);
                },
                getter, 3);
        });

        describe('has predicate,', function () {
            describe('is empty', function () {
                it('should throw error', function () {
                    expect(function () {
                        photon.enumerable([]).last()
                    }).toThrow(ERROR_NO_MATCH);
                });
            });

            describe('has no matches', function () {
                it('should throw error', function () {
                    expect(function () {
                        photon.enumerable([2, 4]).last(matchOddNumbers)
                    }).toThrow(ERROR_NO_MATCH);
                });
            });

            describeScalar('has matches', function () {
                return photon.enumerable([2, 3, 4, 5, 6]);
            }, function (enumerable) {
                return enumerable.last(matchOddNumbers, -1);
            }, 5);
        });
    });

    describe('- lastOrDefault,', function () {
        describe('has no predicate,', function () {
            function getter(enumerable) {
                return enumerable.lastOrDefault();
            }

            describeScalar('is empty with no default specified', function () {
                return photon.enumerable([]);
            }, getter, undefined);

            describeScalar('is empty with default specified',
                function () {
                    return photon.enumerable([]);
                },
                function (enumerable) {
                    return enumerable.lastOrDefault(null, -1);
                }, -1);

            describeScalar('is not empty',
                function () {
                    return photon.enumerable([1, 2, 3]);
                },
                getter, 3);
        });

        describe('has predicate,', function () {
            function getter(enumerable) {
                return enumerable.lastOrDefault(matchOddNumbers);
            }

            describeScalar('is empty with no default specified', function () {
                return photon.enumerable([]);
            }, getter, undefined);

            describeScalar('is empty with default specified', function () {
                return photon.enumerable([]);
            }, function (enumerable) {
                return enumerable.lastOrDefault(matchOddNumbers, -1);
            }, -1);

            describeScalar('has no matches with no default specified', function () {
                return photon.enumerable([2, 4]);
            }, getter, undefined);

            describeScalar('has no matches with default specified', function () {
                return photon.enumerable([2, 4]);
            }, function (enumerable) {
                return enumerable.lastOrDefault(matchOddNumbers, -1);
            }, -1);

            describeScalar('has matches', function () {
                return photon.enumerable([2, 3, 4, 5, 6]);
            }, function (enumerable) {
                return enumerable.lastOrDefault(matchOddNumbers, -1);
            }, 5);
        });
    });

    describe('- first,', function () {
        describe('has no predicate,', function () {
            function getter(enumerable) {
                return enumerable.first();
            }

            describe('is empty', function () {
                it('should throw error', function () {
                    expect(function () {
                        photon.enumerable([]).first()
                    }).toThrow(ERROR_NO_MATCH);
                });
            });

            describeScalar('is not empty',
                function () {
                    return photon.enumerable([1, 2, 3]);
                },
                getter, 1);
        });

        describe('has predicate,', function () {
            describe('is empty', function () {
                it('should throw error', function () {
                    expect(function () {
                        photon.enumerable([]).first()
                    }).toThrow(ERROR_NO_MATCH);
                });
            });

            describe('has no matches', function () {
                it('should throw error', function () {
                    expect(function () {
                        photon.enumerable([2, 4]).first(matchOddNumbers)
                    }).toThrow(ERROR_NO_MATCH);
                });
            });

            describeScalar('has matches', function () {
                return photon.enumerable([2, 3, 4, 5]);
            }, function (enumerable) {
                return enumerable.first(matchOddNumbers, -1);
            }, 3);
        });
    });

    describe('- firstOrDefault,', function () {
        describe('has no predicate,', function () {
            function getter(enumerable) {
                return enumerable.firstOrDefault();
            }

            describeScalar('is empty with no default specified', function () {
                return photon.enumerable([]);
            }, getter, undefined);

            describeScalar('is empty with default specified',
                function () {
                    return photon.enumerable([]);
                },
                function (enumerable) {
                    return enumerable.firstOrDefault(null, -1);
                }, -1);

            describeScalar('is not empty',
                function () {
                    return photon.enumerable([1, 2, 3]);
                },
                getter, 1);
        });

        describe('has predicate,', function () {
            function getter(enumerable) {
                return enumerable.firstOrDefault(matchOddNumbers);
            }

            describeScalar('is empty with no default specified', function () {
                return photon.enumerable([]);
            }, getter, undefined);

            describeScalar('is empty with default specified', function () {
                return photon.enumerable([]);
            }, function (enumerable) {
                return enumerable.firstOrDefault(matchOddNumbers, -1);
            }, -1);

            describeScalar('has no matches with no default specified', function () {
                return photon.enumerable([2, 4]);
            }, getter, undefined);

            describeScalar('has no matches with default specified', function () {
                return photon.enumerable([2, 4]);
            }, function (enumerable) {
                return enumerable.firstOrDefault(matchOddNumbers, -1);
            }, -1);

            describeScalar('has matches', function () {
                return photon.enumerable([2, 3, 4, 5]);
            }, function (enumerable) {
                return enumerable.firstOrDefault(matchOddNumbers, -1);
            }, 3);
        });
    });

    describe('- min,', function () {
        function getter(enumerable) {
            return enumerable.min();
        }

        describeScalar('is empty', function () {
            return photon.enumerable([])
        }, getter, undefined);

        describeScalar('contains only numeric values', function () {
            return photon.enumerable([5, 2, 3, 7, 8, 4, 1, 56, 23]);
        }, getter, 1);

        describeScalar('contains only boolean values', function () {
            return photon.enumerable([true, false]);
        }, getter, false);

        describeScalar('contains only string values', function () {
            return photon.enumerable(['Peter', 'Larry', 'Paul', 'Larrs']);
        }, getter, 'Larrs');

        describeScalar('contains mixed types and first element is a number', function () {
            return photon.enumerable([3, '2', '1', 0.5, 1.5, true]);
        }, getter, 0.5);

        describeScalar('contains mixed types and first element is a string', function () {
            return photon.enumerable(['Peter', 1, false, 'Larry']);
        }, getter, 'Larry');
    });

    describe('- max,', function () {
        function getter(enumerable) {
            return enumerable.max();
        }

        describeScalar('is empty', function () {
            return photon.enumerable([])
        }, getter, undefined);

        describeScalar('contains only numeric values', function () {
            return photon.enumerable([5, 2, 3, 7, 8, 4, 1, 56, 23]);
        }, getter, 56);

        describeScalar('contains only boolean values', function () {
            return photon.enumerable([true, false]);
        }, getter, true);

        describeScalar('contains only string values', function () {
            return photon.enumerable(['Peter', 'Larry', 'Paul', 'Larrs']);
        }, getter, 'Peter');

        describeScalar('contains mixed types and first element is a number', function () {
            return photon.enumerable([3, '2', '1', 1.5, false]);
        }, getter, 3);

        describeScalar('contains mixed types and first element is a string', function () {
            return photon.enumerable(['Peter', 1, false, 'Larry']);
        }, getter, 'Peter');
    });

    describe('- average,', function () {
        function getter(enumerable) {
            return enumerable.average();
        }

        describeScalar('is empty', function () {
            return photon.enumerable([])
        }, getter, NaN);

        describeScalar('contains only numeric values', function () {
            return photon.enumerable([5, 2, 3, 7, 8, 4, 1, 56, 23]);
        }, getter, 109 / 9);

        describeScalar('contains only boolean values', function () {
            return photon.enumerable([true, false]);
        }, getter, 0.5);

        describeScalar('contains only string values', function () {
            return photon.enumerable(['Peter', 'Larry', 'Paul', 'Larrs']);
        }, getter, NaN);

        describeScalar('contains mixed types coercible to number', function () {
            return photon.enumerable([3, '2', '1', 1.5, false]);
        }, getter, 7.5 / 5);

        describeScalar('contains mixed types not coercible to number', function () {
            return photon.enumerable(['Peter', 1, false, 'Larry']);
        }, getter, NaN);
    });


    describe('- orderBy,', function () {
        var n2Data = [
            {
                first:'a', second:'f'
            },
            {
                first:'b', second:'g'
            },
            {
                first:'a', second:'a'
            }
        ];

        var n3Data = [
            {
                first:'a', second:'f', third:'b'
            },
            {
                first:'b', second:'g', third:'a'
            },
            {
                first:'a', second:'a', third:'a'
            },
            {
                first:'a', second:'f', third:'a'
            }
        ];


        var uniqueData = [
            {a:5},
            {a:2},
            {a:9},
            {a:4},
            {a:1}
        ];

        describeNonScalar('isEmpty', function () {
            return photon.enumerable([])
                .orderBy();
        }, []);

        describeNonScalar('selector function', function () {
            return photon.enumerable(uniqueData)
                .orderBy(function (x) {
                    return x.a;
                });
        }, [uniqueData[4], uniqueData[1], uniqueData[3], uniqueData[0], uniqueData[2]]);

        describeNonScalar('selector property', function () {
            return photon.enumerable(uniqueData).orderBy('a');
        }, [uniqueData[4], uniqueData[1], uniqueData[3], uniqueData[0], uniqueData[2]]);

        describeNonScalar('no selector', function () {
            return photon.enumerable([3, 5, 2, 1, 6])
                .orderBy();
        }, [1, 2, 3, 5, 6]);

        describeNonScalar('selector array', function () {
            return photon.enumerable(n3Data).orderBy(['first', function (x) {
                return x.second;
            }, 'third']);
        }, [n3Data[2], n3Data[3], n3Data[0], n3Data[1]]);

        describeNonScalar('followed with thenBy', function () {
            return photon.enumerable(n2Data)
                .orderBy(function (x) {
                    return x.first;
                })
                .thenBy(function (x) {
                    return x.second;
                });
        }, [n2Data[2], n2Data[0], n2Data[1]]);

        describeNonScalar('followed with thenBy, thenBy', function () {
            return photon.enumerable(n3Data).orderBy('first').thenBy('second').thenBy('third')
        }, [n3Data[2], n3Data[3], n3Data[0], n3Data[1]]);

        describeNonScalar('followed with thenBy using selector array', function () {
            return photon.enumerable(n3Data).orderBy('first').thenBy(['second', function (x) {
                return x.third;
            }]);
        }, [n3Data[2], n3Data[3], n3Data[0], n3Data[1]]);

        var comparerData = [
            'bf',
            'ba',
            'ab',
            'aa',
            'ah'
        ];

        function comparer(x, y) {
            x = x.charAt(0);
            y = y.charAt(0);
            return x < y ? -1 : (x > y ? 1 : 0);
        }

        describeNonScalar('comparer', function () {
            return photon.enumerable(comparerData).orderBy(null, comparer);
        }, comparerData.slice(0).sort(comparer));
    });


    describe('- sum,', function () {
        function getter(enumerable) {
            return enumerable.sum();
        }

        describeScalar('is empty', function () {
            return photon.enumerable([])
        }, getter, NaN);

        describeScalar('contains only numeric values', function () {
            return photon.enumerable([5, 2, 3, 7, 8, 4, 1, 56, 23]);
        }, getter, 109);

        describeScalar('contains only boolean values', function () {
            return photon.enumerable([true, false]);
        }, getter, 1);

        describeScalar('contains only string values', function () {
            return photon.enumerable(['Peter', 'Larry', 'Paul', 'Larrs']);
        }, getter, NaN);

        describeScalar('contains mixed types coercible to number', function () {
            return photon.enumerable([3, '2', '1', 1.5, false]);
        }, getter, 7.5);

        describeScalar('contains mixed types not coercible to number', function () {
            return photon.enumerable(['Peter', 1, false, 'Larry']);
        }, getter, NaN);
    });

    describe('- concat,', function () {
        describeNonScalar('is empty, concat none', function () {
            return photon.enumerable([]).concat();
        }, []);

        describeNonScalar('is empty, concat single', function () {
            return photon.enumerable([]).concat([1]);
        }, [1]);

        describeNonScalar('is not empty, concat single', function () {
            return photon.enumerable([1, 2, 3]).concat([4, 5]);
        }, [1, 2, 3, 4, 5]);

        describeNonScalar('is not empty, concat multiple', function () {
            return photon.enumerable([1, 2, 3]).concat([4, 5], [6, 7], [8, 9]);
        }, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });
});

function timeIt(callback, operation) {
    var t = (new Date()).getTime();
    callback();
    console.log('Operation: %s took %dms.', operation, ((new Date()).getTime() - t));
}

describe('Perf', function () {
    it('should', function () {
//        var p = [];
//        for (var i = 0; i < 1000000; i++) {
//            p.push(Math.floor(Math.random() * 1000000));
//        }
//
//        for (var i = 0; i < 10; i++) {
//            timeIt(function () {
//                p.slice(0).sort();
//            }, 'Array.sort');
//
//
//            timeIt(function () {
//                photon.enumerable(p).orderBy().toArray();
//            }, 'Enumerable.orderBy');
//        }
        function ExpensiveSortProperty() {
            this.value_ = Math.floor(Math.random() * 1000000);
        }

        ExpensiveSortProperty.prototype.value = function () {
            for (var i = 0; i < 10000; i++) {
            }
            return this.value_;
        }
        var p = [];
        for (var i = 0; i < 1000; i++) p.push(new ExpensiveSortProperty());

        timeIt(function () {
            p.sort(function (x, y) {
                x = x.value();
                y = y.value();
                return x > y ? 1 : (x < y ? -1 : 0);
            });

        });


        timeIt(function () {
            photon.enumerable(p).select(function (x) {
                return {
                    x:x,
                    v:x.value()
                }
            }).orderBy(function (x) {
                    return x.v;
                }).select(function (x) {
                    return x.x;
                }).toArray();

        });
    });


});