/**
 * @typedef {
 *     defines : (function(function|object) : TypeBuilder)
 * }
 */
var TypeBuilder;


/**
 * @param constructor
 * @return {TypeBuilder}
 */
function type(constructor) {
    var members_ = {

    };

    var typeInfo_ = {
        name : null,
        baseType : null,
        base : null,
        type : null
    };

    return  {
        'name':function (name) {
            typeInfo_.name = name;
            return this;
        },
        'inherits':function (baseType) {
            typeInfo_.baseType = baseType;
            return this;
        },
        'defines':function (members) {
            if (isFunction(members)) {
                members = members(function() {
                    return typeInfo_.base;
                });
            }
            extend(members_, members);
            return this;
        },
        'build':function () {
            if (isNullOrUndefined(constructor)) {
                constructor = function () {
                };
            }
            typeInfo_.name = typeInfo_.name || constructor.name;


            // how do we avoid this, can we simply create a constructor with two many arguments? is that faster?
            /*
                Why are we trying to do this again? Because we can FIX methods like toString, valueOf in IE...
                Should also copy existing methods from constructor prototype.
                Calling base on toString for types in IE will probably fail, we need to validate this.
             */

            if (!members_.hasOwnProperty('toString')) {
                members_['toString'] = function() {
                    return "[object " + (typeInfo_.name || "Object") + "]";
                };
            }

            function Prototype() {
            }

            if (typeInfo_.baseType) {
                typeInfo_.base = typeInfo_.baseType.prototype;
                Prototype.prototype = typeInfo_.base;
            }

            var typeInfo = {
                'name':function () {
                    return typeInfo_.name;
                },
                'baseType':function () {
                    return typeInfo_.baseType;
                }
            };

            constructor['typeInfo'] = function () {
                return typeInfo;
            };
            var prototype = constructor.prototype = new Prototype();
            prototype.constructor = constructor;

            if (members_) {
                photon.extend(prototype, members_,
                    photon.extend.filterHasOwnProperty, function (source, propertyName) {
                        return source[propertyName];
                    });
            }
            prototype['__TYPE_INFO__'] = constructor['typeInfo'];
            return constructor;
        }
    };
}

photon['typeInfo'] = function (obj) {
    return obj['__TYPE_INFO__']();
};

photon['type'] = type;
