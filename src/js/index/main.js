/* global define */

/** convention: reusable components don't start with ./
 */
define(['jquery', 'underscore', 'backbone', 'viz'], function ($, _, Backbone, viz) {

    var app = {};

    app.ChartView = Backbone.View.extend({
        el: '#chart',
        initialize: function() {
            viz.addSankey(false, true, 'chart', "/json/viz.json");
        }
    });

    app.chart = new app.ChartView();

    app.CodeModel = Backbone.Model.extend({
        url: "/json/code.json"
    });

    app.codeModel = new app.CodeModel();

    console.log("app.codeModel: " + app.codeModel);

    app.CodeCategoryView = Backbone.View.extend({
        el: '#code-category-headings',
        template: _.template($("#code-category-list-tmpl").html()),
        model: app.codeModel,
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
        }
    });

    app.codeCategoryView = new app.CodeCategoryView();

    app.Router = Backbone.Router.extend({
        routes: {
            '*filter' : 'setFilter'
        },
        setFilter: function(params) {
            console.log('app.router.params = ' + params);
            window.filter = params && params.trim() || '';
            app.chart.render();
            app.codeCategoryView.render();
        }
    });

    app.router = new app.Router();
    Backbone.history.start();

    return app;
});