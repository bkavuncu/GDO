$(function () {
    gdo.consoleOut('.Spreadsheets', 1, 'Loaded Spreadsheets JS');
    $.connection.spreadsheetsAppHub.client.receiveName = function (instanceId, name) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.Spreadsheets', 1, 'Instance - ' + instanceId + ": Received Name : " + name);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.Spreadsheets', 1, 'Instance - ' + instanceId + ": Received Name : " + name);
            $("iframe").contents().find("#hello_text").empty().append("Hello " + name);
        }
    }
});

gdo.net.app["Spreadsheets"].initClient = function () {
    gdo.consoleOut('.Spreadsheets', 1, 'Initializing Spreadsheets App Client at Node ' + gdo.clientId);
}

gdo.net.app["Spreadsheets"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.net.app["Spreadsheets"].server.requestName(gdo.controlId);
    gdo.consoleOut('.Spreadsheets', 1, 'Initializing Spreadsheets App Control at Instance ' + gdo.controlId);

    $("iframe").contents().find("#hello_submit")
    .unbind()
    .click(function () {
        gdo.consoleOut('.Spreadsheets', 1, 'Sending Name to Clients :' + $("iframe").contents().find('#hello_input').val());
        gdo.net.app["Spreadsheets"].server.setName(gdo.controlId, $("iframe").contents().find('#hello_input').val());



    });
}

gdo.net.app["Spreadsheets"].terminateClient = function () {
    gdo.consoleOut('.Spreadsheets', 1, 'Terminating Spreadsheets App Client at Node ' + clientId);
}

gdo.net.app["Spreadsheets"].ternminateControl = function () {
    gdo.consoleOut('.Spreadsheets', 1, 'Terminating Spreadsheets App Control at Instance ' + gdo.controlId);
}