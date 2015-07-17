$(function () {
    // We need to register functions that server calls on client before hub connection established,
    // that is why they are on load
    consoleOut('.APP.TILE', 2, 'Initialized Tile App');
    $.connection.tileAppHub.client.receiveTest = function (test) {
        consoleOut('.APP.TILE', 2, 'Test ' + test);
    };
});