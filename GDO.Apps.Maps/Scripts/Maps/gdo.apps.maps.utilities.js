var opt;
var prop;
var x;

gdo.net.app["Maps"].optionConstructor = function (properties) {
    var options = {}
    prop = properties;
    opt = options;
    for (var i = 0; i < properties.length; i++) {
        if (properties[i][1] != null && typeof properties[i][1] != "undefined") {
            if (typeof properties[i][1] == "string") {
                eval('options.' + properties[i][0] + '="' + properties[i][1] + '";');
            } else if (typeof properties[i][1] == "number" || typeof properties[i][1] == "boolean") {
                eval("options." + properties[i][0] + "=" + properties[i][1] + ";");
            } else {
                var obj = properties[i][1];
                eval("options." + properties[i][0] + "= obj;");
            }
        }
    }
    return options;
}

gdo.net.app["Maps"].optionChecker = function (properties) {
    var check = true;
    var options = {}
    for (var i = 0; i < properties.length; i++) {
        if (properties[i] == null || typeof properties[i] == "undefined") {
            check = false;
        }
    }
    return check;
}

gdo.net.app["Maps"].setExceptNull = function (obj, func, value) {
    if (value != null && value != 'undefined') {
        //gdo.consoleOut(".Maps",2, "Executing: " + obj + "." + func + "(" + value + ");");
        var temp = value;
        eval("" + obj + "." + func + "(temp);");
    }
}

gdo.net.app["Maps"].PARAMETER_TYPES_ENUM = {
    Variable: 0,
    Array: 1,
    Function: 2,
    JSON: 3,
    Object: 4,
};

gdo.net.app["Maps"].VARIABLE_TYPES_ENUM = {
    Boolean: 0,
    Integer: 1,
    Float: 2,
    String: 3,
};

gdo.net.app["Maps"].prepareProperty = function (instanceId, object, paramType, varType) {
    switch (paramType) {
        case gdo.net.app["Maps"].PARAMETER_TYPES_ENUM.Variable:
            switch (varType) {
                case gdo.net.app["Maps"].VARIABLE_TYPES_ENUM.Boolean:
                    return object.Value;
                    break
                case gdo.net.app["Maps"].VARIABLE_TYPES_ENUM.Integer:
                    return parseInt(object.Value);
                    break;
                case gdo.net.app["Maps"].VARIABLE_TYPES_ENUM.Float:
                    return parseFloat(object.Value);
                    break;



                case gdo.net.app["Maps"].VARIABLE_TYPES_ENUM.String:
                    return "" + object.Value;
                    break;
                default:
                    break;
            }
            break
        case gdo.net.app["Maps"].PARAMETER_TYPES_ENUM.Array:
            return object.Values.$values;
            break;
        case gdo.net.app["Maps"].PARAMETER_TYPES_ENUM.Function:
            return eval(unescape(object.Value));
            break;
        case gdo.net.app["Maps"].PARAMETER_TYPES_ENUM.JSON:
            return JSON.parse(unescape(object.Value));
            break;
        case gdo.net.app["Maps"].PARAMETER_TYPES_ENUM.Object:
            if (object.Value >= 0) {
                return eval("gdo.net.instance[" + instanceId + "]." + object.LinkedParameter + "[" + object.Value + "].object");
            }
            break;
        case gdo.net.app["Maps"].PARAMETER_TYPES_ENUM.Global:
            if (object.Value >= 0) {
                return eval("new " + object.Value + "()");
            }
            break;
        default:
            gdo.consoleOut('.Maps', 5, 'Instance ' + instanceId + ': Invalid Property Type:' + object.ParameterType + ' for ' + object.Name + 's property ' + object.PropertyName);
            break;
    }
}

gdo.net.app["Maps"].createObject = function (instanceId, objectType, objectId, deserializedObject) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Creating ' + objectType + ': ' + deserializedObject.Id.Value);
    var object = {};
    var properties = [];
    var options = {};
    var result = {};
    if (deserializedObject.ObjectType.Value != null && deserializedObject.ObjectType.Value != 'undefined') {
        for (var index in deserializedObject) {
            if (!deserializedObject.hasOwnProperty((index))) {
                continue;
            }
            if (deserializedObject[index].IsProperty && !deserializedObject[index].IsNull) {
                properties.push([deserializedObject[index].PropertyName, gdo.net.app["Maps"].prepareProperty(instanceId, deserializedObject[index], deserializedObject[index].ParameterType, deserializedObject[index].VariableType)]);
            }
        }
        options = gdo.net.app["Maps"].optionConstructor(properties);
        eval("object = new " + deserializedObject.ObjectType.Value + "(options);");
        result.object = object;
        result.properties = properties;
    }
    return result;
}

gdo.net.app["Maps"].addObject = function (instanceId, objectType, objectId, deserializedObject) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Adding ' + objectType + ': ' + deserializedObject.Id.Value);
    if (gdo.net.app["Maps"].index[objectType] <= deserializedObject.Id.Value) {
        gdo.net.app["Maps"].index[objectType] = deserializedObject.Id.Value;
    }
    var object = {};
    switch (deserializedObject.ClassName.Value) {
        case "DynamicVectorSource":
            var config = JSON.parse(unescape(deserializedObject.Config.Value));
            if (config != null) {
                var dummyProperties = jQuery.extend(true, {}, deserializedObject);
                dummyProperties.Url.Value = "../../Data/Maps/dummy.json";
                dummyProperties.Url.IsNull = false;
                object = gdo.net.app["Maps"].createObject(instanceId, objectType, objectId, dummyProperties);
                object.properties = deserializedObject;

                if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
                    object.sources = [];
                    object.timestamps = [];
                    object.sources[0] = gdo.net.app["Maps"].createObject(instanceId, objectType, objectId, dummyProperties);
                    object.sources[0].date = new Date(config.files[0].timestamp);
                    object.timestamps[0] = object.sources[0].date.getTime() - 1;
                    var i;
                    for (i = 0; i < config.files.length; i++) {
                        var tempProperties = jQuery.extend(true, {}, deserializedObject);
                        tempProperties.Url.Value = config.files[i].file;
                        tempProperties.Url.IsNull = false;
                        object.sources[i + 1] = {};
                        object.sources[i + 1] = gdo.net.app["Maps"].createObject(instanceId, objectType, objectId, tempProperties);
                        object.sources[i + 1].date = new Date(config.files[i].timestamp);
                        object.timestamps[i + 1] = object.sources[i].date.getTime();
                        object.sources[i + 1].object.loadFeatures([-10000, -10000, 10000, 10000], 1,
                        ol.proj.get('EPSG:3857'));
                    }
                    i--;
                    object.sources[i + 2] = gdo.net.app["Maps"].createObject(instanceId, objectType, objectId, dummyProperties);
                    object.sources[i + 2].date = new Date(config.files[i].timestamp);
                    object.timestamps[i + 2] = object.sources[i].date.getTime() + 1;
                }
                object.properties.isInitialized = true;
                eval("gdo.net.instance[" + instanceId + "]." + objectType + "s[" + objectId + "] = object;");
            }
            break;
            /*case "DynamicVectorLayer":
            case "DynamicHeatmapLayer":
                object = gdo.net.app["Maps"].createObject(instanceId, objectType, objectId, deserializedObject);
                /*if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
                    (function loop(i) {
                        setTimeout(function() {
                            object.setSource(gdo.net.instance[instanceId].sources[deserializedObject.Source.Value].sources[i]);
                            if (--i) loop(i);
                        }, 70);
                    })(gdo.net.instance[instanceId].sources[deserializedObject.Source.Value].sources.length);
                    object.setSource(gdo.net.instance[instanceId].sources[deserializedObject.Source.Value].sources[0]);
                }
                break;*/
        case "GeoJSONStyle":
            //var object = gdo.net.app["Maps"].createObject(instanceId, objectType, objectId, deserializedObject);
            eval("object.object = function(feature) {" +
                    "var temp;" +
                    "var properties = feature.getProperties();" +
                    "switch(feature.getGeometry().getType()) {" +
                        "case 'Point':" +
                            "if(" + deserializedObject.PointStyle.Value + ">0){" +
                                "temp = jQuery.extend(true, {}, gdo.net.instance[" + instanceId + "].styles[" + deserializedObject.PointStyle.Value + "].object)" +
                            "}" +
                            "break;" +
                        "case 'MultiPoint':" +
                            "if(" + deserializedObject.MultiPointStyle.Value + ">0){" +
                                "temp = jQuery.extend(true, {}, gdo.net.instance[" + instanceId + "].styles[" + deserializedObject.MultiPointStyle.Value + "].object)" +
                            "}" +
                            "break;" +
                        "case 'Circle':" +
                            "if(" + deserializedObject.CircleStyle.Value + ">0){" +
                                "temp = jQuery.extend(true, {}, gdo.net.instance[" + instanceId + "].styles[" + deserializedObject.CircleStyle.Value + "].object)" +
                            "}" +
                            "break;" +
                        "case 'LineString':" +
                            "if(" + deserializedObject.LineStringStyle.Value + ">0){" +
                                "temp = jQuery.extend(true, {}, gdo.net.instance[" + instanceId + "].styles[" + deserializedObject.LineStringStyle.Value + "].object)" +
                            "}" +
                            "break;" +
                        "case 'MultiLineString':" +
                            "if(" + deserializedObject.MultiLineStringStyle.Value + ">0){" +
                                "temp = jQuery.extend(true, {}, gdo.net.instance[" + instanceId + "].styles[" + deserializedObject.MultiLineStringStyle.Value + "].object)" +
                            "}" +
                            "break;" +
                        "case 'Polygon':" +
                            "if(" + deserializedObject.PolygonStyle.Value + ">0){" +
                                "temp = jQuery.extend(true, {}, gdo.net.instance[" + instanceId + "].styles[" + deserializedObject.PolygonStyle.Value + "].object)" +
                            "}" +
                           "break;" +
                        "case 'MultiPolygon':" +
                            "if(" + deserializedObject.MultiPolygonStyle.Value + ">0){" +
                                "temp = jQuery.extend(true, {}, gdo.net.instance[" + instanceId + "].styles[" + deserializedObject.MultiPolygonStyle.Value + "].object)" +
                            "}" +
                           "break;" +
                    "}" +
                    "if(temp != null){" +
                        "for(var key in properties){" +
                            "if (properties.hasOwnProperty(key)){" +
                                "var index = key.indexOf('_');" +
                                "if(index > 0){" +
                                    "var func = key.slice(index+1,100);" +
                                    "var obj = 'temp.' + key.slice(0,index) + '_';" +
                                    "var value = eval('properties.'+key);" +
                                    "eval(obj+'.set' + upperCaseFirstLetter(func)+'(\"'+value+'\");');" +
                                "}" +
                            "}" +
                        "}" +
                    "}" +
                    "return temp;" +
                "}");
            object.properties = deserializedObject;
            break;
        default:
            object = gdo.net.app["Maps"].createObject(instanceId, objectType, objectId, deserializedObject);
            break;
    }
    object.properties = deserializedObject;
    object.properties.isInitialized = true;
    eval("gdo.net.instance[" + instanceId + "]." + objectType + "s[" + objectId + "] = object;");
    if ('layer' == objectType) {
        eval("gdo.net.instance[" + instanceId + "].map.addLayer(gdo.net.instance[" + instanceId + "].layers[" + objectId + "].object)");
    }
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        gdo.net.app["Maps"].drawListTables(instanceId);
    }
}

gdo.net.app["Maps"].updateObject = function (instanceId, objectType, objectId, deserializedObject) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Updating ' + objectType + ': ' + deserializedObject.Id.Value);
    eval("var object = gdo.net.instance[" + instanceId + "]." + objectType + "s[" + deserializedObject.Id.Value + "];");
    object.properties = deserializedObject;
    object.properties.isInitialized = true;
    for (var index in deserializedObject) {
        if (!deserializedObject.hasOwnProperty((index))) {
            continue;
        }
        if (deserializedObject[index].IsProperty && deserializedObject[index].Priority >= 0 && !deserializedObject[index].IsNull) {
            gdo.net.app["Maps"].setExceptNull("gdo.net.instance[" + instanceId + "]." + objectType + "s[" + deserializedObject.Id.Value + "].object", ("set" + upperCaseFirstLetter(deserializedObject[index].PropertyName)), gdo.net.app["Maps"].prepareProperty(instanceId, deserializedObject[index], deserializedObject[index].ParameterType, deserializedObject[index].VariableType));
        }
    }
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        gdo.net.app["Maps"].drawListTables(instanceId);
    }
    gdo.net.app["Maps"].refreshMap(instanceId);
}

gdo.net.app["Maps"].requestObject = function (instanceId, objectType, objectId) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Requesting ' + objectType + ': ' + objectId);
    eval("gdo.net.app['Maps'].server.request" + upperCaseFirstLetter(objectType) + "(" + instanceId + "," + objectId + ");");
}

gdo.net.app["Maps"].uploadObject = function (instanceId, objectType, object, isNew) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Uploading ' + objectType + ': ' + object.properties.Id + " (IsNew=" + isNew + ")");
    var properties = object.properties;
    if (objectType == 'layer') {
        if (properties.IsPlaying != null && properties.IsPlaying != "undefined") {
            //properties.IsPlaying.Value = false;
        }
    }
    if (isNew) {
        if (objectType == 'layer') {
            var temp = 0;
            for (var i in gdo.net.instance[instanceId].layers) {
                if (gdo.net.instance[instanceId].layers.hasOwnProperty(i) && gdo.net.instance[instanceId].layers[i] != null && typeof gdo.net.instance[instanceId].layers[i] != "undefined") {
                    if (gdo.net.instance[instanceId].layers[i].properties.ZIndex.Value > temp) {
                        temp = gdo.net.instance[instanceId].layers[i].properties.ZIndex.Value;
                    }
                }
            }
            properties.ZIndex.Value = temp + 1;
            properties.ZIndex.IsNull = false;
            gdo.net.app['Maps'].server.addLayer(instanceId, properties.ClassName.Value, JSON.stringify(properties).replace(/'/g, "\\'"));
        } else {
            eval("gdo.net.app['Maps'].server.add" + upperCaseFirstLetter(objectType) + "(" + instanceId + ",'" + properties.ClassName.Value + "','" + JSON.stringify(properties).replace(/'/g, "\\'") + "');");
        }
    } else {
        eval("gdo.net.app['Maps'].server.update" + upperCaseFirstLetter(objectType) + "(" + instanceId + "," + properties.Id.Value + ",'" + properties.ClassName.Value + "','" + JSON.stringify(properties).replace(/'/g, "\\'") + "');");
    }
}

gdo.net.app["Maps"].removeObject = function (instanceId, objectType, objectId) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Removing ' + objectType + ': ' + objectId);
    if ('layer' == objectType) {
        eval("gdo.net.instance[" + instanceId + "].map.removeLayer(gdo.net.instance[" + instanceId + "]." + objectType + "s[" + objectId + "])");
    }

    //eval("gdo.net.instance[" + instanceId + "]." + objectType + "s.splice(" + objectId + ",1);");
    eval("gdo.net.instance[" + instanceId + "]." + objectType + "s[" + objectId + "] = null");

    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        if (gdo.net.app["Maps"].selected[objectType] == objectId) {
            gdo.net.app["Maps"].selected[objectType] = -1;
        }
        gdo.net.app["Maps"].drawListTables(instanceId);
    }
}

gdo.net.app["Maps"].refreshMap = function (instanceId) {
    for (var i in gdo.net.instance[instanceId].layers) {
        if (gdo.net.instance[instanceId].layers.hasOwnProperty(i) && gdo.net.instance[instanceId].layers[i] != null && typeof gdo.net.instance[instanceId].layers[i] != "undefined") {
            gdo.net.instance[instanceId].layers[i].object.changed();
        }
    }
}