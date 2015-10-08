var map;
var map3D;
var view;
var layers;
var scene;
var terrainProvider;


$(function () {
    gdo.consoleOut('.SHANGHAIMETRO', 1, 'Loaded ShanghaiMetro JS');
    $.connection.shanghaiMetroAppHub.client.updateResolution = function (instanceId) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["ShanghaiMetro"].updateCenter(instanceId);
            gdo.net.instance[instanceId].map.render();
            //gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
        }
    }

    $.connection.shanghaiMetroAppHub.client.receiveTimeStep = function (instanceId, timestep) {
        gdo.consoleOut('.SHANGHAIMETRO', 1, 'Received Time Step: ' + timestep);
        gdo.net.instance[instanceId].timeStep = timestep;
        gdo.net.instance[instanceId].entrySource.forEachFeature(function (feature) {
            feature.set("weight", Math.log(parseFloat(feature.get("entries")[timestep]))/7);
        });
        if (gdo.clientMode != gdo.CLIENT_MODE.CONTROL && gdo.net.node[gdo.clientId].sectionCol == 0 && gdo.net.node[gdo.clientId].sectionRow == 0) {
            var temp = timestep * 2;
            var hour = parseInt(temp / 60);
            var minutes = parseInt(temp - hour * 60);
            hour = hour + 6;
            if (hour < 10) {
                hour = "0" + hour;
            }
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            $("iframe").contents().find("#timelabel")
                .empty()
                .css("visibility", "visible")
                .append(
                "&nbsp;" + hour + ":" + minutes);
        }

    }

    $.connection.shanghaiMetroAppHub.client.receiveProperties = function (instanceId, blur, radius, opacity, line, station) {
        gdo.consoleOut('.SHANGHAIMETRO', 1, 'Received Blur: ' + blur + ' and Radius: ' + radius + ' Opacity: ' + opacity + ' Line: ' + line + ' Statlion: ' + station);
        gdo.net.instance[instanceId].entryHeatmapLayer.setOpacity(opacity);
        gdo.net.instance[instanceId].entryHeatmapLayer.setBlur(blur);
        gdo.net.instance[instanceId].entryHeatmapLayer.setRadius(radius);
        gdo.net.instance[instanceId].lineWidth = line;
        gdo.net.instance[instanceId].stationWidth = station;
        gdo.net.instance[instanceId].stationsLayer.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: gdo.net.instance[instanceId].stationWidth * 3,
                fill: new ol.style.Fill({
                    color: 'white',
                    width: gdo.net.instance[instanceId].stationWidth
                }),
                stroke: new ol.style.Stroke({
                    color: 'black',
                    width: gdo.net.instance[instanceId].stationWidth
                })
            })
        }));
        gdo.net.app["ShanghaiMetro"].updateCenter(instanceId);
        gdo.net.instance[instanceId].map.render();
    }

    $.connection.shanghaiMetroAppHub.client.setBingLayerVisible = function (instanceId, visible) {
        gdo.consoleOut('.SHANGHAIMETRO', 1, 'Seting Bing Maps Layer Visibility: ' + visible);
        gdo.net.instance[instanceId].bingLayer.setVisible(visible);
    }

    $.connection.shanghaiMetroAppHub.client.setStamenLayerVisible = function (instanceId, visible) {
        gdo.consoleOut('.SHANGHAIMETRO', 1, 'Seting Stamen Maps Layer Visibility: ' + visible);
        gdo.net.instance[instanceId].stamenLayer.setVisible(visible);
    }

    $.connection.shanghaiMetroAppHub.client.setStationLayerVisible = function (instanceId, visible) {
        gdo.consoleOut('.SHANGHAIMETRO', 1, 'Seting Stations Layer Visibility: ' + visible);
        gdo.net.instance[instanceId].stationsLayer.setVisible(visible);
    }

    $.connection.shanghaiMetroAppHub.client.setLineLayerVisible = function (instanceId, visible) {
        gdo.consoleOut('.SHANGHAIMETRO', 1, 'Seting Lines Layer Visibility: ' + visible);
        gdo.net.instance[instanceId].linesLayer.setVisible(visible);
    }

    $.connection.shanghaiMetroAppHub.client.setEntryHeatmapLayerVisible = function (instanceId, visible) {
        gdo.consoleOut('.SHANGHAIMETRO', 1, 'Seting Heatmap Layer Visibility: ' + visible);
        gdo.net.instance[instanceId].entryHeatmapLayer.setVisible(visible);
    }

    $.connection.shanghaiMetroAppHub.client.receiveMapPosition = function (instanceId, topLeft, center, bottomRight, resolution, width, height, zoom) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && gdo.net.node[gdo.clientId].appInstanceId == instanceId) {
            var mapCenter = [0, 0];
            var mapResolution = parseFloat(resolution);
            mapCenter = gdo.net.app["ShanghaiMetro"].calculateLocalCenter(topLeft, bottomRight);
            var nodePixels = gdo.net.node[gdo.clientId].width * gdo.net.node[gdo.clientId].height;
            var controlPixels = width * height;
            var numOfNodes = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].cols * gdo.net.section[gdo.net.node[gdo.clientId].sectionId].rows;
            mapResolution = mapResolution / Math.sqrt((nodePixels * numOfNodes) / controlPixels);
            if (!gdo.net.instance[instanceId].isInitialized) {
                gdo.net.app["ShanghaiMetro"].initMap(instanceId, mapCenter, mapResolution);
                gdo.net.instance[instanceId].isInitialized = true;
            }
            gdo.net.app["ShanghaiMetro"].update(instanceId, mapCenter, mapResolution);
            //gdo.net.instance[instanceId].map.getView().setCenter(mapCenter);
            //gdo.net.instance[instanceId].map.getView().setResolution(mapResolution);
            gdo.net.instance[instanceId].map.render();
        }
    }
    $.connection.shanghaiMetroAppHub.client.receiveInitialMapPosition = function (instanceId, center, resolution, zoom) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.instance[instanceId].isInitialized = true;
            gdo.net.app["ShanghaiMetro"].initMap(instanceId, center, resolution);
            //gdo.net.instance[instanceId].map.getView().setZoom(zoom);
            gdo.net.instance[instanceId].map.updateSize();
            gdo.net.instance[instanceId].map.getView().on('change:resolution', function () {
                gdo.net.app["ShanghaiMetro"].changeEvent(instanceId);
                setTimeout(function () { gdo.net.app["ShanghaiMetro"].updateCenter(instanceId); }, 70);
                gdo.net.app["ShanghaiMetro"].server.updateResolution(instanceId);
            });
            gdo.net.instance[instanceId].map.getView().on('change:zoom', function() {
                gdo.net.app["ShanghaiMetro"].changeEvent(instanceId);
                setTimeout(function() {gdo.net.app["ShanghaiMetro"].updateCenter(instanceId);}, 70);
                gdo.net.app["ShanghaiMetro"].server.updateResolution(instanceId);
            });
            gdo.net.instance[instanceId].map.getView().on('change:center', function () {
                gdo.net.app["ShanghaiMetro"].changeEvent(instanceId);
            });
            gdo.net.instance[instanceId].map.getView().on('change:rotation', function () {
                gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
                gdo.net.app["ShanghaiMetro"].changeEvent(instanceId);
            });
            gdo.net.instance[instanceId].map.on('change:size', function () {
                gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
                gdo.net.app["ShanghaiMetro"].changeEvent(instanceId);
            });
            gdo.net.instance[instanceId].map.on('change:view', function () {
                gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
                gdo.net.app["ShanghaiMetro"].changeEvent(instanceId);
            });
            gdo.net.instance[instanceId].map.on('change:target', function () {
                gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
                gdo.net.app["ShanghaiMetro"].changeEvent(instanceId);
            });
            gdo.net.instance[instanceId].map.getView().setResolution(gdo.net.instance[instanceId].map.getView().getResolution());
            gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
            gdo.net.app["ShanghaiMetro"].uploadMapPosition(instanceId);
            gdo.net.app["ShanghaiMetro"].server.updateResolution(instanceId);
            gdo.net.app["ShanghaiMetro"].changeEvent(instanceId);
            gdo.net.app["ShanghaiMetro"].drawMapTable(instanceId);
            gdo.net.instance[instanceId].map.render();
        }
    }


});

gdo.net.app["ShanghaiMetro"].initMap = function (instanceId, center, resolution) {
    gdo.net.instance[instanceId].timeStep = 0;
    gdo.consoleOut('.SHANGAIMETRO', 1, 'Loading ' + '/Configurations/ShanghaiMetro/Data/stations.json');
    $.getJSON('/Configurations/ShanghaiMetro/Data/stations.json', function (data) {
        gdo.net.app["ShanghaiMetro"].stations = data;
    });

    gdo.consoleOut('.SHANGAIMETRO', 1, 'Loading ' + '/Configurations/ShanghaiMetro/Data/lines.json');
    $.getJSON('/Configurations/ShanghaiMetro/Data/lines.json', function (data) {
        gdo.net.app["ShanghaiMetro"].lines = data;
    });

    gdo.consoleOut('.SHANGAIMETRO', 1, 'Loading ' + '/Configurations/ShanghaiMetro/Data/entry_exit.json');
    $.getJSON('/Configurations/ShanghaiMetro/Data/entry_exit.json', function (data) {
        gdo.net.app["ShanghaiMetro"].entry_and_exits = data;
    });

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
    /*for (i = 0, ii = gdo.net.instance[instanceId].styles.length; i < ii; ++i) {
        gdo.net.instance[instanceId].layers.push(new ol.layer.Tile({
            visible: false,
            preload: Infinity,
            source: new ol.source.BingMaps({
                key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
                imagerySet: gdo.net.instance[instanceId].styles[i],
                maxZoom: 19
            })
        }));
    }*/

    map = new ol.Map({
        controls: new Array(),
        layers: [],
        target: 'map',
        view: gdo.net.instance[instanceId].view
    });
    gdo.net.instance[instanceId].map = map;
    setTimeout(function () {

        gdo.net.instance[instanceId].bingLayer = new ol.layer.Tile({
            visible: false,
            preload: Infinity,
            source: new ol.source.BingMaps({
                key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
                imagerySet: 'AerialWithLabels',
                maxZoom: 19
            })
        });

        gdo.net.instance[instanceId].stamenLayer = new ol.layer.Tile({
            source: new ol.source.Stamen({
                layer: 'toner'
            })
        });

        gdo.net.instance[instanceId].stationSource = new ol.source.Vector();
        gdo.net.instance[instanceId].lineSource = new ol.source.Vector();

        gdo.net.instance[instanceId].entrySource = new ol.source.Vector();
        gdo.net.instance[instanceId].exitSource = new ol.source.Vector();
        gdo.net.instance[instanceId].congestionSource = new ol.source.Vector();
        gdo.net.instance[instanceId].linkLoadSource = new ol.source.Vector();

        gdo.net.app["ShanghaiMetro"].drawFeatures(instanceId);

        gdo.net.instance[instanceId].lineWidth = 5;

        gdo.net.instance[instanceId].styleFunction = function (feature, resolution) {
            var style = new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: 'white',
                    width: gdo.net.instance[instanceId].lineWidth
                })
            });
            switch (feature.getId()) {
                case 1:
                    style.getStroke().setColor('#e81b38');
                    break;
                case 2:
                    style.getStroke().setColor('#8ac63f');
                    break;
                case 3:
                    style.getStroke().setColor('#fbd005');
                    break;
                case 4:
                    style.getStroke().setColor('#4f2d8b');
                    break;
                case 5:
                    style.getStroke().setColor('#9056a3');
                    break;
                case 6:
                    style.getStroke().setColor('#d7006c');
                    break;
                case 7:
                    style.getStroke().setColor('#f37120');
                    break;
                case 8:
                    style.getStroke().setColor('#009dd8');
                    break;
                case 9:
                    style.getStroke().setColor('#7ac7ea');
                    break;
                case 10:
                    style.getStroke().setColor('#bca8d1');
                    break;
                case 11:
                    style.getStroke().setColor('#7d2030');
                    break;
                case 12:
                    style.getStroke().setColor('#007c65');
                    break;
                case 13:
                    style.getStroke().setColor('#e795c0');
                    break;
                case 16:
                    style.getStroke().setColor('#8ed1c0');
                    break;
                default:
                    style.getStroke().setColor('white');
                    break;
            }

            return [style];
        };

        gdo.net.instance[instanceId].stationWidth = 2;
        gdo.net.instance[instanceId].stationsLayer = new ol.layer.Vector({
            source: gdo.net.instance[instanceId].stationSource,
            style: new ol.style.Style({
                image: new ol.style.Circle({
                    radius: gdo.net.instance[instanceId].stationWidth * 4,
                    fill: new ol.style.Fill({
                        color: 'white',
                        width: gdo.net.instance[instanceId].stationWidth 
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'black',
                        width: gdo.net.instance[instanceId].stationWidth 
                    })
                })
            })
        });
        gdo.net.instance[instanceId].linesLayer = new ol.layer.Vector({
            source: gdo.net.instance[instanceId].lineSource,
            style: gdo.net.instance[instanceId].styleFunction
        });
        
        var blur = $('iframe').contents().find('#blur').val();
        var radius = $('iframe').contents().find('#radius').val();
        var opacity = $('iframe').contents().find('#opacity').val();
        gdo.net.instance[instanceId].lineWidth = $('iframe').contents().find('#line').val();
        gdo.net.instance[instanceId].stationWidth = $('iframe').contents().find('#station').val();

        $('iframe').contents().find('#blur').change(function () {
            gdo.net.app["ShanghaiMetro"].uploadProperties(instanceId);
        });
        $('iframe').contents().find('#radius').change(function () {
            gdo.net.app["ShanghaiMetro"].uploadProperties(instanceId);
        });
        $('iframe').contents().find('#opacity').change(function () {
            gdo.net.app["ShanghaiMetro"].uploadProperties(instanceId);
        });
        $('iframe').contents().find('#station').change(function () {
            gdo.net.app["ShanghaiMetro"].uploadProperties(instanceId);
        });
        $('iframe').contents().find('#line').change(function () {
            gdo.net.app["ShanghaiMetro"].uploadProperties(instanceId);
        });
        gdo.net.app["ShanghaiMetro"].uploadProperties = function(instanceId) {
            gdo.net.app["ShanghaiMetro"].server.setProperties(instanceId,
            parseInt($('iframe').contents().find('#blur').val()),
            parseInt($('iframe').contents().find('#radius').val()),
            parseFloat($('iframe').contents().find('#opacity').val()),
            parseInt($('iframe').contents().find('#line').val()),
            parseInt($('iframe').contents().find('#station').val()));
            setTimeout(function() { gdo.net.app["ShanghaiMetro"].uploadMapPosition(instanceId); }, 300);
        }

        setTimeout(function() {
            gdo.net.instance[instanceId].entryHeatmapLayer = new ol.layer.Heatmap({
                source: gdo.net.instance[instanceId].entrySource,
                opacity: opacity,
                blur: blur,
                radius: radius
            });
            setTimeout(function() {
                map.addLayer(gdo.net.instance[instanceId].bingLayer);
                map.addLayer(gdo.net.instance[instanceId].stamenLayer);
                map.addLayer(gdo.net.instance[instanceId].linesLayer);
                map.addLayer(gdo.net.instance[instanceId].stationsLayer);
                map.addLayer(gdo.net.instance[instanceId].entryHeatmapLayer);

                gdo.net.app["ShanghaiMetro"].server.requestBingLayerVisible(instanceId);
                gdo.net.app["ShanghaiMetro"].server.requestStamenLayerVisible(instanceId);
                gdo.net.app["ShanghaiMetro"].server.requestStationLayerVisible(instanceId);
                gdo.net.app["ShanghaiMetro"].server.requestLineLayerVisible(instanceId);
                gdo.net.app["ShanghaiMetro"].server.requestEntryHeatmapLayerVisible(instanceId);
                gdo.net.app["ShanghaiMetro"].server.requestProperties(instanceId);
            }, 1000);

        }, 1000);
    }, 1000);


    


    //TODO Add Stations

    //TODO Add LineSegments

    //TODO forEachSegment


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

}

//TODO SetVisible Command

//TODO Animate LineSegments

//TODO Animate Heatmap
var datax;
gdo.net.app["ShanghaiMetro"].drawFeatures = function(instanceId) {
    for (var index1 in gdo.net.app["ShanghaiMetro"].stations) {
        if (gdo.net.app["ShanghaiMetro"].stations.hasOwnProperty((index1))) {
            var station1 = gdo.net.app["ShanghaiMetro"].stations[index1];
            var geom = new ol.geom.Point(ol.proj.transform([parseFloat(station1.coordinates[1]), parseFloat(station1.coordinates[0])], 'EPSG:4326', 'EPSG:3857'));
            var feature = new ol.Feature({
                geometry: geom,
                id: parseInt(station1.id)
            });
            gdo.net.instance[instanceId].stationSource.addFeature(feature);
        }
    }

    //TODO Layer Group
    //TODO Each Line Segment is one Layer
    //TODO Each Line is one Layer Group

    for (var i = 1; i < 17; i++) {
        var lineCoor = [];
        for (var index2 in gdo.net.app["ShanghaiMetro"].lines[i]) {
            if (gdo.net.app["ShanghaiMetro"].lines[i].hasOwnProperty((2))) {
                var station2 = gdo.net.app["ShanghaiMetro"].lines[i][index2];
                var coord = gdo.net.app["ShanghaiMetro"].stations[station2].coordinates;
                lineCoor.push(ol.proj.transform([parseFloat(coord[1]), parseFloat(coord[0])], 'EPSG:4326', 'EPSG:3857'));
                //TODO Do at least X interpolations
            }
        }
        var lineGeom = new ol.geom.LineString(lineCoor);
        var lineFeature = new ol.Feature({
            geometry: lineGeom,
            style: gdo.net.instance[instanceId].styleFunction
        });
        lineFeature.setId(i);
        gdo.net.instance[instanceId].lineSource.addFeature(lineFeature);
    }
    for (var index3 in gdo.net.app["ShanghaiMetro"].entry_and_exits.Data) {
        if (gdo.net.app["ShanghaiMetro"].entry_and_exits.Data.hasOwnProperty((index3))) {
            var dataPoint = gdo.net.app["ShanghaiMetro"].entry_and_exits.Data[index3];
            datax = dataPoint;
            var geom2 = new ol.geom.Point(ol.proj.transform([parseFloat(dataPoint.coordinates[0]), parseFloat(dataPoint.coordinates[1])], 'EPSG:4326', 'EPSG:3857'));
            var feature2 = new ol.Feature({
                geometry: geom2
            });
            feature2.set('weight', parseFloat(dataPoint.entries[gdo.net.instance[instanceId].timeStep]));
            feature2.set('entries', dataPoint.entries);
            gdo.net.instance[instanceId].entrySource.addFeature(feature2);
        }
    }

    //do for all
}

gdo.net.app["ShanghaiMetro"].calculateLocalCenter = function (topLeft, bottomRight) {
    var diffTotal = [parseFloat(bottomRight[0]) - parseFloat(topLeft[0]), parseFloat(bottomRight[1]) - parseFloat(topLeft[1])];
    var diffUnit = [diffTotal[0] / gdo.net.section[gdo.net.node[gdo.clientId].sectionId].cols, diffTotal[1] / gdo.net.section[gdo.net.node[gdo.clientId].sectionId].rows];
    var center = [parseFloat(topLeft[0]) + (diffUnit[0] * (0.5 + gdo.net.node[gdo.clientId].sectionCol)), parseFloat(topLeft[1]) + (diffUnit[1] * (0.5 + gdo.net.node[gdo.clientId].sectionRow))];
    return center;
}

gdo.net.app["ShanghaiMetro"].initClient = function (clientId) {
    var instanceId = gdo.net.node[gdo.clientId].appInstanceId;
    gdo.consoleOut('.ShanghaiMetro', 1, 'Initializing ShanghaiMetro App Instance ' + instanceId + ' Client at Node ' + clientId);
    gdo.loadModule('ui', 'shanghaiMetro', gdo.MODULE_TYPE.APP);
    gdo.loadModule('3d', 'shanghaiMetro', gdo.MODULE_TYPE.APP);
    gdo.net.instance[instanceId].isInitialized = false;
    gdo.net.app["ShanghaiMetro"].C = 156543.034;
    gdo.net.app["ShanghaiMetro"].R = 6378137;

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

    gdo.net.app["ShanghaiMetro"].server.requestMapPosition(instanceId, false);
}

gdo.net.app["ShanghaiMetro"].initControl = function (instanceId) {
    gdo.loadModule('ui', 'shanghaiMetro', gdo.MODULE_TYPE.APP);
    gdo.loadModule('3d', 'shanghaiMetro', gdo.MODULE_TYPE.APP);
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

    gdo.net.app["ShanghaiMetro"].server.requestMapPosition(instanceId, true);
    gdo.consoleOut('.SHANGHAIMETRO', 1, 'Initializing Image ShanghaiMetro Control at Instance ' + instanceId);
}

gdo.net.app["ShanghaiMetro"].terminateClient = function (instanceId) {
    gdo.consoleOut('.SHANGHAIMETRO', 1, 'Terminating Image ShanghaiMetro Client at Node ' + instanceId);
}

gdo.net.app["ShanghaiMetro"].terminateControl = function (instanceId) {
    gdo.consoleOut('.SHANGHAIMETRO', 1, 'Terminating ShanghaiMetro App Control at Instance ' + instanceId);
}

gdo.net.app["ShanghaiMetro"].uploadMapPosition = function (instanceId) {
    var center = gdo.net.instance[instanceId].map.getView().getCenter();
    var topLeft = gdo.net.instance[instanceId].map.getCoordinateFromPixel([0, 0]);
    var bottomRight = gdo.net.instance[instanceId].map.getCoordinateFromPixel(gdo.net.instance[instanceId].map.getSize());
    var size = gdo.net.instance[instanceId].map.getSize();
    var width = size[0];
    var height = size[1];
    gdo.net.app["ShanghaiMetro"].server.uploadMapPosition(instanceId, topLeft, center, bottomRight, gdo.net.instance[instanceId].map.getView().getResolution(), width, height, gdo.net.instance[instanceId].map.getView().getZoom());
}

gdo.net.app["ShanghaiMetro"].changeEvent = function (instanceId) {
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        if (gdo.net.instance[instanceId].isInitialized) {
            gdo.net.app["ShanghaiMetro"].uploadMapPosition(instanceId);
        }
    }
}

gdo.net.app["ShanghaiMetro"].updateCenter = function (instanceId) {
    gdo.consoleOut('.SHANGHAIMETRO', 4, gdo.net.instance[instanceId].map.getView().getCenter());
    gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
}
gdo.net.app["ShanghaiMetro"].update = function (instanceId, mapCenter, mapResolution) {
    gdo.consoleOut('.SHANGHAIMETRO', 4, gdo.net.instance[instanceId].map.getView().getCenter());
    gdo.net.instance[instanceId].map.getView().setCenter(mapCenter);
    gdo.net.instance[instanceId].map.getView().setResolution(mapResolution);
}

