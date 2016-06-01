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

gdo.net.app["Maps"].addObject = function (instanceId, objectType, objectId, deserializedObject) {
    gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Adding '+ objectType +' :' + deserializedObject.Id.Value);
    if (gdo.net.app["Maps"].index[objectType] <= deserializedObject.Id.Value) {
        gdo.net.app["Maps"].index[objectType] = deserializedObject.Id.Value;
    }
    var object;
    var properties;
    var options = {};
    
    for (var index in gdo.net.node) {
        if (!gdo.net.node.hasOwnProperty((index))) {
            continue;
        }
        if (gdo.net.node[index].connectedToPeer) {
            connectedNodes[i] = gdo.net.node[index].id;
            i++;
        }
    }
}

gdo.net.app["Maps"].updateObject = function (instanceId, objectType, objectId, deserializedObject) {

}

gdo.net.app["Maps"].requestObject = function (instanceId, objectType, objectId) {

}

gdo.net.app["Maps"].uploadObject = function (instanceId, objectType, objectId, isNew) {

}

gdo.net.app["Maps"].removeObject = function (instaneId, objectType, objectId) {

}