(function (window) {
    (function(factory) {
        // Support three module loading scenarios
        if (typeof require === 'function' && typeof exports === 'object' && typeof module === 'object') {
            // CommonJS/Node.js
            factory(module['exports'] || exports);
        } else if (typeof define === 'function' && define['amd']) {
            // AMD anonymous module
            define(['exports', "jquery"], factory);
        } else {
            // No module loader - put directly in global namespace
            window.photon = window.photon || {};
            factory(window.photon, window.$);
        }
    })(function(photon, $) {

        /* CONTENT */

    });
})(window);
