/* global module */

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js'],
            options: {
                globals: {
                    jQuery: true
                }
            }
        },

        copy: {
            website: {
                src: 'src/js/server.js',
                dest: 'build/website/',
                flatten: true,
                expand: true
            },
            batch: {
                src: '**',
                cwd: 'src/python/analyzer',
                dest: 'build/analyzer/',
                flatten: true,
                expand: true
            },
            parser: {
                src:'src/js/parser.js',
                dest: 'build/analyzer/',
                flatten: true,
                expand: true
            },
            resources: {
                expand: true,
                src: 'resources/**/*',
                dest: 'build/website/'
            },
            require_js: {
                src: 'node_modules/requirejs/require.js',
                dest: 'build/website/resources/public/vendor/',
                flatten: true,
                expand: true
            },
            index_js: {
                src: 'src/js/index.js',
                dest: 'build/website/resources/public/',
                flatten: true,
                expand: true
            },
            index_tree: {
                cwd: 'src/js/index',
                src: '*.js',
                dest: 'build/website/resources/public/index',
                flatten: true,
                expand: true
            },
            components_tree: {
                cwd: 'src/js/components',
                src: '*.js',
                dest: 'build/website/resources/public/components',
                flatten: true,
                expand: true
            }
        },

        shell: {
            run_batch: {
                command: [ 'cd build',
                    'python analyzer/graph_builder.py ' +
                    '-c analyzer/app-conf.json ' +
                    '-p analyzer/parser.js ' +
                    '-o website/resources'].join(' && ')
            }
        },

        clean: ['build']

    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-shell');

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'copy']);

    grunt.registerTask('analyzer', 'runs the code analyzer', function() {
        // ensure that we have a 'build' directory
        grunt.task.run('copy');

        grunt.task.run('shell:run_batch');
    });

};
