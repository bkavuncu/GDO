$(function () {
    gdo.consoleOut('.XNATImaging', 1, 'Loaded XNATImaging JS');
    $.connection.xNATImagingAppHub.client.receiveName = function (instanceId, name) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received Name : " + name);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received Name : " + name);
            $("iframe").contents().find("#hello_text").empty().append("Hello " + name);
        }
    }
});

gdo.net.app["XNATImaging"].initClient = function () {
    gdo.consoleOut('.XNATImaging', 1, 'Initializing XNATImaging App Client at Node ' + gdo.clientId);
}

gdo.net.app["XNATImaging"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.net.app["XNATImaging"].server.requestName(gdo.controlId);
    gdo.consoleOut('.XNATImaging', 1, 'Initializing XNATImaging App Control at Instance ' + gdo.controlId);

    $("iframe").contents().find("#hello_submit")
    .unbind()
    .click(function () {
        gdo.consoleOut('.XNATImaging', 1, 'Sending Name to Clients :' + $("iframe").contents().find('#hello_input').val());
        gdo.net.app["XNATImaging"].server.setName(gdo.controlId, $("iframe").contents().find('#hello_input').val());
    });
}

gdo.net.app["XNATImaging"].terminateClient = function () {
    gdo.consoleOut('.XNATImaging', 1, 'Terminating XNATImaging App Client at Node ' + clientId);
}

gdo.net.app["XNATImaging"].ternminateControl = function () {
    gdo.consoleOut('.XNATImaging', 1, 'Terminating XNATImaging App Control at Instance ' + gdo.controlId);
}
