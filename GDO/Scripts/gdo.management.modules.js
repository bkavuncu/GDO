﻿gdo.management.modules = {};

$(function () {
    gdo.management.modules.isActive = true;
    gdo.management.currentModule = -1;
    $("#sendToConsoleButton")
        .unbind()
        .click(function () {
            gdo.net.server.updateConsole(gdo.management.currentModule);
        });
    $("#clearConsoleButton")
        .unbind()
        .click(function () {
            gdo.net.server.updateConsole(-1);
        });
});

gdo.management.modules.loadModuleControlFrame = function (moduleName) {
    gdo.management.currentModule = moduleName;
    gdo.consoleOut(".MANAGEMENT", 3, "Loading Control Frame " + moduleName);
    $("#module_label").empty().append("<h3><b>" + moduleName + "</b></h3>");
    $("#console_label").empty().append("<h3><b>" + moduleName + "</b></h3>");
    $("#nav_modules").addClass("in");
    $("#nav_li_" + moduleName).addClass("active");
    document.title = "" + moduleName;
    $('iframe').attr('src', "/Web/" + moduleName + "/control.cshtml");
    $('iframe').fadeIn();
}

