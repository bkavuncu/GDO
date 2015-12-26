$(function () {
    gdo.consoleOut('.WebGL', 1, 'Loaded WebGL JS');

    $.connection.webGLAppHub.client.receiveMousePosition = function (instanceId, mouseX, mouseY) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.WebGL', 1, 'Instance - ' + instanceId + ": Received MousePos : " + mouseX + "," + mouseY);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.WebGL', 1, 'Instance - ' + instanceId + ": Received MousePos : " + mouseX + "," + mouseY);
        }
    }
});

gdo.net.app["WebGL"].initClient = function () {
    var instanceId = gdo.net.node[gdo.clientId].appInstanceId;

    gdo.consoleOut('.WebGL', 1, 'Initializing WebGL App Client at Node ' + gdo.clientId);
}

gdo.net.app["WebGL"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.consoleOut('.WebGL', 1, 'Initializing WebGL App Control at Instance ' + gdo.controlId);
}

gdo.net.app["WebGL"].terminateClient = function () {
    gdo.consoleOut('.WebGL', 1, 'Terminating WebGL App Client at Node ' + clientId);
}

gdo.net.app["WebGL"].ternminateControl = function () {
    gdo.consoleOut('.WebGL', 1, 'Terminating WebGL App Control at Instance ' + gdo.controlId);
}
