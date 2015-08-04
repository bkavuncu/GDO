
$(function() {
    gdo.consoleOut('.MAPS', 1, 'Loaded Maps JS');
    $.connection.mapsAppHub.client.receiveGlobalMapPosition = function(instanceId, longtitude, latitude, resolution, zoom) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && gdo.net.node[gdo.clientId].appInstanceId == instanceId) {
            var center = [longtitude, latitude];
            gdo.consoleOut('.MAPS', 4, center);
            //var center = gdo.net.app["Maps"].calculateOffsetPosition(longtitude, latitude, -gdo.net.app["Maps"].sectionOffsetY, gdo.net.app["Maps"].sectionOffsetX);
            gdo.consoleOut('.MAPS', 5, center);
            parent.gdo.net.app["Maps"].map.getView().setCenter(center);
            parent.gdo.net.app["Maps"].map.getView().setZoom(zoom);
            parent.gdo.net.app["Maps"].map.getView().setResolution(resolution);
        }
    }

    /*$.connection.mapsAppHub.client.receiveMapUpdate = function (instanceId, longtitude, latitude, resolution, zoom) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            var center = [longtitude,latitude];
            parent.gdo.net.app["Maps"].map.getView().setCenter(center);
            //gdo.net.app["Maps"].map.getView().setCenter(ol.proj.transform(center, 'EPSG:4326', 'EPSG:3857'));
            parent.gdo.net.app["Maps"].map.getView().setZoom(zoom);
            parent.gdo.net.app["Maps"].map.getView().setResolution(resolution);
            //gdo.net.app["Maps"].map.getView().setResolution(sResolution);
            //gdo.consoleOut('.Maps', 1, 'Receieved a Map Update at ' + gdo.clientId);
        }
    }
    $.connection.mapsAppHub.client.receiveMapUpdateNotification = function (instanceId) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && gdo.net.node[gdo.clientId].appInstanceId == instanceId) {
            //gdo.consoleOut('.Maps', 1, 'Receieved a Map Update Notification at ' + gdo.clientId);
            gdo.net.app["Maps"].server.requestMapUpdate(gdo.net.node[gdo.clientId].appInstanceId, gdo.net.node[gdo.clientId].sectionCol, gdo.net.node[gdo.clientId].sectionRow);
        }
    }*/
});

gdo.net.app["Maps"].calculateOffsetPosition = function (longtitude, latitude, distanceNorth, distanceEast) {

    var latitudeOffset = (distanceNorth / gdo.net.app["Maps"].R) * 180 / Math.PI;
    var longtitudeOffset = (distanceEast / (gdo.net.app["Maps"].R * Math.cos(latitude * Math.PI / 180))) * 180 / Math.PI;
    gdo.consoleOut('.MAPS', 3, longtitudeOffset + ", " + latitudeOffset);
    return [longtitude + longtitudeOffset, latitude + latitudeOffset];
}

gdo.net.app["Maps"].initClient = function () {
    gdo.consoleOut('.Maps', 1, 'Initializing Maps App Client at Node ' + gdo.clientId);

    gdo.net.app["Maps"].C = 156543.034;
    gdo.net.app["Maps"].R = 6378137;

    gdo.net.app["Maps"].sectionWidth = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].width;
    gdo.net.app["Maps"].sectionHeigth = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].height;
    gdo.net.app["Maps"].sectionPixels = gdo.net.app["Maps"].sectionWidth * gdo.net.app["Maps"].sectionHeight;
    gdo.net.app["Maps"].sectionOffsetX = gdo.net.app["Maps"].sectionWidth / 2;
    gdo.net.app["Maps"].sectionOffsetY = gdo.net.app["Maps"].sectionHeigth / 2;

    gdo.net.app["Maps"].nodeWidth = gdo.net.node[gdo.clientId].width;
    gdo.net.app["Maps"].nodeHeigth = gdo.net.node[gdo.clientId].height;
    gdo.net.app["Maps"].nodePixels = gdo.net.app["Maps"].nodeWidth * gdo.net.app["Maps"].nodeHeigth;
    gdo.net.app["Maps"].nodeOffsetX = gdo.net.app["Maps"].nodeWidth * (gdo.net.node[gdo.clientId].sectionCol + 1);
    gdo.net.app["Maps"].nodeOffsetY = gdo.net.app["Maps"].nodeHeight * (gdo.net.node[gdo.clientId].sectionRow + 1);

    gdo.net.app["Maps"].offsetX = gdo.net.app["Maps"].sectionOffsetX - gdo.net.app["Maps"].nodeOffsetX;
    gdo.net.app["Maps"].offsetY = gdo.net.app["Maps"].sectionOffsetY - gdo.net.app["Maps"].nodeOffsetY;

    gdo.net.app["Maps"].server.requestGlobalMapPosition(gdo.net.node[gdo.clientId].appInstanceId);
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

gdo.net.app["Maps"].uploadMapPosition = function () {
    var center = gdo.net.app["Maps"].map.getView().getCenter();
    //var size = gdo.net.app["Maps"].map.getSize();
    //var width = size[0];
    //var height = size[1];
    //gdo.consoleOut('.Maps', 1, 'Center ' + center + ' ,zoom ' + zoom + ' ,resolution ' + resolution);
    gdo.net.app["Maps"].server.uploadGlobalMapPosition(gdo.net.node[gdo.clientId].appInstanceId, center[0], center[1], gdo.net.app["Maps"].map.getView().getResolution(), gdo.net.app["Maps"].map.getView().getZoom());
}

gdo.net.app["Maps"].changeEvent = function() {
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        gdo.net.app["Maps"].uploadMapPosition();
       // gdo.consoleOut('.Maps', 1, 'Uploading position at Instance ' + gdo.controlId);
    }
}


           
