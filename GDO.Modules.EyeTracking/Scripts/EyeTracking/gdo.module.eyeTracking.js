
$(function () {
    gdo.consoleOut('.EyeTracking', 1, 'Loaded EyeTracking JS');
    gdo.net.module["EyeTracking"].mapRadius = 100;
    gdo.net.module["EyeTracking"].numUsers = 4;
    gdo.net.module["EyeTracking"].updateInterval = 50;
    gdo.net.module["EyeTracking"].flotSize = 10;
    gdo.net.module["EyeTracking"].timeStamp = 1;
    gdo.net.module["EyeTracking"].user = new Array(gdo.net.module["EyeTracking"].numUsers);
    gdo.net.module["EyeTracking"].marker = [];
    for (var l = 1; l < gdo.net.module["EyeTracking"].numUsers + 1; l++) {
        gdo.net.module["EyeTracking"].user[l] = {};
        gdo.net.module["EyeTracking"].user[l].data = [];
        gdo.net.module["EyeTracking"].user[l].x = new Array(gdo.net.module["EyeTracking"].flotSize);
        gdo.net.module["EyeTracking"].user[l].y = new Array(gdo.net.module["EyeTracking"].flotSize);
        for (var k = 0; k < gdo.net.module["EyeTracking"].flotSize; k++) {
            gdo.net.module["EyeTracking"].user[l].x[k] = 0;
            gdo.net.module["EyeTracking"].user[l].y[k] = 0;
        }
    }

    $.connection.eyeTrackingModuleHub.client.updateMarkerMode = function (mode) {
        gdo.consoleOut('.EyeTracking', 1, 'Marker Mode: ' + mode);
        gdo.net.module["EyeTracking"].markerMode = mode;
        if (mode) {
            $('#eyetracking_markers_outer').show();
            $('#eyetracking_markers_inner').show();
            $('#eyetracking_markers_table').show();
        } else {
            $('#eyetracking_markers_outer').hide();
            $('#eyetracking_markers_inner').hide();
            $('#eyetracking_markers_table').hide();
        }
        gdo.net.module["EyeTracking"].updateButtons();
    }

    $.connection.eyeTrackingModuleHub.client.receiveMarkers = function (serializedMarkers) {
        var deserializedMarkers = JSON.parse(serializedMarkers);
        gdo.consoleOut('.EyeTracking', 1, "Received " + deserializedMarkers.length + " Markers");
        gdo.net.module["EyeTracking"].marker = new Array(gdo.net.cols * gdo.net.rows);
        for (var m = 0; m < gdo.net.cols * gdo.net.rows; m++) {
            gdo.net.module["EyeTracking"].marker[m] = deserializedMarkers[m];
        }

    }
    $.connection.eyeTrackingModuleHub.client.displayIncomingData = function(data) {
        gdo.consoleOut('.EyeTracking', 4, data);
    }

    $.connection.eyeTrackingModuleHub.client.receiveData = function (serializedData) {
        var deserializedData = JSON.parse(serializedData);

        if (gdo.net.module["EyeTracking"].user[deserializedData.UserId].data.length > gdo.net.module["EyeTracking"].cacheSize) {
            gdo.net.module["EyeTracking"].user[deserializedData.UserId].data.splice(0, 1);
        }
        gdo.net.module["EyeTracking"].user[deserializedData.UserId].data.push(deserializedData);

        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            if (gdo.net.module["EyeTracking"].cursorMode && deserializedData.NodeId == gdo.clientId) {
                $('#eyetracking_cursor_' + deserializedData.UserId).show();
                $('#eyetracking_cursor_' + deserializedData.UserId)
                    .css("top", deserializedData.Y - (gdo.net.module["EyeTracking"].cursorSize / 2))
                    .css("left", deserializedData.X - (gdo.net.module["EyeTracking"].cursorSize / 2));
            } else if (gdo.net.node[deserializedData.NodeId].isNeighbour) {
                var colOffset = gdo.net.node[deserializedData.NodeId].col - gdo.net.node[gdo.clientId].col;
                var rowOffset = gdo.net.node[deserializedData.NodeId].row - gdo.net.node[gdo.clientId].row;
                $('#eyetracking_cursor_' + deserializedData.UserId).show();
                $('#eyetracking_cursor_' + deserializedData.UserId)
                    .css("top", (rowOffset * gdo.net.node[deserializedData.NodeId].height) + deserializedData.Y - (gdo.net.module["EyeTracking"].cursorSize / 2))
                    .css("left", (colOffset * gdo.net.node[deserializedData.NodeId].width) + deserializedData.X - (gdo.net.module["EyeTracking"].cursorSize / 2));
            }
        } else if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.net.module["EyeTracking"].displayDataOnUserTable(deserializedData.UserId, gdo.net.node[deserializedData.NodeId].col, gdo.net.node[deserializedData.NodeId].row);
            gdo.net.module["EyeTracking"].displayLocationOnUserMap(deserializedData.UserId, deserializedData.Angle, deserializedData.Distance);
        }
    }

    $.connection.eyeTrackingModuleHub.client.updateCursorMode = function (mode) {
        gdo.consoleOut('.EyeTracking', 1, 'Cursor Mode: ' + mode);
        gdo.net.module["EyeTracking"].cursorMode = mode;
        if (!mode) {
            for (var l = 1; l < gdo.net.module["EyeTracking"].numUsers + 1; l++) {
                $('#eyetracking_cursor_' + l).hide();
            }
        }
        gdo.net.module["EyeTracking"].updateButtons();
    }
    $.connection.eyeTrackingModuleHub.client.updateMarkerSize = function (size) {
        gdo.consoleOut('.EyeTracking', 1, 'Marker Size: ' + size * 8 + 'px');
        gdo.net.module["EyeTracking"].markerSize = size;
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            if (!$('#eyetracking_markers_outer')[1]) {
                $("body").append("<div id='eyetracking_markers_outer'  unselectable='on' class='unselectable' style='position: absolute; display: none; bottom: 0px; right: 0px; z-index: 900; background:white; width:" + gdo.net.module["EyeTracking"].markerSize * 8 + "px; height:" + gdo.net.module["EyeTracking"].markerSize * 8 + "px'></div>");
                $("body").append("<div id='eyetracking_markers_inner'  unselectable='on' class='unselectable' style='position: absolute; display: none; bottom: " + gdo.net.module["EyeTracking"].markerSize + "px; right: " + gdo.net.module["EyeTracking"].markerSize + "px; z-index: 950; background:black; width:" + gdo.net.module["EyeTracking"].markerSize * 6 + "px; height:" + gdo.net.module["EyeTracking"].markerSize * 6 + "px'></div>");
                $("body").append("<table id='eyetracking_markers_table' unselectable='on' class='unselectable' style='position: absolute; display: none; bottom: " + gdo.net.module["EyeTracking"].markerSize * 2 + "px; right: " + gdo.net.module["EyeTracking"].markerSize * 2 + "px; z-index:999;width: " + gdo.net.module["EyeTracking"].markerSize * 4 + "px; height:" + gdo.net.module["EyeTracking"].markerSize * 4 + "px;border-collapse: collapse; border-spacing: 0px;' ></table>");
            }
            gdo.net.module["EyeTracking"].drawMarkerTable(parseInt(gdo.clientId));
        }
    }
    $.connection.eyeTrackingModuleHub.client.updateCursorSize = function (size) {
        gdo.consoleOut('.EyeTracking', 1, 'Cursor Size: ' + size + 'px');
        gdo.net.module["EyeTracking"].cursorSize = size;
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            for (var l = 1; l < gdo.net.module["EyeTracking"].numUsers + 1; l++) {
                var cursorColor;
                switch (l) {
                    case 1:
                        cursorColor = "#2A9FD6";
                        break;
                    case 2:
                        cursorColor = "#77B300";
                        break;
                    case 3:
                        cursorColor = "#FF8800";
                        break;
                    case 4:
                        cursorColor = "#CC0000";
                        break;
                    default:
                        cursorColor = "#FFF";
                        break;
                }
                if (!$('#eyetracking_cursor_' + l)[1]) {
                    $("body").append("<div id='eyetracking_cursor_" + l + "'  unselectable='on' class='unselectable' style='border-radius: 100%; opacity:0.7;padding: 0; margin: 0; float: left;position: absolute; display: none; bottom: 0px; right: 0px; z-index: 900; background:" + cursorColor + "; width:" + gdo.net.module["EyeTracking"].cursorSize + "px; height:" + gdo.net.module["EyeTracking"].cursorSize + "px'></div>");
                }
            }
            gdo.net.module["EyeTracking"].drawMarkerTable(parseInt(gdo.clientId));
        }
    }
    $.connection.eyeTrackingModuleHub.client.updateCacheSize = function (size) {
        gdo.consoleOut('.EyeTracking', 1, 'Cache Size: ' + size);
        gdo.net.module["EyeTracking"].cacheSize = size;
    }
});



gdo.net.module["EyeTracking"].initModule = function () {
    gdo.consoleOut('.EyeTracking', 1, 'Initializing EyeTracking Module');

    setTimeout(function () {
        gdo.net.module["EyeTracking"].server.requestMarkers();
        gdo.net.module["EyeTracking"].server.requestCursorSize();
        gdo.net.module["EyeTracking"].server.requestCacheSize();
        gdo.net.module["EyeTracking"].server.requestMarkerSize();
        gdo.net.module["EyeTracking"].server.requestMarkerMode();
        gdo.net.module["EyeTracking"].server.requestCursorMode();
        gdo.net.module["EyeTracking"].simulatedData = new Array(gdo.net.module["EyeTracking"].numUsers + 1);
    }, 700);

}

gdo.net.module["EyeTracking"].initializeFakeData = function () {
    for (var j = 1; j < gdo.net.module["EyeTracking"].numUsers + 1; j++) {
        gdo.net.module["EyeTracking"].uploadUserData(1, j, 24, 0, 0, 180, 50);
    }
}

gdo.net.module["EyeTracking"].generateFakeData = function () {
    for (var j = 1; j < gdo.net.module["EyeTracking"].numUsers + 1; j++) {
        var timestamp = gdo.net.module["EyeTracking"].timeStamp + Math.floor(Math.random() * (4 - (-4) + 1) + (-4));
        var nodeId = gdo.net.module["EyeTracking"].user[j].data[gdo.net.module["EyeTracking"].user[j].data.length - 1].NodeId;
        var col = gdo.net.node[nodeId].col;
        var row = gdo.net.node[nodeId].row;
        var x = gdo.net.module["EyeTracking"].user[j].data[gdo.net.module["EyeTracking"].user[j].data.length - 1].X + Math.floor(Math.random() * (70 - (-70) + 1) + (-70));
        if (x > gdo.net.node[1].width) {
            if (col < gdo.net.cols - 1) {
                col = col + 1;
                x = x - gdo.net.node[1].width;
            } else {
                x = gdo.net.node[1].width;
            }
        } else if (x < 0) {
            if (col > 1) {
                col = col - 1;
                x = x + gdo.net.node[1].width;
            } else {
                x = 0;
            }
        }
        var y = gdo.net.module["EyeTracking"].user[j].data[gdo.net.module["EyeTracking"].user[j].data.length - 1].Y + Math.floor(Math.random() * (70 - (-70) + 1) + (-70));
        if (y > gdo.net.node[1].height) {
            if (row < gdo.net.rows - 1) {
                row = row + 1;
                y = y - gdo.net.node[1].height;
            } else {
                y = gdo.net.node[1].height;
            }
        } else if (y < 0) {
            if (row > 1) {
                row = row - 1;
                y = y + gdo.net.node[1].height;
            } else {
                y = 0;
            }
        }
        nodeId = gdo.net.getNodeId(col, row);


        var angle = gdo.net.module["EyeTracking"].user[j].data[gdo.net.module["EyeTracking"].user[j].data.length - 1].Angle + Math.floor(Math.random() * (7 - (-7) + 1) + (-7));
        var distance = gdo.net.module["EyeTracking"].user[j].data[gdo.net.module["EyeTracking"].user[j].data.length - 1].Distance + Math.floor(Math.random() * (7 - (-7) + 1) + (-7));
        if (distance > 100) {
            distance = 100;
        } else if (distance < -100) {
            distance = -100;
        }
        if (angle > 360) {
            angle = 360;
        } else if (angle < 0) {
            angle = 0;
        }
        //gdo.consoleOut('.EyeTracking', 1, 'Data Created - TimeStamp:'+timestamp+' ,UserId: ' + j + ', NodeId:' + nodeId + ', Col:'+col+', Row:' + row+' X:' + x + ', Y:' + y + ', Angle:' + angle + ', Distance:' + distance); 
        gdo.net.module["EyeTracking"].uploadUserData(timestamp, j, nodeId, x, y, angle, distance);
    }
    setTimeout(gdo.net.module["EyeTracking"].generateFakeData, 70);
}

gdo.net.module["EyeTracking"].update = function () {
    for (var j = 1; j < gdo.net.module["EyeTracking"].numUsers + 1; j++) {
        if (gdo.net.module["EyeTracking"].user[j].x.length > gdo.net.module["EyeTracking"].flotSize) {
            gdo.net.module["EyeTracking"].user[j].x.splice(0, 1);
        }
        if (gdo.net.module["EyeTracking"].user[j].y.length > gdo.net.module["EyeTracking"].flotSize) {
            gdo.net.module["EyeTracking"].user[j].y.splice(0, 1);
        }
        if (typeof gdo.net.module["EyeTracking"].getLatestUserData(j) == 'undefined') {
            gdo.net.module["EyeTracking"].user[j].x.push(0);
            gdo.net.module["EyeTracking"].user[j].y.push(0);
        } else {
            //if (gdo.net.module["EyeTracking"].timeStamp > gdo.net.module["EyeTracking"].getLatestUserData(j).TimeStamp) {
            //    gdo.net.module["EyeTracking"].user[j].x.push(0);
            //    gdo.net.module["EyeTracking"].user[j].y.push(0);
            //} else {
            //gdo.consoleOut('.EyeTracking', 1, 'Data Injected ' + gdo.net.module["EyeTracking"].getLatestUserData(j).X + ',' + gdo.net.module["EyeTracking"].getLatestUserData(j).Y);
            gdo.net.module["EyeTracking"].user[j].x.push(gdo.net.module["EyeTracking"].getLatestUserData(j).X + (gdo.net.node[gdo.net.module["EyeTracking"].getLatestUserData(j).NodeId].col * gdo.net.node[1].width));
            gdo.net.module["EyeTracking"].user[j].y.push(gdo.net.module["EyeTracking"].getLatestUserData(j).Y + (gdo.net.node[gdo.net.module["EyeTracking"].getLatestUserData(j).NodeId].row * gdo.net.node[1].height));
            if (gdo.net.module["EyeTracking"].getLatestUserData(j).TimeStamp > gdo.net.module["EyeTracking"].timeStamp) {
                gdo.net.module["EyeTracking"].timeStamp = gdo.net.module["EyeTracking"].getLatestUserData(j).TimeStamp;
            }
            //}
        }
        gdo.net.module["EyeTracking"].user[j].xData = new Array(gdo.net.module["EyeTracking"].flotSize);
        gdo.net.module["EyeTracking"].user[j].yData = new Array(gdo.net.module["EyeTracking"].flotSize);
        for (var k = 0; k < gdo.net.module["EyeTracking"].flotSize; k++) {
            gdo.net.module["EyeTracking"].user[j].xData[k] = [k, gdo.net.module["EyeTracking"].user[j].x[k]];
            gdo.net.module["EyeTracking"].user[j].yData[k] = [k, gdo.net.module["EyeTracking"].user[j].y[k]];
        }
        gdo.net.module["EyeTracking"].xPlots[j].setData([gdo.net.module["EyeTracking"].user[j].xData]);
        gdo.net.module["EyeTracking"].yPlots[j].setData([gdo.net.module["EyeTracking"].user[j].yData]);
        //gdo.net.module["EyeTracking"].xPlots[j].setData([getRandomData()]);
        //gdo.net.module["EyeTracking"].yPlots[j].setData([getRandomData()]);
        gdo.net.module["EyeTracking"].xPlots[j].draw();
        gdo.net.module["EyeTracking"].yPlots[j].draw();
        gdo.net.module["EyeTracking"].xPlots[j].setupGrid();
        gdo.net.module["EyeTracking"].yPlots[j].setupGrid();
    }
    setTimeout(gdo.net.module["EyeTracking"].update, gdo.net.module["EyeTracking"].updateInterval);
}

gdo.net.module["EyeTracking"].initControl = function () {
    gdo.consoleOut('.EyeTracking', 1, 'Initializing EyeTracking Module Control');
    gdo.net.module["EyeTracking"].updateButtons();
    gdo.net.module["EyeTracking"].xPlots = new Array(gdo.net.module["EyeTracking"].numUsers);
    gdo.net.module["EyeTracking"].yPlots = new Array(gdo.net.module["EyeTracking"].numUsers);
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
        var plotColor;
        switch (i) {
            case 1:
                plotColor = "#2A9FD6";
                break;
            case 2:
                plotColor = "#77B300";
                break;
            case 3:
                plotColor = "#FF8800";
                break;
            case 4:
                plotColor = "#CC0000";
                break;
            default:
                plotColor = "#FFF";
                break;
        }
        gdo.net.module["EyeTracking"].xPlots[i] = $.plot($("iframe").contents().find("#user_" + i + "_chart_x"), [gdo.net.module["EyeTracking"].user[i].x], {
            series: {
                shadowSize: 0,  // Drawing is faster without shadows
                color: plotColor
            },
            yaxis: {
                min: 0,
                //max: 100,
                max: gdo.net.cols * gdo.net.node[1].width,
                //show: false
            },
            xaxis: {
                show: false
            },
            legend: {
                backgroundColor: 'black'
            }
        });
        gdo.net.module["EyeTracking"].yPlots[i] = $.plot($("iframe").contents().find("#user_" + i + "_chart_y"), [gdo.net.module["EyeTracking"].user[i].y], {
            series: {
                shadowSize: 0,  // Drawing is faster without shadows
                color: plotColor
            },
            yaxis: {
                min: 0,
                //max: 100,
                max: gdo.net.rows * gdo.net.node[1].height,
                //show: false
            },
            xaxis: {
                show: false
            },
            legend: {
                backgroundColor: 'black'
            }
        });
    }
    gdo.net.module["EyeTracking"].update();
}



gdo.net.module["EyeTracking"].uploadUserData = function (timestamp, userId, nodeId, x, y, angle, distance) {
    var data = {};
    data.TimeStamp = timestamp;
    data.UserId = userId;
    data.NodeId = nodeId;
    data.X = x;
    data.Y = y;
    data.Angle = angle;
    data.Distance = distance;
    gdo.net.module["EyeTracking"].server.uploadData(JSON.stringify(data));
}

gdo.net.module["EyeTracking"].getLatestUserData = function (userId) {
    return gdo.net.module["EyeTracking"].user[userId].data[gdo.net.module["EyeTracking"].user[userId].data.length - 1];
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

gdo.net.module["EyeTracking"].plotUserData = function (userId, col, row, x, y) {
    var revRow = 1 - (row - gdo.net.rows);
    var revCol = col;

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

gdo.net.module["EyeTracking"].drawEmptyMarkerTable = function () {
    $("#eyetracking_markers_table").empty();
    for (var i = 0; i < 4; i++) {
        $("#eyetracking_markers_table").append("<tr id='eyetracking_markers_table_row_" + i + "' row='" + i + "'></tr>");
        for (var j = 0; j < 4; j++) {
            $("#eyetracking_markers_table tr:last").append("<td id='eyetracking_markers_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'></td>").css('overflow', 'hidden');
        }
    }
}

gdo.net.module["EyeTracking"].drawMarkerTable = function (input) {
    var dataMatrix = gdo.net.module["EyeTracking"].marker[input].DataMatrix;
    gdo.net.module["EyeTracking"].drawEmptyMarkerTable();
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            $("#eyetracking_markers_table_row_" + i + "_col_" + j)
                .empty()
                .css("width", gdo.net.module["EyeTracking"].markerSize + "px")
                .css("height", gdo.net.module["EyeTracking"].markerSize + "px")
                .css("border", "0px solid")
                .css('padding', 0)
                .css('overflow', 'hidden');
            if (dataMatrix[i][j] == 1) {
                $("#eyetracking_markers_table_row_" + i + "_col_" + j)
                    .css("background", "black");
            } else if (dataMatrix[i][j] == 0) {
                $("#eyetracking_markers_table_row_" + i + "_col_" + j)
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
    if (gdo.net.module["EyeTracking"].markerMode) {
        $("iframe").contents().find("#markerButton")
            .empty()
            .removeClass("btn-outline")
            .append("<i class='fa  fa-qrcode fa-fw'></i>&nbsp;Markers ON");
    } else {
        $("iframe").contents().find("#markerButton")
            .empty()
            .addClass("btn-outline")
            .append("<i class='fa  fa-qrcode fa-fw'></i>&nbsp;Markers OFF");
    }
    $("iframe").contents().find("#markerButton")
        .unbind()
        .click(function () {
            if (gdo.net.module["EyeTracking"].markerMode) {
                gdo.net.module["EyeTracking"].markerMode = false;
            } else {
                gdo.net.module["EyeTracking"].markerMode = true;
            }
            gdo.updateDisplayCanvas();
            gdo.net.module["EyeTracking"].server.setMarkerMode(gdo.net.module["EyeTracking"].markerMode);

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
