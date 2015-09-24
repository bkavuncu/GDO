gdo.net.app["Maps"].SOURCE_TYPES_ENUM = {
    None: -1,
    Base: 0,
    BingMaps: 1,
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

gdo.net.app["Maps"].updateSource = function (instanceId, sourceId, deserializedSource) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Updating Source: ' + deserializedSource.Id);
    var source;
    var properties;
    var options = {};
    var tileGrid;
    switch (deserializedSource.Type) {
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.BingMaps:
            properties = [
                ["culture",deserializedSource.Culture],
                ["key",deserializedSource.Key],
                ["imagerySet", deserializedSource.ImagerySet],
                ["maxZoom",deserializedSource.MaxZoom]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            source = new ol.source.BingMaps(options);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.Cluster:
            properties = [
                ["distance", deserializedSource.Distance],
                ["extent", deserializedSource.Extent],
                ["format", gdo.net.instance[instanceId].formats[deserializedSource.Format.Id]],
                ["source", gdo.net.instance[instanceId].sources[deserializedSource.VectorSource.Id]]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            source = new ol.source.Cluster(options);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.ImageStatic:
            properties = [
                ["crossOrigin", deserializedSource.CrossOrigin],
                ["imageExtent", deserializedSource.Extent],
                ["imageSize", [deserializedSource.Width, deserializedSource.Height]],
                ["url", deserializedSource.URL]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            source = new ol.source.ImageStatic(options);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.ImageVector:
            properties = [
                ["ratio", deserializedSource.Ratio],
                ["source", gdo.net.instance[instanceId].sources[deserializedSource.VectorSource.Id]],
                ["style", gdo.net.instance[instanceId].styles[deserializedSource.Style.Id]]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            source = new ol.source.ImageVector(options);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.TileImage:
            properties = [
                ["extent", deserializedSource.TileGrid.Extent],
                ["minZoom", deserializedSource.TileGrid.MinZoom],
                ["maxZoom", deserializedSource.TileGrid.MaxZoom],
                ["resolutions", deserializedSource.TileGrid.Resolutions],
                ["tileSize", [deserializedSource.TileGrid.Width, deserializedSource.TileGrid.Height]]
            ];
            if (gdo.net.app["Maps"].optionChecker(properties)) {
                options = gdo.net.app["Maps"].optionConstructor(properties);
                tileGrid = new ol.tilegrid.TileGrid(options);
            }
            properties = [
                ["crossOrigin", deserializedSource.CrossOrigin],
                ["tileGrid", tileGrid],
                ["opaque", deserializedSource.Opaque]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            source = new ol.source.TileImage(options);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.XYZ:
            properties = [
                ["extent", deserializedSource.TileGrid.Extent],
                ["minZoom", deserializedSource.TileGrid.MinZoom],
                ["maxZoom", deserializedSource.TileGrid.MaxZoom],
                ["resolutions", deserializedSource.TileGrid.Resolutions],
                ["tileSize", [deserializedSource.TileGrid.Width, deserializedSource.TileGrid.Height]]
            ];
            if (gdo.net.app["Maps"].optionChecker(properties)) {
                options = gdo.net.app["Maps"].optionConstructor(properties);
                tileGrid = new ol.tilegrid.TileGrid(options);
            }
            properties = [
                ["crossOrigin", deserializedSource.CrossOrigin],
                ["tileGrid", tileGrid],
                ["opaque", deserializedSource.Opaque],
                ["projection", deserializedSource.Projection],
                ["url", deserializedSource.Url]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            source = new ol.source.XYZ(options);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.Stamen:
            properties = [
                ["extent", deserializedSource.TileGrid.Extent],
                ["minZoom", deserializedSource.TileGrid.MinZoom],
                ["maxZoom", deserializedSource.TileGrid.MaxZoom],
                ["resolutions", deserializedSource.TileGrid.Resolutions],
                ["tileSize", [deserializedSource.TileGrid.Width, deserializedSource.TileGrid.Height]]
            ];
            if (gdo.net.app["Maps"].optionChecker(properties)) {
                options = gdo.net.app["Maps"].optionConstructor(properties);
                tileGrid = new ol.tilegrid.TileGrid(options);
            }
            properties = [
                ["crossOrigin", deserializedSource.CrossOrigin],
                ["tileGrid", tileGrid],
                ["opaque", deserializedSource.Opaque],
                ["projection", deserializedSource.Projection],
                ["url", deserializedSource.Url],
                ["layer", deserializedSource.Layer]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            source = new ol.source.Stamen(options);
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.TileJSON:
            properties = [
                ["crossOrigin", deserializedSource.CrossOrigin],
                ["url", deserializedSource.Url]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            source = new ol.source.TileJSON(options);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.TileVector:
            properties = [
                ["extent", deserializedSource.TileGrid.Extent],
                ["minZoom", deserializedSource.TileGrid.MinZoom],
                ["maxZoom", deserializedSource.TileGrid.MaxZoom],
                ["resolutions", deserializedSource.TileGrid.Resolutions],
                ["tileSize", [deserializedSource.TileGrid.Width, deserializedSource.TileGrid.Height]]
            ];
            if (gdo.net.app["Maps"].optionChecker(properties)) {
                options = gdo.net.app["Maps"].optionConstructor(properties);
                tileGrid = new ol.tilegrid.TileGrid(options);
            }
            properties = [
                ["format", gdo.net.instance[instanceId].formats[deserializedSource.Format.Id]],
                ["projection", deserializedSource.Projection],
                ["tileGrid", tileGrid],
                ["url", deserializedSource.Url]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            source = new ol.source.TileVector(options);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.Vector:
            properties = [
                ["format", gdo.net.instance[instanceId].formats[deserializedSource.Format.Id]],
                ["url", deserializedSource.Url],
                ["strategy", deserializedSource.LoadingStrategy],
                ["useSpatialIndex", deserializedSource.UseSpatialIndex]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            source = new ol.source.Vector(options);
            break;
            default:
                gdo.consoleOut('.MAPS', 5, 'Instance ' + instanceId + ': Invalid Source Type: ' + deserializedSource.Type + ' for Source ' + deserializedSource.Id);
            break;
    }
    source.id = deserializedSource.Id;
    source.name = deserializedSource.Name;
    source.type = deserializedSource.Type;
    source.properties = deserializedSource;
}

gdo.net.app["Maps"].requestSource = function (instanceId, sourceId) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Requesting Source: ' + sourceId);
    gdo.net.app["Maps"].server.requestSource(instanceId, sourceId);
}

gdo.net.app["Maps"].uploadSource = function (instanceId, sourceId, isNew) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Uploading Source: ' + sourceId);
    var source = gdo.net.instance[instanceId].source[sourceId];
    var properties = source.properties;
    var type = gdo.net.instance[instanceId].source[sourceId].type;
    if (isNew) {
        sourceId = -1;
    }
    switch (type) {
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.BingMaps:
            gdo.net.app["Maps"].server.updateBingMapsSource(instanceId, sourceId, properties.Name, properties.Culture, properties.Key, properties.ImagerySet,
                source.MaxZoom);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.Cluster:
            gdo.net.app["Maps"].server.updateClusterSource(instanceId, sourceId, properties.Name, properties.Distance, properties.Extent, properties.FormatId,
                properties.VectorSourceId);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.ImageStatic:
            gdo.net.app["Maps"].server.updateStaticImageSource(instanceId, sourceId, properties.Name, properties.CrossOrigin, properties.Width, properties.Height,
                properties.Url, properties.Extent);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.ImageVector:
            gdo.net.app["Maps"].server.updateVectorImageSource(instanceId, sourceId, properties.Name, properties.VectorSourceId, properties.StyleId, properties.Ratio);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.TileImage:
            gdo.net.app["Maps"].server.updateImageTileSource(instanceId, sourceId, properties.Name, properties.CrossOrigin, properties.Opaque, properties.Extent,
                properties.MinZoom, properties.MaxZoom, properties.TileWidth, properties.TileHeight, properties.Resolutions);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.XYZ:
            gdo.net.app["Maps"].server.updateImageTileSource(instanceId, sourceId, properties.Name, properties.CrossOrigin, properties.Opaque, properties.Extent,
                properties.MinZoom, properties.MaxZoom, properties.TileWidth, properties.TileHeight, properties.Resolutions, properties.Projection, properties.Url);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.Stamen:
            gdo.net.app["Maps"].server.updateImageTileSource(instanceId, sourceId, properties.Name, properties.CrossOrigin, properties.Opaque, properties.Extent,
                properties.MinZoom, properties.MaxZoom, properties.TileWidth, properties.TileHeight, properties.Resolutions, properties.Projection, properties.Url,
                properties.Layer);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.TileJSON:
            gdo.net.app["Maps"].server.updateJSONTileSource(instanceId, sourceId, properties.Name, properties.Url, properties.CrossOrigin);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.TileVector:
            gdo.net.app["Maps"].server.updateVectorTileSource(instanceId, sourceId, properties.Name, properties.Projection, properties.Url, properties.Extent,
                properties.FormatId, properties.MinZoom, properties.MaxZoom, properties.TileWidth, properties.TileHeight, properties.Resolutions);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.Vector:
            gdo.net.app["Maps"].server.updateVectorSource(instanceId, sourceId, properties.Name, properties.FormatId, properties.Url, properties.LoadingStrategy,
                properties.UseSpatialIndex);
            break;
        default:
            break;
    }
}

gdo.net.app["Maps"].removeSource = function (instanceId, sourceId) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Removing Source: ' + sourceId);
    gdo.net.instance[instanceId].sources[sourceId] = null;
}