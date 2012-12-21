describe('container', function () {
    function valueFactory(value) {
        return function () {
            return value;
        }
    }

    function buildContainer(configure) {
        return photon.container([photon.module(configure)]);
    }

    describe('when resolving', function () {
        describe('from factory', function () {
            describe('with no dependencies', function () {
                it('should resolve', function () {
                    var container = buildContainer(function (builder) {
                        builder.factory('A', valueFactory('X'));
                    });
                    expect(container.resolve('A')).toBe('X');
                });
            });

            describe('with resolvable explicit dependencies', function () {
                it('should resolve', function () {
                    var container = buildContainer(function (builder) {
                        builder.factory('A', valueFactory('X'));
                        builder.factory('B', ['A', function (a) {
                            return a + a;
                        }]);
                    });
                    expect(container.resolve('B')).toBe('XX');
                });
            });

            describe('with resolvable attributed dependencies', function () {
                it('should resolve', function () {
                    var container = buildContainer(function (builder) {
                        builder.factory('A', valueFactory('X'));
                        builder.factory('B', photon.extend(function (a) {
                            return a + a;
                        }, {
                            $dependencies: ['A']
                        }));
                    });
                    expect(container.resolve('B')).toBe('XX');
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

            function TypeB(dependency) {
                this.value = 'B' + (dependency && dependency.value);
            }

            describe('with no dependencies', function () {
                var resolved;
                beforeEach(function() {
                    var container = buildContainer(function (builder) {
                        builder.type('A', TypeA);
                    });

                    resolved = container.resolve('A');
                });

                it('should resolve', function () {
                    expect(resolved && resolved.value).toBe('A');
                });

                it('should be of the correct type', function () {
                    expect(resolved instanceof  TypeA).toBe(true);
                });
            });

            describe('with resolvable explicit dependencies', function () {
                var resolved;
                beforeEach(function() {
                    var container = buildContainer(function (builder) {
                        builder.type('A', TypeA);
                        builder.type('B', ['A', TypeB]);
                    });

                    resolved = container.resolve('B');
                });

                it('should resolve', function () {
                    expect(resolved && resolved.value).toBe('BA');
                });

                it('should be of the correct type', function () {
                    expect(resolved instanceof  TypeB).toBe(true);
                });
            });

            describe('with resolvable attributed dependencies', function () {
                var resolved;
                beforeEach(function() {
                    var container = buildContainer(function (builder) {
                        builder.type('A', TypeA);
                        builder.type('B', photon.extend(TypeB, {
                            $dependencies: ['A']
                        }));
                    });

                    resolved = container.resolve('B');
                });

                it('should resolve', function () {
                    expect(resolved && resolved.value).toBe('BA');
                });

                it('should be of the correct type', function () {
                    expect(resolved instanceof  TypeB).toBe(true);
                });
            });
        });
    });
});
