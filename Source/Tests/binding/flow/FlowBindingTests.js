DefineTestSuite("FlowBindingTests", {
    "When disposing":{
        becauseOf:function () {
            var dataContext = new photon.binding.DataContext();
            this.systemUnderTest_.setDataContext(dataContext);

            photon.testing.mock.recordCalls(this.systemUnderTest_,
                "setDataContext");

            this.systemUnderTest_.dispose();
        },
        "Should clear data context":function () {
            this.systemUnderTest_.setDataContext
                .assertWasCalled(1, null);
        }
    }
}, {
    createSystemUnderTest : function() {
        return photon.binding.BindingContext.getInstance().parseBindingExpressions("data-flow", "if:condition")[0]
            .createBinding(document.createElement("div"));
    }
});