ThreeSetup = function (container, gdo) {

    this.gdo = gdo;

    //
    // Set up renderer on window

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0xffffff);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(this.renderer.domElement);

    this.onWindowResize = function() {
        var effectiveWidth = window.innerHeight * (16 / 9);
        var effectiveHeight = window.innerWidth * (9 / 16);

        if (effectiveWidth > window.innerWidth) {
            this.renderer.setSize(window.innerWidth, effectiveHeight);
        } else {
            this.renderer.setSize(effectiveWidth, window.innerHeight);
        }
    }

    this.onWindowResize();
    window.addEventListener('resize', this.onWindowResize.bind(this), false);

    this.setupControl = function() { 

        //
        // Create camera and periodically send its position to clients

        var camera = new THREE.PerspectiveCamera(35, 16 / 9, 3, 10000);

        function sendCameraPositionToClients() {
            var position = camera.getWorldPosition();
            var quaternion = camera.getWorldQuaternion();

            this.gdo.net.app["WebGL"].server.setThreejsCameraPosition(this.gdo.controlId,
                {
                    position: [position.x,
                                 position.y,
                                 position.z],
                    quaternion: [quaternion.x,
                                 quaternion.y,
                                 quaternion.z,
                                 quaternion.w]
                });
        }

        setInterval(sendCameraPositionToClients.bind(this), 1000 / 60);

        //
        // Create 3d world

        var world = new ViewportTestWorld(this.renderer, camera);
        world.initScene();
        world.setAsControl();
        world.startRendering();
    }

    this.setupApp = function () {
        var gdo = this.gdo;

        //
        // Setup camera and camera parent

        var physicalTotalHeight = 2530;  // in mm
        var physicalScreenHeight = physicalTotalHeight / 4;
        var physicalRadius = 3000;

        var numberScreensHigh = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].height / 1080;

        var virticalFov = Math.atan(((numberScreensHigh * physicalScreenHeight) / 2) / 3000) * 2;
        virticalFov = virticalFov * (180 / Math.PI);

        var camera = new THREE.PerspectiveCamera(virticalFov, 16 / 9, 3, 10000);

        var world = new ViewportTestWorld(this.renderer, camera);
        world.initScene();

        var w = 1920;
        var h = 1080;
        var fullWidth = w;
        var fullHeight = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].height;

        var yOffset = gdo.net.node[gdo.clientId].height * gdo.net.node[gdo.clientId].sectionRow;
        gdo.consoleOut('.WebGL', 1, 'Y Offset- ' + yOffset);

        camera.setViewOffset(fullWidth, fullHeight, 0, yOffset, w, h);

        var numNodesWide = (gdo.net.section[gdo.net.node[gdo.clientId].sectionId].width / 1920) - 1;
        var nodeOffset = gdo.net.node[gdo.clientId].sectionCol - (numNodesWide / 2);
        gdo.consoleOut('.WebGL', 1, 'Node offset - ' + (numNodesWide % 2));
        camera.rotateY(nodeOffset * (-0.374));

        var cameraParent = new THREE.Object3D();
        cameraParent.add(camera);
        world.scene.add(cameraParent);

        gdo.net.app["WebGL"].initThreejsClient(cameraParent);

        world.startRendering();
    }

    this.peerjsTesting = function () {
        var gdo = this.gdo;
        // PeerJS fiddling

        // Sends clientId to all connected neighbour nodes once a second
        var connectedNodes = [];

        setInterval(function() {
            for (var index in gdo.net.neighbour) {
                var neighbourId = gdo.net.neighbour[index];

                if (neighbourId == -1) continue;

                if (gdo.net.node[neighbourId].connectedToPeer) {
                    var conn = gdo.net.peer.connections[gdo.net.node[neighbourId].peerId][0];

                    if (connectedNodes.indexOf(neighbourId) == -1) {
                        // Receive messages
                        conn.on('data', function (data) {
                            gdo.consoleOut('.WebGL', 2, "Received data: " + data.toString());
                        });
                        connectedNodes.push(neighbourId); 
                    } else {
                        conn.send(JSON.stringify({ type: 'id', value: gdo.clientId }));
                    }
                }
            }
        }, 1000);
    }
}