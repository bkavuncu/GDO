BabylonSetup = function (canvas, gdo) {

    this.canvas = canvas;
    this.gdo = gdo;

    this.showStats = false;

    this.engine = new BABYLON.Engine(this.canvas, true);
    this.scene = createScene(this.engine);
    this.camera = undefined;

    this.cameraViewOffset = new BABYLON.Vector3(0, 0, 0);
    this.receivedFirstCameraUpdate = false;

    this.isControlNode = false;

    this.rotateGDO = true;
    this.GDORotationOffset = 0;
    this.virticalRotationLocked = false;
    this.horizontalRotationLocked = false;

    this.meshCopier = new MESHCOPIER(this.scene, this.gdo);

    this.addMeshToScene = function (data) {
        this.meshCopier.addMeshesToImport(data);
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

    this.writePerformanceDataToFile = function (performanceData) {
        this.gdo.consoleOut('.WebGL', 1, 'Instance - ' + this.instanceId + ": Saving performance data to file");

        var firstLine = true;
        var firstLineString = "nodeId";

        var stringArray = [];

        for (var key in performanceData) {
            // skip loop if the property is from prototype
            if (!performanceData.hasOwnProperty(key)) continue;

            var dataArray = performanceData[key];
            dataArray.forEach(function (data) {
                var dataString = key + "";
                for (var prop in data) {
                    // skip loop if the property is from prototype
                    if (!data.hasOwnProperty(prop)) continue;

                    if (prop == "camera") {
                        if (firstLine) {
                            firstLineString += ", cameraX, cameraY, cameraZ";
                        }

                        var position = data[prop].position;
                        dataString += ", " + position[0] + ", " + position[1] + ", " + position[2];

                        continue;
                    }

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

    this.updateAndRenderStats = (function () {

        var frameIndex = 0;
        var frameSampleSize = 10;

        var maxDuration = 0;
        var minDuration = Number.MAX_VALUE;
        var durationSum = 0;

        var numSentAtATime = 10;
        var numSent = 0;

        var activeMeshes = this.scene.getActiveMeshes();

        return function (cameraData) {
            // Update and render stats
            var duration = this.engine.getDeltaTime();
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
                data.FPS = this.engine.getFps();
                data.camera = cameraData;

                if (!this.isControlNode) {
                    this.gdo.net.app["WebGL"].server.addNewPerformanceData(this.instanceId, this.gdo.clientId, data);
                }

                var position = this.camera.position;

                $('#stats').html("Total vertices: " + data.totalVertices + "<br>"
                                + "Active Meshes: " + data.activeMeshes + "<br>"
                                + "Total Meshes: " + data.totalMeshes + "<br>"
                                + "Max Frame duration: " + data.maxFrameDuration.toFixed(2) + " ms<br>"
                                + "Average Frame duration: " + data.averageFrameDuration.toFixed(2) + " ms<br>"
                                + "Min Frame duration: " + data.minFrameDuration.toFixed(2) + " ms<br>"
                                + "FPS: " + data.FPS.toFixed(2) + "<br>"
                                + "{ x: " + position.x.toFixed(2) +
                                    ", y: " + position.y.toFixed(2) +
                                    ", z: " + position.z.toFixed(2) + " }");

                var health = (data.FPS - 20) / 25;
                health = Math.max(0, Math.min(1, health));

                var r = 214 - health * 40;
                var g = 243 * health;
                var b = 73 * health;

                $('#stats').css("background-color", "rgb(" + Math.round(r) + "," + Math.round(g) + "," + Math.round(b) + ")"); 

                var textLumimance = 0;

                var luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;          
                if (luminance < 127) {
                    textLumimance = 255;
                }

                $('#stats').css("color", "rgb(" + textLumimance + "," + textLumimance + "," + textLumimance + ")");

                frameIndex = 0;
                minDuration = 1000;
                maxDuration = 0;
                durationSum = 0;
            }
        }.bind(this);
    }).bind(this)();


    this.updateAndRender = (function () {

        var frameStartTime = Date.now();

        return function (newCamera, nextFrameCallback) {
            this.engine.endFrame();
            this.engine.beginFrame();

            this.updateCameraPosition(newCamera);
            this.scene.render();

            if (this.showStats) {
                //this.meshCopier.doWork();
                this.updateAndRenderStats(newCamera);
            }

            function startFrame() {
                frameStartTime = Date.now();
                nextFrameCallback();
            }

            if (nextFrameCallback != undefined) {

                var duration = Date.now() - frameStartTime;
                // 16 is target duration for ~60 FPS
                var waitTime = 16 - duration;

                if (waitTime > 0) {
                    setTimeout(startFrame, waitTime);
                } else {
                    startFrame();
                }
            }
        }.bind(this);
    }).bind(this)();

    this.modelLoadFinished = function () {

        this.gdo.consoleOut('.WebGL', 1, 'Instance - ' + this.instanceId + ": Scene Loading finished");

        this.scene.createOrUpdateSelectionOctree();

        //this.meshCopier.addMeshesToSend(this.scene.meshes);

        this.engine.hideLoadingUI();

        if (this.isControlNode) {

            this.gdo.net.app["WebGL"].server.requestCameraPosition(this.instanceId);

            var clampPointRotationOffset = 0;

            this.engine.runRenderLoop(function () {

                if (this.virticalRotationLocked) {
                    this.camera.cameraRotation.x = 0;
                }

                if (this.horizontalRotationLocked) {
                    this.camera.cameraRotation.y = 0;
                }

                this.scene.render();

                if (this.rotateGDO) {
                    clampPointRotationOffset = this.GDORotationOffset + this.camera.rotation.y;
                }
                else {
                    this.GDORotationOffset = clampPointRotationOffset - this.camera.rotation.y;
                }

                if (this.receivedFirstCameraUpdate) {

                    var position = this.camera.position;
                    var rotation = this.camera.rotation;

                    this.camera.upVector.copyFromFloats(Math.sin(rotation.x) * Math.sin(rotation.y),
                                                        Math.cos(rotation.x),
                                                        Math.sin(rotation.x) * Math.cos(rotation.y));

                    var cameraData = {
                        position: [position.x, position.y, position.z],
                        upVector: [this.camera.upVector.x, this.camera.upVector.y, this.camera.upVector.z],
                        GDORotation: rotation.y,
                        GDORotationOffset: this.GDORotationOffset
                    };

                    this.gdo.net.app["WebGL"].server.setCameraPosition(this.instanceId, cameraData);

                    if (this.showStats) {
                        //this.importer.doWork();
                        this.updateAndRenderStats(cameraData);
                    }
                }
            }.bind(this));
        }
        else {
            this.engine.beginFrame();
            this.gdo.net.app["WebGL"].server.notifyReadyForNextFrame(this.instanceId, this.gdo.clientId);
        }
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

        // Needed to force camera update when only horizontal rotation is used (GDORotation)
        this.camera.getViewMatrix(true);
    }

    this.setupControl = function () {

        this.camera = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(0, 0, 0), this.scene);

        this.isControlNode = true;
        this.gdo.net.app["WebGL"].initControl(this);
        this.instanceId = this.gdo.controlId;
        this.setupShared();

        var camera = this.camera;

        camera.applyGravity = false;
        camera.checkCollisions = false;
        camera.ellipsoid = new BABYLON.Vector3(0.8, 1.9, 0.8);

        camera.attachControl(this.canvas);

        camera.keysUp.push(87);    // W
        camera.keysDown.push(83);  // S
        camera.keysLeft.push(65);  // A
        camera.keysRight.push(68); // D

        camera.speed /= 4;

        var meshesVisable = true;

        $(window).keypress(function (event) {
            if (event.which == 46) {            // >
                this.camera.speed *= 2;
            }
            else if (event.which == 44) {       // < 
                this.camera.speed /= 2;
            }
            else if (event.which == 98) {       // b
                this.scene.forceShowBoundingBoxes = !this.scene.forceShowBoundingBoxes;
            } 
            else if (event.which == 118) {      // v
                this.virticalRotationLocked = !this.virticalRotationLocked;
            }
            else if (event.which == 108) {       // h
                this.horizontalRotationLocked = !this.horizontalRotationLocked;
            }
            else if (event.which == 122) {       // z
                meshesVisable = !meshesVisable;
                this.scene.meshes.forEach(function (m) {
                    if (m.name != "skyBox") {
                        m.isVisible = meshesVisable;
                    }
                });
            }
            console.log(event.which);
        }.bind(this));

        var frameSyncActive = false;
        $('#toggle_frame_sync').click(function () {
            frameSyncActive = !frameSyncActive;
            this.gdo.net.app["WebGL"].server.setFrameSync(this.instanceId, frameSyncActive);

            if (frameSyncActive) {
                $('#toggle_frame_sync').text("Disable Frame Sync");
            } else {
                $('#toggle_frame_sync').text("Enable Frame Sync");
            }
        }.bind(this));

        var configName = this.gdo.net.instance[this.instanceId].configName;
        var config = this.gdo.net.app["WebGL"].config[configName];

        if (config.flyby != undefined) {
            $('#stats_toggle').hide();
            $('#noclip_toggle').hide();
            $('#toggle_rotation_type').hide();

            var waypoints = [];
            config.flyby.forEach(function (vectorArray) {
                waypoints.push(BABYLON.Vector3.FromArray(vectorArray));
            });

            var flybyController = new FlybyController(this.engine, this.camera, this.canvas, waypoints, config.flybySpeed,
                function () {
                    this.gdo.net.app["WebGL"].server.requestPerformanceData(this.instanceId);
                    $('#reset_position').text("Start Flyby");
                    this.collectStats(false);
            }.bind(this));

            $('#reset_position').text("Start Flyby");
            var flybyActive = false;

            $('#reset_position').click(function () {
                flybyActive = !flybyActive;
                
                if (flybyActive) {
                    this.gdo.net.app["WebGL"].server.collectStats(this.instanceId, true);
                    this.collectStats(true);

                    flybyController.reset();
                    flybyController.start();
                    $('#reset_position').text("Stop Flyby");
                } else {
                    $('#reset_position').text("Start Flyby");
                    flybyController.stop();  
                }
            }.bind(this));
        }
        else {
            $('#stats_toggle').click(function () {
                var shouldShow = !this.showStats;
                this.collectStats(shouldShow);
                this.gdo.net.app["WebGL"].server.collectStats(this.instanceId, shouldShow);
                if (!shouldShow) {
                    this.gdo.net.app["WebGL"].server.requestPerformanceData(this.instanceId);
                }
            }.bind(this));

            $('#reset_position').click(function () {
                camera.position.copyFromFloats(0, 0, 0);
                camera.rotation.copyFromFloats(0, 0, 0);
            });

            var noclipActive = false;
            $('#noclip_toggle').click(function () {
                noclipActive = !noclipActive;
                camera.applyGravity = !noclipActive;
                camera.checkCollisions = !noclipActive;

                if (noclipActive) {
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
        }
    }

    this.setupApp = function () {

        this.camera = new BABYLON.FreeCamera("Camera", new BABYLON.Vector3(0, 0, 0), this.scene);

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

        camera.fovMode = BABYLON.Camera.FOVMODE_HORIZONTAL_FIXED;
        camera.fov = horizontalFov;

        gdo.consoleOut('.WebGL', 1, 'Horizontal FOV = ' + horizontalFov);

        var nodeWidthOffset = gdo.net.node[gdo.clientId].sectionCol - ((numScreensWide - 1) / 2);
        gdo.consoleOut('.WebGL', 1, 'Node Width Offset = ' + nodeWidthOffset);
        var horizontalRotation = nodeWidthOffset * horizontalFov;

        this.cameraViewOffset.y = horizontalRotation;

        // Hijack the Matrix Perspective function to add a virtical offset
        // This functionality should really be properly added to the Babylon library 
        // but I don't have time for that right now
        //
        // See here for original typscript code that is duplicated
        // https://github.com/BabylonJS/Babylon.js/blob/master/src/Math/babylon.math.ts

        var xoffset = 0;
        var yoffset = gdo.net.node[gdo.clientId].sectionRow - ((numScreensHigh - 1)/2);

        BABYLON.Matrix.PerspectiveFovLHToRef = function (fov, aspect, znear, zfar, result, isVerticalFovFixed) {
            var tan = 1.0 / (Math.tan(fov * 0.5));

            if (isVerticalFovFixed) {
                result.m[0] = tan / aspect;
            }
            else {
                result.m[0] = tan;
            }

            result.m[1] = result.m[2] = result.m[3] = 0.0;

            if (isVerticalFovFixed) {
                result.m[5] = tan;
            }
            else {
                result.m[5] = tan * aspect;
            }

            result.m[4] = result.m[6] = result.m[7] = 0.0;

            result.m[8] = 2 * xoffset;
            result.m[9] = 2 * yoffset;

            result.m[10] = -zfar / (znear - zfar);
            result.m[11] = 1.0;
            result.m[12] = result.m[13] = result.m[15] = 0.0;
            result.m[14] = (znear * zfar) / (znear - zfar);
            result.m[15] = 0.0;
        }
    }

    this.setupShared = function () {

        this.engine.displayLoadingUI();

        window.addEventListener('resize', function () {
            this.engine.resize();
        }.bind(this));

        this.collectStats(false);

        var configName = this.gdo.net.instance[this.instanceId].configName;
        var config = this.gdo.net.app["WebGL"].config[configName];
        if (!this.isControlNode) {
            var column = this.gdo.net.node[this.gdo.clientId].sectionCol;

            if (column == 0) {
                //BABYLON_OBJLOADER_NUM_MESHES_TO_LOAD = 11000;
            } else {
                //BABYLON_OBJLOADER_STARTING_MESH_NUMBER = 11000;
            }
            //config.startPosition[0] += this.gdo.net.node[this.gdo.clientId].sectionCol * 100;
        }

        BABYLON_OBJLOADER_NUM_MESHES_TO_LOAD = 10000;

        loadModelIntoScene(config, this.scene, this.modelLoadFinished.bind(this));

        if (config.minZ != undefined) {
            this.camera.minZ = config.minZ;
        } else {
            this.camera.minZ = 0.1;
        }

        // Skybox
        var skybox = BABYLON.Mesh.CreateBox("skyBox", 10000.0, this.scene);
        var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("../../Data/WebGL/textures/clouds", this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        skyboxMaterial.disableLighting = true;
        skybox.material = skyboxMaterial;

        gdo.consoleOut('.WebGL', 1, 'Set camera render distance - Min: ' + this.camera.minZ + " Max: " + this.camera.maxZ);
    }
}