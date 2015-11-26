﻿$(function () {
    gdo.management.table_font_size = 10;
    gdo.management.section_font_size = 11;
    gdo.management.button_font_size = 21;
    gdo.management.header_font_size = 17;
    gdo.management.table_height = 210;
    gdo.management.info_height = 35;
    gdo.management.table_width = 100;
    gdo.management.button_height = 61;
    gdo.management.button_cols = 7;
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
            .append("<i class='fa  fa-power-off fa-fw'></i>&nbsp;Maintenance ON");
    } else {
        $("#maintenanceButton")
            .empty()
            .removeClass("btn-primary")
            .removeClass("btn-success")
            .addClass("btn-danger")
            .append("<i class='fa  fa-power-off fa-fw'></i>&nbsp;Maintenance OFF");
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
    if (gdo.net.blankMode) {
        $("#blankButton")
            .empty()
            .removeClass("btn-primary")
            .removeClass("btn-danger")
            .addClass("btn-success")
            .append("<i class='fa  fa-power-off fa-fw'></i>&nbsp;Blank ON");
    } else {
        $("#blankButton")
            .empty()
            .removeClass("btn-primary")
            .removeClass("btn-success")
            .addClass("btn-danger")
            .append("<i class='fa  fa-power-off fa-fw'></i>&nbsp;Blank OFF");
    }
    $("#blankButton")
        .unbind()
        .click(function () {
            if (gdo.net.blankMode) {
                gdo.net.blankMode = false;
            } else {
                gdo.net.blankMode = true;
            }
            gdo.updateDisplayCanvas();
            gdo.net.server.setBlankMode(gdo.net.blankMode);
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
                   .append("<li id='nav_li_" + gdo.net.app[appName].instances[instanceId].id + "'><a href='Instances.cshtml?id=" + gdo.net.app[appName].instances[instanceId].id + "'>"
                       + "<font size='3px'>&nbsp;<b>" + gdo.net.app[appName].instances[instanceId].id + "</b>&nbsp;&nbsp;<font color='#fff'>" + gdo.net.app[appName].instances[instanceId].config + "</font></font></a></li>");
                }
            }
            if (count == 0) {
                $("#nav_li_" + gdo.net.app[appName].name).empty();
            }
        }
    }
    $("#side-menu").metisMenu();
}

                                