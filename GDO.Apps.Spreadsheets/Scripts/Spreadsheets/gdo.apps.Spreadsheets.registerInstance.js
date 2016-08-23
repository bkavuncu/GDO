gdo.net.app["Spreadsheets"].registerInstance = function (instanceId, section) {
    var confName = this.gdo.net.instance[this.instanceId].configName;
    var conf = this.gdo.net.app["Spreadsheets"].config[configName];
	$.ajax({
		url: conf.serverAddress + "Operations/RegisterInstance",
		method: "POST",
		data: { instanceId: instanceId, section: section },
		success: function (message) {
			gdo.consoleOut(".Spreadsheets", 1, message.message);
		    gdo.consoleOut(".Spreadsheets", 1, JSON.stringify(message.section));
		}
	});
}