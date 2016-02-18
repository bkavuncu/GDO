var rot;

$(function () {
    gdo.consoleOut('.Fractals', 1, 'Loaded Fractals JS');
    $.connection.fractalsAppHub.client.receiveName = function (instanceId, name) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.Fractals', 1, 'Instance - ' + instanceId + ": Received Name : " + name);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.Fractals', 1, 'Instance - ' + instanceId + ": Received Name : " + name + " testing --------");
            rot.xRot += 0.01;
        }
    }

    $.connection.fractalsAppHub.client.leftButton = function (instanceId) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            
            rot.xRot += 0.01;
        }
    }

    $.connection.fractalsAppHub.client.rightButton = function (instanceId) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {

        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            rot.xRot -= 0.01;
        }
    }

    $.connection.fractalsAppHub.client.upButton = function (instanceId) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {

        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            rot.yRot -= 0.01;
        }
    }

    $.connection.fractalsAppHub.client.downButton = function (instanceId) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {

        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            rot.yRot += 0.01;
        }
    }

    $.connection.fractalsAppHub.client.modToggle = function (instanceId) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {

        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            if (rot.modToggle == 0) {
                rot.modToggle = 1;
            } else {
                rot.modToggle = 0;
            }
        }
    }
});

gdo.net.app["Fractals"].initClient = function (rotationParams) {
    gdo.consoleOut('.Fractals', 1, 'Initializing Fractals App Client at Node ' + gdo.clientId);

    // Set horizontal rotation
    var x = ((gdo.clientId - 1) % 16) - 7.5;
    var angle = (315 / 16) * (Math.PI / 180);
    rotationParams.xRot = -angle * x;

    // Set vertical height
    var y = Math.floor((gdo.clientId - 1) / 16) - 1.5;
    var ratio = (1080 / 1920);
    rotationParams.yHeight = 2.0 * ratio * y;
    gdo.consoleOut('.Fractals', 1, 'Eye height = ' + rotationParams.yHeight);

    rot = rotationParams;
}

gdo.net.app["Fractals"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.net.app["Fractals"].server.requestName(gdo.controlId);
    gdo.consoleOut('.Fractals', 1, 'Initializing Fractals App Control at Instance ' + gdo.controlId);

    $("iframe").contents().find("#hello_submit")
    .unbind()
    .click(function () {
        gdo.consoleOut('.Fractals', 1, 'Sending Name to Clients :' + $("iframe").contents().find('#hello_input').val());
        gdo.net.app["Fractals"].server.setName(gdo.controlId, $("iframe").contents().find('#hello_input').val());
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
