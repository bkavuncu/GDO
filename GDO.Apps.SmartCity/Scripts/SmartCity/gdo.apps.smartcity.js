var map;
var map3D;
var view;
var styles;
var layers;
var scene;
var terrainProvider;
var ds;

$(function () {
    gdo.consoleOut('.SmartCity', 1, 'Loaded SmartCity JS');

    /*$.connection.smartCityAppHub.client.receive3DMode = function (instanceId, mode) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && gdo.net.node[gdo.clientId].appInstanceId == instanceId) {
            gdo.net.app["SmartCity"].set3DMode(instanceId, mode);
            gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Setting 3D Mode :' + mode);
            gdo.net.app["SmartCity"].drawMapTable(instanceId);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.net.app["SmartCity"].selectedInstance == instanceId) {
            gdo.net.app["SmartCity"].set3DMode(instanceId, mode);
            gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Setting 3D Mode :' + mode);
            gdo.net.app["SmartCity"].drawMapTable(instanceId);
        }
    }*/

    $.connection.smartCityAppHub.client.receiveTemplate = function (serializedTemplate) {
        gdo.consoleOut('.SmartCity', 1, 'Received Template Table');
        //TODO
    }

    $.connection.smartCityAppHub.client.receiveZIndexTable = function (instanceId, serializedZIndexTable) {
        gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Received ZIndex Table');
        gdo.net.app["SmartCity"].updateZIndexTable(instanceId, JSON.parse(serializedZIndexTable));
    }

    $.connection.smartCityAppHub.client.receiveLayer = function (instanceId, layerId, serializedLayer, exists) {
        gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Received Layer :' + layerId + " (Exists:"+ exists+")");
        if (exists) {
            if (gdo.net.instance[instanceId].layers[layerId] == null || typeof gdo.net.instance[instanceId].layers[layerId] == "undefined") {
                gdo.net.app["SmartCity"].addLayer(instanceId, layerId, JSON.parse(serializedLayer));
                gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Added Layer :' + layerId);
            } else {
                gdo.net.app["SmartCity"].updateLayer(instanceId, layerId, JSON.parse(serializedLayer));
                gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Updated Layer :' + layerId);
            }
        } else {
            gdo.net.app["SmartCity"].removeLayer(instanceId, layerId);
        }
    }

    $.connection.smartCityAppHub.client.receiveView = function (instanceId, serializedView) {
        gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Received View');
        gdo.net.app["SmartCity"].updateView(instanceId, JSON.parse(serializedView));
    }

    $.connection.smartCityAppHub.client.receiveMap = function (instanceId, serializedMap) {
        gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Received Map');
        gdo.net.app["SmartCity"].initMap(instanceId, JSON.parse(serializedMap));
    }

    $.connection.smartCityAppHub.client.receiveInteraction = function (instanceId) {

    }

    $.connection.smartCityAppHub.client.receiveSource = function (instanceId, sourceId, serializedSource, exists) {
        gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Received Source :' + sourceId + " (Exists:" + exists + ")");
        if (exists) {
            if (gdo.net.instance[instanceId].sources[sourceId] == null || typeof gdo.net.instance[instanceId].sources[sourceId] == "undefined") {
                gdo.net.app["SmartCity"].addSource(instanceId, sourceId, JSON.parse(serializedSource));
                gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Added Source :' + sourceId);
            } else {
                gdo.net.app["SmartCity"].updateSource(instanceId, sourceId, JSON.parse(serializedSource));
                gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Updated Source :' + sourceId);
            }
        } else {
            gdo.net.app["SmartCity"].removeSource(instanceId, sourceId);
        }
    }

    $.connection.smartCityAppHub.client.receiveControl = function (instanceId) {

    }

    $.connection.smartCityAppHub.client.receiveStyle = function (instanceId, styleId, serializedStyle, exists) {
        gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Received Style :' + styleId + " (Exists:" + exists + ")");
        if (exists) {
            if (gdo.net.instance[instanceId].styles[styleId] == null || typeof gdo.net.instance[instanceId].styles[styleId] == "undefined") {
                gdo.net.app["SmartCity"].addStyle(instanceId, styleId, JSON.parse(serializedStyle));
                gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Added Style :' + styleId);
            } else {
                gdo.net.app["SmartCity"].updateStyle(instanceId, styleId, JSON.parse(serializedStyle));
                gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Updated Style :' + styleId);
            }
        } else {
            gdo.net.app["SmartCity"].removeStyle(instanceId, styleId);
        }
    }

    $.connection.smartCityAppHub.client.receiveFormat = function (instanceId, formatId, serializedFormat, exists) {
        gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Received Format :' + formatId + " (Exists:" + exists + ")");
        if (exists) {
            if (gdo.net.instance[instanceId].formats[formatId] == null || typeof gdo.net.instance[instanceId].formats[formatId] == "undefined") {
                gdo.net.app["SmartCity"].addFormat(instanceId, formatId, JSON.parse(serializedFormat));
                gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Added Format :' + formatId);
            } else {
                gdo.net.app["SmartCity"].updateFormat(instanceId, formatId, JSON.parse(serializedFormat));
                gdo.consoleOut('.SmartCity', 1, 'Instance ' + instanceId + ': Updated Format :' + formatId);
            }
        } else {
            gdo.net.app["SmartCity"].removeFormat(instanceId, formatId);
        }
    }
});

gdo.net.app["SmartCity"].initMap = function (instanceId, deserializedMap) {

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
        gdo.net.app["SmartCity"].addFormat(instanceId, deserializedMap.Formats.$values[i].Id, deserializedMap.Formats.$values[i]);
    }
    for (i = 0; i < deserializedMap.Styles.$values.length; i++) {
        gdo.net.app["SmartCity"].addStyle(instanceId, deserializedMap.Styles.$values[i].Id, deserializedMap.Styles.$values[i]);
    }
    for (i = 0; i < deserializedMap.Sources.$values.length; i++) {
        gdo.net.app["SmartCity"].addSource(instanceId, deserializedMap.Sources.$values[i].Id, deserializedMap.Sources.$values[i]);
    }
    for (i = 0; i < deserializedMap.Layers.$values.length; i++) {
        gdo.net.app["SmartCity"].addLayer(instanceId, deserializedMap.Layers.$values[i].Id, deserializedMap.Layers.$values[i]);
    }

    gdo.net.app["SmartCity"].setView(instanceId, deserializedMap.View);
    
    //Register Change Handlers
    gdo.net.instance[instanceId].map.getView().on('change:resolution', function () {
        gdo.net.app["SmartCity"].changeEvent(instanceId);
        setTimeout(function () { gdo.net.app["SmartCity"].updateCenter(instanceId); }, 70);
    });
    gdo.net.instance[instanceId].map.getView().on('change:zoom', function () {
        gdo.net.app["SmartCity"].changeEvent(instanceId);
        setTimeout(function () { gdo.net.app["SmartCity"].updateCenter(instanceId); }, 70);
    });
    gdo.net.instance[instanceId].map.getView().on('change:center', function () {
        gdo.net.app["SmartCity"].changeEvent(instanceId);
    });
    gdo.net.instance[instanceId].map.getView().on('change:rotation', function () {
        gdo.net.app["SmartCity"].changeEvent(instanceId);
    });
    gdo.net.instance[instanceId].map.on('change:size', function () {
        gdo.net.app["SmartCity"].changeEvent(instanceId);
    });
    gdo.net.instance[instanceId].map.on('change:view', function () {
        //gdo.net.app["SmartCity"].changeEvent(instanceId);
    });
    gdo.net.instance[instanceId].map.on('change:target', function () {
        gdo.net.app["SmartCity"].changeEvent(instanceId);
    });

    // Initialized
    gdo.net.instance[instanceId].isInitialized = true;
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        gdo.net.app["SmartCity"].drawMapTable(gdo.net.app["SmartCity"].selectedInstance);
    }
    gdo.net.app["SmartCity"].requestView(instanceId);
}

gdo.net.app["SmartCity"].set3DMode = function (instanceId, mode) {
    //gdo.net.instance[instanceId].map3D.setEnabled(mode);
    gdo.net.instance[instanceId].mode = mode;
}

gdo.net.app["SmartCity"].initClient = function (clientId) {
    var instanceId = gdo.net.node[gdo.clientId].appInstanceId;
    gdo.consoleOut('.SmartCity', 1, 'Initializing SmartCity App Instance ' + instanceId + ' Client at Node ' + clientId);

    //Initialize Arrays
    gdo.net.app["SmartCity"].initializeArrays(instanceId);

    //Load Modules
    gdo.loadScript('utilities', 'smartCity', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('3d', 'smartCity', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('format', 'smartCity', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('interaction', 'smartCity', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('layer', 'smartCity', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('source', 'smartCity', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('style', 'smartCity', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('view', 'smartCity', gdo.SCRIPT_TYPE.APP);

    //Calculate Necessary Parameters
    gdo.net.instance[instanceId].isInitialized = false;
    gdo.net.app["SmartCity"].calculateClientParameters(instanceId);

    //Request

    gdo.net.app["SmartCity"].server.requestMap(instanceId); 
}

gdo.net.app["SmartCity"].initControl = function (instanceId) {
    gdo.consoleOut('.SmartCity', 1, 'Initializing SmartCity Control at Instance ' + instanceId);

    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        gdo.net.app["SmartCity"].selectedInstance = instanceId;
    }

    //Initialize Arrays
    gdo.net.app["SmartCity"].initializeArrays(instanceId);

    //Load Modules
    gdo.loadScript('utilities', 'smartCity', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('3d', 'smartCity', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('format', 'smartCity', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('interaction', 'smartCity', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('layer', 'smartCity', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('source', 'smartCity', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('style', 'smartCity', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('view', 'smartCity', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('ui.visualisation', 'smartCity', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('ui.map', 'smartCity', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('ui', 'smartCity', gdo.SCRIPT_TYPE.APP);

    //Calculate Necessary Parameters
    gdo.net.instance[instanceId].isInitialized = false;
    gdo.net.app["SmartCity"].calculateControlParameters(instanceId);

    //Resize Map
    gdo.net.app["SmartCity"].resizeMap(instanceId);

    //Request Map
    gdo.net.app["SmartCity"].server.requestMap(instanceId);
}

gdo.net.app["SmartCity"].initializeArrays = function(instanceId) {
    gdo.net.instance[instanceId].formats = [];
    gdo.net.instance[instanceId].styles = [];
    gdo.net.instance[instanceId].sources = [];
    gdo.net.instance[instanceId].layers = [];
    gdo.net.instance[instanceId].view = {};
}

gdo.net.app["SmartCity"].switchToInstance = function (instanceId) {
    $("#map").empty();
    gdo.net.app["SmartCity"].initializeArrays(instanceId);
    gdo.net.app["SmartCity"].calculateControlParameters(instanceId);
    gdo.net.app["SmartCity"].resizeMap(instanceId);
    gdo.net.app["SmartCity"].server.requestMap(instanceId);
}

gdo.net.app["SmartCity"].resizeMap = function(instanceId) {
    $("iframe").contents().find("#map").css("width", gdo.net.instance[instanceId].controlWidth);
    $("iframe").contents().find("#map").css("height", gdo.net.instance[instanceId].controlHeight);
}

gdo.net.app["SmartCity"].calculateClientParameters = function (instanceId) {
    gdo.net.app["SmartCity"].C = 156543.034;
    gdo.net.app["SmartCity"].R = 6378137;

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

gdo.net.app["SmartCity"].calculateControlParameters = function(instanceId) {
    gdo.net.instance[instanceId].sectionWidth = gdo.net.section[gdo.net.instance[gdo.net.app["SmartCity"].selectedInstance].sectionId].width;
    gdo.net.instance[instanceId].sectionHeight = gdo.net.section[gdo.net.instance[gdo.net.app["SmartCity"].selectedInstance].sectionId].height;
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
gdo.net.app["SmartCity"].terminateClient = function (instanceId) {
    gdo.consoleOut('.SmartCity', 1, 'Terminating Image SmartCity Client at Node ' + instanceId);
}

gdo.net.app["SmartCity"].terminateControl = function (instanceId) {
    gdo.consoleOut('.SmartCity', 1, 'Terminating SmartCity App Control at Instance ' + instanceId);
}

gdo.net.app["SmartCity"].changeEvent = function (instanceId) {
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        if (gdo.net.instance[instanceId].isInitialized) {
            //gdo.net.app["SmartCity"].updateCenter(instanceId);
            gdo.net.app["SmartCity"].uploadView(instanceId);
        }
    }
}

gdo.net.app["SmartCity"].updateCenter = function (instanceId) {
    gdo.consoleOut('.SmartCity', 4, gdo.net.instance[instanceId].map.getView().getCenter());
    gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
}
