var AttributeProperty = photon.type(
    function AttributeProperty(element, name) {
        this.element_ = element;
        this.name_ = mapName(name);
    })
    .defines(
    {
        setValue: function (value) {
            this.element_.setAttribute(this.name_, value);
        }
    })
    .build();
