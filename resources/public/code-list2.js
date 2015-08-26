/**
 * Created by sumeet on 8/16/15.
 */
'use strict';

//$("#code-list").html("<h1>hello</h1>")


$.ajax({
    url: "/json/code-list.json",
    reprocess_core: function(codelist, inCommon, app) {
        var h = '';
        var appModules = {};

        codelist[app].forEach(function(module) {
            appModules[module] = true;
        });

        h += '<ol class="module_list"><lh class="module_list_title">core</lh>';

        codelist['core'].forEach(function(module) {
            var clazz = "module_name";
            if (inCommon[module]) {
                clazz += " common_module";
            }
            if (appModules[module]) {
                clazz += " common_with_core";
            }

            h += "<li class='" + clazz + "'>" + module + "</li>";
        });

        $('#core').html(h);
        $("#core ol").css('display', 'block');
    },
    process_list: function(codelist, inCommon) {
        var h = '';

        for (var app in codelist) {
            if (app === 'common') {
                continue;
            }

            h += '<div class="code_category_list" id="' + app + '">' +
                 '<ol class="module_list">' +
                 '<lh class="module_list_title">' + app + '</lh>';

            codelist[app].forEach(function(module) {
                var clazz = "module_name";
                if (inCommon[module]) {
                    clazz += " common_module";
                }
                h += "<li class='" + clazz + "'>" + module + "</li>";
            });

            h += "</ol></div>";
        }

        $("#code-list").html(h);
    },
    process_headings: function(codelist, inCommon) {
        var headings = "<div class='code_category_headings'><label class='module_selector_label'>app name: <select>";
        for (var app in codelist) {
            if (app === 'common') {
                continue;
            }

            if (app !== 'core') {
                headings += "<option value='" + app + "'>" + app + "</option>";
            }
        }
        headings += "</select></label></div>";

        $("#code-category-headings").html(headings);
    },
    success: function(codelist) {
        var inCommon = {};

        codelist['common'].forEach(function(module) {
           inCommon[module] = true;
        });

        this.process_headings(codelist, inCommon);
        this.process_list(codelist, inCommon);

        // the core block is always visible
        $("#core ol").css('display', 'block');

        var prevCodeBlock = "#ess ol";
        $(prevCodeBlock).css('display', 'block');

        this.reprocess_core(codelist, inCommon, 'ess');

        var that = this;

        $(".code_category_headings select").change(function() {

            console.log($(this).val());
            var listName = "#" + $(this).val() + " ol";
            console.log("hey somebody clicked me!!" + listName);
            //console.log($(listName));
            console.log("show: " + $(listName) + "hide: " + prevCodeBlock);
            if (prevCodeBlock) {
                $(prevCodeBlock).css('display', 'none');
            }

            that.reprocess_core(codelist, inCommon, $(this).val());

            $(listName).css('display', 'block');
            prevCodeBlock = listName;
        });
    }
});

