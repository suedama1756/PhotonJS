describe("type", function () {
    describe("when building with type name", function () {
        it('should associate name with type info', function () {
            var Type = photon.type().name('Test').build();
            expect(Type.typeInfo().name()).toBe('Test');
        });
    });

    describe("when inheriting", function () {
        var Animal = photon.type(
            function (name) {
                this.name_ = name;
            })
            .defines({
                name:function () {
                    return this.name_;
                },
                speak:function () {
                    return '';
                },
                description:'An animal'
            })
            .build();

        var Dog = photon.type(function (name) {
                Animal.call(this, name);
            })
            .inherits(Animal)
            .defines({
                speak:function () {
                    return 'Woof';
                }
            })
            .build();

        var LargeDog = photon.type(function (name) {
                Dog.call(this, name);
            })
            .inherits(Dog)
            .build();


        var GreatDane = photon.type(function GreatDane(name) {
                LargeDog.call(this, name);
            })
            .inherits(LargeDog)
            .defines(function (base) {
                return {
                    speak:function () {
                        return "Big " + base().speak.call(this);
                    }
                }
            })
            .build();

        var larry = new Dog('Larry');
        var james = new GreatDane('James');
        window.james = james;

        it('should associate base type with type info', function () {
            expect(Dog.typeInfo().baseType()).toBe(Animal);
        });

        it('should inherit base functions', function () {
            expect((larry).name()).toBe('Larry');
        });

        it('should inherit base properties', function () {
            expect(larry.description).toBe('An animal');
        });

        it('should support overrides', function () {
            expect(larry.speak()).toBe('Woof');
        });

        it('should support calling base methods', function () {
            expect(james.speak()).toBe('Big Woof');
        });

        it('should support overriding toString in all browsers', function() {
           expect(james.toString()).toBe('[object GreatDane]');
        });

        it('should support querying type into on instance', function() {
            expect(photon.typeInfo(james).name()).toBe('GreatDane');
        })
    });


    describe("when not inheriting", function () {
        describe('with no constructor', function () {
            it('should generate default constructor', function () {

            });
        });

        describe('with member functions', function () {

        });
    });
});
