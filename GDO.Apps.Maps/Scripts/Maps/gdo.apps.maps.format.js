gdo.net.app["Maps"].FORMAT_TYPES_ENUM = {
    None: -1,
    Base: 0,
    EsriJSON: 1,
    Feature: 2,
    GeoJSON: 3,
    GML: 4,
    GML2: 5,
    GML3: 6,
    GMLBase: 7,
    GPX: 8,
    IGC: 9,
    JSONFeature: 10,
    KML: 11,
    OSMXML: 12,
    Polyline: 13,
    TextFeature: 14,
    TopoJSON: 15,
    WFS: 16,
    WKT: 17,
    WMSCapabilities: 18,
    WMSGetFeatureInfo: 19,
    WMTSCapabilities: 20,
    XML: 21,
    XMLFeature: 22
};


gdo.net.app["Maps"].updateFormat = function (instanceId, formatId, deserializedFormat) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Updating Format :' + deserializedFormat.Id);
    var format;
    var properties;
    var options = {};
    switch (deserializedFormat.Type) {
        case gdo.net.app["Maps"].FORMAT_TYPES_ENUM.EsriJSON:
            properties = [
                ["geometryName", deserializedFormat.GeometryName]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            format = new ol.Format.EsriJSON(options);
            break;
        case gdo.net.app["Maps"].FORMAT_TYPES_ENUM.GeoJSON:
            properties = [
                ["geometryName", deserializedFormat.GeometryName]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            format = new ol.Format.GeoJSON(options);
            break; 
        case gdo.net.app["Maps"].FORMAT_TYPES_ENUM.GML:
            properties = [
                ["featureNS", deserializedFormat.FeatureNS],
                ["featureType", deserializedFormat.FeatureType],
                ["srsName", deserializedFormat.SrsName],
                ["surface", deserializedFormat.Surface],
                ["curve", deserializedFormat.Curve],
                ["multiCurve", deserializedFormat.MultiCurve],
                ["multiSurface", deserializedFormat.MultiSurface],
                ["schemaLocation", deserializedFormat.SchemaLocation]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            format = new ol.Format.GML(options);
            break; 
        case gdo.net.app["Maps"].FORMAT_TYPES_ENUM.GML2:
            properties = [
                ["featureNS", deserializedFormat.FeatureNS],
                ["featureType", deserializedFormat.FeatureType],
                ["srsName", deserializedFormat.SrsName],
                ["surface", deserializedFormat.Surface],
                ["curve", deserializedFormat.Curve],
                ["multiCurve", deserializedFormat.MultiCurve],
                ["multiSurface", deserializedFormat.MultiSurface],
                ["schemaLocation", deserializedFormat.SchemaLocation]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            format = new ol.Format.GML2(options);
        case gdo.net.app["Maps"].FORMAT_TYPES_ENUM.GML3:
            properties = [
                ["featureNS", deserializedFormat.FeatureNS],
                ["featureType", deserializedFormat.FeatureType],
                ["srsName", deserializedFormat.SrsName],
                ["surface", deserializedFormat.Surface],
                ["curve", deserializedFormat.Curve],
                ["multiCurve", deserializedFormat.MultiCurve],
                ["multiSurface", deserializedFormat.MultiSurface],
                ["schemaLocation", deserializedFormat.SchemaLocation]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            format = new ol.Format.GML3(options);
        case gdo.net.app["Maps"].FORMAT_TYPES_ENUM.KML:
            properties = [
                ["extractStyles", deserializedFormat.ExtractStyles],
                ["defaultStyle", deserializedFormat.DefaultStyle]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            format = new ol.Format.KML(options);
            break; 
        default:
            gdo.consoleOut('.MAPS', 5, 'Instance ' + instanceId + ': Invalid Format Type:' + deserializedFormat.Type + ' for Format '  + deserializedFormat.Id);
            break;
    }
    gdo.net.instance[instanceId].formats[formatId] = format;
    format.id = deserializedFormat.Id;
    format.name = deserializedFormat.Name;
    format.type = deserializedFormat.Type;
    format.properties = deserializedFormat;
}

gdo.net.app["Maps"].requestFormat = function (instanceId, formatId) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Requesting format: ' + formatId);
    gdo.net.app["Maps"].server.requestFormat(instanceId, formatId);
}

gdo.net.app["Maps"].uploadFormat = function (instanceId, formatId, isNew) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Uploading Format: ' + formatId);
    var format = gdo.net.instance[instanceId].format[formatId];
    var properties = format.properties;
    var type = gdo.net.instance[instanceId].format[formatId].type;
    if (isNew) {
        formatId = -1;
    }
    switch (type) {
        case gdo.net.app["Maps"].FORMAT_TYPES_ENUM.EsriJSON:
            gdo.net.app["Maps"].server.updateEsriJSONFormat(instanceId, formatId, properties.Name, properties.GeometryName);
            break;
        case gdo.net.app["Maps"].FORMAT_TYPES_ENUM.GeoJSON:
            gdo.net.app["Maps"].server.updateGeoJSONFormat(instanceId, formatId, properties.Name, properties.GeometryName);
            break;
        case gdo.net.app["Maps"].FORMAT_TYPES_ENUM.GML:
            gdo.net.app["Maps"].server.updateGMLFormat(instanceId, formatId, properties.Name, type,  properties.FeatureNS, properties.FeatureType,
                properties.SrsName, properties.Surface, properties.Curve, properties.MultiCurve, properties.MultiSurface, properties.SchemaLocation);
            break;
        case gdo.net.app["Maps"].FORMAT_TYPES_ENUM.GML2:
            gdo.net.app["Maps"].server.updateGMLFormat(instanceId, formatId, properties.Name, type,  properties.FeatureNS, properties.FeatureType,
                properties.SrsName, properties.Surface, properties.Curve, properties.MultiCurve, properties.MultiSurface, properties.SchemaLocation);
            break;
        case gdo.net.app["Maps"].FORMAT_TYPES_ENUM.GML3:
            gdo.net.app["Maps"].server.updateGMLFormat(instanceId, formatId, properties.Name, type,  properties.FeatureNS, properties.FeatureType,
                properties.SrsName, properties.Surface, properties.Curve, properties.MultiCurve, properties.MultiSurface, properties.SchemaLocation);
            break;
        case gdo.net.app["Maps"].FORMAT_TYPES_ENUM.KML:
            var styleIds = [];
            var arrayLength = properties.DefaultStyle.length;
            for (var i = 0; i < arrayLength; i++) {
                styleIds.push(properties.DefaultStyle[i].Id);
            }
            gdo.net.app["Maps"].server.updateKMLFormat(instanceId, formatId, properties.Name, properties.ExtractStyles, styleIds);
            break;
        default:
            break;
    }
}

gdo.net.app["Maps"].removeFormat = function(instanceId, formatId) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Removing Format: ' + formatId);
    gdo.net.instance[instanceId].formats[formatId] = null;
}