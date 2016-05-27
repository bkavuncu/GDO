function createScene (engine) {

    var scene = new BABYLON.Scene(engine);

    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(60, 250, -50), scene);
    light.intensity = 0.8;

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
        var minZ = Number.MAX_VALUE;
        var maxZ = Number.MIN_VALUE;

        meshes.forEach(function (m) {

            m.position.subtractInPlace(startPosition);
            m.scaling.x = -1;
            m.bakeCurrentTransformIntoVertices();

            var boundingInfo = m.getBoundingInfo();

            minX = Math.min(minX, boundingInfo.minimum.x);
            maxX = Math.max(maxX, boundingInfo.maximum.x);
            minZ = Math.min(minZ, boundingInfo.minimum.z);
            maxZ = Math.max(maxZ, boundingInfo.maximum.z);

            if (m.name.indexOf("Box") != -1) {
                m.checkCollisions = true;
            }
        });

        scene.executeWhenReady(function () {
            if (numDuplicates > 1) {
                var sceneWidth = (maxX - minX);
                var sceneDepth = (maxZ - minZ);

                var numWide = Math.floor(Math.sqrt(numDuplicates));

                meshes.forEach(function (m) {
                    for (var i = 0; i < numDuplicates; i++) {

                        var x = i % numWide;
                        x -= Math.floor(numWide / 2);

                        var z = Math.floor(i / numWide);
                        z -= Math.floor((numWide - 1) / 2);

                        if (x == 0 && z == 0) continue;

                        var newMesh = m.clone(m.name + "-" + i);
                        newMesh.position.x += sceneWidth * x;
                        newMesh.position.z += sceneDepth * z;
                    }
                });
            }

            loadFinishedCallback();
        });
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
            return;
        }

        if (node.connectedToPeer) {
            var conn = gdo.net.peer.connections[node.peerId][0];
            if (conn.open) {
                conn.send(stringifiedData);
                timeout = 100;
                setTimeout(sendToNextNode, timeout);
                return;
            }
        }

        recursing = true;
        sendToNextNode();
        recursing = false;
        nodesToSendTo.push(nodeId);
    }

    sendToNextNode();
}