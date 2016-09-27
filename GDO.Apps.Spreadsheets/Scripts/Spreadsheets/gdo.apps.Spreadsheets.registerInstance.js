gdo.net.app["Spreadsheets"].registerInstance = function (instanceId, section) {
	var myinstanceId = gdo.net.node[gdo.clientId].appInstanceId;
	var configName = gdo.net.instance[myinstanceId].configName;
	var conf = gdo.net.app["Spreadsheets"].config[configName];
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