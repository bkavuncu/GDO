gdo.net.app["Maps"].LAYER_TYPES_ENUM = {
    Base: 0,
    Heatmap: 1,
    Image: 2,
    Tile: 3,
    Vector: 4
};

gdo.net.app["Maps"].updateLayer = function (instanceId, layerId, deserializedLayer) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Updating Layer: ' + deserializedLayer.Id);
    if (gdo.net.instance[instanceId].sources[deserializedLayer.Source.Id] == null || gdo.net.instance[instanceId].sources[deserializedLayer.Source.Id] == undefined) {
        gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Adding Source: ' + deserializedLayer.Source.Id);
        gdo.net.app["Maps"].updateSource(instanceId, deserializedLayer.Source.Id, deserializedLayer.Source);
    }
    var layer;
    switch (deserializedLayer.Type) {
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Heatmap:
            layer = new ol.layer.Heatmap({
                brightness: deserializedLayer.Brightness,
                contrast: deserializedLayer.Contrast,
                hue: deserializedLayer.Hue,
                gradient: deserializedLayer.Gradient,
                radius: deserializedLayer.Radius,
                blur: deserializedLayer.Blur,
                shadow: deserializedLayer.Shadow,
                weight: deserializedLayer.Weight,
                extent: deserializedLayer.Extent,
                minResolution: deserializedLayer.MinResolution,
                maxResolution: deserializedLayer.MaxResolution,
                opacity: deserializedLayer.Opacity,
                saturation: deserializedLayer.Saturation,
                source:gdo.net.instance[instanceId].sources[deserializedLayer.Source.Id],
                visible: deserializedLayer.Visible
                });
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Image:
            layer = new ol.layer.Image({
                brightness: deserializedLayer.Brightness,
                contrast: deserializedLayer.Contrast,
                hue: deserializedLayer.Hue,
                opacity: deserializedLayer.Opacity,
                saturation: deserializedLayer.Saturation,
                source: gdo.net.instance[instanceId].sources[deserializedLayer.Source.Id],
                visible: deserializedLayer.Visible,
                extent: deserializedLayer.Extent,
                minResolution: deserializedLayer.MinResolution,
                maxResolution: deserializedLayer.MaxResolution
            });
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Tile:
            layer = new ol.layer.Tile({
                brightness: deserializedLayer.Brightness,
                contrast: deserializedLayer.Contrast,
                hue: deserializedLayer.Hue,
                opacity: deserializedLayer.Opacity,
                preload: deserializedLayer.Preload,
                saturation: deserializedLayer.Saturation,
                source:gdo.net.instance[instanceId].sources[deserializedLayer.Source.Id],
                visible: deserializedLayer.Visible,
                extent: deserializedLayer.Extent,
                minResolution: deserializedLayer.MinResolution,
                maxResolution: deserializedLayer.MaxResolution
            });
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Vector:
            if (gdo.net.instance[instanceId].styles[deserializedLayer.Style.Id] == null || gdo.net.instance[instanceId].styles[deserializedLayer.Style.Id] == undefined) {
                gdo.net.app["Maps"].updateStyle(instanceId, deserializedLayer.Style.Id, deserializedLayer.Style);
                gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Added Style: ' + deserializedLayer.Style.Id);
            }
            layer = new ol.layer.Vector({
                brightness: deserializedLayer.Brightness,
                contrast: deserializedLayer.Contrast,
                hue: deserializedLayer.Hue,
                extent: deserializedLayer.Extent,
                minResolution: deserializedLayer.MinResolution,
                maxResolution: deserializedLayer.MaxResolution,
                opacity: deserializedLayer.Opacity,
                renderBuffer: deserializedLayer.RenderBuffer,
                saturation: deserializedLayer.Saturation,
                source: gdo.net.instance[instanceId].sources[deserializedLayer.Source.Id],
                style: gdo.net.instance[instanceId].styles[deserializedLayer.Style.Id],
                updateWhileAnimating: deserializedLayer.UpdateWhileAnimating,
                updateWhileInteracting: deserializedLayer.UpdateWhileInteracting,
                visible: deserializedLayer.Visible
            });
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
        layerId = -1;
    }
    switch (type) {
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Heatmap:
            gdo.net.app["Maps"].server.updateHeatmapLayer(instanceId, layerId, properties.Name, properties.Type, properties.Brightness, properties.Contrast,
                properties.Saturation, properties.Hue, properties.Opacity, properties.ZIndex, properties.Visible, properties.MinResolution,
                properties.MaxResolution, properties.Gradient, properties.Radius, properties.Shadow, properties.Weight, properties.Blur);
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
                properties.MaxResolution, properties.StyleId, properties.RenderBuffer, properties.UpdateWhileAnimating, properties.UpdateWhileInteracting);
            break;
        default:
            gdo.consoleOut('.MAPS', 5, 'Instance ' + instanceId + ': Invalid Layer Type: ' + type + ' for Layer ' + layerId);
            break;
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