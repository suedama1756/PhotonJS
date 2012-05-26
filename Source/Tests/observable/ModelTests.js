function makePrefixCoerce(prefix) {
    return function coerceA(value) {
        if (value && value.charAt(0) !== prefix) {
            value = prefix + value;
        }
        return value;
    };
}

prefixCoerceA = makePrefixCoerce('a');
prefixCoerceB = makePrefixCoerce('b');
prefixCoerceC = makePrefixCoerce('c');

DefineTestSuite("ModelTests",
    {
        "When subscribing to any change":{
            definition:{
                property1:null,
                property2:null
            },
            becauseOf:function () {
                var events = [];
                this.systemUnderTest_.subscribe(function (e) {
                    events.push(e);
                });
                this.systemUnderTest_.property1(1);
                this.systemUnderTest_.property1(2);
                this.systemUnderTest_.property2(1);

                // store events
                this.events = events;
            },
            "Should report correct details in change events":function () {
                assertEquals({
                    sender:this.systemUnderTest_,
                    propertyName:"property1",
                    oldValue:null,
                    newValue:1,
                    data:undefined
                }, this.events[0]);
                assertEquals({
                    sender:this.systemUnderTest_,
                    propertyName:"property1",
                    oldValue:1,
                    newValue:2,
                    data:undefined
                }, this.events[1]);
                assertEquals({
                    sender:this.systemUnderTest_,
                    propertyName:"property2",
                    oldValue:null,
                    newValue:1,
                    data:undefined
                }, this.events[2]);
            }
        },
        "When defined using a mixture of basic and complex property definitions":{
            definition: {
                a:{
                    initialValue:'1',
                    coerce:prefixCoerceA
                },
                b:null,
                c:{
                    initialValue:'c'
                },
                d:''
            },
            "Should configure definition correctly":function () {
                this.assertPropertyDefinition(
                    this.systemUnderTest_, 'a', {
                        initialValue:'1',
                        propertyName:'a',
                        coerce:prefixCoerceA
                    }
                );
                this.assertPropertyDefinition(
                    this.systemUnderTest_, 'b', {
                        initialValue:null,
                        propertyName:'b'
                    }
                );
                this.assertPropertyDefinition(
                    this.systemUnderTest_, 'c', {
                        initialValue:'c',
                        propertyName:'c'
                    }
                );
                this.assertPropertyDefinition(
                    this.systemUnderTest_, 'd', {
                        initialValue:'',
                        propertyName:'d'
                    }
                );
            },
            "Should initialize using correct initial values":function() {
                assertEquals('a1', this.systemUnderTest_.a());
                assertEquals(null, this.systemUnderTest_.b());
                assertEquals('c', this.systemUnderTest_.c());
                assertEquals('', this.systemUnderTest_.d());
            }
        },
        "When defined using basic property definitions":{
            definition: {
                name:'',
                dateOfBirth:null
            },
            "Should configure definition correctly":function () {
                this.assertPropertyDefinition(
                    this.systemUnderTest_, 'name', {
                        initialValue:'',
                        propertyName:'name'
                    }
                );
                this.assertPropertyDefinition(
                    this.systemUnderTest_, 'dateOfBirth', {
                        initialValue:null,
                        propertyName:'dateOfBirth'
                    }
                );
            },
            "Should mark property accessor functions":function () {
                assertTrue(photon.observable.model.isPropertyAccessor(
                    this.systemUnderTestType_.prototype.name));
                assertTrue(photon.observable.model.isPropertyAccessor(
                    this.systemUnderTestType_.prototype.dateOfBirth));
            },
            "Should initialize using correct initial values":function() {
                assertEquals('', this.systemUnderTest_.name());
                assertEquals(null, this.systemUnderTest_.dateOfBirth());
            },
            "Should read write via property accessor":function () {
               this.systemUnderTest_.name("Test");
               assertEquals("Test", this.systemUnderTest_.name());
            }
        }
    },
    {
        createSystemUnderTest:function() {
            if (this.definition) {
                this.systemUnderTestType_ =
                    this.defineModel(this.definition);
                return new this.systemUnderTestType_();
            }
            return null;
        },
        defineModel:function (definition) {
            return photon.observable.model.define(definition);
        },
        assertPropertyDefinition : function(model, propertyName, expectedValue) {
            var actualValue = this.getDefinition(model, propertyName);
            var metaData = actualValue. metaData;
            delete actualValue.metaData;
            assertEquals(expectedValue, actualValue);
            actualValue.metaData = metaData;
        },
        getDefinition:function (model, propertyName) {
            var definition = model.definition_ ||
                model.prototype.definition_;
            return propertyName ? definition.properties[propertyName] : definition;
        }
    });