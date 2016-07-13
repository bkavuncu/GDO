gdo.net.app["Spreadsheets"].clearServer = function(id){
    $.ajax({
        url: "http://146.169.45.194/SheetServer/Operations/ClearServer",
        method: "POST",
        data: { instanceId: id },
        success: function (message) {
            gdo.consoleOut(".Spreadsheets", 1, JSON.stringify(message));
        }
    });
}