
gdo.net.app["Maps"].drawEmptyMapTable = function (maxCol, maxRow) {
    $("iframe").contents().find("#map_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("iframe").contents().find("#map_table").append("<tr id='map_table_row_" + i + "' row='" + i + "'></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("iframe").contents().find("#map_table tr:last").append("<td id='map_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'></td>");
        }
    }
}

gdo.net.app["Maps"].drawMapTable = function () {
    gdo.net.app["Maps"].drawEmptyMapTable(gdo.net.app["Maps"].styles.length, 1);
    var i, ii;
    for (i = 0, ii = gdo.net.app["Maps"].styles.length; i < ii; ++i) {
        $("iframe").contents().find("#map_table_row_0_col_" + i)
        .empty()
        .append("<div> <b>" + gdo.net.app["Maps"].styles[i] + "</b></div>")
        .css("height", gdo.management.button_height / 1.4)
        .css("width", ((gdo.management.table_width / 1.4) / gdo.management.button_cols) + "%")
        .css("border", "3px solid #444")
        .css("background", "#222")
        .css("color", "#DDD")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
        .unbind()
        .click(function () {
            gdo.net.app["Maps"].server.uploadMapStyle(gdo.controlId, gdo.net.app["Maps"].styles[$(this).attr('col')]);
            gdo.net.app["Maps"].setStyle(gdo.net.app["Maps"].styles[$(this).attr('col')]);
            gdo.net.app["Maps"].drawMapTable();
        });
        if (gdo.net.app["Maps"].currentStyle == gdo.net.app["Maps"].styles[i]) {
            $("iframe").contents().find("#map_table_row_0_col_" + i).css("color", "lightgreen");
        } else {
            $("iframe").contents().find("#map_table_row_0_col_" + i).css("color", "#DDD");
        }
    }
}

