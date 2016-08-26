gdo.management.apps = {};

$(function () {
    gdo.management.apps.isActive = true;
    gdo.management.apps.selectedApp = null;
    gdo.management.apps.selectedConfiguration = null;
    gdo.management.apps.selectedCompositeApp = null;
    gdo.management.apps.selectedCompositeConfiguration = null;

    $("#app_table_panel_body").enscroll({
        showOnHover: false,
        verticalTrackClass: 'track4',
        verticalHandleClass: 'handle4'
    }).css("width", "100%").css("height", "41vh").css("padding-right", "5px");
    $("#app_table_configuration_panel_body").enscroll({
        showOnHover: false,
        verticalTrackClass: 'track4',
        verticalHandleClass: 'handle4'
    }).css("width", "100%").css("height", "41vh").css("padding-right", "5px");
});

gdo.management.apps.drawEmptyAppTable = function () {

    $("#app_table_app_list")
        .css("height", (gdo.management.table_height + (gdo.management.info_height * 3.5)))
        .css("width", "36%")
        .css("border", "3px solid #444")
        .css("color", "#DDD")
        .css("background", "#222")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "top")
        .css("vertical-align", "top")
        .css({ fontSize: gdo.management.button_font_size });
    $("#app_table_configuration_list")
        .css("height", (gdo.management.table_height + (gdo.management.info_height * 3.5)))
        .css("width", "36%")
        .css("border", "3px solid #444")
        .css("color", "#DDD")
        .css("background", "#222")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css("vertical-align", "top")
        .css({ fontSize: gdo.management.button_font_size });
}

gdo.management.apps.drawEmptyCompositeAppTable = function () {

    $("#composite_app_table_app_list")
        .css("height", (gdo.management.table_height + (gdo.management.info_height * 3.5)))
        .css("width", "36%")
        .css("border", "3px solid #444")
        .css("color", "#DDD")
        .css("background", "#222")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "top")
        .css("vertical-align", "top")
        .css({ fontSize: gdo.management.button_font_size });
    $("#composite_app_table_configuration_list")
        .css("height", (gdo.management.table_height + (gdo.management.info_height * 3.5)))
        .css("width", "36%")
        .css("border", "3px solid #444")
        .css("color", "#DDD")
        .css("background", "#222")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css("vertical-align", "top")
        .css({ fontSize: gdo.management.button_font_size });
}

gdo.management.apps.drawAppTable = function () {
    gdo.management.apps.drawEmptyAppTable();
    if (gdo.management.sections.selectedSection > -1) {
        if (gdo.net.section[gdo.management.sections.selectedSection].appInstanceId == -1) {
            $("#app_table_panel").removeClass("panel-success");
            $("#app_table_panel").addClass("panel-danger");
            gdo.management.apps.drawAppListTable();
            if (gdo.management.apps.selectedApp != null) {
                gdo.management.apps.drawConfigurationListTable();
                if (gdo.management.apps.selectedConfiguration != null) {
                    $("#button_table_row_0_col_3").css("background-color", "#006B00")
                    .unbind()
                    .click(function () {
                        if (gdo.net.section[gdo.management.sections.selectedSection] != null) {
                            if (gdo.net.section[gdo.management.sections.selectedSection].appInstanceId == -1 && gdo.management.apps.selectedApp != null && gdo.management.apps.selectedConfiguration != null) {
                                gdo.net.server.deployBaseApp(gdo.management.sections.selectedSection, gdo.management.apps.selectedApp, gdo.management.apps.selectedConfiguration);
                                gdo.consoleOut('.MANAGEMENT', 1, 'Requested Deployment of App ' + gdo.management.apps.selectedApp + " at Section " + gdo.management.sections.selectedSection + " with Configuration " + gdo.management.apps.selectedConfiguration);
                                gdo.management.sections.selectedSection = -1;
                                gdo.management.apps.selectedApp = null;
                                gdo.management.apps.selectedConfiguration = null;
                                gdo.updateDisplayCanvas();

                            }
                        }
                    });
                    $("#app_table_configuration_panel").removeClass("panel-default");
                    $("#app_table_configuration_panel").removeClass("panel-danger");
                    $("#app_table_configuration_panel").addClass("panel-success");
                } else {
                    $("#button_table_row_0_col_3").unbind();
                    $("#app_table_configuration_panel").removeClass("panel-default");
                    $("#app_table_configuration_panel").removeClass("panel-success");
                    $("#app_table_configuration_panel").addClass("panel-danger");
                }
                $("#app_table_panel").removeClass("panel-default");
                $("#app_table_panel").removeClass("panel-danger");
                $("#app_table_panel").addClass("panel-success");
            } else {
                $("#button_table_row_0_col_3").unbind();
                $("#app_table_panel").removeClass("panel-default");
                $("#app_table_panel").removeClass("panel-success");
                $("#app_table_panel").addClass("panel-danger");
                $("#app_table_configuration_panel").removeClass("panel-default");
                $("#app_table_configuration_panel").removeClass("panel-success");
                $("#app_table_configuration_panel").addClass("panel-danger");
            }
        } else {
            $("#app_table").empty();
            $("#app_table_configuration_table").empty();
            gdo.management.apps.selectedApp = null;
            gdo.management.apps.selectedConfiguration = null;
            $("#app_table_panel").removeClass("panel-danger");
            $("#app_table_panel").removeClass("panel-success");
            $("#app_table_panel").addClass("panel-default");
            $("#app_table_configuration_panel").removeClass("panel-danger");
            $("#app_table_configuration_panel").removeClass("panel-success");
            $("#app_table_configuration_panel").addClass("panel-default");
        }
    } else if (gdo.management.sections.selectedSection == -1) {
        $("#app_table").empty();
        $("#app_table_configuration_table").empty();
        gdo.management.apps.selectedApp = null;
        gdo.management.apps.selectedConfiguration = null;
        $("#app_table_panel").removeClass("panel-danger");
        $("#app_table_panel").removeClass("panel-success");
        $("#app_table_panel").addClass("panel-default");
        $("#app_table_configuration_panel").removeClass("panel-danger");
        $("#app_table_configuration_panel").removeClass("panel-success");
        $("#app_table_configuration_panel").addClass("panel-default");
    }
}

gdo.management.apps.drawCompositeAppTable = function () {
    gdo.management.apps.drawEmptyCompositeAppTable();
    gdo.management.apps.drawCompositeAppListTable();
    if (gdo.management.apps.selectedCompositeApp != null) {
        gdo.management.apps.drawCompositeConfigurationListTable();
        if (gdo.management.apps.selectedCompositeConfiguration != null) {
            $("#composite_button_table_row_0_col_1").css("background-color", "#006B00")
                .unbind()
                .click(function() {
                    if (gdo.management.apps.selectedApp != null && gdo.management.apps.selectedConfiguration != null) {
                        //gdo.net.server.deployApp(gdo.management.selectedSection, gdo.management.selectedApp, gdo.management.selectedConfiguration);
                        gdo.consoleOut('.MANAGEMENT', 1, 'Requested Deployment of App ' + gdo.management.apps.selectedCompositeApp + " with Configuration " + gdo.management.apps.selectedCompositeConfiguration);
                        gdo.management.apps.selectedCompositeApp = null;
                        gdo.management.apps.selectedCompositeConfiguration = null;
                        gdo.updateDisplayCanvas();
                    }
                });
            $("#composite_app_table_configuration_panel").removeClass("panel-default");
            $("#composite_app_table_configuration_panel").removeClass("panel-danger");
            $("#composite_app_table_configuration_panel").addClass("panel-success");
        } else {
            $("#button_table_row_0_col_1").unbind();
            $("#composite_app_table_configuration_panel").removeClass("panel-default");
            $("#composite_app_table_configuration_panel").removeClass("panel-success");
            $("#composite_app_table_configuration_panel").addClass("panel-danger");
        }
        $("#composite_app_table_panel").removeClass("panel-default");
        $("#composite_app_table_panel").removeClass("panel-danger");
        $("#composite_app_table_panel").addClass("panel-success");
    }
}

gdo.management.apps.drawAppListTable = function () {
    $("#app_table").empty();

    for (var j = 0; j < gdo.net.numApps; j++) {
        if (gdo.net.app[gdo.net.apps[j]].appType == gdo.net.APP_TYPE.BASE) {
            $("#app_table").append("<tr id='app_table_row_" + j + " row='" + j + "'></tr>");
            $("#app_table tr:last").append("<td id='app_table_row_" + j + "_col_1' col='1' row='" + j + "'></td>");
        }
    }
    for (var j = 0; j < gdo.net.numApps; j++) {
        if (gdo.net.app[gdo.net.apps[j]].appType == gdo.net.APP_TYPE.BASE) {
            $("#app_table_row_" + j + "_col_1")
            .empty()
            .css("background", "#222")
            .append("<div id='app_table_" + gdo.net.apps[j] + "'><font size='3px'>" + gdo.net.apps[j] + "</font></div>")
            .click(function () {
                gdo.management.apps.selectedApp = gdo.net.apps[$(this).attr('row')];
                gdo.management.apps.selectedConfiguration = gdo.net.app[gdo.management.apps.selectedApp].configList[0];
                gdo.updateDisplayCanvas();
            });
            if (gdo.net.apps[j] == gdo.management.apps.selectedApp) {
                $("#app_table_row_" + j + "_col_1").css("color", "#99D522");
            } else {
                $("#app_table_row_" + j + "_col_1").css("color", "#DDD");
            }
        }
    }
}


gdo.management.apps.drawCompositeAppListTable = function () {
    $("#composite_app_table").empty();

    for (var j = 0; j < gdo.net.numApps; j++) {
        if (gdo.net.app[gdo.net.apps[j]].appType == gdo.net.APP_TYPE.COMPOSITE) {
            $("#composite_app_table").append("<tr id='composite_app_table_row_" + j + " row='" + j + "'></tr>");
            $("#composite_app_table tr:last").append("<td id='composite_app_table_row_" + j + "_col_1' col='1' row='" + j + "'></td>");
        }
    }
    for (var j = 0; j < gdo.net.numApps; j++) {
        if (gdo.net.app[gdo.net.apps[j]].appType == gdo.net.APP_TYPE.COMPOSITE) {
            $("#composite_app_table_row_" + j + "_col_1")
            .empty()
            .css("background", "#222")
            .append("<div id='composite_app_table_" + gdo.net.apps[j] + "'><font size='3px'>" + gdo.net.apps[j] + "</font></div>")
            .click(function () {
                    gdo.consoleOut(".MAN", 4, gdo.net.apps[$(this).attr('row')]);
                gdo.management.apps.selectedCompositeApp = gdo.net.apps[$(this).attr('row')];
                gdo.management.apps.selectedCompositeConfiguration = gdo.net.app[gdo.management.apps.selectedCompositeApp].configList[0];
                gdo.updateDisplayCanvas();
            });
            if (gdo.net.apps[j] == gdo.management.apps.selectedCompositeApp) {
                $("#composite_app_table_row_" + j + "_col_1").css("color", "#99D522");
            } else {
                $("#composite_app_table_row_" + j + "_col_1").css("color", "#DDD");
            }
        }
    }
}

gdo.management.apps.drawConfigurationListTable = function () {
    $("#app_table_configuration_table").empty();
    for (var j = 0; j < gdo.net.app[gdo.management.apps.selectedApp].configList.length; j++) {
        $("#app_table_configuration_table").append("<tr id='app_table_row_' + j + ' row='" + j + "'></tr>");
        $("#app_table_configuration_table tr:last").append("<td id='app_table_configuration_table_row_" + j + "_col_1' col='1' row='" + j + "'></td>");
    }
    for (var j = 0; j < gdo.net.app[gdo.management.apps.selectedApp].configList.length; j++) {
        $("#app_table_configuration_table_row_" + j + "_col_1")
            .empty()
            .append("<div id='app_table_configuration_table_" + gdo.net.app[gdo.management.apps.selectedApp].configList[j] + "'><font size='3px'>" + gdo.net.app[gdo.management.apps.selectedApp].configList[j] + "</font></div>")
            .click(function () {
                gdo.management.apps.selectedConfiguration = gdo.net.app[gdo.management.apps.selectedApp].configList[$(this).attr('row')];
                gdo.updateDisplayCanvas();
            });
        if (gdo.net.app[gdo.management.apps.selectedApp].configList[j] == gdo.management.apps.selectedConfiguration) {
            $("#app_table_configuration_table_row_" + j + "_col_1").css("color", "#99D522");
        } else {
            $("#app_table_configuration_table_row_" + j + "_col_1").css("color", "#DDD");
        }
    }
}

gdo.management.apps.drawCompositeConfigurationListTable = function () {
    $("#composite_app_table_configuration_table").empty();
    for (var j = 0; j < gdo.net.app[gdo.management.apps.selectedCompositeApp].configList.length; j++) {
        $("#composite_app_table_configuration_table").append("<tr id='composite_app_table_row_' + j + ' row='" + j + "'></tr>");
        $("#composite_app_table_configuration_table tr:last").append("<td id='composite_app_table_configuration_table_row_" + j + "_col_1' col='1' row='" + j + "'></td>");
    }
    for (var j = 0; j < gdo.net.app[gdo.management.apps.selectedCompositeApp].configList.length; j++) {
        $("#composite_app_table_configuration_table_row_" + j + "_col_1")
            .empty()
            .append("<div id='composite_app_table_configuration_table_" + gdo.net.app[gdo.management.apps.selectedCompositeApp].configList[j] + "'><font size='3px'>" + gdo.net.app[gdo.management.apps.selectedCompositeApp].configList[j] + "</font></div>")
            .click(function () {
                gdo.management.apps.selectedCompositeConfiguration = gdo.net.app[gdo.management.apps.selectedCompositeApp].configList[$(this).attr('row')];
                gdo.updateDisplayCanvas();
            });
        if (gdo.net.app[gdo.management.apps.selectedCompositeApp].configList[j] == gdo.management.apps.selectedCompositeConfiguration) {
            $("#composite_app_table_configuration_table_row_" + j + "_col_1").css("color", "#99D522");
        } else {
            $("#composite_app_table_configuration_table_row_" + j + "_col_1").css("color", "#DDD");
        }
    }
}