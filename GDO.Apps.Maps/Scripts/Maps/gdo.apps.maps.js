﻿var map;
var map3D;
var view;
var styles;
var layers;
var scene;
var terrainProvider;


$(function () {
    gdo.consoleOut('.MAPS', 1, 'Loaded Maps JS');

    $.connection.mapsAppHub.client.updateResolution = function (instanceId) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
        }
    }

    $.connection.mapsAppHub.client.receive3DMode = function (instanceId, mode) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && gdo.net.node[gdo.clientId].appInstanceId == instanceId) {
            gdo.net.app["Maps"].set3DMode(instanceId, mode);
            gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Setting 3D Mode :' + mode);
            gdo.net.app["Maps"].drawMapTable(instanceId);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["Maps"].set3DMode(instanceId, mode);
            gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Setting 3D Mode :' + mode);
            gdo.net.app["Maps"].drawMapTable(instanceId);
        }
    }

    $.connection.mapsAppHub.client.receiveLayer = function(instanceId) {

    }

    $.connection.mapsAppHub.client.receiveView = function (instanceId) {

    }

    $.connection.mapsAppHub.client.receiveInteraction = function (instanceId) {

    }

    $.connection.mapsAppHub.client.receiveSource = function (instanceId) {

    }

    $.connection.mapsAppHub.client.receiveControl = function (instanceId) {

    }

    $.connection.mapsAppHub.client.receiveStyle = function (instanceId) {

    }
});

gdo.net.app["Maps"].initMap = function (instanceId, center, resolution) {
    view = new ol.View({
        center: [parseFloat(center[0]), parseFloat(center[1])],
        resolution: parseFloat(resolution)
    });
    gdo.net.instance[instanceId].view = view;
    //$("iframe")[0].contentWindow.view = view;
    //$("iframe")[0].contentWindow.styles = styles;
    layers = [];
    gdo.net.instance[instanceId].layers = layers;
    //$("iframe")[0].contentWindow.layers = layers;
    var i, ii;
    for (i = 0, ii = gdo.net.instance[instanceId].styles.length; i < ii; ++i) {
        gdo.net.instance[instanceId].layers.push(new ol.layer.Tile({
            visible: false,
            preload: Infinity,
            source: new ol.source.BingMaps({
                key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
                imagerySet: gdo.net.instance[instanceId].styles[i],
                maxZoom: 19
            })
        }));
    }
    map = new ol.Map({
        controls: new Array(),
        layers: gdo.net.instance[instanceId].layers,
        target: 'map',
        view: gdo.net.instance[instanceId].view
    });
    gdo.net.instance[instanceId].map = map;
    //$("iframe")[0].contentWindow.map = map;
    //parent.map = map;

    //map3D = new $("iframe")[0].contentWindow.olcs.OLCesium({ map: map });

    //gdo.net.instance[instanceId].map3D = map3D;
    //$("iframe")[0].contentWindow.map3D = map3D;

    // scene = gdo.net.instance[instanceId].Map3D.getCesiumScene();

    //gdo.net.instance[instanceId].scene = scene;
    //$("iframe")[0].contentWindow.scene = scene;

    //terrainProvider = new $("iframe")[0].contentWindow.Cesium.CesiumTerrainProvider({
    //    url: '//cesiumjs.org/stk-terrain/tilesets/world/tiles'
    //});

    //scene.terrainProvider = terrainProvider;
    //gdo.net.instance[instanceId].terrainProvider = terrainProvider;
    //$("iframe")[0].contentWindow.terrainProvider = terrainProvider;

    gdo.net.app["Maps"].setStyle(instanceId, gdo.net.instance[instanceId].styles[0]);
}

gdo.net.app["Maps"].calculateLocalCenter = function (topLeft, bottomRight) {
    var diffTotal = [parseFloat(bottomRight[0]) - parseFloat(topLeft[0]), parseFloat(bottomRight[1]) - parseFloat(topLeft[1])];
    var diffUnit = [diffTotal[0] / gdo.net.section[gdo.net.node[gdo.clientId].sectionId].cols, diffTotal[1] / gdo.net.section[gdo.net.node[gdo.clientId].sectionId].rows];
    var center = [parseFloat(topLeft[0]) + (diffUnit[0] * (0.5 + gdo.net.node[gdo.clientId].sectionCol)), parseFloat(topLeft[1]) + (diffUnit[1] * (0.5 + gdo.net.node[gdo.clientId].sectionRow))];
    return center;
}

gdo.net.app["Maps"].set3DMode = function (instanceId, mode) {
    //gdo.net.instance[instanceId].map3D.setEnabled(mode);
    gdo.net.instance[instanceId].mode = mode;
}

gdo.net.app["Maps"].initClient = function (clientId) {
    var instanceId = gdo.net.node[gdo.clientId].appInstanceId;
    gdo.consoleOut('.Maps', 1, 'Initializing Maps App Instance ' + instanceId + ' Client at Node ' + clientId);
    gdo.loadModule('ui', 'maps', gdo.MODULE_TYPE.APP);
    gdo.loadModule('3d', 'maps', gdo.MODULE_TYPE.APP);
    gdo.net.instance[instanceId].isInitialized = false;
    gdo.net.app["Maps"].C = 156543.034;
    gdo.net.app["Maps"].R = 6378137;

    gdo.net.instance[instanceId].sectionWidth = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].width;
    gdo.net.instance[instanceId].sectionHeight = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].height;
    gdo.net.instance[instanceId].sectionPixels = gdo.net.instance[instanceId].sectionWidth * gdo.net.instance[instanceId].sectionHeight;
    gdo.net.instance[instanceId].sectionOffsetX = gdo.net.instance[instanceId].sectionWidth / 2;
    gdo.net.instance[instanceId].sectionOffsetY = gdo.net.instance[instanceId].sectionHeigth / 2;

    gdo.net.instance[instanceId].nodeWidth = gdo.net.node[gdo.clientId].width;
    gdo.net.instance[instanceId].nodeHeigth = gdo.net.node[gdo.clientId].height;
    gdo.net.instance[instanceId].nodePixels = gdo.net.instance[instanceId].nodeWidth * gdo.net.instance[instanceId].nodeHeigth;
    gdo.net.instance[instanceId].nodeOffsetX = gdo.net.instance[instanceId].nodeWidth * (gdo.net.node[gdo.clientId].sectionCol + 1);
    gdo.net.instance[instanceId].nodeOffsetY = gdo.net.instance[instanceId].nodeHeight * (gdo.net.node[gdo.clientId].sectionRow + 1);

    gdo.net.instance[instanceId].offsetX = gdo.net.instance[instanceId].sectionOffsetX - gdo.net.instance[instanceId].nodeOffsetX;
    gdo.net.instance[instanceId].offsetY = gdo.net.instance[instanceId].sectionOffsetY - gdo.net.instance[instanceId].nodeOffsetY;

    styles = gdo.net.app["Maps"].config[gdo.net.instance[instanceId].configName].styles;
    gdo.net.instance[instanceId].styles = styles;

    gdo.net.app["Maps"].server.request3DMode(instanceId);
    gdo.net.app["Maps"].server.requestMapPosition(instanceId, false);
    gdo.net.app["Maps"].server.requestMapStyle(instanceId);
}

gdo.net.app["Maps"].initControl = function (instanceId) {
    gdo.loadModule('ui', 'maps', gdo.MODULE_TYPE.APP);
    gdo.loadModule('3d', 'maps', gdo.MODULE_TYPE.APP);
    gdo.net.instance[instanceId].isInitialized = false;
    gdo.net.instance[instanceId].sectionWidth = gdo.net.section[gdo.net.instance[gdo.controlId].sectionId].width;
    gdo.net.instance[instanceId].sectionHeight = gdo.net.section[gdo.net.instance[gdo.controlId].sectionId].height;
    gdo.net.instance[instanceId].sectionRatio = gdo.net.instance[instanceId].sectionWidth / gdo.net.instance[instanceId].sectionHeight;
    gdo.net.instance[instanceId].controlMaxWidth = 1490;
    gdo.net.instance[instanceId].controlMaxHeight = 700;
    gdo.net.instance[instanceId].controlRatio = gdo.net.instance[instanceId].controlMaxWidth / gdo.net.instance[instanceId].controlMaxHeight;
    gdo.net.instance[instanceId].controlWidth = 700;
    gdo.net.instance[instanceId].controlHeight = 350;
    if (gdo.net.instance[instanceId].sectionRatio >= gdo.net.instance[instanceId].controlRatio) {
        gdo.net.instance[instanceId].controlWidth = gdo.net.instance[instanceId].controlMaxWidth;
        gdo.net.instance[instanceId].controlHeight = (gdo.net.instance[instanceId].sectionHeight * gdo.net.instance[instanceId].controlWidth) / gdo.net.instance[instanceId].sectionWidth;
    } else {
        gdo.net.instance[instanceId].controlHeight = gdo.net.instance[instanceId].controlMaxHeight;
        gdo.net.instance[instanceId].controlWidth = (gdo.net.instance[instanceId].sectionWidth * gdo.net.instance[instanceId].controlHeight) / gdo.net.instance[instanceId].sectionHeight;
    }
    $("iframe").contents().find("#map").css("width", gdo.net.instance[instanceId].controlWidth);
    $("iframe").contents().find("#map").css("height", gdo.net.instance[instanceId].controlHeight);

    styles = gdo.net.app["Maps"].config[gdo.net.instance[instanceId].configName].styles;
    gdo.net.instance[instanceId].styles = styles;

    gdo.net.app["Maps"].server.request3DMode(instanceId);
    gdo.net.app["Maps"].server.requestMapPosition(instanceId, true);
    gdo.net.app["Maps"].server.requestMapStyle(instanceId);
    gdo.consoleOut('.MAPS', 1, 'Initializing Image Maps Control at Instance ' + instanceId);

}

gdo.net.app["Maps"].terminateClient = function (instanceId) {
    gdo.consoleOut('.MAPS', 1, 'Terminating Image Maps Client at Node ' + instanceId);
}

gdo.net.app["Maps"].terminateControl = function (instanceId) {
    gdo.consoleOut('.MAPS', 1, 'Terminating Maps App Control at Instance ' + instanceId);
}

gdo.net.app["Maps"].uploadMapPosition = function (instanceId) {
    var center = gdo.net.instance[instanceId].map.getView().getCenter();
    var topLeft = gdo.net.instance[instanceId].map.getCoordinateFromPixel([0, 0]);
    var bottomRight = gdo.net.instance[instanceId].map.getCoordinateFromPixel(gdo.net.instance[instanceId].map.getSize());
    var size = gdo.net.instance[instanceId].map.getSize();
    var width = size[0];
    var height = size[1];
    gdo.net.app["Maps"].server.uploadMapPosition(instanceId, topLeft, center, bottomRight, gdo.net.instance[instanceId].map.getView().getResolution(), width, height, gdo.net.instance[instanceId].map.getView().getZoom());
}

gdo.net.app["Maps"].changeEvent = function (instanceId) {
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        if (gdo.net.instance[instanceId].isInitialized) {
            gdo.net.app["Maps"].uploadMapPosition(instanceId);
        }
    }
}

gdo.net.app["Maps"].updateCenter = function (instanceId) {
    gdo.consoleOut('.MAPS', 4, gdo.net.instance[instanceId].map.getView().getCenter());
    gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
}

//Layer

gdo.net.app["Maps"].addLayer = function(instanceId) {

}

gdo.net.app["Maps"].modifyLayer = function (instanceId) {

}

gdo.net.app["Maps"].requestLayer = function (instanceId) {

}

gdo.net.app["Maps"].setLayer = function (instanceId) {

}

gdo.net.app["Maps"].removeLayer = function (instanceId) {

}

//View

gdo.net.app["Maps"].addView = function (instanceId) {

}

gdo.net.app["Maps"].modifyView = function (instanceId) {

}

gdo.net.app["Maps"].requestView = function (instanceId) {

}

gdo.net.app["Maps"].setView = function (instanceId) {

}

gdo.net.app["Maps"].removeView = function (instanceId) {

}

//Interaction

gdo.net.app["Maps"].addInteraction = function (instanceId) {

}

gdo.net.app["Maps"].modifyInteraction = function (instanceId) {

}

gdo.net.app["Maps"].requestInteraction = function (instanceId) {

}

gdo.net.app["Maps"].setInteraction = function (instanceId) {

}

gdo.net.app["Maps"].removeInteraction = function (instanceId) {

}

//Source

gdo.net.app["Maps"].addSource = function (instanceId) {

}

gdo.net.app["Maps"].modifySource = function (instanceId) {

}

gdo.net.app["Maps"].requestSource = function (instanceId) {

}

gdo.net.app["Maps"].setSource = function (instanceId) {

}

gdo.net.app["Maps"].removeSource = function (instanceId) {

}

//Control

gdo.net.app["Maps"].addControl = function (instanceId) {

}

gdo.net.app["Maps"].modifyControl = function (instanceId) {

}

gdo.net.app["Maps"].requestControl = function (instanceId) {

}

gdo.net.app["Maps"].setControl = function (instanceId) {

}

gdo.net.app["Maps"].removeControl = function (instanceId) {

}

//Style

gdo.net.app["Maps"].addStyle = function (instanceId) {

}

gdo.net.app["Maps"].modifyStyle = function (instanceId) {

}

gdo.net.app["Maps"].requestStyle = function (instanceId) {

}

gdo.net.app["Maps"].setStyle = function (instanceId) {

}

gdo.net.app["Maps"].removeStyle = function (instanceId) {

}