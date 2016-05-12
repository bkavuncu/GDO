﻿var parameters;

$(function () {
    gdo.consoleOut('.Fractals', 1, 'Loaded Fractals JS');
    $.connection.fractalsAppHub.client.receiveName = function (instanceId, name) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.Fractals', 1, 'Instance - ' + instanceId + ": Received Name : " + name);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.Fractals', 1, 'Instance - ' + instanceId + ": Received Name : " + name);
        }
    }

    $.connection.fractalsAppHub.client.updateParams = function (instanceId, xRot, yRot, xTrans, yTrans, zTrans, maxSteps, detail, ambience, iterations, power, mod) {
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

            parameters.maxSteps = maxSteps;
            parameters.detail = detail;

            parameters.iterations = iterations;
            parameters.power = power;

            parameters.ambience = ambience;

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


    $(function () {
        $("iframe").contents().find("#test").on("mousedown", down);
        $("iframe").contents().find("#test").on("touchstart", down);
        size = parseInt($("iframe").contents().find("#test").css("width"));
    });

    var size;

    var orig_x;
    var orig_x_point;

    var orig_y;
    var orig_y_point;

    function down(event) {
        var ele = $("iframe").contents().find("#test");

        $("iframe").contents().find("#test").stop();

        var clientX;
        var clientY;

        if (event.type == "touchstart") {
            clientX = event.originalEvent.touches[0].clientX;
            clientY = event.originalEvent.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }

        orig_x = parseInt(ele.css("left")) / 100 * parseInt(ele.parent().css("width"));
        orig_x_point = clientX;

        orig_y = parseInt(ele.css("top")) / 100 * parseInt(ele.parent().css("width"));
        orig_y_point = clientY;

        $("iframe").contents().find("#test").off("mousedown", down);
        $("iframe").contents().find("#test").off("touchstart", down);

        $("iframe").contents().find("#control_body").on("mousemove", move);
        $("iframe").contents().find("#control_body").on("mouseup", up);
        $("iframe").contents().find("#control_body").on("touchmove", move);
        $("iframe").contents().find("#control_body").on("touchend", up);

        event.preventDefault();
    };

    function move(event) {
        var clientX;
        var clientY;

        if (event.type == "touchmove") {
            clientX = event.originalEvent.touches[0].clientX;
            clientY = event.originalEvent.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }

        var x = clientX - orig_x_point;
        var y = clientY - orig_y_point;

        var magnitude = Math.abs(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));

        if (magnitude > size / 2) {
            var theta = Math.atan2(x, y);
            x = size * Math.sin(theta) / 2;
            y = size * Math.cos(theta) / 2;
        }

        var left = orig_x + x;
        var top = orig_y + y;
        
        $("iframe").contents().find("#test").css("left", left);
        $("iframe").contents().find("#test").css("top", top + "px");
        event.preventDefault();
    };

    function up(event) {
        $("iframe").contents().find("#control_body").off("mousemove", move);
        $("iframe").contents().find("#control_body").off("mouseup", up);
        $("iframe").contents().find("#control_body").off("touchmove", move);
        $("iframe").contents().find("#control_body").off("touchend", up);

        $("iframe").contents().find("#test").animate({ left: "50%", top: "50%" }, 200);
        
        $("iframe").contents().find("#test").on("mousedown", down);
        $("iframe").contents().find("#test").on("touchstart", down);

        event.preventDefault();
    };





    $("iframe").contents().find("#max_steps_number").empty().append($("iframe").contents().find("#max_steps_range").val());

    $("iframe").contents().find("#max_steps_range").on("input", function () {
        val = $("iframe").contents().find("#max_steps_range").val();
        $("iframe").contents().find("#max_steps_number").empty().append(val);
        gdo.net.app["Fractals"].server.maxSteps(gdo.controlId, val);
    });

    $("iframe").contents().find("#detail_number").empty().append(Math.round(Math.pow(10,$("iframe").contents().find("#detail_range").val())*100000)/100000);

    $("iframe").contents().find("#detail_range").on("input", function () {
        val = $("iframe").contents().find("#detail_range").val();
        $("iframe").contents().find("#detail_number").empty().append(Math.round(Math.pow(10, val) * 100000) / 100000);
        gdo.net.app["Fractals"].server.detail(gdo.controlId, val);
    });

    $("iframe").contents().find("#iterations_number").empty().append($("iframe").contents().find("#iterations_range").val());

    $("iframe").contents().find("#iterations_range").on("input", function () {
        val = $("iframe").contents().find("#iterations_range").val();
        $("iframe").contents().find("#iterations_number").empty().append(val);
        gdo.net.app["Fractals"].server.iterations(gdo.controlId, val);
    });

    $("iframe").contents().find("#power_number").empty().append($("iframe").contents().find("#power_range").val());

    $("iframe").contents().find("#power_range").on("input", function () {
        val = $("iframe").contents().find("#power_range").val();
        $("iframe").contents().find("#power_number").empty().append(val);
        gdo.net.app["Fractals"].server.power(gdo.controlId, val);
    });

    $("iframe").contents().find("#ambience_number").empty().append($("iframe").contents().find("#ambience_range").val());

    $("iframe").contents().find("#ambience_range").on("input", function () {
        val = $("iframe").contents().find("#ambience_range").val();
        $("iframe").contents().find("#ambience_number").empty().append(val);
        gdo.net.app["Fractals"].server.ambience(gdo.controlId, val);
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
