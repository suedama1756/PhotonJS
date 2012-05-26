/** @namespace photon.events */
provide("photon.events", {
    // jQuery events are dog slow on IE so we'll invert our dependency and hopefully put in something faster at some point
    add : function(target, events, data, handler) {
        $(target).on(events, data, handler);
    }
});
