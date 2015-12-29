var scene, renderer;

var mesh, group1, group2, group3, light;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

function initializeScene() {

    var container = document.getElementById('wrapper');

    scene = new THREE.Scene();

    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 0, 1);
    scene.add(light);

    // shadow

    var canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;

    var context = canvas.getContext('2d');
    var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
    gradient.addColorStop(0.1, 'rgba(210,210,210,1)');
    gradient.addColorStop(1, 'rgba(255,255,255,1)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    var shadowTexture = new THREE.Texture(canvas);
    shadowTexture.needsUpdate = true;

    var shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture });
    var shadowGeo = new THREE.PlaneBufferGeometry(300, 300, 1, 1);

    mesh = new THREE.Mesh(shadowGeo, shadowMaterial);
    mesh.position.y = -250;
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);

    mesh = new THREE.Mesh(shadowGeo, shadowMaterial);
    mesh.position.y = -250;
    mesh.position.x = -400;
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);

    mesh = new THREE.Mesh(shadowGeo, shadowMaterial);
    mesh.position.y = -250;
    mesh.position.x = 400;
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);

    var faceIndices = ['a', 'b', 'c'];

    var color, f, f2, f3, p, vertexIndex,

        radius = 200,

        geometry = new THREE.IcosahedronGeometry(radius, 1),
        geometry2 = new THREE.IcosahedronGeometry(radius, 1),
        geometry3 = new THREE.IcosahedronGeometry(radius, 1);

    for (var i = 0; i < geometry.faces.length; i++) {

        f = geometry.faces[i];
        f2 = geometry2.faces[i];
        f3 = geometry3.faces[i];

        for (var j = 0; j < 3; j++) {

            vertexIndex = f[faceIndices[j]];

            p = geometry.vertices[vertexIndex];

            color = new THREE.Color(0xffffff);
            color.setHSL((p.y / radius + 1) / 2, 1.0, 0.5);

            f.vertexColors[j] = color;

            color = new THREE.Color(0xffffff);
            color.setHSL(0.0, (p.y / radius + 1) / 2, 0.5);

            f2.vertexColors[j] = color;

            color = new THREE.Color(0xffffff);
            color.setHSL(0.125 * vertexIndex / geometry.vertices.length, 1.0, 0.5);

            f3.vertexColors[j] = color;

        }

    }


    var materials = [

        new THREE.MeshLambertMaterial({ color: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors }),
        new THREE.MeshBasicMaterial({ color: 0x000000, shading: THREE.FlatShading, wireframe: true, transparent: true })

    ];

    group1 = THREE.SceneUtils.createMultiMaterialObject(geometry, materials);
    group1.position.x = -400;
    group1.rotation.x = -1.87;
    scene.add(group1);

    group2 = THREE.SceneUtils.createMultiMaterialObject(geometry2, materials);
    group2.position.x = 400;
    group2.rotation.x = 0;
    scene.add(group2);

    group3 = THREE.SceneUtils.createMultiMaterialObject(geometry3, materials);
    group3.position.x = 0;
    group3.rotation.x = 0;
    scene.add(group3);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor(0xffffff);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    onWindowResize();
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    var effectiveWidth = window.innerHeight * (16 / 9);
    var effectiveHeight = window.innerWidth * (9 / 16);

    if (effectiveWidth > window.innerWidth) {
        renderer.setSize(window.innerWidth, effectiveHeight);
    } else {
        renderer.setSize(effectiveWidth, window.innerHeight);
    }
}

var update, camera;

function beginGameLoop(cameraParam, updateParam) {
    update = updateParam;
    camera = cameraParam;

    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    requestAnimationFrame(gameLoop);
    update();
    renderer.render(scene, camera);
}