$(function () {
    gdo.management.table_font_size = 11;
    gdo.management.section_font_size = 12;
    gdo.management.button_font_size = 21;
    gdo.management.header_font_size = 17;
    gdo.management.table_height = 300;
    gdo.management.table_width = 100;
    gdo.management.button_height = 61;
    gdo.management.button_cols = 5;
    gdo.management.header_cols = 10;
    gdo.management.cell_padding = 7;
    gdo.management.isRectangle = true;
    gdo.management.isStarted = false;
    gdo.management.colStart = 1000;
    gdo.management.colEnd = -1;
    gdo.management.rowStart = 1000;
    gdo.management.rowEnd = -1;

    gdo.management.toggleNodeTable = true;
    gdo.management.toggleSectionTable = true;
    gdo.management.toggleAppTable = false;
    gdo.management.toggleInstanceTable = false;
    gdo.management.toggleConsole = false;

    gdo.management.numToggleMenu = 2;
    gdo.management.maxToggleMenu = 2;
    gdo.management.numSelectedSection = 0;
    gdo.management.maxSelectedSection = 1;

    gdo.loadModule("management.nodes", gdo.MODULE_TYPE.CORE);
    gdo.loadModule("management.sections", gdo.MODULE_TYPE.CORE);
    gdo.loadModule("management.apps", gdo.MODULE_TYPE.CORE);
    gdo.loadModule("management.instances", gdo.MODULE_TYPE.CORE);
});

gdo.updateDisplayCanvas = function () {
    /// <summary>
    /// Updates the gdo canvas.
    /// </summary>
    /// <returns></returns>

    gdo.management.drawHeaderTable();

    if (gdo.management.toggleNodeTable) {
        $("#selected_node").show();
        $("#node_table").show();
        $("#node_table_space").show();
        gdo.management.drawNodeTable(gdo.nodeId);
    } else {
        $("#selected_node").hide();
        $("#node_table").hide();
        $("#node_table_space").hide();
    }

    if (gdo.management.toggleSectionTable) {
        $("#section_table").show();
        $("#section_table_space").show();
        $("#button_table").show();
        gdo.management.drawSectionTable();
        gdo.management.drawButtonTable();
    } else {
        $("#section_table").hide();
        $("#section_space").hide();
        $("#button_table").hide();
    }

    if (gdo.management.toggleAppTable) {
        $("#app_table").show();
        $("#app_space").show();
        gdo.management.drawAppTable();
    } else {
        $("#app_table").hide();
        $("#app_table_space").hide();
    }

    if (gdo.management.toggleInstanceTable) {
        $("#instance_table").show();
        $("#instance_table_space").show();
        gdo.management.drawInstanceTable();
    } else {
        $("#instance_table").hide();
        $("#instance_table_space").hide();
    }

    if (gdo.management.toggleConsole) {
        $("#console_area").show();
        $("#console_area_space").show();
    } else {
        $("#console_area").hide();
        $("#console_area_space").hide();
    }
}

gdo.management.drawEmptyHeaderTable = function (maxCol, maxRow) {
    /// <summary>
    /// Draws the button table.
    /// </summary>
    /// <param name="maxRow">The maximum row.</param>
    /// <param name="maxCol">The maximum col.</param>
    /// <returns></returns>
    //gdo.consoleOut('.MANAGEMENT', 1, 'Drawing Empty Button Table with ' + maxRow + ',' + maxCol);
    $("#header_table").empty().css("background-color","#222");
    for (var i = 0; i < maxRow; i++) {
        $("#header_table").append("<tr id='header_table_row_" + i + "' row='" + i + "'></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("#header_table tr:last").append("<td id='header_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'></td>");
        }
    }
}

gdo.management.drawHeaderTable = function () {
    gdo.management.drawEmptyHeaderTable(13, 1);
    $("#header_table_row_0_col_0")
        .empty()
        .append("<div id='header-text' id='header-text'> <b> GDO </b>Control Panel</div>")
        .css("height", gdo.management.button_height)
        .css("width", (4 * (gdo.management.table_width / gdo.management.header_cols)) + "%")
        .css("color", "#DDD")
        .css('padding', gdo.management.cell_padding)
        .css({ fontSize: gdo.management.header_font_size });
    $("#header_table_row_0_col_1")
        .empty()
        .css("height", gdo.management.button_height)
        .css("width", "0px")
        .css("background-color", "#444")
        .css("border", "1px solid #444")
        .css({ fontSize: gdo.management.header_font_size });
    $("#header_table_row_0_col_2")
        .empty()
        .append("<div id='header-text'> Nodes </div>")
        .css("height", gdo.management.button_height)
        .css("width", (gdo.management.table_width / gdo.management.header_cols) + "%")
        .css("color", "#777")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.header_font_size })
        .click(function () {
            if (gdo.management.toggleNodeTable) {
                gdo.management.toggleNodeTable = false;
                gdo.management.numToggleMenu--;
                gdo.updateDisplayCanvas();
            }else if (gdo.management.numToggleMenu < gdo.management.maxToggleMenu) {
                gdo.management.numToggleMenu++;
                gdo.management.toggleNodeTable = true;
                gdo.updateDisplayCanvas();
            }
        });
    if (gdo.management.toggleNodeTable) {
        $("#header_table_row_0_col_2").css("color", "lightgreen");
    } else {
        if (gdo.management.numToggleMenu < gdo.management.maxToggleMenu) {
            $("#header_table_row_0_col_2").css("color", "white");
        } else {
            $("#header_table_row_0_col_2").css("color", "#777");
        }
    }
    $("#header_table_row_0_col_3")
        .empty()
        .css("height", gdo.management.button_height)
        .css("width", "0px")
        .css("background-color", "#444")
        .css("border", "1px solid #444")
        .css({ fontSize: gdo.management.header_font_size });
    $("#header_table_row_0_col_4")
        .empty()
        .append("<div id='header-text'> Sections </div>")
        .css("height", gdo.management.button_height)
        .css("width", (gdo.management.table_width / gdo.management.header_cols) + "%")
        .css("color", "#777")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.header_font_size })
        .click(function () {
            if (gdo.management.toggleSectionTable) {
                gdo.management.toggleSectionTable = false;
                gdo.management.numToggleMenu--;
                gdo.updateDisplayCanvas();
            } else if (gdo.management.numToggleMenu < gdo.management.maxToggleMenu) {
                gdo.management.numToggleMenu++;
                gdo.management.toggleSectionTable = true;
                gdo.updateDisplayCanvas();
            }
        });
    if (gdo.management.toggleSectionTable) {
        $("#header_table_row_0_col_4").css("color", "lightgreen");
    } else {
        if (gdo.management.numToggleMenu < gdo.management.maxToggleMenu) {
            $("#header_table_row_0_col_4").css("color", "white");
        } else {
            $("#header_table_row_0_col_4").css("color", "#777");
        }
    }
    $("#header_table_row_0_col_5")
        .empty()
        .css("height", gdo.management.button_height)
        .css("width", "0px")
        .css("background-color", "#444")
        .css("border", "1px solid #444")
        .css({ fontSize: gdo.management.header_font_size });
    $("#header_table_row_0_col_6")
        .empty()
        .append("<div id='header-text'> Apps </div>")
        .css("height", gdo.management.button_height)
        .css("width", (gdo.management.table_width / gdo.management.header_cols) + "%")
        .css("color", "#777")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.header_font_size })
        .click(function () {
            if (gdo.management.toggleAppTable) {
                gdo.management.toggleAppTable = false;
                gdo.management.numToggleMenu--;
                gdo.updateDisplayCanvas();
            } else if (gdo.management.numToggleMenu < gdo.management.maxToggleMenu) {
                gdo.management.numToggleMenu++;
                gdo.management.toggleAppTable = true;
                gdo.updateDisplayCanvas();
            }
        });
    if (gdo.management.toggleAppTable) {
        $("#header_table_row_0_col_6").css("color", "lightgreen");
    } else {
        if (gdo.management.numToggleMenu < gdo.management.maxToggleMenu) {
            $("#header_table_row_0_col_6").css("color", "white");
        } else {
            $("#header_table_row_0_col_6").css("color", "#777");
        }
    }
    $("#header_table_row_0_col_7")
        .empty()
        .css("height", gdo.management.button_height)
        .css("width", "0px")
        .css("background-color", "#444")
        .css("border", "1px solid #444")
        .css({ fontSize: gdo.management.header_font_size });
    $("#header_table_row_0_col_8")
        .empty()
        .append("<div id='header-text'> Instances </div>")
        .css("height", gdo.management.button_height)
        .css("width", (gdo.management.table_width / gdo.management.header_cols) + "%")
        .css("color", "#777")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.header_font_size })
        .click(function () {
            if (gdo.management.toggleInstanceTable) {
                gdo.management.toggleInstanceTable = false;
                gdo.management.numToggleMenu--;
                gdo.updateDisplayCanvas();
            } else if (gdo.management.numToggleMenu < gdo.management.maxToggleMenu) {
                gdo.management.numToggleMenu++;
                gdo.management.toggleInstanceTable = true;
                gdo.updateDisplayCanvas();
            }
        });
    if (gdo.management.toggleInstanceTable) {
        $("#header_table_row_0_col_8").css("color", "lightgreen");
    } else {
        if (gdo.management.numToggleMenu < gdo.management.maxToggleMenu) {
            $("#header_table_row_0_col_8").css("color", "white");
        } else {
            $("#header_table_row_0_col_8").css("color", "#777");
        }
    }
    $("#header_table_row_0_col_9")
        .empty()
        .css("height", gdo.management.button_height)
        .css("width", "0px")
        .css("background-color", "#444")
        .css("border", "1px solid #444")
        .css({ fontSize: gdo.management.header_font_size });
    $("#header_table_row_0_col_10")
        .empty()
        .append("<div id='header-text'> Console </div>")
        .css("height", gdo.management.button_height)
        .css("width", (gdo.management.table_width / gdo.management.header_cols) + "%")
        .css("color", "#777")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.header_font_size })
        .click(function () {
            if (gdo.management.toggleConsole) {
                gdo.management.toggleConsole = false;
                gdo.management.numToggleMenu--;
                gdo.updateDisplayCanvas();
            } else if (gdo.management.numToggleMenu < gdo.management.maxToggleMenu) {
                gdo.management.numToggleMenu++;
                gdo.management.toggleConsole = true;
                gdo.updateDisplayCanvas();
            }
        });
    if (gdo.management.toggleConsole) {
        $("#header_table_row_0_col_10").css("color", "lightgreen");
    } else {
        if (gdo.management.numToggleMenu < gdo.management.maxToggleMenu) {
            $("#header_table_row_0_col_10").css("color", "white");
        } else {
            $("#header_table_row_0_col_10").css("color", "#777");
        }
    }
    $("#header_table_row_0_col_11")
        .empty()
        .css("height", gdo.management.button_height)
        .css("width", "0px")
        .css("background-color", "#444")
        .css("border", "1px solid #444")
        .css({ fontSize: gdo.management.header_font_size });
    $("#header_table_row_0_col_12")
        .empty()
        .append("<div id='header-text'> Maintenance </div>")
        .css("height", gdo.management.button_height)
        .css("width", (gdo.management.table_width / gdo.management.header_cols) + "%")
        .css("color", "#777")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.header_font_size })
        .click(function () {
            if (gdo.net.maintenanceMode) {
                gdo.net.maintenanceMode = false;
            } else {
                gdo.net.maintenanceMode = true;
            }
            gdo.updateDisplayCanvas();
            gdo.net.server.setMaintenanceMode(gdo.net.maintenanceMode);
        });
    if (gdo.net.maintenanceMode) {
        $("#header_table_row_0_col_12").css("color", "lightgreen");
    } else {
        $("#header_table_row_0_col_12").css("color", "lightcoral");
    }
    $("#header_table_row_0_col_13")
        .empty()
        .css("height", gdo.management.button_height)
        .css("width", "0px")
        .css("background-color", "#444")
        .css("border", "1px solid #444")
        .css({ fontSize: gdo.management.header_font_size });
    $("#header_table_row_0_col_14")
        .empty()
        .append("<div id='header-text'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>")
        .css("height", gdo.management.button_height)
        .css("width", (gdo.management.table_width / gdo.management.header_cols) + "%")
        .css("color", "#777")
        .css('padding', gdo.management.cell_padding)
        .css({ fontSize: gdo.management.header_font_size });
}