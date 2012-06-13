DefineTestSuite("defineType", {
    "When calling immediate base":{
        becauseOf:function () {
            var self = this;

            var BaseType = function () {
            };
            photon.defineType(BaseType,
                {
                    method:function () {
                        return self.result = "Base";
                    }
                });
            var DescendantType = function () {
                DescendantType.base(this);
            };
            photon.defineType(DescendantType,
                BaseType,
                {
                    method:function () {
                        this.superType.method();
                        self.result += " Descendant";
                    }
                });

            (new DescendantType()).method();
        },
        "Should invoke correct call chain":function () {
            assertEquals("Base Descendant", this.result);
        }
    },
    "When calling non-immediate base":{
        becauseOf:function () {
            var self = this;

            var BaseType1 = function () {};
            photon.defineType(BaseType1,
                {
                    method:function () {
                        return self.result = "Base";
                    }
                });

            var BaseType2 = function () {
                BaseType2.base(this);
            };

            photon.defineType(
                BaseType2,
                BaseType1);


            var DescendantType = function () {
                DescendantType.base(this);
            };

            photon.defineType(DescendantType,
                BaseType2,
                {
                    method:function () {
                        this.superType.method();
                        self.result += " Descendant";
                    }
                });

            (new DescendantType()).method();
        },
        "Should invoke correct call chain":function () {
            assertEquals("Base Descendant", this.result);
        }
    },
    "When calling multiple levels":{
        becauseOf:function () {
            var self = this;

            var BaseType1 = function () {};
            photon.defineType(BaseType1,
                {
                    method:function () {
                        return self.result = "Base1";
                    }
                });

            var BaseType2 = function () {
                BaseType2.base(this);
            };

            photon.defineType(
                BaseType2,
                BaseType1,
                {
                    method:function () {
                        this.superType.method();
                        return self.result += " Base2";
                    }
                });


            var DescendantType = function () {
                DescendantType.base(this);
            };

            photon.defineType(DescendantType,
                BaseType2,
                {
                    method:function () {
                        this.superType.method();
                        self.result += " Descendant";
                    }
                });

            (new DescendantType()).method();
        },
        "Should invoke correct call chain":function () {
            assertEquals("Base1 Base2 Descendant", this.result);
        }
    }
});

