describe('observer', function () {
    var observer = photon.observer, log;

    function logger() {
        var _entries = {};

        function getOrCreateEntry(expression) {
            return _entries[expression] || (_entries[expression] = {
                evaluationCount: 0,
                changes: []
            });
        }

        return {
            changeSequence: function (expression) {
                var entry = _entries[expression];
                if (entry) {
                    return photon.enumerable(entry.changes).select('newValue').toArray();
                }
                return [];
            },
            changes: function (expression) {
                return (_entries[expression] && _entries[expression].changes) || [];
            },
            evaluationCount: function (expression) {
                return (_entries[expression] && _entries[expression].evaluationCount) || 0;
            },
            evaluated: function (expression) {
                getOrCreateEntry(expression).evaluationCount++;
            },
            changed: function (expression, newValue, oldValue) {
                var entry = getOrCreateEntry(expression);
                entry.changes.push({newValue: newValue, oldValue: oldValue});
            },
            waitForChange: function (expression, value) {
                waitsFor(function () {
                    var changes = this.changes(expression);
                    return changes.length && changes[changes.length - 1].newValue === value;
                }.bind(this));
            }
        }
    }

    beforeEach(function () {
        log = logger();
    });

    function parse(expression) {
        return photon.parser().parse(expression);
    }

    function observe(obj, expression) {
        var sut = observer(obj);

        // wrap the expression with logging capabilities
        var parsedExpression = parse(expression),
            logEvaluator = photon.extend(function (self) {
                log.evaluated(expression);
                return parsedExpression(self);
            }, parsedExpression);

        sut.observe(logEvaluator, function (newValue, oldValue) {
            log.changed(expression, newValue, oldValue);
        });

        return sut;
    }

    function observeAndMutate(obj, expression, mutator, shouldSync) {
        var sut = observe(obj, expression);
        mutator(obj);
        if (shouldSync) {
            sut.sync();
        }
        return sut;
    }

    if (observer.isObserveSupportedNatively) {
        /**
         * When native observation is supported we do not expect to have to call sync (for normal properties).
         *
         * NOTE: Because property change notifications are not synchronous we must wait for the notifications when
         * using native observe.
         */
        describe('when Object.observe is available', function () {
            beforeEach(function () {
                photon.observer.disableNativeObserve = false;
            });

            describe('when a single property expression is changed', function () {
                beforeEach(function () {
                    observeAndMutate({a: 0}, 'a',
                        function (obj) {
                            obj.a++;
                        }, false);
                    log.waitForChange('a', 1);
                });

                it('should notify handler once', function () {
                    runs(function () {
                        expect(log.changes('a').length).toBe(2);
                    });
                });

                it('should notify handler supplying both old and new values', function () {
                    runs(function () {
                        expect(log.changes('a')[1]).toEqual({
                            oldValue: 0,
                            newValue: 1
                        });
                    });
                });
            });

            describe('when a nested property expression is changed', function () {
                beforeEach(function () {
                    observeAndMutate({a: {b: 1}}, 'a.b',
                        function (obj) {
                            obj.a.b++;
                        }, false);
                    log.waitForChange('a.b', 2);
                });

                it('should notify handler once', function () {
                    runs(function() {
                        expect(log.changes('a.b').length).toBe(2);
                    });
                });

                it('should notify handler supplying both old and new values', function () {
                    runs(function() {
                        expect(log.changes('a.b')[1]).toEqual({
                            oldValue: 1,
                            newValue: 2
                        });
                    });
                });
            });

            describe('when an expression containing two property paths where one path is a sub expression of the other', function () {
                beforeEach(function () {
                    observeAndMutate({a: {b: 1}}, 'a && a.b',
                        function (obj) {
                            obj.a = null;
                        }, false);
                    log.waitForChange('a && a.b', null);
                });

                it('should notify handler once', function () {
                    runs(function() {
                        expect(log.changes('a && a.b').length).toBe(2);
                    });
                });

                it('should notify handler supplying both old and new values', function () {
                    runs(function() {
                        expect(log.changes('a && a.b')[1]).toEqual({
                            oldValue: 1,
                            newValue: null
                        });
                    });
                });

                it('should evaluate expression once', function () {
                    expect(log.evaluationCount('a && a.b')).toBe(2);
                });
            });
        });
    }

    describe('when manually observing expressions', function () {
        beforeEach(function() {
            photon.observer.disableNativeObserve = true;
        });

        describe('when a new expression is observed', function () {
            it('should notify handler with initial value', function () {
                observe({a: 1}, 'a');
                expect(log.changeSequence('a')).toEqual([1]);
            });
        });

        describe('when a single property expression is changed', function () {
            beforeEach(function () {
                observeAndMutate({a: 0}, 'a',
                    function (obj) {
                        obj.a++;
                    }, true);
            });

            it('should notify handler once', function () {
                expect(log.changes('a').length).toBe(2);
            });

            it('should notify handler supplying both old and new values', function () {
                expect(log.changes('a')[1]).toEqual({
                    oldValue: 0,
                    newValue: 1
                });
            });
        });

        describe('when a nested property expression is changed', function () {
            beforeEach(function () {
                observeAndMutate({a: {b: 1}}, 'a.b',
                    function (obj) {
                        obj.a.b++;
                    }, true);
            });

            it('should notify handler once', function () {
                expect(log.changes('a.b').length).toBe(2);
            });

            it('should notify handler supplying both old and new values', function () {
                expect(log.changes('a.b')[1]).toEqual({
                    oldValue: 1,
                    newValue: 2
                });
            });
        });

        describe('when an expression containing two property paths where one path is a sub expression of the other', function () {
            beforeEach(function () {
                observeAndMutate({a: {b: 1}}, 'a && a.b',
                    function (obj) {
                        obj.a = null;
                    }, true);
            });

            it('should notify handler once', function () {
                expect(log.changes('a && a.b').length).toBe(2);
            });

            it('should notify handler supplying both old and new values', function () {
                expect(log.changes('a && a.b')[1]).toEqual({
                    oldValue: 1,
                    newValue: null
                });
            });

            it('should evaluate expression once', function () {
                expect(log.evaluationCount('a && a.b')).toBe(2);
            });
        });
    });
});
