/* global define */

define(function (require) {
    // Load any app-specific modules
    // with a relative require call,
    // like:
    var messages = require('./messages');

    var addSankey = require('viz').addSankey;

    addSankey(false, true, 'chart', "/json/viz.json");

    // Load library/vendor modules using
    // full IDs, like:
    var print = require('print');

    print(messages.getHello());
});
