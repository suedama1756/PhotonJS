describe('container', function () {
    function valueFactory(value) {
        return function () {
            return value;
        }
    }

    function addDependencies(fn, dependencies) {
        fn.$dependencies = dependencies;
        return fn;
    }

    function buildContainer(configure) {
        return photon.container([photon.module(configure)]);
    }

    describe('when resolving', function () {
        describe('from factory', function () {
            function resolveExplicit(contract) {
                var container = buildContainer(function (builder) {
                    builder.factory('A', valueFactory('A'));
                    builder.factory('B', ['A', function (a) {
                        return a + 'B';
                    }]);
                    builder.factory('C', ['A', 'B', function (a, b) {
                        return a + b + 'C';
                    }]);
                });
                return container.resolve(contract);
            }

            function resolveAttributed(contract) {
                var container = buildContainer(function (builder) {
                    builder.factory('A', valueFactory('A'));
                    builder.factory('B', addDependencies(function (a) {
                        return a + 'B';
                    }, ['A']));
                    builder.factory('C', addDependencies(function (a, b) {
                            return a + b + 'C';
                        }, ['A', 'B']));
                });
                return container.resolve(contract);
            }

            describe('with no dependencies', function () {
                it('should resolve', function () {
                    expect(resolveExplicit('A')).toBe('A');
                });
            });

            describe('with one resolvable explicit dependency', function () {
                it('should resolve', function () {
                    expect(resolveExplicit('B')).toBe('AB');
                });
            });

            describe('with one resolvable attributed dependency', function () {
                it('should resolve', function () {
                    expect(resolveAttributed('B')).toBe('AB');
                });
            });

            describe('with many resolvable explicit dependencies', function () {
                it('should resolve', function () {
                    expect(resolveExplicit('C')).toBe('AABC');
                });
            });

            describe('with many resolvable attributed dependencies', function () {
                it('should resolve', function () {
                    expect(resolveAttributed('C')).toBe('AABC');
                });
            });

            describe('with explicit and attributed dependencies', function() {
                it ('should prioritize explicit dependencies', function() {
                    var resolved = buildContainer(function(builder) {
                        builder.factory('A', valueFactory('A'));
                        builder.factory('B', ['A', addDependencies(function (a) {
                            return a + 'B';
                        }, ['C'])]);
                    }).resolve('B');
                    expect(resolved).toBe('AB');
                });
            });
        });

        describe('from instance', function () {
            it('should resolve', function () {
                var container = buildContainer(function (builder) {
                    builder.instance('A', 'X');
                });
                expect(container.resolve('A')).toBe('X');
            });
        });

        describe('from type', function () {
            function TypeA() {
                this.value = 'A';
            }

            function TypeB(a) {
                this.value = (a && a.value) + 'B';
            }

            function TypeC(a, b) {
                this.value = (a && a.value) + (b && b.value) + 'C';
            }

            function resolveExplicit(contract) {
                // remove previously attributed dependencies
                delete TypeA.$dependencies;
                delete TypeB.$dependencies;
                delete TypeC.$dependencies;

                var container = buildContainer(function (builder) {
                    builder.type('A', TypeA);
                    builder.type('B', ['A', TypeB]);
                    builder.type('C', ['A', 'B', TypeC]);
                });

                return container.resolve(contract);
            }

            function resolveAttributed(contract) {
                var container = buildContainer(function (builder) {
                    builder.type('A', TypeA);
                    builder.type('B', photon.extend(TypeB, {
                        $dependencies: ['A']
                    }));
                    builder.type('C', photon.extend(TypeC, {
                        $dependencies: ['A', 'B']
                    }));
                });

                return container.resolve(contract);
            }

            describe('with no dependencies', function () {
                var resolved;
                beforeEach(function () {
                    resolved = resolveExplicit('A');
                });

                it('should resolve', function () {
                    expect(resolved && resolved.value).toBe('A');
                });

                it('should be of the correct type', function () {
                    expect(resolved instanceof  TypeA).toBe(true);
                });
            });

            describe('with one resolvable explicit dependency', function () {
                var resolved;
                beforeEach(function () {
                    resolved = resolveExplicit('B');
                });

                it('should resolve', function () {
                    expect(resolved && resolved.value).toBe('AB');
                });

                it('should be of the correct type', function () {
                    expect(resolved instanceof  TypeB).toBe(true);
                });
            });

            describe('with one resolvable attributed dependency', function () {
                var resolved;
                beforeEach(function () {
                    resolved = resolveAttributed('B');
                });

                it('should resolve', function () {
                    expect(resolved && resolved.value).toBe('AB');
                });

                it('should be of the correct type', function () {
                    expect(resolved instanceof  TypeB).toBe(true);
                });
            });

            describe('with many resolvable explicit dependencies', function () {
                var resolved;
                beforeEach(function () {
                    resolved = resolveExplicit('C');
                });

                it('should resolve', function () {
                    expect(resolved && resolved.value).toBe('AABC');
                });

                it('should be of the correct type', function () {
                    expect(resolved instanceof  TypeC).toBe(true);
                });
            });

            describe('with many resolvable attributed dependencies', function () {
                var resolved;
                beforeEach(function () {
                    resolved = resolveAttributed('C');
                });

                it('should resolve', function () {
                    expect(resolved && resolved.value).toBe('AABC');
                });

                it('should be of the correct type', function () {
                    expect(resolved instanceof  TypeC).toBe(true);
                });
            });

            describe('with explicit and attributed dependencies', function() {
                it ('should prioritize explicit dependencies', function() {
                    var resolved = buildContainer(function(builder) {
                        builder.type('A', TypeA);
                        builder.type('B', ['A', addDependencies(TypeB, ['C'])]);
                    }).resolve('B');
                    expect(resolved && resolved.value).toBe('AB');
                });
            });
        });
    });
});
