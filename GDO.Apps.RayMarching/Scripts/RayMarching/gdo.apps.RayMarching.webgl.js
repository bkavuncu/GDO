﻿gdo.net.app["RayMarching"].gl1;
gdo.net.app["RayMarching"].program1;
gdo.net.app["RayMarching"].canvas1;

gdo.net.app["RayMarching"].gl2;
gdo.net.app["RayMarching"].program2;
gdo.net.app["RayMarching"].canvas2;

gdo.net.app["RayMarching"].sync;

gdo.net.app["RayMarching"].initWebgl = function(id, locations, completeInit) {

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

    gdo.net.app["RayMarching"].loadFiles(['../scripts/RayMarching/Shaders/rayMarch.frag', '../scripts/RayMarching/Shaders/init.frag'], function (shaderText) {
        //gdo.consoleOut('.RayMarching', 1, shaderText[0] + shaderText[1]);
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

        gdo.net.app["RayMarching"].initLocs(locations, gl, program, canvas);

        completeInit(gl, program, canvas);

    }, function (url) {
        alert('Failed to download "' + url + '"');
    });
}

gdo.net.app["RayMarching"].initLocs = function (locations, gl, program, canvas) {
    // Setup rotations
    locations.xRotLoc = gl.getUniformLocation(program, "xRot");
    gl.uniform1f(locations.xRotLoc, gdo.net.app["RayMarching"].parameters.xRot);
    locations.yRotLoc = gl.getUniformLocation(program, "yRot");
    gl.uniform1f(locations.yRotLoc, gdo.net.app["RayMarching"].parameters.yRot);

    // Setup focal
    var focalLoc = gl.getUniformLocation(program, "focal");
    gl.uniform1f(focalLoc, 1 / Math.tan((315 / 32) * (Math.PI / 180)));

    // Setup translation
    locations.transLoc = gl.getUniformLocation(program, "translation");
    gl.uniform3f(locations.transLoc, gdo.net.app["RayMarching"].parameters.xTrans, gdo.net.app["RayMarching"].parameters.yTrans, gdo.net.app["RayMarching"].parameters.zTrans);

    // Setup eye
    locations.eyeLoc = gl.getUniformLocation(program, "eyeHeight");
    gl.uniform1f(locations.eyeLoc, -gdo.net.app["RayMarching"].parameters.yHeight);

    // Set page size
    locations.widthloc = gl.getUniformLocation(program, "width");
    gl.uniform1f(locations.widthloc, canvas.width);
    locations.heightloc = gl.getUniformLocation(program, "height");
    gl.uniform1f(locations.heightloc, canvas.height);

}

gdo.net.app["RayMarching"].loadFile = function (url, data, callback, errorCallback) {
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

gdo.net.app["RayMarching"].loadFiles = function (urls, callback, errorCallback) {
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
        gdo.net.app["RayMarching"].loadFile(urls[i], i, partialCallback, errorCallback);
    }
}

gdo.net.app["RayMarching"].rendering = false;

gdo.net.app["RayMarching"].renderSync = function (locations, gl, program) {
    
    if (!gdo.net.app["RayMarching"].rendering) {
        gdo.net.app["RayMarching"].rendering = true;

        if (gdo.net.app["RayMarching"].sync) {

            // Ensure continuous rendering
            window.requestAnimationFrame(function () {
                gdo.net.app["RayMarching"].rendering = false;

                gdo.net.app["RayMarching"].server.ackFrameRendered(gdo.net.node[gdo.clientId].appInstanceId, gdo.clientId);
            });

        } else {

            gdo.net.app["RayMarching"].canvas1.style.zIndex = 5;
            gdo.net.app["RayMarching"].canvas2.style.zIndex = 0;

            // Ensure continuous rendering
            window.requestAnimationFrame(function () {
                gdo.net.app["RayMarching"].rendering = false;
                gdo.net.app["RayMarching"].renderSync(gdo.net.app["RayMarching"].locations1, gdo.net.app["RayMarching"].gl1, gdo.net.app["RayMarching"].program1);
            });
        }

        // Apply params
        gdo.net.app["RayMarching"].applyParams(locations, gl);

        // Set position data of vertex shader
        positionLocation = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Draw quad
        gl.drawArrays(gl.TRIANGLES, 0, 6);

    } else {
        gdo.consoleOut('.RayMarching', 1, 'Multiple Renders Detected');
    }
}