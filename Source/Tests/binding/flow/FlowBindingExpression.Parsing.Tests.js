DefineTestSuite("FlowBindingExpression.Parsing",
    {
        "When parsing with flow expression":{
            becauseOf:function () {
                var expressionParser = new photon.binding.ExpressionParser("data-flow", "if:expression");
                /**
                 * @type {photon.binding.flow.FlowBindingExpression}
                 */
                this.expression_ = expressionParser.readNext();
            },
            "Should parse type":function () {
                assertEquals("if", this.expression_.getFlowType());
            },
            "Should parse text":function () {
                assertEquals("if:expression", this.expression_.getText());
            },
            "Should default render target to child":function () {
                assertEquals(photon.templating.RenderTarget.Child, this.expression_.getApplyTo());
            },
            "Should compile correct source value function":function () {
                var dataContext = new photon.binding.DataContext();
                dataContext.setSource({expression:"true"});
                assertEquals("true", this.expression_.getFlowData(
                    dataContext
                ));
            }
        },
        "When parsing with flow expression and render target":{
            becauseOf:function () {
                var expressionParser = new photon.binding.ExpressionParser("data-flow", "if:expression,applyTo:NextSibling");
                /**
                 * @type {photon.binding.flow.FlowBindingExpression}
                 */
                this.expression_ = expressionParser.readNext();
            },
            "Should default apply to child":function () {
                assertEquals(photon.templating.RenderTarget.NextSibling, this.expression_.getApplyTo());
            }
        },
        "When parsing with an invalid render target":{
            "Should throw exception":function () {
                assertException(function () {
                    new photon.binding.ExpressionParser("data-flow", "if:expression, applyTo:NotValid").readNext();
                }, new Error(photon.string.format("Invalid applyTo value '{0}'.", "NotValid")));
            }
        }
    });

