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
            return eval(object.Value);
            break;
        case gdo.net.app["Maps"].PARAMETER_TYPES_ENUM.JSON:
            return JSON.parse(object.Value);
            break;
        case gdo.net.app["Maps"].PARAMETER_TYPES_ENUM.Object:
            if (object.Value >= 0) {
                return eval("gdo.net.instance[" + instanceId + "]." + object.LinkedParameter + "[" + object.Value + "]");
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

gdo.net.app["Maps"].addObject = function (instanceId, objectType, objectId, deserializedObject) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Adding ' + objectType + ': ' + deserializedObject.Id.Value);
    if (gdo.net.app["Maps"].index[objectType] <= deserializedObject.Id.Value) {
        gdo.net.app["Maps"].index[objectType] = deserializedObject.Id.Value;
    }
    var object = {};
    var properties = [];
    var options = {};
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
    }
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
        if (deserializedObject[index].IsProperty && deserializedObject[index].IsEditable && deserializedObject[index].Priority >= 0 && !deserializedObject[index].IsNull) {
            gdo.net.app["Maps"].setExceptNull("gdo.net.instance[" + instanceId + "]." + objectType + "s[" + deserializedObject.Id.Value + "]", ("set" + upperCaseFirstLetter(deserializedObject[index].PropertyName)), gdo.net.app["Maps"].prepareProperty(instanceId, deserializedObject[index], deserializedObject[index].ParameterType, deserializedObject[index].VariableType));
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
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Uploading ' + objectType + ': ' + object.properties.Id);
    var properties = object.properties;
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
            properties.ZIndex.Value = temp+1;
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
            gdo.net.instance[instanceId].layers[i].changed();
        }
    }
}