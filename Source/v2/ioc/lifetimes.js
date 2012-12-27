function singletonLifetime(context, factory, contract, name, parameterOverrides) {
    // create objects through the root scope
    return context.root(context, factory, contract, name, parameterOverrides);
}

function transLifetime(context, factory, parameterOverrides) {
    // create object directly, not cached anywhere
    return factory(context, parameterOverrides);
}

function scopeLifetime(context, factory, contract, name, parameterOverrides) {
    // create objects through the current scope
    return context.current(context, factory, contract, name, parameterOverrides);
}