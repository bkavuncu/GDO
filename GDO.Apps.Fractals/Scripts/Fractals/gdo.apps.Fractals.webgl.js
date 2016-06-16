var gl1;
var program1;
var canvas1;

var gl2;
var program2;
var canvas2;

var sync;

function initWebgl(id, locations, shader, completeInit) {

    var gl;
    var program;

    // Set up canvas
    var canvas = $("iframe").contents().find(id)[0];
    gl = canvas.getContext('experimental-webgl');
    //canvas.width = 480;
    //canvas.height = 270;
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
    //shaderScript = $("iframe").contents().find(shader)[0];
    //shaderSource = shaderScript.text;
    //fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    //gl.shaderSource(fragmentShader, shaderSource);
    //gl.compileShader(fragmentShader);

    loadFiles(['../scripts/Fractals/Shaders/rayMarch.frag', '../scripts/Fractals/Shaders/init.frag'], function (shaderText) {
        //gdo.consoleOut('.Fractals', 1, shaderText[0] + shaderText[1]);
        // Compile fragment shader
        fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, shaderText[0] + shaderText[1]);
        gl.compileShader(fragmentShader);

        // Create program with shaders
        program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        // Transparent background
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Turn on alpha
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);

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

        // Set fractal
        locations.fractalLoc = gl.getUniformLocation(program, "fractal");
        gl.uniform1i(locations.iterationsLoc, parameters.fractal);

        // Set fractal iteration
        locations.iterationsLoc = gl.getUniformLocation(program, "iterations");
        gl.uniform1i(locations.iterationsLoc, parameters.iterations);

        // Set fractal power
        locations.powerLoc = gl.getUniformLocation(program, "power");
        gl.uniform1f(locations.powerLoc, parameters.power);

        // Set fractal colour
        locations.colourLoc = gl.getUniformLocation(program, "colour");
        gl.uniform4f(locations.colourLoc, parameters.red, parameters.green, parameters.blue, 1.0);

        // Set fractal scale
        locations.scaleLoc = gl.getUniformLocation(program, "scale");
        gl.uniform1f(locations.scaleLoc, parameters.scale);

        // Set fractal julia constant
        locations.juliaCLoc = gl.getUniformLocation(program, "c");
        gl.uniform4f(locations.juliaCLoc, parameters.cx, parameters.cy, parameters.cz, parameters.cw);

        // Set fractal threshold
        locations.thresholdLoc = gl.getUniformLocation(program, "threshold");
        gl.uniform1f(locations.thresholdLoc, parameters.threshold);


        // Set mod function
        locations.modLoc = gl.getUniformLocation(program, "modFunction");
        gl.uniform1i(locations.modLoc, parameters.modToggle);

        completeInit(gl, program, canvas);

    }, function (url) {
        alert('Failed to download "' + url + '"');
    });



    // Render the scene
    //render(locations, gl, program);

    //return { gl: gl, program: program, canvas: canvas };
}

function loadFile(url, data, callback, errorCallback) {
    // Set up an asynchronous request
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    // Hook the event that gets called as the request progresses
    request.onreadystatechange = function () {
        // If the request is "DONE" (completed or failed)
        if (request.readyState == 4) {
            // If we got HTTP status 200 (OK)
            if (request.status == 200) {
                callback(request.responseText, data)
            } else { // Failed
                alert(request.status);
                errorCallback(url);
            }
        }
    };

    request.send(null);
}

function loadFiles(urls, callback, errorCallback) {
    var numUrls = urls.length;
    var numComplete = 0;
    var result = [];

    // Callback for a single file
    function partialCallback(text, urlIndex) {
        result[urlIndex] = text;
        numComplete++;

        // When all files have downloaded
        if (numComplete == numUrls) {
            callback(result);
        }
    }

    for (var i = 0; i < numUrls; i++) {
        loadFile(urls[i], i, partialCallback, errorCallback);
    }
}

rendering = false;
function renderSync(locations, gl, program) {
    
    if (!rendering) {
        rendering = true;

        if (sync) {

            // Ensure continuous rendering
            window.requestAnimationFrame(function () {
                rendering = false;
                gdo.net.app["Fractals"].server.ackFrameRendered(gdo.net.node[gdo.clientId].appInstanceId, gdo.clientId);
            });

            applyAudioAdjustments();

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
audioPlaying = false;
function applyAudioAdjustments() {
    if (audioPlaying) {
        var frequencyData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(frequencyData);
        gdo.consoleOut('.Fractals', 1, frequencyData);
        parameters.red *= frequencyData[6] / 255;
        parameters.green *= 1.0 - frequencyData[7] / 255;
        parameters.blue *= frequencyData[8] / 255;

        parameters.cx *= frequencyData[4] / 255;
        parameters.cy *= frequencyData[5] / 255;
        parameters.cz *= frequencyData[9] / 255;
        parameters.cw *= frequencyData[10] / 255;

        parameters.scale *= frequencyData[11] / 255;

        parameters.power = 4.0 + parameters.power * 0.5 * frequencyData[5] / 255;

        parameters.ambience *= 0.1 + 0.9 * frequencyData[6] / 255;
    }
}