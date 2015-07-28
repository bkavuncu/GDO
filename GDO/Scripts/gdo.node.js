gdo.updateDisplayCanvas = function () {
    /// <summary>
    /// Updates the gdo canvas.
    /// </summary>
    /// <returns></returns>

    if (gdo.clientMode == CLIENT_MODE.NODE) {
        if (gdo.net.maintenanceMode) {
            $("#maintenance_title").empty().css({ fontSize: 140 }).css("color", "#FFF").append("GDO Node <b>" + gdo.clientId + "</b>");
            gdo.maintenance.drawEmptyNodeTable(gdo.net.cols, gdo.net.rows);
            gdo.maintenance.drawMaintenanceTable();
            $("#maintenance").show();
        } else {
            $("#maintenance").hide();
        }
    } else if (gdo.clientMode == CLIENT_MODE.CONTROL) {
        // TODO
    }
}