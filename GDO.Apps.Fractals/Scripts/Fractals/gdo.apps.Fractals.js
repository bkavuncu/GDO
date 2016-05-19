


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

});

gdo.net.app["Fractals"].initClient = function () {
    gdo.consoleOut('.Fractals', 1, 'Initializing Fractals App Client at Node ' + gdo.clientId);

    gdo.loadScript('params', 'Fractals', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('webgl', 'Fractals', gdo.SCRIPT_TYPE.APP);
    
    parameters = new params();
    locations = new locs();

    // Set horizontal rotation
    var x = ((gdo.clientId - 1) % 16) - 7.5;
    var angle = (315 / 16) * (Math.PI / 180);
    parameters.xRot = -angle * x;

    // Set vertical height
    var y = Math.floor((gdo.clientId - 1) / 16) - 1.5;
    var ratio = (1080 / 1920);
    parameters.yHeight = 2.0 * ratio * y;
    gdo.consoleOut('.Fractals', 1, 'Eye height = ' + parameters.yHeight);

    initWebgl();
}

gdo.net.app["Fractals"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.consoleOut('.Fractals', 1, 'Initializing Fractals App Control at Instance ' + gdo.controlId);


    gdo.net.app["Fractals"].server.joystickInit(gdo.controlId);
    initJoystick("#look_joystick", gdo.net.app["Fractals"].server.joystickReceiveParamsRot);
    initJoystick("#move_joystick", gdo.net.app["Fractals"].server.joystickReceiveParamsMove);
    initHeightSlider("#move_height_range", gdo.net.app["Fractals"].server.heightSliderReceiveParamsMove);

    function initJoystick(id, receiveParams) {

        $("iframe").contents().find(id).on("mousedown", down);
        $("iframe").contents().find(id).on("touchstart", down);

        var size = parseInt($("iframe").contents().find(id).css("width"));

        var orig_x;
        var orig_x_point;

        var orig_y;
        var orig_y_point;

        function down(event) {
            var ele = $("iframe").contents().find(id);

            $("iframe").contents().find(id).stop();

            var clientX;
            var clientY;

            if (event.type == "touchstart") {
                clientX = event.originalEvent.touches[0].clientX;
                clientY = event.originalEvent.touches[0].clientY;
            } else {
                clientX = event.clientX;
                clientY = event.clientY;
            }
            
            orig_x = parseInt(ele.css("left"));
            orig_x_point = clientX;

            orig_y = parseInt(ele.css("top"));
            orig_y_point = clientY;

            $("iframe").contents().find(id).off("mousedown", down);
            $("iframe").contents().find(id).off("touchstart", down);

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
                for (var i = 0; i < event.originalEvent.touches.length; i++) {
                    if (event.originalEvent.touches[i].target.id == id.substring(1)) {
                        clientX = event.originalEvent.touches[i].clientX;
                        clientY = event.originalEvent.touches[i].clientY;
                    }
                }
            } else {
                clientX = event.clientX;
                clientY = event.clientY;
            }

            var x = clientX - orig_x_point;
            var y = clientY - orig_y_point;

            var magnitude = Math.abs(Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
            var theta = Math.atan2(x, y);

            if (magnitude > size / 2) {
                magnitude = 1;
                x = size * Math.sin(theta) / 2;
                y = size * Math.cos(theta) / 2;
            } else {
                magnitude /= (size / 2.0);
            }

            var left = orig_x + x;
            var top = orig_y + y;

            receiveParams(gdo.controlId, theta, magnitude);
            $("iframe").contents().find(id).css("left", left + "px");
            $("iframe").contents().find(id).css("top", top + "px");

            event.preventDefault();
        };

        function up(event) {
            $("iframe").contents().find("#control_body").off("mousemove", move);
            $("iframe").contents().find("#control_body").off("mouseup", up);
            $("iframe").contents().find("#control_body").off("touchmove", move);
            $("iframe").contents().find("#control_body").off("touchend", up);

            receiveParams(gdo.controlId, 0, 0);
            $("iframe").contents().find(id).animate({ left: "50%", top: "50%" }, 200);

            $("iframe").contents().find(id).on("mousedown", down);
            $("iframe").contents().find(id).on("touchstart", down);

            event.preventDefault();
        };

    };

    function initHeightSlider(id, receiveParams) {
        $("iframe").contents().find(id).on("input", input);
        $("iframe").contents().find(id).on("change", change);

        function input(event) {
            receiveParams(gdo.controlId, $("iframe").contents().find(id).val());
        }

        function change(event) {
            receiveParams(gdo.controlId, 0);
            $("iframe").contents().find(id).animate({value: "0.0"}, 200);
        }

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

    $("iframe").contents().find("#red_colour_number").empty().append($("iframe").contents().find("#red_colour_range").val());
    $("iframe").contents().find("#green_colour_number").empty().append($("iframe").contents().find("#green_colour_range").val());
    $("iframe").contents().find("#blue_colour_number").empty().append($("iframe").contents().find("#blue_colour_range").val());

    $("iframe").contents().find("#red_colour_range").on("input", function () {
        red = $("iframe").contents().find("#red_colour_range").val();
        green = $("iframe").contents().find("#green_colour_range").val();
        blue = $("iframe").contents().find("#blue_colour_range").val();
        $("iframe").contents().find("#red_colour_number").empty().append(red);
        $("iframe").contents().find("#colour_box").css("background-color", "rgb(" + red + "," + green + "," + blue + ")");
        gdo.net.app["Fractals"].server.colour(gdo.controlId, red, green, blue);
    });
    $("iframe").contents().find("#green_colour_range").on("input", function () {
        red = $("iframe").contents().find("#red_colour_range").val();
        green = $("iframe").contents().find("#green_colour_range").val();
        blue = $("iframe").contents().find("#blue_colour_range").val();
        $("iframe").contents().find("#green_colour_number").empty().append(green);
        $("iframe").contents().find("#colour_box").css("background-color", "rgb(" + red + "," + green + "," + blue + ")");
        gdo.net.app["Fractals"].server.colour(gdo.controlId, red, green, blue);
    });
    $("iframe").contents().find("#blue_colour_range").on("input", function () {
        red = $("iframe").contents().find("#red_colour_range").val();
        green = $("iframe").contents().find("#green_colour_range").val();
        blue = $("iframe").contents().find("#blue_colour_range").val();
        $("iframe").contents().find("#blue_colour_number").empty().append(blue);
        $("iframe").contents().find("#colour_box").css("background-color", "rgb(" + red + "," + green + "," + blue + ")");
        gdo.net.app["Fractals"].server.colour(gdo.controlId, red, green, blue);
    });

    $("iframe").contents().find("#ambience_number").empty().append($("iframe").contents().find("#ambience_range").val());

    $("iframe").contents().find("#ambience_range").on("input", function () {
        val = $("iframe").contents().find("#ambience_range").val();
        $("iframe").contents().find("#ambience_number").empty().append(val);
        gdo.net.app["Fractals"].server.ambience(gdo.controlId, val);
    });

    $("iframe").contents().find("#light_intensity_number").empty().append($("iframe").contents().find("#light_intensity_range").val());

    $("iframe").contents().find("#light_intensity_range").on("input", function () {
        val = $("iframe").contents().find("#light_intensity_range").val();
        $("iframe").contents().find("#light_intensity_number").empty().append(val);
        gdo.net.app["Fractals"].server.lightIntensity(gdo.controlId, val);
    });

    $("iframe").contents().find("#light_size_number").empty().append($("iframe").contents().find("#light_size_range").val());

    $("iframe").contents().find("#light_size_range").on("input", function () {
        val = $("iframe").contents().find("#light_size_range").val();
        $("iframe").contents().find("#light_size_number").empty().append(val);
        gdo.net.app["Fractals"].server.lightSize(gdo.controlId, val);
    });

    initJoystick("#light_joystick", gdo.net.app["Fractals"].server.joystickReceiveParamsLight);
    initHeightSlider("#light_height_range", gdo.net.app["Fractals"].server.heightSliderReceiveParamsLight);

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
    gdo.net.app["Fractals"].server.joystickTerminate(gdo.controlId);
}
