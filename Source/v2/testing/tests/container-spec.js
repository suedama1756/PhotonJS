describe('container -', function () {
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

    describe('when using life time', function() {
        describe('singleton,', function() {
            it ('should return same instance over successive calls', function() {
                var container = buildContainer(function(builder) {
                    builder.factory('A', function() {
                       return {};
                    }).singleton();
                });
                expect(container.resolve('A')=== container.resolve('A')).toBe(true);
            });
        });

        describe('transient,', function() {
            it ('should return different instances over successive calls', function() {
                var container = buildContainer(function(builder) {
                    builder.factory('A', function() {
                        return {};
                    }).trans();
                });
                expect(container.resolve('A') === container.resolve('A')).toBe(false);
            });
        });

        describe('scope,', function() {
            describe('and resolving in same scope', function() {
                it ('should return same instance over successive calls', function() {
                    var container = buildContainer(function(builder) {
                        builder.factory('A', function() {
                            return {};
                        }).scope();
                    });

                    container.createScope().using(function() {
                        expect(container.resolve('A')=== container.resolve('A')).toBe(true);
                    });
                });
            });

            describe('and resolving in different scopes', function() {
                it ('should return different instances for each scope', function() {
                    var container = buildContainer(function(builder) {
                        builder.factory('A', function() {
                            return {};
                        }).scope();
                    });

                    var resolved1, resolved2;
                    container.createScope().using(function() {
                        resolved1 = container.resolve('A');
                    });
                    container.createScope().using(function() {
                        resolved2 = container.resolve('A');
                    });
                    expect(resolved1 === resolved2).toBe(false);
                });
            });
        });
    });

    describe('when using names', function() {
        var container;
        beforeEach(function() {
            container = buildContainer(function(builder) {
                builder.factory('A', valueFactory('NamedA')).name('NamedA');
                builder.factory('A', valueFactory('A'));
            });
        });

        it ('should resolve by name', function() {
            expect(container.resolve('A', 'NamedA')).toBe('NamedA');
        });

        it ('should resolve using non-named registration when no name is specified', function() {
            expect(container.resolve('A')).toBe('A');
        });
    });

    describe('when using collections', function() {
        var container;
        beforeEach(function() {
            container = buildContainer(function(builder) {
                builder.factory('A', valueFactory('A')).memberOf('Messages');
                builder.factory('B', valueFactory('B')).memberOf('Messages');
            });
        });

        it ('should resolve collection', function() {
            expect(container.resolve('Messages')).toEqual(['A', 'B']);
        });
    });
});
