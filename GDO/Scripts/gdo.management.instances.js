$(function () {
    
});

gdo.management.loadControlFrame = function (appName, instanceId, configName) {
    gdo.consoleOut(".MANAGEMENT", 3, "Loading Control Frame " + appName + " with Instance Id " + instanceId);
    $("#instance_label").empty().append("<h3><b>" + appName + "</b> - " + configName + " (" + instanceId + ")</h3>");
    $("#nav_instances").addClass("in");
    $("#nav_li_" + appName).addClass("active");
    $("#nav_" + appName).addClass("in");
    //$("#nav_li_" + instanceId).addClass("active");
    document.title = "" + instanceId + " - " + appName + " - " + configName;
    $('iframe').attr('src', "/Web/" + appName + "/control.cshtml?controlId=" + instanceId);
    $('iframe').fadeIn();
    //TODO check if it exists or part of virtual app
}

