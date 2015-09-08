/* global define */

define(['underscore', 'backbone'], function(_, Backbone) {

    return Backbone.View.extend({
        el: '#code-category-headings',
        template: _.template($("#code-category-list-tmpl").html()),
        initialize: function() {
            this.model.on('change', this.render, this);
        },
        prevCodeBlock: '#ess ol',
        render: function() {
            //{abc: 'abc', def: 'def'}
            //console.dir(this.model.toJSON());
            this.$el.html(this.template({ hello: this.model.toJSON() }));
            var prevCodeBlock = this.prevCodeBlock;
            $(".code_category_headings select").change(function() {
                console.log($(this).val());
                var listName = "#" + $(this).val() + " ol";
                console.log("hey somebody clicked me!!" + listName);
                //console.log($(listName));
                console.log("show: " + $(listName) + "hide: " + prevCodeBlock);
                if (prevCodeBlock) {
                    $(prevCodeBlock).css('display', 'none');
                }

                $(listName).css('display', 'block');
                prevCodeBlock = listName;
            });
            return this;
        }
    });

});