$(function() {
    gdo.consoleOut('.tranSMART', 1, 'Loaded TM');

    $.connection.tranSMARTAppHub.client.setMessage = function (message) {
        gdo.consoleOut('.tranSMART', 1, 'Message from server: ' + message);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            $("iframe").contents().find("#message_from_server").html(message);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            // do nothing
        }
    }
});

gdo.net.app["tranSMART"].initClient = function () {
    gdo.consoleOut('.tranSMART', 1, 'Initializing transmart Clients' + gdo.clientId);
}

gdo.net.app["tranSMART"].initControl = function (controlId) {
    gdo.consoleOut('.tranSMART', 1, 'Initializing tranSMART App Control at Instance ' + controlId);
}

gdo.net.app["tranSMART"].terminateClient = function (instanceId) {
    gdo.consoleOut('.tranSMART', 1, 'Terminating tranSMART App Client at Node ' + instanceId);
}

gdo.net.app["tranSMART"].ternminateControl = function (instanceId) {
    gdo.consoleOut('.tranSMART', 1, 'Terminating tranSMART App Control at Instance ' + instanceId);
}