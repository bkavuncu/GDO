var obtainFormulae = function(id, attemptNo) {
    $.ajax({
        url: "http://146.169.45.194/SheetServer/Operations/CheckFormulae",
        method: "GET",
        data: { instanceId: id },
        success : function(response) {
            if (response.success) {
                console.log(response);
                $('iframe').contents().find('#link_result').html("<p style=\"color:green\">Successfully obtained formulae.</p>");
            } else {
                $('iframe').contents().find('#link_result').html("<p style=\"color:red\">Attempt " + attemptNo + ". Could not get formulae, trying again.</p>");
                setTimeout(function() { obtainFormulae(id, attemptNo + 1) }, 500);
            }
        }
    })
}

gdo.net.app["Spreadsheets"].linkOutputs = function (id, model, config, section) {
    $.ajax({
        url: "http://146.169.45.194/SheetServer/Operations/SetupLinkOutputs",
        method: "POST",
        data: { instanceId: id, model: model, config: config },
        success: function (response) {
            if (response.success) {
                gdo.consoleOut(".Spreadsheets", 1, response.message);
                obtainFormulae(id, 1);
                gdo.consoleOut(".Spreadsheets", 1, "Now to obtain formulae information from server.");
            } else {
                $('iframe').contents().find('#view_model_message').html("<p style=\"color:red\">Exception[SetupLinkOutputs]:" + response.message + "</p>");
                gdo.consoleOut(".Spreadsheets", 1, "Exception[SetupLinkOutputs]:" + response.message);
            }
        }
    });
}
