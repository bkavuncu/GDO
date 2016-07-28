gdo.management.apps = {};

$(function () {
    gdo.management.apps.isActive = true;
    gdo.management.apps.selectedApp = null;
    gdo.management.apps.selectedConfiguration = null;
    gdo.management.apps.selectedAdvancedApp = null;
    gdo.management.apps.selectedAdvancedConfiguration = null;

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

gdo.management.apps.drawEmptyAdvancedAppTable = function () {

    $("#advanced_app_table_app_list")
        .css("height", (gdo.management.table_height + (gdo.management.info_height * 3.5)))
        .css("width", "36%")
        .css("border", "3px solid #444")
        .css("color", "#DDD")
        .css("background", "#222")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "top")
        .css("vertical-align", "top")
        .css({ fontSize: gdo.management.button_font_size });
    $("#advanced_app_table_configuration_list")
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

gdo.management.apps.drawAdvancedAppTable = function () {
    gdo.management.apps.drawEmptyAdvancedAppTable();
    gdo.management.apps.drawAdvancedAppListTable();
    if (gdo.management.apps.selectedAdvancedApp != null) {
        gdo.management.apps.drawAdvancedConfigurationListTable();
        if (gdo.management.apps.selectedAdvancedConfiguration != null) {
            $("#advanced_button_table_row_0_col_1").css("background-color", "#006B00")
                .unbind()
                .click(function() {
                    if (gdo.management.apps.selectedApp != null && gdo.management.apps.selectedConfiguration != null) {
                        //gdo.net.server.deployApp(gdo.management.selectedSection, gdo.management.selectedApp, gdo.management.selectedConfiguration);
                        gdo.consoleOut('.MANAGEMENT', 1, 'Requested Deployment of App ' + gdo.management.apps.selectedAdvancedApp + " with Configuration " + gdo.management.apps.selectedAdvancedConfiguration);
                        gdo.management.apps.selectedAdvancedApp = null;
                        gdo.management.apps.selectedAdvancedConfiguration = null;
                        gdo.updateDisplayCanvas();
                    }
                });
            $("#advanced_app_table_configuration_panel").removeClass("panel-default");
            $("#advanced_app_table_configuration_panel").removeClass("panel-danger");
            $("#advanced_app_table_configuration_panel").addClass("panel-success");
        } else {
            $("#button_table_row_0_col_1").unbind();
            $("#advanced_app_table_configuration_panel").removeClass("panel-default");
            $("#advanced_app_table_configuration_panel").removeClass("panel-success");
            $("#advanced_app_table_configuration_panel").addClass("panel-danger");
        }
        $("#advanced_app_table_panel").removeClass("panel-default");
        $("#advanced_app_table_panel").removeClass("panel-danger");
        $("#advanced_app_table_panel").addClass("panel-success");
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


gdo.management.apps.drawAdvancedAppListTable = function () {
    $("#advanced_app_table").empty();

    for (var j = 0; j < gdo.net.numApps; j++) {
        if (gdo.net.app[gdo.net.apps[j]].appType == gdo.net.APP_TYPE.ADVANCED) {
            $("#advanced_app_table").append("<tr id='advanced_app_table_row_" + j + " row='" + j + "'></tr>");
            $("#advanced_app_table tr:last").append("<td id='advanced_app_table_row_" + j + "_col_1' col='1' row='" + j + "'></td>");
        }
    }
    for (var j = 0; j < gdo.net.numApps; j++) {
        if (gdo.net.app[gdo.net.apps[j]].appType == gdo.net.APP_TYPE.ADVANCED) {
            $("#advanced_app_table_row_" + j + "_col_1")
            .empty()
            .css("background", "#222")
            .append("<div id='advanced_app_table_" + gdo.net.apps[j] + "'><font size='3px'>" + gdo.net.apps[j] + "</font></div>")
            .click(function () {
                    gdo.consoleOut(".MAN", 4, gdo.net.apps[$(this).attr('row')]);
                gdo.management.apps.selectedAdvancedApp = gdo.net.apps[$(this).attr('row')];
                gdo.management.apps.selectedAdvancedConfiguration = gdo.net.app[gdo.management.apps.selectedAdvancedApp].configList[0];
                gdo.updateDisplayCanvas();
            });
            if (gdo.net.apps[j] == gdo.management.apps.selectedAdvancedApp) {
                $("#advanced_app_table_row_" + j + "_col_1").css("color", "#99D522");
            } else {
                $("#advanced_app_table_row_" + j + "_col_1").css("color", "#DDD");
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

gdo.management.apps.drawAdvancedConfigurationListTable = function () {
    $("#advanced_app_table_configuration_table").empty();
    for (var j = 0; j < gdo.net.app[gdo.management.apps.selectedAdvancedApp].configList.length; j++) {
        $("#advanced_app_table_configuration_table").append("<tr id='advanced_app_table_row_' + j + ' row='" + j + "'></tr>");
        $("#advanced_app_table_configuration_table tr:last").append("<td id='advanced_app_table_configuration_table_row_" + j + "_col_1' col='1' row='" + j + "'></td>");
    }
    for (var j = 0; j < gdo.net.app[gdo.management.apps.selectedAdvancedApp].configList.length; j++) {
        $("#advanced_app_table_configuration_table_row_" + j + "_col_1")
            .empty()
            .append("<div id='advanced_app_table_configuration_table_" + gdo.net.app[gdo.management.apps.selectedAdvancedApp].configList[j] + "'><font size='3px'>" + gdo.net.app[gdo.management.apps.selectedAdvancedApp].configList[j] + "</font></div>")
            .click(function () {
                gdo.management.apps.selectedAdvancedConfiguration = gdo.net.app[gdo.management.apps.selectedAdvancedApp].configList[$(this).attr('row')];
                gdo.updateDisplayCanvas();
            });
        if (gdo.net.app[gdo.management.apps.selectedAdvancedApp].configList[j] == gdo.management.apps.selectedAdvancedConfiguration) {
            $("#advanced_app_table_configuration_table_row_" + j + "_col_1").css("color", "#99D522");
        } else {
            $("#advanced_app_table_configuration_table_row_" + j + "_col_1").css("color", "#DDD");
        }
    }
}