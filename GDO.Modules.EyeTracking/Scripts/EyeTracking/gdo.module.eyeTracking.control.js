
gdo.net.module["EyeTracking"].updateFlot = function () {

    for (var j = 1; j < gdo.net.module["EyeTracking"].numUsers + 1; j++) {
        if (gdo.net.module["EyeTracking"].user[j].x.length > gdo.net.module["EyeTracking"].flotSize) {
            gdo.net.module["EyeTracking"].user[j].x.splice(0, 1);
        }
        if (gdo.net.module["EyeTracking"].user[j].y.length > gdo.net.module["EyeTracking"].flotSize) {
            gdo.net.module["EyeTracking"].user[j].y.splice(0, 1);
        }
        if (typeof gdo.net.module["EyeTracking"].getLatestUserData(j) == 'undefined' || gdo.net.module["EyeTracking"].getLatestUserData(j) == gdo.net.module["EyeTracking"].user[j].latestData) {
            gdo.net.module["EyeTracking"].user[j].x.push(0);
            gdo.net.module["EyeTracking"].user[j].y.push(0);
        } else {
            gdo.net.module["EyeTracking"].user[j].x.push(gdo.net.module["EyeTracking"].getLatestUserData(j).X + (gdo.net.node[gdo.net.module["EyeTracking"].getLatestUserData(j).NodeId].col * gdo.net.node[1].width));
            gdo.net.module["EyeTracking"].user[j].y.push(gdo.net.module["EyeTracking"].getLatestUserData(j).Y + (gdo.net.node[gdo.net.module["EyeTracking"].getLatestUserData(j).NodeId].row * gdo.net.node[1].height));
        }
        gdo.net.module["EyeTracking"].user[j].latestData = gdo.net.module["EyeTracking"].getLatestUserData(j);
        gdo.net.module["EyeTracking"].user[j].xData = new Array(gdo.net.module["EyeTracking"].flotSize);
        gdo.net.module["EyeTracking"].user[j].yData = new Array(gdo.net.module["EyeTracking"].flotSize);
        for (var k = 0; k < gdo.net.module["EyeTracking"].flotSize; k++) {
            gdo.net.module["EyeTracking"].user[j].xData[k] = [k, gdo.net.module["EyeTracking"].user[j].x[k]];
            gdo.net.module["EyeTracking"].user[j].yData[k] = [k, gdo.net.module["EyeTracking"].user[j].y[k]];
        }
        gdo.net.module["EyeTracking"].xPlots[j].setData([gdo.net.module["EyeTracking"].user[j].xData]);
        gdo.net.module["EyeTracking"].yPlots[j].setData([gdo.net.module["EyeTracking"].user[j].yData]);
        gdo.net.module["EyeTracking"].xPlots[j].draw();
        gdo.net.module["EyeTracking"].yPlots[j].draw();
        gdo.net.module["EyeTracking"].xPlots[j].setupGrid();
        gdo.net.module["EyeTracking"].yPlots[j].setupGrid();
    }
    setTimeout(gdo.net.module["EyeTracking"].updateFlot, gdo.net.module["EyeTracking"].updateInterval);
}

gdo.net.module["EyeTracking"].initControl = function () {
    gdo.consoleOut('.EyeTracking', 1, 'Initializing EyeTracking Module Control');
    gdo.net.module["EyeTracking"].isControlClient = true;
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
    gdo.net.module["EyeTracking"].updateFlot();
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
    //for (var i = 0; i < gdo.net.cols; i++) {
    //for (var j = 0; j < gdo.net.rows; j++) {
    $("iframe").contents().find("#user_" + userId + "_coordinates_row_" + gdo.net.node[gdo.net.module["EyeTracking"].user[userId].lastNodeId].row + "_col_" + gdo.net.node[gdo.net.module["EyeTracking"].user[userId].lastNodeId].col).css("background", "transparent")//}
    //}
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
    gdo.net.module["EyeTracking"].user[userId].lastNodeId = gdo.net.getNodeId(col, row);
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


gdo.net.module["EyeTracking"].updateButtons = function () {
    if (gdo.net.module["EyeTracking"].markerMode) {
        $("iframe").contents().find("#markerButton")
            //.empty()
            .removeClass("btn-outline")
        //.append("<i class='fa  fa-qrcode fa-fw'></i>&nbsp;Markers ON");
    } else {
        $("iframe").contents().find("#markerButton")
            //.empty()
            .addClass("btn-outline")
        //.append("<i class='fa  fa-qrcode fa-fw'></i>&nbsp;Markers OFF");
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
    $("iframe").contents().find("#markerSizeIncreaseButton")
        .unbind()
        .click(function () {
            gdo.updateDisplayCanvas();
            gdo.net.module["EyeTracking"].server.setMarkerSize(gdo.net.module["EyeTracking"].markerSize + 1);
        });

    $("iframe").contents().find("#markerSizeDecreaseButton")
    .unbind()
    .click(function () {
        gdo.updateDisplayCanvas();
        gdo.net.module["EyeTracking"].server.setMarkerSize(gdo.net.module["EyeTracking"].markerSize - 1);
    });

    $("iframe").contents().find("#markerContrast1Button")
        .unbind()
        .click(function () {
            if (gdo.net.module["EyeTracking"].markerMode) {
                gdo.net.module["EyeTracking"].markerMode = false;
            } else {
                gdo.net.module["EyeTracking"].markerMode = true;
            }
            gdo.updateDisplayCanvas();
            gdo.net.module["EyeTracking"].server.setMarkerColor("#333");

        });
    $("iframe").contents().find("#markerContrast2Button")
    .unbind()
    .click(function () {
        if (gdo.net.module["EyeTracking"].markerMode) {
            gdo.net.module["EyeTracking"].markerMode = false;
        } else {
            gdo.net.module["EyeTracking"].markerMode = true;
        }
        gdo.updateDisplayCanvas();
        gdo.net.module["EyeTracking"].server.setMarkerColor("#444");

    });
    $("iframe").contents().find("#markerContrast3Button")
    .unbind()
    .click(function () {
        if (gdo.net.module["EyeTracking"].markerMode) {
            gdo.net.module["EyeTracking"].markerMode = false;
        } else {
            gdo.net.module["EyeTracking"].markerMode = true;
        }
        gdo.updateDisplayCanvas();
        gdo.net.module["EyeTracking"].server.setMarkerColor("#666");

    });
    $("iframe").contents().find("#markerContrast4Button")
    .unbind()
    .click(function () {
        if (gdo.net.module["EyeTracking"].markerMode) {
            gdo.net.module["EyeTracking"].markerMode = false;
        } else {
            gdo.net.module["EyeTracking"].markerMode = true;
        }
        gdo.updateDisplayCanvas();
        gdo.net.module["EyeTracking"].server.setMarkerColor("#888");

    });
    $("iframe").contents().find("#markerContrast5Button")
    .unbind()
    .click(function () {
        if (gdo.net.module["EyeTracking"].markerMode) {
            gdo.net.module["EyeTracking"].markerMode = false;
        } else {
            gdo.net.module["EyeTracking"].markerMode = true;
        }
        gdo.updateDisplayCanvas();
        gdo.net.module["EyeTracking"].server.setMarkerColor("#aaa");

    });
    $("iframe").contents().find("#markerContrast6Button")
    .unbind()
    .click(function () {
        if (gdo.net.module["EyeTracking"].markerMode) {
            gdo.net.module["EyeTracking"].markerMode = false;
        } else {
            gdo.net.module["EyeTracking"].markerMode = true;
        }
        gdo.updateDisplayCanvas();
        gdo.net.module["EyeTracking"].server.setMarkerColor("#ccc");

    });
    $("iframe").contents().find("#markerContrast7Button")
    .unbind()
    .click(function () {
        if (gdo.net.module["EyeTracking"].markerMode) {
            gdo.net.module["EyeTracking"].markerMode = false;
        } else {
            gdo.net.module["EyeTracking"].markerMode = true;
        }
        gdo.updateDisplayCanvas();
        gdo.net.module["EyeTracking"].server.setMarkerColor("#fff");

    });



    if (gdo.net.module["EyeTracking"].cursorMode) {
        $("iframe").contents().find("#cursorButton")
            //.empty()
            .removeClass("btn-outline");
        //.append("<i class='fa  fa-crosshairs fa-fw'></i>&nbsp;Cursors ON");
    } else {
        $("iframe").contents().find("#cursorButton")
            //.empty()
            .addClass("btn-outline");
        //.append("<i class='fa  fa-crosshairs fa-fw'></i>&nbsp;Cursors OFF");
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
    $("iframe").contents().find("#clearSessionButton")
        .unbind()
        .click(function () {
            gdo.updateDisplayCanvas();
            gdo.net.module["EyeTracking"].server.clearSession();
        });
    for (var i = 1; i < gdo.net.module["EyeTracking"].numUsers + 1; i++) {
        $("iframe").contents().find("#user_" + i + "_socket")
            .unbind()
            .click(function () {
                var ip = $("iframe").contents().find("#user_" + $(this).attr('userId') + "_ip").val();
                var port = parseInt($("iframe").contents().find("#user_" + $(this).attr('userId') + "_port").val());
                if (gdo.net.module["EyeTracking"].user[$(this).attr('userId')].socket) {
                    gdo.consoleOut('.EyeTracking', 1, 'Requesting Disconnection from Device for User ' + $(this).attr('userId'));
                    gdo.net.module["EyeTracking"].server.setConnectionStatus($(this).attr('userId'), false, "", 0);
                } else {
                    gdo.consoleOut('.EyeTracking', 1, 'Requesting Connection to Device at ' + ip + ':' + port + ' for User ' + $(this).attr('userId'));
                    gdo.net.module["EyeTracking"].server.setConnectionStatus($(this).attr('userId'), true, ip, port);
                }
                gdo.updateDisplayCanvas();
            });
        if (gdo.net.module["EyeTracking"].user[i].isHeatmapVisible) {
            $("iframe").contents().find("#heatmapUser" + i + "Button")
                //.empty()
                .removeClass("btn-outline");
            //.append("<i class='fa  fa-crosshairs fa-fw'></i>&nbsp;Cursors ON");
        } else {
            $("iframe").contents().find("#heatmapUser" + i + "Button")
                //.empty()
                .addClass("btn-outline");
            //.append("<i class='fa  fa-crosshairs fa-fw'></i>&nbsp;Cursors OFF");
        }
        $("iframe").contents().find("#heatmapUser" + i + "Button")
           .unbind()
           .click(function () {
               if (gdo.net.module["EyeTracking"].user[$(this).attr('userId')].isHeatmapVisible) {
                   gdo.net.module["EyeTracking"].user[$(this).attr('userId')].isHeatmapVisible = false;
               } else {
                   gdo.net.module["EyeTracking"].user[$(this).attr('userId')].isHeatmapVisible = true;
               }
               gdo.updateDisplayCanvas();
               gdo.net.module["EyeTracking"].server.setHeatmapVisible($(this).attr('userId'), gdo.net.module["EyeTracking"].user[$(this).attr('userId')].isHeatmapVisible);
           });
    }

    $("iframe").contents().find("#heatmapButton")
       .unbind()
       .click(function () {
           if (gdo.net.module["EyeTracking"].isHeatmapVisible) {
               gdo.net.module["EyeTracking"].isHeatmapVisible = false;
           } else {
               gdo.net.module["EyeTracking"].isHeatmapVisible = true;
           }
           gdo.updateDisplayCanvas();
           gdo.net.module["EyeTracking"].server.setHeatmapVisible(0, gdo.net.module["EyeTracking"].isHeatmapVisible);
       });
    if (gdo.net.module["EyeTracking"].isHeatmapVisible) {
        $("iframe").contents().find("#heatmapButton")
            //.empty()
            .removeClass("btn-outline");
        //.append("<i class='fa  fa-crosshairs fa-fw'></i>&nbsp;Cursors ON");
    } else {
        $("iframe").contents().find("#heatmapButton")
            //.empty()
            .addClass("btn-outline");
        //.append("<i class='fa  fa-crosshairs fa-fw'></i>&nbsp;Cursors OFF");
    }
}
