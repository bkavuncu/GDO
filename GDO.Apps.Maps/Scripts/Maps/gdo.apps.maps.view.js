gdo.net.app["Maps"].updateView = function(instanceId, viewId, deserializedView) {
    var center = gdo.net.app["Maps"].calculateNodeCenter(
        [deserializedView.Position.TopLeft.X, deserializedView.Position.TopLeft.Y],
        [deserializedView.Position.BottomRight.X, deserializedView.Position.BottomRight.Y]
    );
    var nodePixels = gdo.net.node[gdo.clientId].width * gdo.net.node[gdo.clientId].height;
    var controlPixels = deserializedView.Width * deserializedView.Height;
    var numOfNodes = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].cols * gdo.net.section[gdo.net.node[gdo.clientId].sectionId].rows;
    var resolution = deserializedView.Position.Resolution / Math.sqrt((nodePixels * numOfNodes) / controlPixels);
    var properties = [
        ["center", center],
        ["resolution", resolution],
        ["rotation", deserializedView.Rotation],
        ["zoom", deserializedView.Position.Zoom]
    ];
    var options = gdo.net.app["Maps"].optionConstructor(properties);
    map.setView(new ol.View(options));
}

gdo.net.app["Maps"].requestView = function (instanceId, viewId) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Requesting view: ' + viewId);
    gdo.net.app["Maps"].server.requestView(instanceId, viewId);
}

gdo.net.app["Maps"].uploadView = function(instanceId, viewId, isNew) {
    var center = gdo.net.instance[instanceId].map.getView().getCenter();
    var topLeft = gdo.net.instance[instanceId].map.getCoordinateFromPixel([0, 0]);
    var bottomRight = gdo.net.instance[instanceId].map.getCoordinateFromPixel(gdo.net.instance[instanceId].map.getSize());
    var size = gdo.net.instance[instanceId].map.getSize();
    var width = size[0];
    var height = size[1];
    gdo.net.app["Maps"].server.uploadMapPosition(instanceId, topLeft, center, bottomRight, gdo.net.instance[instanceId].map.getView().getResolution(), width, height, gdo.net.instance[instanceId].map.getView().getZoom());
    gdo.net.app["Maps"].server.updateView(
        instanceId,
        topLeft,
        center,
        bottomRight,
        gdo.net.instance[instanceId].map.getView().getResolution(),
        gdo.net.instance[instanceId].map.getView().getZoom(),
        gdo.net.instance[instanceId].map.getView().getRotation(),
        width,
        height);
}

gdo.net.app["Maps"].calculateNodeCenter = function (topLeft, bottomRight) {
    var diffTotal = [parseFloat(bottomRight[0]) - parseFloat(topLeft[0]), parseFloat(bottomRight[1]) - parseFloat(topLeft[1])];
    var diffUnit = [diffTotal[0] / gdo.net.section[gdo.net.node[gdo.clientId].sectionId].cols, diffTotal[1] / gdo.net.section[gdo.net.node[gdo.clientId].sectionId].rows];
    var center = [parseFloat(topLeft[0]) + (diffUnit[0] * (0.5 + gdo.net.node[gdo.clientId].sectionCol)), parseFloat(topLeft[1]) + (diffUnit[1] * (0.5 + gdo.net.node[gdo.clientId].sectionRow))];
    return center;
}