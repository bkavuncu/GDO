var parameters;

$(function () {
    gdo.consoleOut('.Fractals', 1, 'Loaded Fractals JS');
    $.connection.fractalsAppHub.client.receiveName = function (instanceId, name) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.Fractals', 1, 'Instance - ' + instanceId + ": Received Name : " + name);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.Fractals', 1, 'Instance - ' + instanceId + ": Received Name : " + name);
        }
    }

    $.connection.fractalsAppHub.client.updateParams = function (instanceId, xRot, yRot, xTrans, yTrans, zTrans, mod) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {

        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            gdo.consoleOut('.Fractals', 1, 'Updating parameters');

            // Set rotation
            var x = ((gdo.clientId - 1) % 16) - 7.5;
            var angle = (315 / 16) * (Math.PI / 180);
            parameters.xRot = -angle * x + xRot;
            parameters.yRot = yRot;
            parameters.xTrans = xTrans;
            parameters.yTrans = yTrans;
            parameters.zTrans = zTrans;
            parameters.modToggle = mod;
            
        }
    }

});

gdo.net.app["Fractals"].initClient = function (params) {
    gdo.consoleOut('.Fractals', 1, 'Initializing Fractals App Client at Node ' + gdo.clientId);

    // Set horizontal rotation
    var x = ((gdo.clientId - 1) % 16) - 7.5;
    var angle = (315 / 16) * (Math.PI / 180);
    params.xRot = -angle * x;

    // Set vertical height
    var y = Math.floor((gdo.clientId - 1) / 16) - 1.5;
    var ratio = (1080 / 1920);
    params.yHeight = 2.0 * ratio * y;
    gdo.consoleOut('.Fractals', 1, 'Eye height = ' + params.yHeight);

    parameters = params;

}

gdo.net.app["Fractals"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.net.app["Fractals"].server.requestName(gdo.controlId);
    gdo.consoleOut('.Fractals', 1, 'Initializing Fractals App Control at Instance ' + gdo.controlId);



    $("iframe").contents().find("#hello_submit")
    .unbind()
    .click(function () {
        //gdo.consoleOut('.Fractals', 1, 'Sending Name to Clients :' + $("iframe").contents().find('#hello_input').val());
        //gdo.net.app["Fractals"].server.setName(gdo.controlId, $("iframe").contents().find('#hello_input').val());
        gdo.consoleOut('.Fractals', 1, 'Requesting parameters');
        gdo.net.app["Fractals"].server.requestParameters(gdo.controlId);
    });

    $("iframe").contents().find("#left_button")
    .unbind()
    .click(function () {
        gdo.consoleOut('.Fractals', 1, 'Left button clicked');
        gdo.net.app["Fractals"].server.leftButton(gdo.controlId);
    });

    $("iframe").contents().find("#right_button")
    .unbind()
    .click(function () {
    gdo.consoleOut('.Fractals', 1, 'Right button clicked');
    gdo.net.app["Fractals"].server.rightButton(gdo.controlId);
    });

    $("iframe").contents().find("#up_button")
    .unbind()
    .click(function () {
    gdo.consoleOut('.Fractals', 1, 'Up button clicked');
    gdo.net.app["Fractals"].server.upButton(gdo.controlId);
    });

    $("iframe").contents().find("#down_button")
    .unbind()
    .click(function () {
    gdo.consoleOut('.Fractals', 1, 'Down button clicked');
    gdo.net.app["Fractals"].server.downButton(gdo.controlId);
    });

    $("iframe").contents().find("#left_strafe_button")
.unbind()
.click(function () {
    gdo.consoleOut('.Fractals', 1, 'Left strafe button clicked');
    gdo.net.app["Fractals"].server.leftStrafeButton(gdo.controlId);
});

    $("iframe").contents().find("#right_strafe_button")
    .unbind()
    .click(function () {
        gdo.consoleOut('.Fractals', 1, 'Right strafe button clicked');
        gdo.net.app["Fractals"].server.rightStrafeButton(gdo.controlId);
    });

    $("iframe").contents().find("#forward_button")
    .unbind()
    .click(function () {
        gdo.consoleOut('.Fractals', 1, 'Forward button clicked');
        gdo.net.app["Fractals"].server.forwardButton(gdo.controlId);
    });

    $("iframe").contents().find("#back_button")
    .unbind()
    .click(function () {
        gdo.consoleOut('.Fractals', 1, 'Back button clicked');
        gdo.net.app["Fractals"].server.backButton(gdo.controlId);
    });

    $("iframe").contents().find("#mod_toggle")
    .unbind()
    .click(function () {
    gdo.consoleOut('.Fractals', 1, 'Toggled inifinite objects');
    gdo.net.app["Fractals"].server.modToggle(gdo.controlId);
});
}

gdo.net.app["Fractals"].terminateClient = function () {
    gdo.consoleOut('.Fractals', 1, 'Terminating Fractals App Client at Node ' + clientId);
}

gdo.net.app["Fractals"].ternminateControl = function () {
    gdo.consoleOut('.Fractals', 1, 'Terminating Fractals App Control at Instance ' + gdo.controlId);
}
