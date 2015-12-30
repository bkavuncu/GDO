var cameraParent;


$(function () {
    gdo.consoleOut('.WebGL', 1, 'Loaded WebGL JS');

    $.connection.webGLAppHub.client.receiveCameraPosition = function (instanceId, newCamera) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.WebGL', 1, 'Instance - ' + instanceId + ": Received CameraPos : " + JSON.stringify(newCamera));
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //gdo.consoleOut('.WebGL', 1, 'Instance - ' + instanceId + ": New camera: " + JSON.stringify(newCamera));

            cameraParent.position.set(parseFloat(newCamera.Position[0]),
                                      parseFloat(newCamera.Position[1]),
                                      parseFloat(newCamera.Position[2]));
            cameraParent.quaternion.set(parseFloat(newCamera.Quaternion[0]),
                                        parseFloat(newCamera.Quaternion[1]),
                                        parseFloat(newCamera.Quaternion[2]),
                                        parseFloat(newCamera.Quaternion[3]));
            cameraParent.updateMatrix();

            //gdo.consoleOut('.WebGL', 1, 'Instance - ' + instanceId + ": New camera parent: " + JSON.stringify(cameraParent));
        }
    }
});

gdo.net.app["WebGL"].initClient = function (cameraParentParam) {
    var instanceId = gdo.net.node[gdo.clientId].appInstanceId;
    gdo.consoleOut('.WebGL', 1, 'Initializing WebGL App Client at Node ' + gdo.clientId);

    cameraParent = cameraParentParam;
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
