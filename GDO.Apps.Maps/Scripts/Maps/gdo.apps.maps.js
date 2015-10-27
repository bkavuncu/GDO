var map;
var map3D;
var view;
var styles;
var layers;
var scene;
var terrainProvider;
var ds;

$(function () {
    gdo.consoleOut('.MAPS', 1, 'Loaded Maps JS');

    /*$.connection.mapsAppHub.client.receive3DMode = function (instanceId, mode) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && gdo.net.node[gdo.clientId].appInstanceId == instanceId) {
            gdo.net.app["Maps"].set3DMode(instanceId, mode);
            gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Setting 3D Mode :' + mode);
            gdo.net.app["Maps"].drawMapTable(instanceId);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.net.app["Maps"].selectedInstance == instanceId) {
            gdo.net.app["Maps"].set3DMode(instanceId, mode);
            gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Setting 3D Mode :' + mode);
            gdo.net.app["Maps"].drawMapTable(instanceId);
        }
    }*/

    $.connection.mapsAppHub.client.receiveTemplate = function (serializedTemplate) {
        gdo.consoleOut('.MAPS', 1, 'Received Template Table');
        //TODO
    }

    $.connection.mapsAppHub.client.receiveZIndexTable = function (instanceId, serializedZIndexTable) {
        gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Received ZIndex Table');
        gdo.net.app["Maps"].updateZIndexTable(instanceId, JSON.parse(serializedZIndexTable));
    }

    $.connection.mapsAppHub.client.receiveLayer = function (instanceId, layerId, serializedLayer, exists) {
        gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Received Layer :' + layerId + " (Exists:"+ exists+")");
        if (exists) {
            if (gdo.net.instance[instanceId].layers[layerId] == null || typeof gdo.net.instance[instanceId].layers[layerId] == "undefined") {
                gdo.net.app["Maps"].addLayer(instanceId, layerId, JSON.parse(serializedLayer));
                gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Added Layer :' + layerId);
            } else {
                gdo.net.app["Maps"].updateLayer(instanceId, layerId, JSON.parse(serializedLayer));
                gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Updated Layer :' + layerId);
            }
        } else {
            gdo.net.app["Maps"].removeLayer(instanceId, layerId);
        }
    }

    $.connection.mapsAppHub.client.receiveView = function (instanceId, serializedView) {
        gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Received View');
        gdo.net.app["Maps"].updateView(instanceId, JSON.parse(serializedView));
    }

    $.connection.mapsAppHub.client.receiveMap = function (instanceId, serializedMap) {
        gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Received Map');
        gdo.net.app["Maps"].initMap(instanceId, JSON.parse(serializedMap));
    }

    $.connection.mapsAppHub.client.receiveInteraction = function (instanceId) {

    }

    $.connection.mapsAppHub.client.receiveSource = function (instanceId, sourceId, serializedSource, exists) {
        gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Received Source :' + sourceId + " (Exists:" + exists + ")");
        if (exists) {
            if (gdo.net.instance[instanceId].sources[sourceId] == null || typeof gdo.net.instance[instanceId].sources[sourceId] == "undefined") {
                gdo.net.app["Maps"].addSource(instanceId, sourceId, JSON.parse(serializedSource));
                gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Added Source :' + sourceId);
            } else {
                gdo.net.app["Maps"].updateSource(instanceId, sourceId, JSON.parse(serializedSource));
                gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Updated Source :' + sourceId);
            }
        } else {
            gdo.net.app["Maps"].removeSource(instanceId, sourceId);
        }
    }

    $.connection.mapsAppHub.client.receiveControl = function (instanceId) {

    }

    $.connection.mapsAppHub.client.receiveStyle = function (instanceId, styleId, serializedStyle, exists) {
        gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Received Style :' + styleId + " (Exists:" + exists + ")");
        if (exists) {
            if (gdo.net.instance[instanceId].styles[styleId] == null || typeof gdo.net.instance[instanceId].styles[styleId] == "undefined") {
                gdo.net.app["Maps"].addStyle(instanceId, styleId, JSON.parse(serializedStyle));
                gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Added Style :' + styleId);
            } else {
                gdo.net.app["Maps"].updateStyle(instanceId, styleId, JSON.parse(serializedStyle));
                gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Updated Style :' + styleId);
            }
        } else {
            gdo.net.app["Maps"].removeStyle(instanceId, styleId);
        }
    }

    $.connection.mapsAppHub.client.receiveFormat = function (instanceId, formatId, serializedFormat, exists) {
        gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Received Format :' + formatId + " (Exists:" + exists + ")");
        if (exists) {
            if (gdo.net.instance[instanceId].formats[formatId] == null || typeof gdo.net.instance[instanceId].formats[formatId] == "undefined") {
                gdo.net.app["Maps"].addFormat(instanceId, formatId, JSON.parse(serializedFormat));
                gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Added Format :' + formatId);
            } else {
                gdo.net.app["Maps"].updateFormat(instanceId, formatId, JSON.parse(serializedFormat));
                gdo.consoleOut('.MAPS', 1, 'Instance ' + instanceId + ': Updated Format :' + formatId);
            }
        } else {
            gdo.net.app["Maps"].removeFormat(instanceId, formatId);
        }
    }
});

gdo.net.app["Maps"].initMap = function (instanceId, deserializedMap) {

    //Initialize View
    view = new ol.View({
        center: [0, 0],
        resolution: 77
    });

    gdo.net.instance[instanceId].view = view;

    //Initialize Map
    map = new ol.Map({
        controls: new Array(),
        layers: gdo.net.instance[instanceId].layers,
        target: 'map',
        view: gdo.net.instance[instanceId].view
    });
    gdo.net.instance[instanceId].map = map;

    //Process deserialized Map
    var i;
    for (i = 0; i < deserializedMap.Formats.$values.length; i++) {
        gdo.net.app["Maps"].addFormat(instanceId, deserializedMap.Formats.$values[i].Id, deserializedMap.Formats.$values[i]);
    }
    for (i = 0; i < deserializedMap.Styles.$values.length; i++) {
        gdo.net.app["Maps"].addStyle(instanceId, deserializedMap.Styles.$values[i].Id, deserializedMap.Styles.$values[i]);
    }
    for (i = 0; i < deserializedMap.Sources.$values.length; i++) {
        gdo.net.app["Maps"].addSource(instanceId, deserializedMap.Sources.$values[i].Id, deserializedMap.Sources.$values[i]);
    }
    for (i = 0; i < deserializedMap.Layers.$values.length; i++) {
        gdo.net.app["Maps"].addLayer(instanceId, deserializedMap.Layers.$values[i].Id, deserializedMap.Layers.$values[i]);
    }

    gdo.net.app["Maps"].setView(instanceId, deserializedMap.View);
    
    //Register Change Handlers
    gdo.net.instance[instanceId].map.getView().on('change:resolution', function () {
        gdo.net.app["Maps"].changeEvent(instanceId);
        setTimeout(function () { gdo.net.app["Maps"].updateCenter(instanceId); }, 70);
    });
    gdo.net.instance[instanceId].map.getView().on('change:zoom', function () {
        gdo.net.app["Maps"].changeEvent(instanceId);
        setTimeout(function () { gdo.net.app["Maps"].updateCenter(instanceId); }, 70);
    });
    gdo.net.instance[instanceId].map.getView().on('change:center', function () {
        gdo.net.app["Maps"].changeEvent(instanceId);
    });
    gdo.net.instance[instanceId].map.getView().on('change:rotation', function () {
        gdo.net.app["Maps"].changeEvent(instanceId);
    });
    gdo.net.instance[instanceId].map.on('change:size', function () {
        gdo.net.app["Maps"].changeEvent(instanceId);
    });
    gdo.net.instance[instanceId].map.on('change:view', function () {
        //gdo.net.app["Maps"].changeEvent(instanceId);
    });
    gdo.net.instance[instanceId].map.on('change:target', function () {
        gdo.net.app["Maps"].changeEvent(instanceId);
    });

    // Initialized
    gdo.net.instance[instanceId].isInitialized = true;
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        gdo.net.app["Maps"].drawMapTable(gdo.net.app["Maps"].selectedInstance);
    }
    gdo.net.app["Maps"].requestView(instanceId);
}

gdo.net.app["Maps"].set3DMode = function (instanceId, mode) {
    //gdo.net.instance[instanceId].map3D.setEnabled(mode);
    gdo.net.instance[instanceId].mode = mode;
}

gdo.net.app["Maps"].initClient = function (clientId) {
    var instanceId = gdo.net.node[gdo.clientId].appInstanceId;
    gdo.consoleOut('.Maps', 1, 'Initializing Maps App Instance ' + instanceId + ' Client at Node ' + clientId);

    //Initialize Arrays
    gdo.net.app["Maps"].initializeArrays(instanceId);

    //Load Modules
    gdo.loadModule('utilities', 'maps', gdo.MODULE_TYPE.APP);
    gdo.loadModule('3d', 'maps', gdo.MODULE_TYPE.APP);
    gdo.loadModule('format', 'maps', gdo.MODULE_TYPE.APP);
    gdo.loadModule('interaction', 'maps', gdo.MODULE_TYPE.APP);
    gdo.loadModule('layer', 'maps', gdo.MODULE_TYPE.APP);
    gdo.loadModule('source', 'maps', gdo.MODULE_TYPE.APP);
    gdo.loadModule('style', 'maps', gdo.MODULE_TYPE.APP);
    gdo.loadModule('view', 'maps', gdo.MODULE_TYPE.APP);

    //Calculate Necessary Parameters
    gdo.net.instance[instanceId].isInitialized = false;
    gdo.net.app["Maps"].calculateClientParameters(instanceId);

    //Request

    gdo.net.app["Maps"].server.requestMap(instanceId); 
}

gdo.net.app["Maps"].initControl = function (instanceId) {
    gdo.consoleOut('.MAPS', 1, 'Initializing Maps Control at Instance ' + instanceId);

    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        gdo.net.app["Maps"].selectedInstance = instanceId;
    }

    //Initialize Arrays
    gdo.net.app["Maps"].initializeArrays(instanceId);

    //Load Modules
    gdo.loadModule('utilities', 'maps', gdo.MODULE_TYPE.APP);
    if (gdo.net.app["Maps"].isAdvanced) {
        gdo.loadModule('ui.advanced', 'maps', gdo.MODULE_TYPE.APP);
    } else {
        gdo.loadModule('ui', 'maps', gdo.MODULE_TYPE.APP);
    }
    gdo.loadModule('3d', 'maps', gdo.MODULE_TYPE.APP);
    gdo.loadModule('format', 'maps', gdo.MODULE_TYPE.APP);
    gdo.loadModule('interaction', 'maps', gdo.MODULE_TYPE.APP);
    gdo.loadModule('layer', 'maps', gdo.MODULE_TYPE.APP);
    gdo.loadModule('source', 'maps', gdo.MODULE_TYPE.APP);
    gdo.loadModule('style', 'maps', gdo.MODULE_TYPE.APP);
    gdo.loadModule('view', 'maps', gdo.MODULE_TYPE.APP);

    //Calculate Necessary Parameters
    gdo.net.instance[instanceId].isInitialized = false;
    gdo.net.app["Maps"].calculateControlParameters(instanceId);

    //Resize Map
    gdo.net.app["Maps"].resizeMap(instanceId);

    //Request Map
    gdo.net.app["Maps"].server.requestMap(instanceId);
}

gdo.net.app["Maps"].initializeArrays = function(instanceId) {
    gdo.net.instance[instanceId].formats = [];
    gdo.net.instance[instanceId].styles = [];
    gdo.net.instance[instanceId].sources = [];
    gdo.net.instance[instanceId].layers = [];
    gdo.net.instance[instanceId].view = {};
}

gdo.net.app["Maps"].switchToInstance = function (instanceId) {
    $("#map").empty();
    gdo.net.app["Maps"].initializeArrays(instanceId);
    gdo.net.app["Maps"].calculateControlParameters(instanceId);
    gdo.net.app["Maps"].resizeMap(instanceId);
    gdo.net.app["Maps"].server.requestMap(instanceId);
}

gdo.net.app["Maps"].resizeMap = function(instanceId) {
    if (gdo.net.app["Maps"].isAdvanced) {
        $("body").contents().find("#map").css("width", gdo.net.instance[instanceId].controlWidth);
        $("body").contents().find("#map").css("height", gdo.net.instance[instanceId].controlHeight);
    } else {
        $("iframe").contents().find("#map").css("width", gdo.net.instance[instanceId].controlWidth);
        $("iframe").contents().find("#map").css("height", gdo.net.instance[instanceId].controlHeight);
    }
}

gdo.net.app["Maps"].calculateClientParameters = function (instanceId) {
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
}

gdo.net.app["Maps"].calculateControlParameters = function(instanceId) {
    gdo.net.instance[instanceId].sectionWidth = gdo.net.section[gdo.net.instance[gdo.net.app["Maps"].selectedInstance].sectionId].width;
    gdo.net.instance[instanceId].sectionHeight = gdo.net.section[gdo.net.instance[gdo.net.app["Maps"].selectedInstance].sectionId].height;
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
}
gdo.net.app["Maps"].terminateClient = function (instanceId) {
    gdo.consoleOut('.MAPS', 1, 'Terminating Image Maps Client at Node ' + instanceId);
}

gdo.net.app["Maps"].terminateControl = function (instanceId) {
    gdo.consoleOut('.MAPS', 1, 'Terminating Maps App Control at Instance ' + instanceId);
}

gdo.net.app["Maps"].changeEvent = function (instanceId) {
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        if (gdo.net.instance[instanceId].isInitialized) {
            //gdo.net.app["Maps"].updateCenter(instanceId);
            gdo.net.app["Maps"].uploadView(instanceId);
        }
    }
}

gdo.net.app["Maps"].updateCenter = function (instanceId) {
    gdo.consoleOut('.MAPS', 4, gdo.net.instance[instanceId].map.getView().getCenter());
    gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
}
