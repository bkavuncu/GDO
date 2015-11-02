$(function () {
    
});

gdo.management.loadControlFrame = function (appName, instanceId, configName) {
    gdo.consoleOut(".MANAGEMENT", 3, "Loading Control Frame " + appName + " with Instance Id " + instanceId);
    $("#instance_label").empty().append("<h3><b>" + appName + "</b> - " + configName + " (" + instanceId + ")</h3>");
    document.title = "" + instanceId + " - " + appName + " - " + configName;
    $('iframe').attr('src', "/Web/" + appName + "/control.cshtml?controlId=" + instanceId);
    $('iframe').fadeIn();
}

