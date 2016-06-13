$(function () {
    gdo.consoleOut('.HelloWorld', 1, 'Loaded HelloWorld JS');
    $.connection.helloWorldAppHub.client.receiveName = gdo.net.app["HelloWorld"].receiveName;
});

gdo.net.app["HelloWorld"].initClient = function () {
    gdo.consoleOut('.HelloWorld', 1, 'Initializing HelloWorld App Client at Node ' + gdo.clientId);
}

gdo.net.app["HelloWorld"].initControl = function () {
    gdo.controlId = parseInt(getUrlVar("controlId"));
    gdo.net.app["HelloWorld"].server.requestName(gdo.controlId);
    gdo.consoleOut('.HelloWorld', 1, 'Initializing HelloWorld App Control at Instance ' + gdo.controlId);

    $("iframe").contents().find("#hello_submit")
    .unbind()
    .click(function () {
        gdo.consoleOut('.HelloWorld', 1, 'Sending Name to Clients :[' + $("iframe").contents().find('#hello_input').val());
        gdo.net.app["HelloWorld"].server.setName(gdo.controlId, $("iframe").contents().find('#hello_input').val() + " lol.");
    });
}

gdo.net.app["HelloWorld"].receiveName = function (instanceId, name) {
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        gdo.consoleOut('.HelloWorld', 1, 'Instance - ' + instanceId + ": Received Name : " + name);
    } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
        gdo.consoleOut('.HelloWorld', 1, 'Instance - ' + instanceId + ": Received Name : " + name);
        $("iframe").contents().find("#hello_text").empty().append("Hello " + name);
    }
}

gdo.net.app["HelloWorld"].terminateClient = function () {
    gdo.consoleOut('.HelloWorld', 1, 'Terminating HelloWorld App Client at Node ' + clientId);
}

gdo.net.app["HelloWorld"].ternminateControl = function () {
    gdo.consoleOut('.HelloWorld', 1, 'Terminating HelloWorld App Control at Instance ' + gdo.controlId);
}
