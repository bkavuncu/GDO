gdo.net.app["SmartCity"].drawEmptyMapTable = function (maxCol, maxRow) {
    $("iframe").contents().find("#map_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("iframe").contents().find("#map_table").append("<tr id='map_table_row_" + i + "' row='" + i + "'></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("iframe").contents().find("#map_table tr:last").append("<td id='map_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'></td>");
        }
    }
}

gdo.net.app["SmartCity"].drawMapTable = function (instanceId) {
    gdo.net.app["SmartCity"].drawEmptyMapTable(2, 1);

    $("iframe").contents().find("#map_table_row_0_col_0")
        .empty()
        .append("<div> <b>3D</b></div>")
        .css("height", gdo.management.button_height / 1.4)
        .css("width",  "20%")
        .css("border", "3px solid #444")
        .css("background", "#222")
        .css("color", "#DDD")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
        .unbind()
        .click(function () {
            gdo.net.app["SmartCity"].server.set3DMode(instanceId, !gdo.net.instance[instanceId].mode);
            gdo.net.app["SmartCity"].drawMapTable(instanceId);
        });
    if (gdo.net.instance[instanceId].mode) {
        $("iframe").contents().find("#map_table_row_0_col_0").css("color", "lightgreen");
    } else {
        $("iframe").contents().find("#map_table_row_0_col_0").css("color", "lightcoral");
    }

    $("iframe").contents().find("#map_table_row_0_col_1")
    .empty()
    .append("<div> <b>Advanced</b></div>")
    .css("height", gdo.management.button_height / 1.4)
    .css("width", "20%")
    .css("border", "3px solid #444")
    .css("background", "#222")
    .css("color", "#DDD")
    .css('padding', gdo.management.cell_padding)
    .attr("align", "center")
    .css({ fontSize: gdo.management.button_font_size })
    .unbind()
    .click(function () {
            window.open("\Advanced.cshtml?clientId=" + instanceId, '_blank');
        });
}

