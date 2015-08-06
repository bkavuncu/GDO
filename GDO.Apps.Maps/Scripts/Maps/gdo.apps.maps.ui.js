
gdo.net.app["Maps"].drawEmptyMapTable = function (maxCol, maxRow) {
    $("iframe").contents().find("#map_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("iframe").contents().find("#map_table").append("<tr id='map_table_row_" + i + "' row='" + i + "'></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("iframe").contents().find("#map_table tr:last").append("<td id='map_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'></td>");
        }
    }
}

gdo.net.app["Maps"].drawMapTable = function (instanceId) {
    gdo.net.app["Maps"].drawEmptyMapTable(gdo.net.instance[instanceId].styles.length, 1);

    $("iframe").contents().find("#map_table_row_0_col_0")
        .empty()
        .append("<div> <b>3D</b></div>")
        .css("height", gdo.management.button_height / 1.4)
        .css("width", (gdo.management.table_width / gdo.net.instance[instanceId].styles.length + 1) + "%")
        .css("border", "3px solid #444")
        .css("background", "#222")
        .css("color", "#DDD")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
        .unbind()
        .click(function () {
            gdo.net.app["Maps"].server.set3DMode(instanceId, !gdo.net.instance[instanceId].mode);
            gdo.net.app["Maps"].drawMapTable(instanceId);
        });
    if (gdo.net.instance[instanceId].mode) {
        $("iframe").contents().find("#map_table_row_0_col_0").css("color", "lightgreen");
    } else {
        $("iframe").contents().find("#map_table_row_0_col_0").css("color", "lightcoral");
    }

    var i, ii;
    for (i = 0, ii = gdo.net.instance[instanceId].styles.length; i < ii; ++i) {
        $("iframe").contents().find("#map_table_row_0_col_" + (i + 1))
        .empty()
        .append("<div> <b>" + gdo.net.instance[instanceId].styles[i] + "</b></div>")
        .css("height", gdo.management.button_height / 1.4)
        .css("width", (gdo.management.table_width / gdo.net.instance[instanceId].styles.length + 1) + "%")
        .css("border", "3px solid #444")
        .css("background", "#222")
        .css("color", "#DDD")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
        .unbind()
        .click(function () {
            gdo.net.app["Maps"].server.uploadMapStyle(instanceId, gdo.net.instance[instanceId].styles[$(this).attr('col') - 1]);
            gdo.net.app["Maps"].setStyle(instanceId,gdo.net.instance[instanceId].styles[$(this).attr('col') - 1]);
            gdo.net.app["Maps"].drawMapTable(instanceId);
        });
        if (gdo.net.instance[instanceId].currentStyle == gdo.net.instance[instanceId].styles[i]) {
            $("iframe").contents().find("#map_table_row_0_col_" + (i+1)).css("color", "lightgreen");
        } else {
            $("iframe").contents().find("#map_table_row_0_col_" + (i+1)).css("color", "#DDD");
        }
    }
}

