﻿var gl;
var canvas;

window.onload = init;

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
