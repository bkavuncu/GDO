ViewportTestWorld = function (renderer, camera) {

    this.renderer = renderer;
    this.camera = camera;

    this.scene = new THREE.Scene();

    this.initScene = function () {

        camera.position.y = 30;

        for (var i = 0; i < 8; i++) {
            var stick = createStick();
            stick.position.z = 500;

            var pivot = new THREE.Object3D();
            pivot.add(stick);

            pivot.rotation.y = i * (Math.PI / 4);
            this.scene.add(pivot);
        }

        // LIGHTS
        // directional lighting
        var dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.color.setHSL(0.1, 1, 0.95);
        dirLight.position.set(800, 500, 0);
        dirLight.castShadow = true;
        dirLight.shadowCameraFar = 2600;
        dirLight.shadowCameraTop = 1000;
        dirLight.shadowCameraBottom = -260;
        dirLight.shadowBias = -0.0001;
        dirLight.shadowDarkness = 0.35;
        //dirLight.shadowCameraVisible = true;

        this.scene.add(dirLight);

        // hemisphere lighting
        var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
        hemiLight.color.setHSL(0.6, 1, 0.6);
        hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        hemiLight.position.set(0, 500, 0);

        this.scene.add(hemiLight);

        this.scene.add(createGround());

        //SKYDOME 
        var vertexShader = document.getElementById('vertexShader').textContent;
        var fragmentShader = document.getElementById('fragmentShader').textContent;
        var uniforms = {
            topColor: { type: "c", value: new THREE.Color(0x0077ff) },
            bottomColor: { type: "c", value: new THREE.Color(0xffffff) },
            offset: { type: "f", value: 33 },
            exponent: { type: "f", value: 0.6 }
        }
        uniforms.topColor.value.copy(hemiLight.color);

        this.scene.fog = new THREE.Fog(0xffffff, 1, 5600);
        this.scene.fog.color.setHSL(0.6, 0, 1);
        this.scene.fog.color.copy(uniforms.bottomColor.value);

        var skyGeo = new THREE.SphereGeometry(4000, 32, 15);
        var skyMat = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: uniforms,
            side: THREE.BackSide
        });

        var sky = new THREE.Mesh(skyGeo, skyMat);
        this.scene.add(sky);
    }

    function createGround() {

        var wSegments = 45;
        var hSegments = 45;

        //GROUND
        var groundGeo = new THREE.PlaneGeometry(6000, 6000, wSegments, hSegments);

        var groundMat = new THREE.MeshLambertMaterial(
        {
            ambient: 0xffffff,
            color: 0xffffff,
            specular: 0x050505
        });
        groundMat.color.setHSL(0.095, 1, 0.75);

        var ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;

        return ground;
    }

    function createStick() {
        // model

        var geometry = new THREE.BoxGeometry(20, 80, 20);

        var material = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            specular: 0xffffff,
            shininess: 20,
            vertexColors: THREE.FaceColors,
            shading: THREE.FlatShading
        });

        var mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        mesh.rotation.y = Math.PI / 8.1;

        return mesh;
    }

    this.setAsControl = function () {
        var controls = new THREE.PointerLockControls(this.camera);

        controls.enabled = true;
        this.scene.add(controls.getObject());

        var keyup = function (event) {
            console.log("Key up: " + event.keyCode);
            if (event.keyCode == 87) { //W
                controls.enabled = !controls.enabled;
                console.log("its a W!!");
            }
        };

        document.addEventListener('keyup', keyup);
    }

    this.startRendering = function () {
        requestAnimationFrame(this.startRendering.bind(this));
        this.renderer.render(this.scene, this.camera);
    }
}