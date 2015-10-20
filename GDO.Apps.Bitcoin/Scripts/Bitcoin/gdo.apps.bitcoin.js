$(function () {
    gdo.consoleOut('.Bitcoin', 1, 'Loaded Bitcoin JS');

});

gdo.net.app["Bitcoin"].control_status = 0; // 0 disabled, 1 activated



gdo.net.app["Bitcoin"].initClient = function () {
    gdo.consoleOut('.Bitcoin', 1, 'Initializing Bitcoin App Client at Node ' + gdo.clientId);
}

gdo.net.app["Bitcoin"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.net.app["Bitcoin"].control_status = 0;
    gdo.consoleOut('.Bitcoin', 1, 'Initializing Bitcoin App Control at Instance ' + gdo.controlId);
}

gdo.net.app["Bitcoin"].terminateClient = function () {
    gdo.consoleOut('.Bitcoin', 1, 'Terminating Bitcoin App Client at Node ' + clientId);
}

gdo.net.app["Bitcoin"].ternminateControl = function () {
    gdo.consoleOut('.Bitcoin', 1, 'Terminating Bitcoin App Control at Instance ' + gdo.controlId);
}
