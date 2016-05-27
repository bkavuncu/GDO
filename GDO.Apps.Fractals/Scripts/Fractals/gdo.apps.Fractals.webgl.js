var gl1;
var program1;
var canvas1;

var gl2;
var program2;
var canvas2;

var sync;

function initWebgl(id, locations, shader) {

    var gl;
    var program;

    // Set up canvas
    var canvas = $("iframe").contents().find(id)[0];
    gl = canvas.getContext('experimental-webgl');
    //canvas.width = 480;
    //canvas.width = 960;
    //canvas.height = 540;
    canvas.width = 1920;
    canvas.height = 1080;

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
    shaderScript = $("iframe").contents().find("#2d-vertex-shader")[0];
    shaderSource = shaderScript.text;
    vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, shaderSource);
    gl.compileShader(vertexShader);

    // Compile fragment shader
    shaderScript = $("iframe").contents().find(shader)[0];
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
    locations.xRotLoc = gl.getUniformLocation(program, "xRot");
    gl.uniform1f(locations.xRotLoc, parameters.xRot);
    locations.yRotLoc = gl.getUniformLocation(program, "yRot");
    gl.uniform1f(locations.yRotLoc, parameters.yRot);

    // Setup focal
    var focalLoc = gl.getUniformLocation(program, "focal");
    gl.uniform1f(focalLoc, 1 / Math.tan((315 / 32) * (Math.PI / 180)));

    // Setup translation
    locations.transLoc = gl.getUniformLocation(program, "translation");
    gl.uniform3f(locations.transLoc, parameters.xTrans, parameters.yTrans, parameters.zTrans);

    // Setup eye
    locations.eyeLoc = gl.getUniformLocation(program, "eyeHeight");
    gl.uniform1f(locations.eyeLoc, -parameters.yHeight);

    // Set page size
    locations.widthloc = gl.getUniformLocation(program, "width");
    gl.uniform1f(locations.widthloc, canvas.width);
    locations.heightloc = gl.getUniformLocation(program, "height");
    gl.uniform1f(locations.heightloc, canvas.height);

    // Set max steps
    locations.maxStepsLoc = gl.getUniformLocation(program, "maxSteps");
    gl.uniform1i(locations.maxStepsLoc, parameters.maxSteps);

    // Set detail
    locations.detailLoc = gl.getUniformLocation(program, "minDetail");
    gl.uniform1f(locations.detailLoc, Math.pow(10.0, parameters.detail));

    // Set fog
    locations.fogLoc = gl.getUniformLocation(program, "fog");
    gl.uniform1f(locations.fogLoc, parameters.fog);

    // Set ambience
    locations.ambienceLoc = gl.getUniformLocation(program, "ambience");
    gl.uniform1f(locations.ambienceLoc, parameters.ambience);

    // Set light intensity
    locations.lightIntensityLoc = gl.getUniformLocation(program, "lightIntensity");
    gl.uniform1f(locations.lightIntensityLoc, parameters.lightIntensity);

    // Set light size
    locations.lightSizeLoc = gl.getUniformLocation(program, "lightSize");
    gl.uniform1f(locations.lightSizeLoc, parameters.lightSize);

    // Set light location
    locations.lightLocLoc = gl.getUniformLocation(program, "lightLoc");
    gl.uniform3f(locations.lightLocLoc, parameters.lightX, parameters.lightY, parameters.lightZ);

    // Set fractal iteration
    locations.iterationsLoc = gl.getUniformLocation(program, "iterations");
    gl.uniform1i(locations.iterationsLoc, parameters.iterations);

    // Set fractal power
    locations.powerLoc = gl.getUniformLocation(program, "power");
    gl.uniform1f(locations.powerLoc, parameters.power);

    // Set fractal colour
    locations.colourLoc = gl.getUniformLocation(program, "colour");
    gl.uniform4f(locations.colourLoc, parameters.red, parameters.green, parameters.blue, 1.0);

    // Set scale
    locations.scaleLoc = gl.getUniformLocation(program, "scale");
    gl.uniform1f(locations.scaleLoc, parameters.scale);

    // Set mod function
    locations.modLoc = gl.getUniformLocation(program, "modFunction");
    gl.uniform1i(locations.modLoc, parameters.modToggle);

    // Render the scene
    //render(locations, gl, program);

    return { gl: gl, program: program, canvas: canvas };
}
rendering = false;
function renderSync(locations, gl, program) {
    
    if (!rendering) {
        rendering = true;

        if (sync) {

            // Ensure continuous rendering
            window.requestAnimationFrame(function () {
                rendering = false;
                gdo.net.app["Fractals"].server.ackFrameRendered(gdo.net.node[gdo.clientId].appInstanceId);
            });

            // Apply params
            applyParams(locations, gl);

            // Set position data of vertex shader
            positionLocation = gl.getAttribLocation(program, "a_position");
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            // Draw quad
            gl.drawArrays(gl.TRIANGLES, 0, 6);

        } else {
            rendering = false;
            canvas1.style.zIndex = 5;
            canvas2.style.zIndex = 0;
            render(locations1, gl1, program1);
        }
    } else {
        gdo.consoleOut('.Fractals', 1, 'Multiple Renders Detected');
    }
}
rendering2 = false;
function render(locations, gl, program) {

    if (!rendering2) {
        rendering2 = true;

        if (!sync) {

            // Ensure continuous rendering
            window.requestAnimationFrame(function () {
                rendering2 = false;
                render(locations, gl, program);
            });

            // Apply params
            applyParams(locations, gl);

            // Set position data of vertex shader
            positionLocation = gl.getAttribLocation(program, "a_position");
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

            // Draw quad
            gl.drawArrays(gl.TRIANGLES, 0, 6);

        } else {
            rendering2 = false;
            renderSync(locations2, gl2, program2);
        }
    } else {
        gdo.consoleOut('.Fractals', 1, 'Multiple Renders Detected');
    }
}