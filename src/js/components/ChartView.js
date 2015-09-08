/* global define */

define(['viz', 'backbone'], function(viz, Backbone) {
   return Backbone.View.extend({
       el: '#chart',
       initialize: function() {
           viz.addSankey(false, true, 'chart', "/json/viz.json");
       }
   });
});