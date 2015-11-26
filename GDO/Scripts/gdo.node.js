$(function () {
    gdo.closeAppFrame();
    gdo.currentDisplayedAppInstance = -1;
});

gdo.reloadNodeIFrame = function() {
    if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
        if (gdo.net.maintenanceMode) {
            // do nothing
        } else {
            location.reload();
        }
    } else if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        //do nothing
    }
}


gdo.updateDisplayCanvas = function () {
    /// <summary>
    /// Updates the gdo canvas.
    /// </summary>
    /// <returns></returns>

    if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
        //if (gdo.currentDisplayedAppInstance != gdo.net.node[gdo.clientId].appInstanceId) {
            if (gdo.net.node[gdo.clientId].appInstanceId == -1) {
                gdo.closeAppFrame();
               // gdo.currentDisplayedAppInstance = -1;
            } else if (gdo.net.instance[gdo.net.node[gdo.clientId].appInstanceId].appName != null) {
                gdo.loadAppFrame(gdo.net.instance[gdo.net.node[gdo.clientId].appInstanceId].appName);
                //gdo.currentDisplayedAppInstance = gdo.net.node[gdo.clientId].appInstanceId;
            }
        //}
        if (gdo.net.maintenanceMode) {
            $("#maintenance_title").empty().css({ fontSize: 140 }).css("color", "#FFF").append("Node <b>" + gdo.clientId + "</b>");
            gdo.maintenance.drawEmptyNodeTable(gdo.net.cols, gdo.net.rows);
            gdo.maintenance.drawMaintenanceTable();
            $("#maintenance").show();
            $("#app_frame").hide();
            $("#app_frame_content").hide();
        } else {
            $("#app_frame").show();
            $("#app_frame_content").show();
            $("#maintenance").hide();
        } 
    } else if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        //TODO
    }

}

gdo.loadAppFrame = function (app) {
    gdo.consoleOut(".NODE", 3, "Loading App Frame " + app);
    $('iframe').attr('src', "/Web/"+app+"/app.cshtml");
    $('iframe').fadeIn();
}

gdo.closeAppFrame = function () {
    gdo.consoleOut(".NODE", 3, "Returning back to base app frame");
    $('iframe').attr('src', "/Web/base.cshtml");
    $('iframe').fadeIn();
}