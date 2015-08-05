
$(function() {
    gdo.consoleOut('.MAPS', 1, 'Loaded Maps JS');
    $.connection.mapsAppHub.client.receiveMapPosition = function (instanceId, topLeft, center, bottomRight, resolution, width, height, zoom) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && gdo.net.node[gdo.clientId].appInstanceId == instanceId) {
            var mapCenter = [0, 0];
            var mapResolution = parseFloat(resolution);
            mapCenter = gdo.net.app["Maps"].calculateLocalCenter(topLeft, bottomRight);
            var nodePixels = gdo.net.node[gdo.clientId].width * gdo.net.node[gdo.clientId].height;
            var controlPixels = width * height;
            var numOfNodes = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].cols * gdo.net.section[gdo.net.node[gdo.clientId].sectionId].rows;
            mapResolution = mapResolution / Math.sqrt((nodePixels*numOfNodes)/controlPixels);
            //mapResolution = mapResolution / (gdo.net.node[gdo.clientId].height / height);
            //mapResolution = mapResolution / ;
            //mapResolution = mapResolution / (gdo.net.section[gdo.net.node[gdo.clientId].sectionId].rows);
            parent.gdo.net.app["Maps"].map.getView().setCenter(mapCenter);
            parent.gdo.net.app["Maps"].map.getView().setResolution(mapResolution);
        }
    }
    $.connection.mapsAppHub.client.receiveInitialMapPosition = function (instanceId, center, resolution) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["Maps"].isInitialized = true;
            var mapCenter = [parseFloat(center[0]), parseFloat(center[1])];
            var mapResolution = parseFloat(resolution);
            gdo.net.app["Maps"].map.getView().setCenter(mapCenter);
            gdo.net.app["Maps"].map.getView().setResolution(mapResolution);
            gdo.net.app["Maps"].uploadMapPosition();
            gdo.net.app["Maps"].uploadMapPosition();
        }
    }
});

gdo.net.app["Maps"].calculateLocalCenter = function (topLeft, bottomRight) {
    var diffTotal = [parseFloat(bottomRight[0]) - parseFloat(topLeft[0]), parseFloat(bottomRight[1]) - parseFloat(topLeft[1])];
    var diffUnit = [diffTotal[0] / gdo.net.section[gdo.net.node[gdo.clientId].sectionId].cols, diffTotal[1] / gdo.net.section[gdo.net.node[gdo.clientId].sectionId].rows];
    var center = [parseFloat(topLeft[0]) + (diffUnit[0] * (0.5 + gdo.net.node[gdo.clientId].sectionCol)), parseFloat(topLeft[1]) + (diffUnit[1] * (0.5 + gdo.net.node[gdo.clientId].sectionRow))];
    //TODO
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

    gdo.net.app["Maps"].server.requestMapPosition(gdo.net.node[gdo.clientId].appInstanceId, false);
}

gdo.net.app["Maps"].initControl = function () {
    gdo.net.app["Maps"].isInitialized = false;
    gdo.controlId = getUrlVar("controlId");
    gdo.net.app["Maps"].sectionWidth = gdo.net.section[gdo.net.instance[gdo.controlId].sectionId].width;
    gdo.net.app["Maps"].sectionHeight = gdo.net.section[gdo.net.instance[gdo.controlId].sectionId].height;
    gdo.net.app["Maps"].sectionRatio = gdo.net.app["Maps"].sectionWidth / gdo.net.app["Maps"].sectionHeight;
    gdo.net.app["Maps"].controlMaxWidth = 1490;
    gdo.net.app["Maps"].controlMaxHeight = 770;
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
    gdo.net.app["Maps"].map.updateSize();
    gdo.net.app["Maps"].server.requestMapPosition(gdo.controlId, true);
    gdo.consoleOut('.MAPS', 1, 'Initializing Image Maps Control at Instance ' + gdo.controlId);
}

gdo.net.app["Maps"].terminateClient = function () {
    gdo.consoleOut('.MAPS', 1, 'Terminating Image Maps Client at Node ' + gdo.clientId);
}

gdo.net.app["Maps"].terminateControl = function () {
    gdo.consoleOut('.MAPS', 1, 'Terminating Maps App Control at Instance ' + gdo.controlId);
}

gdo.net.app["Maps"].uploadMapPosition = function () {
    var center = gdo.net.app["Maps"].map.getView().getCenter();
    var topLeft = gdo.net.app["Maps"].map.getCoordinateFromPixel([0, 0]);
    var bottomRight = gdo.net.app["Maps"].map.getCoordinateFromPixel(gdo.net.app["Maps"].map.getSize());
    var size = gdo.net.app["Maps"].map.getSize();
    var width = size[0];
    var height = size[1];
    gdo.net.app["Maps"].server.uploadMapPosition(gdo.controlId,topLeft, center, bottomRight, gdo.net.app["Maps"].map.getView().getResolution(), width, height, gdo.net.app["Maps"].map.getView().getZoom());
}

gdo.net.app["Maps"].changeEvent = function() {
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        if (gdo.net.app["Maps"].isInitialized) {
            gdo.net.app["Maps"].uploadMapPosition();
        }
    }
}


           
