/**
 * Created by sumeet on 8/16/15.
 */
'use strict';

//$("#code-list").html("<h1>hello</h1>")



$.ajax({
    url: "/json/code-list.json",
    success: function(codelist) {
        var headings = "<div class='code_category_headings'>";
        var h = '';

        var inCommon = {};

        codelist['common'].forEach(function(module) {
           inCommon[module] = true;
        });

        for (var prop in codelist) {
            if (prop === 'common') {
                continue;
            }
            headings += "<h3 class='code_category'>"+prop+"</h3>"
            h += '<div class="code_category_list" id="' + prop + '"><ol class="module_list">';

            codelist[prop].forEach(function(module) {
                var clazz = "module_name";
                if (inCommon[module]) {
                    clazz += " common_module";
                }
                h += "<li class='" + clazz + "'>" + module + "</li>";
            });

            h += "</ol></div>";
        }

        headings += "</div>";

        $("#code-category-headings").html(headings);

        $("#code-list").html(h);

        $(".code_category").click(function() {
            console.log($(this));
            var listName = "#" + $(this).context.innerText + " ol";
            console.log("hey somebody clicked me!!" + listName);
            //console.log($(listName));
            console.log($(listName));
            $(listName).css('display', 'block');
        });
    }
});

