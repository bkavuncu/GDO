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
                .append("<td  id='section_control_table_row_" +
                    i +
                    "_col_" +
                    j +
                    "' col='" +
                    j +
                    "' row='" +
                    i +
                    "'/>");
//                .css('overflow', 'hidden');
        }
    }
}


gdo.net.app["Twitter"].drawButtonTable = function (instanceId) {

    //Create Section
    gdo.net.app["Twitter"].drawCreateSectionB(instanceId);
    //Enter Section Coordinates
    gdo.net.app["Twitter"].drawCoordinateB(instanceId);
    //Close Section
    gdo.net.app["Twitter"].drawCloseSectionB(instanceId);
    //Load Vis
    gdo.net.app["Twitter"].drawLoadVisB(instanceId);
    //Unload Vis
    gdo.net.app["Twitter"].drawUnLoadVisB(instanceId);
    //Deploy App
    gdo.net.app["Twitter"].drawDeployAppB(instanceId);
    //Close App
    gdo.net.app["Twitter"].drawCloseAppB(instanceId);
    //Clear Cave
    gdo.net.app["Twitter"].drawClearCaveB(instanceId);
    //Deploy All Apps
    gdo.net.app["Twitter"].drawDeployAll(instanceId);
}


gdo.net.app["Twitter"].drawUnLoadVisB = function (instanceId) {
    $("iframe")
        .contents()
        .find(".un_load_vis_button_div")
        .empty()
        .append("<button id='un-load-vis-button' type='button' class='un-load-vis-button btn btn-default disabled btn-lg btn-block'><i class='fa fa-hand-o-down fa-fw'></i>&nbsp;UnLoad Vis</button>")
        .css("height", "100%")
        .css("width", (gdo.net.app["Twitter"].uiProperties.table_width / gdo.net.app["Twitter"].uiProperties.button_cols) + "%")
        .css('padding', 1)
        .attr("align", "center");
    $("iframe")
        .contents()
        .find(".un-load-vis-button")
        .unbind()
        .click(function () {
            if (gdo.net.instance[instanceId].caveStatus.sections[gdo.net.instance[instanceId].control.selectedSection] != null &&
                gdo.net.instance[instanceId].caveStatus.sections[gdo.net.instance[instanceId].control.selectedSection].twitterVis.id !== null) {
                gdo.net.app["Twitter"].requestUnLoadVisualisation(instanceId, gdo.net.instance[instanceId].control.selectedSection);
            }
        });
    if (gdo.net.instance[gdo.controlId].control.selectedSection > -1) {
        if (gdo.net.instance[instanceId].caveStatus.sections[gdo.net.instance[instanceId].control.selectedSection].twitterVis.id !== null &&
            gdo.net.instance[instanceId].caveStatus.sections[gdo.net.instance[instanceId].control.selectedSection].appInstanceId < 0) {
            $("iframe")
                .contents()
                .find(".un-load-vis-button")
                .removeClass("disabled")
                .removeClass("btn-default")
                .removeClass("btn-danger")
                .addClass("btn-success");
        } else {
            $("iframe")
                .contents()
                .find(".un-load-vis-button")
                .addClass("disabled")
                .addClass("btn-default")
                .removeClass("btn-success")
                .removeClass("btn-danger");
        }
    } else {
        $("iframe")
            .contents()
            .find(".un-load-vis-button")
            .addClass("disabled")
            .addClass("btn-default")
            .removeClass("btn-success")
            .removeClass("btn-danger");
    }
}

gdo.net.app["Twitter"].drawLoadVisB = function (instanceId) {
    $("iframe")
        .contents()
        .find(".load_vis_button_div")
        .empty()
        .append("<button id='load-vis-button' type='button' class='load-vis-button btn btn-default disabled btn-lg btn-block'><i class='fa fa-hand-o-down fa-fw'></i>&nbsp;Load Vis</button>")
        .css("height", "100%")
        .css("width", (gdo.net.app["Twitter"].uiProperties.table_width / gdo.net.app["Twitter"].uiProperties.button_cols) + "%")
        .css('padding', 1)
        .attr("align", "center");
    $("iframe")
        .contents()
        .find(".load-vis-button")
        .unbind()
        .click(function () {
            if (gdo.net.instance[instanceId].caveStatus.sections[gdo.net.instance[instanceId].control.selectedSection] != null &&
                gdo.net.instance[instanceId].caveStatus.sections[gdo.net.instance[instanceId].control.selectedSection].twitterVis.id === null &&
                gdo.net.instance[instanceId].caveStatus.sections[gdo.net.instance[instanceId].control.selectedSection].appInstanceId < 0 &&
                gdo.net.instance[instanceId].control.selectedAnalytics !== null
                ) {

                gdo.net.app["Twitter"].requestLoadVisualisation(instanceId, gdo.net.instance[instanceId].control.selectedSection,
                    gdo.net.instance[instanceId].control.selectedAnalytics);
            }
        });
    if (gdo.net.instance[gdo.controlId].control.selectedSection > -1) {
        if (gdo.net.instance[instanceId].caveStatus.sections[gdo.net.instance[instanceId].control.selectedSection].twitterVis.id === null &&
            gdo.net.instance[instanceId].caveStatus.sections[gdo.net.instance[instanceId].control.selectedSection].appInstanceId < 0 &&
            gdo.net.instance[instanceId].control.selectedAnalytics !== null) {
            $("iframe")
                .contents()
                .find(".load-vis-button")
                .removeClass("disabled")
                .removeClass("btn-default")
                .removeClass("btn-danger")
                .addClass("btn-success");
        } else {
            $("iframe")
                .contents()
                .find(".load-vis-button")
                .addClass("disabled")
                .addClass("btn-default")
                .removeClass("btn-success")
                .removeClass("btn-danger");
        }
    } else {
        $("iframe")
            .contents()
            .find(".load-vis-button")
            .addClass("disabled")
            .addClass("btn-default")
            .removeClass("btn-success")
            .removeClass("btn-danger");
    }
}

gdo.net.app["Twitter"].drawDeployAppB = function (instanceId) {

    $("iframe")
        .contents()
        .find(".deploy_app_button_div")
        .empty()
        .append("<button type='button' class='deploy_app_button btn btn-default disabled btn-lg btn-block'><i class='fa  fa-cloud-upload fa-fw'></i>&nbsp;Deploy App</button>")
        .css("height", "100%")
        .css("width", (gdo.net.app["Twitter"].uiProperties.table_width / gdo.net.app["Twitter"].uiProperties.button_cols) + "%")
        .css('padding', 1)
        .attr("align", "center");
    $("iframe")
        .contents()
        .find(".deploy_app_button")
        .unbind()
        .click(function () {
            if (gdo.net.instance[instanceId].control.selectedSection > -1 &&
                gdo.net.instance[instanceId].caveStatus.sections[gdo.net.instance[instanceId].control.selectedSection].appInstanceId === -1 &&
                gdo.net.instance[instanceId].caveStatus.sections[gdo.net.instance[instanceId].control.selectedSection].twitterVis.id !== null) {
                gdo.net.app["Twitter"].requestDeployApp(instanceId, gdo.net.instance[instanceId].control.selectedSection);
            }
        });
    if (gdo.net.instance[instanceId].control.selectedSection > -1 &&
        gdo.net.instance[instanceId].caveStatus.sections[gdo.net.instance[instanceId].control.selectedSection].appInstanceId === -1 &&
        gdo.net.instance[instanceId].caveStatus.sections[gdo.net.instance[instanceId].control.selectedSection].twitterVis.id !== null) {
        $("iframe")
            .contents()
            .find(".deploy_app_button")
            .removeClass("disabled")
            .removeClass("btn-default")
            .removeClass("btn-danger")
            .addClass("btn-success");
    } else {
        $("iframe")
            .contents()
            .find(".deploy_app_button")
            .addClass("disabled")
            .addClass("btn-default")
            .removeClass("btn-success")
            .removeClass("btn-danger");
    }
}

gdo.net.app["Twitter"].drawCloseAppB = function (instanceId) {

    $("iframe")
        .contents()
        .find(".close_app_button_div")
        .empty()
        .append("<button type='button' class='close_app_button btn btn-default disabled btn-lg btn-block'><i class='fa  fa-times-circle fa-fw'></i>&nbsp;Close App</button>")
        .css("height", "100%")
        .css("width", (gdo.net.app["Twitter"].uiProperties.table_width / gdo.net.app["Twitter"].uiProperties.button_cols) + "%")
        .css('padding', 1)
        .attr("align", "center")
        .unbind()
        .click(function () {
            if (gdo.net.instance[instanceId].control.selectedSection > -1 &&
                gdo.net.instance[instanceId].caveStatus.sections[gdo.net.instance[instanceId].control.selectedSection].appInstanceId > -1) {
                gdo.net.app["Twitter"].requestCloseApp(instanceId, gdo.net.instance[instanceId].control.selectedSection);
            }
        });
    if (gdo.net.instance[instanceId].control.selectedSection > -1) {
        if (gdo.net.instance[instanceId].caveStatus.sections[gdo.net.instance[instanceId].control.selectedSection].appInstanceId > -1) {
            $("iframe")
                .contents()
                .find(".close_app_button")
                .removeClass("disabled")
                .removeClass("btn-default")
                .removeClass("btn-danger")
                .addClass("btn-warning");
        } else {
            $("iframe")
                .contents()
                .find(".close_app_button")
                .addClass("disabled")
                .addClass("btn-default")
                .removeClass("btn-warning");
        }
    } else {
        $("iframe")
            .contents()
            .find(".close_app_button")
            .addClass("disabled")
            .addClass("btn-default")
            .removeClass("btn-warning");
    }
}

gdo.net.app["Twitter"].atLeastOneVis = function (instanceId) {

    for (var sId in gdo.net.instance[instanceId].caveStatus.sections) {
//        console.log("checking" + sId);
        if (gdo.net.instance[instanceId].caveStatus.sections.hasOwnProperty(sId) &&
            gdo.net.instance[instanceId].caveStatus.sections[sId].twitterVis.id !== null &&
            gdo.net.instance[instanceId].caveStatus.sections[sId].appInstanceId < 0) {
//            console.log("found" + sId);
                return true;
            }
    }
    return false;

}

gdo.net.app["Twitter"].drawDeployAll = function (instanceId) {

    var oneFound = gdo.net.app["Twitter"].atLeastOneVis(instanceId);
//    console.log(oneFound);
    $("iframe")
      .contents()
      .find(".deploy_all_app_button_div")
      .empty()
      .append("<button type='button' class='deploy_all_app_button btn btn-default disabled btn-lg btn-block'><i class='fa  fa-cloud-upload fa-fw'></i>&nbsp;Deploy All</button>")
      .css("height", "100%")
      .css("width", (gdo.net.app["Twitter"].uiProperties.table_width / gdo.net.app["Twitter"].uiProperties.button_cols) + "%")
      .css('padding', 1)
      .attr("align", "center");
    $("iframe")
        .contents()
        .find(".deploy_all_app_button")
        .unbind()
        .click(function () {
            if (oneFound) {
                gdo.net.app["Twitter"].requestDeployAllApps(instanceId);
            }
        });
    if (oneFound) {
        $("iframe")
            .contents()
            .find(".deploy_all_app_button")
            .removeClass("disabled")
            .removeClass("btn-default")
            .removeClass("btn-danger")
            .addClass("btn-success");
    } else {
        $("iframe")
            .contents()
            .find(".deploy_all_app_button")
            .addClass("disabled")
            .addClass("btn-default")
            .removeClass("btn-success")
            .removeClass("btn-danger");
    }

}

gdo.net.app["Twitter"].drawClearCaveB = function (instanceId) {

    $("iframe")
        .contents()
        .find(".clear_cave_button_div")
        .empty()
        .append("<button type='button'  class='clear_cave_button btn btn-danger btn-lg btn-block' data-toggle='modal' data-target='#confirm-clear'><i class='fa  fa-exclamation-circle  fa-fw'></i>&nbsp;Clear Cave</button>")
        .css("height", "100%")
        .css("width", (gdo.net.app["Twitter"].uiProperties.table_width / gdo.net.app["Twitter"].uiProperties.button_cols) + "%")
        .css('padding', 1)
        .attr("align", "center");
    $("iframe")
        .contents()
        .find(".clear_confirm_button")
        .unbind()
        .click(function () {
            gdo.net.app["Twitter"].requestClearCave(instanceId);
        });
}

gdo.net.app["Twitter"].drawCreateSectionB = function (instanceId) {

    //Create Section
    $("iframe").contents().find(".create_section_button_div").empty()
        .append("<button type='button' id='create_section_button' class='btn btn-default disabled btn-lg btn-block'>" +
                "<i class='fa  fa-plus-circle fa-fw'></i>&nbsp;Create Section</button>")
        .css("height", "100%")
        .css("width", (gdo.net.app["Twitter"].uiProperties.table_width / gdo.net.app["Twitter"].uiProperties.button_cols) + "%")
        .css('padding', 1)
        .attr("align", "center");

    gdo.net.app["Twitter"].selectNodes(instanceId);

    $("iframe").contents().find(".create_section_button_div").unbind();
    $("iframe").contents().find(".create_section_button_div")
        .click(function () {
            if (gdo.net.instance[instanceId].control.isRectangle && gdo.net.instance[instanceId].control.isStarted) {
                gdo.net.app["Twitter"].requestCreateSection(instanceId,
                    gdo.net.instance[instanceId].control.colStart,
                    gdo.net.instance[instanceId].control.rowStart,
                    gdo.net.instance[instanceId].control.colEnd,
                    gdo.net.instance[instanceId].control.rowEnd);
                for (var i = gdo.net.instance[instanceId].control.colStart; i <= gdo.net.instance[instanceId].control.colEnd; i++) {
                    for (var j = gdo.net.instance[instanceId].control.rowStart; j <= gdo.net.instance[instanceId].control.rowEnd; j++) {
                        var node = gdo.net.instance[instanceId].caveStatus.nodes[gdo.net.getNodeId(i, j)];
                        node.isSelected = false;
                    }
                }
            }
        });
    if (gdo.net.instance[instanceId].control.isStarted) {
        if (gdo.net.instance[instanceId].control.isRectangle) {
            $("iframe")
                .contents()
                .find("#create_section_button")
                .removeClass("disabled")
                .removeClass("btn-default")
                .addClass("btn-success");
        } else {
            $("iframe")
                .contents()
                .find("#create_section_button")
                .removeClass("btn-default")
                .addClass("btn-danger");
        }
    } else {
        $("iframe")
            .contents()
            .find("#create_section_button")
            .addClass("disabled")
            .addClass("btn-default")
            .removeClass("btn-danger")
            .removeClass("btn-success");
    }
}

gdo.net.app["Twitter"].drawCoordinateB = function (instanceId) {
    $("iframe")
      .contents()
      .find(".select_section_div")
      .empty()
      .append("<div id='button_Enter_coordinates'> " +
          "<table id='section_coordinate_table' style='width: 99%;' >" +
          "<tr>" +
          "<td id='section_coordinate_table_start'' style='width:49%'><input type='text' id='section_coordinate_table_start_input' pattern='[1-9]{10}' style='background:#222; width: 100%;height: 100%;' maxlength='2'/></input></td>" +
          "<td id='section_coordinate_table_end' style='width:49%'><input type='text' id='section_coordinate_table_end_input' pattern='[1-9]{10}' style='background:#222; width: 100%;height: 100%;' maxlength='2' /></input></td>" +
          "<td id='section_coordinate_table_select' style='width:35%;'></td>" +
          "</tr>" +
          "</table>")
      .css("width", 1.5 * (gdo.net.app["Twitter"].uiProperties.table_width / gdo.net.app["Twitter"].uiProperties.button_cols) + "%")
      .css("color", "#FFF")
      .css('padding', 0)
      .attr("align", "center")
      .css({ fontSize: gdo.net.app["Twitter"].uiProperties.button_font_size });

    $("iframe")
        .contents()
        .find("#section_coordinate_table_start_input")
        .css("height", "100%")
        .css("width", "98%")
        .css("border", "0 solid #333")
        .css("background", "#333")
        .css("color", "#FFF")
        .css('padding', 0)
        .css('margin-top', 1)
        .css('padding-bottom', 1)
        .css('text-align', 'center')
        .attr("align", "center")
        .attr("onfocus", "this.value=''")
        .attr("value", gdo.net.getNodeId(gdo.net.instance[instanceId].control.colStart, gdo.net.instance[instanceId].control.rowEnd))
        .css({ fontSize: gdo.net.app["Twitter"].uiProperties.button_font_size * 1.4 });

    $("iframe")
        .contents()
        .find("#section_coordinate_table_end_input")
        .css("height", "100%")
        .css("width", "98%")
        .css("border", "0 solid #333")
        .css("background", "#333")
        .css("color", "#FFF")
        .css('padding', 0)
        .css('margin-top', 1)
        .css('padding-bottom', 1)
        .css('text-align', 'center')
        .attr("align", "center")
        .attr("onfocus", "this.value=''")
        .attr("value", gdo.net.getNodeId(gdo.net.instance[instanceId].control.colEnd, gdo.net.instance[instanceId].control.rowStart))
        .css({ fontSize: gdo.net.app["Twitter"].uiProperties.button_font_size * 1.4 });

    $("iframe")
        .contents()
        .find("#section_coordinate_table_select")
        .empty()
        .append("<button type='button' class='select_button btn btn-default disabled btn-lg btn-block'><i class='fa  fa-expand fa-fw'></i>&nbsp;Select</button>")
        .css("height", "100%")
        .css("width", "100%")
        .css("color", "#FFF")
        .css('padding-top', 1)
        .attr("align", "center");
    $("iframe").contents().find(".select_button").unbind();
    $("iframe")
        .contents()
        .find(".select_button")
        .click(function () {
            var nodeStart = parseInt($("iframe").contents().find('#section_coordinate_table_start_input').val());
            var nodeEnd = parseInt($("iframe").contents().find('#section_coordinate_table_end_input').val());
            if (nodeEnd >= nodeStart &&
                nodeStart <= gdo.net.cols * gdo.net.rows &&
                nodeEnd <= gdo.net.cols * gdo.net.rows &&
                nodeStart > 0 &&
                nodeEnd > 0) {
                var i;
                for (i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
                    gdo.net.instance[instanceId].caveStatus.nodes[i].isSelected = false;
                }
                gdo.net.instance[instanceId].control.selectedSection = -1;
                for (i = gdo.net.instance[instanceId].caveStatus.nodes[nodeStart].col;
                    i <= gdo.net.instance[instanceId].caveStatus.nodes[nodeEnd].col;
                    i++) {
                    for (var j = gdo.net.instance[instanceId].caveStatus.nodes[nodeEnd].row;
                        j <= gdo.net.instance[instanceId].caveStatus.nodes[nodeStart].row; j++) {
                        gdo.net.instance[instanceId].caveStatus.nodes[gdo.net.getNodeId(i, j)].isSelected = true;
                    }
                }
                gdo.net.app["Twitter"].selectNodes(instanceId);
                gdo.net.app["Twitter"].updateDisplayCanvas(instanceId);
            }
        });
    var nodeStart = parseInt($("iframe").contents().find('#section_coordinate_table_start_input').val());
    var nodeEnd = parseInt($("iframe").contents().find('#section_coordinate_table_end_input').val());
    if (nodeEnd >= nodeStart &&
        nodeStart <= gdo.net.cols * gdo.net.rows &&
        nodeEnd <= gdo.net.cols * gdo.net.rows &&
        nodeStart > 0 &&
        nodeEnd > 0) {
        $("iframe")
            .contents()
            .find(".select_button")
            .removeClass("disabled")
            .removeClass("btn-default")
            .addClass("btn-primary");
    } else {
        $("iframe")
            .contents()
            .find(".select_button")
            .addClass("disabled")
            .addClass("btn-default")
            .removeClass("btn-primary");
    }
}

gdo.net.app["Twitter"].drawCloseSectionB = function (instanceId) {

    $("iframe")
        .contents()
        .find(".close_section_button_div")
        .empty()
        .append("<button type='button' class='close_section_button btn btn-default disabled btn-lg btn-block'><i class='fa  fa-times-circle fa-fw'></i>&nbsp;Close Section</button>")
        .css("height", "100%")
        .css("width", (gdo.net.app["Twitter"].uiProperties.table_width / gdo.net.app["Twitter"].uiProperties.button_cols) + "%")
        .css('padding', 1)
        .attr("align", "center")
        .unbind()
        .click(function () {
            if (gdo.net.instance[instanceId].control.selectedSection > -1) {
                if (gdo.net.instance[instanceId].caveStatus.sections[gdo.net.instance[instanceId].control.selectedSection].appInstanceId === -1) {
                    gdo.net.app["Twitter"].requestCloseSection(instanceId, gdo.net.instance[instanceId].control.selectedSection);
                    gdo.net.app["Twitter"].updateDisplayCanvas(instanceId);
                }
            }
        });
    if (gdo.net.instance[instanceId].control.selectedSection > -1) {
        if (gdo.net.instance[instanceId].caveStatus.sections[gdo.net.instance[instanceId].control.selectedSection].appInstanceId === -1) {
            $("iframe")
                .contents()
                .find(".close_section_button")
                .removeClass("disabled")
                .removeClass("btn-default")
                .addClass("btn-warning");
        }
    } else {
        $("iframe")
            .contents()
            .find(".close_section_button")
            .addClass("disabled")
            .addClass("btn-default")
            .removeClass("btn-warning");
    }
}