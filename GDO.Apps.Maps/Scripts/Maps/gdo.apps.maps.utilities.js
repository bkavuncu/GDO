var opt;
var prop;

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
    if (value != null) {
        eval("" + obj + "." + func + "(" + value + ");");
    }
}

gdo.net.app["Maps"].PARAMETER_TYPES_ENUM = {
    Variable: 0,
    Array: 1,
    Function: 2,
    JSON: 3,
    Object: 4,
};

gdo.net.app["Maps"].addObject = function (instanceId, objectType, objectId, deserializedObject) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Adding ' + objectType + ': ' + deserializedObject.Id.Value);
    if (gdo.net.app["Maps"].index[objectType] <= deserializedObject.Id.Value) {
        gdo.net.app["Maps"].index[objectType] = deserializedObject.Id.Value;
    }
    var object;
    var properties = [];
    var options = {};

    for (var index in deserializedObject) {
        if (!deserializedObject.hasOwnProperty((index))) {
            continue;
        }
        if (deserializedObject[index].IsProperty && !deserializedObject[index].IsNull) {
            switch (deserializedObject[index].ParameterType) {
                case gdo.net.app["Maps"].PARAMETER_TYPES_ENUM.Variable:
                    properties.push([deserializedObject[index].PropertyName, deserializedObject[index].Value]);
                    break
                case gdo.net.app["Maps"].PARAMETER_TYPES_ENUM.Array:
                    properties.push([deserializedObject[index].PropertyName, deserializedObject[index].Values]);
                    break;
                case gdo.net.app["Maps"].PARAMETER_TYPES_ENUM.Function:
                    properties.push([deserializedObject[index].PropertyName, eval(deserializedObject[index].Value)]);
                    break;
                case gdo.net.app["Maps"].PARAMETER_TYPES_ENUM.JSON:
                    properties.push([deserializedObject[index].PropertyName, JSON.parse(deserializedObject[index].Value)]);
                    break;
                case gdo.net.app["Maps"].PARAMETER_TYPES_ENUM.Object:
                    if (deserializedObject[index].Value >= 0) {
                        var obj = eval("gdo.net.instance[" + instanceId + "]." + deserializedObject[index].LinkedParameter + "[" + deserializedObject[index].Value + "]");
                        properties.push([deserializedObject[index].PropertyName, obj]);
                    }
                    break;
                default:
                    gdo.consoleOut('.Maps', 5, 'Instance ' + instanceId + ': Invalid Property Type:' + deserializedObject[index].ParameterType + ' for ' + deserializedObject.Name + 's property ' + deserializedObject[index].PropertyName);
                    break;
            }
        }
    }
    options = gdo.net.app["Maps"].optionConstructor(properties);
    eval("object = new " + deserializedObject.ObjectType.Value + "(options);");
    object.properties = deserializedObject;
    object.properties.isInitialized = true;
    eval("gdo.net.instance[" + instanceId + "]." + objectType + "s[" + objectId + "] = object;");
    if ('layer' == objectType) {
        eval("gdo.net.instance[" + instanceId + "].map.addLayer(gdo.net.instance[" + instanceId + "].layers[" + objectId + "])");
    }
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        gdo.net.app["Maps"].drawListTables(instanceId);
    }
}

gdo.net.app["Maps"].updateObject = function (instanceId, objectType, objectId, deserializedObject) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Updating ' + objectType + ': ' + deserializedObject.Id.Value);
    eval("var object = gdo.net.instance[" + instanceId + "]." + objectType + "s[" + deserializedObject.Id.Value + "];");
    for (var index in deserializedObject) {
        if (!deserializedObject.hasOwnProperty((index))) {
            continue;
        }
        if (deserializedObject[index].IsProperty && deserializedObject[index].IsEditable && deserializedObject[index].Priority >= 0) {
            gdo.net.app["Maps"].setExceptNull("gdo.net.instance[" + instanceId + "]." + objectType + "s[" + deserializedObject.Id.Value + "]", ("set" + upperCaseFirstLetter(deserializedObject[index].Name)), deserializedObject[index].Value);
        }
    }
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        gdo.net.app["Maps"].drawListTables(instanceId);
    }
}

gdo.net.app["Maps"].requestObject = function (instanceId, objectType, objectId) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Requesting ' + objectType + ': ' + objectId);
    eval("gdo.net.app['Maps'].server.request" + upperCaseFirstLetter(objectType) + "(" + instanceId + "," + objectId + ");");
}

gdo.net.app["Maps"].uploadObject = function (instanceId, objectType, object, isNew) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Uploading ' + objectType + ': ' + object.properties.Id);
    var properties = object.properties;
    if (isNew) {
        if (objectType == 'layer') {
            properties.ZIndex.Value = gdo.net.instance[instanceId].layers.length;
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

    eval("gdo.net.instance[" + instanceId + "]." + objectType + "s.splice(" + objectId + ",1);");

    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        if (gdo.net.app["Maps"].selected[objectType] == objectId) {
            gdo.net.app["Maps"].selected[objectType] = -1;
        }
        gdo.net.app["Maps"].drawListTables(instanceId);
    }
}