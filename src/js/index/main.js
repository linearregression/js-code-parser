/* global define */

/** convention: reusable components don't start with ./
 */
define(['jquery', 'underscore', 'backbone', 'ChartView', 'CodeModel', 'CodeCategorySelectView', 'FileListView'],
    function ($, _, Backbone, ChartView, CodeModel, CodeCategorySelectView, FileListView) {

    var app = {};

    app.chart = new ChartView();
    app.codeModel = new CodeModel();
    console.log("app.codeModel: " + app.codeModel);
    app.codeCategoryView = new CodeCategorySelectView({ model: app.codeModel });
    app.fileListView = new FileListView({ model: app.codeModel });

    app.Router = Backbone.Router.extend({
        routes: {
            '*filter' : 'setFilter'
        },
        setFilter: function(params) {
            console.log('app.router.params = ' + params);
            window.filter = params && params.trim() || '';
            app.chart.render();
            app.codeModel.fetch();
        }
    });

    app.router = new app.Router();
    Backbone.history.start();

    return app;
});