$(function () {
    /** draw section table quickly instead of using iframe find() **/
    var gdo = parent.gdo;
    gdo.net.app["PresentationTool"].drawSectionTable = function () {
        /// <summary>
        /// Draws the section table.
        /// </summary>
        /// <returns></returns>
        gdo.net.app["PresentationTool"].drawEmptySectionTable(gdo.net.cols, gdo.net.rows);
        for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
            var node = gdo.net.app["PresentationTool"].node[i];
            //if (!node.isValid)
            //continue;
            $("#section_table_row_" + gdo.net.rows).css("height", 0);
            var sectionId = node.sectionId;
            if (sectionId == 0) {
                $("#section_table_row_" + node.row).css("height", "7vh").css('overflow', 'hidden');
                $("#section_table_row_" + node.row + "_col_" + node.col)
                        .empty()
                        .unbind()
                        .css("vertical-align", "top")
                        .append("<div id='section_table_node_" + node.id + "_i' style='text-align:center;background:#444;'> <font size='4px'><b>" + node.id + "</b></font></div>")
                        .append("</br>")
                        .append("<b>&nbsp;Col:</b> " + node.col + " | <b>Row:</b> " + node.row)
                        //.css("height", (gdo.net.app["PresentationTool"].table_height / gdo.net.rows) + "")
                        .css("width", (gdo.net.app["PresentationTool"].table_width / gdo.net.cols) + "%")
                        .css("border", "1px solid #333")
                        .css('overflow', 'hidden')
                        .css("background", "#222")
                        .css({ fontSize: gdo.net.app["PresentationTool"].section_font_size })
                        .css('padding', 0)
                        .css('background-size', "100%")
                        .click(function () {
                            var id = gdo.net.getNodeId($(this).attr('col'), $(this).attr('row'));

                            if (gdo.net.app["PresentationTool"].node[id].isSelected) {
                                gdo.net.app["PresentationTool"].node[id].isSelected = false;

                            } else {
                                gdo.net.app["PresentationTool"].selectedSection = -1;
                                gdo.net.app["PresentationTool"].node[id].isSelected = true;

                            }
                            gdo.updateDisplayCanvas();
                        });
            } else if ((node.sectionCol == 0 && node.sectionRow == 0) && sectionId > 0) {
                $("#section_table_row_" + node.row + "_col_" + node.col)
                    .empty()
                    .unbind()
                    .attr('colspan', gdo.net.app["PresentationTool"].section[sectionId].cols)
                    .attr('rowspan', gdo.net.app["PresentationTool"].section[sectionId].rows)
                    //.css("height", ((gdo.management.table_height / gdo.net.rows) * gdo.net.section[sectionId].rows) + "")
                    .css("width", ((gdo.net.app["PresentationTool"].table_width / gdo.net.cols) * gdo.net.app["PresentationTool"].section[sectionId].cols) + "%")
                    .css("border", "1px solid #2A9FD6")
                    .css("background", "#087DB4")
                    .css('padding', 0)
                    //.css('overflow', 'hidden')
                    .css("vertical-align", "top")
                    .append("<div id='section_table_section_" + sectionId + "_i' style='text-align:center;background:#5A9FD6'> <font size='4px'><b> S" + sectionId + "</b></font></div>");

                if (gdo.net.app["PresentationTool"].section[sectionId].appInstanceId > 0 && gdo.net.app["PresentationTool"].section[sectionId].appName === "Images") {

                    $("#section_table_row_" + node.row + "_col_" + node.col).droppable({
                        drop: function (event, ui) {

                            var droppableId = gdo.net.app["PresentationTool"].node[gdo.net.getNodeId($(this).attr('col'), $(this).attr('row'))].sectionId;
                            var temp = gdo.net.app["PresentationTool"].section[droppableId].src;
                            gdo.net.app["PresentationTool"].section[droppableId].src = ui.draggable.attr('src');
                            var draggableId = gdo.net.app["PresentationTool"].node[gdo.net.getNodeId(ui.draggable.parent().attr('col'), ui.draggable.parent().attr('row'))].sectionId;
                            gdo.net.app["PresentationTool"].section[draggableId].src = temp;

                            if (gdo.net.app["PresentationTool"].isPlaying === 0) {
                                if (draggableId != droppableId) {
                                    gdo.net.app["PresentationTool"].server.swapSrc(gdo.controlId, draggableId, droppableId);
                                }
                            } else {
                                if (draggableId != droppableId) {
                                    //gdo.net.app["PresentationTool"].server.swapSrc(gdo.controlId, draggableId, droppableId);
                                    var sections = [gdo.net.app["PresentationTool"].section[droppableId], gdo.net.app["PresentationTool"].section[draggableId]];
                                    gdo.net.app["PresentationTool"].swapSrc(sections, 0);
                                }
                            }
                            gdo.updateDisplayCanvas();
                        }
                    });
                }

                if (gdo.net.app["PresentationTool"].section[sectionId].appName !== "Images") {
                    $("#section_table_row_" + node.row + "_col_" + node.col).append("<div style='height:5px'></div>");
                    if (gdo.net.app["PresentationTool"].section[sectionId].cols == 1 && gdo.net.app["PresentationTool"].section[sectionId].rows == 1) {
                        $("#section_table_row_" + node.row + "_col_" + node.col).append("&nbsp;<b>N</b>" + gdo.net.getNodeId(gdo.net.app["PresentationTool"].section[sectionId].col, gdo.net.app["PresentationTool"].section[sectionId].row) + "");
                    } else {
                        $("#section_table_row_" + node.row + "_col_" + node.col).append("&nbsp;<b>N</b>" + gdo.net.getNodeId(gdo.net.app["PresentationTool"].section[sectionId].col, gdo.net.app["PresentationTool"].section[sectionId].row + gdo.net.app["PresentationTool"].section[sectionId].rows - 1) + " to <b>N</b>" + gdo.net.getNodeId(gdo.net.app["PresentationTool"].section[sectionId].col + gdo.net.app["PresentationTool"].section[sectionId].cols - 1, gdo.net.app["PresentationTool"].section[sectionId].row) + "");
                    }
                }

                if (gdo.net.app["PresentationTool"].section[sectionId].appInstanceId >= 0) {

                    $("#section_table_section_" + sectionId + "_i")
                        .empty()
                        .append("<font size='4px'><b> S" + sectionId + ", I" + gdo.net.app["PresentationTool"].section[sectionId].appInstanceId + "</b></font>");

                    if (gdo.net.app["PresentationTool"].section[sectionId].appName === "Images") {
                        $("#section_table_row_" + node.row + "_col_" + node.col)
                            .append("<img id = 'section_table_row_" + node.row + "_col_" + node.col + "_img' style='width:100%; height:auto' src='" + gdo.net.app["PresentationTool"].section[sectionId].src + "'/>")
                            //.css('overflow', 'hidden')
                            .css("background", "#559100");
                        var width = $("#section_table_row_" + node.row + "_col_" + node.col + "_img").width();
                        $("#section_table_row_" + node.row + "_col_" + node.col + "_img").height((width / (gdo.net.app["PresentationTool"].section[sectionId].width / gdo.net.app["PresentationTool"].section[sectionId].height))*0.8);
                        // draggable
                        $("#section_table_row_" + node.row + "_col_" + node.col + "_img")
                            .unbind()
                            .draggable({
                                containment: '#section_table',
                                scroll: false,
                                revert: true,
                                stack: "#section_table_row_" + node.row + "_col_" + node.col + "_img"
                            });


                    } else if (gdo.net.app["PresentationTool"].section[sectionId].appName === "Youtube") {
                        $("#section_table_row_" + node.row + "_col_" + node.col)
                            .append("</br>")
                            .append("<div id='section_table_section_" + sectionId + "_a'> <b>&nbsp;App:</b> " + gdo.net.app["PresentationTool"].section[sectionId].appName + "</div>")
                            .append("<div id='section_table_section_" + sectionId + "_a'> <b>&nbsp;Src:</b> " + gdo.net.app["PresentationTool"].section[sectionId].src + "</div>")
                            //.css('overflow', 'hidden')
                            .css("background", "#559100");
                    } else {
                        $("#section_table_row_" + node.row + "_col_" + node.col)
                            .append("</br>")
                            .append("<div id='section_table_section_" + sectionId + "_a'> <b>&nbsp;App:</b> " + gdo.net.app["PresentationTool"].section[sectionId].appName + "</div>")
                            //.css('overflow', 'hidden')
                            .css("background", "#559100");
                    }
                    $("#section_table_section_" + sectionId + "_i").css("background", "#77B300");
                    $("#section_table_row_" + node.row + "_col_" + node.col).css("border", "1px solid #77B300");
                }
                $("#section_table_row_" + node.row + "_col_" + node.col)
                   .css({ fontSize: gdo.net.app["PresentationTool"].section_font_size })
                   .click(function () {
                       var id = gdo.net.app["PresentationTool"].node[gdo.net.getNodeId($(this).attr('col'), $(this).attr('row'))].sectionId;
                       if (gdo.net.app["PresentationTool"].section[id] === gdo.controlId) return;
                       if (gdo.net.app["PresentationTool"].selectedSection == id) {
                           gdo.net.app["PresentationTool"].selectedSection = -1;
                       } else {
                           for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
                               gdo.net.app["PresentationTool"].node[i].isSelected = false;
                           }
                           gdo.net.app["PresentationTool"].selectedSection = id;
                           //gdo.management.selectedInstance = gdo.net.section[gdo.management.selectedSection].appInstanceId;
                       }
                       gdo.updateDisplayCanvas();
                   });

                if (gdo.net.app["PresentationTool"].selectedSection == sectionId) {
                    if (gdo.net.app["PresentationTool"].section[sectionId] === gdo.controlId) return;
                    if (gdo.net.app["PresentationTool"].section[sectionId].appInstanceId >= 0) {
                        $("#section_table_row_" + node.row + "_col_" + node.col).css("background-color", "#77B300").css("border", "1px solid #99D522");
                        $("#section_table_section_" + sectionId + "_i").css("background", "#99D522");
                    } else {
                        $("#section_table_row_" + node.row + "_col_" + node.col).css("background-color", "#2A9FD6").css("border", "1px solid #4CBFF8");
                        $("#section_table_section_" + sectionId + "_i").css("background", "#4CBFF8");
                    }
                }
            } else if ((node.sectionCol != 0 || node.sectionRow != 0) && sectionId > 0) {
                $("#section_table_row_" + node.row + "_col_" + node.col).hide();
            }

            if (node.isSelected) {
                $("#section_table_row_" + node.row + "_col_" + node.col).css("background-color", "#333").css("border", "1px solid #555");
                $("#section_table_node_" + node.id + "_i").css("background-color", "#555");
            }
        }
    }
})