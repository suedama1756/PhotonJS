function container(modules) {
    var _configMap = {}, _context;

    function getResolver(contract, name) {
        var contractConfig = _configMap[contract], registration;
        if (contractConfig) {
            if (name) {
                registration = contractConfig.keys[name];
            } else {
                registration = contractConfig.main;
            }
        }
        return registration ? registration.resolver : null;
    }

    function resolve(contract, name, parameterOverrides) {
        var result = tryResolve(contract, name, parameterOverrides);
        if (!result) {
            throw new Error('Could not resolve instance: ' + contract + ':' + (name || ''));
        }
        return result;
    }

    function tryResolve(contract, name, parameterOverrides) {
        if (!parameterOverrides && name && !isPrimitive(name)) {
            parameterOverrides = name;
            name = '';
        }

        var resolver = getResolver(contract, name);
        return resolver ?
            resolver(_context, parameterOverrides) :
            null;
    }

    function createScope() {
        var _cache = {};

        function resolveInScope(context, factory, contract, name, parameterOverrides) {
            var key = contract + ':';
            if (name) {
                key += name;
            }
            return _cache[key] || (_cache[key] = factory(context, parameterOverrides));
        }

        if (!_context.root) {
            _context.current = _context.root = resolveInScope;
        }

        return {
            using: function (callback) {
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
            dispose: function () {
                if (!_cache) {
                    return;
                }
                _cache = null;
                _
            }
        }
    }

    // initialize the content and root scope
    _context = {
        resolve: resolve
    };
    createScope();

    function containerConfig() {
        return {
            main: null,
            keys: {}
        };
    }

    function addCollectionMember(collection, member) {
        var collectionConfig = _configMap[collection] ||
            (_configMap[collection] = containerConfig());

        if (!collectionConfig.members) {
            collectionConfig.members = [];
            collectionConfig.main = registration(collection).factory(function () {
                return collectionConfig.members.map(function (member) {
                    return member.resolver(_context);
                });
            }).trans().build()
        }

        collectionConfig.members.push(member);
    }

    enumerable(modules).select(
        function (module) {
            return module();
        }).forEach(function (regs) {
            regs.forEach(function (reg) {
                var current = _configMap[reg.contract] ||
                    (_configMap[reg.contract] = containerConfig());

                if (reg.memberOf) {
                    addCollectionMember(reg.memberOf, req);
                }

                if (reg.name) {
                    current.keys[reg.name] = reg;
                } else {
                    current.main = reg;
                }
            });
        });
    return {
        resolve: resolve,
        tryResolve: tryResolve,
        createScope: createScope
    }
}

photon.container = container;