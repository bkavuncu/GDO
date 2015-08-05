
$(function() {
    gdo.consoleOut('.MAPS', 1, 'Loaded Maps JS');
    $.connection.mapsAppHub.client.receiveMapStyle = function (instanceId, style) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && gdo.net.node[gdo.clientId].appInstanceId == instanceId && style != null) {
            gdo.net.app["Maps"].setStyle(style);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId && style != null) {
            gdo.net.app["Maps"].setStyle(style);
            gdo.net.app["Maps"].drawMapTable();
        }else if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId && style == null) {
            gdo.net.app["Maps"].server.uploadMapStyle(gdo.controlId, gdo.net.app["Maps"].styles[0]);
            gdo.net.app["Maps"].drawMapTable();
        }
    }
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
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        gdo.net.app["Maps"].styles = gdo.net.app["Maps"].config[gdo.net.instance[gdo.controlId].configName].styles;
    } else {
        gdo.net.app["Maps"].styles = gdo.net.app["Maps"].config[gdo.net.instance[gdo.net.node[gdo.clientId].appInstanceId].configName].styles;
    }
    
    gdo.net.app["Maps"].layers = [];
    var i, ii;
    for (i = 0, ii = gdo.net.app["Maps"].styles.length; i < ii; ++i) {
        gdo.net.app["Maps"].layers.push(new gdo.net.app["Maps"].ol.layer.Tile({
            visible: false,
            preload: Infinity,
            source: new gdo.net.app["Maps"].ol.source.BingMaps({
                key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
                imagerySet: gdo.net.app["Maps"].styles[i],
                maxZoom: 19
            })
        }));
    }
    gdo.net.app["Maps"].map = new gdo.net.app["Maps"].ol.Map({
        controls: new Array(),
        layers: gdo.net.app["Maps"].layers,
        target: 'map',
        view: gdo.net.app["Maps"].view
    });
    gdo.net.app["Maps"].setStyle(gdo.net.app["Maps"].styles[0]);
}

gdo.net.app["Maps"].calculateLocalCenter = function (topLeft, bottomRight) {
    var diffTotal = [parseFloat(bottomRight[0]) - parseFloat(topLeft[0]), parseFloat(bottomRight[1]) - parseFloat(topLeft[1])];
    var diffUnit = [diffTotal[0] / gdo.net.section[gdo.net.node[gdo.clientId].sectionId].cols, diffTotal[1] / gdo.net.section[gdo.net.node[gdo.clientId].sectionId].rows];
    var center = [parseFloat(topLeft[0]) + (diffUnit[0] * (0.5 + gdo.net.node[gdo.clientId].sectionCol)), parseFloat(topLeft[1]) + (diffUnit[1] * (0.5 + gdo.net.node[gdo.clientId].sectionRow))];
    return center;
}

gdo.net.app["Maps"].setStyle = function (style) {
    if (gdo.net.app["Maps"].layers != null) {
        gdo.net.app["Maps"].currentStyle = style;
        for (var i = 0, ii = gdo.net.app["Maps"].layers.length; i < ii; ++i) {
            gdo.net.app["Maps"].layers[i].setVisible(gdo.net.app["Maps"].styles[i] === style);
        }
    }
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
    gdo.net.app["Maps"].server.requestMapStyle(gdo.net.node[gdo.clientId].appInstanceId);
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
    gdo.net.app["Maps"].server.requestMapStyle(gdo.controlId);
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

gdo.net.app["Maps"].drawEmptyMapTable = function (maxCol, maxRow) {
    $("iframe").contents().find("#map_table").empty();
    for (var i = 0; i < maxRow; i++) {
        $("iframe").contents().find("#map_table").append("<tr id='map_table_row_" + i + "' row='" + i + "'></tr>");
        for (var j = 0; j < maxCol; j++) {
            $("iframe").contents().find("#map_table tr:last").append("<td id='map_table_row_" + i + "_col_" + j + "' col='" + j + "' row='" + i + "'></td>");
        }
    }
}

gdo.net.app["Maps"].drawMapTable = function () {
    gdo.net.app["Maps"].drawEmptyMapTable(gdo.net.app["Maps"].styles.length,1);
    var i, ii;
    for (i = 0, ii = gdo.net.app["Maps"].styles.length; i < ii; ++i) {
        $("iframe").contents().find("#map_table_row_0_col_" + i)
        .empty()
        .append("<div> <b>" + gdo.net.app["Maps"].styles[i]+ "</b></div>")
        .css("height", gdo.management.button_height /1.4)
        .css("width", ((gdo.management.table_width / 1.4) / gdo.management.button_cols) + "%")
        .css("border", "3px solid #444")
        .css("background", "#222")
        .css("color", "#DDD")
        .css('padding', gdo.management.cell_padding)
        .attr("align", "center")
        .css({ fontSize: gdo.management.button_font_size })
        .unbind()
        .click(function () {
            gdo.net.app["Maps"].server.uploadMapStyle(gdo.controlId, gdo.net.app["Maps"].styles[$(this).attr('col')]);
            gdo.net.app["Maps"].setStyle(gdo.net.app["Maps"].styles[$(this).attr('col')]);
            gdo.net.app["Maps"].drawMapTable();
            });
        if (gdo.net.app["Maps"].currentStyle == gdo.net.app["Maps"].styles[i]) {
            $("iframe").contents().find("#map_table_row_0_col_" + i).css("color", "lightgreen");
        } else {
            $("iframe").contents().find("#map_table_row_0_col_" + i).css("color", "#DDD");
        }
    }
}
           
