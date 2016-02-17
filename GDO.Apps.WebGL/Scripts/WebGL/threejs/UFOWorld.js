UFOWorld = function (renderer, camera) {

    this.renderer = renderer;
    this.camera = camera;

    this.scene = new THREE.Scene();

    this.initScene = function () {

        var ufo = createUFOModel();
        ufo.rotation.y = 2.1;
        ufo.rotation.x = 0.4;

        ufo.position.x = 1223;
        ufo.position.y = 109;
        ufo.position.z = 20

        this.scene.add(ufo);

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

        var seed = 32842;
        function hackyRandom() {
            var x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        }

        var wSegments = 45;
        var hSegments = 45;

        //GROUND
        var groundGeo = new THREE.PlaneGeometry(6000, 6000, wSegments, hSegments);

        var index = 0;
        for (var i = 0; i < wSegments; i++) {
            for (var j = 0; j < hSegments; j++) {
                groundGeo.vertices[index].z = hackyRandom() * 50;
                index++;
            }
        }

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

    function createUFOModel() {
        // model
        var combined = new THREE.Geometry();

        var wingGeometry = new THREE.TorusGeometry(100, 40, 8, 6, 6.28);
        var wingMesh = new THREE.Mesh(wingGeometry);
        wingMesh.scale.set(1.78, 0.80, 0.09);
        wingMesh.rotation.x = 1.5;

        var coreGeo = new THREE.SphereGeometry(75, 16, 12);
        var coreMesh = new THREE.Mesh(coreGeo);
        coreMesh.scale.set(1.93, 0.25, 0.95);

        THREE.GeometryUtils.merge(combined, wingMesh);
        THREE.GeometryUtils.merge(combined, coreMesh);

        var ufoMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            specular: 0xffffff,
            shininess: 20,
            //morphTargets: true, 
            //morphNormals: true,
            vertexColors: THREE.FaceColors,
            shading: THREE.FlatShading
        });

        var mesh = new THREE.Mesh(combined, ufoMaterial);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    this.setAsControl = function () {

        var controls = new THREE.PointerLockControls(this.camera);
        controls.enabled = true;

        controls.getObject().position.y = 200;

        this.scene.add(controls.getObject());
    }

    this.startRendering = function () {
        requestAnimationFrame(this.startRendering.bind(this));
        this.renderer.render(this.scene, this.camera);
    }
}