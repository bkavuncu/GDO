gdo.net.app["Maps"].LAYER_TYPES_ENUM = {
    Base: 0,
    Heatmap: 1,
    Image: 2,
    Tile: 3,
    Vector: 4
};

gdo.net.app["Maps"].addLayer = function (instanceId, layerId, deserializedLayer) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Adding Layer: ' + deserializedLayer.Id);
    if (gdo.net.instance[instanceId].sources[deserializedLayer.Source.Id] == null || typeof gdo.net.instance[instanceId].sources[deserializedLayer.Source.Id] == "undefined") {
        gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Adding Source: ' + deserializedLayer.Source.Id);
        gdo.net.app["Maps"].updateSource(instanceId, deserializedLayer.Source.Id, deserializedLayer.Source);
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
                ["source",gdo.net.instance[instanceId].sources[deserializedLayer.Source.Id]],
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
                ["source",gdo.net.instance[instanceId].sources[deserializedLayer.Source.Id]],
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
                ["source", gdo.net.instance[instanceId].sources[deserializedLayer.Source.Id]],
                ["visible",deserializedLayer.Visible],
                ["extent",deserializedLayer.Extent],
                ["minResolution",deserializedLayer.MinResolution],
                ["maxResolution",deserializedLayer.MaxResolution]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            layer = new ol.layer.Tile(options);
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Vector:
            if (gdo.net.instance[instanceId].styles[deserializedLayer.Style.Id] == null || typeof gdo.net.instance[instanceId].styles[deserializedLayer.Style.Id] == "undefined") {
                gdo.net.app["Maps"].updateStyle(instanceId, deserializedLayer.Style.Id, deserializedLayer.Style);
                gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Added Style: ' + deserializedLayer.Style.Id);
            }
            properties = [
                ["brightness",deserializedLayer.Brightness],
                ["contrast",deserializedLayer.Contrast],
                ["hue",deserializedLayer.Hue],
                ["extent",deserializedLayer.Extent],
                ["minResolution",deserializedLayer.MinResolution],
                ["maxResolution",deserializedLayer.MaxResolution],
                ["opacity",deserializedLayer.Opacity]
                ["renderBuffer",deserializedLayer.RenderBuffer],
                ["saturation",deserializedLayer.Saturation],
                ["source",gdo.net.instance[instanceId].sources[deserializedLayer.Source.Id]],
                ["style",gdo.net.instance[instanceId].styles[deserializedLayer.Style.Id]],
                ["updateWhileAnimating",deserializedLayer.UpdateWhileAnimating],
                ["updateWhileInteracting",deserializedLayer.UpdateWhileInteracting],
                ["visible",deserializedLayer.Visible]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            layer = new ol.layer.Vector(options);
            break;
        default:
            gdo.consoleOut('.MAPS', 5, 'Instance ' + instanceId + ': Invalid Layer Type: ' + deserializedLayer.Type + ' for Layer '  + deserializedLayer.Id);
            break;
    }
    layer.id = deserializedLayer.Id;
    layer.name = deserializedLayer.Name;
    layer.type = deserializedLayer.Type;
    layer.properties = deserializedLayer;
    gdo.net.instance[instanceId].layers[layerId] = layer;
    gdo.net.instance[instanceId].map.addLayer(gdo.net.instance[instanceId].layers[layerId]);
}

gdo.net.app["Maps"].updateLayer = function (instanceId, layerId, deserializedLayer) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Updating Layer: ' + deserializedLayer.Id);
    var layer = gdo.net.instance[instanceId].layers[layerId];
    layer.setBrightness(deserializedLayer.Brightness);
    layer.setContrast(deserializedLayer.Contrast);
    layer.setSaturation(deserializedLayer.Saturation);
    layer.setHue(deserializedLayer.Hue);
    layer.setOpacity(deserializedLayer.Opacity);
    layer.setZIndex(deserializedLayer.ZIndex);
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
            layer.setStyle(gdo.net.instance[instanceId].styles[deserializedLayer.Style.Id]);
            break;
        default:
            gdo.consoleOut('.MAPS', 5, 'Instance ' + instanceId + ': Invalid Layer Type: ' + deserializedLayer.Type + ' for Layer ' + deserializedLayer.Id);
            break;
    }
}

gdo.net.app["Maps"].requestLayer = function (instanceId, layerId) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Requesting Layer: ' + layerId);
    gdo.net.app["Maps"].server.requestLayer(instanceId, layerId);
}

gdo.net.app["Maps"].uploadLayer = function (instanceId, layerId, isNew) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Uploading Layer: ' + layerId);
    var layer = gdo.net.instance[instanceId].layers[layerId];
    var properties = layer.properties;
    var type = gdo.net.instance[instanceId].layers[layerId].type;
    if (isNew) {
        switch (type) {
            case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Heatmap:
                gdo.net.app["Maps"].server.addHeatmapLayer(instanceId, properties.Name, properties.Type, properties.Brightness, properties.Contrast,
                    properties.Saturation, properties.Hue, properties.Opacity, properties.ZIndex, properties.Visible, properties.MinResolution,
                    properties.MaxResolution, properties.Gradient, properties.Radius, properties.Shadow, properties.Weight, properties.Blur);
                break;
            case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Image:
                gdo.net.app["Maps"].server.addImageLayer(instanceId, properties.Name, properties.SourceId, properties.Brightness, properties.Contrast,
                    properties.Saturation, properties.Hue, properties.Opacity, properties.ZIndex, properties.Visible, properties.MinResolution,
                    properties.MaxResolution);
                break;
            case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Tile:
                gdo.net.app["Maps"].server.addTileLayer(instanceId, properties.Name, properties.SourceId, properties.Brightness, properties.Contrast,
                    properties.Saturation, properties.Hue, properties.Opacity, properties.ZIndex, properties.Visible, properties.MinResolution,
                    properties.MaxResolution, properties.Preload);
                break;
            case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Vector:
                gdo.net.app["Maps"].server.addVectorLayer(instanceId, properties.Name, properties.SourceId, properties.Brightness, properties.Contrast,
                    properties.Saturation, properties.Hue, properties.Opacity, properties.ZIndex, properties.Visible, properties.MinResolution,
                    properties.MaxResolution, properties.StyleId, properties.RenderBuffer, properties.UpdateWhileAnimating, properties.UpdateWhileInteracting);
                break;
            default:
                gdo.consoleOut('.MAPS', 5, 'Instance ' + instanceId + ': Invalid Layer Type: ' + type + ' for Layer ' + layerId);
                break;
        }
    } else {
        switch (type) {
            case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Heatmap:
                gdo.net.app["Maps"].server.updateHeatmapLayer(instanceId, layerId, properties.Name, properties.Type, properties.Brightness, properties.Contrast,
                    properties.Saturation, properties.Hue, properties.Opacity, properties.ZIndex, properties.Visible, properties.MinResolution,
                    properties.MaxResolution, properties.Gradient, properties.Radius, properties.Blur);
                break;
            case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Image:
                gdo.net.app["Maps"].server.updateImageLayer(instanceId, layerId, properties.Name, properties.SourceId, properties.Brightness, properties.Contrast,
                    properties.Saturation, properties.Hue, properties.Opacity, properties.ZIndex, properties.Visible, properties.MinResolution,
                    properties.MaxResolution);
                break;
            case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Tile:
                gdo.net.app["Maps"].server.updateTileLayer(instanceId, layerId, properties.Name, properties.SourceId, properties.Brightness, properties.Contrast,
                    properties.Saturation, properties.Hue, properties.Opacity, properties.ZIndex, properties.Visible, properties.MinResolution,
                    properties.MaxResolution, properties.Preload);
                break;
            case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Vector:
                gdo.net.app["Maps"].server.updateVectorLayer(instanceId, layerId, properties.Name, properties.SourceId, properties.Brightness, properties.Contrast,
                    properties.Saturation, properties.Hue, properties.Opacity, properties.ZIndex, properties.Visible, properties.MinResolution,
                    properties.MaxResolution, properties.StyleId);
                break;
            default:
                gdo.consoleOut('.MAPS', 5, 'Instance ' + instanceId + ': Invalid Layer Type: ' + type + ' for Layer ' + layerId);
                break;
        }
    }
}

gdo.net.app["Maps"].removeLayer = function (instanceId, layerId) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Removing Layer: ' + layerId);
    gdo.net.instance[instanceId].map.removeLayer(gdo.net.instance[instanceId].layers[layerId]);
    gdo.net.instance[instanceId].layers[layerId] = null;
}

gdo.net.app["Maps"].setLayerVisible = function (instanceId, layerId, visible) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Setting Layer Visible: ' + layerId + ': ' + visible);
    gdo.net.instance[instanceId].layers[layerId].setVisible(visible);
}

//TODO one mor function load layer from config or control client and save it.