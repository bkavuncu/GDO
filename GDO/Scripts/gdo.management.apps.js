gdo.management.drawEmptyAppTable = function () {

    $("#app_table_select_app")
        .empty()
        .append("<div id='app_table_select_app_text'> <b>Select Application</b></div>")
        .css("height", (gdo.management.table_height + (gdo.management.info_height*3.5)))
        .css("width", "7%")
        .css("border", "3px solid #444")
        .css("color", "#DDD")
        .css("background", "#222")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size });
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
    $("#app_table_select_configuration")
        .empty()
        .append("<div id='app_table_select_configuration_text'> <b>Select Configuration</b></div>")
        .css("height", (gdo.management.table_height + (gdo.management.info_height * 3.5)))
        .css("width", "7%")
        .css("border", "3px solid #444")
        .css("color", "#DDD")
        .css("background", "#222")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
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
    $("#app_table_deploy_button")
        .empty()
        .append("<div id='app_table_select_button_text'> <b>Deploy App</b></div>")
        .css("height", (gdo.management.table_height + (gdo.management.info_height * 3.5)))
        .css("width", "14%")
        .css("border", "3px solid #444")
        .css("color", "#DDD")
        .css("background", "#222")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
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
}

gdo.management.drawAppTable = function () {
    gdo.management.drawEmptyAppTable();
    if (gdo.management.selectedSection > -1){
        if (gdo.net.section[gdo.management.selectedSection].appInstanceId == -1) {
            $("#app_table_select_app").css("background-color", "#006B00");
            gdo.management.drawAppListTable();
            if (gdo.management.selectedApp != null) {
                gdo.management.drawConfigurationListTable();
                $("#app_table_select_configuration").css("background-color", "#006B00");
                if (gdo.management.selectedConfiguration != null) {
                    $("#app_table_deploy_button").css("background-color", "#006B00");
                } else {
                    $("#app_table_deploy_button").css("background-color", "#800000");
                }
            } else {
                $("#app_table_deploy_button").css("background-color", "#800000");
                $("#app_table_select_configuration").css("background-color", "#800000");
            }
        } else {
            $("#app_table_app_table").empty();
            $("#app_table_configuration_table").empty();
            gdo.management.selectedApp = null;
            gdo.management.selectedConfiguration = null;
            $("#app_table_deploy_button").css("background-color", "#800000");
            $("#app_table_select_configuration").css("background-color", "#800000");
            $("#app_table_select_app").css("background-color", "#800000");
        }
    } else if (gdo.management.selectedSection == -1) {
        $("#app_table_app_table").empty();
        $("#app_table_configuration_table").empty();
        gdo.management.selectedApp = null;
        gdo.management.selectedConfiguration = null;
        $("#app_table_deploy_button").css("background-color", "#800000");
        $("#app_table_select_configuration").css("background-color", "#800000");
        $("#app_table_select_app").css("background-color", "#800000");
    }
}

gdo.management.drawAppListTable = function() {
    $("#app_table_app_table").empty();
    
    for (var j = 0; j < gdo.net.numApps; j++) {
        $("#app_table_app_table").append("<tr id='app_table_app_table_row_" + j + " row='" + j + "'></tr>");
        $("#app_table_app_table tr:last").append("<td id='app_table_app_table_row_" + j + "_col_1' col='1' row='" + j + "'></td>");
    }
    for (var j = 0; j < gdo.net.numApps; j++) {
        $("#app_table_app_table_row_" + j + "_col_1")
            .empty()
            .append("<div id='app_table_app_table_" + gdo.net.apps[j] + "'>" + gdo.net.apps[j] + "</div>")
            .click(function () {
                gdo.management.selectedApp = gdo.net.apps[$(this).attr('row')];
                gdo.updateDisplayCanvas();
            });
        if (gdo.net.apps[j] == gdo.management.selectedApp) {
            $("#app_table_app_table_row_" + j + "_col_1").css("color", "lightgreen");
        } else {
            $("#app_table_app_table_row_" + j + "_col_1").css("color", "#DDD");
        }
    }

}

gdo.management.drawConfigurationListTable = function () {
    $("#app_table_configuration_table").empty();
    for (var j = 0; j < gdo.net.app[gdo.management.selectedApp].config.length; j++) {
        $("#app_table_configuration_table").append("<tr id='app_table_app_table_row_' + j + ' row='" + j + "'></tr>");
        $("#app_table_configuration_table tr:last").append("<td id='app_table_configuration_table_row_" + j + "_col_1' col='1' row='" + j + "'></td>");
    }
    for (var j = 0; j < gdo.net.app[gdo.management.selectedApp].config.length; j++) {
        $("#app_table_configuration_table_row_" + j + "_col_1")
            .empty()
            .append("<div id='app_table_configuration_table_" + gdo.net.app[gdo.management.selectedApp].config[j] + "'>" + gdo.net.app[gdo.management.selectedApp].config[j] + "</div>")
            .click(function () {
                gdo.management.selectedConfiguration = gdo.net.app[gdo.management.selectedApp].config[$(this).attr('row')];
                gdo.updateDisplayCanvas();
            });
        if (gdo.net.app[gdo.management.selectedApp].config[j] == gdo.management.selectedConfiguration) {
            $("#app_table_configuration_table_row_" + j + "_col_1").css("color", "lightgreen");
        } else {
            $("#app_table_configuration_table_row_" + j + "_col_1").css("color", "#DDD");
        }
    }
}