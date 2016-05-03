var babylonSetup;

$(function () {
    gdo.consoleOut('.WebGL', 1, 'Loaded WebGL JS');

    $.connection.webGLAppHub.client.receiveCameraPosition = function (instanceId, newCamera) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.WebGL', 1, 'Instance - ' + instanceId + ": Received New Camera Position : " + JSON.stringify(newCamera));
        }            
        
        if (babylonSetup !== undefined) {
            babylonSetup.updateCameraPosition(newCamera);
        } else {
            gdo.consoleOut('.WebGL', 1, 'Instance - ' + instanceId + ": Received camera position but not ready to use it");
        }
    }

    $.connection.webGLAppHub.client.receiveNewPerformanceData = function (instanceId, data) {
        gdo.consoleOut('.WebGL', 1, 'Instance - ' + instanceId + ": Received new performance data");

        for (var nodeId in data) {
            // skip loop if the property is from prototype
            if (!data.hasOwnProperty(nodeId)) continue;

            babylonSetup.addPerformanceData(nodeId, data[nodeId]);
        }
    }

    $.connection.webGLAppHub.client.collectStats = function (instanceId, collectStats) {
        babylonSetup.collectStats(collectStats);
    };
});

gdo.net.app["WebGL"].initClient = function (babylonSetupParam) {
    gdo.consoleOut('.WebGL', 1, 'Initializing WebGL App Client at Node ' + gdo.clientId);

    babylonSetup = babylonSetupParam;
}

gdo.net.app["WebGL"].initControl = function (babylonSetupParam) {
    gdo.controlId = getUrlVar("controlId");
    gdo.consoleOut('.WebGL', 1, 'Initializing WebGL App Control at Instance ' + gdo.controlId);

    babylonSetup = babylonSetupParam;
}

gdo.net.app["WebGL"].terminateClient = function () {
    gdo.consoleOut('.WebGL', 1, 'Terminating WebGL App Client at Node ' + clientId);
}

gdo.net.app["WebGL"].ternminateControl = function () {
    gdo.consoleOut('.WebGL', 1, 'Terminating WebGL App Control at Instance ' + gdo.controlId);
}

gdo.net.app["WebGL"].receiveMesh = function (data) {
    gdo.consoleOut('.WebGL', 1, 'Adding new mesh');
    babylonSetup.addMeshToScene(data);
}

gdo.net.app["WebGL"].receiveMaterials = function (data) {
    gdo.consoleOut('.WebGL', 1, 'Adding new materials');
    babylonSetup.addMaterialsToScene(data);
}
