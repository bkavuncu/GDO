var gdo;

function initGDO() {
    consoleOut('GDO', 'INFO', 'Initializing GDO');
    loadModule('net');
    //loadModule('fs');
    gdo = {};
    gdo.net = {};
    gdo.id = getUrlVar('clientID');
    if (gdo.id > 0) {
        $.connection.hub.start().done(function() {
            gdo.net = initNet();
            consoleOut('GDO', 'INFO', 'GDO Initialized');
            gdo.net.server.requestAppList();
            gdo.net.listener.receiveAppList = function (serializedAppList) {
                deserializedAppList = JSON.parse(serializedAppList);
                foreach(app in deserializedAppList)
                {
                    loadModule(app);
                }
            }
        });
    }
    //TODO node close connections
    //TODO node send data to peer directly
    //TODO send data to through server
    // send data (data, mode)
}

function consoleOut(module, type, msg) {
    console.log('[GDO|' + module + '] '+type+' : ' + msg);
}

function loadModule(js) {
    var $head = $('head');
    $head.append('<script type=\'text/javascript\' src=\'../../scripts/gdo.' + js + '.js\'></script>');
    consoleOut('MAIN', 'INFO', 'Loaded Module ' + js);
}

function getUrlVar(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair[0] === variable) { return pair[1]; }
    }
    return (false);
}