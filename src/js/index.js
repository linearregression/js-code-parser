/* global require */

//var requirejs = require('requirejs');

// place third party dependencies, like jQuery, in 'resources/public/vendor' folder

// Configure loading modules from the 'components' directory,
// except for 'index' page ones, which are in a sibling
// directory.
require.config({
    baseUrl: 'components',
    paths: {
        index: '../index',
        vendor: '/static/vendor',
        d3: "http://d3js.org/d3.v3.min"
    }//,
    //nodeRequire: require
});

// Start loading the main app file. Put all of
// your application logic in there.
require(['index/main']);
