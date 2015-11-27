$(function () {
    gdo.consoleOut('.WebGL', 1, 'Loaded WebGL JS');
    $.connection.webGLAppHub.client.receiveName = function (instanceId, name) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.WebGL', 1, 'Instance - ' + instanceId + ": Received Name : " + name);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.WebGL', 1, 'Instance - ' + instanceId + ": Received Name : " + name);
            $("iframe").contents().find("#hello_text").empty().append("Hello " + name);
        }
    }
});

gdo.net.app["WebGL"].initClient = function () {
    gdo.consoleOut('.WebGL', 1, 'Initializing WebGL App Client at Node ' + gdo.clientId);
}

gdo.net.app["WebGL"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.net.app["WebGL"].server.requestName(gdo.controlId);
    gdo.consoleOut('.WebGL', 1, 'Initializing WebGL App Control at Instance ' + gdo.controlId);

    $("iframe").contents().find("#hello_submit")
    .unbind()
    .click(function () {
        gdo.consoleOut('.WebGL', 1, 'Sending Name to Clients :' + $("iframe").contents().find('#hello_input').val());
        gdo.net.app["WebGL"].server.setName(gdo.controlId, $("iframe").contents().find('#hello_input').val());
    });
}

gdo.net.app["WebGL"].terminateClient = function () {
    gdo.consoleOut('.WebGL', 1, 'Terminating WebGL App Client at Node ' + clientId);
}

gdo.net.app["WebGL"].ternminateControl = function () {
    gdo.consoleOut('.WebGL', 1, 'Terminating WebGL App Control at Instance ' + gdo.controlId);
}
