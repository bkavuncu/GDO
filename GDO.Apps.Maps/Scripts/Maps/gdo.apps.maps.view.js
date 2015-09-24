gdo.net.app["Maps"].updateView = function(instanceId, viewId, deserializedView) {

}

gdo.net.app["Maps"].requestView = function (instanceId, viewId) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Requesting view: ' + viewId);
    gdo.net.app["Maps"].server.requestView(instanceId, viewId);
}

gdo.net.app["Maps"].uploadView = function(instanceId, viewId, isNew) {

}

gdo.net.app["Maps"].removeView = function (instanceId, viewId) {
    gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Removing View: ' + viewId);
    gdo.net.instance[instanceId].views[viewId] = null;
}