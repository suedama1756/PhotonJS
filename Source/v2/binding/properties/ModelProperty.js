var ModelProperty = photon.type(
    function ModelProperty(target, name, updateTriggers) {
        ObjectProperty.call(this, target, name);
        var changed = this.changed_.bind(this);
        updateTriggers.split(' ').forEach(function (x) {
            target.addEventListener(x, changed);
        });

    })
    .inherits(ObjectProperty)
    .defines({
        changed_: function () {
            if (this.changed) {
                this.changed();
            }
        }
    })
    .build();
