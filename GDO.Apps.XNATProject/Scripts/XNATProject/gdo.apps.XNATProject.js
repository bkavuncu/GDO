$(function () {
    gdo.consoleOut('.XNATProject', 1, 'Loaded XNATProject JS');
    $.connection.xNATProjectAppHub.client.receiveName = function (instanceId, name) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.XNATProject', 1, 'Instance - ' + instanceId + ": Received Name : " + name);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.XNATProject', 1, 'Instance - ' + instanceId + ": Received Name : " + name);
            $("iframe").contents().find("#hello_text").empty().append("Hello " + name);
        }
    }
});

gdo.net.app["XNATProject"].initClient = function () {
    gdo.consoleOut('.XNATProject', 1, 'Initializing XNATProject App Client at Node ' + gdo.clientId);
}

gdo.net.app["XNATProject"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.net.app["XNATProject"].server.requestName(gdo.controlId);
    gdo.consoleOut('.XNATProject', 1, 'Initializing XNATProject App Control at Instance ' + gdo.controlId);

    $("iframe").contents().find("#hello_submit")
    .unbind()
    .click(function () {
        gdo.consoleOut('.XNATProject', 1, 'Sending Name to Clients :' + $("iframe").contents().find('#hello_input').val());
        gdo.net.app["XNATProject"].server.setName(gdo.controlId, $("iframe").contents().find('#hello_input').val());
    });
}

gdo.net.app["XNATProject"].terminateClient = function () {
    gdo.consoleOut('.XNATProject', 1, 'Terminating XNATProject App Client at Node ' + clientId);
}

gdo.net.app["XNATProject"].ternminateControl = function () {
    gdo.consoleOut('.XNATProject', 1, 'Terminating XNATProject App Control at Instance ' + gdo.controlId);
}
