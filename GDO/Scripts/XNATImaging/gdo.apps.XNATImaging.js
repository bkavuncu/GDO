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

    $.connection.xNATImagingAppHub.client.receiveControl = function (instanceId, controlName) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received Control : " + controlName);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received Control : " + controlName);
            //$("iframe").contents().find("#hello_text").empty().append("Hello " + name);
            gdo.net.app["XNATImaging"].angularControl(controlName);
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

    $("iframe").contents().find("#upNavigationButton")
    .unbind()
    .click(function () {
        gdo.consoleOut('.XNATImaging', 1, 'Sending Control to Clients :' + 'Up');
        //gdo.consoleOut('.XNATImaging', 1, 'Sending Name to Clients :' + $("iframe").contents().find('#upNavigationButton').val());
        gdo.net.app["XNATImaging"].server.setControl(gdo.controlId, $("iframe").contents().find('#upNavigationButton').text());

    });

    $("iframe").contents().find("#downNavigationButton")
    .unbind()
    .click(function () {
        gdo.consoleOut('.XNATImaging', 1, 'Sending Control to Clients :' + 'Down');
        gdo.net.app["XNATImaging"].server.setControl(gdo.controlId, $("iframe").contents().find('#downNavigationButton').text());
       
    });
}

gdo.net.app["XNATImaging"].terminateClient = function () {
    gdo.consoleOut('.XNATImaging', 1, 'Terminating XNATImaging App Client at Node ' + clientId);
}

gdo.net.app["XNATImaging"].terminateControl = function () {
    gdo.consoleOut('.XNATImaging', 1, 'Terminating XNATImaging App Control at Instance ' + gdo.controlId);
}

gdo.net.app["XNATImaging"].angularControl = function (controlName) {
    switch (controlName) {
        case 'Up':
            angular.element('#MainController').scope().navigateUp();
            break;
        case 'Down':
            angular.element('#MainController').scope().navigateDown();
            break;
    }
    angular.element('#MainController').scope().$apply();
}
