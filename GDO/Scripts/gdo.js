///<reference path="~/jasmine.js"/>

$(function () {
    loadModule("net");
    loadModule("fs");
    this.id = getUrlVar("clientID");
    $.connection.hub.start().done(function () {
        gdo.net = initNet(gdo.id);
    })
    this.net.server.requestAppList();
    this.net.listener.receiveAppList = function (serializedAppList) {
        deserializedAppList = JSON.parse(serializedAppList);
        foreach(app in deserializedAppList)
        {
            loadModule(app);
        }
    }
    //TODO node close connections
    //TODO node send data to peer directly
    //TODO send data to through server
    // send data (data, mode)
})

function consoleOut(module, type, msg) {
    console.log('[GDO|' + module + '] '+type+':' + msg);
}

function loadModule(js) {
    var $head = $("head");
    $head.append("<script src=\"scripts/gdo." + js + "\" type=\"text/javascript\"></scr" + "ipt>");
}

