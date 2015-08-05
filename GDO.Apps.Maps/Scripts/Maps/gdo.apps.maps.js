
$(function() {
    gdo.consoleOut('.MAPS', 1, 'Loaded Maps JS');
    $.connection.mapsAppHub.client.receiveMapPosition = function (instanceId, topLeft, center, bottomRight, resolution, width, height, zoom) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && gdo.net.node[gdo.clientId].appInstanceId == instanceId) {
            var mapCenter = [0, 0];
            var mapResolution = parseFloat(resolution);
            mapCenter = gdo.net.app["Maps"].calculateLocalCenter(topLeft, bottomRight);
            var nodePixels = gdo.net.node[gdo.clientId].width * gdo.net.node[gdo.clientId].height;
            var controlPixels = width * height;
            var numOfNodes = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].cols * gdo.net.section[gdo.net.node[gdo.clientId].sectionId].rows;
            mapResolution = mapResolution / Math.sqrt((nodePixels*numOfNodes)/controlPixels);
            if (!gdo.net.app["Maps"].isInitialized) {
                gdo.net.app["Maps"].initMap(mapCenter, mapResolution);
                gdo.net.app["Maps"].isInitialized = true;
            }
            parent.gdo.net.app["Maps"].map.getView().setCenter(mapCenter);
            parent.gdo.net.app["Maps"].map.getView().setResolution(mapResolution);
        }
    }
    $.connection.mapsAppHub.client.receiveInitialMapPosition = function (instanceId, center, resolution) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["Maps"].isInitialized = true;
            gdo.net.app["Maps"].initMap(center, resolution);
            gdo.net.app["Maps"].map.updateSize();
            gdo.net.app["Maps"].map.getView().on('change:resolution', function () {
                gdo.net.app["Maps"].changeEvent();
            });
            gdo.net.app["Maps"].map.getView().on('change:center', function () {
                gdo.net.app["Maps"].changeEvent();
            });
            gdo.net.app["Maps"].map.getView().on('change:rotation', function () {
                gdo.net.app["Maps"].changeEvent();
            });
            gdo.net.app["Maps"].map.getView().on('change:size', function () {
                gdo.net.app["Maps"].changeEvent();
            });
            gdo.net.app["Maps"].map.getView().on('change:view', function () {
                gdo.net.app["Maps"].changeEvent();
            });
            gdo.net.app["Maps"].map.getView().on('change:zoom', function () {
                gdo.net.app["Maps"].changeEvent();
            });
            gdo.net.app["Maps"].map.getView().on('change:target', function () {
                gdo.net.app["Maps"].changeEvent();
            });
            gdo.net.app["Maps"].uploadMapPosition();
        }
    }
});

gdo.net.app["Maps"].initMap = function(center, resolution) {
    gdo.net.app["Maps"].view = new parent.gdo.net.app["Maps"].ol.View({
        center: [parseFloat(center[0]), parseFloat(center[1])],
        resolution: parseFloat(resolution)
    });
    gdo.net.app["Maps"].map = new parent.gdo.net.app["Maps"].ol.Map({
        controls: new Array(),
        layers: [
          new parent.gdo.net.app["Maps"].ol.layer.Tile({
              source: new parent.gdo.net.app["Maps"].ol.source.BingMaps({
                  key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
                  imagerySet: 'Aerial'
              })
          })
        ],
        target: 'map',
        view: parent.gdo.net.app["Maps"].view
    });
}

gdo.net.app["Maps"].calculateLocalCenter = function (topLeft, bottomRight) {
    var diffTotal = [parseFloat(bottomRight[0]) - parseFloat(topLeft[0]), parseFloat(bottomRight[1]) - parseFloat(topLeft[1])];
    var diffUnit = [diffTotal[0] / gdo.net.section[gdo.net.node[gdo.clientId].sectionId].cols, diffTotal[1] / gdo.net.section[gdo.net.node[gdo.clientId].sectionId].rows];
    var center = [parseFloat(topLeft[0]) + (diffUnit[0] * (0.5 + gdo.net.node[gdo.clientId].sectionCol)), parseFloat(topLeft[1]) + (diffUnit[1] * (0.5 + gdo.net.node[gdo.clientId].sectionRow))];
    //TODO
    gdo.net.app["Maps"].topLeft = topLeft;
    gdo.net.app["Maps"].bottomRight = bottomRight;
    gdo.net.app["Maps"].diffTotal = diffTotal;
    gdo.net.app["Maps"].diffUnit = diffUnit;
    gdo.net.app["Maps"].center = center;

    return center;
}

gdo.net.app["Maps"].calculateOffsetPosition = function (longtitude, latitude, distanceNorth, distanceEast) {

    var latitudeOffset = (distanceNorth / gdo.net.app["Maps"].R) * 180 / Math.PI;
    var longtitudeOffset = (distanceEast / (gdo.net.app["Maps"].R * Math.cos(latitude * Math.PI / 180))) * 180 / Math.PI;
    gdo.consoleOut('.MAPS', 3, longtitudeOffset + ", " + latitudeOffset);
    return [longtitude + longtitudeOffset, latitude + latitudeOffset];
}

gdo.net.app["Maps"].initClient = function () {
    gdo.consoleOut('.Maps', 1, 'Initializing Maps App Client at Node ' + gdo.clientId);
    gdo.net.app["Maps"].isInitialized = false;
    gdo.net.app["Maps"].C = 156543.034;
    gdo.net.app["Maps"].R = 6378137;

    gdo.net.app["Maps"].sectionWidth = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].width;
    gdo.net.app["Maps"].sectionHeight = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].height;
    gdo.net.app["Maps"].sectionPixels = gdo.net.app["Maps"].sectionWidth * gdo.net.app["Maps"].sectionHeight;
    gdo.net.app["Maps"].sectionOffsetX = gdo.net.app["Maps"].sectionWidth / 2;
    gdo.net.app["Maps"].sectionOffsetY = gdo.net.app["Maps"].sectionHeigth / 2;

    gdo.net.app["Maps"].nodeWidth = gdo.net.node[gdo.clientId].width;
    gdo.net.app["Maps"].nodeHeigth = gdo.net.node[gdo.clientId].height;
    gdo.net.app["Maps"].nodePixels = gdo.net.app["Maps"].nodeWidth * gdo.net.app["Maps"].nodeHeigth;
    gdo.net.app["Maps"].nodeOffsetX = gdo.net.app["Maps"].nodeWidth * (gdo.net.node[gdo.clientId].sectionCol + 1);
    gdo.net.app["Maps"].nodeOffsetY = gdo.net.app["Maps"].nodeHeight * (gdo.net.node[gdo.clientId].sectionRow + 1);

    gdo.net.app["Maps"].offsetX = gdo.net.app["Maps"].sectionOffsetX - gdo.net.app["Maps"].nodeOffsetX;
    gdo.net.app["Maps"].offsetY = gdo.net.app["Maps"].sectionOffsetY - gdo.net.app["Maps"].nodeOffsetY;

    gdo.net.app["Maps"].server.requestMapPosition(gdo.net.node[gdo.clientId].appInstanceId, false);
}

gdo.net.app["Maps"].initControl = function () {
    gdo.net.app["Maps"].isInitialized = false;
    gdo.controlId = getUrlVar("controlId");


    gdo.net.app["Maps"].sectionWidth = gdo.net.section[gdo.net.instance[gdo.controlId].sectionId].width;
    gdo.net.app["Maps"].sectionHeight = gdo.net.section[gdo.net.instance[gdo.controlId].sectionId].height;
    gdo.net.app["Maps"].sectionRatio = gdo.net.app["Maps"].sectionWidth / gdo.net.app["Maps"].sectionHeight;
    gdo.net.app["Maps"].controlMaxWidth = 1490;
    gdo.net.app["Maps"].controlMaxHeight = 700;
    gdo.net.app["Maps"].controlRatio = gdo.net.app["Maps"].controlMaxWidth / gdo.net.app["Maps"].controlMaxHeight;
    gdo.net.app["Maps"].controlWidth = 700;
    gdo.net.app["Maps"].controlHeight = 350;
    if (gdo.net.app["Maps"].sectionRatio >= gdo.net.app["Maps"].controlRatio) {
        gdo.net.app["Maps"].controlWidth = gdo.net.app["Maps"].controlMaxWidth;
        gdo.net.app["Maps"].controlHeight = (gdo.net.app["Maps"].sectionHeight * gdo.net.app["Maps"].controlWidth) / gdo.net.app["Maps"].sectionWidth;
    } else {
        gdo.net.app["Maps"].controlHeight = gdo.net.app["Maps"].controlMaxHeight;
        gdo.net.app["Maps"].controlWidth = (gdo.net.app["Maps"].sectionWidth * gdo.net.app["Maps"].controlHeight) / gdo.net.app["Maps"].sectionHeight;
    }
    $("iframe").contents().find("#map").css("width", gdo.net.app["Maps"].controlWidth);
    $("iframe").contents().find("#map").css("height", gdo.net.app["Maps"].controlHeight);


    gdo.net.app["Maps"].server.requestMapPosition(gdo.controlId, true);
    gdo.consoleOut('.MAPS', 1, 'Initializing Image Maps Control at Instance ' + gdo.controlId);
}

gdo.net.app["Maps"].terminateClient = function () {
    gdo.consoleOut('.MAPS', 1, 'Terminating Image Maps Client at Node ' + gdo.clientId);
}

gdo.net.app["Maps"].terminateControl = function () {
    gdo.consoleOut('.MAPS', 1, 'Terminating Maps App Control at Instance ' + gdo.controlId);
}

gdo.net.app["Maps"].uploadMapPosition = function () {
    var center = gdo.net.app["Maps"].map.getView().getCenter();
    var topLeft = gdo.net.app["Maps"].map.getCoordinateFromPixel([0, 0]);
    var bottomRight = gdo.net.app["Maps"].map.getCoordinateFromPixel(gdo.net.app["Maps"].map.getSize());
    var size = gdo.net.app["Maps"].map.getSize();
    var width = size[0];
    var height = size[1];
    gdo.net.app["Maps"].server.uploadMapPosition(gdo.controlId,topLeft, center, bottomRight, gdo.net.app["Maps"].map.getView().getResolution(), width, height, gdo.net.app["Maps"].map.getView().getZoom());
}

gdo.net.app["Maps"].changeEvent = function() {
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        if (gdo.net.app["Maps"].isInitialized) {
            gdo.net.app["Maps"].uploadMapPosition();
        }
    }
}

gdo.management.drawMapTable = function () {
    /// <summary>
    /// Draws the button table.
    /// </summary>
    /// <returns></returns>

    //Create Section

    $("#button_table_row_0_col_0")
        .empty()
        .append("<div id='button_Create_section'> <b>Create Section</b></div>")
        .css("height", gdo.management.button_height)
        .css("width", (gdo.management.table_width / gdo.management.button_cols) + "%")
        .css("border", "3px solid #444")
        .css("background", "#222")
        .css("color", "#777")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size });

    gdo.management.isRectangle = true;
    gdo.management.isStarted = false;
    gdo.management.colStart = 1000;
    gdo.management.colEnd = -1;
    gdo.management.rowStart = 1000;
    gdo.management.rowEnd = -1;
    for (var i = 1; i <= gdo.net.cols * gdo.net.rows; i++) {
        var node = gdo.net.node[i];
        if (node.isSelected) {
            gdo.management.isStarted = true;
            if (node.col <= gdo.management.colStart) {
                gdo.management.colStart = node.col;
            }
            if (node.row <= gdo.management.rowStart) {
                gdo.management.rowStart = node.row;
            }
            if (node.col >= gdo.management.colEnd) {
                gdo.management.colEnd = node.col;
            }
            if (node.row >= gdo.management.rowEnd) {
                gdo.management.rowEnd = node.row;
            }
        }
    }
    for (var i = gdo.management.colStart; i <= gdo.management.colEnd; i++) {
        for (var j = gdo.management.rowStart; j <= gdo.management.rowEnd; j++) {
            var node = gdo.net.node[gdo.net.getNodeId(i, j)];
            if (!node.isSelected) {
                gdo.management.isRectangle = false;
            }
        }
    }
    $("#button_table_row_0_col_0").unbind();
    $("#button_table_row_0_col_0").click(function () {
        if (gdo.management.isRectangle && gdo.management.isStarted) {
            gdo.net.server.createSection(gdo.management.colStart, gdo.management.rowStart, gdo.management.colEnd, gdo.management.rowEnd);
            for (var i = gdo.management.colStart; i <= gdo.management.colEnd; i++) {
                for (var j = gdo.management.rowStart; j <= gdo.management.rowEnd; j++) {
                    var node = gdo.net.node[gdo.net.getNodeId(i, j)];
                    node.isSelected = false;
                }
            }
            gdo.consoleOut('.MANAGEMENT', 1, 'Requested Creation of Section at (' + gdo.management.colStart + ',' + gdo.management.rowStart + '),(' + gdo.management.colEnd + ',' + gdo.management.rowEnd + ')');
        } else {

        }
    });
    if (gdo.management.isStarted) {
        if (gdo.management.isRectangle) {
            $("#button_table_row_0_col_0")
                .css("background", "darkgreen")
                .css("color", "#FFF");
        } else {
            $("#button_table_row_0_col_0")
                .css("background", "darkred")
                .css("color", "#FFF");
        }
    } else {
        $("#button_table_row_0_col_0")
            .css("background", "#222");
    }

    //Close Section

    $("#button_table_row_0_col_1")
        .empty()
        .append("<div id='button_close_section'> <b>Close Section</b></div>")
        .css("height", gdo.management.button_height)
        .css("width", (100 / gdo.management.button_cols) + "%")
        .css("border", "3px solid #444")
        .css("color", "#777")
        .css("background", "#222")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
        .click(function () {
            if (gdo.management.selectedSection > -1) {
                if (gdo.net.section[gdo.management.selectedSection].appInstanceId == -1) {
                    gdo.net.server.closeSection(gdo.management.selectedSection);
                    gdo.consoleOut('.MANAGEMENT', 1, 'Requested Disposal of Section ' + gdo.management.selectedSection);
                    gdo.management.selectedSection = -1;
                }
            }
        });
    if (gdo.management.selectedSection > -1) {
        if (gdo.net.section[gdo.management.selectedSection].appInstanceId == -1) {
            $("#button_table_row_0_col_1").css("background", "darkred").css("color", "#FFF");
        }
    }
    $("#button_table_row_0_col_2")
        .empty()
        .append("<div id='button_deploy_app'> <b>Deploy App</b></div>")
        .css("height", gdo.management.button_height)
        .css("width", (100 / gdo.management.button_cols) + "%")
        .css("border", "3px solid #444")
        .css("color", "#777")
        .css("background", "#222")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
        .click(function () {
            if (gdo.management.selectedSection > -1) {
                if (!gdo.management.toggleAppTable && gdo.net.section[gdo.management.selectedSection].appInstanceId == -1) {
                    gdo.management.toggleNodeTable = false;
                    gdo.management.toggleAppTable = true;
                    gdo.management.toggleInstanceTable = false;
                    gdo.management.toggleConsole = false;
                    gdo.management.toggleSectionTable = true;
                    gdo.updateDisplayCanvas();
                }
            }
        });
    if (gdo.management.selectedSection > -1) {
        if (gdo.net.section[gdo.management.selectedSection].appInstanceId == -1) {
            $("#button_table_row_0_col_2").css("background", "darkgreen").css("color", "#FFF");
        }
    }
    $("#button_table_row_0_col_3")
        .empty()
        .append("<div id='button_control_app'> <b>Control App</b></div>")
        .css("height", gdo.management.button_height)
        .css("width", (100 / gdo.management.button_cols) + "%")
        .css("border", "3px solid #444")
        .css("color", "#777")
        .css("background", "#222")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
        .click(function () {
            if (gdo.management.selectedSection > -1) {
                if (gdo.net.section[gdo.management.selectedSection].appInstanceId > -1) {
                    gdo.management.toggleNodeTable = false;
                    gdo.management.toggleAppTable = false;
                    gdo.management.toggleInstanceTable = true;
                    gdo.management.toggleConsole = false;
                    gdo.management.toggleSectionTable = false;
                    gdo.updateDisplayCanvas();
                }
            }
        });
    if (gdo.management.selectedSection > -1) {
        if (gdo.net.section[gdo.management.selectedSection].appInstanceId > -1) {
            $("#button_table_row_0_col_3").css("background", "darkgreen").css("color", "#FFF");
        }
    }
    $("#button_table_row_0_col_4")
    .empty()
    .append("<div id='button_close_app'> <b>Close App</b></div>")
    .css("height", gdo.management.button_height)
    .css("width", (100 / gdo.management.button_cols) + "%")
    .css("border", "3px solid #444")
    .css("color", "#777")
    .css("background", "#222")
    .css('padding', gdo.management.cell_padding)
    .attr("align", "center")
    .css({ fontSize: gdo.management.button_font_size })
    .click(function () {
        if (gdo.management.selectedSection > -1) {
            if (gdo.net.section[gdo.management.selectedSection].appInstanceId > -1) {
                gdo.net.server.closeApp(gdo.net.section[gdo.management.selectedSection].appInstanceId);
                gdo.consoleOut('.MANAGEMENT', 1, 'Requested Disposal of App' + gdo.management.selectedSection);
                gdo.management.selectedSection = -1;
            }
        }
    });
    if (gdo.management.selectedSection > -1) {
        if (gdo.net.section[gdo.management.selectedSection].appInstanceId > -1) {
            $("#button_table_row_0_col_4").css("background", "darkred").css("color", "#FFF");
        }
    }
}
           
