var ObjectProperty = photon.type(
    function Property(target, name) {
        this.target_ = target;
        name = name.split('_').map(function (x, i) {
            return i ? x.charAt(0).toUpperCase() + x.substring(1) : x;
        }).join('');
        this.name_ = mapName(name);
    })
    .defines({
        setValue: function (value) {
            this.target_[this.name_] = value;
        },
        getValue: function () {
            return this.target_[this.name_];
        }
    })
    .build();
