function scope(parent) {
    function ctor() {
    }

    ctor.prototype = parent || new (function () {
    });
    return new ctor();
}


photon['scope'] = scope;


function rootScope() {
}

type(rootScope)['defines'](
    {
        $new: function() {

        }
    }
);