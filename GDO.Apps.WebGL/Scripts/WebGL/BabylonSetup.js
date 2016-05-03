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

    this.rotateGDO = true;
    this.GDORotationOffset = 0;

    this.importer = new IMPORTER(this.scene, this.gdo);

    this.addMeshToScene = function (data) {
        //this.importer.addMeshesToImport(data);
        console.log(data);

        data.forEach(function (geo) {
            var mesh = new BABYLON.Mesh(geo.name, this.scene);
            mesh.position.copyFrom(geo.position);
            mesh.rotation.copyFrom(geo.rotation);

            var material = this.scene.getMaterialByName(geo.materialName);
            mesh.setMaterialByID(material.id);

            var geometry = BABYLON.Geometry.Parse(geo.serializedGeometry, this.scene, "");
            BABYLON.Geometry.ImportGeometry(geometry, mesh);

        }.bind(this));
    }

    this.addMaterialsToScene = function (data) {
        data.forEach(function (mat) {
            if (this.scene.getMaterialByName(mat.name) != undefined) {
                return;
            }

            this.gdo.consoleOut('.WebGL', 1, "Adding new material " + mat.name);
            BABYLON.Material.Parse(mat, this.scene, "");
        }.bind(this));
    }

    this.performanceData = {};

    this.addPerformanceData = function (nodeId, dataArray) {
        if (this.performanceData[nodeId] == undefined) {
            this.performanceData[nodeId] = [];
        }
        this.performanceData[nodeId] = this.performanceData[nodeId].concat(dataArray);
    }

    this.writePerformanceDataToFile = function () {
        this.gdo.consoleOut('.WebGL', 1, 'Instance - ' + this.instanceId + ": Saving performance data to file");

        var firstLine = true;
        var firstLineString = "nodeId";

        var stringArray = [];

        for (var key in this.performanceData) {
            // skip loop if the property is from prototype
            if (!this.performanceData.hasOwnProperty(key)) continue;

            var dataArray = this.performanceData[key];
            dataArray.forEach(function (data) {
                var dataString = key + "";
                for (var prop in data) {
                    // skip loop if the property is from prototype
                    if (!data.hasOwnProperty(prop)) continue;

                    if (firstLine) {
                        firstLineString += ", " + prop;
                    }

                    dataString += ", " + data[prop];
                }
                if (firstLine) {
                    stringArray.push(firstLineString + "\n\n");
                    firstLine = false;
                }
                stringArray.push(dataString + "\n");
            });
            stringArray.push("\n");
        }

        var data = new Blob(stringArray);
        window.open(URL.createObjectURL(data));

        this.performanceData = {};
    }

    this.modelLoadFinished = function () {

        this.gdo.consoleOut('.WebGL', 1, 'Instance - ' + this.instanceId + ": Scene Loading finished");

        this.scene.createOrUpdateSelectionOctree();
        
        /*
        if (!this.isControlNode) {
            SendMaterialsToAllOtherNodes(this.gdo, this.scene, function () {
                this.gdo.consoleOut('.WebGL', 1, 'Instance - ' + this.instanceId + ": Sending Materials finished");
                this.engine.hideLoadingUI();
                this.importer.addMeshesToSend(this.scene.meshes);
           }.bind(this));
        } else {
            this.engine.hideLoadingUI();
        }
        */

        this.engine.hideLoadingUI();

        var frameIndex = 0;
        var frameSampleSize = 60;

        var maxDuration = 0;
        var minDuration = 1000;
        var durationSum = 0;

        var numSentAtATime = 10;
        var numSent = 0;

        var activeMeshes = this.scene.getActiveMeshes();

        var clampPointRotationOffset = 0;

        this.engine.runRenderLoop(function () {
            this.scene.render();

            if (this.isControlNode) {
                if (this.rotateGDO) {
                    clampPointRotationOffset = this.GDORotationOffset + this.camera.rotation.y;
                }
                else {
                    this.GDORotationOffset = clampPointRotationOffset - this.camera.rotation.y;
                }
            }

            if (this.showStats) {

                if (this.isControlNode) {
                    frameIndex++;

                    if (frameIndex >= frameSampleSize) {

                        this.gdo.net.app["WebGL"].server.requestNewPerformanceData(this.instanceId);
                        frameIndex = 0;
                    }
                }
                else {
                    //this.importer.doWork();

                    // Update and render stats
                    var duration = this.scene.getLastFrameDuration();
                    maxDuration = Math.max(duration, maxDuration);
                    minDuration = Math.min(duration, minDuration);
                    durationSum += duration;

                    frameIndex++;

                    if (frameIndex >= frameSampleSize) {

                        var data = {};
                        data.timeStamp = this.gdo.net.time.getTime();
                        data.totalVertices = this.scene.getTotalVertices();
                        data.activeMeshes = activeMeshes.length;
                        data.totalMeshes = this.scene.meshes.length;
                        data.maxFrameDuration = maxDuration;
                        data.averageFrameDuration = durationSum / frameSampleSize;
                        data.minFrameDuration = minDuration;
                        data.FPS = 1000 / data.averageFrameDuration;

                        this.gdo.net.app["WebGL"].server.addNewPerformanceData(this.instanceId, this.gdo.clientId, data);

                        $('#stats').html("Total vertices: " +           data.totalVertices + "<br>"
                                        + "Active Meshes: " +           data.activeMeshes + "<br>"
                                        + "Total Meshes: " +            data.totalMeshes + "<br>"
                                        + "Max Frame duration: " +      data.maxFrameDuration.toFixed(2) + " ms<br>"
                                        + "Average Frame duration: " +  data.averageFrameDuration.toFixed(2) + " ms<br>"
                                        + "Min Frame duration: " +      data.minFrameDuration.toFixed(2) + " ms<br>"
                                        + "FPS: " +                     data.FPS.toFixed(2));

                        frameIndex = 0;
                        minDuration = 1000;
                        maxDuration = 0;
                        durationSum = 0;
                    }
                }
            }

            if (this.isControlNode && this.receivedFirstCameraUpdate) {

                var position = this.camera.position;
                var rotation = this.camera.rotation;

                this.camera.upVector.copyFromFloats(Math.sin(rotation.x) * Math.sin(rotation.y),
                                                    Math.cos(rotation.x),
                                                    Math.sin(rotation.x) * Math.cos(rotation.y));

                this.gdo.net.app["WebGL"].server.setCameraPosition(this.instanceId,
                    {
                        position: [position.x, position.y, position.z],
                        upVector: [this.camera.upVector.x, this.camera.upVector.y, this.camera.upVector.z],
                        GDORotation: rotation.y,
                        GDORotationOffset: this.GDORotationOffset
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

        BABYLON.Vector3.FromArrayToRef(newCamera.position, 0, this.camera.position);

        if (this.isControlNode) {
            this.camera.rotation.y = newCamera.GDORotation;
            this.GDORotationOffset = newCamera.GDORotationOffset;
            return;
        }
        
        this.camera._referencePoint.copyFromFloats(Math.cos(newCamera.GDORotation),
                                                   0,
                                                   -Math.sin(newCamera.GDORotation));

        BABYLON.Vector3.FromArrayToRef(newCamera.upVector, 0, this.camera.upVector);

        this.camera.rotation.y = this.cameraViewOffset.y + newCamera.GDORotationOffset - (Math.PI / 2);
    }

    this.setupControl = function () {

        this.isControlNode = true;
        this.gdo.net.app["WebGL"].initControl(this);
        this.instanceId = this.gdo.controlId;
        this.setupShared();

        var camera = this.camera;

        camera.applyGravity = !this.noclip;
        camera.checkCollisions = !this.noclip;

        $('#stats_toggle').click(function () {
            var shouldShow = !this.showStats;
            this.collectStats(shouldShow);
            this.gdo.net.app["WebGL"].server.collectStats(this.instanceId, shouldShow);
            if (!shouldShow) {
                this.writePerformanceDataToFile();
            }
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

        $('#toggle_rotation_type').click(function () {
            this.rotateGDO = !this.rotateGDO;

            if (this.rotateGDO) {
                $('#toggle_rotation_type').text("Rotate Front");
            } else {
                $('#toggle_rotation_type').text("Rotate GDO");
            }
        }.bind(this));

        camera.attachControl(this.canvas);

        camera.keysUp.push(87);    // W
        camera.keysDown.push(83);  // S
        camera.keysLeft.push(65);  // A
        camera.keysRight.push(68); // D

        $(window).keypress(function (event) {
            if (event.which == 46) {            // >
                this.camera.speed *= 2;
            }
            else if (event.which == 44) {       // < 
                this.camera.speed /= 2;
            }
        }.bind(this));

        camera.ellipsoid = new BABYLON.Vector3(0.8, 1.9, 0.8);
        camera.applyGravity = true;
        camera.checkCollisions = true;
    }

    this.setupApp = function () {

        gdo.net.app["WebGL"].initClient(this);
        this.instanceId = instanceId = this.gdo.net.node[this.gdo.clientId].appInstanceId;
        this.setupShared();

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
    }

    this.setupShared = function () {

        this.engine.displayLoadingUI();

        window.addEventListener('resize', function () {
            this.engine.resize();
        }.bind(this));

        this.collectStats(false);

        this.gdo.net.app["WebGL"].server.requestCameraPosition(this.instanceId);

        var configName = this.gdo.net.instance[this.instanceId].configName;
        var config = this.gdo.net.app["WebGL"].config[configName];
        //config.startPosition[0] -= gdo.net.node[gdo.clientId].sectionCol * 100;
        loadModelIntoScene(config, this.scene, this.modelLoadFinished.bind(this));

        this.camera.minZ = 0.1;
        //this.camera.maxZ = 1000000;
        gdo.consoleOut('.WebGL', 1, 'Set camera render distance - Min: ' + this.camera.minZ + " Max: " + this.camera.maxZ);
    }
}