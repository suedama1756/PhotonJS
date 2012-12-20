function singletonLifetime(context, factory, contract, name) {
    return context.root(context, factory, contract, name);
}

function transLifetime(context, factory) {
    return factory(context);
}

function scopeLifetime(context, factory, contract, name) {
    return context.current(context, factory, contract, name);
}

function analyzeDependencies(fnOrArray) {
    var fn = fnOrArray, deps = fnOrArray.$dependencies;
    if (isArray(fnOrArray)) {
        var fnIndex = fnOrArray.length - 1;
        fn = fnOrArray[fnIndex];
        deps= fnOrArray.slice(0, fnIndex);
    }
    return { fn: fn, deps: deps || []};
}

function registration(contract) {
    var name, factory, lifetimeManager;

    return {
        factory: function (value) {
            var analysis = analyzeDependencies(value), deps = analysis.deps, fn = analysis.fn;
            factory = function (context) {
                var args = deps.map(function (dep) {
                    return context.resolve(dep);
                });
                return fn.apply(this, args);
            };
            return this;
        },
        instance: function (value) {
            factory = function () {
                return value;
            };
            return this;
        },
        type: function (value) {
            var analysis = analyzeDependencies(value), fn = analysis.fn;

            function FactoryType() {}
            FactoryType.prototype = fn.prototype;

            if (!(factory = fn.$containerFactory)) {
                factory = fn.$containerFactory = function (context) {
                    var args = analysis.deps.map(function (dep) {
                            return context.resolve(dep);
                        }),
                        result = new FactoryType();
                    fn.apply(result, args);
                    return result;
                }
            }

            return this;
        },
        trans: function () {
            lifetimeManager = transLifetime;
            return this;
        },
        singleton: function () {
            lifetimeManager = singletonLifetime;
            return this;
        },
        scope: function () {
            lifetimeManager = scopeLifetime;
            return this;
        },
        name: function (value) {
            name = value;
            return this;
        },
        build: function () {
            if (!factory) {
                throw new Error('Registration has no resolver.')
            }

            lifetimeManager = lifetimeManager || singletonLifetime;
            return {
                name: name,
                resolver: function(context) {
                    return lifetimeManager(context, factory, contract, name);
                },
                contract: contract
            };
        }
    }
}

function module(build) {
    return function () {
        var registrations = [], builder = new ModuleBuilder(
            function (contract) {
                var result = registration(contract);
                registrations.push(result);
                return result;
            });
        build(builder);
        return enumerable(registrations).select(function (registration) {
            return registration.build();
        });
    };
}

var ModuleBuilder = type(
    function (registration) {
        this.registration = registration;
    }).defines(
    /**
     * @lends ModuleBuilder
     */
    {
        factory: function (contract, factory) {
            return this.registration(contract)
                .factory(factory);
        },
        type: function (contract, type) {
            return this.registration(contract)
                .type(type);
        },
        instance: function (contract, instance) {
            return this.registration(contract)
                .instance(instance);
        },
        directive: function (name) {
            return this.registration('Directive')
                .name(name);
        },
        controller: function (name) {
            return this.registration('Controller')
                .name(name);
        }
    }).build();

function container(modules) {
    var _contractConfigMap = {}, _context;


    function getResolver(contract, name) {
        var contractConfig = _contractConfigMap[contract], registration;
        if (contractConfig) {
            if (name) {
                registration = contractConfig.map[name];
            } else {
                registration = contractConfig.primary;
            }
        }
        return registration ? registration.resolver : null;

    }

    function resolve(contract, name) {
        var result = tryResolve(contract, name);
        if (!result) {
            throw new Error();
        }
        return result;
    }

    function tryResolve(contract, name) {
        var resolver = getResolver(contract, name);
        return resolver ?
            resolver(_context) :
            null;
    }

    function newScope() {
        var _cache = {};

        function resolveInScope(context, factory, contract, name) {
            var key = contract + ':';
            if (name) {
                key += name;
            }
            return _cache[key] || (_cache[key] = factory(context));
        }

        if (!_context.root) {
            _context.current = _context.root = resolveInScope;
        }

        return {
            using : function(callback) {
                if (this._cache) {
                    throw new Error('Object disposed');
                }

                var previous = _context.current;
                _context.current = resolveInScope;
                try {
                    callback();
                } finally {
                    _context.current = previous;
                }
            },
            dispose : function() {
                if (!_cache) {
                    return;
                }
                _cache = null;_
            }
        }
    }

    _context = {
        resolve : resolve
    };
    newScope();

    enumerable(modules).select(
        function (module) {
            return module();
        }).forEach(function (registrations) {
            registrations.forEach(function (registration) {
                var current = _contractConfigMap[registration.contract] || (_contractConfigMap[registration.contract] = {
                    primary: null,
                    registrations: [],
                    map: {}
                });
                if (registration.name) {
                    current.map[registration.name] = registration;
                } else {
                    current.primary = registration;
                }
                current.registrations.push(registration);
            });
        });
    return {
        resolve : resolve,
        tryResolve : tryResolve,
        newScope : newScope
    }
}

photon.container = container;

photon.module = module;