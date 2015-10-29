
gdo.net.app["Maps"].drawEmptyMapTable = function (maxCol, maxRow) {
    $("iframe").contents().find("#map_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("iframe").contents().find("#map_table").append("<tr id='map_table_row_" + i + "' row='" + i + "'></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("iframe").contents().find("#map_table tr:last").append("<td id='map_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'></td>");
        }
    }
}

gdo.net.app["Maps"].numButtons =6;


gdo.net.app["Maps"].drawMapTable = function (instanceId) {
    gdo.net.app["Maps"].drawEmptyMapTable(6, 1);

    $("iframe").contents().find("#map_table_row_0_col_0")
        .empty()
        .append("<div> <b>Bing Maps</b></div>")
        .css("height", gdo.management.button_height / 1.4)
        .css("width", (gdo.management.table_width / gdo.net.app["Maps"].numButtons) + "%")
        .css("border", "3px solid #444")
        .css("background", "#222")
        .css("color", "#DDD")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
        .unbind()
        .click(function () {
            gdo.net.app["Maps"].server.setBingLayerVisible(instanceId);
        });
    $("iframe").contents().find("#map_table_row_0_col_1")
        .empty()
        .append("<div> <b>Stamen Maps</b></div>")
        .css("height", gdo.management.button_height / 1.4)
        .css("width", (gdo.management.table_width / gdo.net.app["Maps"].numButtons) + "%")
        .css("border", "3px solid #444")
        .css("background", "#222")
        .css("color", "#DDD")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
        .unbind()
        .click(function () {
            gdo.net.app["Maps"].server.setStamenLayerVisible(instanceId);
        });
    $("iframe").contents().find("#map_table_row_0_col_1")
        .empty()
        .append("<div> <b>Stations</b></div>")
        .css("height", gdo.management.button_height / 1.4)
        .css("width", (gdo.management.table_width / gdo.net.app["Maps"].numButtons) + "%")
        .css("border", "3px solid #444")
        .css("background", "#222")
        .css("color", "#DDD")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
        .unbind()
        .click(function () {
            gdo.net.app["Maps"].server.setStationLayerVisible(instanceId);
        });
    $("iframe").contents().find("#map_table_row_0_col_2")
        .empty()
        .append("<div> <b>Lines</b></div>")
        .css("height", gdo.management.button_height / 1.4)
        .css("width", (gdo.management.table_width / gdo.net.app["Maps"].numButtons) + "%")
        .css("border", "3px solid #444")
        .css("background", "#222")
        .css("color", "#DDD")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
        .unbind()
        .click(function () {
            gdo.net.app["Maps"].server.setLineLayerVisible(instanceId);
        });
    $("iframe").contents().find("#map_table_row_0_col_3")
        .empty()
        .append("<div> <b>Entry</b></div>")
        .css("height", gdo.management.button_height / 1.4)
        .css("width", (gdo.management.table_width / gdo.net.app["Maps"].numButtons) + "%")
        .css("border", "3px solid #444")
        .css("background", "#222")
        .css("color", "#DDD")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
        .unbind()
        .click(function () {
            gdo.net.app["Maps"].server.setHeatmapLayerVisible(instanceId);
        });
    $("iframe").contents().find("#map_table_row_0_col_4")
        .empty()
        .append("<div> <b>Animate</b></div>")
        .css("height", gdo.management.button_height / 1.4)
        .css("width", (gdo.management.table_width / gdo.net.app["Maps"].numButtons) + "%")
        .css("border", "3px solid #444")
        .css("background", "#222")
        .css("color", "#DDD")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
        .unbind()
        .click(function () {
            gdo.net.app["Maps"].server.animate();
        });
  
}

