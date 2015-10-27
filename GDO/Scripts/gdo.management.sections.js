$(function () {
    gdo.management.selectedSection = -1;
    gdo.management.selectedApp = null;
    gdo.management.selectedConfiguration = null;
    gdo.management.selectedInstance = -1;
});

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
                    .css("vertical-align", "top")
                    .append("<div id='section_table_node_" + node.id + "_i' style='text-align:center;background:#444'> <font size='4px'><b> " + node.id + "</b></font></div>")
                    .append("</br>")
                    .append("<b>&nbsp;Col:</b> " + node.col + " | <b>Row:</b> " + node.row)
                    .css("height", (gdo.management.table_height / gdo.net.rows) + "")
                    .css("width", (gdo.management.table_width / gdo.net.cols) + "%")
                    .css("border", "1px solid #333")
                    .css("background", "#222")
                    .css({ fontSize: gdo.management.section_font_size })
                    .css('padding', 0)
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
                .css("width", ((gdo.management.table_width / gdo.net.cols) * gdo.net.section[sectionId].cols) + "%")
                .css("border", "1px solid #4C6F8E")
                .css("background", "#2A4E6C")
                .css('padding', 0)
                .css("vertical-align", "top")
                .append("<div id='section_table_section_" + sectionId + "_i' style='text-align:center;background:#4C6F8E'> <font size='4px'><b> " + sectionId + "</b></font></div>")
                .append("</br>")
                .append("<b>&nbsp;Start: </b> (" + gdo.net.section[sectionId].col + "," + gdo.net.section[sectionId].row + ")")
                .append("<br><b>&nbsp;End: </b> (" + (gdo.net.section[sectionId].col + gdo.net.section[sectionId].cols - 1) + "," + (gdo.net.section[sectionId].row + gdo.net.section[sectionId].rows - 1) + ")");
                //.append("</br>(" + gdo.net.section[sectionId].col + "," + gdo.net.section[sectionId].row + ")->(" + (gdo.net.section[sectionId].col + gdo.net.section[sectionId].cols - 1) + "," + (gdo.net.section[sectionId].row + gdo.net.section[sectionId].rows - 1) + ")")
            if (gdo.net.section[sectionId].appInstanceId >= 0) {
                $("#section_table_row_" + node.row + "_col_" + node.col)
                    .append("</br>")
                    .append("<div id='section_table_section_" + sectionId + "_a'> <b>&nbsp;Application:</b> " + gdo.net.instance[gdo.net.section[sectionId].appInstanceId].appName + "</div>")
                    .append("<div id='section_table_section_" + sectionId + "_i'> <b>&nbsp;Instance:</b> " + gdo.net.section[sectionId].appInstanceId + "</div>")
                    .append("<div id='section_table_section_" + sectionId + "_c'> <b>&nbsp;Configuration:</b> " + gdo.net.instance[gdo.net.section[sectionId].appInstanceId].configName + "</div>")
                    .css("background", "#003300");
                $("#section_table_section_" + sectionId + "_i").css("background", "#225522");
                $("#section_table_row_" + node.row + "_col_" + node.col).css("border", "1px solid #225522");
            }
            $("#section_table_row_" + node.row + "_col_" + node.col)
                .append("<div id='section_table_section_" + sectionId + "_h'> <b>&nbsp;Section Health</b></div>")
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
                        //gdo.management.selectedInstance = gdo.net.section[gdo.management.selectedSection].appInstanceId;
                    }
                    gdo.updateDisplayCanvas();
                });
            if (gdo.management.selectedSection == sectionId) {
                if (gdo.net.section[sectionId].appInstanceId >= 0) {
                    $("#section_table_row_" + node.row + "_col_" + node.col).css("background-color", "#225522").css("border", "1px solid #447744");
                    $("#section_table_section_" + sectionId + "_i").css("background", "#447744");
                } else {
                    $("#section_table_row_" + node.row + "_col_" + node.col).css("background-color", "#4C6F8E").css("border", "1px solid #6E8FAF");
                    $("#section_table_section_" + sectionId + "_i").css("background", "#6E8FAF");
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
            $("#section_table_row_" + node.row + "_col_" + node.col).css("background-color", "#333").css("border","1px solid #555");
            $("#section_table_node_" + node.id + "_i").css("background-color", "#555");
        }
    }
}

gdo.management.selectNodes = function() {
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
}

gdo.management.drawButtonTable = function () {
    /// <summary>
    /// Draws the button table.
    /// </summary>
    /// <returns></returns>

    //Create Section

    $("#create_section_button_div")
        .empty()
        .append("<button type='button' id='create_section_button' class='btn btn-default disabled btn-lg btn-block'>Create Section</button>")
        .css("height", "100%")
        .css("width", (gdo.management.table_width / gdo.management.button_cols) + "%")
        .css('padding', 1)
        .attr("align", "center");

    gdo.management.selectNodes();
    $("#create_section_button_div").unbind();
    $("#create_section_button_div").click(function () {
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
            $("#create_section_button")
                .removeClass("disabled")
                .removeClass("btn-default")
                .addClass("btn-success");
        } else {
            $("#create_section_button")
                .removeClass("btn-default")
                .addClass("btn-danger");
        }
    } else {
        $("#create_section_button")
            .addClass("disabled")
            .addClass("btn-default")
            .removeClass("btn-danger")
            .removeClass("btn-sucess");
    }

    //Enter Section Coordinates

    $("#select_section_div")
    .empty()
    .append("<div id='button_Enter_coordinates'> " +
            "<table id='section_coordinate_table' style='width: 99%;' >" +
                "<tr>"+
                    "<td id='section_coordinate_table_start'' style='width:28%'><input type='text' id='section_coordinate_table_start_input' pattern='[1-9]{10}' style='background:#222; width: 100%;height: 100%;' maxlength='2'/></input></td>" +
                    "<td id='section_coordinate_table_end' style='width:28%'><input type='text' id='section_coordinate_table_end_input' pattern='[1-9]{10}' style='background:#222; width: 100%;height: 100%;' maxlength='2' /></input></td>" +
                    "<td id='section_coordinate_table_select' style='width:42%;'></td>" +
                "</tr>" +
            "</table>")
    .css("width", (gdo.management.table_width / gdo.management.button_cols)+ "%")
    .css("color", "#FFF")
    .css('padding', 0)
    .attr("align", "center")
    .css({ fontSize: gdo.management.button_font_size});

    $("#section_coordinate_table_start_input")
        .css("height", "100%")
        .css("width", "98%")
        .css("border", "0px solid #333")
        .css("background", "#333")
        .css("color", "#FFF")
        .css('padding', 0)
        .css('margin-top', 1)
        .css('padding-bottom', 1)
        .css('text-align','center')
        .attr("align", "center")
        .attr("onfocus", "this.value=''")
        .attr("value", gdo.net.getNodeId(gdo.management.colStart, gdo.management.rowEnd))
        .css({ fontSize: gdo.management.button_font_size * 1.4 });

    $("#section_coordinate_table_end_input")
        .css("height", "100%")
        .css("width", "98%")
        .css("border", "0px solid #333")
        .css("background", "#333")
        .css("color", "#FFF")
        .css('padding', 0)
        .css('margin-top', 1)
        .css('padding-bottom', 1)
        .css('text-align', 'center')
        .attr("align", "center")
        .attr("onfocus", "this.value=''")
        .attr("value",  gdo.net.getNodeId(gdo.management.colEnd, gdo.management.rowStart))
        .css({ fontSize: gdo.management.button_font_size * 1.4 });

    $("#section_coordinate_table_select")
        .empty()
        .append("<button type='button' id='select_button' class='btn btn-default disabled btn-lg btn-block'>Select</button>")
        .css("height", "100%")
        .css("width", "100%")
        .css("color", "#FFF")
        .css('padding-top', 1)
        .attr("align", "center");
    $("#select_button").unbind();
    $("#select_button").click(function () {
        var nodeStart = parseInt(document.getElementById('section_coordinate_table_start_input').value);
        var nodeEnd = parseInt(document.getElementById('section_coordinate_table_end_input').value);
        if (nodeEnd >= nodeStart && nodeStart <= gdo.net.cols * gdo.net.rows && nodeEnd <= gdo.net.cols * gdo.net.rows && nodeStart > 0 && nodeEnd > 0) {
            for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
                gdo.net.node[i].isSelected = false;
            }
            gdo.management.selectedSection = -1;
            for (var i = gdo.net.node[nodeStart].col; i <= gdo.net.node[nodeEnd].col ; i++) {
                for (var j = gdo.net.node[nodeEnd].row; j <= gdo.net.node[nodeStart].row; j++) {
                    gdo.net.node[gdo.net.getNodeId(i, j)].isSelected = true;
                }
            }
            gdo.management.selectNodes();
            gdo.updateDisplayCanvas();
        }
    });
    var nodeStart = parseInt(document.getElementById('section_coordinate_table_start_input').value);
    var nodeEnd = parseInt(document.getElementById('section_coordinate_table_end_input').value);
    if (nodeEnd >= nodeStart && nodeStart <= gdo.net.cols * gdo.net.rows && nodeEnd <= gdo.net.cols * gdo.net.rows && nodeStart > 0 && nodeEnd > 0) {
        $("#select_button")
            .removeClass("disabled")
            .removeClass("btn-default")
            .addClass("btn-primary");
    } else {
        $("#select_button")
            .addClass("disabled")
            .addClass("btn-default")
            .removeClass("btn-primary");
    }

    //Close Section

    $("#close_section_button_div")
        .empty()
        .append("<button type='button' id='close_section_button' class='btn btn-default disabled btn-lg btn-block'>Close Section</button>")
        .css("height", "100%")
        .css("width", (gdo.management.table_width / gdo.management.button_cols) + "%")
        .css('padding', 1)
        .attr("align", "center")
        .click(function () {
            if (gdo.management.selectedSection > -1) {
                if (gdo.net.section[gdo.management.selectedSection].appInstanceId == -1) {
                    gdo.net.server.closeSection(gdo.management.selectedSection);
                    gdo.consoleOut('.MANAGEMENT', 1, 'Requested Disposal of Section ' + gdo.management.selectedSection);
                    gdo.management.selectedSection = -1;
                }
            }
        });
    if (gdo.management.selectedSection > -1) {
        if (gdo.net.section[gdo.management.selectedSection].appInstanceId == -1) {
            $("#close_section_button")
                .removeClass("disabled")
                .removeClass("btn-default")
                .addClass("btn-warning");
        }
    } else {
        $("#close_section_button")
            .addClass("disabled")
            .addClass("btn-default")
            .removeClass("btn-warning");
    }

    //Deploy App

    $("#deploy_app_button_div")
        .empty()
        .append("<button type='button' id='deploy_app_button' class='btn btn-default disabled btn-lg btn-block'>Deploy App</button>")
        .css("height", "100%")
        .css("width", (gdo.management.table_width / gdo.management.button_cols) + "%")
        .css('padding', 1)
        .attr("align", "center")
        .unbind()
        .click(function () {
            if (gdo.net.section[gdo.management.selectedSection] != null) {
                if (gdo.net.section[gdo.management.selectedSection].appInstanceId == -1 && gdo.management.selectedApp != null && gdo.management.selectedConfiguration != null) {
                    gdo.net.server.deployApp(gdo.management.selectedSection, gdo.management.selectedApp, gdo.management.selectedConfiguration);
                    gdo.consoleOut('.MANAGEMENT', 1, 'Requested Deployment of App ' + gdo.management.selectedApp + " at Section " + gdo.management.selectedSection + " with Configuration " + gdo.management.selectedConfiguration);
                    gdo.management.selectedSection = -1;
                    gdo.management.selectedApp = null;
                    gdo.management.selectedConfiguration = null;
                    gdo.updateDisplayCanvas();
                }
            }
        });
    if (gdo.management.selectedSection > -1) {
        if (gdo.management.selectedConfiguration !=null) {
            $("#deploy_app_button")
                .removeClass("disabled")
                .removeClass("btn-default")
                .removeClass("btn-danger")
                .addClass("btn-success");
        } else if (gdo.net.section[gdo.management.selectedSection].appInstanceId == -1){
            $("#deploy_app_button")
                .removeClass("btn-default")
                .removeClass("btn-sucess")
                .addClass("btn-danger")
                .addClass("disabled");
        } else {
            $("#deploy_app_button")
                .addClass("disabled")
                .addClass("btn-default")
                .removeClass("btn-sucess")
                .removeClass("btn-danger");
        }
    } else {
        $("#deploy_app_button")
            .addClass("disabled")
            .addClass("btn-default")
            .removeClass("btn-sucess")
            .removeClass("btn-danger");
    }
    $("#control_app_button_div")
        .empty()
        .append("<button type='button' id='control_app_button' class='btn btn-default disabled btn-lg btn-block'>Control App</button>")
        .css("height", "100%")
        .css("width", (gdo.management.table_width / gdo.management.button_cols) + "%")
        .css('padding', 1)
        .attr("align", "center")
        .click(function () {
            if (gdo.management.selectedSection > -1) {
                if (gdo.net.section[gdo.management.selectedSection].appInstanceId > -1) {
                    gdo.management.toggleNodeTable = false;
                    gdo.management.toggleAppTable = false;
                    gdo.management.toggleInstanceTable = true;
                    gdo.management.toggleConsole = false;
                    gdo.management.toggleSectionTable = false;
                    gdo.updateDisplayCanvas();
                }
            }
        });
    if (gdo.management.selectedSection > -1) {
        if (gdo.net.section[gdo.management.selectedSection].appInstanceId > -1) {
            $("#control_app_button")
                .removeClass("disabled")
                .removeClass("btn-default")
                .removeClass("btn-danger")
                .addClass("btn-success");
        } else {
            $("#control_app_button")
                .addClass("disabled")
                .addClass("btn-default")
                .removeClass("btn-success");
        }
    } else {
        $("#control_app_button")
            .addClass("disabled")
            .addClass("btn-default")
            .removeClass("btn-success");
    }
    $("#close_app_button_div")
    .empty()
    .append("<button type='button' id='close_app_button' class='btn btn-default disabled btn-lg btn-block'>Close App</button>")
    .css("height", "100%")
    .css("width", (gdo.management.table_width / gdo.management.button_cols) + "%")
    .css('padding', 1)
    .attr("align", "center")
    .click(function () {
            if (gdo.management.selectedSection > -1) {
                if (gdo.net.section[gdo.management.selectedSection].appInstanceId > -1) {                  
                    gdo.net.server.closeApp(gdo.net.section[gdo.management.selectedSection].appInstanceId);
                    gdo.consoleOut('.MANAGEMENT', 1, 'Requested Disposal of App' + gdo.management.selectedSection);
                    gdo.management.selectedSection = -1;
                }
            }
    });
    if (gdo.management.selectedSection > -1) {
        if (gdo.net.section[gdo.management.selectedSection].appInstanceId > -1) {
            $("#close_app_button")
                .removeClass("disabled")
                .removeClass("btn-default")
                .removeClass("btn-danger")
                .addClass("btn-warning");
        } else {
            $("#close_app_button")
                .addClass("disabled")
                .addClass("btn-default")
                .removeClass("btn-warning");
        }
    } else {
        $("#close_app_button")
            .addClass("disabled")
            .addClass("btn-default")
            .removeClass("btn-warning");
    }
}