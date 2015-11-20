$(function () {
    gdo.consoleOut('.SAGE2', 1, 'Loaded SAGE2 JS');
});

gdo.net.app["SAGE2"].initClient = function () {
    gdo.consoleOut('.SAGE2', 1, 'Initializing SAGE2 App Client at Node ' + gdo.clientId);
}

gdo.net.app["SAGE2"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
}

gdo.net.app["SAGE2"].terminateClient = function () {
    gdo.consoleOut('.SAGE2', 1, 'Terminating SAGE2 App Client at Node ' + clientId);
}

gdo.net.app["SAGE2"].ternminateControl = function () {
    gdo.consoleOut('.SAGE2', 1, 'Terminating SAGE2 App Control at Instance ' + gdo.controlId);
}
