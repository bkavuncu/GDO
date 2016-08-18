$(function () {
    gdo.consoleOut('.Globe', 1, 'Loaded Globe JS');
    $.connection.globeAppHub.client.receiveName = function (instanceId, name) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.Globe', 1, 'Instance - ' + instanceId + ": Received Name : " + name);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.Globe', 1, 'Instance - ' + instanceId + ": Received Name : " + name);
            $("iframe").contents().find("#hello_text").empty().append("Hello " + name);
        }
    }
});

gdo.net.app["Globe"].initClient = function () {
    gdo.consoleOut('.Globe', 1, 'Initializing Globe App Client at Node ' + gdo.clientId);
}

gdo.net.app["Globe"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.net.app["Globe"].server.requestName(gdo.controlId);
    gdo.consoleOut('.Globe', 1, 'Initializing Globe App Control at Instance ' + gdo.controlId);

    $("iframe").contents().find("#hello_submit")
    .unbind()
    .click(function () {
        gdo.consoleOut('.Globe', 1, 'Sending Name to Clients :' + $("iframe").contents().find('#hello_input').val());
        gdo.net.app["Globe"].server.setName(gdo.controlId, $("iframe").contents().find('#hello_input').val());
    });
}

gdo.net.app["Globe"].terminateClient = function () {
    gdo.consoleOut('.Globe', 1, 'Terminating Globe App Client at Node ' + clientId);
}

gdo.net.app["Globe"].ternminateControl = function () {
    gdo.consoleOut('.Globe', 1, 'Terminating Globe App Control at Instance ' + gdo.controlId);
}
