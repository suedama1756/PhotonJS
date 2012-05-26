photon.binding.ExpressionParser.Tests = TestCase("photon.binding.ExpressionParser.Tests",
    {
        parseBindingExpressions:function (expression) {
            var parser = new photon.binding.ExpressionParser("data-bind", expression);
            return parser.readAllRemaining();
        },
        assertGetter:function (getter, obj, value) {
            assertFunction(getter);
            assertEquals(value, getter(obj));
        },
        assertSetter:function (setter, obj, getter, value) {
            assertFunction(setter);
            setter(obj, value);
            assertEquals(value, getter(obj));
        },
        "test: Should support type.":function () {
            var expressions = this.parseBindingExpressions("{value:firstName}");
            assertEquals("property", expressions[0].getPropertyType());
            assertEquals("value", expressions[0].getPropertyName());
        },
        "test: Should support getting from property.":function () {
            var expression = this.parseBindingExpressions("{value:firstName}")[0];
            var data = {
                firstName:"jason"
            };

            assertEquals('jason', expression.getGetter()(data));
        },
        "test: Should support white space before property name":function () {

        },
        "test: Should support setting to property.":function () {
            var expression = this.parseBindingExpressions("{value:firstName}")[0];
            var data = {
                firstName:"jason"
            };
            expression.getSetter()(data, 'changed');
            assertEquals('changed', data.firstName);
        },
        "test: Should support getting from property accessor method.":function () {
            var expression = this.parseBindingExpressions("{value:firstName}")[0];
            var data = {
                _firstName:"jason",
                firstName:function () {
                    return this._firstName;
                }
            };
            data.firstName.isPropertyAccessor = true;
            assertEquals('jason', expression.getGetter()(data));
        },
        "test: Should support setting via property accessor method.":function () {
            var expression = this.parseBindingExpressions("{value:firstName}")[0];
            var data = {
                _firstName:"jason",
                firstName:function (value) {
                    this._firstName = value;
                }
            };
            data.firstName.isPropertyAccessor = true;

            expression.getSetter()(data, 'changed');
            assertEquals('changed', data._firstName);
        },
        "test: Should support mode":function () {
            var expressions = this.parseBindingExpressions("{value:person,mode:OneWay");
            assertEquals(photon.binding.data.DataBindingMode.OneWay, expressions[0].getMode());
        },
        "test: Should throw error if unsupported mode is specified":function () {
            var self = this;
            assertException(function () {
                self.parseBindingExpressions("{value:person,mode: OneWat");
            }, new Error("Invalid binding mode 'OneWat'."));
        },
        "test: Should support property values wrapped with white space":function () {
            var expressions = this.parseBindingExpressions("{ value :person,mode: OneWay }");
            assertEquals(photon.binding.data.DataBindingMode.OneWay, expressions[0].getMode());
            assertEquals("property", expressions[0].getPropertyType());
            assertEquals("value", expressions[0].getPropertyName());
        },
        "test: Should support omission of curly braces":function () {
            var expressions = this.parseBindingExpressions("value:property");
            assertEquals("property", expressions[0].getPropertyType());
            assertEquals("value", expressions[0].getPropertyName());
            assertFunction(expressions[0].getGetter());
            assertFunction(expressions[0].getSetter());
        },
        "test: Should support property abbreviation":function () {
            var expression = this.parseBindingExpressions("{value:source}")[0];
            assertEquals("property", expression.getPropertyType());
            assertEquals("value", expression.getPropertyName());
        },
        "test: Should support multiple bindings":function () {
            var obj = {
                property:1,
                isVisible:true
            };

            var expressions = this.parseBindingExpressions("  {value:property}  {style-visibility:isVisible ? 'visible' : 'hidden'}  ");
            assertEquals(2, expressions.length);
            assertEquals("property", expressions[0].getPropertyType());
            assertEquals("value", expressions[0].getPropertyName());
            assertEquals("{value:property}", expressions[0].getText());


            this.assertGetter(expressions[0].getGetter(), obj, 1);
            this.assertSetter(expressions[0].getSetter(), obj, expressions[0].getGetter(), 2);
            assertEquals("style", expressions[1].getPropertyType());
            assertEquals("visibility", expressions[1].getPropertyName());
            this.assertGetter(expressions[1].getGetter(), obj, 'visible');
            assertUndefined(expressions[1].getSetter());
            assertEquals("{style-visibility:isVisible ? 'visible' : 'hidden'}", expressions[1].getText());


        }
    }
);