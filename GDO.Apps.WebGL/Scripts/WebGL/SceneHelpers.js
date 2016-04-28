function createScene (engine) {

    var scene = new BABYLON.Scene(engine);
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(180, 250, 50), scene);
    light.intensity = 0.7;

    // Skybox
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.disableLighting = true;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("../../Data/WebGL/textures/skybox", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

    var skybox = BABYLON.Mesh.CreateBox("skyBox", 2000.0, scene);
    skybox.material = skyboxMaterial;
    skybox.infiniteDistance = true;
    skybox.renderingGroupId = 0;

    return scene;
}

function loadModelIntoScene(config, scene, loadFinishedCallback) {

    var numDuplicates = config.numDuplicates;

    if (numDuplicates == undefined) {
        numDuplicates = 1;
    }

    BABYLON.SceneLoader.ImportMesh("", config.serverAddress, config.fileName, scene, function (meshes) {

        var startPosition = BABYLON.Vector3.FromArray(config.startPosition);

        var minX = Number.MAX_VALUE;
        var maxX = Number.MIN_VALUE;

        meshes.forEach(function (m) {
            var boundingInfo = m.getBoundingInfo();
            minX = Math.min(minX, boundingInfo.minimum.x);
            maxX = Math.max(maxX, boundingInfo.maximum.x);

            if (m.material != undefined && m.material.name == "floor") {
                m.checkCollisions = true;
            }

            m.position.subtractInPlace(startPosition);
            m.scaling.x = -1;
            m.bakeCurrentTransformIntoVertices();

            m.showBoundingBox = true;
        });

        if (numDuplicates > 1) {
            var width = (maxX - minX) * 1.05;

            meshes.forEach(function (m) {
                for (var i = 1; i < numDuplicates; i++) {
                    var newMesh = m.clone(m.name + "-" + i);
                    newMesh.position.x += width * i;
                }
            });
        }

        loadFinishedCallback();
    });
}

function SendMaterialsToAllOtherNodes(gdo, scene, onFinishCallback) {

    var dataToSend = {};
    dataToSend.appName = "WebGL";
    dataToSend.command = "receiveMaterials";
    dataToSend.data = [];

    scene.materials.forEach(function (mat) {
        dataToSend.data.push(mat.serialize());
    });

    var stringifiedData = JSON.stringify(dataToSend);

    var sectionId = gdo.net.node[gdo.clientId].sectionId;
    var nodeMap = gdo.net.section[sectionId].nodeMap;

    var nodesToSendTo = [];

    for (var i = 0; i < nodeMap.length; i++) {
        nodesToSendTo = nodesToSendTo.concat(nodeMap[i]);
    }

    var timeout = 100;
    var recursing = false;

    function sendToNextNode() {
        if (nodesToSendTo.length == 0) {
            if (recursing) {
                if (timeout < 1500) {
                    timeout *= 2;
                }
                setTimeout(sendToNextNode, timeout);
            } else {
                onFinishCallback();
            }
            return;
        }

        var nodeId = nodesToSendTo.pop();
        var node = gdo.net.node[nodeId];

        if (nodeId == gdo.clientId) {
            sendToNextNode();
        }
        else if (node.connectedToPeer) {
            var conn = gdo.net.peer.connections[node.peerId][0];
            conn.send(stringifiedData);
            timeout = 100;
            setTimeout(sendToNextNode, timeout);
        }
        else {
            recursing = true;
            sendToNextNode();
            recursing = false;
            nodesToSendTo.push(nodeId);
        }
    }

    sendToNextNode();
}

var IMPORTER = function (scene, gdo) {
    this.scene = scene;
    this.gdo = gdo;

    this.meshesToSend = [];
    this.meshesToImport = [];

    BABYLON.SceneLoader._loggingLevel = BABYLON.SceneLoader.DETAILED_LOGGING;

    this.addMeshesToSend = function (meshes) {
        for (var i = 0; i < meshes.length; i++) {
            this.meshesToSend.push(meshes[i]);
        }
    }

    this.addMeshesToImport = function (meshes) {
        for (var i = 0; i < meshes.length; i++) {
            this.meshesToImport.push(meshes[i]);
        }
    }

    this.numToSend = 10;

    var count = 0;

    this.doWork = function () {
        count++;

        if (count > 10 && this.meshesToSend.length > 0) {
            count = 0;

            

            var objectToSend = {};
            objectToSend.appName = "WebGL";
            objectToSend.command = "receiveMesh";
            objectToSend.data = [];

            for (var num = 0; num < this.numToSend; num++) {
                var mesh = this.meshesToSend.pop();

                if (mesh != undefined && mesh.name != "skyBox") {
                    objectToSend.data.push(BABYLON.SceneSerializer.SerializeMesh(mesh));
                }
            }

            var connectedNodes = this.gdo.net.node[this.gdo.clientId].connectedNodeList;
            for (var i = 0; i < connectedNodes.length; i++) {

                //this.gdo.net.app["WebGL"].sendMesh(connectedNodes[i], this.scene.meshes[0]);

                var nodeId = connectedNodes[i];
                var conn = gdo.net.peer.connections[gdo.net.node[nodeId].peerId][0];
                // Doesn't work without being stringified for some reason
                conn.send(JSON.stringify(objectToSend));
            }
        }

        var data = this.meshesToImport.pop();
        if (data == undefined) return;

        var dataToLoad = "data:" + JSON.stringify(data);
        dataToLoad = dataToLoad.substring(0, dataToLoad.length - 1);
        dataToLoad += ", \"extension\": \".babylon?\"}";

        BABYLON.SceneLoader.ImportMesh("", "", dataToLoad, this.scene,
            function (meshes) {
                console.log("IMPORTER SUCESS");
            },
            function () { },
            function (scene, error) {
                console.log("IMPORTER ERROR: " + error)
            });
    }

}