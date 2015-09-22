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
    var layer = gdo.net.instance[instanceId].layers[layerId];
    layer.id = deserializedLayer.Id;
    layer.name = deserializedLayer.Name;
    layer.type = deserializedLayer.Type;
    if (gdo.net.instance[instanceId].sources[deserializedLayer.Source.Id] == null || gdo.net.instance[instanceId].sources[deserializedLayer.Source.Id] == undefined) {
        gdo.net.app["Maps"].addSource(instanceId, deserializedLayer.Source.Id, deserializedLayer.Source);
        gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Added Source :' + deserializedLayer.Source.Id);
    }
    layer.setSource(gdo.net.instance[instanceId].sources[deserializedLayer.Source.Id]);
    layer.setBrightness(deserializedLayer.Brightness);
    layer.setContrast(deserializedLayer.Contrast);
    layer.setSaturation(deserializedLayer.Saturation);
    layer.setHue(deserializedLayer.Hue);
    layer.setOpacity(deserializedLayer.Opacity);
    layer.setZIndex(deserializedLayer.ZIndex);
    layer.setVisible(deserializedLayer.Visible);
    layer.setMaxResolution(deserializedLayer.MaxResolution);
    layer.setMinResolution(deserializedLayer.MinResolution);
    layer.setExtent(deserializedLayer.extent);
    switch (deserializedLayer.Type) {
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Base:
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Heatmap:
            layer.setGradient(deserializedLayer.Gradient);
            layer.setRadius(deserializedLayer.Radius);
            layer.setShadow(deserializedLayer.Shadow);
            layer.setWeight(deserializedLayer.Weight);
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Image:
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Tile:
            layer.setPreload(deserializedLayer.Preload);
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Vector:
            if (gdo.net.instance[instanceId].styles[deserializedLayer.Style.Id] == null || gdo.net.instance[instanceId].styles[deserializedLayer.Style.Id] == undefined) {
                gdo.net.app["Maps"].addStyle(instanceId, deserializedLayer.Style.Id, deserializedLayer.Style);
                gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Added Style :' + deserializedLayer.Style.Id);
            }
            layer.setStyle(gdo.net.instance[instanceId].styles[deserializedLayer.Style.Id]);
            break;
        default:
            break;
    }
    layer.properties = deserializedLayer;
}

gdo.net.app["Maps"].requestLayer = function (instanceId, layerId) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Requesting Layer :' + layerId);
    gdo.net.app["Maps"].server.requestLayer(instanceId, layerId);
}
gdo.net.app["Maps"].updateLayer = function (instanceId, layerId, isNew) {
    var layer = gdo.net.instance[instanceId].layers[layerId];
    var type = gdo.net.instance[instanceId].layers[layerId].type;
    if (isNew) {
        layerId = -1;
    }
    switch (type) {
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Base:
            gdo.net.app["Maps"].server.updateLayer(instanceId, layerId, layer.name, layer.type, layer.getBrightness(), layer.getContrast(), layer.getSaturation(),
                layer.getHue(),layer.getOpacity(),layer.getZIndex(), layer.getVisible(),layer.getMinResolution(),layer.getMaxResolution());
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Heatmap:
            gdo.net.app["Maps"].server.updateHeatmapLayer(instanceId, layerId, layer.name, layer.type, layer.getBrightness(), layer.getContrast(), layer.getSaturation(),
                layer.getHue(), layer.getOpacity(), layer.getZIndex(), layer.getVisible(), layer.getMinResolution(), layer.getMaxResolution(),
                layer.getGradient, layer.getRadius());
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Image:
            gdo.net.app["Maps"].server.updateImageLayer(instanceId, layerId, layer.name, layer.type, layer.getBrightness(), layer.getContrast(), layer.getSaturation(),
                layer.getHue(), layer.getOpacity(), layer.getZIndex(), layer.getVisible(), layer.getMinResolution(), layer.getMaxResolution());
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Tile:
            gdo.net.app["Maps"].server.updateTileLayer(instanceId, layerId, layer.name, layer.type, layer.getBrightness(), layer.getContrast(), layer.getSaturation(),
                layer.getHue(), layer.getOpacity(), layer.getZIndex(), layer.getVisible(), layer.getMinResolution(), layer.getMaxResolution(), layer.getPreload());
            break;
        case gdo.net.app["Maps"].LAYER_TYPES_ENUM.Vector:
            gdo.net.app["Maps"].server.updateVectorLayer(instanceId, layerId, layer.name, layer.type, layer.getBrightness(), layer.getContrast(), layer.getSaturation(),
                layer.getHue(), layer.getOpacity(), layer.getZIndex(), layer.getVisible(), layer.getMinResolution(), layer.getMaxResolution(),
                layer.getStyle().Id);
            break;
        default:
            gdo.net.app["Maps"].server.updateLayer(instanceId, layerId, layer.name, layer.type, layer.getBrightness(), layer.getContrast(), layer.getSaturation(),
                layer.getHue(), layer.getOpacity(), layer.getZIndex(), layer.getVisible(), layer.getMinResolution(), layer.getMaxResolution());
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

//TODO one mor function load layer from config or control client and save it.