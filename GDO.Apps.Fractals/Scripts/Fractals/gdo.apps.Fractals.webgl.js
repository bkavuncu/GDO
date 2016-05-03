var gl;
var canvas;

window.onload = init;

function init() {

    // Set up canvas
    canvas = document.getElementById('glscreen');
    gl = canvas.getContext('experimental-webgl');
    canvas.width = 960;
    canvas.height = 540;
    //canvas.width = 1920;
    //canvas.height = 1080;

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
    gl.uniform1f(xRotLoc, params.xRot);
    yRotLoc = gl.getUniformLocation(program, "yRot");
    gl.uniform1f(yRotLoc, params.yRot);

    // Setup focal
    var focalLoc = gl.getUniformLocation(program, "focal");
    gl.uniform1f(focalLoc, 1 / Math.tan((315 / 32) * (Math.PI / 180)));

    // Setup translation
    transLoc = gl.getUniformLocation(program, "translation");
    gl.uniform3f(transLoc, xTrans, yTrans, zTrans);

    // Setup eye
    eyeLoc = gl.getUniformLocation(program, "eyeHeight");
    gl.uniform1f(eyeLoc, -params.yHeight);

    // Set page size
    widthloc = gl.getUniformLocation(program, "width");
    gl.uniform1f(widthloc, canvas.width);
    heightloc = gl.getUniformLocation(program, "height");
    gl.uniform1f(heightloc, canvas.height);

    // Set max steps
    maxStepsLoc = gl.getUniformLocation(program, "maxSteps");
    gl.uniform1i(maxStepsLoc, params.maxSteps);

    // Set mod function
    modLoc = gl.getUniformLocation(program, "modFunction");
    gl.uniform1i(modLoc, params.modToggle);

    // Render the scene
    render();

}

function render() {

    // Ensure continuous rendering
    window.requestAnimationFrame(render, canvas);

    // Apply params
    applyParams();

    // Set position data of vertex shader
    positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Draw quad
    gl.drawArrays(gl.TRIANGLES, 0, 6);

}
