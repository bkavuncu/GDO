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

gdo.net.app["Maps"].Source = function (instanceId, sourceId, deserializedSource) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Adding Source :' + deserializedLayer.Id);
    var source = {};
    gdo.net.instance[instanceId].sources[sourceId] = source;
    gdo.net.app["Maps"].editSource(instanceId, sourceId, deserializedSource);
}

gdo.net.app["Maps"].editSource = function(instanceId, sourceId, deserializedSource) {
    var source = gdo.net.instance[instanceId].sources[sourceId];
    switch (deserializedSource.Type) {
    case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.BingMaps:
        source = new ol.source.BingMaps({
            key: deserializedSource.Key,
            imagerySet: deserializedSource.ImagerySet,
            culture: deserializedSource.Culture,
            maxZoom: deserializedSource.MaxZoom
        });
        break;
    case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.Cluster:
        source = new ol.source.Cluster({
            distance: deserializedSource.Distance,
            extent: deserializedSource.Extent,
            format: gdo.net.instance[instanceId].formats[deserializedSource.Format.Id],
            source: gdo.net.instance[instanceId].sources[deserializedSource.VectorSource.Id]
        });
        break;
    case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.ImageStatic:
        source = new ol.source.ImageStatic({
            imageExtent: deserializedSource.Extent,
            imageSize: [deserializedSource.Width, deserializedSource.Height],
            url: deserializedSource.URL
        });
        break;
    case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.ImageVector:
        source = new ol.source.ImageVector({
            ratio: deserializedSource.Ratio,
            source: gdo.net.instance[instanceId].sources[deserializedSource.VectorSource.Id],
            style: gdo.net.instance[instanceId].styles[deserializedSource.Style.Id]
        });
        break;
    case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.TileImage:
        var tileGrid = new ol.tilegrid.TileGrid({
            extent: deserializedSource.TileGrid.Extent,
            minZoom: deserializedSource.TileGrid.MinZoom,
            maxZoom: deserializedSource.TileGrid.MaxZoom,
            resolutions: deserializedSource.TileGrid.Resolutions,
            tileSize: [deserializedSource.TileGrid.Width, deserializedSource.TileGrid.Height]
        });
        source = new ol.source.TileImage({
            tileGrid: tileGrid,
            opaque: deserializedSource.Opaque
        });
        break;
    case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.TileJSON:
        source = new ol.source.TileJSON({
            url: deserializedSource.Url,
            crossOrigin: deserializedSource.CrossOrigin
        });
        break;
    case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.TileVector:
        var tileGrid = new ol.tilegrid.TileGrid({
            extent: deserializedSource.TileGrid.Extent,
            minZoom: deserializedSource.TileGrid.MinZoom,
            maxZoom: deserializedSource.TileGrid.MaxZoom,
            resolutions: deserializedSource.TileGrid.Resolutions,
            tileSize: [deserializedSource.TileGrid.Width, deserializedSource.TileGrid.Height]
        });
        source = new ol.source.TileVector({
            format: gdo.net.instance[instanceId].formats[deserializedSource.Format.Id],
            projection: deserializedSource.Projection,
            tileGrid: tileGrid,
            url: deserializedSource.Url
        });
        break;
    case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.Vector:
        source = new ol.source.Vector({
            format: gdo.net.instance[instanceId].formats[deserializedSource.Format.Id],
            url: deserializedSource.Url,
            strategy: deserializedSource.LoadingStrategy,
            useSpatialIndex: deserializedSource.UseSpatialIndex
        });
        break;
    default:
        break;
    }
    source.id = deserializedSource.Id;
    source.name = deserializedSource.Name;
    source.type = deserializedSource.Type;
    source.properties = deserializedSource;
}

gdo.net.app["Maps"].requestSource = function (instanceId, sourceId) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Requesting Source :' + sourceId);
    gdo.net.app["Maps"].server.requestSource(instanceId, sourceId);
}

//TODO IMPORTANT properties that can not be read and created internally will not be reflected to server, these have to ignorned on the client and 
//TODO and let the ol create them internally again instead of writing a null value.

gdo.net.app["Maps"].updateSource = function (instanceId, sourceId, isNew) {
    var source = gdo.net.instance[instanceId].source[sourceId].json;
    var type = gdo.net.instance[instanceId].source[sourceId].type;
    if (isNew) {
        sourceId = -1;
    }
    switch (type) {
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.BingMaps:
            gdo.net.app["Maps"].server.updateSource(instanceId, sourceId, source.Name, source.Culture, source.Key, source.ImagerySet, source.MaxZoom);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.Cluster:
            gdo.net.app["Maps"].server.updateSource(instanceId, sourceId, source.Name, source.Distance, source.Extent, source.FormatId, source.VectorSourceId);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.ImageStatic:
            gdo.net.app["Maps"].server.updateSource(instanceId, sourceId, source.Name, source.Width, source.Height, source.Url, source.Extent);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.ImageVector:
            gdo.net.app["Maps"].server.updateSource(instanceId, sourceId, source.Name, source.VectorSourceId, source.StyleId, source.Ratio);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.TileImage:
            gdo.net.app["Maps"].server.updateSource(instanceId, sourceId, source.Name, source.Opaque, source.Extent, source.MinZoom, source.MaxZoom,
                source.TileWidth, source.TileHeight, source.Resolutions);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.TileJSON:
            gdo.net.app["Maps"].server.updateSource(instanceId, sourceId, source.Name, source.Url, source.CrossOrigin);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.TileVector:
            gdo.net.app["Maps"].server.updateSource(instanceId, sourceId, source.Name, source.Projection, source.Url, source.Extent, source.FormatId,
                source.MinZoom, source.MaxZoom, source.TileWidth, source.TileHeight, source.Resolutions);
            break;
        case gdo.net.app["Maps"].SOURCE_TYPES_ENUM.Vector:
            gdo.net.app["Maps"].server.updateSource(instanceId, sourceId, source.FormatId, source.Url, source.LoadingStrategy, source.UseSpatialIndex);
            break;
        default:
            break;
    }
}

gdo.net.app["Maps"].removeSource = function (instanceId, sourceId) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Removing Source :' + sourceId);
    gdo.net.instance[instanceId].map.removeSource(gdo.net.instance[instanceId].sources[sourceId]);
    gdo.net.instance[instanceId].sources[sourceId] = null;
}