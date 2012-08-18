/*global module:false*/
module.exports = function (grunt) {
    grunt.initConfig({
        module:{
            photon:{
                jsm:'../source/core/photon.jsm',
                options:{
                    configuration:'debug',
                    version:'0.7.0.1',
                    srcOutput:'../../output/photon-debug.js',
                    mapOutput:'../../output/photon-debug.js.map',
                    addSourceMapDirective : true,
                    sourceMapRoot:'../source/core'
                }
            },
            compatibility:{
                jsm:'../source/core/photon.jsm',
                options:{
                    configuration:'debug',
                    version:'0.7.0.1',
                    srcOutput:'../../output/photon-compatibility-debug.js',
                    mapOutput:'../../output/photon-compatibility-debug.js.map',
                    addSourceMapDirective : true,
                    sourceMapRoot:'../source/core',
                    properties : {
                        compatibility : true
                    }
                }
            }
        },
        watch:{
            photon:{
                files:['../source/core/**/*.js', '../source/core/**/*.jsm'],
                tasks:'module closureCompiler lint'
            },
            site : {
                files:['../output/**/*.js'],
                tasks:'copy:site'
            }
        },
        lint:{
            files:['grunt.js', '../output/photon-debug.js']

        },
        closureCompiler:{
            photon:{
                js:['../output/photon-debug.js'],
                jsOutputFile:'../output/photon-min.js',
                closurePath:'./tools/Closure',
                options:{
                    'compilation_level':'SIMPLE_OPTIMIZATIONS'
                }
            },
            compatibility:{
                js:['../output/photon-compatibility-debug.js'],
                jsOutputFile:'../output/photon-compatibility-min.js',
                closurePath:'./tools/Closure',
                options:{
                    'compilation_level':'SIMPLE_OPTIMIZATIONS'
                }
            }
        },
        copy : {
            site : {
                files : {
                    '../../Site/scripts/': ['../output/**/*.js', '../output/**/*.js.map']
                }
            }
        }
    });

    // default task.
    grunt.registerTask('default', 'module closureCompiler lint copy');

    // load module-grunt tasks
    grunt.loadTasks('../../Build/node_modules/module-grunt');

    grunt.loadTasks('grunt-contrib/tasks');

};
