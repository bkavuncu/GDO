$(function () {
    // file list
    $("#file_list").enscroll({
        showOnHover: false,
        verticalTrackClass: 'track4',
        verticalHandleClass: 'handle4'
    }).css({ "padding-right": "0px", "width": "99.5%" });

    $('.list-group-item').on('click', function () {
        $('.fa', this)
          .toggleClass('fa-chevron-right')
          .toggleClass('fa-chevron-down');
    });

    var gdo = parent.gdo;

    gdo.net.app["PresentationTool"].drawEmptySectionTable = function (maxCol, maxRow) {
        /// <summary>
        /// Draws the section table.
        /// </summary>
        /// <param name="maxRow">The maximum row.</param>
        /// <param name="maxCol">The maximum col.</param>
        /// <returns></returns>gdo.net.app["PresentationTool"]
        $("#section_table").empty();
        for (var i = 0; i < maxRow; i++) {
            $("#section_table").append("<tr id='section_table_row_" + i + "' row='" + i + "'></tr>");
            for (var j = 0; j < maxCol; j++) {
                $("#section_table tr:last").append("<td id='section_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'></td>").css('overflow', 'hidden');
            }
        }
    }

    gdo.net.app["PresentationTool"].drawSectionTable = function () {
        gdo.net.app["PresentationTool"].drawEmptySectionTable(gdo.net.cols, gdo.net.rows);
        for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
            var node = gdo.net.node[i];
            var sectionId = node.sectionId;
            $("#section_table_row_" + gdo.net.rows).css("height", 0);
            if (sectionId == 0) {
                $("#section_table_row_" + node.row).css("height", "7vh").css('overflow', 'hidden');
                $("#section_table_row_" + node.row + "_col_" + node.col)
                        .empty()
                        .unbind()
                        .css("vertical-align", "top")
                        .append("<div id='section_table_node_" + node.id + "_i' style='text-align:center;background:#444;'> <font size='4px'><b>" + node.id + "</b></font></div>")
                        .append("</br>")
                        .append("<b>&nbsp;Col:</b> " + node.col + " | <b>Row:</b> " + node.row)
                        //.css("height", (gdo.management.table_height / gdo.net.rows) + "")
                        .css("width", (gdo.management.table_width / gdo.net.cols) + "%")
                        .css("border", "1px solid #333")
                        .css('overflow', 'hidden')
                        .css("background", "#222")
                        .css({ fontSize: gdo.management.section_font_size })
                        .css('padding', 0)
                        .click(function () {
                            var id = gdo.net.getNodeId($(this).attr('col'), $(this).attr('row'));
                            if (gdo.net.node[id].isSelected) {
                                gdo.net.node[id].isSelected = false;
                            } else {
                                gdo.management.sections.selectedSection = -1;
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
                    //.css("height", ((gdo.management.table_height / gdo.net.rows) * gdo.net.section[sectionId].rows) + "")
                    .css("width", ((gdo.management.table_width / gdo.net.cols) * gdo.net.section[sectionId].cols) + "%")
                    .css("border", "1px solid #2A9FD6")
                    .css("background", "#087DB4")
                    .css('padding', 0)
                    .css('overflow', 'hidden')
                    .css("vertical-align", "top")
                    .append("<div id='section_table_section_" + sectionId + "_i' style='text-align:center;background:#2A9FD6'> <font size='4px'><b> S" + sectionId + "</b></font></div>")
                    .append("<div style='height:5px'></div>");
                if (gdo.net.section[sectionId].src === null) {
                    if (gdo.net.section[sectionId].cols == 1 && gdo.net.section[sectionId].rows == 1) {
                        $("#section_table_row_" + node.row + "_col_" + node.col).append("&nbsp;<b>N</b>" + gdo.net.section[sectionId].nodeMap[0][gdo.net.section[sectionId].nodeMap[0].length - 1] + "");
                    } else {
                        $("#section_table_row_" + node.row + "_col_" + node.col).append("&nbsp;<b>N</b>" + gdo.net.section[sectionId].nodeMap[0][gdo.net.section[sectionId].nodeMap[0].length - 1] + " to <b>N</b>" + gdo.net.section[sectionId].nodeMap[gdo.net.section[sectionId].nodeMap.length - 1][0] + "");
                    }
                }
                //.append("</br>(" + gdo.net.section[sectionId].col + "," + gdo.net.section[sectionId].row + ")->(" + (gdo.net.section[sectionId].col + gdo.net.section[sectionId].cols - 1) + "," + (gdo.net.section[sectionId].row + gdo.net.section[sectionId].rows - 1) + ")")
                if (gdo.net.section[sectionId].appInstanceId >= 0 && gdo.net.section[sectionId].src === null) {
                    $("#section_table_section_" + sectionId + "_i")
                        .empty()
                        .append("<font size='4px'><b> S" + sectionId + ", I" + gdo.net.section[sectionId].appInstanceId + "</b></font>");
                    $("#section_table_row_" + node.row + "_col_" + node.col)
                        .append("</br>")
                        .css('overflow', 'hidden')
                        .append("<div id='section_table_section_" + sectionId + "_a'> <b>&nbsp;App:</b> " + gdo.net.instance[gdo.net.section[sectionId].appInstanceId].appName + "</div>")

                        .append("<div id='section_table_section_" + sectionId + "_c'> <b>&nbsp;Config:</b> " + gdo.net.instance[gdo.net.section[sectionId].appInstanceId].configName + "</div>")
                        .css('overflow', 'hidden')
                        .css("background", "#559100");
                    $("#section_table_section_" + sectionId + "_i").css("background", "#77B300");
                    $("#section_table_row_" + node.row + "_col_" + node.col).css("border", "1px solid #77B300");
                }
                if (gdo.net.section[sectionId].src === null) {
                    $("#section_table_row_" + node.row + "_col_" + node.col)
                        .append("<div id='section_table_section_" + sectionId + "_h'> <b>&nbsp;Section Health</b></div>")
                        .css({ fontSize: gdo.management.section_font_size })
                }
                $("#section_table_row_" + node.row + "_col_" + node.col)
                    .click(function () {
                        var id = gdo.net.node[gdo.net.getNodeId($(this).attr('col'), $(this).attr('row'))].sectionId;
                        if (gdo.management.sections.selectedSection == id) {
                            gdo.management.sections.selectedSection = -1;

                        } else {
                            for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
                                gdo.net.node[i].isSelected = false;
                            }
                            gdo.management.sections.selectedSection = id;
                            //gdo.management.selectedInstance = gdo.net.section[gdo.management.selectedSection].appInstanceId;
                        }
                        gdo.updateDisplayCanvas();
                    });

                // Deploy Resources
                if (gdo.net.section[sectionId].src !== null) {
                    $("#section_table_section_" + sectionId + "_i")
                        .empty()
                        .append("<font size='4px'><b> S" + sectionId + ", I" + gdo.net.section[sectionId].appInstanceId + "</b></font>");

                    $("#section_table_row_" + node.row + "_col_" + node.col)
                        .append("<img id = 'section_table_row_" + node.row + "_col_" + node.col + "_img' style='width:100%; height:auto' src='" + gdo.net.section[sectionId].src + "'/>")
                        //.css('overflow', 'hidden')
                        .css("background", "#559100");
                    var width = $("#section_table_row_" + node.row + "_col_" + node.col + "_img").width();
                    $("#section_table_row_" + node.row + "_col_" + node.col + "_img").height((width / (gdo.net.section[sectionId].width / gdo.net.section[sectionId].height)));
                    // draggable
                    $("#section_table_row_" + node.row + "_col_" + node.col + "_img")
                        .unbind()
                        .draggable({
                            containment: '#section_table',
                            scroll: false,
                            revert: true,
                            stack: "#section_table_row_" + node.row + "_col_" + node.col + "_img"
                        });
                    $("#section_table_section_" + sectionId + "_i").css("background", "#77B300");
                    $("#section_table_row_" + node.row + "_col_" + node.col).css("border", "1px solid #77B300");
                }

                if (gdo.management.sections.selectedSection == sectionId) {
                    if (gdo.net.section[sectionId].appInstanceId >= 0 || gdo.net.section[sectionId].src !== null) {
                        $("#section_table_row_" + node.row + "_col_" + node.col).css("background-color", "#77B300").css("border", "1px solid #99D522");
                        $("#section_table_section_" + sectionId + "_i").css("background", "#99D522");
                    } else {
                        $("#section_table_row_" + node.row + "_col_" + node.col).css("background-color", "#2A9FD6").css("border", "1px solid #4CBFF8");
                        $("#section_table_section_" + sectionId + "_i").css("background", "#4CBFF8");
                    }

                }
                if (gdo.net.section[sectionId].health >= 4) {
                    $("#section_table_section_" + sectionId + '_h').css("background", "#559100");
                } else if (gdo.net.section[sectionId].health >= 3) {
                    $("#section_table_section_" + sectionId + '_h').css("background", "#DD7700");
                } else if (gdo.net.section[sectionId].health >= 2) {
                    $("#section_table_section_" + sectionId + '_h').css("background", "#FF8800");
                } else if (gdo.net.section[sectionId].health >= 1) {
                    $("#section_table_section_" + sectionId + '_h').css("background", "#CC0000");
                } else {
                    $("#section_table_section_" + sectionId + '_h').css("background", "#CC0000");
                }
            } else if ((node.sectionCol != 0 || node.sectionRow != 0) && node.sectionId > 0) {
                $("#section_table_row_" + node.row + "_col_" + node.col).hide();
            }
            if (node.isSelected) {
                $("#section_table_row_" + node.row + "_col_" + node.col).css("background-color", "#333").css("border", "1px solid #555");
                $("#section_table_node_" + node.id + "_i").css("background-color", "#555");
            }     
        }
    }

    gdo.net.app["PresentationTool"].selectNodes = function () {
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

    gdo.net.app["PresentationTool"].drawButtonTable = function () {
        /// <summary>
        /// Draws the button table.
        /// </summary>
        /// <returns></returns>

        //Create Section
        $(".create_section_button_div")
            .empty()
            .append("<button type='button' id='create_section_button' class='btn btn-default disabled btn-lg btn-block'><i class='fa  fa-plus-circle fa-fw'></i>&nbsp;Create Section</button>")
            .css("height", "100%")
            .css("width", (gdo.management.table_width / gdo.management.button_cols) + "%")
            .css('padding', 1)
            .attr("align", "center");

        gdo.net.app["PresentationTool"].selectNodes();
        $(".create_section_button_div").unbind();
        $(".create_section_button_div").click(function () {
            if (gdo.management.isRectangle && gdo.management.isStarted) {
                gdo.net.app["PresentationTool"].server.createSection(gdo.controlId, gdo.management.colStart, gdo.management.rowStart, gdo.management.colEnd, gdo.management.rowEnd);
                for (var i = gdo.management.colStart; i <= gdo.management.colEnd; i++) {
                    for (var j = gdo.management.rowStart; j <= gdo.management.rowEnd; j++) {
                        var node = gdo.net.node[gdo.net.getNodeId(i, j)];
                        node.isSelected = false;
                    }
                }
                gdo.consoleOut('.PresentationTool', 1, 'Requested Creation of Section at (' + gdo.management.colStart + ',' + gdo.management.rowStart + '),(' + gdo.management.colEnd + ',' + gdo.management.rowEnd + ')');
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
                .removeClass("btn-success");
        }

        //Enter Section Coordinates

        $(".select_section_div")
            .empty()
            .append("<div id='button_Enter_coordinates'> " +
                "<table id='section_coordinate_table' style='width: 99%;' >" +
                "<tr>" +
                "<td id='section_coordinate_table_start'' style='width:49%'><input type='text' id='section_coordinate_table_start_input' pattern='[1-9]{10}' style='background:#222; width: 100%;height: 100%;' maxlength='2'/></input></td>" +
                "<td id='section_coordinate_table_end' style='width:49%'><input type='text' id='section_coordinate_table_end_input' pattern='[1-9]{10}' style='background:#222; width: 100%;height: 100%;' maxlength='2' /></input></td>" +
                "<td id='section_coordinate_table_select' style='width:35%;'></td>" +
                "</tr>" +
                "</table>")
            .css("width", 1.5 * (gdo.management.table_width / gdo.management.button_cols) + "%")
            .css("color", "#FFF")
            .css('padding', 0)
            .attr("align", "center")
            .css({ fontSize: gdo.management.button_font_size });

        $("#section_coordinate_table_start_input")
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
            .attr("value", gdo.net.getNodeId(gdo.management.colEnd, gdo.management.rowStart))
            .css({ fontSize: gdo.management.button_font_size * 1.4 });

        $("#section_coordinate_table_select")
            .empty()
            .append("<button type='button' class='select_button btn btn-default disabled btn-lg btn-block'><i class='fa  fa-expand fa-fw'></i>&nbsp;Select</button>")
            .css("height", "100%")
            .css("width", "100%")
            .css("color", "#FFF")
            .css('padding-top', 1)
            .attr("align", "center");
        $(".select_button").unbind();
        $(".select_button").click(function () {
            var nodeStart = parseInt(document.getElementById('section_coordinate_table_start_input').value);
            var nodeEnd = parseInt(document.getElementById('section_coordinate_table_end_input').value);
            if (nodeEnd >= nodeStart && nodeStart <= gdo.net.cols * gdo.net.rows && nodeEnd <= gdo.net.cols * gdo.net.rows && nodeStart > 0 && nodeEnd > 0) {
                for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
                    gdo.net.node[i].isSelected = false;
                }
                gdo.management.sections.selectedSection = -1;
                for (var i = gdo.net.node[nodeStart].col; i <= gdo.net.node[nodeEnd].col; i++) {
                    for (var j = gdo.net.node[nodeEnd].row; j <= gdo.net.node[nodeStart].row; j++) {
                        gdo.net.node[gdo.net.getNodeId(i, j)].isSelected = true;
                    }
                }
                gdo.net.app["PresentationTool"].selectNodes();
                gdo.updateDisplayCanvas();
            }
        });
        var nodeStart = parseInt(document.getElementById('section_coordinate_table_start_input').value);
        var nodeEnd = parseInt(document.getElementById('section_coordinate_table_end_input').value);
        if (nodeEnd >= nodeStart && nodeStart <= gdo.net.cols * gdo.net.rows && nodeEnd <= gdo.net.cols * gdo.net.rows && nodeStart > 0 && nodeEnd > 0) {
            $(".select_button")
                .removeClass("disabled")
                .removeClass("btn-default")
                .addClass("btn-primary");
        } else {
            $(".select_button")
                .addClass("disabled")
                .addClass("btn-default")
                .removeClass("btn-primary");
        }



        //Close Section
        $(".close_section_button_div")
            .empty()
            .append("<button type='button' class='close_section_button btn btn-default disabled btn-lg btn-block'><i class='fa  fa-times-circle fa-fw'></i>&nbsp;Close Section</button>")
            .css("height", "100%")
            .css("width", (gdo.management.table_width / gdo.management.button_cols) + "%")
            .css('padding', 1)
            .attr("align", "center")
            .unbind()
            .click(function () {
                if (gdo.management.sections.selectedSection > -1) {
                    if (gdo.net.section[gdo.management.sections.selectedSection].appInstanceId == -1) {
                        gdo.net.app["PresentationTool"].server.closeSection(gdo.controlId, gdo.management.sections.selectedSection);
                        gdo.consoleOut('.PresentationTool', 1, 'Requested Disposal of Section ' + gdo.management.sections.selectedSection);
                        gdo.management.sections.selectedSection = -1;
                        gdo.updateDisplayCanvas();
                    }
                }
            });
        if (gdo.management.sections.selectedSection > -1) {
            if (gdo.net.section[gdo.management.sections.selectedSection].appInstanceId == -1
                && gdo.net.section[gdo.management.sections.selectedSection].src === null) {
                $(".close_section_button")
                    .removeClass("disabled")
                    .removeClass("btn-default")
                    .addClass("btn-warning");
            }
        } else {
            $(".close_section_button")
                .addClass("disabled")
                .addClass("btn-default")
                .removeClass("btn-warning");
        }

        //Deploy App
        $(".deploy_app_button_div")
            .empty()
            .append("<button type='button' class='deploy_app_button btn btn-default disabled btn-lg btn-block deploy_app_button'><i class='fa  fa-cloud-upload fa-fw'></i>&nbsp;Deploy App</button>")
            .css("height", "100%")
            .css("width", (gdo.management.table_width / gdo.management.button_cols) + "%")
            .css('padding', 1)
            .attr("align", "center");
        $(".deploy_app_button")
            .unbind()
            .click(function () {
                if (gdo.net.section[gdo.management.sections.selectedSection] != null) {
                    if (gdo.net.section[gdo.management.sections.selectedSection].appInstanceId == -1) {
                        if (gdo.net.section[gdo.management.sections.selectedSection].src === null && gdo.net.app["PresentationTool"].selectedResource !== null) {                           
                            gdo.consoleOut('.PresentationTool', 1, 'Requested Deployment of Resource ' + gdo.net.app["PresentationTool"].selectedResource + " at Section " + gdo.management.sections.selectedSection);
                            var sectionId = gdo.management.sections.selectedSection;
                            gdo.net.app["PresentationTool"].server.deployResource(gdo.controlId, sectionId, gdo.net.app["PresentationTool"].selectedResource, gdo.net.app["PresentationTool"].selectedAppName);
                            gdo.net.app["PresentationTool"].selectedResource = null;
                            gdo.net.app["PresentationTool"].selectedAppName = null;
                      }
                    }
                }
            });
        if (gdo.management.sections.selectedSection > -1) {
            if (gdo.net.app["PresentationTool"].selectedResource !== null && gdo.net.section[gdo.management.sections.selectedSection].appInstanceId == -1
            && gdo.net.app["PresentationTool"].isPlaying === 0) {
                $(".deploy_app_button")
                    .removeClass("disabled")
                    .removeClass("btn-default")
                    .removeClass("btn-danger")
                    .addClass("btn-success");
            } else if (gdo.net.section[gdo.management.sections.selectedSection].appInstanceId == -1) {
                $(".deploy_app_button")
                    .removeClass("btn-default")
                    .removeClass("btn-success")
                    .addClass("btn-danger")
                    .addClass("disabled");
            } else {
                $(".deploy_app_button")
                    .addClass("disabled")
                    .addClass("btn-default")
                    .removeClass("btn-success")
                    .removeClass("btn-danger");
            }
        } else {
            $(".deploy_app_button")
                .addClass("disabled")
                .addClass("btn-default")
                .removeClass("btn-success")
                .removeClass("btn-danger");
        }
     
        $(".close_app_button_div")
            .empty()
            .append("<button type='button' class='close_app_button btn btn-default disabled btn-lg btn-block'><i class='fa  fa-times-circle fa-fw'></i>&nbsp;Close App</button>")
            .css("height", "100%")
            .css("width", (gdo.management.table_width / gdo.management.button_cols) + "%")
            .css('padding', 1)
            .attr("align", "center")
            .unbind()
            .click(function () {
                if (gdo.management.sections.selectedSection > -1) {
                    if (gdo.net.section[gdo.management.sections.selectedSection].src !== null) {
                        gdo.net.app["PresentationTool"].server.unDeployResource(gdo.controlId, gdo.management.sections.selectedSection);
                        gdo.consoleOut('.PresentationTool', 1, 'Requested Disposal of Resource at Section ' + gdo.management.sections.selectedSection);
                        gdo.management.sections.selectedSection = -1;
                    }
                }
            });
        if (gdo.management.sections.selectedSection > -1) {
            if (gdo.net.section[gdo.management.sections.selectedSection].src !== null) {
                $(".close_app_button")
                    .removeClass("disabled")
                    .removeClass("btn-default")
                    .removeClass("btn-danger")
                    .addClass("btn-warning");
            } else {
                $(".close_app_button")
                    .addClass("disabled")
                    .addClass("btn-default")
                    .removeClass("btn-warning");
            }
        } else {
            $(".close_app_button")
                .addClass("disabled")
                .addClass("btn-default")
                .removeClass("btn-warning");
        }
        $(".clear_cave_button_div")
            .empty()
            .append("<button type='button'  class='clear_cave_button btn btn-danger btn-lg btn-block' data-toggle='modal' data-target='#confirm-clear'><i class='fa  fa-exclamation-circle  fa-fw'></i>&nbsp;Clear Cave</button>")
            .css("height", "100%")
            .css("width", (gdo.management.table_width / gdo.management.button_cols) + "%")
            .css('padding', 1)
            .attr("align", "center");
        $(".clear_confirm_button")
            .unbind()
            .click(function () {
                gdo.consoleOut('.NET', 1, 'Clearing States');
                gdo.net.server.clearCave();
                gdo.management.sections.selectedSection = -1;
                gdo.management.apps.selectedApp = null;
                gdo.management.apps.selectedConfiguration = null;
                gdo.management.apps.selectedInstance = -1;
                gdo.updateDisplayCanvas();
            });
    }
})