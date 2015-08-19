$(function () {
    $(document).ready(function () {
        var hub = $.connection.timeVAppHub;
        var app = $.connection.timeVAppHub.client;
        var gdo = typeof (gdo) == 'undefined' ? parent.gdo : gdo;
        var stamp = null;
        var data = null;     

        app.visualise = function (nodeId, timeStamp, data) {
            if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
                gdo.consoleOut('.TIMEV', 1, 'Instance - ' + gdo.clientId + ' function visualise: ' + nodeId);

                if (gdo.clientId == nodeId) {
                    gdo.consoleOut('.TIMEV', 1, 'Instance - ' + gdo.clientId + ' visualising');
                    stamp = timeStamp;
                    var doc = $("iframe").contents();
                    doc.find("#placeholder").removeClass("show");
                    doc.find("#placeholder").addClass("hidden");
                    doc.find("#visualisation").html('<p>' + data + '</p>');
                } else {
                    gdo.consoleOut('.TIMEV', 1, 'Instance - ' + gdo.clientId + ' ignoring request for ' + nodeId);
                }
            }
        }

        app.dispose = function (nodeId) {
            if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
                if (gdo.clientId == nodeId) {
                    gdo.consoleOut('.TIMEV', 1, 'Instance - ' + gdo.clientId + ' visualising');
                    var doc = $("iframe").contents();
                    doc.find("#visualisation").html('');
                    doc.find("#placeholder").removeClass("hidden");
                    doc.find("#placeholder").addClass("show");
                } else {
                    gdo.consoleOut('.TIMEV', 1, 'Instance - ' + gdo.clientId + ' ignoring request for ' + nodeId);
                }
            }
        }
    });    

    
});