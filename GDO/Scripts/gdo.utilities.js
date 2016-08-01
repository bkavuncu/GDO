function upperCaseFirstLetter(string) {
    /// <summary>
    /// Capitialize the string
    /// </summary>
    /// <param name="string">The string.</param>
    /// <returns></returns>
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function lowerCaseFirstLetter(string) {
    /// <summary>
    /// Lowers the first letter case.
    /// </summary>
    /// <param name="string">The string.</param>
    /// <returns></returns>
    return string.charAt(0).toLowerCase() + string.slice(1);
}

function waitForResponse( func, check, delay, repeat, msg) {
    /// <summary>
    /// Waits for a check and then executes the function
    /// </summary>
    /// <param name="func">The function.</param>
    /// <param name="check">The check.</param>
    /// <param name="delay">The delay.</param>
    /// <param name="repeat">The repeat.</param>
    /// <param name="msg">The MSG.</param>
    /// <returns></returns>
    if (!check()) {
        if (repeat > 0) {
            setTimeout(function () { waitForResponse( func, check, delay, repeat - 1, msg); }, delay);
            return;
        } else {
            gdo.consoleOut('', 5, msg);
            return;
        }
    } else {
        //eval(""+func+"();");
        func();
    }
}

function contains(a, obj) {
    /// <summary>
    /// Determines whether a contains obj.
    /// </summary>
    /// <param name="a">a.</param>
    /// <param name="obj">The object.</param>
    /// <returns></returns>
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;

}

function getUrlVar(variable) {
    /// <summary>
    /// Gets the URL variable.
    /// </summary>
    /// <param name="variable">The variable.</param>
    /// <returns></returns>
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair[0] === variable) { return pair[1]; }
    }
    if (typeof window.frames['control_frame_content'] == "undefined") {
        return false;
    } else {
        query = window.frames['control_frame_content'].location.search.substring(1);
        vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (pair[0] === variable) { return pair[1]; }
        }
    }
    return (false);
}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.frames['control_frame_content'].location.search.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function timeStamp() {
    var now = new Date();
    var date = [now.getMonth() + 1, now.getDate(), now.getFullYear()];
    var time = [now.getHours(), now.getMinutes(), now.getSeconds()];
    var suffix = (time[0] < 12) ? "AM" : "PM";
    time[0] = (time[0] < 12) ? time[0] : time[0] - 12;
    time[0] = time[0] || 12;
    for (var i = 1; i < 3; i++) {
        if (time[i] < 10) {
            time[i] = "0" + time[i];
        }
    }
    return date.join("/") + " " + time.join(":") + " " + suffix;
}

function readTimeStamp(str) {
    //'1990-10-30 17:32:01:000'
    //'01234567890123456789012'
    var timestamp = [];
    timestamp[0] = parseInt(str.slice(0, 4));
    timestamp[1] = parseInt(str.slice(5, 7));
    timestamp[2] = parseInt(str.slice(8, 9));
    timestamp[3] = parseInt(str.slice(11, 13));
    timestamp[4] = parseInt(str.slice(14, 16));
    timestamp[5] = parseInt(str.slice(17, 19));
    timestamp[6] = parseInt(str.slice(20, 23));
    return timestamp;
}

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
