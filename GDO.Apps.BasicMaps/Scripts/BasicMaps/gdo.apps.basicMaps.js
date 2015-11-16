var map;
var map3D;
var view;
var layers;
var scene;
var terrainProvider;





$(function () {
    gdo.consoleOut('.BasicMaps', 1, 'Loaded BasicMaps JS');
    gdo.net.app["BasicMaps"].numLayers = 13;
    $.connection.basicMapsAppHub.client.updateResolution = function (instanceId) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["BasicMaps"].updateCenter(instanceId);
            //gdo.net.instance[instanceId].map.render();
            //gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
        }
    }

    $.connection.basicMapsAppHub.client.setLayerVisible = function (instanceId, id) {
        gdo.consoleOut('.BasicMaps', 1, 'Setting Layer ' + id + ' Visible');
        if (gdo.net.instance[instanceId].layers[id].wms) {
            if (gdo.net.instance[instanceId].layers[id].getVisible()) {
                if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
                    $("iframe").contents().find("#basicMaps_layer_" + id).addClass("btn-danger").removeClass("btn-success");
                }
                gdo.net.instance[instanceId].layers[id].setVisible(false);
            } else {
                if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
                    $("iframe").contents().find("#basicMaps_layer_" + id).removeClass("btn-danger").addClass("btn-success");
                }
                gdo.net.instance[instanceId].layers[id].setVisible(true);
            }
        } else {       
            for (var i = 0; i < gdo.net.app["BasicMaps"].numLayers; i++) {
                gdo.net.instance[instanceId].layers[i].setVisible(false);
                if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
                    $("iframe").contents().find("#basicMaps_layer_" + i).addClass("btn-outline");
                }
            }
            gdo.net.instance[instanceId].layers[id].setVisible(true);
            if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
                $("iframe").contents().find("#basicMaps_layer_" + id).removeClass("btn-outline");
            }
        }
    }

    $.connection.basicMapsAppHub.client.receiveMapPosition = function (instanceId, topLeft, center, bottomRight, resolution, width, height, zoom) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && gdo.net.node[gdo.clientId].appInstanceId == instanceId) {
            var mapCenter = [0, 0];
            var mapResolution = parseFloat(resolution);
            zoom = parseInt(zoom);
            mapCenter = gdo.net.app["BasicMaps"].calculateLocalCenter(topLeft, bottomRight);
            var nodePixels = gdo.net.node[gdo.clientId].width * gdo.net.node[gdo.clientId].height;
            var controlPixels = width * height;
            var numOfNodes = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].cols * gdo.net.section[gdo.net.node[gdo.clientId].sectionId].rows;
            mapResolution = mapResolution / Math.sqrt((nodePixels * numOfNodes) / controlPixels);
            if (!gdo.net.instance[instanceId].isInitialized) {
                gdo.net.app["BasicMaps"].initMap(instanceId, mapCenter, mapResolution, zoom);
                gdo.net.instance[instanceId].map.getView().setZoom(zoom);
                gdo.net.instance[instanceId].isInitialized = true;
            }
            gdo.net.app["BasicMaps"].update(instanceId, mapCenter, mapResolution, zoom);
        }
    }

    $.connection.basicMapsAppHub.client.receiveMarkerPosition = function (instanceId, pos) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && gdo.net.node[gdo.clientId].appInstanceId == instanceId) {
            gdo.net.app["BasicMaps"].displayPositionMarker(instanceId, pos);
        }
    }

    $.connection.basicMapsAppHub.client.receiveInitialMapPosition = function (instanceId, center, resolution, zoom) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.instance[instanceId].isInitialized = true;
            zoom = parseInt(zoom);
            gdo.net.app["BasicMaps"].initMap(instanceId, center, resolution, zoom);
            gdo.net.instance[instanceId].map.getView().setZoom(zoom);
            gdo.net.instance[instanceId].map.updateSize();
            gdo.net.instance[instanceId].map.getView().on('change:resolution', function () {
                gdo.net.app["BasicMaps"].changeEvent(instanceId);
                setTimeout(function () { gdo.net.app["BasicMaps"].updateCenter(instanceId); }, 70);
                gdo.net.app["BasicMaps"].server.updateResolution(instanceId);
            });
            gdo.net.instance[instanceId].map.getView().on('change:zoom', function() {
                gdo.net.app["BasicMaps"].changeEvent(instanceId);
                setTimeout(function() {gdo.net.app["BasicMaps"].updateCenter(instanceId);}, 70);
                gdo.net.app["BasicMaps"].server.updateResolution(instanceId);
            });
            gdo.net.instance[instanceId].map.getView().on('change:center', function () {
                gdo.net.app["BasicMaps"].changeEvent(instanceId);
            });
            gdo.net.instance[instanceId].map.getView().on('change:rotation', function () {
                gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
                gdo.net.app["BasicMaps"].changeEvent(instanceId);
            });
            gdo.net.instance[instanceId].map.on('change:size', function () {
                gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
                gdo.net.app["BasicMaps"].changeEvent(instanceId);
            });
            gdo.net.instance[instanceId].map.on('change:view', function () {
                gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
                gdo.net.app["BasicMaps"].changeEvent(instanceId);
            });
            gdo.net.instance[instanceId].map.on('change:target', function () {
                gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
                gdo.net.app["BasicMaps"].changeEvent(instanceId);
            });
            gdo.net.instance[instanceId].map.getView().setResolution(gdo.net.instance[instanceId].map.getView().getResolution());
            gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
            gdo.net.instance[instanceId].map.getView().setZoom(gdo.net.instance[instanceId].map.getView().getZoom());
            gdo.net.app["BasicMaps"].uploadMapPosition(instanceId);
            gdo.net.app["BasicMaps"].server.updateResolution(instanceId);
            gdo.net.app["BasicMaps"].changeEvent(instanceId);
            gdo.net.app["BasicMaps"].drawMapTable(instanceId);
            gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
            setTimeout(function() { gdo.net.app["BasicMaps"].server.updateResolution(instanceId); },700);
        }
    }
});

gdo.net.app["BasicMaps"].searchGeoCode = function (instanceId, address) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'address': address}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
            $("iframe").contents().find("#map_input_div").removeClass("has-error").addClass("has-success");
            gdo.consoleOut(".BasicMaps", 4, results[0].geometry.location);
            var centerCoordinate = ol.proj.transform([results[0].geometry.location.K, results[0].geometry.location.G], 'EPSG:4326', 'EPSG:3857');
            var southWestCoordinate = ol.proj.transform([results[0].geometry.viewport.getSouthWest().K, results[0].geometry.viewport.getSouthWest().G], 'EPSG:4326', 'EPSG:3857');
            var northEastCoordinate = ol.proj.transform([results[0].geometry.viewport.getNorthEast().K, results[0].geometry.viewport.getNorthEast().G], 'EPSG:4326', 'EPSG:3857');
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
            setTimeout(function() {
                gdo.net.app["BasicMaps"].uploadMapPosition(instanceId);
                gdo.net.app["BasicMaps"].displayPositionMarker(instanceId, centerCoordinate);
                gdo.net.app["BasicMaps"].server.uploadMarkerPosition(instanceId, centerCoordinate);
            }, 70);
            
        } else {
            gdo.consoleOut(".BasicMaps",4,'Geocode was not successful for the following reason: ' + status);
            $("iframe").contents().find("#map_input_div").removeClass("has-success").addClass("has-error");
        }
    });
}

gdo.net.app["BasicMaps"].displayPositionMarker = function (instanceId, coordinates) {
    gdo.net.instance[instanceId].positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
}

gdo.net.app["BasicMaps"].clearPositionMarker = function (instanceId) {
    gdo.net.app["BasicMaps"].server.uploadMarkerPosition(instanceId, null);
    gdo.net.app["BasicMaps"].displayPositionMarker(instanceId, null);
}

gdo.net.app["BasicMaps"].clearInput = function () {
    $('iframe').contents().find('#map_input_div').removeClass('has-error').removeClass('has-success');
    $("iframe").contents().find("#map_input").val('');
}

gdo.net.app["BasicMaps"].initMap = function (instanceId, center, resolution, zoom) {
    gdo.net.instance[instanceId].view = new ol.View({
        center: [parseFloat(center[0]), parseFloat(center[1])],
        resolution: parseFloat(resolution),
        zoom: parseInt(zoom)
    });
    gdo.net.instance[instanceId].layers = [];
    gdo.net.instance[instanceId].layers[0] = new ol.layer.Tile({
        preload: Infinity,
        visible: false,
        source: new ol.source.BingMaps({
            key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
            imagerySet: 'Aerial',
            maxZoom: 19
        })
    });
    gdo.net.instance[instanceId].layers[0].wms = false;

    gdo.net.instance[instanceId].layers[1] = new ol.layer.Tile({
        preload: Infinity,
        visible: false,
        source: new ol.source.BingMaps({
            key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
            imagerySet: 'AerialWithLabels',
            maxZoom: 19
        })
    });
    gdo.net.instance[instanceId].layers[1].wms = false;

    gdo.net.instance[instanceId].layers[2] = new ol.layer.Tile({
        preload: Infinity,
        visible: false,
        source: new ol.source.BingMaps({
            key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
            imagerySet: 'Road',
            maxZoom: 19
        })
    });
    gdo.net.instance[instanceId].layers[2].wms = false;

    gdo.net.instance[instanceId].layers[3] = new ol.layer.Tile({
        preload: Infinity,
        visible: false,
        source: new ol.source.BingMaps({
            key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
            imagerySet: 'collinsBart',
            maxZoom: 19
        })
    });
    gdo.net.instance[instanceId].layers[3].wms = false;

    gdo.net.instance[instanceId].layers[4] = new ol.layer.Tile({
        preload: Infinity,
        visible: false,
        source: new ol.source.BingMaps({
            key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
            imagerySet: 'ordnanceSurvey',
            maxZoom: 19
        })
    });
    gdo.net.instance[instanceId].layers[4].wms = false;

    gdo.net.instance[instanceId].layers[5] = new ol.layer.Tile({
        visible: false,
        source: new ol.source.MapQuest({ layer: 'osm' })
    });
    gdo.net.instance[instanceId].layers[5].wms = false;

    gdo.net.instance[instanceId].layers[6] = new ol.layer.Tile({
        visible: false,
        source: new ol.source.MapQuest({ layer: 'sat' })
    });
    gdo.net.instance[instanceId].layers[6].wms = false;

    gdo.net.instance[instanceId].layers[7] = new ol.layer.Tile({
        visible: false,
        source: new ol.source.Stamen({
            layer: 'toner'
        })
    });
    gdo.net.instance[instanceId].layers[7].wms = false;

    gdo.net.instance[instanceId].layers[8] = new ol.layer.Tile({
        visible: false,
        source: new ol.source.Stamen({
            layer: 'terrain'
        })
    });
    gdo.net.instance[instanceId].layers[8].wms = false;

    gdo.net.instance[instanceId].layers[9] = new ol.layer.Tile({
        visible: false,
        source: new ol.source.Stamen({
            layer: 'watercolor'
        })
    });
    gdo.net.instance[instanceId].layers[9].wms = false;

    gdo.net.instance[instanceId].layers[10] = new ol.layer.Tile({
        visible: false,
        source: new ol.source.OSM()
    });
    gdo.net.instance[instanceId].layers[10].wms = false;

    gdo.net.instance[instanceId].layers[11] = new ol.layer.Tile({
        visible: false,
        source: new ol.source.OSM({
            url: 'http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
        })
    });
    gdo.net.instance[instanceId].layers[11].wms = false;

    gdo.net.instance[instanceId].layers[12] = new ol.layer.Tile({
        visible: false,
        source: new ol.source.OSM({
            crossOrigin: null,
            url: 'http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png'
        })
    });
    gdo.net.instance[instanceId].layers[12].wms = false;

    gdo.net.instance[instanceId].layers[13] = new ol.layer.Tile({
        visible: false,
        source: new ol.source.TileWMS({
            url: 'http://ogc.bgs.ac.uk/cgi-bin/BGS_Bedrock_and_Superficial_Geology/ows?language=eng&SERVICE=WMS&REQUEST=GetCapabilities',
            params: { 'LAYERS': "BGS_EN_Bedrock_and_Superficial_Geology" },
            serverType: 'geoserver',
            crossOrigin: null
        })
    });
    gdo.net.instance[instanceId].layers[13].wms = true;

    gdo.net.instance[instanceId].layers[14] = new ol.layer.Tile({
        visible: false,
        source: new ol.source.TileWMS({
            url: 'http://ogc.bgs.ac.uk/cgi-bin/BGS_Bedrock_and_Superficial_Geology/ows?language=eng&SERVICE=WMS&REQUEST=GetCapabilities',
            params: { 'LAYERS': "GBR_BGS_625k_BA" },
            serverType: 'geoserver',
            crossOrigin: null
        })
    });
    gdo.net.instance[instanceId].layers[14].wms = true;

    gdo.net.instance[instanceId].layers[15] = new ol.layer.Tile({
        visible: false,
        source: new ol.source.TileWMS({
            url: 'http://ogc.bgs.ac.uk/cgi-bin/BGS_Bedrock_and_Superficial_Geology/ows?language=eng&SERVICE=WMS&REQUEST=GetCapabilities',
            params: { 'LAYERS': "GBR_BGS_625k_SLT" },
            serverType: 'geoserver',
            crossOrigin: null
        })
    });
    gdo.net.instance[instanceId].layers[15].wms = true;

    gdo.net.instance[instanceId].layers[16] = new ol.layer.Tile({
        visible: false,
        source: new ol.source.TileWMS({
            url: 'http://ogc.bgs.ac.uk/cgi-bin/BGS_Bedrock_and_Superficial_Geology/ows?language=eng&SERVICE=WMS&REQUEST=GetCapabilities',
            params: { 'LAYERS': "GBR_BGS_625k_SLS" },
            serverType: 'geoserver',
            crossOrigin: null
        })
    });
    gdo.net.instance[instanceId].layers[16].wms = true;

    gdo.net.instance[instanceId].layers[17] = new ol.layer.Tile({
        visible: false,
        source: new ol.source.TileWMS({
            url: 'http://ogc.bgs.ac.uk/cgi-bin/BGS_Bedrock_and_Superficial_Geology/ows?language=eng&SERVICE=WMS&REQUEST=GetCapabilities',
            params: { 'LAYERS': "UKCoShelf_BGS_1M_SBS" },
            serverType: 'geoserver',
            crossOrigin: null
        })
    });
    gdo.net.instance[instanceId].layers[17].wms = true;

    gdo.net.instance[instanceId].controls = new Array();
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        gdo.net.instance[instanceId].controls = [];
        gdo.net.instance[instanceId].controls[0] = new ol.control.OverviewMap({collapsed:false,collapsible:false});
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
    map = new ol.Map({
        controls: gdo.net.instance[instanceId].controls,
        layers: gdo.net.instance[instanceId].layers,
        target: 'map',
        view: gdo.net.instance[instanceId].view
    });

    gdo.net.instance[instanceId].positionFeature = new ol.Feature();
    gdo.net.instance[instanceId].positionFeature.setStyle(new ol.style.Style({
        image: new ol.style.Circle({
            radius: 14,
            fill: new ol.style.Fill({
                color: '#3399CC'
            }),
            stroke: new ol.style.Stroke({
                color: '#222',
                width: 4.9
            })
        })
    }));

    var featuresOverlay = new ol.layer.Vector({
        map: map,
        source: new ol.source.Vector({
            features: [gdo.net.instance[instanceId].positionFeature]
        })
    });

    gdo.net.instance[instanceId].map = map;
    gdo.net.app["BasicMaps"].server.requestLayersVisible(instanceId);
    gdo.net.app["BasicMaps"].server.requestMarkerPosition(instanceId);
}

gdo.net.app["BasicMaps"].calculateLocalCenter = function (topLeft, bottomRight) {
    var diffTotal = [parseFloat(bottomRight[0]) - parseFloat(topLeft[0]), parseFloat(bottomRight[1]) - parseFloat(topLeft[1])];
    var diffUnit = [diffTotal[0] / gdo.net.section[gdo.net.node[gdo.clientId].sectionId].cols, diffTotal[1] / gdo.net.section[gdo.net.node[gdo.clientId].sectionId].rows];
    var center = [parseFloat(topLeft[0]) + (diffUnit[0] * (0.5 + gdo.net.node[gdo.clientId].sectionCol)), parseFloat(topLeft[1]) + (diffUnit[1] * (0.5 + gdo.net.node[gdo.clientId].sectionRow))];
    return center;
}

gdo.net.app["BasicMaps"].initClient = function (clientId) {
    var instanceId = gdo.net.node[gdo.clientId].appInstanceId;
    gdo.consoleOut('.BasicMaps', 1, 'Initializing BasicMaps App Instance ' + instanceId + ' Client at Node ' + clientId);
    gdo.loadModule('ui', 'basicMaps', gdo.MODULE_TYPE.APP);
    gdo.loadModule('3d', 'basicMaps', gdo.MODULE_TYPE.APP);
    gdo.net.instance[instanceId].isInitialized = false;
    gdo.net.app["BasicMaps"].C = 156543.034;
    gdo.net.app["BasicMaps"].R = 6378137;

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

    gdo.net.app["BasicMaps"].server.requestMapPosition(instanceId, false);

}

gdo.net.app["BasicMaps"].initControl = function (instanceId) {
    gdo.loadModule('ui', 'basicMaps', gdo.MODULE_TYPE.APP);
    gdo.loadModule('3d', 'basicMaps', gdo.MODULE_TYPE.APP);
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

    gdo.net.app["BasicMaps"].server.requestMapPosition(instanceId, true);
    gdo.consoleOut('.BasicMaps', 1, 'Initializing BasicMaps Control at Instance ' + instanceId);
}

gdo.net.app["BasicMaps"].terminateClient = function (instanceId) {
    gdo.consoleOut('.BasicMaps', 1, 'Terminating BasicMaps Client at Node ' + instanceId);
}

gdo.net.app["BasicMaps"].terminateControl = function (instanceId) {
    gdo.consoleOut('.BasicMaps', 1, 'Terminating BasicMaps App Control at Instance ' + instanceId);
}

gdo.net.app["BasicMaps"].uploadMapPosition = function (instanceId) {
    var center = gdo.net.instance[instanceId].map.getView().getCenter();
    var topLeft = gdo.net.instance[instanceId].map.getCoordinateFromPixel([0, 0]);
    var bottomRight = gdo.net.instance[instanceId].map.getCoordinateFromPixel(gdo.net.instance[instanceId].map.getSize());
    var size = gdo.net.instance[instanceId].map.getSize();
    var width = size[0];
    var height = size[1];
    gdo.net.app["BasicMaps"].server.uploadMapPosition(instanceId, topLeft, center, bottomRight, gdo.net.instance[instanceId].map.getView().getResolution(), width, height, gdo.net.instance[instanceId].map.getView().getZoom());
}

gdo.net.app["BasicMaps"].changeEvent = function (instanceId) {
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        if (gdo.net.instance[instanceId].isInitialized) {
            gdo.net.app["BasicMaps"].uploadMapPosition(instanceId);
        }
    }
}

gdo.net.app["BasicMaps"].updateCenter = function (instanceId) {
    //gdo.consoleOut('.BasicMaps', 4, gdo.net.instance[instanceId].map.getView().getCenter());
    gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
}
gdo.net.app["BasicMaps"].update = function (instanceId, mapCenter, mapResolution, zoom) {
    //gdo.consoleOut('.BasicMaps', 4, gdo.net.instance[instanceId].map.getView().getCenter() + " Zoom " + zoom);
    gdo.net.instance[instanceId].map.getView().setCenter(mapCenter);
    gdo.net.instance[instanceId].map.getView().setResolution(mapResolution);
    //gdo.net.instance[instanceId].map.getView().setZoom(zoom);
}


