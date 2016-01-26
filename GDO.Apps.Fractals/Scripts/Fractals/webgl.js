var gl;
var canvas;

// Camera settings
var sensitivity = 0.1;

var xRotLoc;
var xRot = 0.0;
var xRotLeft = false;
var xRotRight = false;

var yRotLoc;
var yRot = 0.0;
var yRotUp = false;
var yRotDown = false;

var focalLoc;
var focal = 1.0;
var focalIn = false;
var focalOut = false;

var transLoc;
var forward = false;
var backward = false;
var left = false;
var right = false;
var up = false;
var down = false;
var xTrans = 0.0;
var yTrans = 0.0;
var zTrans = 0.0;

window.onload = init;

window.onkeydown = function () {
    //alert(event.keyCode);
    // up - rotate up
    if (event.keyCode == 38) {
        yRotUp = true;
    }

    // down - rotate down
    if (event.keyCode == 40) {
        yRotDown = true;
    }

    // left - rotate left
    if (event.keyCode == 37) {
        xRotLeft = true;
    }

    // right - rotate right
    if (event.keyCode == 39) {
        xRotRight = true;
    }

    // + - zoom in
    if (event.keyCode == 107) {
        focalIn = true;
    }

    // - - zoom out
    if (event.keyCode == 109) {
        focalOut = true;
    }

    // w - forward
    if (event.keyCode == 87) {
        forward = true;
    }

    // s - backward
    if (event.keyCode == 83) {
        backward = true;
    }

    // a - left
    if (event.keyCode == 65) {
        left = true;
    }

    // d - right
    if (event.keyCode == 68) {
        right = true;
    }

    // pgup - up
    if (event.keyCode == 33) {
        up = true;
    }

    // pddown - backward
    if (event.keyCode == 34) {
        down = true;
    }
}

window.onkeyup = function () {
    // up - rotate up
    if (event.keyCode == 38) {
        yRotUp = false;
    }

    // down - rotate down
    if (event.keyCode == 40) {
        yRotDown = false;
    }

    // left - rotate left
    if (event.keyCode == 37) {
        xRotLeft = false;
    }

    // right - rotate right
    if (event.keyCode == 39) {
        xRotRight = false;
    }

    // + - zoom in
    if (event.keyCode == 107) {
        focalIn = false;
    }

    // - - zoom out
    if (event.keyCode == 109) {
        focalOut = false;
    }

    // w - forward
    if (event.keyCode == 87) {
        forward = false;
    }

    // s - backward
    if (event.keyCode == 83) {
        backward = false;
    }
    // a - left
    if (event.keyCode == 65) {
        left = false;
    }

    // d - right
    if (event.keyCode == 68) {
        right = false;
    }

    // pgup - up
    if (event.keyCode == 33) {
        up = false;
    }

    // pddown - backward
    if (event.keyCode == 34) {
        down = false;
    }
}


function init() {

    // Set up canvas
    canvas = document.getElementById('glscreen');
    gl = canvas.getContext('experimental-webgl');
    canvas.width = 1920.0;
    canvas.height = 1080.0;

    // Initialise view port
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    // Create a quad filling the screen
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0, 1.0,
        -1.0, 1.0,
         1.0, -1.0,
         1.0, 1.0]),
      gl.STATIC_DRAW
    );

    // Shader local variables
    var shaderScript;
    var shaderSource;
    var vertexShader;
    var fragmentShader;

    // Compile vertex shader
    shaderScript = document.getElementById("2d-vertex-shader");
    shaderSource = shaderScript.text;
    vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, shaderSource);
    gl.compileShader(vertexShader);

    // Compile fragment shader
    shaderScript = document.getElementById("2d-fragment-shader");
    shaderSource = shaderScript.text;
    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, shaderSource);
    gl.compileShader(fragmentShader);

    // Create program with shaders
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Setup rotations
    xRotLoc = gl.getUniformLocation(program, "xRot");
    gl.uniform1f(xRotLoc, xRot);
    yRotLoc = gl.getUniformLocation(program, "yRot");
    gl.uniform1f(yRotLoc, yRot);

    // Setup focal
    focalLoc = gl.getUniformLocation(program, "focal");
    gl.uniform1f(focalLoc, focal);

    // Setup translation
    transLoc = gl.getUniformLocation(program, "translation");
    gl.uniform3f(transLoc, xTrans, yTrans, zTrans);

    // Set page size
    widthloc = gl.getUniformLocation(program, "width");
    gl.uniform1f(widthloc, canvas.width);
    heightloc = gl.getUniformLocation(program, "height");
    gl.uniform1f(heightloc, canvas.height);

    // Render the scene
    render();

}

function render() {

    // Ensure continuous rendering
    window.requestAnimationFrame(render, canvas);

    // Perform camera movements
    cameraMovements();

    // Set position data of vertex shader
    positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Draw quad
    gl.drawArrays(gl.TRIANGLES, 0, 6);

}

function cameraMovements() {

    if (yRotUp) {
        yRot += sensitivity;
    }
    if (yRotDown) {
        yRot -= sensitivity;
    }
    gl.uniform1f(yRotLoc, yRot);

    if (xRotLeft) {
        xRot += sensitivity;
    }
    if (xRotRight) {
        xRot -= sensitivity;
    }
    gl.uniform1f(xRotLoc, xRot);

    if (focalIn) {
        focal += sensitivity;
    }
    if (focalOut) {
        focal -= sensitivity;
    }
    gl.uniform1f(focalLoc, focal);

    if (forward) {
        zTrans += sensitivity
    }
    if (backward) {
        zTrans -= sensitivity
    }
    if (left) {
        xTrans -= sensitivity
    }
    if (right) {
        xTrans += sensitivity
    }
    if (up) {
        yTrans += sensitivity
    }
    if (down) {
        yTrans -= sensitivity
    }
    gl.uniform3f(transLoc, xTrans, yTrans, zTrans);

}
