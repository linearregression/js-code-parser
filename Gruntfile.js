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
                src: 'src/js/app.js',
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
