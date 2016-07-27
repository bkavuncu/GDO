var dv;

gdo.net.app["Maps"].setView = function (instanceId, deserializedView) {
    var center = gdo.net.app["Maps"].calculateNodeCenter(
        [deserializedView.Position.TopLeft.$values[0], deserializedView.Position.TopLeft.$values[1]],
        [deserializedView.Position.BottomRight.$values[0], deserializedView.Position.BottomRight.$values[1]]
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
    gdo.net.instance[instanceId].map.setView(new ol.View(options));
    gdo.net.instance[instanceId].view = gdo.net.instance[instanceId].map.getView();
    gdo.net.app["Maps"].uploadCurrentView(instanceId);
}

gdo.net.app["Maps"].updateView = function (instanceId, deserializedView) {
    dv = deserializedView;
    var center = gdo.net.app["Maps"].calculateNodeCenter(
        [deserializedView.Position.TopLeft.$values[0], deserializedView.Position.TopLeft.$values[1]],
        [deserializedView.Position.BottomRight.$values[0], deserializedView.Position.BottomRight.$values[1]]
    );
    var nodePixels = gdo.net.node[gdo.clientId].width * gdo.net.node[gdo.clientId].height;
    var controlPixels = deserializedView.Width * deserializedView.Height;
    var numOfNodes = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].cols * gdo.net.section[gdo.net.node[gdo.clientId].sectionId].rows;
    var resolution = deserializedView.Position.Resolution / Math.sqrt((nodePixels * numOfNodes) / controlPixels);
    var rotation = deserializedView.Rotation;
    //gdo.net.instance[instanceId].map.beforeRender(pan);
    gdo.net.instance[instanceId].map.getView().setCenter(center);
    gdo.net.instance[instanceId].map.getView().setResolution(resolution);
    gdo.net.instance[instanceId].map.getView().setRotation(rotation);
}

/*gdo.net.app["Maps"].pan = ol.animation.pan({
    duration: 70,
    source: view.getCenter(),
    start: +new Date()
});*/

gdo.net.app["Maps"].requestCurrentView = function (instanceId) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Requesting current view');
    gdo.net.app["Maps"].server.requestCurrentView(instanceId);
}

gdo.net.app["Maps"].uploadCurrentView = function(instanceId) {
    var center = gdo.net.instance[instanceId].map.getView().getCenter();
    var topLeft = gdo.net.instance[instanceId].map.getCoordinateFromPixel([0, 0]);
    var bottomRight = gdo.net.instance[instanceId].map.getCoordinateFromPixel(gdo.net.instance[instanceId].map.getSize());
    var size = gdo.net.instance[instanceId].map.getSize();
    var width = size[0];
    var height = size[1];
    gdo.net.app["Maps"].server.updateCurrentView(
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