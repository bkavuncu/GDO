


$(function () {
    gdo.consoleOut('.Fractals', 1, 'Loaded Fractals JS');


        $.connection.fractalsAppHub.client.updateParams = function (instanceId, params) {
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

                parameters.maxSteps = json.MaxSteps;
                parameters.detail = json.Detail;

                parameters.iterations = json.Iterations;
                parameters.power = json.Power;
                parameters.red = json.R;
                parameters.green = json.G;
                parameters.blue = json.B;

                parameters.ambience = json.Ambience;
                parameters.lightIntensity = json.LightIntensity;
                parameters.lightSize = json.LightSize;
                parameters.lightX = json.LightX;
                parameters.lightY = json.LightY;
                parameters.lightZ = json.LightZ;

                parameters.modToggle = json.Mod;
            }
        };

        $.connection.fractalsAppHub.client.renderNextFrame = function (instanceId, params) {
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

                parameters.maxSteps = json.MaxSteps;
                parameters.detail = json.Detail;

                parameters.iterations = json.Iterations;
                parameters.power = json.Power;
                parameters.red = json.R;
                parameters.green = json.G;
                parameters.blue = json.B;

                parameters.ambience = json.Ambience;
                parameters.lightIntensity = json.LightIntensity;
                parameters.lightSize = json.LightSize;
                parameters.lightX = json.LightX;
                parameters.lightY = json.LightY;
                parameters.lightZ = json.LightZ;

                parameters.modToggle = json.Mod;

                if (json.CurrentFrame == 1) {
                    canvas1.style.zIndex = 2;
                    canvas2.style.zIndex = 1;
                    render(locations2, gl2, program2);
                } else {
                    canvas1.style.zIndex = 1;
                    canvas2.style.zIndex = 2;
                    render(locations1, gl1, program1);
                }

            }
        };

});

gdo.net.app["Fractals"].initClient = function () {
    gdo.consoleOut('.Fractals', 1, 'Initializing Fractals App Client at Node ' + gdo.clientId);

    gdo.loadScript('params', 'Fractals', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('webgl', 'Fractals', gdo.SCRIPT_TYPE.APP);
    
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
    gdo.consoleOut('.Fractals', 1, 'Eye height = ' + parameters.yHeight);

    gdo.net.app["Fractals"].server.countNodes(gdo.net.node[gdo.clientId].appInstanceId);

    var webgl1 = initWebgl("#glscreen1", locations1);
    var webgl2 = initWebgl("#glscreen2", locations2);

    gl1 = webgl1.gl;
    gl2 = webgl2.gl;
    program1 = webgl1.program;
    program2 = webgl2.program;
    canvas1 = webgl1.canvas;
    canvas2 = webgl2.canvas;

    canvas1.style.zIndex = 1;
    canvas2.style.zIndex = 2;
    
    renderOnce(locations2, gl2, program2);
    render(locations1, gl1, program1);

}

gdo.net.app["Fractals"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.consoleOut('.Fractals', 1, 'Initializing Fractals App Control at Instance ' + gdo.controlId);

    gdo.loadScript('ui', 'Fractals', gdo.SCRIPT_TYPE.APP);
}

gdo.net.app["Fractals"].terminateClient = function () {
    gdo.consoleOut('.Fractals', 1, 'Terminating Fractals App Client at Node ' + clientId);
}

gdo.net.app["Fractals"].ternminateControl = function () {
    gdo.consoleOut('.Fractals', 1, 'Terminating Fractals App Control at Instance ' + gdo.controlId);
    gdo.net.app["Fractals"].server.joystickTerminate(gdo.controlId);
}
