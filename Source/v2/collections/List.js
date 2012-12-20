var List = photon['List'] = type(
    function List() {
        this.items_ = [];

        // call base
        var self = this;
        Enumerable.call(this,
            // TODO: Support versions, remove quick enumerable "wrap" solution?
            function() {
                return enumerable(self.items_).getEnumerator()
            });
    })
    .defines({
        add: function (item) {
            this.items_.push(item);
            return this.items_.length - 1;
        },
        addRange : function(items) {
            if (!isArray(items)) {
                items = enumerable(items).toArray();
            }
            this.items_ = this.items_.concat(items);
        },
        remove: function (item) {
            var index = this.items_.indexOf(item);
            if (index !== -1) {
                this.removeAt(index);
            }
            return index !== -1;
        },
        removeAt : function(index) {
            this.items.splice(index, 1);
        },
        count: function () {
            return this.items_.length;
        },
        itemAt: function (index) {
            return this.items_[index];
        }
    })
    .inherits(
        Enumerable)
    .build();