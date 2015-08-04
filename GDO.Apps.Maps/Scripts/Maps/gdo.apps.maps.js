
$(function() {
    gdo.consoleOut('.MAPS', 1, 'Loaded Maps JS');
    $.connection.mapsAppHub.client.receiveGlobalMapPosition = function(instanceId, longtitudes, latitudes, resolution, width, height, zoom) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && gdo.net.node[gdo.clientId].appInstanceId == instanceId) {

            var center = gdo.net.app["Maps"].calculateLocalCenter(longtitudes, latitudes);

            //var center = gdo.net.app["Maps"].calculateOffsetPosition(longtitude, latitude, -gdo.net.app["Maps"].sectionOffsetY, gdo.net.app["Maps"].sectionOffsetX);
            parent.gdo.net.app["Maps"].map.getView().setCenter(center);
            parent.gdo.net.app["Maps"].map.getView().setZoom(zoom);
            //parent.gdo.net.app["Maps"].map.getView().setResolution(resolution);
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

gdo.net.app["Maps"].calculateLocalCenter = function (longtitudes, latitudes) {
    var topLeft = [parseFloat(longtitudes[0]), parseFloat(latitudes[0])];
    var bottomRight = [parseFloat(longtitudes[1]), parseFloat(latitudes[1])];
    var diffTotal = [bottomRight[0] - topLeft[0], bottomRight[1] - topLeft[1]];
    var diffUnit = [diffTotal[0] / gdo.net.section[gdo.net.node[gdo.clientId].sectionId].cols, diffTotal[1] / gdo.net.section[gdo.net.node[gdo.clientId].sectionId].rows];
    var center = [topLeft[0] + (-diffUnit[0] * (0.5 + gdo.net.node[gdo.clientId].col)), topLeft[1] + (diffUnit[1] * (0.5 + gdo.net.node[gdo.clientId].row))];

    gdo.net.app["Maps"].topLeft = topLeft;
    gdo.net.app["Maps"].bottomRight = bottomRight;
    gdo.net.app["Maps"].diffTotal = diffTotal;
    gdo.net.app["Maps"].diffUnit = diffUnit;
    gdo.net.app["Maps"].center = center;

    return center;
}

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
    gdo.net.app["Maps"].sectionHeight = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].height;
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
    gdo.net.app["Maps"].sectionWidth = gdo.net.section[gdo.net.instance[gdo.controlId].sectionId].width;
    gdo.net.app["Maps"].sectionHeight = gdo.net.section[gdo.net.instance[gdo.controlId].sectionId].height;
    gdo.net.app["Maps"].sectionRatio = gdo.net.app["Maps"].sectionWidth / gdo.net.app["Maps"].sectionHeight;
    gdo.net.app["Maps"].controlMaxWidth = 1490;
    gdo.net.app["Maps"].controlMaxHeight = 840;
    gdo.net.app["Maps"].controlRatio = gdo.net.app["Maps"].controlMaxWidth / gdo.net.app["Maps"].controlMaxHeight;
    gdo.net.app["Maps"].controlWidth = 700;
    gdo.net.app["Maps"].controlHeight = 350;
    if (gdo.net.app["Maps"].sectionRatio >= gdo.net.app["Maps"].controlRatio) {
        gdo.net.app["Maps"].controlWidth = gdo.net.app["Maps"].controlMaxWidth;
        gdo.net.app["Maps"].controlHeight = (gdo.net.app["Maps"].sectionHeight * gdo.net.app["Maps"].controlWidth) / gdo.net.app["Maps"].sectionWidth;
    } else {
        gdo.net.app["Maps"].controlHeight = gdo.net.app["Maps"].controlMaxHeight;
        gdo.net.app["Maps"].controlWidth = (gdo.net.app["Maps"].sectionWidth * gdo.net.app["Maps"].controlHeight) / gdo.net.app["Maps"].sectionHeight;
    }

    $("iframe").contents().find("#map").css("width", gdo.net.app["Maps"].controlWidth);
    $("iframe").contents().find("#map").css("height", gdo.net.app["Maps"].controlHeight);
    parent.gdo.net.app["Maps"].map.updateSize();
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
    //var center = gdo.net.app["Maps"].map.getView().getCenter();
    //var topLeft = gdo.net.app["Maps"].map.getCoordinateFromPixel(new parent.gdo.net.app["Maps"].ol.Pixel([0, 0]));
    //var topRight = gdo.net.app["Maps"].map.getCoordinateFromPixel(new parent.gdo.net.app["Maps"].ol.Pixel([gdo.net.app["Maps"].controlWidth, 0]));
    //var bottomLeft = gdo.net.app["Maps"].map.getCoordinateFromPixel(new parent.gdo.net.app["Maps"].ol.Pixel([0, gdo.net.app["Maps"].controlHeight]));
    //var bottomRight = gdo.net.app["Maps"].map.getCoordinateFromPixel(new parent.gdo.net.app["Maps"].ol.Pixel([gdo.net.app["Maps"].controlWidth, gdo.net.app["Maps"].controlHeight]));
    var topLeft = gdo.net.app["Maps"].map.getCoordinateFromPixel([0, 0]);
    //var topRight = gdo.net.app["Maps"].map.getCoordinateFromPixel([gdo.net.app["Maps"].controlWidth, 0]);
    //var bottomLeft = gdo.net.app["Maps"].map.getCoordinateFromPixel([0, gdo.net.app["Maps"].controlHeight]);
    var bottomRight = gdo.net.app["Maps"].map.getCoordinateFromPixel([gdo.net.app["Maps"].map.getSize()[0], gdo.net.app["Maps"].map.getSize()[1]]);
    //var longtitudes = [center[0], topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]];
    //var latitudes = [center[1], topLeft[1], topRight[1], bottomLeft[1], bottomRight[1]];
    var longtitudes = [topLeft[0], bottomRight[0]];
    var latitudes = [topLeft[1], bottomRight[1]];
    var size = gdo.net.app["Maps"].map.getSize();
    var width = size[0];
    var height = size[1];
    gdo.net.app["Maps"].server.uploadGlobalMapPosition(gdo.controlId, longtitudes, latitudes, gdo.net.app["Maps"].map.getView().getResolution(),width,height, gdo.net.app["Maps"].map.getView().getZoom());
}

gdo.net.app["Maps"].changeEvent = function() {
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        gdo.net.app["Maps"].uploadMapPosition();
       // gdo.consoleOut('.Maps', 1, 'Uploading position at Instance ' + gdo.controlId);
    }
}


           
