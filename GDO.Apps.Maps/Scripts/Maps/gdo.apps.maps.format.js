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

gdo.net.app["Maps"].newFormat = function(instanceId, formatId, deserializedFormat) {
    //TODO create a new format

    // properties 
}

gdo.net.app["Maps"].addFormat = function (instanceId, formatId, deserializedFormat) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Adding Format :' + deserializedFormat.Id.Value);
    if (gdo.net.app["Maps"].index["format"] <= deserializedFormat.Id.Value) {
        gdo.net.app["Maps"].index["format"] = deserializedFormat.Id.Value;
    }
    var format;
    var properties;
    var options = {};
    switch (deserializedFormat.Type.Value) {
        case gdo.net.app["Maps"].FORMAT_TYPES_ENUM.EsriJSON:
            properties = [
                ["geometryName", deserializedFormat.GeometryName.Value]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            format = new ol.format.EsriJSON(options);
            break;
        case gdo.net.app["Maps"].FORMAT_TYPES_ENUM.GeoJSON:
            properties = [
                ["geometryName", deserializedFormat.GeometryName.Value]
                ["defaultDataProjection", deserializedFormat.DefaultDataProjection.Value]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            format = new ol.format.GeoJSON(options);
            break; 
        case gdo.net.app["Maps"].FORMAT_TYPES_ENUM.GML:
            properties = [
                ["srsName", deserializedFormat.SrsName.Value],
                ["surface", deserializedFormat.Surface.Value],
                ["curve", deserializedFormat.Curve.Value],
                ["multiCurve", deserializedFormat.MultiCurve.Value],
                ["multiSurface", deserializedFormat.MultiSurface.Value],
                ["schemaLocation", deserializedFormat.SchemaLocation.Value]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            format = new ol.format.GML(options);
            break; 
        case gdo.net.app["Maps"].FORMAT_TYPES_ENUM.GML2:
            properties = [
                ["srsName", deserializedFormat.SrsName.Value],
                ["surface", deserializedFormat.Surface.Value],
                ["curve", deserializedFormat.Curve.Value],
                ["multiCurve", deserializedFormat.MultiCurve.Value],
                ["multiSurface", deserializedFormat.MultiSurface.Value],
                ["schemaLocation", deserializedFormat.SchemaLocation.Value]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            format = new ol.format.GML2(options);
            break;
        case gdo.net.app["Maps"].FORMAT_TYPES_ENUM.GML3:
            properties = [
                ["srsName", deserializedFormat.SrsName.Value],
                ["surface", deserializedFormat.Surface.Value],
                ["curve", deserializedFormat.Curve.Value],
                ["multiCurve", deserializedFormat.MultiCurve.Value],
                ["multiSurface", deserializedFormat.MultiSurface.Value],
                ["schemaLocation", deserializedFormat.SchemaLocation.Value]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            format = new ol.format.GML3(options);
            break;
        case gdo.net.app["Maps"].FORMAT_TYPES_ENUM.KML:
            properties = [
                ["extractStyles", deserializedFormat.ExtractStyles.Value]
                ["showPointNames", deserializedFormat.ShowPointNames.Value]
                ["defaultStyle", gdo.net.instance[instanceId].styles[deserializedFormat.DefaultStyleId.Value]]
            ];
            options = gdo.net.app["Maps"].optionConstructor(properties);
            format = new ol.format.KML(options);
            break; 
        default:
            gdo.consoleOut('.Maps', 5, 'Instance ' + instanceId + ': Invalid Format Type:' + deserializedFormat.Type.Value + ' for Format ' + deserializedFormat.Id.Value);
            break;
    }
    gdo.net.instance[instanceId].formats[formatId] = format;
    format.properties = deserializedFormat;
    format.properties.isInitialized = true;
    gdo.net.app["Maps"].drawListTables(instanceId);
}


gdo.net.app["Maps"].updateFormat = function (instanceId, formatId, deserializedFormat) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Updating Format :' + deserializedFormat.Id.Value);
    switch (deserializedFormat.Type.Value) {
        case gdo.net.app["Maps"].FORMAT_TYPES_ENUM.EsriJSON:
            break;
        case gdo.net.app["Maps"].FORMAT_TYPES_ENUM.GeoJSON:
            break;
        case gdo.net.app["Maps"].FORMAT_TYPES_ENUM.GML:
            break;
        case gdo.net.app["Maps"].FORMAT_TYPES_ENUM.GML2:
            break;
        case gdo.net.app["Maps"].FORMAT_TYPES_ENUM.GML3:
            break;
        case gdo.net.app["Maps"].FORMAT_TYPES_ENUM.KML:
            break;
        default:
            gdo.consoleOut('.Maps', 5, 'Instance ' + instanceId + ': Invalid Format Type:' + deserializedFormat.Type.Value + ' for Format ' + deserializedFormat.Id.Value);
            break;
    }
    gdo.net.app["Maps"].drawListTables(instanceId);
}


gdo.net.app["Maps"].requestFormat = function (instanceId, formatId) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Requesting format: ' + formatId);
    gdo.net.app["Maps"].server.requestFormat(instanceId, formatId);
}

gdo.net.app["Maps"].uploadFormat = function (instanceId, formatId, isNew) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Uploading Format: ' + formatId);
    var format = gdo.net.instance[instanceId].format[formatId];
    var properties = format.properties;
    if (isNew) {
        gdo.net.app["Maps"].server.addFormat(instanceId, parseInt(properties.Type.Value), JSON.stringify(properties));
    } else {
        gdo.net.app["Maps"].server.updateFormat(instanceId, formatId, parseInt(properties.Type.Value), JSON.stringify(properties));
    }
}

gdo.net.app["Maps"].removeFormat = function(instanceId, formatId) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Removing Format: ' + formatId);
    gdo.net.instance[instanceId].formats[formatId] = null;
    if (gdo.net.app["Maps"].selected["format"] == formatId) {
        gdo.net.app["Maps"].selected["format"] = -1;
    }
    gdo.net.app["Maps"].drawListTables(instanceId);

}