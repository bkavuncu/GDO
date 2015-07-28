var gdo = {};

var CLIENT_MODE = {
    NODE: 1,
    CONTROL: 2
};

var MODULE_TYPE = {
    CORE: 1,
    APP: 2
};

$(function() {
    /// <summary>
    /// Registering Event Handlers on load
    gdo = {};
    loadModule('utilities', MODULE_TYPE.CORE);
    loadModule('net', MODULE_TYPE.CORE);
    /// </summary>
    /// <returns></returns>
});
function initGDO(clientMode) {
    /// <summary>
    /// Initializes the gdo.
    /// </summary>
    /// <returns></returns>
    consoleOut('', 1, 'Initializing GDO');
    //loadModule('fs');
    gdo.clientMode = clientMode;
    gdo.clientId = getUrlVar('clientId');
    $("title").append(" :" + gdo.clientId);
    gdo.updateInterval = 14000;

    if (gdo.clientMode == CLIENT_MODE.CONTROL) {
        gdo.nodeId = 1;
    }
    if (gdo.clientId > 0) {
        $.connection.hub.start().done(function() {
            consoleOut('', 0, 'Hub Started');
            gdo.net.initNet(clientMode);
            if (gdo.clientMode == CLIENT_MODE.NODE) {
                waitForResponse(initApp, gdo.net.isPeerJSServerResponded, 500, 20, 'PeerJS server failed to Respond');
                setInterval(gdo.net.uploadNodeInfo, gdo.updateInterval);
            } else if (gdo.clientMode == CLIENT_MODE.CONTROL) {
                waitForResponse(initApp, gdo.net.isSignalRServerResponded, 50, 20, 'SignalR server failed to Respond');
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


function loadModule(js,moduleType) {
    /// <summary>
    /// Loads the JS module.
    /// </summary>
    /// <param name="js">The js.</param>
    /// <returns></returns>
    var $head = $('head');
    //gdo.window[js] = {};
    eval("gdo." + js + " = {}");
    if (moduleType == MODULE_TYPE.CORE) {
        consoleOut('', 1, 'Loading core module ' + js + ' at ' + '../scripts/gdo.' + js + '.js\'');
        $head.append('<script type=\'text/javascript\' src=\'../scripts/gdo.' + js + '.js\'></script>');
    } else if (moduleType == MODULE_TYPE.APP) {
        consoleOut('', 1, 'Loading app module ' + js + ' at ' + '../scripts/gdo.app.' + js + '.js\'');
        $head.append('<script type=\'text/javascript\' src=\'../scripts/gdo.apps.' + js + '.js\'></script>');
    }
}

function consoleOut(module, type, msg) {
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
           moduleConsole = moduleConsole+ " ";
        }
    }
    if (type == 0) {
        if ($("#console_area").length > 0) {
            $("#console_area").append('<div style="color:green; font-size:11; font-family:Courier New, Courier, monospace;">GDO' +moduleBrowser + '- SUCCESS&nbsp;&nbsp;&nbsp;: ' + msg + "&#10;</div>").scrollTop($("#console_area")[0].scrollHeight);
        }
        console.log('GDO' +moduleConsole+ ': ' + msg);
    } if (type == 1) {
        if ($("#console_area").length > 0) {
            $("#console_area").append('<div style="color:lightskyblue; font-size:11; font-family:Courier New, Courier, monospace;">GDO' +moduleBrowser + '- IMPORTANT&nbsp;: ' + msg + "&#10;</div>").scrollTop($("#console_area")[0].scrollHeight);
        }
        console.log('GDO' +moduleConsole+ ': ' + msg);
    } if (type == 2) {
        if ($("#console_area").length > 0) {
            $("#console_area").append('<div style="color:#FFF; font-size:11; font-family:Courier New, Courier, monospace;">GDO' +moduleBrowser + '- INFO&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ' + msg + "&#10;</div>").scrollTop($("#console_area")[0].scrollHeight);
        }
        console.log('GDO' +moduleConsole+ ': ' + msg);
    } if (type == 3) {
        if ($("#console_area").length > 0) {
            $("#console_area").append('<div style="color:gray; font-size:11; font-family:Courier New, Courier, monospace;">GDO' +moduleBrowser + '- MSG&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ' + msg + "&#10;</div>").scrollTop($("#console_area")[0].scrollHeight);
        }
        console.log('GDO' +moduleConsole+ ': ' + msg);
    } else if (type == 4) {
        if ($("#console_area").length > 0) {
            $("#console_area").append('<div style="color:yellow; font-size:11; font-family:Courier New, Courier, monospace;">GDO' +moduleBrowser + '- WARN&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ' + msg + "&#10;</div>").scrollTop($("#console_area")[0].scrollHeight);
        }
        console.warn('GDO' +moduleConsole+ ': ' + msg);
    } else if (type == 5) {
        if ($("#console_area").length > 0) {
            $("#console_area").append('<div style="color:coral; font-size:11; font-family:Courier New, Courier, monospace;">GDO' +moduleBrowser + '- ERROR&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ' + msg + "&#10;</div>").scrollTop($("#console_area")[0].scrollHeight);
        }
        console.error('GDO' +moduleConsole+ ': ' + msg);
    }
}

