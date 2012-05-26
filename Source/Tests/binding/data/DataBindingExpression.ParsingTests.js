DefineTestSuite("DataBindingExpression.Parsing",
    {
        "When parsing with basic expression only":{
            becauseOf:function () {
                this.parseSingleExpression("innerText:expression");
            },
            "Should parse property type":function () {
                assertEquals("property", this.expression_.getPropertyType());
            },
            "Should parse property name":function () {
                assertEquals("innerText", this.expression_.getPropertyName());
            },
            "Should parse default property handler":function () {
                assertEquals(photon.binding.data.properties['property'],
                    this.expression_.getPropertyHandler());
            },
            "Should parse default mode":function () {
                assertEquals(photon.binding.data.DataBindingMode.Default,
                    this.expression_.getMode());
            },
            "Should compile getter function":function () {
                var dataContext = new photon.binding.DataContext();
                assertEquals("true", this.expression_.getGetter()(
                    { expression:"true" }
                ));
            },
            "Should compile setter function":function () {
                var dataContext = new photon.binding.DataContext();
                var obj = {
                    expression:"true"
                };
                this.expression_.getSetter()(obj, false);
                assertFalse(obj.expression);
            }
        },
        "When parsing with mode":{
            becauseOf:function () {
                this.parseSingleExpression("innerText:expression, mode:OneWay");
            },
            "Should parse mode":function () {
                assertEquals(photon.binding.data.DataBindingMode.OneWay,
                    this.expression_.getMode());
            }
        },
        "When parsing with invalid mode":{
            "Should throw exception":function () {
                assertException(function () {
                    this.parseSingleExpression("innerText:expression, mode:OopsMode");
                }, new Error("Invalid binding mode 'OopsMode'."), this);
            }
        },
        "When parsing with convertFrom":{
            "Should apply to getter":function () {
                this.parseSingleExpression("{value:person,convertFrom:$value.firstName + ' ' + $value.surname}");
                assertEquals("Jason Young", this.expression_.getGetter()({
                    person:{
                        firstName:"Jason",
                        surname:"Young"
                    }
                }));
            }
        },
        "When parsing with convertTo" : {
            "Should apply to setter":function () {
                this.parseSingleExpression("value:isValid,convertTo:!$value");
                var obj = {
                    isValid:true
                };
                this.expression_.getSetter()(obj, true);
                assertFalse(obj.isValid);
            }
        },
        "When parsing with isPrimary" : {
            "Should parse is primary":function () {
                this.parseSingleExpression("value:isValid,isPrimary:true");
                assertTrue(this.expression_.getIsPrimary());
            }
        }
    },
    {
        parseSingleExpression:function (text) {
            var expressionParser = new photon.binding.ExpressionParser("data-bind", text);
            /**
             * @type {photon.binding.data.DataBindingExpression}
             */
            this.expression_ = expressionParser.readNext();
        }
    }
)
;

