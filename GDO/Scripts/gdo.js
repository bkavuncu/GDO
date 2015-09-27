gdo.CLIENT_MODE = {
    NODE: 1,
    CONTROL: 2
};

gdo.MODULE_TYPE = {
    CORE: 1,
    APP: 2
};

$(function () {
    /// <summary>
    /// Registering Event Handlers on load
    gdo.loadModule('utilities', 'utilities', gdo.MODULE_TYPE.CORE);
    /// </summary>
    /// <returns></returns>
});
gdo.initGDO = function (clientMode) {
    /// <summary>
    /// Initializes the gdo.
    /// </summary>
    /// <returns></returns>
    gdo.consoleOut('', 1, 'Initializing GDO');

    gdo.loadModule('net', 'net', gdo.MODULE_TYPE.CORE);
    gdo.clientMode = clientMode;
    //$("title").append(" :" + gdo.clientId);
    gdo.updateInterval = 21000;

    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        gdo.nodeId = 1;
        gdo.loadModule('management', 'management', gdo.MODULE_TYPE.CORE);
    } else {
        gdo.loadModule('node', 'node', gdo.MODULE_TYPE.CORE);
        gdo.loadModule('base', 'node', gdo.MODULE_TYPE.CORE);
        gdo.loadModule('maintenance', 'maintenance', gdo.MODULE_TYPE.CORE);
    }
    if (gdo.clientId > 0) {
        $.connection.hub.start().done(function () {
            gdo.consoleOut('', 0, 'Hub Started');
            gdo.net.initNet(clientMode);
            if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
                waitForResponse(initApp, gdo.net.isNodeInitialized, 500, 20, 'Node Failed to Initialize');
                setInterval(gdo.net.uploadNodeInfo, gdo.updateInterval);
            } else if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
                waitForResponse(initApp, gdo.net.isNodeInitialized, 50, 20, 'Node Failed to Initialize');
            }

            //set intervl and 
            //gdo.net.server.requestAppList();
        });
    }
    //TODO node close connections
    //TODO node send data to peer directly
    //TODO send data to through server
    // send data (data, mode)
}

gdo.consoleOut = function (module, type, msg) {
    /// <summary>
    /// JS Console Output.
    /// </summary>
    /// <param name="module">The module.</param>
    /// <param name="type">The type.</param>
    /// <param name="msg">The MSG.</param>
    /// <returns></returns>
    var moduleBrowser = module;
    var moduleConsole = module;
    if (module.length < 14) {
        for (var i = module.length; i < 14; i++) {
            moduleBrowser = moduleBrowser + "&nbsp;";
            moduleConsole = moduleConsole + " ";
        }
    }
    if ($("#console_area").text().length > 1000000) {
        $("#console_area").empty();
    }
    if (type == 0) {
        if ($("#console_area").length > 0) {
            $("#console_area").append('<div style="color:#77B200; font-size:10; font-family: monospace;">' + timeStamp() + ' - GDO' + moduleBrowser + '- SUCCESS&nbsp;&nbsp;&nbsp;: ' + msg + "&#10;</div>").scrollTop($("#console_area")[0].scrollHeight);
        }
        console.log('GDO' + moduleConsole + ': ' + msg);
    } if (type == 1) {
        if ($("#console_area").length > 0) {
            $("#console_area").append('<div style="color:#4CBFF8; font-size:10; font-family: monospace;">' + gdo.timeStamp() + ' - GDO' + moduleBrowser + '- IMPORTANT&nbsp;: ' + msg + "&#10;</div>").scrollTop($("#console_area")[0].scrollHeight);
        }
        console.log('GDO' + moduleConsole + ': ' + msg);
    } if (type == 2) {
        if ($("#console_area").length > 0) {
            $("#console_area").append('<div style="color:#FFF; font-size:10; font-family: monospace;">' + gdo.timeStamp() + ' - GDO' + moduleBrowser + '- INFO&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ' + msg + "&#10;</div>").scrollTop($("#console_area")[0].scrollHeight);
        }
        console.log('GDO' + moduleConsole + ': ' + msg);
    } if (type == 3) {
        if ($("#console_area").length > 0) {
            $("#console_area").append('<div style="color:gray; font-size:10; font-family: monospace;">' + gdo.timeStamp() + ' - GDO' + moduleBrowser + '- MSG&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ' + msg + "&#10;</div>").scrollTop($("#console_area")[0].scrollHeight);
        }
        console.log('GDO' + moduleConsole + ': ' + msg);
    } else if (type == 4) {
        if ($("#console_area").length > 0) {
            $("#console_area").append('<div style="color:#FF9900; font-size:10; font-family: monospace;">' + gdo.timeStamp() + ' - GDO' + moduleBrowser + '- WARN&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ' + msg + "&#10;</div>").scrollTop($("#console_area")[0].scrollHeight);
        }
        console.warn('GDO' + moduleConsole + ': ' + msg);
    } else if (type == 5) {
        if ($("#console_area").length > 0) {
            $("#console_area").append('<div style="color:#FF2200; font-size:10; font-family: monospace;">' + gdo.timeStamp() + ' - GDO' + moduleBrowser + '- ERROR&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ' + msg + "&#10;</div>").scrollTop($("#console_area")[0].scrollHeight);
        }
        console.error('GDO' + moduleConsole + ': ' + msg);
    }
}

gdo.loadModule = function (submodule, module, moduleType) {
    /// <summary>
    /// Loads the JS module.
    /// </summary>
    /// <param name="js">The js.</param>
    /// <returns></returns>
    var $head = $('head');
    //gdo.window[js] = {};
    //eval("gdo." + js + " = {}");
    if (moduleType == gdo.MODULE_TYPE.CORE) {

        if (submodule == module) {
            gdo.consoleOut('', 1, 'Loading core module ' + module + ' at ' + '../scripts/gdo.' + module + '.js\'');
            $head.append('<script type=\'text/javascript\' src=\'../scripts/gdo.' + module + '.js\'></script>');
        } else {
            gdo.consoleOut('', 1, 'Loading core submodule ' + submodule + ' at of ' + module + ' at ../scripts/gdo.' + module + '.' + submodule + '.js\'');
            $head.append('<script type=\'text/javascript\' src=\'../scripts/gdo.' + module + '.' + submodule + '.js\'></script>');
        }

    } else if (moduleType == gdo.MODULE_TYPE.APP) {
        if (submodule == module) {
            gdo.consoleOut('', 1, 'Loading app module ' + module + ' at ' + '../scripts/' + module + '/gdo.app.' + module + '.js\'');
            $head.append('<script type=\'text/javascript\' src=\'../scripts/' + module + '/gdo.apps.' + module + '.js\'></script>');
        } else {
            gdo.consoleOut('', 1, 'Loading app submodule ' + submodule + ' at of ' + module + ' ../scripts/' + module + '/gdo.app.' + module + '.' + submodule + '.js\'');
            $head.append('<script type=\'text/javascript\' src=\'../scripts/' + module + '/gdo.apps.' + module + '.' + submodule + '.js\'></script>');
        }
    }
}

gdo.timeStamp = function() {
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
