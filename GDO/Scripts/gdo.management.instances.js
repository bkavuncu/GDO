gdo.management.instances = {};

$(function () {
    gdo.management.instances.isActive = true;
    gdo.management.currentInstance = -1;
    $("#sendToConsoleButton")
        .unbind()
        .click(function () {
            gdo.net.server.updateConsole(gdo.management.currentInstance);
        });
    $("#clearConsoleButton")
        .unbind()
        .click(function () {
            gdo.net.server.updateConsole(-1);
        });
});

gdo.management.instances.loadInstanceControlFrame = function (appName, instanceId, configName) {
    gdo.management.currentInstance = instanceId;
    gdo.consoleOut(".MANAGEMENT", 3, "Loading Control Frame " + appName + " with Instance Id " + instanceId);

    for (var i = 0; i < gdo.net.instance.length; i++) {
        gdo.net.app[appName].server.exitGroup("c" + i);
        //gdo.consoleOut('.NET', 1, 'Exiting Group: (app:' + appName + ', instanceId: ' + i + ")");
    }

    gdo.net.app[appName].server.joinGroup("c" + instanceId);
    gdo.consoleOut('.NET', 1, 'Joining Group: (app:' + appName + ', instanceId: ' + instanceId + ")");

    $("#instance_label").empty().append("<h3><b>" + appName + "</b> - " + configName + " (" + instanceId + ")</h3>");
    $("#console_label").empty().append("<h3><b>" + appName + "</b> - " + configName + " (" + instanceId + ")</h3>");
    $("#nav_instances").addClass("in");
    $("#nav_li_" + appName).addClass("active");
    $("#nav_" + appName).addClass("in");
    //$("#nav_li_" + instanceId).addClass("active");
    document.title = "" + instanceId + " - " + appName + " - " + configName;
    $('iframe').attr('src', "/Web/" + appName + "/control.cshtml?controlId=" + instanceId);
    $('iframe').fadeIn();

    //TODO check if it exists or part of virtual app
}

