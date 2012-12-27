function analyzeDependencies(fnOrArray) {
    var fn = fnOrArray, deps = fnOrArray.$dependencies;
    if (isArray(fnOrArray)) {
        var fnIndex = fnOrArray.length - 1;
        fn = fnOrArray[fnIndex];
        deps = fnOrArray.slice(0, fnIndex);
    }
    return { fn: fn, deps: deps || []};
}

function mapArguments(dependencies, context, parameterOverrides) {
    return dependencies.map(function (dependency) {
        if (parameterOverrides && parameterOverrides.hasOwnProperty(dependency)) {
            return parameterOverrides[dependency];
        } else {
            return context.resolve(dependency);
        }
    });
}

function registration(contract) {
    var name, factory, lifetimeManager, memberOf;

    return {
        factory: function (value) {
            var analysis = analyzeDependencies(value), deps = analysis.deps, fn = analysis.fn;
            factory = function (context, parameterOverrides) {
                var args = mapArguments(deps, context, parameterOverrides);
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
            var analysis = analyzeDependencies(value), deps = analysis.deps, fn = analysis.fn;

            function FactoryType() {
            }

            FactoryType.prototype = fn.prototype;

            if (!(factory = fn.$containerFactory)) {
                factory = fn.$containerFactory = function (context, parameterOverrides) {
                    var result = new FactoryType();
                    fn.apply(result, mapArguments(deps, context, parameterOverrides));
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
                resolver: function (context, parameterOverrides) {
                    return lifetimeManager(context, factory, contract, name, parameterOverrides);
                },
                contract: contract
            };
        }
    }
}