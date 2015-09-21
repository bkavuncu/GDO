gdo.net.app["Maps"].LAYER_TYPES_ENUM = {
    Base: 0,
    Heatmap: 1,
    Image: 2,
    Tile: 3,
    Vector: 4
};

gdo.net.app["Maps"].addLayer = function (instanceId, layerId, deserializedLayer) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Adding Layer :' + deserializedLayer.Id);
    var layer;
    switch(deserializedLayer.Type) {
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Base:
            layer = new ol.layer.Base();
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Heatmap:
            layer = new ol.layer.Heatmap();
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Image:
            layer = new ol.layer.Image();
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Tile:
            layer = new ol.layer.Tile();
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Vector:
            layer = new ol.layer.Vector();
            break;
        default:
            layer = new ol.layer.Base();
            break;
    }
    gdo.net.instance[instanceId].layers[layerId] = layer;
    gdo.net.instance[instanceId].map.addLayer(gdo.net.instance[instanceId].layers[layerId]);
    gdo.net.app["Maps"].editLayer(instanceId, layerId, deserializedLayer);
}

gdo.net.app["Maps"].editLayer = function (instanceId, layerId, deserializedLayer) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Modifying Layer :' + deserializedLayer.Id);
    gdo.net.instance[instanceId].layers[layerId].id = deserializedLayer.Id;
    gdo.net.instance[instanceId].layers[layerId].name = deserializedLayer.Name;
    gdo.net.instance[instanceId].layers[layerId].type = deserializedLayer.Type;
    if (gdo.net.instance[instanceId].sources[deserializedLayer.Source.Id] == null || gdo.net.instance[instanceId].sources[deserializedLayer.Source.Id] == undefined) {
        gdo.net.app["Maps"].addSource(instanceId, deserializedLayer.Source.Id, deserializedLayer.Source);
        gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Added Source :' + deserializedLayer.Source.Id);
    }
    gdo.net.instance[instanceId].layers[layerId].setSource(gdo.net.instance[instanceId].sources[deserializedLayer.Source.Id]);
    gdo.net.instance[instanceId].layers[layerId].setBrightness(deserializedLayer.Brightness);
    gdo.net.instance[instanceId].layers[layerId].setContrast(deserializedLayer.Contrast);
    gdo.net.instance[instanceId].layers[layerId].setSaturation(deserializedLayer.Saturation);
    gdo.net.instance[instanceId].layers[layerId].setHue(deserializedLayer.Hue);
    gdo.net.instance[instanceId].layers[layerId].setOpacity(deserializedLayer.Opacity);
    gdo.net.instance[instanceId].layers[layerId].setZIndex(deserializedLayer.ZIndex);
    gdo.net.instance[instanceId].layers[layerId].setVisible(deserializedLayer.Visible);
    gdo.net.instance[instanceId].layers[layerId].setMaxResolution(deserializedLayer.MaxResolution);
    gdo.net.instance[instanceId].layers[layerId].setMinResolution(deserializedLayer.MinResolution);
    gdo.net.instance[instanceId].layers[layerId].setExtent(deserializedLayer.extent);
    switch (deserializedLayer.Type) {
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Base:
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Heatmap:
            gdo.net.instance[instanceId].layers[layerId].setGradient(deserializedLayer.Gradient);
            gdo.net.instance[instanceId].layers[layerId].setRadius(deserializedLayer.Radius);
            gdo.net.instance[instanceId].layers[layerId].setShadow(deserializedLayer.Shadow);
            gdo.net.instance[instanceId].layers[layerId].setWeight(deserializedLayer.Weight);
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Image:
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Tile:
            gdo.net.instance[instanceId].layers[layerId].setPreload(deserializedLayer.Preload);
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Vector:
            if (gdo.net.instance[instanceId].styles[deserializedLayer.Style.Id] == null || gdo.net.instance[instanceId].styles[deserializedLayer.Style.Id] == undefined) {
                gdo.net.app["Maps"].addStyle(instanceId, deserializedLayer.Style.Id, deserializedLayer.Style);
                gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Added Style :' + deserializedLayer.Style.Id);
            }
            gdo.net.instance[instanceId].layers[layerId].setStyle(gdo.net.instance[instanceId].styles[deserializedLayer.Style.Id]);
            break;
        default:
            break;
    }
}

gdo.net.app["Maps"].requestLayer = function (instanceId, layerId) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Requesting Layer :' + layerId);
    gdo.net.app["Maps"].server.requestLayer(instanceId, layerId);
}
gdo.net.app["Maps"].uploadNewLayer = function (instanceId, layerId) {
    var layer = gdo.net.instance[instanceId].layers[layerId];
    switch (gdo.net.instance[instanceId].layers[layerId].type) {
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Base:
            gdo.net.app["Maps"].server.addLayer(instanceId, layer.name, layer.type, layer.getBrightness(), layer.getContrast(),layer.getSaturation(),
                layer.getHue(),layer.getOpacity(),layer.getZIndex(), layer.getVisible(),layer.getMinResolution(),layer.getMaxResolution());
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Heatmap:
            gdo.net.app["Maps"].server.addHeatmapLayer(instanceId, layer.name, layer.type, layer.getBrightness(), layer.getContrast(), layer.getSaturation(),
                layer.getHue(), layer.getOpacity(), layer.getZIndex(), layer.getVisible(), layer.getMinResolution(), layer.getMaxResolution(),
                layer.getGradient, layer.getRadius());
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Image:
            gdo.net.app["Maps"].server.addImageLayer(instanceId, layer.name, layer.type, layer.getBrightness(), layer.getContrast(), layer.getSaturation(),
                layer.getHue(), layer.getOpacity(), layer.getZIndex(), layer.getVisible(), layer.getMinResolution(), layer.getMaxResolution());
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Tile:
            gdo.net.app["Maps"].server.addTileLayer(instanceId, layer.name, layer.type, layer.getBrightness(), layer.getContrast(), layer.getSaturation(),
                layer.getHue(), layer.getOpacity(), layer.getZIndex(), layer.getVisible(), layer.getMinResolution(), layer.getMaxResolution(), layer.getPreload());
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Vector:
            gdo.net.app["Maps"].server.addVectorLayer(instanceId, layer.name, layer.type, layer.getBrightness(), layer.getContrast(), layer.getSaturation(),
                layer.getHue(), layer.getOpacity(), layer.getZIndex(), layer.getVisible(), layer.getMinResolution(), layer.getMaxResolution(),
                layer.getStyle().Id);
            break;
        default:
            layer = new ol.layer.Base();
            break;
    }
}


gdo.net.app["Maps"].removeLayer = function (instanceId, layerId) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Removing Layer :' + layerId);
    gdo.net.instance[instanceId].map.removeLayer(gdo.net.instance[instanceId].layers[layerId]);
    gdo.net.instance[instanceId].layers[layerId] = null;
}

gdo.net.app["Maps"].setLayerVisible = function (instanceId, layerId, visible) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Setting Layer Visible:' + layerId + ': ' + visible);
    gdo.net.instance[instanceId].layers[layerId].setVisible(visible);
}