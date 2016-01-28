
$(function () {
    gdo.consoleOut('.Fractals', 1, 'Loaded Fractals JS');
    $.connection.fractalsAppHub.client.receiveName = function (instanceId, name) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.Fractals', 1, 'Instance - ' + instanceId + ": Received Name : " + name);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.Fractals', 1, 'Instance - ' + instanceId + ": Received Name : " + name + " testing --------");
        }
    }
});

gdo.net.app["Fractals"].initClient = function () {
    gdo.consoleOut('.Fractals', 1, 'Initializing Fractals App Client at Node ' + gdo.clientId);
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
}

gdo.net.app["Fractals"].terminateClient = function () {
    gdo.consoleOut('.Fractals', 1, 'Terminating Fractals App Client at Node ' + clientId);
}

gdo.net.app["Fractals"].ternminateControl = function () {
    gdo.consoleOut('.Fractals', 1, 'Terminating Fractals App Control at Instance ' + gdo.controlId);
}
