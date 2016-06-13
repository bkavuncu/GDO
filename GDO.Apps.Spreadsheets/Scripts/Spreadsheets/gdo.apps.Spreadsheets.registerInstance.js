gdo.net.app["Spreadsheets"].registerInstance = function (instanceId, section) {
	$.ajax({
		url: "http://146.169.45.194/SheetServer/Operations/RegisterInstance",
		method: "POST",
		data: { instanceId: instanceId, section: section },
		success: function (message) {
			gdo.consoleOut(".Spreadsheets", 1, message.message);
		    gdo.consoleOut(".Spreadsheets", 1, JSON.stringify(message.section));
		}
	});
}