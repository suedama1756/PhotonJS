/**
 * Task: RequireJS
 * Description: Optimize RequireJS projects using r.js
 * Dependencies: requireJS
 * Contributor: @tbranyen
 */

module.exports = function(grunt) {
  "use strict";

  // TODO: ditch this when grunt v0.4 is released
  grunt.util = grunt.util || grunt.utils;

  var _ = grunt.util._;
  var kindOf = grunt.util.kindOf;

  var requirejs = require("requirejs");

  // TODO: extend this to send build log to grunt.log.ok / grunt.log.error
  // by overriding the r.js logger (or submit issue to r.js to expand logging support)
  requirejs.define("node/print", [], function() {
    return function print(msg) {
      if (msg.substring(0, 5) === "Error") {
        grunt.log.errorlns(msg);
        grunt.fail.warn("RequireJS failed.");
      } else {
        grunt.log.oklns(msg);
      }
    };
  });

  grunt.registerMultiTask("requirejs", "Build a RequireJS project.", function() {
    var options = grunt.helper("options", this, {logLevel: 0});

    _.each(options, function(value, key) {
      if (kindOf(value) === "string") {
        options[key] = grunt.template.process(value);
      }
    });

    grunt.verbose.writeflags(options, "Options");

    requirejs.optimize(options);
  });
};