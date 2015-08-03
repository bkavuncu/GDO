
$(function() {
    gdo.consoleOut('.MAPS', 1, 'Loaded Maps JS');
    $.connection.imageTilesAppHub.client.receiveMapUpdate = function(instanceId, longtitude, latitude, resolution, zoom) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            var center = [longtitude,latitude];
            gdo.net.app["Maps"].map.getView().setCenter(center);
            //gdo.net.app["Maps"].map.getView().setCenter(ol.proj.transform(center, 'EPSG:4326', 'EPSG:3857'));
            gdo.net.app["Maps"].map.getView().setZoom(zoom);
            gdo.net.app["Maps"].map.getView().setResolution(resolution);
            //gdo.net.app["Maps"].map.getView().setResolution(sResolution);
            gdo.consoleOut('.Maps', 1, 'Receieved a Map Update at ' + gdo.clientId);
        }
    }
    $.connection.imageTilesAppHub.client.receiveMapUpdateNotification = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.net.app["Maps"].server.requestMapUpdate(gdo.net.node[gdo.clientId].appInstanceId, gdo.net.node[gdo.clientId].sectionCol, gdo.net.node[gdo.clientId].sectionRow);
        }
    }
});


gdo.net.app["Maps"].initClient = function () {
    gdo.consoleOut('.Maps', 1, 'Initializing Maps App Client at Node ' + gdo.clientId);
    gdo.net.app["Maps"].server.requestMapUpdate(gdo.net.node[gdo.clientId].appInstanceId, gdo.net.node[gdo.clientId].sectionCol, gdo.net.node[gdo.clientId].sectionRow);
}

gdo.net.app["Maps"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.consoleOut('.MAPS', 1, 'Initializing Image Maps Control at Instance ' + gdo.controlId);
    gdo.net.app["Maps"].uploadMapPosition();
}

gdo.net.app["Maps"].terminateClient = function () {
    gdo.consoleOut('.MAPS', 1, 'Terminating Image Maps Client at Node ' + gdo.clientId);
}

gdo.net.app["Maps"].terminateControl = function () {
    gdo.consoleOut('.MAPS', 1, 'Terminating Maps App Control at Instance ' + gdo.controlId);
}

gdo.net.app["Maps"].changeEvent = function() {
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        gdo.net.app["Maps"].uploadMapPosition();
        gdo.consoleOut('.Maps', 1, 'Uploading position at Instance' + gdo.controlId);
    }
}
gdo.net.app["Maps"].uploadMapPosition = function () {
    var center = gdo.net.app["Maps"].map.getView().getCenter();
    var zoom = gdo.net.app["Maps"].map.getView().getZoom();
    var resolution = gdo.net.app["Maps"].map.getView().getResolution();
    //var size = gdo.net.app["Maps"].map.getSize();
    //var width = size[0];
    //var height = size[1];
    gdo.net.app["ImageTiles"].server.uploadMapPosition(gdo.net.node[gdo.clientId].appInstanceIdinstanceId, center[0], center[1], resolution, zoom);
}

           
