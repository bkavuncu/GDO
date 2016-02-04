gdo.net.app["Spreadsheets"].viewModel = function (id , model, config) {
	$.ajax({
	    url: "http://localhost:1395/Operations/ViewModel",
        method: "POST",
	    data: {instanceId:id, model: model, config: config },
		success: function(message) {
		    gdo.consoleOut(".Spreadsheets", 1, JSON.stringify(message));
		}
    });
}