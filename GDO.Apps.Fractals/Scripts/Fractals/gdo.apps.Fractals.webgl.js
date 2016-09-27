gdo.net.app["Fractals"].gl1;
gdo.net.app["Fractals"].program1;
gdo.net.app["Fractals"].canvas1;

gdo.net.app["Fractals"].gl2;
gdo.net.app["Fractals"].program2;
gdo.net.app["Fractals"].canvas2;

gdo.net.app["Fractals"].sync;

gdo.net.app["Fractals"].initWebgl = function(id, locations, completeInit) {

    var gl;
    var program;

    // Set up canvas
    var canvas = $("iframe").contents().find(id)[0];
    gl = canvas.getContext('experimental-webgl');

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
    // ReSharper disable JoinDeclarationAndInitializerJs
    var shaderScript;
    var shaderSource;
    var vertexShader;
    var fragmentShader;
    // ReSharper restore JoinDeclarationAndInitializerJs

    // Compile vertex shader
    shaderScript = $("iframe").contents().find("#2d-vertex-shader")[0];
    shaderSource = shaderScript.text;
    vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, shaderSource);
    gl.compileShader(vertexShader);

    gdo.net.app["Fractals"].loadFiles(['../scripts/Fractals/Shaders/rayMarch.frag', '../scripts/Fractals/Shaders/init.frag'], function (shaderText) {
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

        gdo.net.app["Fractals"].initLocs(locations, gl, program, canvas);

        completeInit(gl, program, canvas);

    }, function (url) {
        alert('Failed to download "' + url + '"');
    });
}

gdo.net.app["Fractals"].initLocs = function (locations, gl, program, canvas) {
    // Setup rotations
    locations.xRotLoc = gl.getUniformLocation(program, "xRot");
    gl.uniform1f(locations.xRotLoc, gdo.net.app["Fractals"].parameters.xRot);
    locations.yRotLoc = gl.getUniformLocation(program, "yRot");
    gl.uniform1f(locations.yRotLoc, gdo.net.app["Fractals"].parameters.yRot);

    // Setup focal
    var focalLoc = gl.getUniformLocation(program, "focal");
    gl.uniform1f(focalLoc, 1 / Math.tan((315 / 32) * (Math.PI / 180)));

    // Setup translation
    locations.transLoc = gl.getUniformLocation(program, "translation");
    gl.uniform3f(locations.transLoc, gdo.net.app["Fractals"].parameters.xTrans, gdo.net.app["Fractals"].parameters.yTrans, gdo.net.app["Fractals"].parameters.zTrans);

    // Setup eye
    locations.eyeLoc = gl.getUniformLocation(program, "eyeHeight");
    gl.uniform1f(locations.eyeLoc, -gdo.net.app["Fractals"].parameters.yHeight);

    // Set page size
    locations.widthloc = gl.getUniformLocation(program, "width");
    gl.uniform1f(locations.widthloc, canvas.width);
    locations.heightloc = gl.getUniformLocation(program, "height");
    gl.uniform1f(locations.heightloc, canvas.height);

    // Set max steps
    locations.maxStepsLoc = gl.getUniformLocation(program, "maxSteps");
    gl.uniform1i(locations.maxStepsLoc, gdo.net.app["Fractals"].parameters.maxSteps);

    // Set detail
    locations.detailLoc = gl.getUniformLocation(program, "minDetail");
    gl.uniform1f(locations.detailLoc, Math.pow(10.0, gdo.net.app["Fractals"].parameters.detail));

    // Set fog
    locations.fogLoc = gl.getUniformLocation(program, "fog");
    gl.uniform1f(locations.fogLoc, gdo.net.app["Fractals"].parameters.fog);

    // Set ambience
    locations.ambienceLoc = gl.getUniformLocation(program, "ambience");
    gl.uniform1f(locations.ambienceLoc, gdo.net.app["Fractals"].parameters.ambience);

    // Set light intensity
    locations.lightIntensityLoc = gl.getUniformLocation(program, "lightIntensity");
    gl.uniform1f(locations.lightIntensityLoc, gdo.net.app["Fractals"].parameters.lightIntensity);

    // Set light size
    locations.lightSizeLoc = gl.getUniformLocation(program, "lightSize");
    gl.uniform1f(locations.lightSizeLoc, gdo.net.app["Fractals"].parameters.lightSize);

    // Set light location
    locations.lightLocLoc = gl.getUniformLocation(program, "lightLoc");
    gl.uniform3f(locations.lightLocLoc, gdo.net.app["Fractals"].parameters.lightX, gdo.net.app["Fractals"].parameters.lightY, gdo.net.app["Fractals"].parameters.lightZ);

    // Set fractal
    locations.fractalLoc = gl.getUniformLocation(program, "fractal");
    gl.uniform1i(locations.iterationsLoc, gdo.net.app["Fractals"].parameters.fractal);

    // Set fractal iteration
    locations.iterationsLoc = gl.getUniformLocation(program, "iterations");
    gl.uniform1i(locations.iterationsLoc, gdo.net.app["Fractals"].parameters.iterations);

    // Set fractal power
    locations.powerLoc = gl.getUniformLocation(program, "power");
    gl.uniform1f(locations.powerLoc, gdo.net.app["Fractals"].parameters.power);

    // Set fractal colour
    locations.colourLoc = gl.getUniformLocation(program, "colour");
    gl.uniform4f(locations.colourLoc, gdo.net.app["Fractals"].parameters.red, gdo.net.app["Fractals"].parameters.green, gdo.net.app["Fractals"].parameters.blue, 1.0);

    // Set fractal scale
    locations.scaleLoc = gl.getUniformLocation(program, "scale");
    gl.uniform1f(locations.scaleLoc, gdo.net.app["Fractals"].parameters.scale);

    // Set fractal julia constant
    locations.juliaCLoc = gl.getUniformLocation(program, "c");
    gl.uniform4f(locations.juliaCLoc, gdo.net.app["Fractals"].parameters.cx, gdo.net.app["Fractals"].parameters.cy, gdo.net.app["Fractals"].parameters.cz, gdo.net.app["Fractals"].parameters.cw);

    // Set fractal threshold
    locations.thresholdLoc = gl.getUniformLocation(program, "threshold");
    gl.uniform1f(locations.thresholdLoc, gdo.net.app["Fractals"].parameters.threshold);

    // Set mod function
    locations.modLoc = gl.getUniformLocation(program, "modFunction");
    gl.uniform1i(locations.modLoc, gdo.net.app["Fractals"].parameters.modToggle);
}

gdo.net.app["Fractals"].loadFile = function (url, data, callback, errorCallback) {
    // Set up an asynchronous request
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    // Hook the event that gets called as the request progresses
    request.onreadystatechange = function () {
        // If the request is "DONE" (completed or failed)
        if (request.readyState == 4) {
            // If we got HTTP status 200 (OK)
            if (request.status == 200) {
                callback(request.responseText, data);
            } else { // Failed
                alert(request.status);
                errorCallback(url);
            }
        }
    };

    request.send(null);
}

gdo.net.app["Fractals"].loadFiles = function (urls, callback, errorCallback) {
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
        gdo.net.app["Fractals"].loadFile(urls[i], i, partialCallback, errorCallback);
    }
}

gdo.net.app["Fractals"].rendering = false;

gdo.net.app["Fractals"].renderSync = function (locations, gl, program) {
    
    if (!gdo.net.app["Fractals"].rendering) {
        gdo.net.app["Fractals"].rendering = true;

        if (gdo.net.app["Fractals"].sync) {

            // Ensure continuous rendering
            window.requestAnimationFrame(function () {
                gdo.net.app["Fractals"].rendering = false;

                var frequencyData = new Uint8Array(gdo.net.app["Fractals"].analyser.frequencyBinCount);
                gdo.net.app["Fractals"].analyser.getByteFrequencyData(frequencyData);

                gdo.net.app["Fractals"].server.ackFrameRendered(gdo.net.node[gdo.clientId].appInstanceId, gdo.clientId, frequencyData[0], frequencyData[1], frequencyData[2], frequencyData[3], frequencyData[4], frequencyData[5], frequencyData[6], frequencyData[7], frequencyData[8], frequencyData[9], frequencyData[10], frequencyData[11], frequencyData[12], frequencyData[13], frequencyData[14], frequencyData[15]);
            });

        } else {

            gdo.net.app["Fractals"].canvas1.style.zIndex = 5;
            gdo.net.app["Fractals"].canvas2.style.zIndex = 0;

            // Ensure continuous rendering
            window.requestAnimationFrame(function () {
                gdo.net.app["Fractals"].rendering = false;
                gdo.net.app["Fractals"].renderSync(gdo.net.app["Fractals"].locations1, gdo.net.app["Fractals"].gl1, gdo.net.app["Fractals"].program1);
            });
        }

        gdo.net.app["Fractals"].applyAudioAdjustments();

        // Apply params
        gdo.net.app["Fractals"].applyParams(locations, gl);

        // Set position data of vertex shader
        positionLocation = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Draw quad
        gl.drawArrays(gl.TRIANGLES, 0, 6);

    } else {
        gdo.consoleOut('.Fractals', 1, 'Multiple Renders Detected');
    }
}


gdo.net.app["Fractals"].audioPlaying = false;
gdo.net.app["Fractals"].freqs;//TODO this is weird

gdo.net.app["Fractals"].applyAudioAdjustments = function () {
    if (gdo.net.app["Fractals"].audioPlaying) {

        var frequencyData = new Uint8Array(gdo.net.app["Fractals"].analyser.frequencyBinCount);

        if (gdo.net.app["Fractals"].sync) {
            frequencyData = gdo.net.app["Fractals"].freqs;
        } else {
            gdo.net.app["Fractals"].analyser.getByteFrequencyData(frequencyData);
        }

        // Colour cycle
        if (frequencyData[6] / 255 < 1 / 6) {
            gdo.net.app["Fractals"].parameters.red = 1;
            gdo.net.app["Fractals"].parameters.green = (frequencyData[6] / 255) / (1 / 6);
            gdo.net.app["Fractals"].parameters.blue = 0;
        }
        else if (frequencyData[6] / 255 < 2 / 6) {
            gdo.net.app["Fractals"].parameters.red = 1 - (((frequencyData[6] / 255) - (1 / 6)) / (1 / 6));
            gdo.net.app["Fractals"].parameters.green = 1;
            gdo.net.app["Fractals"].parameters.blue = 0;
        }
        else if (frequencyData[6] / 255 < 3 / 6) {
            gdo.net.app["Fractals"].parameters.red = 0;
            gdo.net.app["Fractals"].parameters.green = 1;
            gdo.net.app["Fractals"].parameters.blue = ((frequencyData[6] / 255) - (2 / 6)) / (1 / 6);
        }
        else if (frequencyData[6] / 255 < 4 / 6) {
            gdo.net.app["Fractals"].parameters.red = 0;
            gdo.net.app["Fractals"].parameters.green = 1 - (((frequencyData[6] / 255) - (3 / 6)) / (1 / 6));
            gdo.net.app["Fractals"].parameters.blue = 1;
        }
        else if (frequencyData[6] / 255 < 5 / 6) {
            gdo.net.app["Fractals"].parameters.red = ((frequencyData[6] / 255) - (4 / 6)) / (1 / 6);
            gdo.net.app["Fractals"].parameters.green = 0;
            gdo.net.app["Fractals"].parameters.blue = 1;
        }
        else {
            gdo.net.app["Fractals"].parameters.red = 1;
            gdo.net.app["Fractals"].parameters.green = 0;
            gdo.net.app["Fractals"].parameters.blue = 1 - (((frequencyData[6] / 255) - (5 / 6)) / (1 / 6));
        }


        gdo.net.app["Fractals"].parameters.cx = 1 - (2 * frequencyData[4] / 255);
        gdo.net.app["Fractals"].parameters.cy = -1 + (2 * frequencyData[5] / 255);
        gdo.net.app["Fractals"].parameters.cz = Math.sin(2 * Math.PI * frequencyData[9] / 255);
        gdo.net.app["Fractals"].parameters.cw = Math.cos(2 * Math.PI * frequencyData[10] / 255);

        gdo.net.app["Fractals"].parameters.scale = 2.0 + 2.0 * frequencyData[6] / 255;

        gdo.net.app["Fractals"].parameters.power = 4.0 + 4.0 * frequencyData[5] / 255;

        gdo.net.app["Fractals"].parameters.ambience = 0.1 + 0.5 * frequencyData[6] / 255;
    }
}