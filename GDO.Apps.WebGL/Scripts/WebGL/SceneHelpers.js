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

function loadModelIntoScene(modelName, position, engine, scene, loadFinishedCallback, numDuplicates) {

    //var FILE_SERVER = "http://146.169.46.148/scenes/";
    var FILE_SERVER = "http://localhost/scenes/";

    if (numDuplicates == undefined) {
        numDuplicates = 1;
    }

    console.log(position);

    var count = 0;

    var onBuildingLoad = function (t) {

        t.loadedMeshes.forEach(function (m) {

            if (m.material !== undefined && m.material.id == "floor") {
                m.checkCollisions = true;
            }

            m.position.addInPlace(position);

            //m.position.x += 100 * count;
            //m.position.y -= 1.5;

            // Flip x-axis to fix blender export
            //m.scaling.x = -1;
            //m.bakeCurrentTransformIntoVertices();

            m.showBoundingBox = true;
            //m.getBoundingInfo().update(new BABYLON.Matrix());
            //if (m.material !== undefined) {
            //    m.material.backFaceCulling = false;
            //}
        });

        count++;
    };

    var loader = new BABYLON.AssetsManager(scene);

    for (var i = 0; i < numDuplicates; i++) {
        var building = loader.addMeshTask("building", "", FILE_SERVER, modelName + ".obj");
        building.onSuccess = onBuildingLoad;
    }

    loader.onFinish = function () {
        loadFinishedCallback();
    };

    loader.load();
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