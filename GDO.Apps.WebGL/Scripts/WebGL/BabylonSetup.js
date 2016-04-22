BabylonSetup = function (canvas, gdo) {

    this.canvas = canvas;
    this.gdo = gdo;

    this.showStats = false;
    this.noclip = false;

    this.engine = new BABYLON.Engine(this.canvas, true);
    this.scene = createScene(this.engine);
    this.camera = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(0, 0, 0), this.scene);

    this.cameraViewOffset = new BABYLON.Vector3(0, 0, 0);

    this.isControlNode = false;

    this.modelLoadFinished = function () {

        var instanceId = this.gdo.net.node[this.gdo.clientId].appInstanceId;
        gdo.consoleOut('.WebGL', 1, 'Instance - ' + instanceId + ": Scene Loading finished");

        //var octree = this.scene.createOrUpdateSelectionOctree();

        var frameIndex = 0;
        var frameSampleSize = 60;

        var maxDuration = 0;
        var minDuration = 1000;
        var durationSum = 0;

        var activeMeshes = this.scene.getActiveMeshes();

        this.engine.runRenderLoop(function () {
            this.scene.render();

            if (this.showStats) {

                // Update and render stats
                var duration = this.scene.getLastFrameDuration();
                maxDuration = Math.max(duration, maxDuration);
                minDuration = Math.min(duration, minDuration);
                durationSum += duration;

                frameIndex++;

                if (frameIndex >= frameSampleSize) {

                    var avg = durationSum / frameSampleSize;

                    $('#stats').html("Total vertices: " + this.scene.getTotalVertices() + "<br>"
                                    + "Active Meshes: " + activeMeshes.length + "<br>"
                                    + "Total Meshes: " + this.scene.meshes.length + "<br>"
                                    + "Max Frame duration: " + maxDuration.toFixed(2) + " ms<br>"
                                    + "Average Frame duration: " + avg.toFixed(2) + " ms<br>"
                                    + "Min Frame duration: " + minDuration.toFixed(2) + " ms<br>"
                                    + "FPS: " + (1000 / avg).toFixed(2) + "<br>"
                                    + "Camera speed: " + this.camera.speed);

                    frameIndex = 0;
                    minDuration = 1000;
                    maxDuration = 0;
                    durationSum = 0;


                    //TODO: Experimenting with frustums and octrees

                    /*
                    var frustumPlanes = BABYLON.Frustum.GetPlanes(scene.getTransformMatrix());
                    var index;
                    var meshes = octree.select(frustumPlanes);
                    console.log(meshes.length);
                    for (index = 0; index < meshes.length; ++index) {
                        console.log(index + " " + activeMeshes.data[index].getBoundingInfo().isInFrustum(frustumPlanes) + " " + activeMeshes.data[index].getBoundingInfo().isCompletelyInFrustum(frustumPlanes));
                        //scene.removeMesh(meshes[index]);
                    }
                    console.log(JSON.stringify(frustumPlanes));
                    */

                }
            }

            if( this.isControlNode && this.receivedFirstCameraUpdate ) {

                var position = this.camera.position;
                var rotation = this.camera.rotation;

                var instanceId = this.gdo.net.node[this.gdo.clientId].appInstanceId;
                this.gdo.net.app["WebGL"].server.setCameraPosition(instanceId,
                    {
                        position: [position.x, position.y, position.z],
                        rotation: [rotation.x, rotation.y, rotation.z]
                    });
            }

        }.bind(this));
    }

    this.collectStats = function (collectStats) {
        this.showStats = collectStats;

        if (this.showStats) {
            $('#stats').show();
            $('#stats_toggle').text("Hide Stats");
        } else {
            $('#stats').hide();
            $('#stats_toggle').text("Show Stats");
        }
    }

    this.receivedFirstCameraUpdate = false;

    this.updateCameraPosition = function (newCamera) {
        this.receivedFirstCameraUpdate = true;

        this.camera.position.copyFromFloats(newCamera.position[0], newCamera.position[1], newCamera.position[2]);

        this.camera.rotation.y = newCamera.rotation[1] + this.cameraViewOffset.y;
        this.camera.rotation.x = newCamera.rotation[0];// * Math.cos(newCamera.rotation[1]);
        //this.camera.upVector.copyFromFloats(0,
        //                                        Math.cos(newCamera.rotation[0]),
        //                                        Math.sin(newCamera.rotation[0]) * Math.sin(this.cameraViewOffset.y));
    }

    this.setupControl = function () {

        this.isControlNode = true;

        var camera = this.camera;

        camera.applyGravity = !this.noclip;
        camera.checkCollisions = !this.noclip;

        $('#stats_toggle').click(function () {
            var shouldShow = !this.showStats;
            this.collectStats(shouldShow);
            var instanceId = this.gdo.net.node[this.gdo.clientId].appInstanceId;
            this.gdo.net.app["WebGL"].server.collectStats(instanceId, shouldShow);
        }.bind(this));

        $('#reset_position').click(function () {
            camera.position.copyFromFloats(0, 0, 0);
        });

        $('#noclip_toggle').click(function () {
            this.noclip = !this.noclip;
            camera.applyGravity = !this.noclip;
            camera.checkCollisions = !this.noclip;

            if (this.noclip) {
                $('#noclip_toggle').text("Disable noclip");
            } else {
                $('#noclip_toggle').text("Enable noclip");
            }
        }.bind(this));

        camera.attachControl(this.canvas);

        camera.keysUp.push(87);    // W
        camera.keysDown.push(83);  // S
        camera.keysLeft.push(65);  // A
        camera.keysRight.push(68); // D

        $(document).keypress(function (event) {
            if (event.which == 46) {  // > key
                this.camera.speed *= 2;
            }
            else if (event.which == 44) {  // < key
                this.camera.speed /= 2;
            }
        }.bind(this));

        camera.ellipsoid = new BABYLON.Vector3(0.8, 1.9, 0.8);
        camera.applyGravity = true;
        camera.checkCollisions = true;

        this.gdo.net.app["WebGL"].initControl(this);

        this.setupShared();
    }

    this.setupApp = function() {

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

        var camera = this.camera;

        camera.viewport.height = numScreensHigh;
        camera.viewport.y = gdo.net.node[gdo.clientId].sectionRow - numScreensHigh + 1;

        camera.fovMode = BABYLON.Camera.FOVMODE_HORIZONTAL_FIXED;
        camera.fov = horizontalFov;

        gdo.consoleOut('.WebGL', 1, 'Horizontal FOV = ' + horizontalFov);

        var nodeWidthOffset = gdo.net.node[gdo.clientId].sectionCol - ((numScreensWide - 1) / 2);
        gdo.consoleOut('.WebGL', 1, 'Node Width Offset = ' + nodeWidthOffset);
        var horizontalRotation = nodeWidthOffset * horizontalFov;

        this.cameraViewOffset.y = horizontalRotation;

        gdo.net.app["WebGL"].initClient(this);
        this.setupShared();
    }

    this.setupShared = function () {
        window.addEventListener('resize', function () {
            this.engine.resize();
        }.bind(this));

        this.collectStats(false);

        var instanceId = this.gdo.net.node[this.gdo.clientId].appInstanceId;
        this.gdo.net.app["WebGL"].server.requestCameraPosition(instanceId);
        loadModelIntoScene("ImperialWestLandscapeWithBuilding2Sided", this.engine, this.scene, this.modelLoadFinished.bind(this));

        this.camera.minZ = 0.1;
        //this.camera.maxZ = 1000000;
        gdo.consoleOut('.WebGL', 1, 'Set camera render distance - Min: ' + this.camera.minZ + " Max: " + this.camera.maxZ);
    }
}