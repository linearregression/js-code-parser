/**
 * Created by sumeet on 8/16/15.
 */
'use strict';

//$("#code-list").html("<h1>hello</h1>")


$.ajax({
    url: "/json/code-list.json",
    success: function(codelist) {
        var headings = "<div class='code_category_headings'><label class='module_selector_label'>app name: <select>";
        var h = '';

        var inCommon = {};

        codelist['common'].forEach(function(module) {
           inCommon[module] = true;
        });

        for (var prop in codelist) {
            if (prop === 'common') {
                continue;
            }

            if (prop !== 'core') {
                headings += "<option value='" + prop + "'>" + prop + "</option>";
            }

            h += '<div class="code_category_list" id="' + prop + '">' +
                 '<ol class="module_list">' +
                 '<lh class="module_list_title">' + prop + '</lh>';

            codelist[prop].forEach(function(module) {
                var clazz = "module_name";
                if (inCommon[module]) {
                    clazz += " common_module";
                }
                h += "<li class='" + clazz + "'>" + module + "</li>";
            });

            h += "</ol></div>";
        }

        headings += "</select></label></div>";

        $("#code-category-headings").html(headings);

        $("#code-list").html(h);

        // the core block is always visible
        $("#core ol").css('display', 'block');

        var prevCodeBlock = "#ess ol";

        $(prevCodeBlock).css('display', 'block');

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
    }
});

