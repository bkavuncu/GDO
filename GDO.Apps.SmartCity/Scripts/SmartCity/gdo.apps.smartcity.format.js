gdo.net.app["SmartCity"].FORMAT_TYPES_ENUM = {
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


gdo.net.app["SmartCity"].addFormat = function (instanceId, formatId, deserializedFormat) {
    gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Adding Format :' + deserializedFormat.Id);
    var format;
    var properties;
    var options = {};
    switch (deserializedFormat.Type) {
        case gdo.net.app["SmartCity"].FORMAT_TYPES_ENUM.EsriJSON:
            properties = [
                ["geometryName", deserializedFormat.GeometryName]
            ];
            options = gdo.net.app["SmartCity"].optionConstructor(properties);
            format = new ol.format.EsriJSON(options);
            break;
        case gdo.net.app["SmartCity"].FORMAT_TYPES_ENUM.GeoJSON:
            properties = [
                ["geometryName", deserializedFormat.GeometryName]
            ];
            options = gdo.net.app["SmartCity"].optionConstructor(properties);
            format = new ol.format.GeoJSON(options);
            break; 
        case gdo.net.app["SmartCity"].FORMAT_TYPES_ENUM.GML:
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
            options = gdo.net.app["SmartCity"].optionConstructor(properties);
            format = new ol.format.GML(options);
            break; 
        case gdo.net.app["SmartCity"].FORMAT_TYPES_ENUM.GML2:
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
            options = gdo.net.app["SmartCity"].optionConstructor(properties);
            format = new ol.format.GML2(options);
            break;
        case gdo.net.app["SmartCity"].FORMAT_TYPES_ENUM.GML3:
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
            options = gdo.net.app["SmartCity"].optionConstructor(properties);
            format = new ol.format.GML3(options);
            break;
        case gdo.net.app["SmartCity"].FORMAT_TYPES_ENUM.KML:
            properties = [
                ["extractStyles", deserializedFormat.ExtractStyles],
                ["defaultStyle", deserializedFormat.DefaultStyle]
            ];
            options = gdo.net.app["SmartCity"].optionConstructor(properties);
            format = new ol.format.KML(options);
            break; 
        default:
            gdo.consoleOut('.SmartCity', 5, 'Instance ' + instanceId + ': Invalid Format Type:' + deserializedFormat.Type + ' for Format '  + deserializedFormat.Id);
            break;
    }
    gdo.net.instance[instanceId].formats[formatId] = format;
    format.id = deserializedFormat.Id;
    format.name = deserializedFormat.Name;
    format.type = deserializedFormat.Type;
    format.properties = deserializedFormat;
}

gdo.net.app["SmartCity"].updateFormat = function (instanceId, formatId, deserializedFormat) {
    gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Updating Format :' + deserializedFormat.Id);
    switch (deserializedFormat.Type) {
        case gdo.net.app["SmartCity"].FORMAT_TYPES_ENUM.EsriJSON:
            break;
        case gdo.net.app["SmartCity"].FORMAT_TYPES_ENUM.GeoJSON:
            break;
        case gdo.net.app["SmartCity"].FORMAT_TYPES_ENUM.GML:
            break;
        case gdo.net.app["SmartCity"].FORMAT_TYPES_ENUM.GML2:
            break;
        case gdo.net.app["SmartCity"].FORMAT_TYPES_ENUM.GML3:
            break;
        case gdo.net.app["SmartCity"].FORMAT_TYPES_ENUM.KML:
            break;
        default:
            gdo.consoleOut('.SmartCity', 5, 'Instance ' + instanceId + ': Invalid Format Type:' + deserializedFormat.Type + ' for Format ' + deserializedFormat.Id);
            break;
    }
}


gdo.net.app["SmartCity"].requestFormat = function (instanceId, formatId) {
    gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Requesting format: ' + formatId);
    gdo.net.app["SmartCity"].server.requestFormat(instanceId, formatId);
}

gdo.net.app["SmartCity"].uploadFormat = function (instanceId, formatId, isNew) {
    gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Uploading Format: ' + formatId);
    var format = gdo.net.instance[instanceId].format[formatId];
    var properties = format.properties;
    var type = gdo.net.instance[instanceId].format[formatId].type;
    if (isNew) {
        switch (type) {
            case gdo.net.app["SmartCity"].FORMAT_TYPES_ENUM.EsriJSON:
                gdo.net.app["SmartCity"].server.addEsriJSONFormat(instanceId, properties.Name, properties.GeometryName);
                break;
            case gdo.net.app["SmartCity"].FORMAT_TYPES_ENUM.GeoJSON:
                gdo.net.app["SmartCity"].server.addGeoJSONFormat(instanceId, properties.Name, properties.GeometryName);
                break;
            case gdo.net.app["SmartCity"].FORMAT_TYPES_ENUM.GML:
                gdo.net.app["SmartCity"].server.addGMLFormat(instanceId, properties.Name, type, properties.FeatureNS, properties.FeatureType,
                    properties.SrsName, properties.Surface, properties.Curve, properties.MultiCurve, properties.MultiSurface, properties.SchemaLocation);
                break;
            case gdo.net.app["SmartCity"].FORMAT_TYPES_ENUM.GML2:
                gdo.net.app["SmartCity"].server.addGMLFormat(instanceId, properties.Name, type, properties.FeatureNS, properties.FeatureType,
                    properties.SrsName, properties.Surface, properties.Curve, properties.MultiCurve, properties.MultiSurface, properties.SchemaLocation);
                break;
            case gdo.net.app["SmartCity"].FORMAT_TYPES_ENUM.GML3:
                gdo.net.app["SmartCity"].server.addGMLFormat(instanceId, properties.Name, type, properties.FeatureNS, properties.FeatureType,
                    properties.SrsName, properties.Surface, properties.Curve, properties.MultiCurve, properties.MultiSurface, properties.SchemaLocation);
                break;
            case gdo.net.app["SmartCity"].FORMAT_TYPES_ENUM.KML:
                var styleIds = [];
                var arrayLength = properties.DefaultStyle.length;
                for (var i = 0; i < arrayLength; i++) {
                    styleIds.push(properties.DefaultStyle[i].Id);
                }
                gdo.net.app["SmartCity"].server.addKMLFormat(instanceId, properties.Name, properties.ExtractStyles, styleIds);
                break;
            default:
                break;
        }
    } else {
        // Not needed for now
    }
}

gdo.net.app["SmartCity"].removeFormat = function(instanceId, formatId) {
    gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Removing Format: ' + formatId);
    gdo.net.instance[instanceId].formats[formatId] = null;
}