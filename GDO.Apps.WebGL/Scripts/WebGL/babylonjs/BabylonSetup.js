BabylonSetup = function (canvas, gdo, stats) {

    this.canvas = canvas;
    this.stats = stats;
    this.gdo = gdo;

    this.createScene = function (engine) {

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

    this.loadSceneModel = function (engine, scene) {
        var loader = new BABYLON.AssetsManager(scene);

        var building = loader.addMeshTask("building", "", "../../Data/WebGL/scenes/", "noChairsZforward.obj");
        building.onSuccess = function (t) {
            t.loadedMeshes.forEach(function (m) {

                if (m.material !== undefined && m.material.id != "glass") {
                    m.checkCollisions = true;
                }

                // Flip x-axis to fix blender export
                m.scaling.x = -1;
                m.bakeCurrentTransformIntoVertices();
            });
        }

        loader.onFinish = function () { this.loadSceneModelFinished(engine, scene); }.bind(this);
        loader.load();
    }

    this.loadSceneModelFinished = function (engine, scene) {
        var windowIndex = 0;
        var window = new Array(20);

        engine.runRenderLoop(function () {
            scene.render();

            if (this.stats != undefined) {

                // Update and render stats
                window[windowIndex] = scene.getLastFrameDuration();
                windowIndex = (windowIndex + 1) % window.length;

                var sum = window.reduce(function (a, b) { return a + b; });
                var avg = sum / window.length;

                this.stats.innerHTML = "Total vertices: " + scene.getTotalVertices() + "<br>"
                                  + "Active Meshes: " + scene.getActiveMeshes().length + "<br>"
                                  + "Frame duration: " + avg.toFixed(2) + " ms<br>"
                                  + "FPS: " + (1000 / avg).toFixed(2);
            }
        }.bind(this));
    }

    this.setupControl = function() {
        var engine = new BABYLON.Engine(this.canvas, true);
        var scene = this.createScene(engine);

        this.loadSceneModel(engine, scene);

        var camera = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(0, 0, 0), scene);
        camera.attachControl(this.canvas);

        camera.keysUp.push(87);    // W
        camera.keysDown.push(83);  // S
        camera.keysLeft.push(65);  // A
        camera.keysRight.push(68); // D

        camera.speed /= 4;
        camera.position.y += 1.5;

        camera.ellipsoid = new BABYLON.Vector3(1, 2, 1);
        camera.applyGravity = true;
        camera.checkCollisions = true;

        gdo.net.app["WebGL"].initControl();

        function sendCameraPositionToClients() {
            var position = camera.position;
            var rotation = camera.rotation;
            
            this.gdo.net.app["WebGL"].server.setBabylonjsCameraPosition(this.gdo.controlId,
                {
                    position: [position.x, position.y, position.z],
                    rotation: [rotation.x, rotation.y, rotation.z]
                });
        }

        setInterval(sendCameraPositionToClients.bind(this), 1000 / 60);
    }

    this.setupApp = function() {
        var engine = new BABYLON.Engine(this.canvas, true);
        var scene = this.createScene(engine);

        this.loadSceneModel(engine, scene);

        //
        // Setup camera and rotation offset

        var pixelHeight = gdo.net.node[gdo.clientId].height;
        var pixelWidth = gdo.net.node[gdo.clientId].width;

        var physicalTotalHeight = 2530;  // in mm
        var physicalScreenHeight = physicalTotalHeight / 4;
        var physicalScreenWidth = physicalScreenHeight * (pixelWidth / pixelHeight);
        var physicalRadius = 3000;

        var horizontalFov = Math.atan2(physicalScreenWidth, physicalRadius);

        var sectionPixelHeight = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].height;
        var sectionPixelWidth = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].width;
        var numScreensHigh = sectionPixelHeight / pixelHeight;
        var numScreensWide = sectionPixelWidth / pixelWidth;

        var camera = new BABYLON.TargetCamera("Camera", new BABYLON.Vector3(0, 0, 0), scene);
        camera.position.y += 1.5;

        camera.fovMode = BABYLON.Camera.FOVMODE_HORIZONTAL_FIXED;
        camera.fov = horizontalFov;

        gdo.consoleOut('.WebGL', 1, 'Horizontal FOV = ' + horizontalFov);

        var nodeWidthOffset = gdo.net.node[gdo.clientId].sectionCol - ((numScreensWide - 1) / 2);
        var nodeHeightOffset = gdo.net.node[gdo.clientId].sectionRow - ((numScreensHigh - 1) / 2);
        gdo.consoleOut('.WebGL', 1, 'Node Width Offset = ' + nodeWidthOffset);
        gdo.consoleOut('.WebGL', 1, 'Node Height Offset = ' + nodeHeightOffset);

        var horizontalRotation = nodeWidthOffset * horizontalFov;
        var verticalRotation = Math.atan2(nodeHeightOffset * physicalScreenHeight, physicalRadius);

        var viewportHeight = Math.cos(verticalRotation);
        gdo.consoleOut('.WebGL', 1, 'Viewport Height = ' + viewportHeight);

        engine.setSize(canvas.width, canvas.height*viewportHeight);

        var cameraViewOffset = new BABYLON.Vector3(verticalRotation, horizontalRotation, 0);

        gdo.net.app["WebGL"].initBabylonjsClient(camera, cameraViewOffset);
    }
}