var opt;
var prop;

gdo.net.app["Maps"].optionConstructor = function (properties) {
    var options = {}
    prop = properties;
    opt = options;
    for (var i = 0; i < properties.length; i++) {
        if (properties[i][1] != null && typeof properties[i][1] != "undefined") {
            if(typeof properties[i][1] == "string")
            {
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
        eval(""+obj+".func("+value+");");
    }
}

gdo.net.app["Maps"].PARAMETER_TYPES_ENUM = {
    Variable : 0,
    Array : 1,
    Function : 2,
    JSON : 3,
    Object : 4,
};

gdo.net.app["Maps"].addObject = function (instanceId, objectType, objectId, deserializedObject) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Adding '+ objectType +' :' + deserializedObject.Id.Value);
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
        if (deserializedObject[index].IsProperty) {
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
                properties.push([deserializedObject[index].PropertyName, JSON.Parse(deserializedObject[index].Value)]);
                break;
            case gdo.net.app["Maps"].PARAMETER_TYPES_ENUM.Object:
                properties.push([deserializedObject[index].PropertyName, eval("gdo.net.instance[" + instanceId + "]." + deserializedObject[index].LinkedParamater + "[" + deserializedObject[index].Value + "]")]);
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
    gdo.net.app["Maps"].drawListTables(instanceId);
}

gdo.net.app["Maps"].updateObject = function (instanceId, objectType, objectId, deserializedObject) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Updating ' + objectType + ': ' + deserializedObject.Id.Value);
    eval("var object = gdo.net.instance[" + instanceId + "]." + objectType + "s[" + deserializedObject.Id.Value + "];");
    for (var index in deserializedObject) {
        if (!deserializedObject.hasOwnProperty((index))) {
            continue;
        }
        if (deserializedObject[index].IsProperty && deserializedObject[index].IsEditable) {
            gdo.net.app["Maps"].setExceptNull(object, ("set" + upperCaseFirstLetter(deserializedObject[index].PropertyName)), deserializedObject[index].Value);
        }
    }
    gdo.net.app["Maps"].drawListTables(instanceId);
}

gdo.net.app["Maps"].requestObject = function (instanceId, objectType, objectId) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Requesting ' + objectType + ': ' + objectId);
    eval("gdo.net.app['Maps'].server.request"+upperCaseFirstLetter(objectType)+"("+instanceId+","+objectId+");");
}

gdo.net.app["Maps"].uploadObject = function (instanceId, objectType, object, isNew) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Uploading ' + objectType + ': ' + object.properties.Id);
    var properties = object.properties;
    if (isNew) {
        eval("gdo.net.app['Maps'].server.add"+upperCaseFirstLetter(objectType)+"("+instanceId+","+ properties.ClassName.Value+","+ JSON.stringify(clone(properties))+");");
    } else {
        eval("gdo.net.app['Maps'].server.update"+upperCaseFirstLetter(objectType)+"("+instanceId+","+ object.properties.Id.Value+","+ parseInt(properties.Type) +","+ JSON.stringify(properties)+");");
    }
}

gdo.net.app["Maps"].removeObject = function (instanceId, objectType, objectId) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Removing ' + objectType + ': ' + objectId);
    eval("gdo.net.instance["+instanceId+"].map.remove"+upperCaseFirstLetter(objectType)+"(gdo.net.instance["+instanceId+"]."+objectType+"s["+objectId+"])");
    eval("gdo.net.instance["+instanceId+"]."+objectType+"s["+objectId+"] = null;");
    if (gdo.net.app["Maps"].selected[objectType] == objectId) {
        gdo.net.app["Maps"].selected[objectType] = -1;
    }
}