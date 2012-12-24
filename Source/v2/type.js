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
    var _members = {},
        _staticMembers = {},
        _typeInfo = {
            name: null,
            baseType: null,
            base: null,
            type: null
        };

    return  {
        'name': function (name) {
            _typeInfo.name = name;
            return this;
        },
        'inherits': function (baseType) {
            _typeInfo.baseType = baseType;
            return this;
        },
        'defines': function (members) {
            if (isFunction(members)) {
                members = members(function () {
                    return _typeInfo.base;
                });
            }
            extend(_members, members);
            return this;
        },
        'definesStatic': function (members) {
            if (isFunction(members)) {
                members = members(function () {
                    return _typeInfo.base;
                });
            }
            extend(_staticMembers, members);
            return this;
        },
        'exports': function (callback) {
            extend(_members, callback(_members));
            return this;
        },
        'build': function () {
            if (isNullOrUndefined(constructor)) {
                constructor = function () {
                };
            }
            _typeInfo.name = _typeInfo.name || constructor.name;

            if (!_members.hasOwnProperty('toString')) {
                _members['toString'] = function () {
                    return "[object " + (_typeInfo.name || "Object") + "]";
                };
            }

            function Prototype() {
            }

            if (_typeInfo.baseType) {
                _typeInfo.base = _typeInfo.baseType.prototype;
                Prototype.prototype = _typeInfo.base;
            }

            var typeInfo = {
                'name': function () {
                    return _typeInfo.name;
                },
                'baseType': function () {
                    return _typeInfo.baseType;
                }
            };

            constructor['typeInfo'] = function () {
                return typeInfo;
            };
            var prototype = constructor.prototype = new Prototype();
            prototype.constructor = constructor;

            if (_members) {
                photon.extend(prototype, _members,
                    photon.extend.filterHasOwnProperty, function (source, propertyName) {
                        return source[propertyName];
                    });
            }
            prototype['__TYPE_INFO__'] = constructor['typeInfo'];
            return extend(constructor, _staticMembers);
        }
    };
}

photon['typeInfo'] = function (obj) {
    return obj['__TYPE_INFO__']();
};

photon['type'] = type;
