gdo.net.app["Maps"].LAYER_TYPES_ENUM = {
    Base: 0,
    Heatmap: 1,
    Image: 2,
    Tile: 3,
    Vector: 4
};

gdo.net.app["Maps"].addLayer = function (instanceId, layerId, deserializedLayer) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Adding Layer: ' + deserializedLayer.Id.Value);
    if (gdo.net.app["Maps"].index["layer"] <= deserializedLayer.Id.Value) {
        gdo.net.app["Maps"].index["layer"] = deserializedLayer.Id.Value;
    }
    var layer;
    var properties;
    var options = {};
    switch (deserializedLayer.Type.Value) {
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Heatmap:
            properties = [
                //brightness", deserializedLayer.Brightness.Value],
                //["contrast", deserializedLayer.Contrast.Value],
                //["hue", deserializedLayer.Hue.Value],
                ["gradient", deserializedLayer.Gradient.Value],
                ["radius", deserializedLayer.Radius.Value],
                ["blur", deserializedLayer.Blur.Value],
                ["shadow", deserializedLayer.Shadow.Value],
                ["weight", deserializedLayer.Weight.Value],
                ["extent", deserializedLayer.Extent.Value],
                ["minResolution", deserializedLayer.MinResolution.Value],
                ["maxResolution", deserializedLayer.MaxResolution.Value],
                ["opacity", deserializedLayer.Opacity.Value],
                //["saturation", deserializedLayer.Saturation.Value],
                ["source", gdo.net.instance[instanceId].sources[deserializedLayer.SourceId.Value]],
                ["visible", deserializedLayer.Visible.Value]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            layer = new ol.layer.Heatmap(options);
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Image:
            properties = [
                //["brightness", deserializedLayer.Brightness.Value],
                //["contrast", deserializedLayer.Contrast.Value],
                //["hue", deserializedLayer.Hue.Value],
                ["opacity", deserializedLayer.Opacity.Value],
                //["saturation", deserializedLayer.Saturation.Value],
                ["source", gdo.net.instance[instanceId].sources[deserializedLayer.SourceId.Value]],
                ["visible", deserializedLayer.Visible.Value],
                ["extent", deserializedLayer.Extent.Value],
                ["minResolution", deserializedLayer.MinResolution.Value],
                ["maxResolution", deserializedLayer.MaxResolution.Value]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            layer = new ol.layer.Image(options);
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Tile:
            properties = [
                //["brightness", deserializedLayer.Brightness.Value],
                //["contrast", deserializedLayer.Contrast.Value],
                //["hue", deserializedLayer.Hue.Value],
                ["opacity", deserializedLayer.Opacity.Value],
                ["preload", deserializedLayer.Preload.Value],
                //["saturation", deserializedLayer.Saturation.Value],
                ["source", gdo.net.instance[instanceId].sources[deserializedLayer.SourceId.Value]],
                ["visible", deserializedLayer.Visible.Value],
                ["extent", deserializedLayer.Extent.Value],
                ["minResolution", deserializedLayer.MinResolution.Value],
                ["maxResolution", deserializedLayer.MaxResolution.Value]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            layer = new ol.layer.Tile(options);
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Vector:
            properties = [
                //["brightness", deserializedLayer.Brightness.Value],
                //["contrast", deserializedLayer.Contrast.Value],
                //["hue", deserializedLayer.Hue.Value],
                ["features", gdo.net.instance[instanceId].formats[deserializedLayer.Source.FormatId.Value].readFeatures(gdo.net.instance[instanceId].sources[deserializedLayer.SourceId.Value])],
                ["extent", deserializedLayer.Extent.Value],
                ["minResolution", deserializedLayer.MinResolution.Value],
                ["maxResolution", deserializedLayer.MaxResolution.Value],
                ["opacity", deserializedLayer.Opacity.Value],
                ["renderBuffer", deserializedLayer.RenderBuffer.Value],
                //["saturation", deserializedLayer.Saturation.Value],
                ["source", gdo.net.instance[instanceId].sources[deserializedLayer.SourceId.Value]],
                ["style", gdo.net.instance[instanceId].styles[deserializedLayer.StyleId.Value]],
                ["updateWhileAnimating", deserializedLayer.UpdateWhileAnimating.Value],
                ["updateWhileInteracting", deserializedLayer.UpdateWhileInteracting.Value],
                ["visible", deserializedLayer.Visible.Value]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            layer = new ol.layer.Vector(options);
            break;
        default:
            gdo.consoleOut('.Maps', 5, 'Instance ' + instanceId + ': Invalid Layer Type: ' + deserializedLayer.Typ.Valuee + ' for Layer ' + deserializedLayer.Id.Value);
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
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Updating Layer: ' + deserializedLayer.Id.Value);
    var layer = gdo.net.instance[instanceId].layers[layerId];
    //gdo.net.app["Maps"].setExceptNull(layer,"setBrightness",deserializedLayer.Brightness);
    //gdo.net.app["Maps"].setExceptNull(layer,"setContrast",deserializedLayer.Contrast);
    //gdo.net.app["Maps"].setExceptNull(layer,"setSaturation",deserializedLayer.Saturation);
    //gdo.net.app["Maps"].setExceptNull(layer,"setHue",deserializedLayer.Hue);
    gdo.net.app["Maps"].setExceptNull(layer, "setOpacity", deserializedLayer.Opacity.Value);
    gdo.net.app["Maps"].setExceptNull(layer, "setVisible", deserializedLayer.Visible.Value);
    gdo.net.app["Maps"].setExceptNull(layer, "setMinResolution", deserializedLayer.MinResolution.Value);
    gdo.net.app["Maps"].setExceptNull(layer, "setMaxResolution", deserializedLayer.MaxResolution.Value);
    switch (deserializedLayer.Type.Value) {
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Heatmap:
            gdo.net.app["Maps"].setExceptNull(layer, "setGradient", deserializedLayer.Gradient.Value);
            gdo.net.app["Maps"].setExceptNull(layer, "setRadius", deserializedLayer.Radius.Value);
            gdo.net.app["Maps"].setExceptNull(layer, "setBlur", deserializedLayer.Blur.Value);
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Image:
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Tile:
            gdo.net.app["Maps"].setExceptNull(layer, "setPreload", deserializedLayer.Preload.Value);
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Vector:
            gdo.net.app["Maps"].setExceptNull(layer, "setStyle", gdo.net.instance[instanceId].styles[deserializedLayer.StyleId.Value]);
            break;
        default:
            gdo.consoleOut('.Maps', 5, 'Instance ' + instanceId + ': Invalid Layer Type: ' + deserializedLayer.Type.Value + ' for Layer ' + deserializedLayer.Id.Value);
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
        gdo.net.app["Maps"].server.addLayer(instanceId, parseInt(properties.Type.Value), JSON.stringify(clone(properties)));
    } else {
        gdo.net.app["Maps"].server.updateLayer(instanceId, layer.properties.Id.Value, parseInt(properties.Type), JSON.stringify(properties));
    }
}

gdo.net.app["Maps"].removeLayer = function (instanceId, layerId) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Removing Layer: ' + layerId);
    gdo.net.instance[instanceId].map.removeLayer(gdo.net.instance[instanceId].layers[layerId]);
    gdo.net.instance[instanceId].layers[layerId] = null;
    if (gdo.net.app["Maps"].selected["layer"] == layerId) {
        gdo.net.app["Maps"].selected["layer"] = -1;
    }
    gdo.net.app["Maps"].drawListTables(instanceId);
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