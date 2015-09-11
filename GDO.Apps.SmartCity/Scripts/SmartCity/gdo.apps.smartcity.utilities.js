var opt;
var prop;

gdo.net.app["SmartCity"].optionConstructor = function (properties) {
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

gdo.net.app["SmartCity"].optionChecker = function (properties) {
    var check = true;
    var options = {}
    for (var i = 0; i < properties.length; i++) {
        if (properties[i] == null || typeof properties[i] == "undefined") {
            check = false;
        }
    }
    return check;
}