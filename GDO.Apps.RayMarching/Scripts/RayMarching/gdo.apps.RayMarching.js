gdo.net.app["RayMarching"].audio;
gdo.net.app["RayMarching"].analyser;

gdo.net.app["RayMarching"].setParameters = function (params) {

    var json = JSON.parse(params);

    // Set rotation
    var x = ((gdo.clientId - 1) % 16) - 7.5;
    var angle = (315 / 16) * (Math.PI / 180);
    gdo.net.app["RayMarching"].parameters.xRot = -angle * x + json.XRot;
    gdo.net.app["RayMarching"].parameters.yRot = json.YRot;

    gdo.net.app["RayMarching"].parameters.xTrans = json.XTrans;
    gdo.net.app["RayMarching"].parameters.yTrans = json.YTrans;
    gdo.net.app["RayMarching"].parameters.zTrans = json.ZTrans;
}

$(function () {
    gdo.consoleOut('.RayMarching', 1, 'Loaded RayMarching JS');

        $.connection.rayMarchingAppHub.client.updateParams = function (instanceId, params, serverSync) {
            if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

                gdo.net.app["RayMarching"].setParameters(params);

                gdo.net.app["RayMarching"].sync = serverSync;
            }
        };

        $.connection.rayMarchingAppHub.client.renderNextFrame = function (instanceId, currentFrame, serverSync) {

            if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {

            } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

                gdo.net.app["RayMarching"].sync = serverSync;

                if (currentFrame == 0) {
                    gdo.net.app["RayMarching"].renderSync(gdo.net.app["RayMarching"].locations1, gdo.net.app["RayMarching"].gl1, gdo.net.app["RayMarching"].program1);
                } else {
                    gdo.net.app["RayMarching"].renderSync(gdo.net.app["RayMarching"].locations2, gdo.net.app["RayMarching"].gl2, gdo.net.app["RayMarching"].program2);
                }

            }
        };

        $.connection.rayMarchingAppHub.client.swapFrame = function (instanceId, params, timeToRender) {
            if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {

            } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

                var json = JSON.parse(params);

                gdo.net.app["RayMarching"].setParameters(params);

                var n = gdo.net.time.getTime()

                var timeout = timeToRender - n;

                if (json.CurrentFrame == 0) {
                    if (timeout > 0) {
                        setTimeout(function () {
                            gdo.net.app["RayMarching"].canvas1.style.zIndex = 0;
                            gdo.net.app["RayMarching"].canvas2.style.zIndex = 5;
                            gdo.net.app["RayMarching"].server.ackSwapFrame(gdo.net.node[gdo.clientId].appInstanceId, gdo.clientId);
                        }, timeout);
                    } else {
                        gdo.net.app["RayMarching"].canvas1.style.zIndex = 0;
                        gdo.net.app["RayMarching"].canvas2.style.zIndex = 5;
                        gdo.net.app["RayMarching"].server.ackSwapFrame(gdo.net.node[gdo.clientId].appInstanceId, gdo.clientId);
                    }

                } else if (json.CurrentFrame == 1) {
                    if (timeout > 0) {
                        setTimeout(function () {
                            gdo.net.app["RayMarching"].canvas1.style.zIndex = 5;
                            gdo.net.app["RayMarching"].canvas2.style.zIndex = 0;
                            gdo.net.app["RayMarching"].server.ackSwapFrame(gdo.net.node[gdo.clientId].appInstanceId, gdo.clientId);
                        }, timeout);
                    } else {
                        gdo.net.app["RayMarching"].canvas1.style.zIndex = 5;
                        gdo.net.app["RayMarching"].canvas2.style.zIndex = 0;
                        gdo.net.app["RayMarching"].server.ackSwapFrame(gdo.net.node[gdo.clientId].appInstanceId, gdo.clientId);
                    }
                }
            }
        };
});



gdo.net.app["RayMarching"].initClient = function () {
    gdo.consoleOut('.RayMarching', 1, 'Initializing RayMarching App Client at Node ' + gdo.clientId);

    gdo.loadScript('params', 'RayMarching', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('webgl', 'RayMarching', gdo.SCRIPT_TYPE.APP);

    gdo.net.app["RayMarching"].parameters = new gdo.net.app["RayMarching"].params();
    gdo.net.app["RayMarching"].locations1 = new gdo.net.app["RayMarching"].locs();
    gdo.net.app["RayMarching"].locations2 = new gdo.net.app["RayMarching"].locs();

    // Set horizontal rotation
    var x = ((gdo.clientId - 1) % 16) - 7.5;
    var angle = (315 / 16) * (Math.PI / 180);
    gdo.net.app["RayMarching"].parameters.xRot = -angle * x;

    // Set vertical height
    var y = Math.floor((gdo.clientId - 1) / 16) - 1.5;
    var ratio = (1080 / 1920);
    gdo.net.app["RayMarching"].parameters.yHeight = 2.0 * ratio * y;
    gdo.consoleOut('.RayMarching', 1, 'Eye height = ' + gdo.net.app["RayMarching"].parameters.yHeight);

    gdo.net.app["RayMarching"].sync = true;

    gdo.net.app["RayMarching"].initWebgl("#glscreen1", gdo.net.app["RayMarching"].locations1, gdo.net.app["RayMarching"].completeinit1);
}

gdo.net.app["RayMarching"].completeinit1 = function (gl, program, canvas) {
    gdo.net.app["RayMarching"].gl1 = gl;
    gdo.net.app["RayMarching"].program1 = program;
    gdo.net.app["RayMarching"].canvas1 = canvas;
    gdo.net.app["RayMarching"].canvas1.style.zIndex = 0;

    gdo.net.app["RayMarching"].initWebgl("#glscreen2", gdo.net.app["RayMarching"].locations2, gdo.net.app["RayMarching"].completeinit2);
}

gdo.net.app["RayMarching"].completeinit2 = function (gl, program, canvas) {
    gdo.net.app["RayMarching"].gl2 = gl;
    gdo.net.app["RayMarching"].program2 = program;
    gdo.net.app["RayMarching"].canvas2 = canvas;
    gdo.net.app["RayMarching"].canvas2.style.zIndex = 0;

    gdo.net.app["RayMarching"].server.beginRendering(gdo.net.node[gdo.clientId].appInstanceId);
}

gdo.net.app["RayMarching"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.consoleOut('.RayMarching', 1, 'Initializing RayMarching App Control at Instance ' + gdo.controlId);

    gdo.loadScript('params', 'RayMarching', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('ui', 'RayMarching', gdo.SCRIPT_TYPE.APP);
}

gdo.net.app["RayMarching"].terminateClient = function () {
    gdo.consoleOut('.RayMarching', 1, 'Terminating RayMarching App Client at Node ' + clientId);
}

gdo.net.app["RayMarching"].terminateControl = function () {
    gdo.consoleOut('.RayMarching', 1, 'Terminating RayMarching App Control at Instance ' + gdo.controlId);
    gdo.net.app["RayMarching"].server.joystickTerminate(gdo.controlId);
}
