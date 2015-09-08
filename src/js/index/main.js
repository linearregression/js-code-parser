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
        default: {
            common: []
        },
        url: "/json/code.json"
    });

    app.CodeCategoryView = Backbone.View.extend({
        el: '#code-category-headings',
        template: _.template($("#code-category-list-tmpl").html()),
        initialize: function() {
            this.model.on('change', this.render, this);
        },
        render: function() {
            //{abc: 'abc', def: 'def'}
            //console.dir(this.model.toJSON());
            this.$el.html(this.template({ hello: this.model.toJSON() }));
            $(".code_category_headings select").change(function() {
                console.log($(this).val());
                var listName = "#" + $(this).val() + " ol";
                console.log("hey somebody clicked me!!" + listName);
                //console.log($(listName));
                console.log("show: " + $(listName) + "hide: " + app.prevCodeBlock);
                if (app.prevCodeBlock) {
                    $(app.prevCodeBlock).css('display', 'none');
                }

                $(listName).css('display', 'block');
                app.prevCodeBlock = listName;
            });
            return this;
        }
    });

    app.FileListView = Backbone.View.extend({
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
            app.prevCodeBlock = "#ess ol";
            $(app.prevCodeBlock).css('display', 'block');
        }
    });

    app.codeModel = new app.CodeModel();
    console.log("app.codeModel: " + app.codeModel);
    app.codeCategoryView = new app.CodeCategoryView({ model: app.codeModel });
    app.fileListView = new app.FileListView({ model: app.codeModel });

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