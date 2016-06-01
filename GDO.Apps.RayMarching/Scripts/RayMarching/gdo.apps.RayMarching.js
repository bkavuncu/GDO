


$(function () {
    gdo.consoleOut('.RayMarching', 1, 'Loaded RayMarching JS');

        $.connection.rayMarchingAppHub.client.updateParams = function (instanceId, params) {
            if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

                var json = JSON.parse(params);

                // Set rotation
                var x = ((gdo.clientId - 1) % 16) - 7.5;
                var angle = (315 / 16) * (Math.PI / 180);
                parameters.xRot = -angle * x + json.XRot;
                parameters.yRot = json.YRot;

                parameters.xTrans = json.XTrans;
                parameters.yTrans = json.YTrans;
                parameters.zTrans = json.ZTrans;

                sync = json.Sync;


            }
        };

        $.connection.rayMarchingAppHub.client.renderNextFrame = function (instanceId, currentFrame) {

            if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {

            } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

                if (currentFrame == 0) {
                    renderSync(locations1, gl1, program1);
                } else {
                    renderSync(locations2, gl2, program2);
                }

            }
        };

        $.connection.rayMarchingAppHub.client.renderNextFrameNoSync = function () {

            if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {

            } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

                render(locations1, gl1, program1);

            }
        };

        $.connection.rayMarchingAppHub.client.swapFrame = function (instanceId, params, timeToRender) {
            if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {

            } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
                //gdo.consoleOut('.RayMarching', 1, 'server t - ' + timeToRender);
               // gdo.consoleOut('.RayMarching', 1, 'gdo t - ' + gdo.net.time.getTime());
                var json = JSON.parse(params);

                // Set rotation
                var x = ((gdo.clientId - 1) % 16) - 7.5;
                var angle = (315 / 16) * (Math.PI / 180);
                parameters.xRot = -angle * x + json.XRot;
                parameters.yRot = json.YRot;

                parameters.xTrans = json.XTrans;
                parameters.yTrans = json.YTrans;
                parameters.zTrans = json.ZTrans;

                var n = gdo.net.time.getTime()

                var timeout = timeToRender - n;
                //gdo.consoleOut('.RayMarching', 1, 'timeout t - ' + timeout);

                if (json.CurrentFrame == 0) {
                    if (timeout > 0) {
                        setTimeout(function () {
                            canvas1.style.zIndex = 0;
                            canvas2.style.zIndex = 5;
                            
                            $("iframe").contents().find("#screen1_marker").hide();
                            $("iframe").contents().find("#screen2_marker").show();
                            gdo.net.app["RayMarching"].server.ackSwapFrame(gdo.net.node[gdo.clientId].appInstanceId);
                        }, timeout);
                    } else {
                        canvas1.style.zIndex = 0;
                        canvas2.style.zIndex = 5;
                        $("iframe").contents().find("#screen1_marker").hide();
                        $("iframe").contents().find("#screen2_marker").show();
                        gdo.net.app["RayMarching"].server.ackSwapFrame(gdo.net.node[gdo.clientId].appInstanceId);
                    }

                } else if (json.CurrentFrame == 1) {
                    if (timeout > 0) {
                        setTimeout(function () {
                            canvas1.style.zIndex = 5;
                            canvas2.style.zIndex = 0;
                            $("iframe").contents().find("#screen1_marker").show();
                            $("iframe").contents().find("#screen2_marker").hide();
                            gdo.net.app["RayMarching"].server.ackSwapFrame(gdo.net.node[gdo.clientId].appInstanceId);
                        }, timeout);
                    } else {
                        canvas1.style.zIndex = 5;
                        canvas2.style.zIndex = 0;
                        $("iframe").contents().find("#screen1_marker").show();
                        $("iframe").contents().find("#screen2_marker").hide();
                        gdo.net.app["RayMarching"].server.ackSwapFrame(gdo.net.node[gdo.clientId].appInstanceId);
                    }
                }
                

            }
        };

});

gdo.net.app["RayMarching"].initClient = function () {
    gdo.consoleOut('.RayMarching', 1, 'Initializing RayMarching App Client at Node ' + gdo.clientId);

    gdo.loadScript('params', 'RayMarching', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('webgl', 'RayMarching', gdo.SCRIPT_TYPE.APP);
    
    parameters = new params();
    locations1 = new locs();
    locations2 = new locs();

    // Set horizontal rotation
    var x = ((gdo.clientId - 1) % 16) - 7.5;
    var angle = (315 / 16) * (Math.PI / 180);
    parameters.xRot = -angle * x;

    // Set vertical height
    var y = Math.floor((gdo.clientId - 1) / 16) - 1.5;
    var ratio = (1080 / 1920);
    parameters.yHeight = 2.0 * ratio * y;
    gdo.consoleOut('.RayMarching', 1, 'Eye height = ' + parameters.yHeight);

    sync = true;

    initWebgl("#glscreen1", locations1, "#2d-fragment-shader", completeinit1);
    

    //gl1 = webgl1.gl;
    //gl2 = webgl2.gl;
    //program1 = webgl1.program;
    //program2 = webgl2.program;
    //canvas1 = webgl1.canvas;
    //canvas2 = webgl2.canvas;

    //canvas1.style.zIndex = 0;
    //canvas2.style.zIndex = 5;

    //gdo.net.app["RayMarching"].server.incNodes(gdo.net.node[gdo.clientId].appInstanceId, gdo.clientId);
}

completeinit1 = function (gl, program, canvas) {
    gl1 = gl;
    program1 = program;
    canvas1 = canvas;
    canvas1.style.zIndex = 0;

    initWebgl("#glscreen2", locations2, "#2d-fragment-shader", completeinit2);
}

completeinit2 = function (gl, program, canvas) {
    gl2 = gl;
    program2 = program;
    canvas2 = canvas;
    canvas2.style.zIndex = 0;

    gdo.net.app["RayMarching"].server.incNodes(gdo.net.node[gdo.clientId].appInstanceId, gdo.clientId);
}

gdo.net.app["RayMarching"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.consoleOut('.RayMarching', 1, 'Initializing RayMarching App Control at Instance ' + gdo.controlId);

    gdo.loadScript('params', 'RayMarching', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('ui', 'RayMarching', gdo.SCRIPT_TYPE.APP);
}

gdo.net.app["RayMarching"].terminateClient = function () {
    gdo.consoleOut('.RayMarching', 1, 'Terminating RayMarching App Client at Node ' + clientId);
    gdo.net.app["RayMarching"].server.decNodes(gdo.net.node[gdo.clientId].appInstanceId, gdo.clientId);
}

gdo.net.app["RayMarching"].ternminateControl = function () {
    gdo.consoleOut('.RayMarching', 1, 'Terminating RayMarching App Control at Instance ' + gdo.controlId);
    gdo.net.app["RayMarching"].server.joystickTerminate(gdo.controlId);
}
