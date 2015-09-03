﻿gdo.CLIENT_MODE = {
    NODE: 1,
    CONTROL: 2
};

gdo.MODULE_TYPE = {
    CORE: 1,
    APP: 2
};

$(function() {
    /// <summary>
    /// Registering Event Handlers on load

    /// </summary>
    /// <returns></returns>
});
gdo.initGDO = function (clientMode) {
    /// <summary>
    /// Initializes the gdo.
    /// </summary>
    /// <returns></returns>
    gdo.consoleOut('', 1, 'Initializing GDO');

    //gdo.loadModule('fs');
    gdo.loadModule('utilities', 'utilities', gdo.MODULE_TYPE.CORE);
    gdo.loadModule('net','net', gdo.MODULE_TYPE.CORE);
    gdo.clientMode = clientMode;
    gdo.clientId = getUrlVar('clientId');
    $("title").append(" :" + gdo.clientId);
    gdo.updateInterval = 21000;

    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        gdo.nodeId = 1;
    }
    if (gdo.clientId > 0) {
        $.connection.hub.start().done(function() {
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
    if (type == 0) {
        if ($("#console_area").length > 0) {
            $("#console_area").append('<div style="color:green; font-size:11; font-family:Courier New, Courier, monospace;">GDO' + moduleBrowser + '- SUCCESS&nbsp;&nbsp;&nbsp;: ' + msg + "&#10;</div>").scrollTop($("#console_area")[0].scrollHeight);
        }
        console.log('GDO' + moduleConsole + ': ' + msg);
    } if (type == 1) {
        if ($("#console_area").length > 0) {
            $("#console_area").append('<div style="color:lightskyblue; font-size:11; font-family:Courier New, Courier, monospace;">GDO' + moduleBrowser + '- IMPORTANT&nbsp;: ' + msg + "&#10;</div>").scrollTop($("#console_area")[0].scrollHeight);
        }
        console.log('GDO' + moduleConsole + ': ' + msg);
    } if (type == 2) {
        if ($("#console_area").length > 0) {
            $("#console_area").append('<div style="color:#FFF; font-size:11; font-family:Courier New, Courier, monospace;">GDO' + moduleBrowser + '- INFO&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ' + msg + "&#10;</div>").scrollTop($("#console_area")[0].scrollHeight);
        }
        console.log('GDO' + moduleConsole + ': ' + msg);
    } if (type == 3) {
        if ($("#console_area").length > 0) {
            $("#console_area").append('<div style="color:gray; font-size:11; font-family:Courier New, Courier, monospace;">GDO' + moduleBrowser + '- MSG&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ' + msg + "&#10;</div>").scrollTop($("#console_area")[0].scrollHeight);
        }
        console.log('GDO' + moduleConsole + ': ' + msg);
    } else if (type == 4) {
        if ($("#console_area").length > 0) {
            $("#console_area").append('<div style="color:yellow; font-size:11; font-family:Courier New, Courier, monospace;">GDO' + moduleBrowser + '- WARN&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ' + msg + "&#10;</div>").scrollTop($("#console_area")[0].scrollHeight);
        }
        console.warn('GDO' + moduleConsole + ': ' + msg);
    } else if (type == 5) {
        if ($("#console_area").length > 0) {
            $("#console_area").append('<div style="color:coral; font-size:11; font-family:Courier New, Courier, monospace;">GDO' + moduleBrowser + '- ERROR&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ' + msg + "&#10;</div>").scrollTop($("#console_area")[0].scrollHeight);
        }
        console.error('GDO' + moduleConsole + ': ' + msg);
    }
}

gdo.loadModule = function (submodule, module ,moduleType) {
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
            gdo.consoleOut('', 1, 'Loading app submodule ' + submodule + ' at of ' + module + ' ../scripts/' + module +  '/gdo.app.' + module + '.' + submodule + '.js\'');
            $head.append('<script type=\'text/javascript\' src=\'../scripts/' + module + '/gdo.apps.' + module + '.' + submodule + '.js\'></script>');
        }
    }
}

