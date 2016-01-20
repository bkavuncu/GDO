$(function () {
    gdo.consoleOut('.EyeTracking', 1, 'Loaded EyeTracking JS');
    $.connection.eyeTrackingModuleHub.client.test = function (instanceId, test) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.EyeTracking', 1, 'Instance - ' + instanceId + ": In Control Mode");
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.EyeTracking', 1, 'Instance - ' + instanceId + ": In Client Mode");
        }
    }
});

gdo.net.app["EyeTracking"].initClient = function () {
    gdo.consoleOut('.EyeTracking', 1, 'Initializing EyeTracking Module Client at Node ' + gdo.clientId);
}

gdo.net.app["EyeTracking"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.consoleOut('.EyeTracking', 1, 'Initializing EyeTracking Module Control at Instance ' + gdo.controlId);
}

gdo.net.app["EyeTracking"].terminateClient = function () {
    gdo.consoleOut('.EyeTracking', 1, 'Terminating EyeTracking Module Client at Node ' + clientId);
}

gdo.net.app["EyeTracking"].ternminateControl = function () {
    gdo.consoleOut('.EyeTracking', 1, 'Terminating EyeTracking Module Control at Instance ' + gdo.controlId);
}
