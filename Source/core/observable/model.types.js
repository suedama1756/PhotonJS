/** @namespace photon.observable.model.types */
provide("photon.observable.model.types");

photon.extend(photon.observable.model.types, {
    "Boolean":{
        coerce:photon.object.toBoolean,
        initialValue:false
    },

    "Boolean?":{
        coerce:photon.object.toNullableBoolean,
        initialValue:null
    },

    "String":{
        coerce:photon.object.toText,
        initialValue:""
    },

    "String?":{
        coerce:photon.object.toNullableText,
        initialValue:null
    },

    "Number":{
        coerce:photon.object.toNumber,
        initialValue:false
    },

    "Number?":{
        coerce:photon.object.toNullableNumber,
        initialValue:false
    },

    "ObservableArray": {
        coerce:function(newValue, oldValue) {
            if (photon.isNullOrUndefined(newValue)) {
                return newValue;
            }

            if (!oldValue) {
                oldValue = new photon.observable.Array();
            }
            oldValue.set(newValue);

            return oldValue;
        },
        initializer:function() {
            return new photon.observable.Array();
        }
    }
});