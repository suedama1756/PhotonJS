/**
 * Represents a timeout error.
 * @constructor
 */
function TimeoutError() {
    Error.apply(this, arguments);
}

ruf.defineType(TimeoutError, Error,
    /**
     * @lends TimeoutError.prototype
     */
    {
        name:'TimeoutError'
    });
