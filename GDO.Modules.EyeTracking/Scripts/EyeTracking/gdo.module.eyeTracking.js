
$(function () {
    gdo.consoleOut('.EyeTracking', 1, 'Loaded EyeTracking JS');
    gdo.net.module["EyeTracking"].mapRadius = 100;
    gdo.net.module["EyeTracking"].numUsers = 4;
    gdo.net.module["EyeTracking"].updateInterval = 50;
    gdo.net.module["EyeTracking"].flotSize = 100;
    gdo.net.module["EyeTracking"].timeStamp = 1;
    gdo.net.module["EyeTracking"].markerColor = "#aaa";
    gdo.net.module["EyeTracking"].user = new Array(gdo.net.module["EyeTracking"].numUsers);
    gdo.net.module["EyeTracking"].marker = [];
    for (var l = 1; l < gdo.net.module["EyeTracking"].numUsers + 1; l++) {
        gdo.net.module["EyeTracking"].user[l] = {};
        gdo.net.module["EyeTracking"].user[l].socket = false;
        gdo.net.module["EyeTracking"].user[l].data = [];
        gdo.net.module["EyeTracking"].user[l].x = new Array(gdo.net.module["EyeTracking"].flotSize);
        gdo.net.module["EyeTracking"].user[l].y = new Array(gdo.net.module["EyeTracking"].flotSize);
        gdo.net.module["EyeTracking"].user[l].lastNodeId = 1;
        gdo.net.module["EyeTracking"].user[l].latestData = [];
        for (var k = 0; k < gdo.net.module["EyeTracking"].flotSize; k++) {
            gdo.net.module["EyeTracking"].user[l].x[k] = 0;
            gdo.net.module["EyeTracking"].user[l].y[k] = 0;
        }
        gdo.net.module["EyeTracking"].user[l].isHeatmapVisible = false;
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
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.net.module["EyeTracking"].updateButtons();
        }
    }

    $.connection.eyeTrackingModuleHub.client.clearSession = function () {
        gdo.consoleOut('.EyeTracking', 1, 'Clearing Session');
        var data = {
            data: []
        };
        for (var l = 1; l < gdo.net.module["EyeTracking"].numUsers + 1; l++) {
            gdo.net.module["EyeTracking"].user[l].data = [];
            gdo.net.module["EyeTracking"].user[l].x = new Array(gdo.net.module["EyeTracking"].flotSize);
            gdo.net.module["EyeTracking"].user[l].y = new Array(gdo.net.module["EyeTracking"].flotSize);
            for (var k = 0; k < gdo.net.module["EyeTracking"].flotSize; k++) {
                gdo.net.module["EyeTracking"].user[l].x[k] = 0;
                gdo.net.module["EyeTracking"].user[l].y[k] = 0;
            }

            gdo.net.module["EyeTracking"].user[l].isHeatmapVisible = false;
            if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
                gdo.net.module["EyeTracking"].user[l].heatmap.setData(data);
                gdo.net.module["EyeTracking"].user[l].heatmap.repaint();
            }
        }
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.net.module["EyeTracking"].heatmap.setData(data);
            gdo.net.module["EyeTracking"].heatmap.repaint();
        }
    }

    $.connection.eyeTrackingModuleHub.client.receiveMarkers = function (serializedMarkers) {
        var deserializedMarkers = JSON.parse(serializedMarkers);
        gdo.consoleOut('.EyeTracking', 1, "Received " + deserializedMarkers.length + " Markers");
        gdo.net.module["EyeTracking"].marker = new Array(gdo.net.cols * gdo.net.rows);
        for (var m = 0; m < gdo.net.cols * gdo.net.rows; m++) {
            gdo.net.module["EyeTracking"].marker[m] = deserializedMarkers[m];
        }

    }

    $.connection.eyeTrackingModuleHub.client.receiveConnectionStatus = function (userId, connectionStatus, streamStatus) {
        gdo.consoleOut('.EyeTracking', 2, "Received Connection Status for User " + userId + ", Is connected: " + connectionStatus + ', Is Receiving: ' + streamStatus);
        if (connectionStatus) {
            $("iframe").contents().find("#user_" + userId + "_socket").removeClass("btn-outline");
            $("iframe").contents().find("#user_" + userId + "_socket").empty().append("<i id='user_" + userId + "_socket_icon' align='center' class='fa  fa-times  fa-fw'></i>&nbsp;Disconnect");
            $("iframe").contents().find("#user_" + userId + "_status").empty().append("Connected to Device");
            if (streamStatus) {
                $("iframe").contents().find("#user_" + userId + "_status").empty().append("Connected to Device and Receiving Data");
            }
            gdo.net.module["EyeTracking"].user[userId].socket = true;
        } else {
            $("iframe").contents().find("#user_" + userId + "_socket").addClass("btn-outline");
            $("iframe").contents().find("#user_" + userId + "_socket").empty().append("<i id='user_" + userId + "_socket_icon' align='center' class='fa  fa-arrow-right  fa-fw'></i>&nbsp;Connect");
            $("iframe").contents().find("#user_" + userId + "_status").empty().append("Not Connected");
            gdo.net.module["EyeTracking"].user[userId].socket = false;
        }
    }

    $.connection.eyeTrackingModuleHub.client.displayIncomingData = function (data) {
        gdo.consoleOut('.EyeTracking', 4, data);
    }

    $.connection.eyeTrackingModuleHub.client.receiveData = function (serializedData) {
        var deserializedData = JSON.parse(serializedData);
        if (gdo.net.isNodeInitialized && deserializedData.NodeId != null && deserializedData.NodeId >0) {
            if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
                if (deserializedData.NodeId == gdo.clientId) {
                    if (gdo.net.module["EyeTracking"].user[deserializedData.UserId].data.length > gdo.net.module["EyeTracking"].cacheSize) {
                        gdo.net.module["EyeTracking"].user[deserializedData.UserId].data.splice(0, 1);
                    }
                    gdo.net.module["EyeTracking"].user[deserializedData.UserId].data.push(deserializedData);
                    gdo.net.module["EyeTracking"].user[deserializedData.UserId].heatmap.addData([{ x: deserializedData.X, y: deserializedData.Y, value: 1 }]);
                    gdo.net.module["EyeTracking"].heatmap.addData([{ x: deserializedData.X, y: deserializedData.Y, value: 1 }]);
                    $('#eyetracking_cursor_' + deserializedData.UserId)
                        .css("top", deserializedData.Y - (gdo.net.module["EyeTracking"].cursorSize / 2))
                        .css("left", deserializedData.X - (gdo.net.module["EyeTracking"].cursorSize / 2));
                } else if (gdo.net.node[deserializedData.NodeId].isNeighbour) {
                    if (gdo.net.module["EyeTracking"].user[deserializedData.UserId].data.length > gdo.net.module["EyeTracking"].cacheSize) {
                        gdo.net.module["EyeTracking"].user[deserializedData.UserId].data.splice(0, 1);
                    }
                    gdo.net.module["EyeTracking"].user[deserializedData.UserId].data.push(deserializedData);
                    var nx = ((gdo.net.node[deserializedData.NodeId].col - gdo.net.node[gdo.clientId].col) * gdo.net.node[gdo.clientId].width) + deserializedData.X;
                    var ny = ((gdo.net.node[deserializedData.NodeId].row - gdo.net.node[gdo.clientId].row) * gdo.net.node[gdo.clientId].height) + deserializedData.Y;
                    if (nx > -500 && nx < gdo.net.node[gdo.clientId].width + 500 && ny > -500 && ny < gdo.net.node[gdo.clientId].height + 500) {
                        gdo.net.module["EyeTracking"].heatmap.addData([
                        {
                            x: nx,
                            y: ny,
                            value: 1
                        }]);
                    }

                    var colOffset = gdo.net.node[deserializedData.NodeId].col - gdo.net.node[gdo.clientId].col;
                    var rowOffset = gdo.net.node[deserializedData.NodeId].row - gdo.net.node[gdo.clientId].row;
                    $('#eyetracking_cursor_' + deserializedData.UserId)
                        .css("top", (rowOffset * gdo.net.node[deserializedData.NodeId].height) + deserializedData.Y - (gdo.net.module["EyeTracking"].cursorSize / 2))
                        .css("left", (colOffset * gdo.net.node[deserializedData.NodeId].width) + deserializedData.X - (gdo.net.module["EyeTracking"].cursorSize / 2));
                } else {
                    $('#eyetracking_cursor_' + deserializedData.UserId)
                        .css("top", -500)
                        .css("left", -500);
                }
            } else if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.net.module["EyeTracking"].isControlClient) {
                if (gdo.net.module["EyeTracking"].user[deserializedData.UserId].data.length > gdo.net.module["EyeTracking"].cacheSize) {
                    gdo.net.module["EyeTracking"].user[deserializedData.UserId].data.splice(0, 1);
                }
                gdo.net.module["EyeTracking"].user[deserializedData.UserId].data.push(deserializedData);
                gdo.net.module["EyeTracking"].displayDataOnUserTable(deserializedData.UserId, gdo.net.node[deserializedData.NodeId].col, gdo.net.node[deserializedData.NodeId].row);
                gdo.net.module["EyeTracking"].displayLocationOnUserMap(deserializedData.UserId, deserializedData.Angle, deserializedData.Distance);
            }
            //gdo.consoleOut('.EyeTracking', 1, deserializedData.UserId + " - " + deserializedData.NodeId + " - " + deserializedData.TimeStamp + " - " + deserializedData.X + " - " + deserializedData.Y);
        }
    }

    $.connection.eyeTrackingModuleHub.client.updateCursorMode = function (mode) {
        gdo.consoleOut('.EyeTracking', 1, 'Cursor Mode: ' + mode);
        gdo.net.module["EyeTracking"].cursorMode = mode;
        for (var l = 1; l < gdo.net.module["EyeTracking"].numUsers + 1; l++) {
            if (mode) {
                $('#eyetracking_cursor_' + l).show();
            } else {
                $('#eyetracking_cursor_' + l).hide();
            }
        }

        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.net.module["EyeTracking"].updateButtons();
        }
    }
    $.connection.eyeTrackingModuleHub.client.updateHeatmapVisible = function (userId, visible) {
        gdo.consoleOut('.EyeTracking', 1, 'Heatmap Visibility for User: ' + userId + ' is ' + visible);

        if (userId > 0) {
            if (visible) {
                $('#eyetracking_heatmap_user_' + userId).show();
            } else {
                $('#eyetracking_heatmap_user_' + userId).hide();
            }
            gdo.net.module["EyeTracking"].isHeatmapVisible = visible;
        } else {
            if (visible) {
                $('#eyetracking_heatmap').show();
            } else {
                $('#eyetracking_heatmap').hide();
            }
            gdo.net.module["EyeTracking"].isHeatmapVisible = visible;
        }

        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.net.module["EyeTracking"].updateButtons();
        }
    }
    $.connection.eyeTrackingModuleHub.client.updateMarkerSize = function (size) {
        gdo.consoleOut('.EyeTracking', 1, 'Marker Size: ' + size * 8 + 'px');
        gdo.net.module["EyeTracking"].markerSize = size;
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            if (!$('#eyetracking_markers_outer')[1]) {
                $("body").append("<div id='eyetracking_markers_outer'  unselectable='on' class='unselectable' style='position: absolute; display: none; bottom: 0px; right: 0px; z-index: 950; background:#aaa; width:" + gdo.net.module["EyeTracking"].markerSize * 8 + "px; height:" + gdo.net.module["EyeTracking"].markerSize * 8 + "px'></div>");
                $("body").append("<div id='eyetracking_markers_inner'  unselectable='on' class='unselectable' style='position: absolute; display: none; bottom: " + gdo.net.module["EyeTracking"].markerSize + "px; right: " + gdo.net.module["EyeTracking"].markerSize + "px; z-index: 950; background:black; width:" + gdo.net.module["EyeTracking"].markerSize * 6 + "px; height:" + gdo.net.module["EyeTracking"].markerSize * 6 + "px'></div>");
                $("body").append("<table id='eyetracking_markers_table' unselectable='on' class='unselectable' style='position: absolute; display: none; bottom: " + gdo.net.module["EyeTracking"].markerSize * 2 + "px; right: " + gdo.net.module["EyeTracking"].markerSize * 2 + "px; z-index:999;width: " + gdo.net.module["EyeTracking"].markerSize * 4 + "px; height:" + gdo.net.module["EyeTracking"].markerSize * 4 + "px;border-collapse: collapse; border-spacing: 0px;' ></table>");
            }
            $('#eyetracking_markers_outer').css("width", gdo.net.module["EyeTracking"].markerSize * 8).css("height", gdo.net.module["EyeTracking"].markerSize * 8);
            $('#eyetracking_markers_inner').css("bottom", gdo.net.module["EyeTracking"].markerSize).css("right", gdo.net.module["EyeTracking"].markerSize).css("width", gdo.net.module["EyeTracking"].markerSize * 6).css("height", gdo.net.module["EyeTracking"].markerSize * 6);
            $('#eyetracking_markers_table').css("bottom", gdo.net.module["EyeTracking"].markerSize * 2).css("right", gdo.net.module["EyeTracking"].markerSize * 2).css("width", gdo.net.module["EyeTracking"].markerSize * 4).css("height", gdo.net.module["EyeTracking"].markerSize * 4);
            gdo.net.module["EyeTracking"].drawMarkerTable(parseInt(gdo.clientId));
        }
    }
    $.connection.eyeTrackingModuleHub.client.updateMarkerColor = function (color) {
        gdo.consoleOut('.EyeTracking', 1, 'Marker color: ' + color + '');
        gdo.net.module["EyeTracking"].markerColor = color;
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            if (!$('#eyetracking_markers_outer')[1]) {
                $("body").append("<div id='eyetracking_markers_outer'  unselectable='on' class='unselectable' style='position: absolute; display: none; bottom: 0px; right: 0px; z-index: 950; background:#aaa; width:" + gdo.net.module["EyeTracking"].markerSize * 8 + "px; height:" + gdo.net.module["EyeTracking"].markerSize * 8 + "px'></div>");
                $("body").append("<div id='eyetracking_markers_inner'  unselectable='on' class='unselectable' style='position: absolute; display: none; bottom: " + gdo.net.module["EyeTracking"].markerSize + "px; right: " + gdo.net.module["EyeTracking"].markerSize + "px; z-index: 950; background:black; width:" + gdo.net.module["EyeTracking"].markerSize * 6 + "px; height:" + gdo.net.module["EyeTracking"].markerSize * 6 + "px'></div>");
                $("body").append("<table id='eyetracking_markers_table' unselectable='on' class='unselectable' style='position: absolute; display: none; bottom: " + gdo.net.module["EyeTracking"].markerSize * 2 + "px; right: " + gdo.net.module["EyeTracking"].markerSize * 2 + "px; z-index:999;width: " + gdo.net.module["EyeTracking"].markerSize * 4 + "px; height:" + gdo.net.module["EyeTracking"].markerSize * 4 + "px;border-collapse: collapse; border-spacing: 0px;' ></table>");
                $('#eyetracking_markers_outer').css("background", color);
            } else {
                $('#eyetracking_markers_outer').css("background", color);
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
                    $("body").append("<div id='eyetracking_cursor_" + l + "'  unselectable='on' class='unselectable' style='border-radius: 100%; opacity:0.7;padding: 0; margin: 0; float: left;position: absolute; display: none; top:-500px; left:-500px; z-index: 900; background:" + cursorColor + "; width:" + gdo.net.module["EyeTracking"].cursorSize + "px; height:" + gdo.net.module["EyeTracking"].cursorSize + "px'></div>");
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

    if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
        for (var l = 1; l < gdo.net.module["EyeTracking"].numUsers + 1; l++) {
            $("body").append("<div id='eyetracking_heatmap_user_" + l + "'  unselectable='on' class='unselectable' style='position: fixed; display: none; overflow:hidden top: 0px; left: 0px; border: 0 none; z-index: 950; background:transparent; width:" + gdo.net.node[gdo.clientId].width + "px; height:" + gdo.net.node[gdo.clientId].height + "px'></div>");
            var gradientColor;
            switch (l) {
                case 1:
                    gradientColor = "#2A9FD6";
                    break;
                case 2:
                    gradientColor = "#77B300";
                    break;
                case 3:
                    gradientColor = "#FF8800";
                    break;
                case 4:
                    gradientColor = "#CC0000";
                    break;
                default:
                    gradientColor = "white";
                    break;
            }
            gdo.net.module["EyeTracking"].user[l].heatmap = h337.create({
                container: document.getElementById('eyetracking_heatmap_user_' + l),
                radius: 21,
                maxOpacity: .5,
                minOpacity: 0,
                blur: 1,
                gradient: {
                    '.3': gradientColor,
                }
            });
        }
        $("body").append("<div id='eyetracking_heatmap'  unselectable='on' class='unselectable' style='position: fixed; display: none; top: 0px; left: 0px; border: 0 none; z-index: 950; background:transparent; width:" + gdo.net.node[gdo.clientId].width + "px; height:" + gdo.net.node[gdo.clientId].height + "px'></div>");
        gdo.net.module["EyeTracking"].heatmap = h337.create({
            container: document.getElementById('eyetracking_heatmap'),
            radius: 21,
            maxOpacity: .5,
            minOpacity: 0,
            blur: 1
        });
    } else {
        gdo.loadScript('control', 'EyeTracking', gdo.SCRIPT_TYPE.MODULE);
    }
    setTimeout(function () {
        gdo.net.module["EyeTracking"].server.linkCallbackFunction();
        gdo.net.module["EyeTracking"].server.requestMarkers();
        gdo.net.module["EyeTracking"].server.requestCursorSize();
        gdo.net.module["EyeTracking"].server.requestCacheSize();
        gdo.net.module["EyeTracking"].server.requestMarkerSize();
        gdo.net.module["EyeTracking"].server.requestMarkerMode();
        gdo.net.module["EyeTracking"].server.requestCursorMode();
        gdo.net.module["EyeTracking"].server.requestHeatmapVisible(0);
        for (var j = 1; j < gdo.net.module["EyeTracking"].numUsers + 1; j++) {
            gdo.net.module["EyeTracking"].server.requestConnectionStatus(j);
            gdo.net.module["EyeTracking"].server.requestHeatmapVisible(j);
        }
    }, 700);
}

gdo.net.module["EyeTracking"].getLatestUserData = function (userId) {
    return gdo.net.module["EyeTracking"].user[userId].data[gdo.net.module["EyeTracking"].user[userId].data.length - 1];
    //return gdo.net.module["EyeTracking"].user[userId].latestData;
}

gdo.net.module["EyeTracking"].terminateControl = function () {
    gdo.consoleOut('.EyeTracking', 1, 'Terminating EyeTracking Module Control');
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
    var dataMatrix = gdo.net.module["EyeTracking"].marker[input - 1].DataMatrix;
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
                    .css("background", gdo.net.module["EyeTracking"].markerColor);
            }
        }
    }
}

/*gdo.net.module["EyeTracking"].convertToDataMatrix = function (input) {
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
}*/

/*gdo.net.module["EyeTracking"].uploadUserData = function (timestamp, userId, nodeId, x, y, angle, distance) {
    var data = {};
    data.TimeStamp = timestamp;
    data.UserId = userId;
    data.NodeId = nodeId;
    data.X = x;
    data.Y = y;
    data.Angle = angle;
    data.Distance = distance;
    gdo.net.module["EyeTracking"].server.uploadData(JSON.stringify(data));
}*/