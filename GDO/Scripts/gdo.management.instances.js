gdo.management.drawEmptyInstanceTable = function () {

    $("#instance_table_app_list")
        .css("height", (gdo.management.table_height + (gdo.management.info_height * 3.5)))
        .css("width", "14%")
        .css("border", "3px solid #444")
        .css("color", "#DDD")
        .css("background", "#222")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        
        .css("vertical-align", "top")
        .css({ fontSize: gdo.management.button_font_size });

    $("#instance_table_control_frame")
        .css("height", (gdo.management.table_height + (gdo.management.info_height * 3.5)))
        .css("width", "86%")
        .css("border", "3px solid #444")
        .css("color", "#DDD")
        .css("background", "#222")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size });
    $("iframe")
        .css("height", (gdo.management.table_height + (gdo.management.info_height * 3.5)));
}



gdo.management.drawInstanceTable = function () {
    gdo.management.drawEmptyInstanceTable();
    $("#instance_table_app_table").empty();
   /* $("#instance_table_app_div")
         .css("overflow-y","auto")
        .css("height", (gdo.management.table_height + (gdo.management.info_height * 1.5)));
    
    //.empty().css("overflow", "auto").css("height", (gdo.management.table_height + (gdo.management.info_height * 3.5)));
    //$("#instance_table_app_table").children('tbody').css("overflow-y", "auto");*/
    for (var i = 0; i < gdo.net.instance.length; i++) {
        if (gdo.net.instance[i].exists) {
           $("#instance_table_app_table").append("<tr id='instance_table_app_table_row_" + i + " row='" + i + "'></tr>");
           $("#instance_table_app_table tr:last").append("<td id='instance_table_app_table_row_" + i + "_col_0' col='0' row='" + i + "'></td>");
           $("#instance_table_app_table_row_" + i + "_col_0")
            .empty()
            .append("<div id='instance_table_app_table_" + gdo.net.instance[i].id + "'> " +
                   "<table style='width: 100%;'> " +
                        "<tr>" +
                            "<td id='instance_table_app_table_" + i + "_id' rowspan='3'><b>" + gdo.net.instance[i].id + "</b></td>" +
                            "<td id='instance_table_app_table_" + i + "_line_1' rowspan='3'></td>" +
                            "<td id='instance_table_app_table_" + i + "_name'>" + gdo.net.instance[i].appName + "</td>" +
                        "</tr>" +
                        "<tr>" +
                            "<td id='instance_table_app_table_" + i + "_line_2'></td>" +
                        "</tr>" +
                        "<tr>" +
                            "<td id='instance_table_app_table_" + i + "_config'>" + gdo.net.instance[i].configName + "</td>" +
                        "</tr>" +
                   "</table>" +
                   "</div>")
            .css("border", "3px solid #444")
            .css("color", "#DDD")
            .css("background", "#222")
            .css('padding', gdo.management.cell_padding)
            .click(function () {
               gdo.management.selectedInstance = gdo.net.instance[$(this).attr('row')].id;
               gdo.management.loadControlFrame(gdo.net.instance[$(this).attr('row')].appName, gdo.net.instance[$(this).attr('row')].id);
               gdo.updateDisplayCanvas();
            });
            $("#instance_table_app_table_" + i + "_line_1")
                .css("width", "0px")
                .css("background-color", "#444")
                .css("border", "1px solid #444");
            $("#instance_table_app_table_" + i + "_line_2")
                .css("height", "0px")
                .css("background-color", "#444")
                .css("border", "0.5px solid #444");
            $("#instance_table_app_table_" + i + "_id")
                .css("width", "14%")
                 .css({ fontSize: gdo.management.button_font_size *2.1 });
            $("#instance_table_app_table_" + i + "_name")
                .css("width", "86%")
                .css("color", "#DDD")
                .css({ fontSize: gdo.management.button_font_size / 1.4 });
            $("#instance_table_app_table_" + i + "_config")
                .css("color", "#777")
                .css("width", "86%")
                .css({ fontSize: gdo.management.button_font_size / 1.4 });
            if (gdo.net.instance[i].id == gdo.management.selectedInstance) {
               $("#instance_table_app_table_row_" + i + "_col_1").css("color", "lightgreen");
            } else {
                $("#instance_table_app_table_row_" + i + "_col_1").css("color", "#DDD");
            }
        }
       
    }
}