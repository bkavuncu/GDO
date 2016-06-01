
gdo.net.app["RayMarching"].server.joystickInit(gdo.controlId);
initJoystick("#look_joystick", gdo.net.app["RayMarching"].server.joystickReceiveParamsRot);
initJoystick("#move_joystick", gdo.net.app["RayMarching"].server.joystickReceiveParamsMove);
initHeightSlider("#move_height_range", gdo.net.app["RayMarching"].server.heightSliderReceiveParamsMove);

$("iframe").contents().find("#sync_toggle")
    .unbind()
    .click(function () {
        gdo.net.app["RayMarching"].server.syncToggle(gdo.controlId);
    });

$("iframe").contents().find("#sync_time_number").empty().append($("iframe").contents().find("#sync_time_range").val());

$("iframe").contents().find("#sync_time_range").on("input", function () {
    val = $("iframe").contents().find("#sync_time_range").val();
    $("iframe").contents().find("#sync_time_number").empty().append(val);
    gdo.net.app["RayMarching"].server.syncTime(gdo.controlId, val);
});

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
        $("iframe").contents().find(id).animate({ value: "0.0" }, 200);
    }

};