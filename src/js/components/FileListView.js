/**
 * Created by sumeet on 9/8/15.
 */

/* global define */

define(['jquery', 'underscore', 'backbone'], function($, _, Backbone) {
    'use strict';

    return Backbone.View.extend({

        el: "#code-list",

        template: _.template($("#code-category-file-list-tmpl").html()),

        initialize: function() {
            this.model.on('change', this.render, this);
        },

        render: function() {
            console.log("rendering fileListView");
            this.$el.html(this.template({ hello: this.model.toJSON() }));

            // make core block always visible
            $("#core ol").css('display', 'block');

            // make first code block always visible too!
            var prevCodeBlock = "#ess ol";
            $(prevCodeBlock).css('display', 'block');
        }
    });

});