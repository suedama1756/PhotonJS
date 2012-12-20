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

photon.module = module;