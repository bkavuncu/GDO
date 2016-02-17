var threejsCameraParent;
var babylonjsCamera;


$(function () {
    gdo.consoleOut('.WebGL', 1, 'Loaded WebGL JS');

    $.connection.webGLAppHub.client.receiveThreejsCameraPosition = function (instanceId, newCamera) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.WebGL', 1, 'Instance - ' + instanceId + ": Received CameraPos : " + JSON.stringify(newCamera));
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //gdo.consoleOut('.WebGL', 1, 'Instance - ' + instanceId + ": New camera: " + JSON.stringify(newCamera));

            threejsCameraParent.position.set(newCamera.position[0], newCamera.position[1], newCamera.position[2]);
            threejsCameraParent.quaternion.set(newCamera.quaternion[0], newCamera.quaternion[1], newCamera.quaternion[2], newCamera.quaternion[3]);
            threejsCameraParent.updateMatrix();

            //gdo.consoleOut('.WebGL', 1, 'Instance - ' + instanceId + ": New camera parent: " + JSON.stringify(cameraParent));
        }
    }

    $.connection.webGLAppHub.client.receiveBabylonjsCameraPosition = function (instanceId, newCamera) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.WebGL', 1, 'Instance - ' + instanceId + ": Received CameraPos : " + JSON.stringify(newCamera));
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //gdo.consoleOut('.WebGL', 1, 'Instance - ' + instanceId + ": New camera: " + JSON.stringify(newCamera));

            babylonjsCamera.position.copyFromFloats(newCamera.position[0], newCamera.position[1], newCamera.position[2]);
            babylonjsCamera.rotation.copyFromFloats(newCamera.rotation[0], newCamera.rotation[1], newCamera.rotation[2]);
        }
    }
});

gdo.net.app["WebGL"].initThreejsClient = function (threejsCameraParentParam) {
    var instanceId = gdo.net.node[gdo.clientId].appInstanceId;
    gdo.consoleOut('.WebGL', 1, 'Initializing WebGL App Client at Node ' + gdo.clientId);

    threejsCameraParent = threejsCameraParentParam;
}

gdo.net.app["WebGL"].initBabylonjsClient = function (babylonjsCameraParam) {
    var instanceId = gdo.net.node[gdo.clientId].appInstanceId;
    gdo.consoleOut('.WebGL', 1, 'Initializing WebGL App Client at Node ' + gdo.clientId);

    babylonjsCamera = babylonjsCameraParam;
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
