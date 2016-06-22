var map;
var map3D;
var view;
var styles;
var layers;
var scene;
var terrainProvider;
var ds;

gdo.net.app["Maps"].index = [];
gdo.net.app["Maps"].index["layer"] = 0;
gdo.net.app["Maps"].index["source"] = 0;
gdo.net.app["Maps"].index["style"] = 0;
gdo.net.app["Maps"].index["format"] = 0;
gdo.net.app["Maps"].index["view"] = 0;

$(function () {
    gdo.consoleOut('.Maps', 1, 'Loaded Maps JS');
    $.connection.mapsAppHub.client.receiveTemplate = function (instanceId, serializedTemplate) {
        gdo.consoleOut('.Maps', 1, 'Received Template Table');
        gdo.net.instance[instanceId].template = JSON.parse(serializedTemplate);
        gdo.net.app["Maps"].extractTypes(instanceId);
    }

    $.connection.mapsAppHub.client.receiveMap = function (instanceId, serializedMap) {
        gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Received Map');
        gdo.net.app["Maps"].initLayers(instanceId, JSON.parse(serializedMap));
    }

    $.connection.mapsAppHub.client.receiveLayer = function (instanceId, layerId, serializedLayer, exists) {
        gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Received Layer :' + layerId + " (Exists:" + exists + ")");
        if (exists) {
            if (gdo.net.instance[instanceId].layers[layerId] == null || typeof gdo.net.instance[instanceId].layers[layerId] == "undefined") {
                gdo.net.app["Maps"].addObject(instanceId, "layer", layerId, JSON.parse(serializedLayer));
                gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Added Layer :' + layerId);
            } else {
                gdo.net.app["Maps"].updateObject(instanceId, "layer", layerId, JSON.parse(serializedLayer));
                gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Updated Layer :' + layerId);
            }
        } else {
            gdo.net.app["Maps"].removeObject(instanceId, "layer", layerId);
        }
    }

    $.connection.mapsAppHub.client.receiveSource = function (instanceId, sourceId, serializedSource, exists) {
        gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Received Source :' + sourceId + " (Exists:" + exists + ")");
        if (exists) {
            if (gdo.net.instance[instanceId].sources[sourceId] == null || typeof gdo.net.instance[instanceId].sources[sourceId] == "undefined") {
                gdo.net.app["Maps"].addObject(instanceId, "source", sourceId, JSON.parse(serializedSource));
                gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Added Source :' + sourceId);
            } else {
                gdo.net.app["Maps"].updateObject(instanceId, "source", sourceId, JSON.parse(serializedSource));
                gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Updated Source :' + sourceId);
            }
        } else {
            gdo.net.app["Maps"].removeObject(instanceId, "source", sourceId);
        }
    }

    $.connection.mapsAppHub.client.receiveStyle = function (instanceId, styleId, serializedStyle, exists) {
        gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Received Style :' + styleId + " (Exists:" + exists + ")");
        if (exists) {
            if (gdo.net.instance[instanceId].styles[styleId] == null || typeof gdo.net.instance[instanceId].styles[styleId] == "undefined") {
                gdo.net.app["Maps"].addObject(instanceId, "style", styleId, JSON.parse(serializedStyle));
                gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Added Style :' + styleId);
            } else {
                gdo.net.app["Maps"].updateObject(instanceId, "style", styleId, JSON.parse(serializedStyle));
                gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Updated Style :' + styleId);
            }
        } else {
            gdo.net.app["Maps"].removeObject(instanceId, "style", styleId);
        }
    }

    $.connection.mapsAppHub.client.receiveFormat = function (instanceId, formatId, serializedFormat, exists) {
        gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Received Format :' + formatId + " (Exists:" + exists + ")");
        if (exists) {
            if (gdo.net.instance[instanceId].formats[formatId] == null || typeof gdo.net.instance[instanceId].formats[formatId] == "undefined") {
                gdo.net.app["Maps"].addObject(instanceId, "format", formatId, JSON.parse(serializedFormat));
                gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Added Format :' + formatId);
            } else {
                gdo.net.app["Maps"].updateObject(instanceId, "format", formatId, JSON.parse(serializedFormat));
                gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Updated Format :' + formatId);
            }
        } else {
            gdo.net.app["Maps"].removeObject(instanceId, "format", formatId);
        }
    }

    $.connection.mapsAppHub.client.receiveData = function (instanceId, dataId, serializedData, exists) {
        gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Received Data Source :' + dataId + " (Exists:" + exists + ")");
        if (exists) {
            if (gdo.net.instance[instanceId].datas[dataId] == null || typeof gdo.net.instance[instanceId].datas[dataId] == "undefined") {
                gdo.net.app["Maps"].addObject(instanceId, "data", dataId, JSON.parse(serializedData));
                gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Added Data Source :' + dataId);
            } else {
                gdo.net.app["Maps"].updateObject(instanceId, "data", dataId, JSON.parse(serializedData));
                gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Updated Data Source :' + dataId);
            }
        } else {
            gdo.net.app["Maps"].removeObject(instanceId, "data", dataId);
        }
    }

    $.connection.mapsAppHub.client.receiveView = function (instanceId, viewId, serializedView, exists) {
        gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Received View :' + viewId + " (Exists:" + exists + ")");
        if (exists) {
            if (gdo.net.instance[instanceId].views[viewId] == null || typeof gdo.net.instance[instanceId].views[viewId] == "undefined") {
                gdo.net.app["Maps"].addObject(instanceId, "view", viewId, JSON.parse(serializedView));
                gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Added View :' + viewId);
            } else {
                gdo.net.app["Maps"].updateObject(instanceId, "view", viewId, JSON.parse(serializedView));
                gdo.consoleOut('.Maps', 1, 'Instance ' + instanceId + ': Updated View :' + viewId);
            }
        } else {
            gdo.net.app["Maps"].removeObject(instanceId, "view", viewId);
        }
    }

    $.connection.mapsAppHub.client.updateResolution = function (instanceId) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["Maps"].updateCenter(instanceId);
            gdo.net.instance[instanceId].map.render();
            gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
        }
    }

    $.connection.mapsAppHub.client.receivePosition = function (instanceId, topLeft, center, bottomRight, resolution, width, height) {
        gdo.net.app["Maps"].updatePosition(instanceId, topLeft, center, bottomRight, resolution, width, height);
    }

    $.connection.mapsAppHub.client.receiveConfigurations = function (instanceId, serializedConfigurations) {
        gdo.net.instance[instanceId].configurations = [];
        var deserializedConfigurations = JSON.parse(serializedConfigurations);
        for (var key in deserializedConfigurations.$values) {
            if (deserializedConfigurations.$values.hasOwnProperty(key)) {
                gdo.net.app["Maps"].addObject(instanceId, "configuration", deserializedConfigurations.$values[key].Id.Value, deserializedConfigurations.$values[key]);
            }
        }
    }

    $.connection.mapsAppHub.client.updateCaveConfigurations = function (instanceId) {
        gdo.net.server.broadcastAppConfigurations(instanceId);
    }
});

gdo.net.app["Maps"].initMap = function (instanceId) {

    //Initialize View
    view = new ol.View({
        center: [0, 0],
        resolution: 77,
        constrainRotation: 0,
        enableRotation: false,
    });

    gdo.net.instance[instanceId].controls = new Array();
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        gdo.net.instance[instanceId].controls = [];
        gdo.net.instance[instanceId].controls[0] = new ol.control.OverviewMap({ collapsed: false, collapsible: false });
        gdo.net.instance[instanceId].controls[1] = new ol.control.Zoom();
        gdo.net.instance[instanceId].controls[2] = new ol.control.MousePosition({
            coordinateFormat: ol.coordinate.createStringXY(7),
            projection: 'EPSG:4326',
            //className: 'custom-mouse-position',
            //target: document.getElementById('control_frame_content').contentWindow.document.getElementById('mouse-position'),
            undefinedHTML: '&nbsp;'
        });
        //gdo.net.instance[instanceId].controls[2] = new ol.control.Rotate();
    }
    //Initialize Map
    map = new ol.Map({
        controls: gdo.net.instance[instanceId].controls,
        layers: [],
        target: 'map',
        view: view,
        interactions: ol.interaction.defaults({
            pinchRotate: false,
            zoomDuration: 0
        }).extend([
       new ol.interaction.MouseWheelZoom({ duration: 0 }),
       new ol.interaction.PinchZoom({ duration: 0 }),
       new ol.interaction.DragZoom({ duration: 0 })
        ])
    });
    /*gdo.net.instance[instanceId].positionFeature = new ol.Feature();
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        gdo.net.instance[instanceId].positionFeature.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 14,
                fill: new ol.style.Fill({
                    color: '#3399CC'
                }),
                stroke: new ol.style.Stroke({
                    color: '#222',
                    width: 4.7
                })
            })
        }));
    } else {
        gdo.net.instance[instanceId].positionFeature.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 49,
                fill: new ol.style.Fill({
                    color: '#3399CC'
                }),
                stroke: new ol.style.Stroke({
                    color: '#222',
                    width: 21.7
                })
            })
        }));
    }


    var featuresOverlay = new ol.layer.Vector({
        map: map,
        source: new ol.source.Vector({
            features: [gdo.net.instance[instanceId].positionFeature]
        })
    });*/

    gdo.net.instance[instanceId].map = map;
    //gdo.net.app["Maps"].server.requestMarkerPosition(instanceId);
    gdo.net.app["Maps"].server.requestPosition(instanceId);
}

gdo.net.app["Maps"].initLayers = function (instanceId, deserializedMap) {
    //Process deserialized Map
    gdo.net.app["Maps"].initializeArrays(instanceId);

    var i;
    for (i = 0; i < deserializedMap.Views.$values.length; i++) {
        gdo.net.app["Maps"].addObject(instanceId, "view", deserializedMap.Views.$values[i].Id.Value, deserializedMap.Views.$values[i]);
    }
    for (i = 0; i < deserializedMap.Animations.$values.length; i++) {
        gdo.net.app["Maps"].addObject(instanceId, "animation", deserializedMap.Animations.$values[i].Id.Value, deserializedMap.Animations.$values[i]);
    }
    for (i = 0; i < deserializedMap.Datas.$values.length; i++) {
        gdo.net.app["Maps"].addObject(instanceId, "data", deserializedMap.Datas.$values[i].Id.Value, deserializedMap.Datas.$values[i]);
    }
    for (i = 0; i < deserializedMap.Formats.$values.length; i++) {
        gdo.net.app["Maps"].addObject(instanceId, "format", deserializedMap.Formats.$values[i].Id.Value, deserializedMap.Formats.$values[i]);
    }
    for (i = 0; i < deserializedMap.Styles.$values.length; i++) {
        gdo.net.app["Maps"].addObject(instanceId, "style", deserializedMap.Styles.$values[i].Id.Value, deserializedMap.Styles.$values[i]);
    }
    for (i = 0; i < deserializedMap.Sources.$values.length; i++) {
        gdo.net.app["Maps"].addObject(instanceId, "source", deserializedMap.Sources.$values[i].Id.Value, deserializedMap.Sources.$values[i]);
    }
    for (i = 0; i < deserializedMap.Layers.$values.length; i++) {
        gdo.net.app["Maps"].addObject(instanceId, "layer", deserializedMap.Layers.$values[i].Id.Value, deserializedMap.Layers.$values[i]);
    }

    gdo.net.instance[instanceId].position = deserializedMap.Position;
    //gdo.net.app["Maps"].setView(instanceId, deserializedMap.Views.$values[deserializedMap.CurrentView]);
    //gdo.net.instance[instanceId].map.setView(gdo.net.instance[instanceId].views[gdo.net.instance[instanceId].currentView]);

    //Register Change Handlers
    gdo.net.instance[instanceId].map.getView().on('change:resolution', function () {
        gdo.net.app["Maps"].server.updateResolution(instanceId);
        setTimeout(function () { gdo.net.app["Maps"].updateCenter(instanceId); }, 70);
        setTimeout(function () { gdo.net.app["Maps"].changeEvent(instanceId); }, 210);
    });
    gdo.net.instance[instanceId].map.getView().on('change:zoom', function () {
        gdo.net.app["Maps"].changeEvent(instanceId);
        setTimeout(function () { gdo.net.app["Maps"].updateCenter(instanceId); }, 70);
        gdo.net.app["Maps"].server.updateResolution(instanceId);
    });
    gdo.net.instance[instanceId].map.getView().on('change:center', function () {
        gdo.net.app["Maps"].changeEvent(instanceId);
    });
    gdo.net.instance[instanceId].map.getView().on('change:rotation', function () {
        gdo.net.instance[instanceId].map.getView().setRotation(0);
        //gdo.net.app["Maps"].changeEvent(instanceId);
    });
    gdo.net.instance[instanceId].map.on('change:size', function () {
        gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
        gdo.net.app["Maps"].changeEvent(instanceId);
    });
    gdo.net.instance[instanceId].map.on('change:view', function () {
        gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
        gdo.net.app["Maps"].changeEvent(instanceId);
    });
    gdo.net.instance[instanceId].map.on('change:target', function () {
        gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
        gdo.net.app["Maps"].changeEvent(instanceId);
    });

    // Initialized
    gdo.net.instance[instanceId].isInitialized = true;
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        gdo.net.app["Maps"].drawMapTable(instanceId);
        gdo.net.app["Maps"].server.requestTemplate(instanceId);
        gdo.net.app["Maps"].drawListTables(instanceId);
    }
}

gdo.net.app["Maps"].set3DMode = function (instanceId, mode) {
    //gdo.net.instance[instanceId].map3D.setEnabled(mode);
    gdo.net.instance[instanceId].mode = mode;
}

gdo.net.app["Maps"].initClient = function (clientId) {
    var instanceId = gdo.net.node[gdo.clientId].appInstanceId;
    gdo.consoleOut('.Maps', 1, 'Initializing Maps App Instance ' + instanceId + ' Client at Node ' + clientId);

    gdo.net.instance[instanceId].currentView = 0;

    //Initialize Arrays
    gdo.net.app["Maps"].initializeArrays(instanceId);

    //Load Modules
    gdo.loadScript('utilities', 'maps', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('3d', 'maps', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('position', 'maps', gdo.SCRIPT_TYPE.APP);

    //Calculate Necessary Parameters
    gdo.net.instance[instanceId].isInitialized = false;
    gdo.net.app["Maps"].calculateClientParameters(instanceId);

    gdo.net.app["Maps"].initMap(instanceId);

    //Request
    gdo.net.app["Maps"].server.requestMap(instanceId);
}

gdo.net.app["Maps"].initControl = function (instanceId) {
    gdo.consoleOut('.Maps', 1, 'Initializing Maps Control at Instance ' + instanceId);

    //Initialize Arrays
    gdo.net.app["Maps"].initializeArrays(instanceId);

    //Load Modules
    gdo.loadScript('utilities', 'maps', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('3d', 'maps', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('position', 'maps', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('ui.map', 'maps', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('ui', 'maps', gdo.SCRIPT_TYPE.APP);

    //Calculate Necessary Parameters
    gdo.net.instance[instanceId].isInitialized = false;
    gdo.net.app["Maps"].calculateControlParameters(instanceId);

    gdo.net.app["Maps"].initMap(instanceId);

    //Resize Map
    gdo.net.app["Maps"].resizeMap(instanceId);

    //Request Map
    gdo.net.app["Maps"].server.requestMap(instanceId);

    //Draw UI Elements
    gdo.net.app["Maps"].drawSearchInput(instanceId);
    gdo.net.app["Maps"].registerButtons(instanceId);

    //

}

gdo.net.app["Maps"].initializeArrays = function (instanceId) {
    gdo.net.instance[instanceId].configurations = [];
    gdo.net.instance[instanceId].animations = [];
    gdo.net.instance[instanceId].datas = [];
    gdo.net.instance[instanceId].formats = [];
    gdo.net.instance[instanceId].styles = [];
    gdo.net.instance[instanceId].sources = [];
    gdo.net.instance[instanceId].layers = [];
    gdo.net.instance[instanceId].views = [];
}

gdo.net.app["Maps"].resizeMap = function (instanceId) {
    $("iframe").contents().find("#map").css("width", gdo.net.instance[instanceId].controlWidth);
    $("iframe").contents().find("#map").css("height", gdo.net.instance[instanceId].controlHeight);
    gdo.net.instance[instanceId].map.updateSize();
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

gdo.net.app["Maps"].calculateControlParameters = function (instanceId) {
    gdo.net.instance[instanceId].sectionWidth = gdo.net.section[gdo.net.instance[instanceId].sectionId].width;
    gdo.net.instance[instanceId].sectionHeight = gdo.net.section[gdo.net.instance[instanceId].sectionId].height;
    gdo.net.instance[instanceId].sectionRatio = gdo.net.instance[instanceId].sectionWidth / gdo.net.instance[instanceId].sectionHeight;
    gdo.net.instance[instanceId].controlMaxWidth = 1050;
    gdo.net.instance[instanceId].controlMaxHeight = 600;
    gdo.net.instance[instanceId].controlRatio = gdo.net.instance[instanceId].controlMaxWidth / gdo.net.instance[instanceId].controlMaxHeight;
    gdo.net.instance[instanceId].controlWidth = 70;
    gdo.net.instance[instanceId].controlHeight = 35;
    if (gdo.net.instance[instanceId].sectionRatio >= gdo.net.instance[instanceId].controlRatio) {
        gdo.net.instance[instanceId].controlWidth = gdo.net.instance[instanceId].controlMaxWidth;
        gdo.net.instance[instanceId].controlHeight = (gdo.net.instance[instanceId].sectionHeight * gdo.net.instance[instanceId].controlWidth) / gdo.net.instance[instanceId].sectionWidth;
    } else {
        gdo.net.instance[instanceId].controlHeight = gdo.net.instance[instanceId].controlMaxHeight;
        gdo.net.instance[instanceId].controlWidth = (gdo.net.instance[instanceId].sectionWidth * gdo.net.instance[instanceId].controlHeight) / gdo.net.instance[instanceId].sectionHeight;
    }
}
gdo.net.app["Maps"].terminateClient = function (instanceId) {
    gdo.consoleOut('.Maps', 1, 'Terminating Image Maps Client at Node ' + instanceId);
}

gdo.net.app["Maps"].terminateControl = function (instanceId) {
    gdo.consoleOut('.Maps', 1, 'Terminating Maps App Control at Instance ' + instanceId);
}

gdo.net.app["Maps"].changeEvent = function (instanceId) {
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        if (gdo.net.instance[instanceId].isInitialized) {
            gdo.net.app["Maps"].uploadPosition(instanceId);
        }
    }
}

gdo.net.app["Maps"].updateCenter = function (instanceId) {
    gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
}

gdo.net.app["Maps"].searchGeoCode = function (instanceId, address) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': address }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            $("iframe").contents().find("#map_input_div").removeClass("has-error").addClass("has-success");
            var centerCoordinate = ol.proj.transform([results[0].geometry.location.lng(), results[0].geometry.location.lat()], 'EPSG:4326', 'EPSG:3857');
            var southWestCoordinate = ol.proj.transform([results[0].geometry.viewport.getSouthWest().lng(), results[0].geometry.viewport.getSouthWest().lat()], 'EPSG:4326', 'EPSG:3857');
            var northEastCoordinate = ol.proj.transform([results[0].geometry.viewport.getNorthEast().lng(), results[0].geometry.viewport.getNorthEast().lat()], 'EPSG:4326', 'EPSG:3857');
            var southWestFeature = new ol.Feature();
            southWestFeature.setGeometry(southWestCoordinate ? new ol.geom.Point(southWestCoordinate) : null);
            var northEastFeature = new ol.Feature();
            northEastFeature.setGeometry(northEastCoordinate ? new ol.geom.Point(northEastCoordinate) : null);
            var boundingBox = new ol.source.Vector({
                features: [southWestFeature, northEastFeature]
            });
            var extent = boundingBox.getExtent();
            map.getView().fit(extent, map.getSize());
            map.getView().setCenter(centerCoordinate);
            setTimeout(function () {
                gdo.consoleOut(".Maps", 4, centerCoordinate);
                gdo.net.app["Maps"].uploadPosition(instanceId);
                //gdo.net.app["Maps"].displayPositionMarker(instanceId, centerCoordinate);
                //gdo.net.app["Maps"].server.uploadMarkerPosition(instanceId, centerCoordinate);
            }, 70);

        } else {
            gdo.consoleOut(".Maps", 4, 'Geocode was not successful for the following reason: ' + status);
            $("iframe").contents().find("#map_input_div").removeClass("has-success").addClass("has-error");
        }
    });
}

gdo.net.app["Maps"].displayPositionMarker = function (instanceId, coordinates) {
    //gdo.net.instance[instanceId].positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
}

gdo.net.app["Maps"].clearPositionMarker = function (instanceId) {
    //gdo.net.app["Maps"].server.uploadMarkerPosition(instanceId, null);
    //gdo.net.app["Maps"].displayPositionMarker(instanceId, null);
}

gdo.net.app["Maps"].clearInput = function () {
    $('iframe').contents().find('#map_input_div').removeClass('has-error').removeClass('has-success');
    $("iframe").contents().find("#map_input").val('');
}