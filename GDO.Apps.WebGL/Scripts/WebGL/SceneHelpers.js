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

function loadModelIntoScene(engine, scene, loadFinishedCallback, numDuplicates) {

    if (numDuplicates == undefined) {
        numDuplicates = 1;
    }

    var count = 0;

    var onBuildingLoad = function (t) {
        t.loadedMeshes.forEach(function (m) {

            if (m.material !== undefined && m.material.id == "floor") {
                m.checkCollisions = true;
            }

            m.position.x += 100 * count;
            m.position.y -= 1.5;

            // Flip x-axis to fix blender export
            m.scaling.x = -1;
            m.bakeCurrentTransformIntoVertices();

            //m.showBoundingBox = true;
            //m.getBoundingInfo().update(new BABYLON.Matrix());
        });

        count++;
    };

    var loader = new BABYLON.AssetsManager(scene);

    for (var i = 0; i < numDuplicates; i++) {
        var building = loader.addMeshTask("building", "", "../../Data/WebGL/scenes/", "dsi.obj");
        building.onSuccess = onBuildingLoad;
    }

    loader.onFinish = function () {
        loadFinishedCallback();
    };

    loader.load();
}