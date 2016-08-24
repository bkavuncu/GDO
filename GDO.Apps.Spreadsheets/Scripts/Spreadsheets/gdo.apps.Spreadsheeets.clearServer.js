gdo.net.app["Spreadsheets"].clearServer = function (id) {
    var confName = this.gdo.net.instance[this.instanceId].configName;
    var conf = this.gdo.net.app["Spreadsheets"].config[configName];
    $.ajax({
        url: conf.serverAddress + "Operations/ClearServer",
        method: "POST",
        data: { instanceId: id },
        success: function (message) {
            gdo.consoleOut(".Spreadsheets", 1, JSON.stringify(message));
        }
    });
}