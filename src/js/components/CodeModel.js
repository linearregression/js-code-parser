/* global define */

define(['backbone'], function(Backbone){
    return Backbone.Model.extend({
        default: {
            common: []
        },
        url: "/json/code.json"
    });
});