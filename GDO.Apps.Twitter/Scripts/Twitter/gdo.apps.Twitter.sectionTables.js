gdo.net.app["Twitter"].drawEmptySectionTable = function (maxCol, maxRow) {
    $("iframe").contents().find("#section_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("iframe").contents().find("#section_table")
            .append("<tr id='section_table_row_" + i + "' row='" + i + "'></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("iframe").contents().find("#section_table tr:last")
                .append("<td id='section_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'></td>")
                .css('overflow', 'hidden');
        }
    }
}

gdo.net.app["Twitter"].drawEmptySectionControlTable = function (maxCol, maxRow) {
    $("iframe").contents().find("#section_table_control").empty();
    for (var i = 0; i < maxRow; i++) {
        $("iframe").contents().find("#section_table_control")
            .append("<tr id='section_control_table_row_" + i + "' row='" + i + "'/>");
        for (var j = 0; j < maxCol; j++) {
            $("iframe")
                .contents()
                .find("#section_table_control tr:last")
                .append("<td  id='section_control_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'/>")
                .css('overflow', 'hidden');
        }
    }
}

gdo.net.app["Twitter"].drawEmptyAppControlTable = function (maxCol, maxRow) {
    $("iframe").contents().find("#app_control_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("iframe").contents().find("#app_control_table")
            .append("<tr id='app_control_table_row_" + i + "' row='" + i + "'/>");
        for (var j = 0; j < maxCol; j++) {
            $("iframe")
                .contents()
                .find("#app_control_table tr:last")
                .append("<td  id='app_control_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'/>")
                .css('overflow', 'hidden');
        }
    }
}

gdo.net.app["Twitter"].drawSectionTable = function (instanceId) {

    gdo.net.app["Twitter"].drawEmptySectionTable(gdo.net.cols, gdo.net.rows + 1);

    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var node = gdo.net.instance[instanceId].caveStatus.nodes[i];
        if (node.nodeContext === gdo.net.app["Twitter"].NodeContext.RESERVED) {
            //Node is assigned to another app
            continue;
        } else if (node.nodeContext === gdo.net.app["Twitter"].NodeContext.ROOT_SECTION) {
            //Node is part of the root section
            $("iframe").contents().find("#section_table_row_" + node.row)
                .css("height", "7vh")
                .css('overflow', 'hidden');
            $("iframe").contents().find("#section_table_row_" + node.row + "_col_" + node.col)
                .empty()
                .unbind()
                .css("vertical-align", "top")
                .append("<div id='section_table_node_" +
                    node.id +
                    "_i' style='text-align:center;background:#740202;'> <font size='4px'><b>" +
                    node.id +
                    "</b></font></div>")
                .append("</br>")
                .append("<b>&nbsp;Col:</b> " + node.col + " | <b>Row:</b> " + node.row)
                .css("width", (gdo.net.app["Twitter"].uiProperties.table_width / gdo.net.cols) + "%")
                .css("border", "1px solid #8c0606")
                .css('overflow', 'hidden')
                .css("background", "#c70000")
                .css({ fontSize: gdo.net.app["Twitter"].uiProperties.section_font_size })
                .css('padding', 0);
            continue;
        }
        var sectionId = node.sectionId;
        $("iframe").contents().find("#section_table_row_" + gdo.net.rows)
            .css("height", 0);
        if (sectionId === 0) {
            $("iframe").contents().find("#section_table_row_" + node.row)
                .css("height", "7vh")
                .css('overflow', 'hidden');
            $("iframe").contents().find("#section_table_row_" + node.row + "_col_" + node.col)
                .empty()
                .unbind()
                .css("vertical-align", "top")
                .append("<div id='section_table_node_" +
                    node.id +
                    "_i' style='text-align:center;background:#444;'> <font size='4px'><b>" +
                    node.id +
                    "</b></font></div>")
                .append("</br>")
                .append("<b>&nbsp;Col:</b> " + node.col + " | <b>Row:</b> " + node.row)
                .css("width", (gdo.net.app["Twitter"].uiProperties.table_width / gdo.net.cols) + "%")
                .css("border", "1px solid #333")
                .css('overflow', 'hidden')
                .css("background", "#222")
                .css({ fontSize: gdo.net.app["Twitter"].uiProperties.section_font_size })
                .css('padding', 0)
                .click(function () {
                    var id = gdo.net.getNodeId($(this).attr('col'), $(this).attr('row'));
                    if (gdo.net.instance[instanceId].caveStatus.nodes[id].isSelected) {
                        gdo.net.instance[instanceId].caveStatus.nodes[id].isSelected = false;
                    } else {
                        gdo.net.instance[instanceId].control.selectedSection = -1;
                        gdo.net.instance[instanceId].caveStatus.nodes[id].isSelected = true;
                    }
                    gdo.net.app["Twitter"].updateDisplayCanvas(instanceId);
                });

        } else if ((node.sectionCol === 0 && node.sectionRow === 0) && node.sectionId > 0) {
            $("iframe").contents().find("#section_table_row_" + node.row + "_col_" + node.col)
                .empty()
                .unbind()
                .attr('colspan', gdo.net.instance[instanceId].caveStatus.sections[sectionId].cols)
                .attr('rowspan', gdo.net.instance[instanceId].caveStatus.sections[sectionId].rows)
                .css("width",
                    ((gdo.net.app["Twitter"].uiProperties.table_width / gdo.net.cols) *
                        gdo.net.instance[instanceId].caveStatus.sections[sectionId].cols) +
                    "%")
                .css("border", "1px solid #2A9FD6")
                .css("background", "#087DB4")
                .css('padding', 0)
                .css('overflow', 'hidden')
                .css("vertical-align", "top")
                .append("<div id='section_table_section_" +
                    sectionId +
                    "_i' style='text-align:center;background:#2A9FD6'> <font size='4px'><b> S" +
                    sectionId +
                    "</b></font></div>")
                .append("<div style='height:5px'></div>");
            //Prepared
            if (gdo.net.instance[instanceId].caveStatus.sections[sectionId].appInfo.id != null) {
                $("iframe").contents().find("#section_table_row_" + node.row + "_col_" + node.col)
                    .css('overflow', 'hidden')
                    .append("<div id='section_table_section_" +
                        sectionId +
                        "_c'> <b>&nbsp;Vis Type:</b> " +
                        gdo.net.instance[instanceId].caveStatus.sections[sectionId].appInfo.appSubType +
                        "</div>")
                    .css('overflow', 'hidden')
                    .css("background", "#a7a100")
                    .append("<div id='section_table_section_" +
                        sectionId +
                        "_c'> <b>&nbsp;File Path:</b> " +
                        gdo.net.instance[instanceId].caveStatus.sections[sectionId].appInfo.filePath +
                        "</div>")
                    .css('overflow', 'hidden')
                    .css("background", "#a7a100");

                $("iframe").contents().find("#section_table_section_" + sectionId + "_i")
                    .css("background", "#b8b100");
                $("iframe").contents().find("#section_table_row_" + node.row + "_col_" + node.col)
                    .css("border", "1px solid #b8b100");
            }
            //Deployed
            if (gdo.net.instance[instanceId].caveStatus.sections[sectionId].appInstanceId >= 0) {
                $("iframe").contents().find("#section_table_section_" + sectionId + "_i")
                    .empty()
                    .append("<font size='4px'><b> S" +
                        sectionId +
                        ", I" +
                        gdo.net.instance[instanceId].caveStatus.sections[sectionId].appInstanceId +
                        "</b></font>");
                $("iframe").contents().find("#section_table_row_" + node.row + "_col_" + node.col)
                    .css('overflow', 'hidden')
                    .append("<div id='section_table_section_" +
                        sectionId +
                        "_a'> <b>&nbsp;App:</b> " +
                        gdo.net.instance[gdo.net.instance[instanceId].caveStatus.sections[sectionId].appInstanceId]
                        .appName +
                        "</div>")
                    .css('overflow', 'hidden')
                    .css("background", "#559100");
                $("iframe").contents().find("#section_table_section_" + sectionId + "_i")
                    .css("background", "#77B300");
                $("iframe").contents().find("#section_table_row_" + node.row + "_col_" + node.col)
                    .css("border", "1px solid #77B300");
            }
            $("iframe").contents().find("#section_table_row_" + node.row + "_col_" + node.col)
                .click(function () {
                    var id = gdo.net.instance[instanceId].caveStatus.nodes[gdo.net
                        .getNodeId($(this).attr('col'), $(this).attr('row'))].sectionId;
                    if (gdo.net.instance[instanceId].control.selectedSection === id) {
                        gdo.net.instance[instanceId].control.selectedSection = -1;
                    } else {
                        for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
                            gdo.net.instance[instanceId].caveStatus.nodes[i].isSelected = false;
                        }
                        gdo.net.instance[instanceId].control.selectedSection = id;
                    }
                    gdo.net.app["Twitter"].updateDisplayCanvas(instanceId);
                });
            if (gdo.net.instance[instanceId].control.selectedSection === sectionId) {
                if (gdo.net.instance[instanceId].caveStatus.sections[sectionId].appInstanceId >= 0) {
                    $("iframe").contents().find("#section_table_row_" + node.row + "_col_" + node.col)
                        .css("background-color", "#77B300")
                        .css("border", "1px solid #99D522");
                    $("iframe").contents().find("#section_table_section_" + sectionId + "_i").css("background", "#99D522");
                } else if (gdo.net.instance[instanceId].caveStatus.sections[sectionId].appInstanceId < 0 &&
                    gdo.net.instance[instanceId].caveStatus.sections[sectionId].appInfo.id != null) {
                    $("iframe").contents().find("#section_table_row_" + node.row + "_col_" + node.col)
                        .css("background-color", "#b8b100")
                        .css("border", "1px solid #d2ca02");
                    $("iframe").contents().find("#section_table_section_" + sectionId + "_i")
                        .css("background", "#d2ca02");
                } else {
                    $("iframe").contents().find("#section_table_row_" + node.row + "_col_" + node.col)
                        .css("background-color", "#2A9FD6")
                        .css("border", "1px solid #4CBFF8");
                    $("iframe").contents().find("#section_table_section_" + sectionId + "_i")
                        .css("background", "#4CBFF8");
                }
            }

        } else if ((node.sectionCol !== 0 || node.sectionRow !== 0) && node.sectionId > 0) {
            $("iframe").contents().find("#section_table_row_" + node.row + "_col_" + node.col).hide();
        }
        if (node.isSelected) {
            $("iframe").contents().find("#section_table_row_" + node.row + "_col_" + node.col)
                .css("background-color", "#333")
                .css("border", "1px solid #555");
            $("iframe").contents().find("#section_table_node_" + node.id + "_i")
                .css("background-color", "#555");
        }
    }
}

gdo.net.app["Twitter"].drawSectionControlTable = function (instanceId) {
    gdo.net.app["Twitter"].drawEmptySectionControlTable(gdo.net.cols, gdo.net.rows);
    $("iframe").contents().find("#graph_control_description")
        .html(gdo.net.instance[instanceId].control.selectedGraphApps.join(", "));

    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var node = gdo.net.instance[instanceId].caveStatus.nodes[i];
        if (node.nodeContext === gdo.net.app["Twitter"].NodeContext.RESERVED) {
            //Node is assigned to another app
            continue;
        } else if (node.nodeContext === gdo.net.app["Twitter"].NodeContext.ROOT_SECTION) {
            //Node is part of the root section
            $("iframe").contents().find("#section_control_table_row_" + node.row)
                .css("height", "7vh")
                .css('overflow', 'hidden');
            $("iframe").contents().find("#section_control_table_row_" + node.row + "_col_" + node.col)
                .empty()
                .unbind()
                .css("vertical-align", "top")
                .append("<div id='section_control_table_node_" +
                    node.id +
                    "_i' style='text-align:center;background:#740202;'> <font size='4px'><b>" +
                    node.id +
                    "</b></font></div>")
                .append("</br>")
                .css("border", "1px solid #8c0606")
                .css('overflow', 'hidden')
                .css("background", "#c70000")
                .css('padding', 0);
            continue;
        }
        var sectionId = node.sectionId;
        $("iframe").contents().find("#section_control_table_row_" + gdo.net.rows)
            .css("height", 0);
        if (sectionId === 0) {
            $("iframe").contents().find("#section_control_table_row_" + node.row).css("height", "7vh")
                .css('overflow', 'hidden');
            $("iframe").contents().find("#section_control_table_row_" + node.row + "_col_" + node.col)
                .empty()
                .unbind()
                .css("vertical-align", "top")
                .append("<div id='section_control_table_node_" +
                    node.id +
                    "_i' style='text-align:center;background:#444;'> <font size='4px'><b>" +
                    node.id +
                    "</b></font></div>")
                .append("</br>")
                .css("border", "1px solid #333")
                .css("background", "#222")
                .css('padding', 0)
                .click(function () {
                });

        } else if ((node.sectionCol === 0 && node.sectionRow === 0) && node.sectionId > 0) {
            $("iframe").contents().find("#section_control_table_row_" + node.row + "_col_" + node.col)
                .empty()
                .unbind()
                .attr('colspan', gdo.net.instance[instanceId].caveStatus.sections[sectionId].cols)
                .attr('rowspan', gdo.net.instance[instanceId].caveStatus.sections[sectionId].rows)
                .css("border", "1px solid #2A9FD6")
                .css("background", "#087DB4")
                .css('padding', 0)
                .css('overflow', 'hidden')
                .css("vertical-align", "top")
                .append("<div id='section_control_table_section_" +
                    sectionId +
                    "_i' style='text-align:center;background:#2A9FD6'> <font size='4px'><b> S" +
                    sectionId +
                    "</b></font></div>");
            //Deployed
            if (gdo.net.instance[instanceId].caveStatus.sections[sectionId].appInstanceId >= 0) {
                $("iframe").contents().find("#section_control_table_section_" + sectionId + "_i")
                    .empty()
                    .append("<font size='4px'><b> I" +
                        gdo.net.instance[instanceId].caveStatus.sections[sectionId].appInstanceId +
                        "</b></font>");
                if (gdo.net.instance[instanceId].caveStatus.sections[sectionId].appInfo.appType === "Graph") {
                    $("iframe").contents().find("#section_control_table_row_" + node.row + "_col_" + node.col)
                        .css('overflow', 'hidden')
                        .append("<div id='section_control_table_section_" +
                            sectionId +
                            "_a'> <b>&nbsp;App:</b> " +
                            gdo.net.instance[gdo.net.instance[instanceId].caveStatus.sections[sectionId]
                                .appInstanceId]
                            .appName +
                            "</div>")
                        .css('overflow', 'hidden')
                        .css("background", "#559100");
                    $("iframe").contents().find("#section_control_table_section_" + sectionId + "_i")
                        .css("background", "#77B300");
                    $("iframe").contents().find("#section_control_table_row_" + node.row + "_col_" + node.col)
                        .css("border", "1px solid #77B300");
                } else {
                    $("iframe").contents().find("#section_control_table_row_" + node.row + "_col_" + node.col)
                        .css('overflow', 'hidden')
                        .append("<div id='section_control_table_section_" +
                            sectionId +
                            "_a'> <b>&nbsp;App:</b> " +
                            gdo.net.instance[gdo.net.instance[instanceId].caveStatus.sections[sectionId]
                                .appInstanceId]
                            .appName +
                            "</div>")
                        .css('overflow', 'hidden')
                        .css("background", "#f98111");
                    $("iframe").contents().find("#section_control_table_section_" + sectionId + "_i")
                        .css("background", "#d56c0a");
                    $("iframe").contents().find("#section_control_table_row_" + node.row + "_col_" + node.col)
                        .css("border", "1px solid #d56c0a");
                }

            }
            if (gdo.net.instance[instanceId].caveStatus.sections[sectionId].appInfo.appType === "Graph") {
                $("iframe").contents().find("#section_control_table_row_" + node.row + "_col_" + node.col)
                    .click(function () {
                        var appInstanceId = gdo.net.instance[instanceId].caveStatus.nodes[gdo.net
                            .getNodeId($(this).attr('col'), $(this).attr('row'))].appInstanceId;

                        var index = gdo.net.instance[instanceId].control.selectedGraphApps.indexOf(appInstanceId);
                        if (index > -1) {
                            gdo.net.instance[instanceId].control.selectedGraphApps.splice(index, 1);
                            gdo.net.app["Twitter"].updateGraphFields(instanceId);
                        } else {
                            if (gdo.net.instance[appInstanceId].graphFieldsLoaded) {
                                gdo.net.instance[instanceId].control.selectedGraphApps.push(appInstanceId);
                                gdo.net.app["Twitter"].updateGraphFields(instanceId);
                            } else {
                                gdo.net.app["Graph"].server.getFields(appInstanceId);
                                gdo.net.app["Twitter"]
                                    .setMessage("Trying to control:" +
                                        appInstanceId +
                                        " before fields have been processed, please wait");
                            }
                        }
                        gdo.net.app["Twitter"].drawSectionControlTable(instanceId);

                    });
            }

            if (gdo.net.instance[instanceId].control.selectedGraphApps
                .indexOf(gdo.net.instance[instanceId].caveStatus.sections[sectionId].appInstanceId) >
                -1) {
                $("iframe").contents().find("#section_control_table_row_" + node.row + "_col_" + node.col)
                    .css("background-color", "#95078a")
                    .css("border", "1px solid #ce0ad6");
                $("iframe").contents().find("#section_control_table_section_" + sectionId + "_i").css("background", "#ce0ad6");
            }
        } else if ((node.sectionCol !== 0 || node.sectionRow !== 0) && node.sectionId > 0) {
            $("iframe").contents().find("#section_control_table_row_" + node.row + "_col_" + node.col).hide();
        }
    }
}

gdo.net.app["Twitter"].drawAppControlTable = function (instanceId) {
    console.log("Drawing App Control Table");
    gdo.net.app["Twitter"].drawEmptyAppControlTable(gdo.net.cols, gdo.net.rows);
    $("iframe").contents().find("#app_control_description").html(gdo.net.instance[instanceId].control.selectedApp);
    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var node = gdo.net.instance[instanceId].caveStatus.nodes[i];
        if (node.nodeContext === gdo.net.app["Twitter"].NodeContext.RESERVED) {
            //Node is assigned to another app
            continue;
        } else if (node.nodeContext === gdo.net.app["Twitter"].NodeContext.ROOT_SECTION) {
            //Node is part of the root section
            $("iframe").contents().find("#app_control_table_row_" + node.row)
                .css("height", "7vh")
                .css('overflow', 'hidden');
            $("iframe").contents().find("#app_control_table_row_" + node.row + "_col_" + node.col)
                .empty()
                .unbind()
                .css("vertical-align", "top")
                .append("<div id='app_control_table_node_" +
                    node.id +
                    "_i' style='text-align:center;background:#740202;'> <font size='4px'><b>" +
                    node.id +
                    "</b></font></div>")
                .append("</br>")
                .css("border", "1px solid #8c0606")
                .css('overflow', 'hidden')
                .css("background", "#c70000")
                .css('padding', 0);
            continue;
        }
        var sectionId = node.sectionId;
        $("iframe").contents().find("#app_control_table_row_" + gdo.net.rows).css("height", 0);
        if (sectionId === 0) {
            $("iframe").contents().find("#app_control_table_row_" + node.row).css("height", "7vh")
                .css('overflow', 'hidden');
            $("iframe").contents().find("#app_control_table_row_" + node.row + "_col_" + node.col)
                .empty()
                .unbind()
                .css("vertical-align", "top")
                .append("<div id='app_control_table_node_" +
                    node.id +
                    "_i' style='text-align:center;background:#444;'> <font size='4px'><b>" +
                    node.id +
                    "</b></font></div>")
                .append("</br>")
                .css("border", "1px solid #333")
                .css("background", "#222")
                .css('padding', 0)
                .click(function () {
                });

        } else if ((node.sectionCol === 0 && node.sectionRow === 0) && node.sectionId > 0) {
            $("iframe").contents().find("#app_control_table_row_" + node.row + "_col_" + node.col)
                .empty()
                .unbind()
                .attr('colspan', gdo.net.instance[instanceId].caveStatus.sections[sectionId].cols)
                .attr('rowspan', gdo.net.instance[instanceId].caveStatus.sections[sectionId].rows)
                .css("border", "1px solid #2A9FD6")
                .css("background", "#087DB4")
                .css('padding', 0)
                .css('overflow', 'hidden')
                .css("vertical-align", "top")
                .append("<div id='app_control_table_section_" +
                    sectionId +
                    "_i' style='text-align:center;background:#2A9FD6'> <font size='4px'><b> S" +
                    sectionId +
                    "</b></font></div>");
            //Deployed
            if (gdo.net.instance[instanceId].caveStatus.sections[sectionId].appInstanceId >= 0) {
                $("iframe").contents().find("#app_control_table_section_" + sectionId + "_i")
                    .empty()
                    .append("<font size='4px'><b> I" +
                        gdo.net.instance[instanceId].caveStatus.sections[sectionId].appInstanceId +
                        "</b></font>");
                $("iframe").contents().find("#app_control_table_row_" + node.row + "_col_" + node.col)
                    .css('overflow', 'hidden')
                    .append("<div id='app_control_table_section_" +
                        sectionId +
                        "_a'> <b>&nbsp;App:</b> " +
                        gdo.net.instance[gdo.net.instance[instanceId].caveStatus.sections[sectionId]
                            .appInstanceId]
                        .appName +
                        "</div>")
                    .css('overflow', 'hidden')
                    .css("background", "#559100");
                $("iframe").contents().find("#app_control_table_section_" + sectionId + "_i")
                    .css("background", "#77B300");
                $("iframe").contents().find("#app_control_table_row_" + node.row + "_col_" + node.col)
                    .css("border", "1px solid #77B300");
            }
            $("iframe").contents().find("#app_control_table_row_" + node.row + "_col_" + node.col)
                .click(function () {
                    var appInstanceId = gdo.net.instance[instanceId].caveStatus.nodes[gdo.net
                        .getNodeId($(this).attr('col'), $(this).attr('row'))].appInstanceId;
                    if (gdo.net.instance[instanceId].control.selectedApp == appInstanceId) {
                        gdo.net.instance[instanceId].control.selectedApp = null;
                        $("iframe").contents().find("#app_control_frame").attr("src", "");

                    } else {
                        gdo.net.instance[instanceId].control.selectedApp = appInstanceId;
                        $("iframe").contents().find("#app_control_frame")
                            .attr("src", window.location.origin + "/Web/Instances.cshtml?id=" + appInstanceId);
                    }
                    $("iframe").contents().find('#app_control_management').modal("hide");
                    gdo.net.app["Twitter"].drawAppControlTable(instanceId);

                });

            if (gdo.net.instance[instanceId].control.selectedApp ==
                gdo.net.instance[instanceId].caveStatus.sections[sectionId].appInstanceId) {
                $("iframe").contents().find("#app_control_table_row_" + node.row + "_col_" + node.col)
                    .css("background-color", "#95078a")
                    .css("border", "1px solid #ce0ad6");
                $("iframe").contents().find("#app_control_table_section_" + sectionId + "_i").css("background", "#ce0ad6");
            }
        } else if ((node.sectionCol !== 0 || node.sectionRow !== 0) && node.sectionId > 0) {
            $("iframe").contents().find("#app_control_table_row_" + node.row + "_col_" + node.col).hide();
        }
    }
}

