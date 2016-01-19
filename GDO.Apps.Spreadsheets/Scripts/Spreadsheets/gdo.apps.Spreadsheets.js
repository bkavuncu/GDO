$(function () {
    gdo.consoleOut('.Spreadsheets', 1, 'Loaded Spreadsheets JS');
    $.connection.spreadsheetsAppHub.client.receiveName = function (instanceId, name) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.Spreadsheets', 1, 'Instance - ' + instanceId + ": Received Name : " + name);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.Spreadsheets', 1, 'Instance - ' + instanceId + ": Received Name : " + name);
            $("iframe").contents().find("#sheet_details").empty().append(name);
        }
    }
    $.connection.spreadsheetsAppHub.client.serverToConsole = function (instanceId, level, text) {
        gdo.consoleOut('.Spreadsheets', level, 'Instance - ' + instanceId + ": SERVER : " + text);
    }
});

gdo.net.app["Spreadsheets"].initClient = function () {
    gdo.consoleOut('.Spreadsheets', 1, 'Initializing Spreadsheets App Client at Node ' + gdo.clientId);
}

gdo.net.app["Spreadsheets"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.net.app["Spreadsheets"].server.requestName(gdo.controlId);
    gdo.consoleOut(".Spreadsheets", 1, "Initializing Spreadsheets App Control at Instance " + gdo.controlId);

    $("iframe").contents().find("#spreadsheet_submit")
    .unbind()
    .click(function () {
        var type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        var spreadSheet = $("iframe").contents().find("#sheet").get(0).files[0];
        var config = $("iframe").contents().find("#var").get(0).files[0];
            if (spreadSheet != undefined && config != undefined) {
                if (spreadSheet.type === type && config.type === type) {
                    gdo.net.app["Spreadsheets"].server.setName(gdo.controlId, spreadSheet.name + " <br /> " + config.name);
                    gdo.consoleOut(".Spreadsheets", 1, "Set Name, now calling FileAdded on Server");
                    gdo.consoleOut(".Spreadsheets", 1, "called function.");
                    $("iframe").contents().find("#file_upload_form").submit();
                } else {
                    alert("files should be of type .xls or .xlsx");
                    gdo.consoleOut('.Spreadsheets', 5, 'files should be of type .xls or .xlsx');
                }
            } else {
                alert("please enter a file for both sections.");
                gdo.consoleOut('.Spreadsheets', 5, 'please enter a file for both sections.');
            }
        });
}

gdo.net.app["Spreadsheets"].terminateClient = function () {
    gdo.consoleOut('.Spreadsheets', 1, 'Terminating Spreadsheets App Client at Node ' + clientId);
}

gdo.net.app["Spreadsheets"].ternminateControl = function () {
    gdo.consoleOut('.Spreadsheets', 1, 'Terminating Spreadsheets App Control at Instance ' + gdo.controlId);
}