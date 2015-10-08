
gdo.net.app["ShanghaiMetro"].drawEmptyMapTable = function (maxCol, maxRow) {
    $("iframe").contents().find("#map_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("iframe").contents().find("#map_table").append("<tr id='map_table_row_" + i + "' row='" + i + "'></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("iframe").contents().find("#map_table tr:last").append("<td id='map_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'></td>");
        }
    }
}

gdo.net.app["ShanghaiMetro"].numButtons = 7;


gdo.net.app["ShanghaiMetro"].drawMapTable = function (instanceId) {
    gdo.net.app["ShanghaiMetro"].drawEmptyMapTable(7, 1);

    $("iframe").contents().find("#map_table_row_0_col_0")
        .empty()
        .append("<div> <b>Bing Maps</b></div>")
        .css("height", gdo.management.button_height / 1.4)
        .css("width", (gdo.management.table_width / gdo.net.app["ShanghaiMetro"].numButtons) + "%")
        .css("border", "3px solid #444")
        .css("background", "#222")
        .css("color", "#DDD")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
        .unbind()
        .click(function () {
            gdo.net.app["ShanghaiMetro"].server.setBingLayerVisible(instanceId);
        });
    $("iframe").contents().find("#map_table_row_0_col_1")
        .empty()
        .append("<div> <b>Stamen Maps</b></div>")
        .css("height", gdo.management.button_height / 1.4)
        .css("width", (gdo.management.table_width / gdo.net.app["ShanghaiMetro"].numButtons) + "%")
        .css("border", "3px solid #444")
        .css("background", "#222")
        .css("color", "#DDD")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
        .unbind()
        .click(function () {
            gdo.net.app["ShanghaiMetro"].server.setStamenLayerVisible(instanceId);
        });
    $("iframe").contents().find("#map_table_row_0_col_2")
        .empty()
        .append("<div> <b>Stations</b></div>")
        .css("height", gdo.management.button_height / 1.4)
        .css("width", (gdo.management.table_width / gdo.net.app["ShanghaiMetro"].numButtons) + "%")
        .css("border", "3px solid #444")
        .css("background", "#222")
        .css("color", "#DDD")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
        .unbind()
        .click(function () {
            gdo.net.app["ShanghaiMetro"].server.setStationLayerVisible(instanceId);
        });
    $("iframe").contents().find("#map_table_row_0_col_3")
        .empty()
        .append("<div> <b>Lines</b></div>")
        .css("height", gdo.management.button_height / 1.4)
        .css("width", (gdo.management.table_width / gdo.net.app["ShanghaiMetro"].numButtons) + "%")
        .css("border", "3px solid #444")
        .css("background", "#222")
        .css("color", "#DDD")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
        .unbind()
        .click(function () {
            gdo.net.app["ShanghaiMetro"].server.setLineLayerVisible(instanceId);
        });
    $("iframe").contents().find("#map_table_row_0_col_4")
        .empty()
        .append("<div> <b>Entry</b></div>")
        .css("height", gdo.management.button_height / 1.4)
        .css("width", (gdo.management.table_width / gdo.net.app["ShanghaiMetro"].numButtons) + "%")
        .css("border", "3px solid #444")
        .css("background", "#222")
        .css("color", "#DDD")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
        .unbind()
        .click(function () {
            gdo.net.app["ShanghaiMetro"].server.setEntryHeatmapLayerVisible(instanceId);
        });
    $("iframe").contents().find("#map_table_row_0_col_5")
        .empty()
        .append("<div> <b>Exit</b></div>")
        .css("height", gdo.management.button_height / 1.4)
        .css("width", (gdo.management.table_width / gdo.net.app["ShanghaiMetro"].numButtons) + "%")
        .css("border", "3px solid #444")
        .css("background", "#222")
        .css("color", "#DDD")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
        .unbind()
        .click(function () {
            gdo.net.app["ShanghaiMetro"].server.setExitHeatmapLayerVisible(instanceId);
        });
    $("iframe").contents().find("#map_table_row_0_col_6")
        .empty()
        .append("<div> <b>Both</b></div>")
        .css("height", gdo.management.button_height / 1.4)
        .css("width", (gdo.management.table_width / gdo.net.app["ShanghaiMetro"].numButtons) + "%")
        .css("border", "3px solid #444")
        .css("background", "#222")
        .css("color", "#DDD")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
        .unbind()
        .click(function () {
            gdo.net.app["ShanghaiMetro"].server.setCongestionHeatmapLayerVisible(instanceId);
        });
  
}

