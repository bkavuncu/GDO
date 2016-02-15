ThreejsSetup = function (container, gdo) {

    this.container = container;
    this.gdo = gdo;

    this.setupControl = function() { 
        //
        // Set up renderer on window

        var renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setClearColor(0xffffff);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(renderer.domElement);

        function onWindowResize() {
            var effectiveWidth = window.innerHeight * (16 / 9);
            var effectiveHeight = window.innerWidth * (9 / 16);

            if (effectiveWidth > window.innerWidth) {
                renderer.setSize(window.innerWidth, effectiveHeight);
            } else {
                renderer.setSize(effectiveWidth, window.innerHeight);
            }
        }

        onWindowResize();
        window.addEventListener('resize', onWindowResize, false);

        //
        // Create camera and periodically send its position to clients

        var camera = new THREE.PerspectiveCamera(35, 16 / 9, 3, 10000);

        function sendCameraPositionToClients() {
            var position = camera.getWorldPosition();
            var quaternion = camera.getWorldQuaternion();

            this.gdo.net.app["WebGL"].server.setCameraPosition(this.gdo.controlId,
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

        var world = new ViewportTestWorld(renderer, camera);
        world.initScene();
        world.setAsControl();
        world.startRendering();
    }
}