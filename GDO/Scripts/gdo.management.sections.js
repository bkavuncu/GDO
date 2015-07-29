

gdo.management.drawEmptySectionTable = function (maxCol, maxRow) {
    /// <summary>
    /// Draws the section table.
    /// </summary>
    /// <param name="maxRow">The maximum row.</param>
    /// <param name="maxCol">The maximum col.</param>
    /// <returns></returns>

    $("#section_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("#section_table").append("<tr id='section_table_row_" + i + "' row='" + i + "'></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("#section_table tr:last").append("<td id='section_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'></td>");
        }
    }
}


gdo.management.drawEmptyButtonTable = function (maxCol, maxRow) {
    /// <summary>
    /// Draws the button table.
    /// </summary>
    /// <param name="maxRow">The maximum row.</param>
    /// <param name="maxCol">The maximum col.</param>
    /// <returns></returns>
    //gdo.consoleOut('.MANAGEMENT', 1, 'Drawing Empty Button Table with ' + maxRow + ',' + maxCol);
    $("#button_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("#button_table").append("<tr id='button_table_row_" + i + "' row='" + i + "'></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("#button_table tr:last").append("<td id='button_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'></td>");
        }
    }
}


gdo.management.drawSectionTable =  function (){
    /// <summary>
    /// Draws the section table.
    /// </summary>
    /// <returns></returns>
    gdo.management.drawEmptySectionTable(gdo.net.cols, gdo.net.rows);

    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var node = gdo.net.node[i];
        var sectionId = node.sectionId;

        if (sectionId == 0) {
            $("#section_table_row_" + node.row + "_col_" + node.col)
                    .empty()
                    .unbind()
                    .append("<div id='section_table_node_" + node.id + "_i'> <b>ID:</b> " + node.id + "</div>")
                    .append("<b>Col:</b> " + node.col + " | <b>Row:</b> " + node.row)
                    .css("height", (gdo.management.table_height / gdo.net.rows) + "")
                    .css("width", (gdo.management.table_width / gdo.net.cols) + "%")
                    .css("border", "4px solid #444")
                    .css("background", "#222")
                    .css({ fontSize: gdo.management.section_font_size })
                    .css('padding', gdo.management.cell_padding)
                    .click(function () {
                        var id = gdo.net.getNodeId($(this).attr('col'), $(this).attr('row'));
                        if (gdo.net.node[id].isSelected) {
                            gdo.net.node[id].isSelected = false;
                        } else {
                            gdo.management.selectedSection = -1;
                            gdo.net.node[id].isSelected = true;
                        }
                        gdo.updateDisplayCanvas();
                    });

        } else if ((node.sectionCol == 0 && node.sectionRow == 0) && node.sectionId > 0) {
            $("#section_table_row_" + node.row + "_col_" + node.col)
                .empty()
                .unbind()
                .attr('colspan', gdo.net.section[sectionId].cols)
                .attr('rowspan', gdo.net.section[sectionId].rows)
                .css("height", ((gdo.management.table_height / gdo.net.rows) * gdo.net.section[sectionId].rows) + "")
                .css("width", ((100 / gdo.net.cols) * gdo.net.section[sectionId].cols) + "%")
                .css("border", "4px solid #333")
                .css("background", "#2A4E6C")
                .css('padding', gdo.management.cell_padding)
                .append("<div id='section_table_section_" + sectionId + "_s'> <b>Section ID:</b> " + sectionId + "</div>")
                .append("<b>Start: </b> (" + gdo.net.section[sectionId].col + "," + gdo.net.section[sectionId].row + ")")
                .append("<br><b>End: </b> (" + (gdo.net.section[sectionId].col + gdo.net.section[sectionId].cols - 1) + "," + (gdo.net.section[sectionId].row + gdo.net.section[sectionId].rows - 1) + ")");
                //.append("</br>(" + gdo.net.section[sectionId].col + "," + gdo.net.section[sectionId].row + ")->(" + (gdo.net.section[sectionId].col + gdo.net.section[sectionId].cols - 1) + "," + (gdo.net.section[sectionId].row + gdo.net.section[sectionId].rows - 1) + ")")
            if (gdo.net.section[sectionId].appInstanceId >= 0) {
                $("#section_table_row_" + node.row + "_col_" + node.col)
                    .append("<div id='section_table_section_" + sectionId + "_a'> <b>Application:</b> " + gdo.net.instance[gdo.net.section[sectionId].appInstanceId].appName + "</div>")
                    .append("<div id='section_table_section_" + sectionId + "_i'> <b>Instance:</b> " + gdo.net.section[sectionId].appInstanceId + "</div>")
                    .append("<div id='section_table_section_" + sectionId + "_c'> <b>Configuration:</b> " + gdo.net.instance[gdo.net.section[sectionId].appInstanceId].configName + "</div>")
                    .css("background", "#003300");
            }
            $("#section_table_row_" + node.row + "_col_" + node.col)
                .append("<div id='section_table_section_" + sectionId + "_h'> <b>Section Health</b></div>")
                .css({ fontSize: gdo.management.section_font_size })
                .click(function () {
                    var id = gdo.net.node[gdo.net.getNodeId($(this).attr('col'), $(this).attr('row'))].sectionId;
                    if (gdo.management.selectedSection == id) {
                        gdo.management.selectedSection = -1;
                    } else {
                        for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
                            gdo.net.node[i].isSelected = false;
                        }
                        gdo.management.selectedSection = id;
                    }
                    gdo.updateDisplayCanvas();
                });
            if (gdo.management.selectedSection == sectionId) {
                if (gdo.net.section[sectionId].appInstanceId >= 0) {
                    $("#section_table_row_" + node.row + "_col_" + node.col).css("background-color", "#006B00");
                } else {
                    $("#section_table_row_" + node.row + "_col_" + node.col).css("background-color", "#6699FF");
                }

            }
            if (gdo.net.section[sectionId].health >= 4) {
                $("#section_table_section_" + sectionId + '_h').css("background", "darkgreen");
            } else if (gdo.net.section[sectionId].health >= 3) {
                $("#section_table_section_" + sectionId + '_h').css("background", "goldenrod");
            } else if (gdo.net.section[sectionId].health >= 2) {
                $("#section_table_section_" + sectionId + '_h').css("background", "coral");
            } else if (gdo.net.section[sectionId].health >= 1) {
                $("#section_table_section_" + sectionId + '_h').css("background", "darkred");
            } else {
                $("#section_table_section_" + sectionId + '_h').css("background", "darkred");
            }
        } else if ((node.sectionCol != 0 || node.sectionRow != 0) && node.sectionId > 0) {
            $("#section_table_row_" + node.row + "_col_" + node.col).hide();
        }
        if (node.isSelected) {
            $("#section_table_row_" + node.row + "_col_" + node.col).css("background-color", "#333");
        }
    }
}

gdo.management.drawButtonTable = function () {
    /// <summary>
    /// Draws the button table.
    /// </summary>
    /// <returns></returns>

    //Create Section

    $("#button_table_row_0_col_0")
        .empty()
        .append("<div id='button_Create_section'> <b>Create Section</b></div>")
        .css("height", gdo.management.button_height)
        .css("width", (gdo.management.table_width / gdo.management.button_cols) + "%")
        .css("border", "3px solid #444")
        .css("background", "#222")
        .css("color", "#777")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size });

    gdo.management.isRectangle = true;
    gdo.management.isStarted = false;
    gdo.management.colStart = 1000;
    gdo.management.colEnd = -1;
    gdo.management.rowStart = 1000;
    gdo.management.rowEnd = -1;
    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var node = gdo.net.node[i];
        if (node.isSelected) {
            gdo.management.isStarted = true;
            if (node.col <= gdo.management.colStart) {
                gdo.management.colStart = node.col;
            }
            if (node.row <= gdo.management.rowStart) {
                gdo.management.rowStart = node.row;
            }
            if (node.col >= gdo.management.colEnd) {
                gdo.management.colEnd = node.col;
            }
            if (node.row >= gdo.management.rowEnd) {
                gdo.management.rowEnd = node.row;
            }
        }
    }
    for (var i = gdo.management.colStart; i <= gdo.management.colEnd; i++) {
        for (var j = gdo.management.rowStart; j <= gdo.management.rowEnd; j++) {
            var node = gdo.net.node[gdo.net.getNodeId(i, j)];
            if (!node.isSelected) {
                gdo.management.isRectangle = false;
            }
        }
    }
    $("#button_table_row_0_col_0").unbind();
    $("#button_table_row_0_col_0").click(function () {
        if (gdo.management.isRectangle && gdo.management.isStarted) {
            gdo.net.server.createSection(gdo.management.colStart, gdo.management.rowStart, gdo.management.colEnd, gdo.management.rowEnd);
            for (var i = gdo.management.colStart; i <= gdo.management.colEnd; i++) {
                for (var j = gdo.management.rowStart; j <= gdo.management.rowEnd; j++) {
                    var node = gdo.net.node[gdo.net.getNodeId(i, j)];
                    node.isSelected = false;
                }
            }
            gdo.consoleOut('.MANAGEMENT', 1, 'Requested Creation of Section at (' + gdo.management.colStart + ',' + gdo.management.rowStart + '),(' + gdo.management.colEnd + ',' + gdo.management.rowEnd + ')');
        } else {

        }
    });
    if (gdo.management.isStarted) {
        if (gdo.management.isRectangle) {
            $("#button_table_row_0_col_0")
                .css("background", "darkgreen")
                .css("color", "#FFF");
        } else {
            $("#button_table_row_0_col_0")
                .css("background", "darkred")
                .css("color", "#FFF");
        }
    } else {
        $("#button_table_row_0_col_0")
            .css("background", "#222");
    }

    //Close Section

    $("#button_table_row_0_col_1")
        .empty()
        .append("<div id='button_close_section'> <b>Close Section</b></div>")
        .css("height", gdo.management.button_height)
        .css("width", (100 / gdo.management.button_cols) + "%")
        .css("border", "3px solid #444")
        .css("color", "#777")
        .css("background", "#222")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
        .click(function () {
            for (var i = 1; i < (gdo.net.cols * gdo.net.rows) ; i++) {
                if (gdo.management.selectedSection == i && gdo.net.section[i].appInstanceId == -1) {
                    gdo.management.selectedSection = -1;
                    gdo.net.server.closeSection(i);
                    gdo.consoleOut('.MANAGEMENT', 1, 'Requested Disposal of Section ' + i);
                    break;
                }
            }
        });

    for (var i = 1; i < (gdo.net.cols * gdo.net.rows) ; i++) {
        if (gdo.management.selectedSection == i && gdo.net.section[i].appInstanceId == -1) {
            $("#button_table_row_0_col_1").css("background", "darkred").css("color", "#FFF");
        }
    }
    $("#button_table_row_0_col_2")
        .empty()
        .append("<div id='button_deploy_app'> <b>Deploy App</b></div>")
        .css("height", gdo.management.button_height)
        .css("width", (100 / gdo.management.button_cols) + "%")
        .css("border", "3px solid #444")
        .css("color", "#777")
        .css("background", "#222")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
        .click(function () {
            for (var i = 1; i < (gdo.net.cols * gdo.net.rows) ; i++) {
                if (gdo.management.selectedSection == i && !gdo.management.toggleAppTable && gdo.net.section[i].appInstanceId  == -1) {
                    gdo.management.toggleNodeTable = false;
                    gdo.management.toggleAppTable = true;
                    gdo.management.toggleInstanceTable = false;
                    gdo.management.toggleConsole = false;
                    gdo.management.toggleSectionTable = true;
                    gdo.updateDisplayCanvas();
                    break;
                }
            }
        });

    for (var i = 1; i < (gdo.net.cols * gdo.net.rows) ; i++) {
        if (gdo.management.selectedSection == i && gdo.net.section[i].appInstanceId == -1) {
            $("#button_table_row_0_col_2").css("background", "darkgreen").css("color", "#FFF");
        }
    }
    $("#button_table_row_0_col_3")
        .empty()
        .append("<div id='button_control_app'> <b>Control App</b></div>")
        .css("height", gdo.management.button_height)
        .css("width", (100 / gdo.management.button_cols) + "%")
        .css("border", "3px solid #444")
        .css("color", "#777")
        .css("background", "#222")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
        .click(function () {
            for (var i = 1; i < (gdo.net.cols * gdo.net.rows) ; i++) {
                if (gdo.net.section[i].isSelected && gdo.net.section[i].deployed) {
                    gdo.net.section[i].isSelected = false;
                    gdo.management.numSelectedSection--;
                    gdo.management.toggleNodeTable = false;
                    gdo.management.toggleAppTable = false;
                    gdo.management.toggleInstanceTable = true;
                    gdo.management.toggleConsole = false;
                    gdo.management.toggleSectionTable = true;

                    //TODO
                }
            }
        });

    for (var i = 1; i < (gdo.net.cols * gdo.net.rows) ; i++) {
        if (gdo.management.selectedSection == i && gdo.net.section[i].appInstanceId > -1) {
            $("#button_table_row_0_col_3").css("background", "darkgreen").css("color", "#FFF");
        }
    }
    $("#button_table_row_0_col_4")
    .empty()
    .append("<div id='button_close_app'> <b>Close App</b></div>")
    .css("height", gdo.management.button_height)
    .css("width", (100 / gdo.management.button_cols) + "%")
    .css("border", "3px solid #444")
    .css("color", "#777")
    .css("background", "#222")
    .css('padding', gdo.management.cell_padding)
    .attr("align", "center")
    .css({ fontSize: gdo.management.button_font_size })
    .click(function () {
        for (var i = 1; i < (gdo.net.cols * gdo.net.rows) ; i++) {
            if (gdo.management.selectedSection == i && gdo.net.section[i].appInstanceId > -1) {
                gdo.management.selectedSection = -1;
                gdo.net.server.closeApp(gdo.net.section[i].appInstanceId);
                gdo.consoleOut('.MANAGEMENT', 1, 'Requested Disposal of App' + i);
            }
        }
    });

    for (var i = 1; i < (gdo.net.cols * gdo.net.rows) ; i++) {
        if (gdo.management.selectedSection == i && gdo.net.section[i].appInstanceId > -1) {
            $("#button_table_row_0_col_4").css("background", "darkred").css("color", "#FFF");
        }
    }
}