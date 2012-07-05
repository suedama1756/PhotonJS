photon.StringBuilder = function () {
    this.bufferLength_ = 0;
    this.buffer_ = [];
};

photon.defineType(photon.StringBuilder, {
    getLength:function () {
        return this.toString().length;
    },
    clear:function () {
        this.bufferLength_ = this.buffer_.length = 0;
    },
    push:function (value) {
        this.buffer_[this.bufferLength_++] = value;
    },
    pushAll:function (values) {
        for (var i = 0, n = values.length; i < n; i++) {
            this.push(values[i]);
        }
    },
    get:function () {
        var result = this.buffer_.join('');
        this.set(result);
        return result;
    },
    set:function (value) {
        this.clear();
        this.push(value);
    }
});

