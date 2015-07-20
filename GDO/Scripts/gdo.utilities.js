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


