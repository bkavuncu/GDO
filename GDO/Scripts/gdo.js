var gdo;

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
    gdo = {};
    gdo.net = {};
    gdo.clientMode = clientMode;
    gdo.clientId = getUrlVar('clientId');
    $("title").append(" :" + gdo.clientId);
    gdo.updateInterval = 14000;

    if (gdo.clientMode == CLIENT_MODE.CONTROL) {
        gdo.nodeId = 1;
    }
    if (gdo.clientId > 0) {
        $.connection.hub.start().done(function() {
            consoleOut('', 1, 'Hub Started');
            gdo.net = initNet(clientMode);
            if (gdo.clientMode == CLIENT_MODE.NODE) {
                waitForResponse(initApp, isPeerJSServerResponded, 500, 20, 'PeerJS server failed to Respond');
                setInterval(uploadNodeInfo, gdo.updateInterval);
            } else if (gdo.clientMode == CLIENT_MODE.CONTROL) {
                waitForResponse(initApp, isSignalRServerResponded, 50, 20, 'SignalR server failed to Respond');
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

