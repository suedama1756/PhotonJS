function analyzeDependencies(fnOrArray) {
    var fn = fnOrArray, deps = fnOrArray.$dependencies;
    if (isArray(fnOrArray)) {
        var fnIndex = fnOrArray.length - 1;
        fn = fnOrArray[fnIndex];
        deps = fnOrArray.slice(0, fnIndex);
    }
    return { fn: fn, deps: deps || []};
}

function registration(contract) {
    var name, factory, lifetimeManager, memberOf;

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

            function FactoryType() {
            }

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
        memberOf: function (value) {
            memberOf = value;
            return this;
        },
        build: function () {
            if (!factory) {
                throw new Error('Registration has no resolver.')
            }

            lifetimeManager = lifetimeManager || singletonLifetime;
            return {
                name: name,
                memberOf: memberOf,
                resolver: function (context) {
                    return lifetimeManager(context, factory, contract, name);
                },
                contract: contract
            };
        }
    }
}