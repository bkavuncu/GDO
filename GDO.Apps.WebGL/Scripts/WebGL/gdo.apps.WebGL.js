var camera;
var cameraRotationOffset;

var toggleStats;

$(function () {
    gdo.consoleOut('.WebGL', 1, 'Loaded WebGL JS');

    $.connection.webGLAppHub.client.receiveCameraPosition = function (instanceId, newCamera) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.WebGL', 1, 'Instance - ' + instanceId + ": Received CameraPos : " + JSON.stringify(newCamera));
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //gdo.consoleOut('.WebGL', 1, 'Instance - ' + instanceId + ": New camera: " + JSON.stringify(newCamera));

            if (camera !== undefined) {
                camera.position.copyFromFloats(newCamera.position[0], newCamera.position[1], newCamera.position[2]);

                camera.rotation.y = newCamera.rotation[1] + cameraRotationOffset.y;
                camera.rotation.x = newCamera.rotation[0];// * Math.cos(newCamera.rotation[1]);
                //camera.upVector.copyFromFloats(0,
                //                                        Math.cos(newCamera.rotation[0]),
                //                                        Math.sin(newCamera.rotation[0]) * Math.sin(ncameraRotationOffset.y));
            }
        }
    }

    $.connection.webGLAppHub.client.collectStats = function (instanceId, collectStats) {
        toggleStats(collectStats);
    };
});

gdo.net.app["WebGL"].initClient = function (cameraParam, cameraRotationOffsetParam) {
    var instanceId = gdo.net.node[gdo.clientId].appInstanceId;
    gdo.consoleOut('.WebGL', 1, 'Initializing WebGL App Client at Node ' + gdo.clientId);

    camera = cameraParam;
    cameraRotationOffset = cameraRotationOffsetParam;
    gdo.consoleOut('.WebGL', 1, 'Rotation Offset: ' + JSON.stringify(cameraRotationOffset));
}

gdo.net.app["WebGL"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.consoleOut('.WebGL', 1, 'Initializing WebGL App Control at Instance ' + gdo.controlId);
}

gdo.net.app["WebGL"].setToggleStatsFunction = function (toggleStatsParam) {
    toggleStats = toggleStatsParam;
}

gdo.net.app["WebGL"].terminateClient = function () {
    gdo.consoleOut('.WebGL', 1, 'Terminating WebGL App Client at Node ' + clientId);
}

gdo.net.app["WebGL"].ternminateControl = function () {
    gdo.consoleOut('.WebGL', 1, 'Terminating WebGL App Control at Instance ' + gdo.controlId);
}
