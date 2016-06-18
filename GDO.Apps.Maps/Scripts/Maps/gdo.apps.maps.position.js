gdo.net.app["Maps"].updatePosition = function (instanceId, topLeft, center, bottomRight, resolution, width, height) {
    var localCenter = gdo.net.app["Maps"].calculateNodeCenter(topLeft,bottomRight);
    var nodePixels = gdo.net.node[gdo.clientId].width * gdo.net.node[gdo.clientId].height;
    var controlPixels = width * height;
    var numOfNodes = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].cols * gdo.net.section[gdo.net.node[gdo.clientId].sectionId].rows;
    var localResolution = resolution / Math.sqrt((nodePixels * numOfNodes) / controlPixels);
    gdo.net.instance[instanceId].map.getView().setCenter(localCenter);
    gdo.net.instance[instanceId].map.getView().setResolution(localResolution);
}

gdo.net.app["Maps"].requestPosition= function (instanceId) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Requesting position');
    gdo.net.app["Maps"].server.requestPosition(instanceId);
}

gdo.net.app["Maps"].uploadPosition= function(instanceId) {
    var center = gdo.net.instance[instanceId].map.getView().getCenter();
    var topLeft = gdo.net.instance[instanceId].map.getCoordinateFromPixel([0, 0]);
    var bottomRight = gdo.net.instance[instanceId].map.getCoordinateFromPixel(gdo.net.instance[instanceId].map.getSize());
    var resolution = gdo.net.instance[instanceId].map.getView().getResolution();
    var size = gdo.net.instance[instanceId].map.getSize();
    var width = size[0];
    var height = size[1];
    gdo.net.app["Maps"].server.updatePosition(instanceId,topLeft,center,bottomRight,resolution,width,height);
}

gdo.net.app["Maps"].calculateNodeCenter = function (topLeft, bottomRight) {
    var diffTotal = [parseFloat(bottomRight[0]) - parseFloat(topLeft[0]), parseFloat(bottomRight[1]) - parseFloat(topLeft[1])];
    var diffUnit = [diffTotal[0] / gdo.net.section[gdo.net.node[gdo.clientId].sectionId].cols, diffTotal[1] / gdo.net.section[gdo.net.node[gdo.clientId].sectionId].rows];
    var center = [parseFloat(topLeft[0]) + (diffUnit[0] * (0.5 + gdo.net.node[gdo.clientId].sectionCol)), parseFloat(topLeft[1]) + (diffUnit[1] * (0.5 + gdo.net.node[gdo.clientId].sectionRow))];
    return center;
}