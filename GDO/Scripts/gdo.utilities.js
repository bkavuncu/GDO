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

function waitForResponse(func, check, delay, repeat, msg) {
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
            setTimeout(function () { waitForResponse(func, check, delay, repeat - 1, msg); }, delay);
            return;
        } else {
            consoleOut('', 3, msg);
            return;
        }
    } else {
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
    return (false);
}

function consoleOut(module, type, msg) {
    /// <summary>
    /// JS Console Output.
    /// </summary>
    /// <param name="module">The module.</param>
    /// <param name="type">The type.</param>
    /// <param name="msg">The MSG.</param>
    /// <returns></returns>
    if (type == 1) {
        if ($("#message_log").length > 0) {
            $("#message_log").append('GDO' + module + '- INFO: ' + msg + "&#10;").scrollTop($("#message_log")[0].scrollHeight);
        }
        console.log('GDO' + module + ': ' + msg);
    } else if (type == 2) {
        if ($("#message_log").length > 0) {
            $("#message_log").append('<b>GDO' + module + '- WARN: ' + msg + "</b>&#10;").scrollTop($("#message_log")[0].scrollHeight);
        }
        console.warn('GDO' + module + ': ' + msg);
    } else if (type == 3) {
        if ($("#message_log").length > 0) {
            $("#message_log").append('<b>GDO' + module + '- ERROR: ' + msg + "</b>&#10;").scrollTop($("#message_log")[0].scrollHeight);
        }
        console.error('GDO' + module + ': ' + msg);
    }
}
