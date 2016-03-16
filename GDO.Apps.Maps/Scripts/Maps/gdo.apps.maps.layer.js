gdo.net.app["Maps"].LAYER_TYPES_ENUM = {
    Base: 0,
    Heatmap: 1,
    Image: 2,
    Tile: 3,
    Vector: 4
};

gdo.net.app["Maps"].addLayer = function (instanceId, layerId, deserializedLayer) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Adding Layer: ' + deserializedLayer.Id);
    if (gdo.net.app["Maps"].index["layer"] <= deserializedLayer.Id) {
        gdo.net.app["Maps"].index["layer"] = deserializedLayer.Id;
    }
    var layer;
    var properties;
    var options = {};
    switch (deserializedLayer.Type) {
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Heatmap:
            properties = [
                ["brightness",deserializedLayer.Brightness],
                ["contrast",deserializedLayer.Contrast],
                ["hue",deserializedLayer.Hue],
                ["gradient",deserializedLayer.Gradient],
                ["radius",deserializedLayer.Radius],
                ["blur",deserializedLayer.Blur],
                ["shadow",deserializedLayer.Shadow],
                ["weight",deserializedLayer.Weight],
                ["extent",deserializedLayer.Extent],
                ["minResolution",deserializedLayer.MinResolution],
                ["maxResolution",deserializedLayer.MaxResolution],
                ["opacity",deserializedLayer.Opacity],
                ["saturation",deserializedLayer.Saturation],
                ["source",gdo.net.instance[instanceId].sources[deserializedLayer.SourceId]],
                ["visible",deserializedLayer.Visible]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            layer = new ol.layer.Heatmap(options);
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Image:
            properties = [
                ["brightness",deserializedLayer.Brightness],
                ["contrast",deserializedLayer.Contrast],
                ["hue",deserializedLayer.Hue],
                ["opacity",deserializedLayer.Opacity],
                ["saturation",deserializedLayer.Saturation],
                ["source",gdo.net.instance[instanceId].sources[deserializedLayer.SourceId]],
                ["visible",deserializedLayer.Visible],
                ["extent",deserializedLayer.Extent],
                ["minResolution",deserializedLayer.MinResolution],
                ["maxResolution",deserializedLayer.MaxResolution]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            layer = new ol.layer.Image(options);
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Tile:
            properties = [
                ["brightness",deserializedLayer.Brightness],
                ["contrast",deserializedLayer.Contrast],
                ["hue",deserializedLayer.Hue],
                ["opacity",deserializedLayer.Opacity],
                ["preload",deserializedLayer.Preload],
                ["saturation",deserializedLayer.Saturation],
                ["source", gdo.net.instance[instanceId].sources[deserializedLayer.SourceId]],
                ["visible",deserializedLayer.Visible],
                ["extent",deserializedLayer.Extent],
                ["minResolution",deserializedLayer.MinResolution],
                ["maxResolution",deserializedLayer.MaxResolution]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            layer = new ol.layer.Tile(options);
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Vector:
            properties = [
                ["brightness",deserializedLayer.Brightness],
                ["contrast",deserializedLayer.Contrast],
                ["hue", deserializedLayer.Hue],
                ["features", gdo.net.instance[instanceId].formats[deserializedLayer.Source.FormatId].readFeatures(gdo.net.instance[instanceId].sources[deserializedLayer.SourceId])],
                ["extent",deserializedLayer.Extent],
                ["minResolution",deserializedLayer.MinResolution],
                ["maxResolution",deserializedLayer.MaxResolution],
                ["opacity",deserializedLayer.Opacity],
                ["renderBuffer",deserializedLayer.RenderBuffer],
                ["saturation",deserializedLayer.Saturation],
                ["source",gdo.net.instance[instanceId].sources[deserializedLayer.SourceId]],
                ["style",gdo.net.instance[instanceId].styles[deserializedLayer.StyleId]],
                ["updateWhileAnimating",deserializedLayer.UpdateWhileAnimating],
                ["updateWhileInteracting",deserializedLayer.UpdateWhileInteracting],
                ["visible",deserializedLayer.Visible]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            layer = new ol.layer.Vector(options);
            break;
        default:
            gdo.consoleOut('.Maps', 5, 'Instance ' + instanceId + ': Invalid Layer Type: ' + deserializedLayer.Type + ' for Layer '  + deserializedLayer.Id);
            break;
    }
    layer.properties = deserializedLayer;
    layer.properties.isInitialized = true;
    gdo.net.instance[instanceId].layers[layerId] = layer;
    gdo.net.app["Maps"].drawListTables(instanceId);
}

gdo.net.app["Maps"].addLayerToMap = function(instanceId, layerId) {
    gdo.net.instance[instanceId].map.addLayer(gdo.net.instance[instanceId].layers[layerId]);
}

//TODO when a new layer is added, we need to reorder layers.


gdo.net.app["Maps"].updateLayer = function (instanceId, layerId, deserializedLayer) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Updating Layer: ' + deserializedLayer.Id);
    var layer = gdo.net.instance[instanceId].layers[layerId];
    layer.setBrightness(deserializedLayer.Brightness);
    layer.setContrast(deserializedLayer.Contrast);
    layer.setSaturation(deserializedLayer.Saturation);
    layer.setHue(deserializedLayer.Hue);
    layer.setOpacity(deserializedLayer.Opacity);
    layer.setVisible(deserializedLayer.Visible);
    layer.setMinResolution(deserializedLayer.MinResolution);
    layer.setMaxResolution(deserializedLayer.MaxResolution);
    switch (deserializedLayer.Type) {
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Heatmap:
            layer.setGradient(deserializedLayer.Gradient);
            layer.setRadius(deserializedLayer.Radius);
            layer.setBlur(deserializedLayer.Blur);
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Image:
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Tile:
            layer.setPreload(deserializedLayer.Preload);
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Vector:
            layer.setStyle(gdo.net.instance[instanceId].styles[deserializedLayer.StyleId]);
            break;
        default:
            gdo.consoleOut('.Maps', 5, 'Instance ' + instanceId + ': Invalid Layer Type: ' + deserializedLayer.Type + ' for Layer ' + deserializedLayer.Id);
            break;
    }
    gdo.net.app["Maps"].drawListTables(instanceId);
}

gdo.net.app["Maps"].updateZIndexTable = function (instanceId, deserializedZIndexTable) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Updating ZIndexes');
    //TODO for each layer set z index
}

gdo.net.app["Maps"].requestLayer = function (instanceId, layerId) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Requesting Layer: ' + layerId);
    gdo.net.app["Maps"].server.requestLayer(instanceId, layerId);
}

gdo.net.app["Maps"].uploadLayer = function (instanceId, layer, isNew) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Uploading Layer: ' + layer.properties.Id);
    var properties = layer.properties;
    if (isNew) {
        gdo.net.app["Maps"].server.addLayer(instanceId, parseInt(properties.Type), JSON.stringify(clone(properties)));
    } else {
        gdo.net.app["Maps"].server.updateLayer(instanceId, layer.properties.Id, parseInt(properties.Type), JSON.stringify(properties));
    }
}

gdo.net.app["Maps"].removeLayer = function (instanceId, layerId) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Removing Layer: ' + layerId);
    gdo.net.instance[instanceId].map.removeLayer(gdo.net.instance[instanceId].layers[layerId]);
    gdo.net.instance[instanceId].layers[layerId] = null;
}

gdo.net.app["Maps"].setLayerVisible = function (instanceId, layerId, visible) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Setting Layer Visible: ' + layerId + ': ' + visible);
    gdo.net.instance[instanceId].layers[layerId].setVisible(visible);
}

gdo.net.app["Maps"].isLayerVisible = function (instanceId, layerId) {
    return gdo.net.instance[instanceId].layers[layerId].getVisible();
}

gdo.net.app["Maps"].animateLayer = function (instanceId, layerId) {
    //TODO
}