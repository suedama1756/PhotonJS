/*global module:false*/
module.exports = function (grunt) {
    var version = '0.7.0.1';

    grunt.initConfig({
        module:{
            photon:{
                jsm:'../../source/v2/photon.jsm',
                options:{
                    version:version,
                    srcOutput:'../../output/photon-2.0-debug.js',
                    mapOutput:'../../output/photon-2.0-debug.js.map',
                    addSourceMapDirective : true,
                    sourceMapRoot:'../../source/v2'
                }
            }
        },
        watch:{
            photon:{
                files:['../../source/v2/**/*.js', '../../source/v2/**/*.jsm'],
                tasks:'module closureCompiler lint'
            }
        },
//        lint:{
//            files:['grunt.js', '../../output/photon-2.0-debug.js']
//
//        },
        closureCompiler:{
            photon:{
                js:['../../output/photon-2.0-debug.js'],
                jsOutputFile:'../../output/photon-2.0-min.js',
                closurePath:'../tools/Closure',
                options:{
                    'compilation_level':'SIMPLE_OPTIMIZATIONS'
                }
            }
        }
    });

    // default task.
    grunt.registerTask('default', 'module closureCompiler');

    // load module-grunt tasks
    grunt.loadTasks('../../../Build/node_modules/module-grunt');

    grunt.loadTasks('../grunt-contrib/tasks');

};
