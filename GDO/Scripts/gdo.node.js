$(function() {
    gdo.closeAppFrame();
});

gdo.updateDisplayCanvas = function () {
    /// <summary>
    /// Updates the gdo canvas.
    /// </summary>
    /// <returns></returns>

    if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
        if (gdo.net.maintenanceMode) {
            $("#maintenance_title").empty().css({ fontSize: 140 }).css("color", "#FFF").append("GDO Node <b>" + gdo.clientId + "</b>");
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
    //document.getElementById("app_frame").innerHTML = '<object type="text/html" data="\\Web\\'+app+'\\app.aspx" ></object>';
    $('iframe').attr('src', "\\Web\\"+app+"\\app.aspx");
    $('iframe').fadeIn();
}

gdo.closeAppFrame = function () {
    gdo.consoleOut(".NODE", 3, "Returning back to base app frame");
    //document.getElementById("app_frame").innerHTML = '<object type="text/html" data="\\Web\\base.aspx" ></object>';
    $('iframe').attr('src', "\\Web\\base.aspx");
    $('iframe').fadeIn();
}