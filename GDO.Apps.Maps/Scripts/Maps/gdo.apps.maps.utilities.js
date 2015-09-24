//Array of Options with properties

gdo.net.app["Maps"].optionConstructor = function (properties) {
    var options = {}
    for (i = 0; i < properties.length; i++) {
        if (values[i] == null || typeof values[i] == "undefined") {
            eval("options." + properties[i][0] + "=" + properties[i][1]);
        }
    }
    return options;
}

gdo.net.app["Maps"].optionChecker = function (properties) {
    var check = true;
    var options = {}
    for (i = 0; i < properties.length; i++) {
        if (values[i] == null || typeof values[i] == "undefined") {
            check = false;
        }
    }
    return check;
}