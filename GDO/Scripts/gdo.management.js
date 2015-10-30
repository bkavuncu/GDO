$(function () {
    gdo.management.table_font_size = 10;
    gdo.management.section_font_size = 11;
    gdo.management.button_font_size = 21;
    gdo.management.header_font_size = 17;
    gdo.management.table_height = 280;
    gdo.management.info_height = 35;
    gdo.management.table_width = 100;
    gdo.management.button_height = 61;
    gdo.management.button_cols = 6;
    gdo.management.header_cols = 11;
    gdo.management.cell_padding = 4;
    gdo.management.isRectangle = true;
    gdo.management.isStarted = false;
    gdo.management.colStart = 1000;
    gdo.management.colEnd = -1;
    gdo.management.rowStart = 1000;
    gdo.management.rowEnd = -1;
});

gdo.management.updateMaintenanceButton = function () {
    if (gdo.net.maintenanceMode) {
        $("#maintenanceButton")
            .empty()
            .removeClass("btn-primary")
            .removeClass("btn-danger")
            .addClass("btn-success")
            .append("Maintenance ON");
    } else {
        $("#maintenanceButton")
            .empty()
            .removeClass("btn-primary")
            .removeClass("btn-sucess")
            .addClass("btn-danger")
            .append("Maintenance OFF");
    }
    $("#maintenanceButton")
        .unbind()
        .click(function () {
            if (gdo.net.maintenanceMode) {
                gdo.net.maintenanceMode = false;
            } else {
                gdo.net.maintenanceMode = true;
            }
            gdo.updateDisplayCanvas();
            gdo.net.server.setMaintenanceMode(gdo.net.maintenanceMode);
        });
}

gdo.management.updateInstancesMenu = function () {
    $("#nav_instances")
        .empty();
    for (var appName in gdo.net.app) {
        if (gdo.net.app.hasOwnProperty(appName)) {
            var count = 0;
            $("#nav_instances").append("<li id='nav_li_" + gdo.net.app[appName].name + "'><a href='#'><i class='fa fa-cube  fa-fw'></i><font color='#fff' size='3px'>&nbsp;" + gdo.net.app[appName].name + "</font> <span class='fa arrow'></span></a>"
               + "<ul class='nav nav-third-level' id='nav_" + gdo.net.app[appName].name + "'></ul></li>");
            for (var instanceId in gdo.net.app[appName].instances) {
                if (gdo.net.app[appName].instances.hasOwnProperty(instanceId) && gdo.net.app[appName].instances[instanceId].exists) {
                    count++;
                    $("#nav_" + gdo.net.app[appName].name)
                   .append("<li><a href='Instances.cshtml?id=" + gdo.net.app[appName].instances[instanceId].id + "'>"
                       + "<font size='3px'>&nbsp;<b>" + gdo.net.app[appName].instances[instanceId].id + "</b>&nbsp;&nbsp;<font color='#fff'>" + gdo.net.app[appName].instances[instanceId].config + "</font></font></a></li>");
                }
            }
            if (count == 0) {
                $("#nav_li_" + gdo.net.app[appName].name).empty();
            }
        }
    }
}

gdo.management.updateSmartCityMenu = function () {
    $("#nav_smart_city").empty().append(
        "<li><a href='/Web/Maps/Visualisation.cshtml'><i class='fa fa-sliders fa-fw'></i> <font color='#fff' size='3px'>&nbsp;&nbsp;Visualisation</font></a></li>" +
        "<li><a href='/Web/Charts/Charts.cshtml'><i class='fa fa-bar-chart-o fa-fw'></i> <font color='#fff' size='3.5px'>&nbsp;&nbsp;Charts</font></a></li>" + 
        "<li><a href='/Web/Timeseries/Timeseries.cshtml'><i class='fa fa-superscript fa-fw'></i> <font color='#fff' size='3.5px'>&nbsp;&nbsp;Timeseries</font></a></li>" +
        "<li><a href='/Web/Maps/Storage.cshtml'><i class='fa fa-database fa-fw'></i> <font color='#fff' size='3px'>&nbsp;&nbsp;Storage</font></a></li>" +
        "<li><a href='/Web/Maps/Processing.cshtml'><i class='fa fa-gears fa-fw'></i> <font color='#fff' size='3px'>&nbsp;&nbsp;Processing</font></a></li>" 
    );
}
                                