var gdo;


$(function() {
    //Registering Event Handlers on load
    $.connection.caveHub.client.receiveAppList = function (serializedAppList) {
        deserializedAppList = JSON.parse(serializedAppList);
        for(app in deserializedAppList)
        {
            loadModule(app);
        }
    }
});
function initGDO() {
    consoleOut('', 1, 'Initializing GDO');
    //loadModule('net');
    //loadModule('fs');
    gdo = {};
    gdo.net = {};
    gdo.id = getUrlVar('clientId');
    if (gdo.id > 0) {
        consoleOut('', 1, 'Hub Started');
        $.connection.hub.start().done(function () {
            consoleOut('', 1, 'Hub Started');
            gdo.net = initNet();
            waitForResponse(initApp,isPeerJSServerResponded, 500, 20, 'PeerJS server failed to Respond');
            setInterval(uploadNodeInfo, 7000);
            //set intervl and 
            //gdo.net.server.requestAppList();
        });
    }
    //TODO node close connections
    //TODO node send data to peer directly
    //TODO send data to through server
    // send data (data, mode)
}





function consoleOut(module, type, msg) {
    if (type == 1) {
        console.log('GDO' + module + ': ' + msg);
    } else if (type == 2) {
        console.warn('GDO' + module + ': ' + msg);
    } else if (type == 3) {
        console.error('GDO' + module + ': ' + msg);
    }
}

function loadModule(js) {
    var $head = $('head');
    $head.append('<script type=\'text/javascript\' src=\'../../scripts/gdo.' + js + '.js\'></script>');
    consoleOut('MAIN', 1, 'Loaded module ' + js);
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

function waitForResponse(func, check, delay, repeat, msg) {
    if (!check()) {
        if (repeat > 0) {
            setTimeout(function() { waitForResponse(func, check, delay, repeat - 1, msg); },delay);
            return;
        } else {
            consoleOut('', 3, msg);
            return;
        }
    } else {
        func();
    }
}