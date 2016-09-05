gdo.net.app["Spreadsheets"].clearServer = function (id) {
    var instanceId = gdo.net.node[gdo.clientId].appInstanceId;
    var configName = gdo.net.instance[instanceId].configName;
    var conf = gdo.net.app["Spreadsheets"].config[configName];
    $.ajax({
        url: conf.serverAddress + "Operations/ClearServer",
        method: "POST",
        data: { instanceId: id },
        success: function (message) {
            gdo.consoleOut(".Spreadsheets", 1, JSON.stringify(message));
        }
    });
}