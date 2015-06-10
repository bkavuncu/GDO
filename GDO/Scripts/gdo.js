var gdo;

$(function () {
    var isControlClient;
    var isManagementClient;
    if (isControlClient) {
        gdo.id = getUrlVar("sectionID");
        $.connection.hub.start().done(function () {
            gdo.net = initHub($.connection.gdoHub);
        })
    } else if (isManagementClient) {
        $.connection.hub.start().done(function () {
            gdo.net = initHub($.connection.gdoHub);
        })
    } else {
        gdo.id = getUrlVar("clientID");
        $.connection.hub.start().done(function () {
            gdo.net = initNet($.connection.gdoHub);
        })
    }
    
    //TODO node close connections
    //TODO node send data to peer directly
    //TODO send data to through server
    // send data (data, mode)
})

function consoleOut(module, type, msg) {
    console.log('[GDO|' + module + '] '+type+':' + msg);
}

//init net
//init fs

// gdo.net  = net
// gdo.fs = fs;
// gdo.dis = dis;