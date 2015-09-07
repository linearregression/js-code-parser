/* global require */

//var requirejs = require('requirejs');

// place third party dependencies, like jQuery, in 'resources/public/vendor' folder

// Configure loading modules from the 'components' directory,
// except for 'index' page ones, which are in a sibling
// directory.
require.config({
    baseUrl: 'static/components',
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        }
    },
    paths: {
        index: '../index',
        vendor: '../vendor',
        d3: "../vendor/d3.min",
        jquery: "../vendor/jquery.min",
        backbone: "../vendor/backbone-min",
        underscore: "../vendor/underscore-min"
    }//,
    //nodeRequire: require
});

// Start loading the main app file. Put all of
// your application logic in there.
require(['index/main']);
