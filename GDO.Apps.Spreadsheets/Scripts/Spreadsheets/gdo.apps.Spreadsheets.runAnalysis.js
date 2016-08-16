﻿gdo.net.app["Spreadsheets"].runAnalysis = function (id, model, config, section) {
    gdo.consoleOut(".Spreadsheets", 1, "RunAnalysis[" + id + "] : model:" + JSON.stringify(model) + " config: " + JSON.stringify(config));
    $.ajax({
        url: "http://146.169.45.194/SheetServer/Operations/RunAnalysis",
        method: "POST",
        data: { instanceId: id, model: model, config: config },
        success: function (response) {
            if (response.success) {
                $('iframe').contents().find('#analysis_result').html("<p style=\"color:green\">" + response.message + "</p>");
                gdo.consoleOut(".Spreadsheets", 1, response.message);
            } else {
                $('iframe').contents().find('#analysis_result').html("<p style=\"color:red\">Exception[Analysis]:" + response.message + "</p>");
                gdo.consoleOut(".Spreadsheets", 1, "Exception[Analysis]:" + response.message);
            }
        }
    });
}