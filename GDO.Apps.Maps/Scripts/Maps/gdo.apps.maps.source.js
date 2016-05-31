gdo.net.app["Maps"].SOURCE_TYPES_ENUM = {
    None: -1,
    Base: 0,
    BingMaps: 1,
    CartoDB: 30,
    Cluster: 2,
    Image: 3,
    ImageCanvas: 4,
    ImageEvent: 5,
    ImageMapGuide: 6,
    ImageStatic: 7,
    ImageVector: 8,
    ImageWMS: 9,
    MapQuest: 10,
    OSM: 11,
    Raster: 12,
    RasterEvent: 13,
    Source: 14,
    Stamen: 15,
    Tile: 16,
    TileArcGISRest: 17,
    TileDebug: 18,
    TileEvent: 19,
    TileImage: 20,
    TileJSON: 21,
    TileUTFGrid: 22,
    TileVector: 23,
    TileWMS: 24,
    Vector: 25,
    VectorEvent: 26,
    WMTS: 27,
    XYZ: 28,
    Zoomify: 29
};

gdo.net.app["Maps"].addSource = function (instanceId, sourceId, deserializedSource) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Adding Source: ' + deserializedSource.Id.Value);
    if (gdo.net.app["Maps"].index["source"] <= deserializedSource.Id.Value) {
        gdo.net.app["Maps"].index["source"] = deserializedSource.Id.Value;
    }
    var source;
    var properties;
    var options = {};
    var tileGrid;
    var tileGridProperties;
    var tileGridOptions = {};

    switch (deserializedSource.Type) {
        // for loop add properties, 


        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.BingMaps:
            tileGridProperties = [
                ["extent", deserializedSource.Extent.Value],
                ["minZoom", deserializedSource.MinZoom.Value],
                ["resolutions", deserializedSource.Resolutions.Value],
                ["tileSize", deserializedSource.TileSize.Value]
            ];
            if (gdo.net.app["Maps"].optionChecker(tileGridProperties)) {
                tileGridOptions = gdo.net.app["Maps"].optionConstructor(tileGridProperties);
                tileGrid = new ol.tilegrid.TileGrid(tileGridOptions);
            }
            properties = [
                ["culture", deserializedSource.Culture.Value],
                ["key", deserializedSource.Key.Value],
                ["imagerySet", deserializedSource.ImagerySet.Value],
                ["maxZoom", deserializedSource.MaxZoom.Value],
                ["cacheSize", deserializedSource.CacheSize.Value],
                ["crossOrigin", deserializedSource.CrossOrigin.Value],
                ["opaque", deserializedSource.Opaque.Value],
                ["projection", deserializedSource.Projection.Value],
                ["tileGrid", tileGrid],
                ["tileLoadFunction", eval(deserializedSource.TileLoadFunction.Value)],
                ["tilePixelRatio", deserializedSource.TilePixelRatio.Value],
                ["url", deserializedSource.Url.Value],
                ["wrapX", deserializedSource.WrapX.Value],
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            source = new ol.source.BingMaps(options);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.CartoDB:
            tileGridProperties = [
                ["extent", deserializedSource.Extent.Value],
                ["minZoom", deserializedSource.MinZoom.Value],
                ["resolutions", deserializedSource.Resolutions.Value],
                ["tileSize", deserializedSource.TileSize.Value]
            ];
            if (gdo.net.app["Maps"].optionChecker(tileGridProperties)) {
                tileGridOptions = gdo.net.app["Maps"].optionConstructor(tileGridProperties);
                tileGrid = new ol.tilegrid.TileGrid(tileGridOptions);
            }
            properties = [
                ["config", JSON.parse(deserializedSource.Config.Value)],
                ["account", deserializedSource.Account.Value],
                ["cacheSize", deserializedSource.CacheSize.Value],
                ["crossOrigin", deserializedSource.CrossOrigin.Value],
                ["opaque", deserializedSource.Opaque.Value],
                ["projection", deserializedSource.Projection.Value],
                ["tileGrid", tileGrid],
                ["tileLoadFunction", eval(deserializedSource.TileLoadFunction.Value)],
                ["tilePixelRatio", deserializedSource.TilePixelRatio.Value],
                ["url", deserializedSource.Url.Value],
                ["wrapX", deserializedSource.WrapX.Value],
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            source = new ol.source.CartoDB(options);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.MapQuest:
            tileGridProperties = [
                ["extent", deserializedSource.Extent.Value],
                ["minZoom", deserializedSource.MinZoom.Value],
                ["resolutions", deserializedSource.Resolutions.Value],
                ["tileSize", deserializedSource.TileSize.Value]
            ];
            if (gdo.net.app["Maps"].optionChecker(tileGridProperties)) {
                tileGridOptions = gdo.net.app["Maps"].optionConstructor(tileGridProperties);
                tileGrid = new ol.tilegrid.TileGrid(tileGridOptions);
            }
            properties = [
                ["layer", deserializedSource.Layer.Value],
                ["cacheSize", deserializedSource.CacheSize.Value],
                ["crossOrigin", deserializedSource.CrossOrigin.Value],
                ["opaque", deserializedSource.Opaque.Value],
                ["projection", deserializedSource.Projection.Value],
                ["tileGrid", tileGrid],
                ["tileLoadFunction", eval(deserializedSource.TileLoadFunction.Value)],
                ["tilePixelRatio", deserializedSource.TilePixelRatio.Value],
                ["url", deserializedSource.Url.Value],
                ["wrapX", deserializedSource.WrapX.Value],
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            source = new ol.source.MapQuest(options);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.XYZ:
            tileGridProperties = [
                ["extent", deserializedSource.Extent.Value],
                ["minZoom", deserializedSource.MinZoom.Value],
                ["resolutions", deserializedSource.Resolutions.Value],
                ["tileSize", deserializedSource.TileSize.Value]
            ];
            if (gdo.net.app["Maps"].optionChecker(tileGridProperties)) {
                tileGridOptions = gdo.net.app["Maps"].optionConstructor(tileGridProperties);
                tileGrid = new ol.tilegrid.TileGrid(tileGridOptions);
            }
            properties = [
                ["cacheSize", deserializedSource.CacheSize.Value],
                ["crossOrigin", deserializedSource.CrossOrigin.Value],
                ["opaque", deserializedSource.Opaque.Value],
                ["projection", deserializedSource.Projection.Value],
                ["tileGrid", tileGrid],
                ["tileLoadFunction", eval(deserializedSource.TileLoadFunction.Value)],
                ["tilePixelRatio", deserializedSource.TilePixelRatio.Value],
                ["url", deserializedSource.Url.Value],
                ["wrapX", deserializedSource.WrapX.Value],
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            source = new ol.source.XYZ(options);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.OSM:
            tileGridProperties = [
                ["extent", deserializedSource.Extent.Value],
                ["minZoom", deserializedSource.MinZoom.Value],
                ["resolutions", deserializedSource.Resolutions.Value],
                ["tileSize", deserializedSource.TileSize.Value]
            ];
            if (gdo.net.app["Maps"].optionChecker(tileGridProperties)) {
                tileGridOptions = gdo.net.app["Maps"].optionConstructor(tileGridProperties);
                tileGrid = new ol.tilegrid.TileGrid(tileGridOptions);
            }
            properties = [
                ["cacheSize", deserializedSource.CacheSize.Value],
                ["crossOrigin", deserializedSource.CrossOrigin.Value],
                ["opaque", deserializedSource.Opaque.Value],
                ["projection", deserializedSource.Projection.Value],
                ["tileGrid", tileGrid],
                ["tileLoadFunction", eval(deserializedSource.TileLoadFunction.Value)],
                ["tilePixelRatio", deserializedSource.TilePixelRatio.Value],
                ["url", deserializedSource.Url.Value],
                ["wrapX", deserializedSource.WrapX.Value],
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            source = new ol.source.OSM(options);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.Stamen:
            tileGridProperties = [
                ["extent", deserializedSource.Extent.Value],
                ["minZoom", deserializedSource.MinZoom.Value],
                ["resolutions", deserializedSource.Resolutions.Value],
                ["tileSize", deserializedSource.TileSize.Value]
            ];
            if (gdo.net.app["Maps"].optionChecker(tileGridProperties)) {
                tileGridOptions = gdo.net.app["Maps"].optionConstructor(tileGridProperties);
                tileGrid = new ol.tilegrid.TileGrid(tileGridOptions);
            }
            properties = [
                ["layer", deserializedSource.Layer.Value],
                ["cacheSize", deserializedSource.CacheSize.Value],
                ["crossOrigin", deserializedSource.CrossOrigin.Value],
                ["opaque", deserializedSource.Opaque.Value],
                ["projection", deserializedSource.Projection.Value],
                ["tileGrid", tileGrid],
                ["tileLoadFunction", eval(deserializedSource.TileLoadFunction.Value)],
                ["tilePixelRatio", deserializedSource.TilePixelRatio.Value],
                ["url", deserializedSource.Url.Value],
                ["wrapX", deserializedSource.WrapX.Value],
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            source = new ol.source.Stamen(options);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.ImageStatic:
            properties = [
                ["crossOrigin", deserializedSource.CrossOrigin.Value],
                ["imageExtent", deserializedSource.ImageExtent.Value],
                ["imageSize", deserializedSource.ImageSize.Value],
                ["projection", deserializedSource.Projection.Value],
                ["imageLoadFunction", eval(deserializedSource.ImageLoadFunction.Value)],
                ["url", deserializedSource.Url.Value]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            source = new ol.source.ImageStatic(options);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.TileImage:
            tileGridProperties = [
                ["extent", deserializedSource.Extent.Value],
                ["minZoom", deserializedSource.MinZoom.Value],
                ["resolutions", deserializedSource.Resolutions.Value],
                ["tileSize", deserializedSource.TileSize.Value]
            ];
            if (gdo.net.app["Maps"].optionChecker(tileGridProperties)) {
                tileGridOptions = gdo.net.app["Maps"].optionConstructor(tileGridProperties);
                tileGrid = new ol.tilegrid.TileGrid(tileGridOptions);
            }
            properties = [
                ["cacheSize", deserializedSource.CacheSize.Value],
                ["crossOrigin", deserializedSource.CrossOrigin.Value],
                ["opaque", deserializedSource.Opaque.Value],
                ["projection", deserializedSource.Projection.Value],
                ["tileGrid", tileGrid],
                ["tileLoadFunction", eval(deserializedSource.TileLoadFunction.Value)],
                ["tilePixelRatio", deserializedSource.TilePixelRatio.Value],
                ["url", deserializedSource.Url.Value],
                ["wrapX", deserializedSource.WrapX.Value],
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            source = new ol.source.TileImage(options);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.TileArcGISRest:
            tileGridProperties = [
                ["extent", deserializedSource.Extent.Value],
                ["minZoom", deserializedSource.MinZoom.Value],
                ["resolutions", deserializedSource.Resolutions.Value],
                ["tileSize", deserializedSource.TileSize.Value]
            ];
            if (gdo.net.app["Maps"].optionChecker(tileGridProperties)) {
                tileGridOptions = gdo.net.app["Maps"].optionConstructor(tileGridProperties);
                tileGrid = new ol.tilegrid.TileGrid(tileGridOptions);
            }
            properties = [
                ["params", JSON.parse(deserializedSource.Params.Value)]
                ["cacheSize", deserializedSource.CacheSize.Value],
                ["crossOrigin", deserializedSource.CrossOrigin.Value],
                ["opaque", deserializedSource.Opaque.Value],
                ["projection", deserializedSource.Projection.Value],
                ["tileGrid", tileGrid],
                ["tileLoadFunction", eval(deserializedSource.TileLoadFunction.Value)],
                ["tilePixelRatio", deserializedSource.TilePixelRatio.Value],
                ["url", deserializedSource.Url.Value],
                ["wrapX", deserializedSource.WrapX.Value],
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            source = new ol.source.TileArcGISRest(options);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.TileWMS:
            tileGridProperties = [
                ["extent", deserializedSource.Extent.Value],
                ["minZoom", deserializedSource.MinZoom.Value],
                ["resolutions", deserializedSource.Resolutions.Value],
                ["tileSize", deserializedSource.TileSize.Value]
            ];
            if (gdo.net.app["Maps"].optionChecker(tileGridProperties)) {
                tileGridOptions = gdo.net.app["Maps"].optionConstructor(tileGridProperties);
                tileGrid = new ol.tilegrid.TileGrid(tileGridOptions);
            }
            properties = [
                ["params", JSON.parse(deserializedSource.Params.Value)]
                ["gutter", deserializedSource.Gutter.Value],
                ["hidpi", deserializedSource.Hidpi.Value],
                ["serverType", deserializedSource.ServerType.Value],
                ["cacheSize", deserializedSource.CacheSize.Value],
                ["crossOrigin", deserializedSource.CrossOrigin.Value],
                ["opaque", deserializedSource.Opaque.Value],
                ["projection", deserializedSource.Projection.Value],
                ["tileGrid", tileGrid],
                ["tileLoadFunction", eval(deserializedSource.TileLoadFunction.Value)],
                ["tilePixelRatio", deserializedSource.TilePixelRatio.Value],
                ["url", deserializedSource.Url.Value],
                ["wrapX", deserializedSource.WrapX.Value],
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            source = new ol.source.TileWMS(options);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.Vector:
            properties = [
                ["format", gdo.net.instance[instanceId].formats[deserializedSource.Format.Value]],
                ["loader", eval(deserializedSource.Loader.Value)],
                ["url", deserializedSource.Url.Value],
                ["strategy", deserializedSource.Strategy.Value],
                ["useSpatialIndex", deserializedSource.UseSpatialIndex.Value]
                ["wrapX", deserializedSource.WrapX.Value]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            source = new ol.source.Vector(options);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.XYZ:
            tileGridProperties = [
                ["extent", deserializedSource.Extent.Value],
                ["minZoom", deserializedSource.MinZoom.Value],
                ["resolutions", deserializedSource.Resolutions.Value],
                ["tileSize", deserializedSource.TileSize.Value]
            ];
            if (gdo.net.app["Maps"].optionChecker(tileGridProperties)) {
                tileGridOptions = gdo.net.app["Maps"].optionConstructor(tileGridProperties);
                tileGrid = new ol.tilegrid.TileGrid(tileGridOptions);
            }
            properties = [
                ["cacheSize", deserializedSource.CacheSize.Value],
                ["crossOrigin", deserializedSource.CrossOrigin.Value],
                ["opaque", deserializedSource.Opaque.Value],
                ["projection", deserializedSource.Projection.Value],
                ["tileGrid", tileGrid],
                ["tileLoadFunction", eval(deserializedSource.TileLoadFunction.Value)],
                ["tilePixelRatio", deserializedSource.TilePixelRatio.Value],
                ["url", deserializedSource.Url.Value],
                ["wrapX", deserializedSource.WrapX.Value],
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            source = new ol.source.XYZ(options);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.Zoomify:
            tileGridProperties = [
                ["extent", deserializedSource.Extent.Value],
                ["minZoom", deserializedSource.MinZoom.Value],
                ["resolutions", deserializedSource.Resolutions.Value],
                ["tileSize", deserializedSource.TileSize.Value]
            ];
            if (gdo.net.app["Maps"].optionChecker(tileGridProperties)) {
                tileGridOptions = gdo.net.app["Maps"].optionConstructor(tileGridProperties);
                tileGrid = new ol.tilegrid.TileGrid(tileGridOptions);
            }
            properties = [
                ["size", deserializedSource.Size.Value],
                ["tierSizeCalculation", deserializedSource.TierSizeCalculation.Value],
                ["cacheSize", deserializedSource.CacheSize.Value],
                ["crossOrigin", deserializedSource.CrossOrigin.Value],
                ["opaque", deserializedSource.Opaque.Value],
                ["projection", deserializedSource.Projection.Value],
                ["tileGrid", tileGrid],
                ["tileLoadFunction", eval(deserializedSource.TileLoadFunction.Value)],
                ["tilePixelRatio", deserializedSource.TilePixelRatio.Value],
                ["url", deserializedSource.Url.Value],
                ["wrapX", deserializedSource.WrapX.Value],
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            source = new ol.source.Zoomify(options);
            break;
            default:
                gdo.consoleOut('.Maps', 5, 'Instance ' + instanceId + ': Invalid Source Type: ' + deserializedSource.Type + ' for Source ' + deserializedSource.Id);
            break;
    }
    source.properties = deserializedSource;
    source.properties.isInitialized = true;
    gdo.net.instance[instanceId].sources[sourceId] = source;
    gdo.net.app["Maps"].drawListTables(instanceId);
}

gdo.net.app["Maps"].updateSource = function (instanceId, sourceId, deserializedSource) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Updating Source: ' + deserializedSource.Id);
    var source = gdo.net.instance[instanceId].sources[sourceId];
    switch (deserializedSource.Type) {
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.BingMaps:
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.Cluster:
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.ImageStatic:
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.ImageVector:
            gdo.net.app["Maps"].setExceptNull(source,"setStyle",gdo.net.instance[instanceId].styles[deserializedSource.StyleId]);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.TileImage:
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.XYZ:
            gdo.net.app["Maps"].setExceptNull(source,"setUrl",deserializedSource.Url);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.Stamen:
            gdo.net.app["Maps"].setExceptNull(source,"setUrl",deserializedSource.Url);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.TileJSON:
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.TileVector:
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.Vector:
            break;
        default:
            gdo.consoleOut('.Maps', 5, 'Instance ' + instanceId + ': Invalid Source Type: ' + deserializedSource.Type + ' for Source ' + deserializedSource.Id);
            break;
    }
    gdo.net.app["Maps"].drawListTables(instanceId);
}

gdo.net.app["Maps"].requestSource = function (instanceId, sourceId) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Requesting Source: ' + sourceId);
    gdo.net.app["Maps"].server.requestSource(instanceId, sourceId);
}

gdo.net.app["Maps"].uploadSource = function (instanceId, source, isNew) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Uploading Source: ' + source.properties.Id);
    var properties = source.properties;
    if (isNew) {
        gdo.net.app["Maps"].server.addSource(instanceId, parseInt(properties.Type), JSON.stringify(clone(properties)));
    } else {
        gdo.net.app["Maps"].server.updateSource(instanceId, source.properties.Id, parseInt(properties.Type), JSON.stringify(properties));
    }
}

gdo.net.app["Maps"].removeSource = function (instanceId, sourceId) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Removing Source: ' + sourceId);
    gdo.net.instance[instanceId].sources[sourceId] = null;
    if (gdo.net.app["Maps"].selected["source"] == sourceId) {
        gdo.net.app["Maps"].selected["source"] = -1;
    }
    gdo.net.app["Maps"].drawListTables(instanceId);
}