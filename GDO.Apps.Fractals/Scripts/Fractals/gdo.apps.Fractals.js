gdo.net.app["Fractals"].audio;
gdo.net.app["Fractals"].analyser;

gdo.net.app["Fractals"].setParameters = function (params) {

    var json = JSON.parse(params);

    // Set rotation
    var x = ((gdo.clientId - 1) % 16) - 7.5;
    var angle = (315 / 16) * (Math.PI / 180);
    gdo.net.app["Fractals"].parameters.xRot = -angle * x + json.XRot;
    gdo.net.app["Fractals"].parameters.yRot = json.YRot;

    gdo.net.app["Fractals"].parameters.xTrans = json.XTrans;
    gdo.net.app["Fractals"].parameters.yTrans = json.YTrans;
    gdo.net.app["Fractals"].parameters.zTrans = json.ZTrans;

    gdo.net.app["Fractals"].parameters.maxSteps = json.MaxSteps;
    gdo.net.app["Fractals"].parameters.detail = json.Detail;
    gdo.net.app["Fractals"].parameters.fog = json.Fog;

    gdo.net.app["Fractals"].parameters.iterations = json.Iterations;
    gdo.net.app["Fractals"].parameters.power = json.Power;
    gdo.net.app["Fractals"].parameters.red = json.R;
    gdo.net.app["Fractals"].parameters.green = json.G;
    gdo.net.app["Fractals"].parameters.blue = json.B;
    gdo.net.app["Fractals"].parameters.scale = json.Scale;
    gdo.net.app["Fractals"].parameters.cx = json.Cx;
    gdo.net.app["Fractals"].parameters.cy = json.Cy;
    gdo.net.app["Fractals"].parameters.cz = json.Cz;
    gdo.net.app["Fractals"].parameters.cw = json.Cw;
    gdo.net.app["Fractals"].parameters.threshold = json.Threshold;

    gdo.net.app["Fractals"].parameters.ambience = json.Ambience;
    gdo.net.app["Fractals"].parameters.lightIntensity = json.LightIntensity;
    gdo.net.app["Fractals"].parameters.lightSize = json.LightSize;
    gdo.net.app["Fractals"].parameters.lightX = json.LightX;
    gdo.net.app["Fractals"].parameters.lightY = json.LightY;
    gdo.net.app["Fractals"].parameters.lightZ = json.LightZ;

    gdo.net.app["Fractals"].parameters.modToggle = json.Mod;

    gdo.net.app["Fractals"].parameters.fractal = json.Fractal;
}

$(function () {
    gdo.consoleOut('.Fractals', 1, 'Loaded Fractals JS');

        $.connection.fractalsAppHub.client.updateParams = function (instanceId, params, serverSync) {
            if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

                gdo.net.app["Fractals"].setParameters(params);

                gdo.net.app["Fractals"].sync = serverSync;
            }
        };

        $.connection.fractalsAppHub.client.renderNextFrame = function (instanceId, currentFrame, serverSync) {

            if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {

            } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

                gdo.net.app["Fractals"].sync = serverSync;

                if (currentFrame == 0) {
                    gdo.net.app["Fractals"].renderSync(gdo.net.app["Fractals"].locations1, gdo.net.app["Fractals"].gl1, gdo.net.app["Fractals"].program1);
                } else {
                    gdo.net.app["Fractals"].renderSync(gdo.net.app["Fractals"].locations2, gdo.net.app["Fractals"].gl2, gdo.net.app["Fractals"].program2);
                }

            }
        };

        $.connection.fractalsAppHub.client.swapFrame = function (instanceId, params, timeToRender, f0, f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12, f13, f14, f15) {
            if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {

            } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

                var json = JSON.parse(params);

                var frequencyData = new Uint8Array(gdo.net.app["Fractals"].analyser.frequencyBinCount);
                frequencyData[0] = f0;
                frequencyData[1] = f1;
                frequencyData[2] = f2;
                frequencyData[3] = f3;
                frequencyData[4] = f4;
                frequencyData[5] = f5;
                frequencyData[6] = f6;
                frequencyData[7] = f7;
                frequencyData[8] = f8;
                frequencyData[9] = f9;
                frequencyData[10] = f10;
                frequencyData[11] = f11;
                frequencyData[12] = f12;
                frequencyData[13] = f13;
                frequencyData[14] = f14;
                frequencyData[15] = f15;

                gdo.net.app["Fractals"].freqs = frequencyData;

                gdo.net.app["Fractals"].setParameters(params);

                var n = gdo.net.time.getTime();

                var timeout = timeToRender - n;

                if (json.CurrentFrame == 0) {
                    if (timeout > 0) {
                        setTimeout(function () {
                            gdo.net.app["Fractals"].canvas1.style.zIndex = 0;
                            gdo.net.app["Fractals"].canvas2.style.zIndex = 5;
                            gdo.net.app["Fractals"].server.ackSwapFrame(gdo.net.node[gdo.clientId].appInstanceId, gdo.clientId);
                        }, timeout);
                    } else {
                        gdo.net.app["Fractals"].canvas1.style.zIndex = 0;
                        gdo.net.app["Fractals"].canvas2.style.zIndex = 5;
                        gdo.net.app["Fractals"].server.ackSwapFrame(gdo.net.node[gdo.clientId].appInstanceId, gdo.clientId);
                    }

                } else if (json.CurrentFrame == 1) {
                    if (timeout > 0) {
                        setTimeout(function () {
                            gdo.net.app["Fractals"].canvas1.style.zIndex = 5;
                            gdo.net.app["Fractals"].canvas2.style.zIndex = 0;
                            gdo.net.app["Fractals"].server.ackSwapFrame(gdo.net.node[gdo.clientId].appInstanceId, gdo.clientId);
                        }, timeout);
                    } else {
                        gdo.net.app["Fractals"].canvas1.style.zIndex = 5;
                        gdo.net.app["Fractals"].canvas2.style.zIndex = 0;
                        gdo.net.app["Fractals"].server.ackSwapFrame(gdo.net.node[gdo.clientId].appInstanceId, gdo.clientId);
                    }
                }
            }
        };


        $.connection.fractalsAppHub.client.startAudio = function (id, time) {

            if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {

            } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

                var n = gdo.net.time.getTime();

                gdo.net.app["Fractals"].audio.play();
                //gdo.net.app["Fractals"].audio.currentTime = (n - time) / 1000;
                gdo.net.app["Fractals"].audioPlaying = true;

                if (gdo.net.app["Fractals"].audio.error)
                    gdo.consoleOut('.Fractals', 1, "Music error - " - gdo.net.app["Fractals"].audio.error);
            }
        };


        $.connection.fractalsAppHub.client.stopAudio = function (id) {

            if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {

            } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

                var n = gdo.net.time.getTime();
                
                gdo.net.app["Fractals"].audioPlaying = false;
                gdo.net.app["Fractals"].audio.pause();

            }
        };

});



gdo.net.app["Fractals"].initClient = function () {
    gdo.consoleOut('.Fractals', 1, 'Initializing Fractals App Client at Node ' + gdo.clientId);

    gdo.loadScript('params', 'Fractals', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('webgl', 'Fractals', gdo.SCRIPT_TYPE.APP);

    gdo.net.app["Fractals"].parameters = new gdo.net.app["Fractals"].params();
    gdo.net.app["Fractals"].locations1 = new gdo.net.app["Fractals"].locs();
    gdo.net.app["Fractals"].locations2 = new gdo.net.app["Fractals"].locs();

    // Set horizontal rotation
    var x = ((gdo.clientId - 1) % 16) - 7.5;
    var angle = (315 / 16) * (Math.PI / 180);
    gdo.net.app["Fractals"].parameters.xRot = -angle * x;

    // Set vertical height
    var y = Math.floor((gdo.clientId - 1) / 16) - 1.5;
    var ratio = (1080 / 1920);
    gdo.net.app["Fractals"].parameters.yHeight = 2.0 * ratio * y;
    gdo.consoleOut('.Fractals', 1, 'Eye height = ' + gdo.net.app["Fractals"].parameters.yHeight);

    gdo.net.app["Fractals"].sync = true;

    gdo.net.app["Fractals"].audio = $("iframe").contents().find("#myAudio")[0];

    var audioCtx = new AudioContext();
    gdo.net.app["Fractals"].analyser = audioCtx.createAnalyser();
    var source = audioCtx.createMediaElementSource(gdo.net.app["Fractals"].audio);
    source.connect(gdo.net.app["Fractals"].analyser);
    gdo.net.app["Fractals"].analyser.connect(audioCtx.destination);
    gdo.net.app["Fractals"].analyser.fftSize = 32;
    
    gdo.net.app["Fractals"].initWebgl("#glscreen1", gdo.net.app["Fractals"].locations1, gdo.net.app["Fractals"].completeinit1);
}

gdo.net.app["Fractals"].completeinit1 = function (gl, program, canvas) {
    gdo.net.app["Fractals"].gl1 = gl;
    gdo.net.app["Fractals"].program1 = program;
    gdo.net.app["Fractals"].canvas1 = canvas;
    gdo.net.app["Fractals"].canvas1.style.zIndex = 0;

    gdo.net.app["Fractals"].initWebgl("#glscreen2", gdo.net.app["Fractals"].locations2, gdo.net.app["Fractals"].completeinit2);
}

gdo.net.app["Fractals"].completeinit2 = function (gl, program, canvas) {
    gdo.net.app["Fractals"].gl2 = gl;
    gdo.net.app["Fractals"].program2 = program;
    gdo.net.app["Fractals"].canvas2 = canvas;
    gdo.net.app["Fractals"].canvas2.style.zIndex = 0;

    gdo.net.app["Fractals"].server.beginRendering(gdo.net.node[gdo.clientId].appInstanceId);
}

gdo.net.app["Fractals"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.consoleOut('.Fractals', 1, 'Initializing Fractals App Control at Instance ' + gdo.controlId);

    gdo.loadScript('params', 'Fractals', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('ui', 'Fractals', gdo.SCRIPT_TYPE.APP);
}

gdo.net.app["Fractals"].terminateClient = function () {
    gdo.consoleOut('.Fractals', 1, 'Terminating Fractals App Client at Node ' + clientId);
}

gdo.net.app["Fractals"].terminateControl = function () {
    gdo.consoleOut('.Fractals', 1, 'Terminating Fractals App Control at Instance ' + gdo.controlId);
    gdo.net.app["Fractals"].server.joystickTerminate(gdo.controlId);
}
