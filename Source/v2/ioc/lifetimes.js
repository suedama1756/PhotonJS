function singletonLifetime(context, factory, contract, name) {
    // create objects through the root scope
    return context.root(context, factory, contract, name);
}

function transLifetime(context, factory) {
    // create object directly, not cached anywhere
    return factory(context);
}

function scopeLifetime(context, factory, contract, name) {
    // create objects through the current scope
    return context.current(context, factory, contract, name);
}