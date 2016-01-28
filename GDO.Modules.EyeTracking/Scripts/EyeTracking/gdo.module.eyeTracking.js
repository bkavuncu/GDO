
$(function () {
    gdo.net.module["EyeTracking"].mapRadius = 100;
    gdo.consoleOut('.EyeTracking', 1, 'Loaded EyeTracking JS');
    gdo.net.module["EyeTracking"].numUsers = 4;

    $.connection.eyeTrackingModuleHub.client.updateReferenceMode = function (mode) {
        gdo.consoleOut('.EyeTracking', 1, 'Reference Mode: ' + mode);
        gdo.net.module["EyeTracking"].referenceMode = mode;
        if (mode) {
            $('#eyetracking_references_outer').show();
            $('#eyetracking_references_inner').show();
            $('#eyetracking_references_table').show();
        } else {
            $('#eyetracking_references_outer').hide();
            $('#eyetracking_references_inner').hide();
            $('#eyetracking_references_table').hide();
        }
        gdo.net.module["EyeTracking"].updateButtons();
    }

    $.connection.eyeTrackingModuleHub.client.receiveData = function (timestamp, userId, nodeId, x, y, angle, distance) {
        //save it ?
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //put it on cursor
            //if nodeId is one of the neighbours or us display
        } else if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.net.module["EyeTracking"].displayDataOnUserTable(userId, gdo.net.node[nodeId].col, gdo.net.node[nodeId].row);
            gdo.net.module["EyeTracking"].displayLocationOnUserMap(userId, angle, distance);
            //pass it to flot
        }
    }

    //create a debug function to upload fake data
    //create a function to pass data to morris

    $.connection.eyeTrackingModuleHub.client.updateCursorMode = function (mode) {
        gdo.consoleOut('.EyeTracking', 1, 'Cursor Mode: ' + mode);
        gdo.net.module["EyeTracking"].cursorMode = mode;
        gdo.net.module["EyeTracking"].updateButtons();
    }
    $.connection
        .eyeTrackingModuleHub.client.updateReferenceSize = function (size) {
            gdo.consoleOut('.EyeTracking', 1, 'Reference Size: ' + size * 8 + 'px');
            gdo.net.module["EyeTracking"].referenceSize = size;
            if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
                if (!$('#eyetracking_references_outer')[1]) {
                    $("body").append("<div id='eyetracking_references_outer'  unselectable='on' class='unselectable' style='position: absolute; display: none; bottom: 0px; right: 0px; z-index: 900; background:white; width:" + gdo.net.module["EyeTracking"].referenceSize * 8 + "px; height:" + gdo.net.module["EyeTracking"].referenceSize * 8 + "px'></div>");
                    $("body").append("<div id='eyetracking_references_inner'  unselectable='on' class='unselectable' style='position: absolute; display: none; bottom: " + gdo.net.module["EyeTracking"].referenceSize + "px; right: " + gdo.net.module["EyeTracking"].referenceSize + "px; z-index: 950; background:black; width:" + gdo.net.module["EyeTracking"].referenceSize * 6 + "px; height:" + gdo.net.module["EyeTracking"].referenceSize * 6 + "px'></div>");
                    $("body").append("<table id='eyetracking_references_table' unselectable='on' class='unselectable' style='position: absolute; display: none; bottom: " + gdo.net.module["EyeTracking"].referenceSize * 2 + "px; right: " + gdo.net.module["EyeTracking"].referenceSize * 2 + "px; z-index:999;width: " + gdo.net.module["EyeTracking"].referenceSize * 4 + "px; height:" + gdo.net.module["EyeTracking"].referenceSize * 4 + "px;border-collapse: collapse; border-spacing: 0px;' ></table>");
                    //create cursors
                }
                gdo.net.module["EyeTracking"].drawReferenceTable(parseInt(gdo.clientId));
            }
        }
});



gdo.net.module["EyeTracking"].initModule = function () {
    gdo.consoleOut('.EyeTracking', 1, 'Initializing EyeTracking Module');
    gdo.net.module["EyeTracking"].server.requestReferenceSize();
    gdo.net.module["EyeTracking"].server.requestReferenceMode();
    gdo.net.module["EyeTracking"].server.requestCursorMode();
}

gdo.net.module["EyeTracking"].initControl = function () {
    gdo.consoleOut('.EyeTracking', 1, 'Initializing EyeTracking Module Control');
    gdo.net.module["EyeTracking"].updateButtons();
    for (var i = 1; i < gdo.net.module["EyeTracking"].numUsers + 1; i++) {
        gdo.net.module["EyeTracking"].drawUserTable(i, gdo.net.cols, gdo.net.rows);
        $("iframe").contents().find("#user_" + i + "_location")
            .css("width", gdo.net.module["EyeTracking"].mapRadius * 2)
            .css("height", gdo.net.module["EyeTracking"].mapRadius * 2);
        $("iframe").contents().find("#user_" + i + "_marker")
            .css("width", gdo.net.module["EyeTracking"].mapRadius / 5)
            .css("height", gdo.net.module["EyeTracking"].mapRadius / 5)
            .css("top", (gdo.net.module["EyeTracking"].mapRadius / 10) * 9)
            .css("left", (gdo.net.module["EyeTracking"].mapRadius / 10) * 9);
    }
}

gdo.net.module["EyeTracking"].terminateControl = function () {
    gdo.consoleOut('.EyeTracking', 1, 'Terminating EyeTracking Module Control');
}

gdo.net.module["EyeTracking"].displayStatusOnUserPanel = function (userId, message) {
    $("iframe").contents().find("#user_" + userId + "_status").empty().append(message);
}

gdo.net.module["EyeTracking"].displayLocationOnUserMap = function (userId, angle, distance) {
    var x = (gdo.net.module["EyeTracking"].mapRadius + Math.round((((gdo.net.module["EyeTracking"].mapRadius / 100) * distance) * Math.sin(angle * (Math.PI / 180))))) - (gdo.net.module["EyeTracking"].mapRadius / 10);
    var y = (gdo.net.module["EyeTracking"].mapRadius + Math.round((((gdo.net.module["EyeTracking"].mapRadius / 100) * distance) * Math.cos(angle * (Math.PI / 180))))) - (gdo.net.module["EyeTracking"].mapRadius / 10);
    $("iframe").contents().find("#user_" + userId + "_marker").css("top", y).css("left", x);
}

gdo.net.module["EyeTracking"].displayDataOnUserTable = function (userId, col, row) {
    for (var i = 0; i < gdo.net.cols; i++) {
        for (var j = 0; j < gdo.net.rows; j++) {
            $("iframe").contents().find("#user_" + userId + "_coordinates_row_" + j + "_col_" + i).css("background", "#111111");
        }
    }
    switch (userId) {
        case 1:
            $("iframe").contents().find("#user_" + userId + "_coordinates_row_" + row + "_col_" + col).css("background", "#2A9FD6");
            break;
        case 2:
            $("iframe").contents().find("#user_" + userId + "_coordinates_row_" + row + "_col_" + col).css("background", "#77B300");
            break;
        case 3:
            $("iframe").contents().find("#user_" + userId + "_coordinates_row_" + row + "_col_" + col).css("background", "#FF8800");
            break;
        case 4:
            $("iframe").contents().find("#user_" + userId + "_coordinates_row_" + row + "_col_" + col).css("background", "#CC0000");
            break;
        default:
            break;
    }
    //setTimeout(function () { $("iframe").contents().find("#user_" + userId + "_coordinates_row_" + row + "_col_" + col).css("background", "#111111"); }, 700);
}

gdo.net.module["EyeTracking"].drawEmptyUserTable = function (userId, maxCol, maxRow) {
    $("iframe").contents().find("#user_" + userId + "_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("iframe").contents().find("#user_" + userId + "_coordinates").append("<tr id='user_" + userId + "_coordinates_row_" + i + "' row='" + i + "'></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("iframe").contents().find("#user_" + userId + "_coordinates tr:last").append("<td id='user_" + userId + "_coordinates_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'></td>").css('overflow', 'hidden');
        }
    }
}

gdo.net.module["EyeTracking"].drawUserTable = function (userId, maxCol, maxRow) {
    gdo.net.module["EyeTracking"].drawEmptyUserTable(userId, maxCol, maxRow);
    for (var i = 0; i < maxCol; i++) {
        for (var j = 0; j < maxRow; j++) {
            $("iframe").contents().find("#user_" + userId + "_coordinates_row_" + j + "_col_" + i)
                .empty()
                .css("width", 50 / maxCol + "vw")
                .css("height", 8 / maxRow + "vh")
                .css("border", "1px solid grey")
                .css('padding', 0)
                .css('overflow', 'hidden');
        }
    }
}

gdo.net.module["EyeTracking"].drawEmptyReferenceTable = function () {
    $("#eyetracking_references_table").empty();
    for (var i = 0; i < 4; i++) {
        $("#eyetracking_references_table").append("<tr id='eyetracking_references_table_row_" + i + "' row='" + i + "'></tr>");
        for (var j = 0; j < 4; j++) {
            $("#eyetracking_references_table tr:last").append("<td id='eyetracking_references_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'></td>").css('overflow', 'hidden');
        }
    }
}

gdo.net.module["EyeTracking"].drawReferenceTable = function (input) {
    var dataMatrix = gdo.net.module["EyeTracking"].convertToDataMatrix(input);
    gdo.net.module["EyeTracking"].drawEmptyReferenceTable();
    for (var i = 0; i < 4; i++) {

        for (var j = 0; j < 4; j++) {
            $("#eyetracking_references_table_row_" + i + "_col_" + j)
                .empty()
                .css("width", gdo.net.module["EyeTracking"].referenceSize + "px")
                .css("height", gdo.net.module["EyeTracking"].referenceSize + "px")
                .css("border", "0px solid")
                .css('padding', 0)
                .css('overflow', 'hidden');
            if (dataMatrix[i][j] == 1) {
                $("#eyetracking_references_table_row_" + i + "_col_" + j)
                    .css("background", "black");
            } else if (dataMatrix[i][j] == 0) {
                $("#eyetracking_references_table_row_" + i + "_col_" + j)
                    .css("background", "white");
            }
        }
    }
}

gdo.net.module["EyeTracking"].convertToDataMatrix = function (input) {
    var str = input.toString(2);
    var dataMatrix = new Array(4);
    for (var l = 0; l < 4; l++) {
        dataMatrix[l] = new Array(4);
    }
    var length = str.length;
    for (var k = 0; k < 16 - length; k++) {
        var temp = "0";
        str = temp.concat(str);
    }
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            dataMatrix[i][j] = parseInt(str.substring((i * 4) + j, (i * 4) + j + 1));
        }
    }
    return dataMatrix;
}

gdo.net.module["EyeTracking"].updateButtons = function () {
    if (gdo.net.module["EyeTracking"].referenceMode) {
        $("iframe").contents().find("#referenceButton")
            .empty()
            .removeClass("btn-outline")
            .append("<i class='fa  fa-qrcode fa-fw'></i>&nbsp;References ON");
    } else {
        $("iframe").contents().find("#referenceButton")
            .empty()
            .addClass("btn-outline")
            .append("<i class='fa  fa-qrcode fa-fw'></i>&nbsp;References OFF");
    }
    $("iframe").contents().find("#referenceButton")
        .unbind()
        .click(function () {
            if (gdo.net.module["EyeTracking"].referenceMode) {
                gdo.net.module["EyeTracking"].referenceMode = false;
            } else {
                gdo.net.module["EyeTracking"].referenceMode = true;
            }
            gdo.updateDisplayCanvas();
            gdo.net.module["EyeTracking"].server.setReferenceMode(gdo.net.module["EyeTracking"].referenceMode);

        });
    if (gdo.net.module["EyeTracking"].cursorMode) {
        $("iframe").contents().find("#cursorButton")
            .empty()
            .removeClass("btn-outline")
            .append("<i class='fa  fa-crosshairs fa-fw'></i>&nbsp;Cursors ON");
    } else {
        $("iframe").contents().find("#cursorButton")
            .empty()
            .addClass("btn-outline")
           .append("<i class='fa  fa-crosshairs fa-fw'></i>&nbsp;Cursors OFF");
    }
    $("iframe").contents().find("#cursorButton")
        .unbind()
        .click(function () {
            if (gdo.net.module["EyeTracking"].cursorMode) {
                gdo.net.module["EyeTracking"].cursorMode = false;
            } else {
                gdo.net.module["EyeTracking"].cursorMode = true;
            }
            gdo.updateDisplayCanvas();
            gdo.net.module["EyeTracking"].server.setCursorMode(gdo.net.module["EyeTracking"].cursorMode);
        });
}