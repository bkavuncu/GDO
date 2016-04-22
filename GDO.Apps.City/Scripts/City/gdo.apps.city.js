var map;
var map3D;
var view;
var styles;
var layers;
var scene;
var terrainProvider;
var ds;

$(function () {
    gdo.consoleOut('.City', 1, 'Loaded City JS');

});

gdo.net.app["City"].initControl = function (clientId) {
  
}

gdo.net.app["City"].terminateClient = function (instanceId) {
    gdo.consoleOut('.City', 1, 'Terminating Image City Client at Node ' + instanceId);
}

gdo.net.app["City"].terminateControl = function (instanceId) {
    gdo.consoleOut('.City', 1, 'Terminating City App Control at Instance ' + instanceId);
}
