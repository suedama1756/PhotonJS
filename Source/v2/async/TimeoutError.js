/**
 * Represents a timeout error.
 * @constructor
 */
var TimeoutError = type(function TimeoutError() {
        Error.apply(this, arguments);
    }).inherits(Error).build();
