﻿var map;
var map3D;
var view;
var layers;
var scene;
var terrainProvider;


$(function () {
    gdo.consoleOut('.SharingEconomy', 1, 'Loaded SharingEconomy JS');
    $.connection.sharingEconomyAppHub.client.updateResolution = function (instanceId) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["SharingEconomy"].updateCenter(instanceId);
            //gdo.net.instance[instanceId].map.render();
            //gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
        }
    }

    $.connection.sharingEconomyAppHub.client.receiveTimeStep = function (timestep) {
        if (gdo.clientMode != gdo.CLIENT_MODE.CONTROL && gdo.net.instance[gdo.net.node[gdo.clientId].appInstanceId].appName == "SharingEconomy") {
            var instanceId = gdo.net.node[gdo.clientId].appInstanceId;
            gdo.net.app["SharingEconomy"].timeStep = timestep;
            switch (gdo.net.instance[instanceId].dataserie) {
                case "entries":
                    gdo.net.instance[instanceId].cycleSource.forEachFeature(function (feature) {
                        feature.set("weight", Math.log(parseFloat(feature.get("entries")[timestep])) / 7);
                    });
                    break;
         /*       case "exits":
                    gdo.net.instance[instanceId].cycleSource.forEachFeature(function (feature) {
                        feature.set("weight", Math.log(parseFloat(feature.get("exits")[timestep])) / 7);
                    });
                    break;
                case "emptiness":
                    gdo.net.instance[instanceId].cycleSource.forEachFeature(function (feature) {
                        feature.set("weight", parseFloat(feature.get("emptiness")[timestep]));
                    });
                    break; */
            }
            if (gdo.clientMode != gdo.CLIENT_MODE.CONTROL && gdo.net.node[gdo.clientId].sectionCol == 0 && gdo.net.node[gdo.clientId].sectionRow == 0) {
                /*var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                var daysNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

                var time = new Date(gdo.net.app["SharingEconomy"].data[0].timestamps[timestep] * 1000); */
                $("iframe").contents().find("#timelabel").empty().css("visibility", "visible")
                    .append(gdo.net.app["SharingEconomy"].data[0].timestamps[timestep]);
            }
        }
    }

    $.connection.sharingEconomyAppHub.client.receiveProperties = function (instanceId, blur, radius, opacity, station, series) {
        gdo.consoleOut('.SharingEconomy', 1, 'Received Blur: ' + blur + ' and Radius: ' + radius + ' Opacity: ' + opacity + ' Station: ' + station + ' Series:' + series);
        //gdo.net.instance[instanceId].stationWidth = station;
        if (gdo.net.instance[instanceId].heatmapLayer != null) {
            gdo.net.instance[instanceId].heatmapLayer.setOpacity(opacity);
            gdo.net.instance[instanceId].heatmapLayer.setBlur(blur);
            gdo.net.instance[instanceId].heatmapLayer.setRadius(radius);
        }
        if (gdo.clientMode != gdo.CLIENT_MODE.CONTROL) {
            $('iframe').contents().find('#blur').val(blur);
            $('iframe').contents().find('#radius').val(radius);
            $('iframe').contents().find('#opacity').val(opacity);
            $('iframe').contents().find('#station').val(station);
        }
        gdo.net.app["SharingEconomy"].updateCenter(instanceId);
        gdo.net.instance[instanceId].dataserie = series;
        if (gdo.clientMode != gdo.CLIENT_MODE.CONTROL
            && gdo.net.node[gdo.clientId].sectionCol == gdo.net.section[gdo.net.node[gdo.clientId].sectionId].cols - 1
            && gdo.net.node[gdo.clientId].sectionRow == 0) {
                switch (series) {
                    case "entries":
                        $("iframe").contents().find("#datalabel").empty().css("visibility", "visible").append("");
                        break;
               /*     case "exits":
                        $("iframe").contents().find("#datalabel").empty().css("visibility", "visible").append("People Taking Bikes");
                        break;
                    case "emptiness":
                        $("iframe").contents().find("#datalabel").empty().css("visibility", "visible").append("Docks' Emptiness level");
                        break; */
                    }
        }
        //gdo.net.instance[instanceId].map.render();
    }

    $.connection.sharingEconomyAppHub.client.setBingLayerVisible = function (instanceId, visible) {
        gdo.consoleOut('.SharingEconomy', 1, 'Seting Bing Maps Layer Visibility: ' + visible);
        gdo.net.instance[instanceId].bingLayer.setVisible(visible);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            if (visible) {
                $("iframe").contents().find("#bing_button").removeClass("btn-danger").addClass("btn-success");
            } else {
                $("iframe").contents().find("#bing_button").removeClass("btn-success").addClass("btn-danger");
            }
        }
    }

    $.connection.sharingEconomyAppHub.client.setCartoDBLayerVisible = function (instanceId, visible) {
        gdo.consoleOut('.SharingEconomy', 1, 'Seting CartoDB Maps Layer Visibility: ' + visible);
        gdo.net.instance[instanceId].cartodbLayer.setVisible(visible);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            if (visible) {
                $("iframe").contents().find("#cartodb_button").removeClass("btn-danger").addClass("btn-success");
            } else {
                $("iframe").contents().find("#cartodb_button").removeClass("btn-success").addClass("btn-danger");
            }
        }
    }

    $.connection.sharingEconomyAppHub.client.setOpenCycleLayerVisible = function (instanceId, visible) {
        gdo.consoleOut('.SharingEconomy', 1, 'Seting OpenCycle Layer Visibility: ' + visible);
        gdo.net.instance[instanceId].openCycleLayer.setVisible(visible);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            if (visible) {
                $("iframe").contents().find("#opencycle_button").removeClass("btn-danger").addClass("btn-success");
            } else {
                $("iframe").contents().find("#opencycle_button").removeClass("btn-success").addClass("btn-danger");
            }
        }
    }

    $.connection.sharingEconomyAppHub.client.setStamenLayerVisible = function (instanceId, visible) {
        gdo.consoleOut('.SharingEconomy', 1, 'Seting Stamen Layer Visibility: ' + visible);
        gdo.net.instance[instanceId].stamenLayer.setVisible(visible);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            if (visible) {
                $("iframe").contents().find("#stamen_button").removeClass("btn-danger").addClass("btn-success");
            } else {
                $("iframe").contents().find("#stamen_button").removeClass("btn-success").addClass("btn-danger");
            }
        }
    }

    $.connection.sharingEconomyAppHub.client.setStationLayerVisible = function (instanceId, visible) {
        gdo.consoleOut('.SharingEconomy', 1, 'Seting Stations Layer Visibility: ' + visible);
        /*if (gdo.clientMode == gdo.CLIENT_MODE.NODE && gdo.net.node[gdo.clientId].appInstanceId == instanceId) {
            gdo.net.instance[instanceId].stationsLayer.setVisible(visible);
            //gdo.net.instance[instanceId].trainstationsLayer.setVisible(visible);
        } else {
            gdo.net.instance[instanceId].stationsLayer.setVisible(false);
            //gdo.net.instance[instanceId].trainstationsLayer.setVisible(false);
        }
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            if (visible) {
                $("iframe").contents().find("#stations_button").removeClass("btn-danger").addClass("btn-success");
            } else {
                $("iframe").contents().find("#stations_button").removeClass("btn-success").addClass("btn-danger");
            }
        } */
    }

    $.connection.sharingEconomyAppHub.client.setHeatmapLayerVisible = function (instanceId, visible) {
        gdo.consoleOut('.SharingEconomy', 1, 'Seting Heatmap Layer Visibility: ' + visible);
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && gdo.net.node[gdo.clientId].appInstanceId == instanceId) {
            gdo.net.instance[instanceId].heatmapLayer.setVisible(visible);
        } else {
            gdo.net.instance[instanceId].heatmapLayer.setVisible(false);
        }
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            if (visible) {
                $("iframe").contents().find("#heatmap_button").removeClass("btn-danger").addClass("btn-success");
            } else {
                $("iframe").contents().find("#heatmap_button").removeClass("btn-success").addClass("btn-danger");
            }
        }
    }

    $.connection.sharingEconomyAppHub.client.receiveMapPosition = function (instanceId, topLeft, center, bottomRight, resolution, width, height, zoom) {
        gdo.consoleOut('.SharingEconomy', 1, 'Center: ' + center + ' and TopLeft: ' + topLeft + ' BottomRight: ' + bottomRight + ' Width: ' + width + ' Height: ' + height + ' Zoom:' + zoom + ' Resolution: ' + resolution);
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && gdo.net.node[gdo.clientId].appInstanceId == instanceId) {
            var mapCenter = [0, 0];
            var mapResolution = parseFloat(resolution);
            zoom = parseInt(zoom);
            mapCenter = gdo.net.app["SharingEconomy"].calculateLocalCenter(topLeft, bottomRight);
            var nodePixels = gdo.net.node[gdo.clientId].width * gdo.net.node[gdo.clientId].height;
            var controlPixels = width * height;
            var numOfNodes = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].cols * gdo.net.section[gdo.net.node[gdo.clientId].sectionId].rows;
            mapResolution = mapResolution / Math.sqrt((nodePixels * numOfNodes) / controlPixels);
            if (!gdo.net.instance[instanceId].isInitialized) {
                gdo.net.app["SharingEconomy"].initMap(instanceId, mapCenter, mapResolution, zoom);
                gdo.net.instance[instanceId].map.getView().setZoom(zoom);
                gdo.net.instance[instanceId].isInitialized = true;
            }
            gdo.net.app["SharingEconomy"].update(instanceId, mapCenter, mapResolution, zoom);
            //gdo.net.instance[instanceId].map.getView().setZoom(zoom);
            //gdo.net.instance[instanceId].map.getView().setCenter(mapCenter);
            //gdo.net.instance[instanceId].map.getView().setResolution(mapResolution);
            //gdo.net.instance[instanceId].map.render();
        }
    }
    $.connection.sharingEconomyAppHub.client.receiveInitialMapPosition = function (instanceId, center, resolution, zoom) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.instance[instanceId].isInitialized = true;
            zoom = parseInt(zoom);
            gdo.net.app["SharingEconomy"].initMap(instanceId, center, resolution, zoom);
            gdo.consoleOut('.SharingEconomy', 1, 'c Zoom ' + zoom);
            gdo.net.instance[instanceId].map.getView().setZoom(zoom);
            gdo.consoleOut('.SharingEconomy', 1, 'f Zoom ' + gdo.net.instance[instanceId].map.getView().getZoom());
            gdo.net.instance[instanceId].map.updateSize();
            gdo.net.instance[instanceId].map.getView().on('change:resolution', function () {
                gdo.net.app["SharingEconomy"].changeEvent(instanceId);
                setTimeout(function () { gdo.net.app["SharingEconomy"].updateCenter(instanceId); }, 70);
                gdo.net.app["SharingEconomy"].server.updateResolution(instanceId);
            });
            gdo.net.instance[instanceId].map.getView().on('change:zoom', function () {
                gdo.net.app["SharingEconomy"].changeEvent(instanceId);
                setTimeout(function () { gdo.net.app["SharingEconomy"].updateCenter(instanceId); }, 70);
                gdo.net.app["SharingEconomy"].server.updateResolution(instanceId);
            });
            gdo.net.instance[instanceId].map.getView().on('change:center', function () {
                gdo.net.app["SharingEconomy"].changeEvent(instanceId);
            });
            gdo.net.instance[instanceId].map.getView().on('change:rotation', function () {
                gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
                gdo.net.app["SharingEconomy"].changeEvent(instanceId);
            });
            gdo.net.instance[instanceId].map.on('change:size', function () {
                gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
                gdo.net.app["SharingEconomy"].changeEvent(instanceId);
            });
            gdo.net.instance[instanceId].map.on('change:view', function () {
                gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
                gdo.net.app["SharingEconomy"].changeEvent(instanceId);
            });
            gdo.net.instance[instanceId].map.on('change:target', function () {
                gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
                gdo.net.app["SharingEconomy"].changeEvent(instanceId);
            });
            gdo.net.instance[instanceId].map.getView().setResolution(gdo.net.instance[instanceId].map.getView().getResolution());
            gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
            gdo.net.instance[instanceId].map.getView().setZoom(gdo.net.instance[instanceId].map.getView().getZoom());
            gdo.net.app["SharingEconomy"].uploadMapPosition(instanceId);
            gdo.net.app["SharingEconomy"].server.updateResolution(instanceId);
            gdo.net.app["SharingEconomy"].changeEvent(instanceId);
            gdo.net.app["SharingEconomy"].drawMapTable(instanceId);
            //gdo.net.instance[instanceId].map.render();
            gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
            //gdo.net.app["SharingEconomy"].updateChange(instanceId);
            //gdo.net.app["SharingEconomy"].server.startAnimation(instanceId);
            setTimeout(function () { gdo.net.app["SharingEconomy"].server.updateResolution(instanceId); }, 700);
        }
    }


});

gdo.net.app["SharingEconomy"].initMap = function (instanceId, center, resolution, zoom) {
    gdo.consoleOut('.SharingEconomy', 1, 'Map Initialized');
    gdo.net.app["SharingEconomy"].timeStep = 0;
    /*gdo.consoleOut('.SharingEconomy', 1, 'Loading ' + '/Data/SharingEconomy/stations.json');
    $.getJSON('/Data/SharingEconomy/stations.json', function (data) {
        gdo.net.app["SharingEconomy"].stations = data;
    }); */

   /* gdo.consoleOut('.SharingEconomy', 1, 'Loading ' + '/Data/SharingEconomy/trainstations.json');
    $.getJSON('/Data/SharingEconomy/trainstations.json', function (data) {
        gdo.net.app["SharingEconomy"].trainstations = data;
    }); */

    gdo.consoleOut('.SharingEconomy', 1, 'Loading ' + '/Data/SharingEconomy/' + gdo.net.app["SharingEconomy"].config[gdo.net.instance[instanceId].configName].file + '.json');
    $.getJSON('/Data/SharingEconomy/' + gdo.net.app["SharingEconomy"].config[gdo.net.instance[instanceId].configName].file + '.json', function (data) {
        gdo.net.app["SharingEconomy"].data = data;
    });

    view = new ol.View({
        center: [parseFloat(center[0]), parseFloat(center[1])],
        resolution: parseFloat(resolution),
        zoom: parseInt(zoom)
    });
    gdo.net.instance[instanceId].view = view;
    //$("iframe")[0].contentWindow.view = view;
    //$("iframe")[0].contentWindow.styles = styles;
    //$("iframe")[0].contentWindow.layers = layers;

    /*var i, ii;
    for (i = 0, ii = gdo.net.instance[instanceId].styles.length; i < ii; ++i) {
        gdo.net.instance[instanceId].layers.push(new ol.layer.Tile({
            visible: false,
            preload: Infinity,
            source: new ol.source.BingMaps({
                key: 'At9BTvhQUqgpvpeiuc9SpgclVtgX9uM1fjsB-YQWkP3a9ZdxeZQBW99j5K3oEsbM',
                imagerySet: gdo.net.instance[instanceId].styles[i],
                maxZoom: 19
            })
        }));
    }*/
    gdo.net.instance[instanceId].bingLayer = new ol.layer.Tile({
        visible: false,
        preload: Infinity,
        source: new ol.source.BingMaps({
            key: 'At9BTvhQUqgpvpeiuc9SpgclVtgX9uM1fjsB-YQWkP3a9ZdxeZQBW99j5K3oEsbM',
            imagerySet: 'Aerial',
            maxZoom: 19
        })
    });

    gdo.net.instance[instanceId].cartodbLayer = new ol.layer.Tile({
        visible: false,
        source: new ol.source.XYZ({
            url: 'http://s.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
        })
    });

    gdo.net.instance[instanceId].stamenLayer = new ol.layer.Tile({
        visible: false,
        source: new ol.source.Stamen({
            layer: 'toner'
        })
    });

    gdo.net.instance[instanceId].openCycleLayer = new ol.layer.Tile({
        visible: false,
        source: new ol.source.OSM({
            url: 'http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
        })
    });

    gdo.net.instance[instanceId].layers = [];
    //gdo.net.instance[instanceId].layers[0] = gdo.net.instance[instanceId].bingLayer;
    //gdo.net.instance[instanceId].layers[1] = gdo.net.instance[instanceId].cartodbLayer;
    //gdo.net.instance[instanceId].layers[2] = gdo.net.instance[instanceId].openCycleLayer;
    map = new ol.Map({
        controls: new Array(),
        //renderer: 'webgl',
        layers: gdo.net.instance[instanceId].layers,
        target: 'map',
        view: gdo.net.instance[instanceId].view
    });
    gdo.net.instance[instanceId].map = map;

    setTimeout(function () {

        //gdo.net.instance[instanceId].stationSource = new ol.source.Vector();
        //gdo.net.instance[instanceId].trainstationSource = new ol.source.Vector();
        gdo.net.instance[instanceId].cycleSource = new ol.source.Vector();

        gdo.net.app["SharingEconomy"].server.requestProperties(instanceId);

        var blur = $('iframe').contents().find('#blur').val();
        var radius = $('iframe').contents().find('#radius').val();
        var opacity = $('iframe').contents().find('#opacity').val();

        //gdo.net.instance[instanceId].stationWidth = $('iframe').contents().find('#station').val();

        gdo.net.instance[instanceId].styleFunction = function (feature, resolution) {
            var style = new ol.style.Style({
                image: new ol.style.Circle({
                    radius: radius, //(gdo.net.instance[instanceId].stationWidth * gdo.net.app["SharingEconomy"].stations[feature.getId()].nbDocks) / 3, //* gdo.net.section[gdo.net.instance[instanceId].sectionId].rows * gdo.net.section[gdo.net.instance[instanceId].sectionId].cols,
                    fill: new ol.style.Fill({
                        color: 'tomato',
                        width: radius //(gdo.net.instance[instanceId].stationWidth * gdo.net.app["SharingEconomy"].stations[feature.getId()].nbDocks) / 12 //* gdo.net.section[gdo.net.instance[instanceId].sectionId].rows * gdo.net.section[gdo.net.instance[instanceId].sectionId].cols
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'black',
                        width: 1
                        //width: (gdo.net.instance[instanceId].stationWidth * gdo.net.app["SharingEconomy"].stations[feature.getId()].nbDocks) / 14 //* gdo.net.section[gdo.net.instance[instanceId].sectionId].rows * gdo.net.section[gdo.net.instance[instanceId].sectionId].cols
                    })
                })
            });
            return [style];
        }

        $('iframe').contents().find('#blur').change(function () {
            gdo.net.app["SharingEconomy"].uploadProperties(instanceId);
        });
        $('iframe').contents().find('#radius').change(function () {
            gdo.net.app["SharingEconomy"].uploadProperties(instanceId);
        });
        $('iframe').contents().find('#opacity').change(function () {
            gdo.net.app["SharingEconomy"].uploadProperties(instanceId);
        });
        $('iframe').contents().find('#station').change(function () {
            gdo.net.app["SharingEconomy"].uploadProperties(instanceId);
        });
        $('iframe').contents().find('#line').change(function () {
            gdo.net.app["SharingEconomy"].uploadProperties(instanceId);
        });
        gdo.net.app["SharingEconomy"].uploadProperties = function (instanceId) {
            gdo.net.app["SharingEconomy"].server.setProperties(instanceId,
            parseInt($('iframe').contents().find('#blur').val()),
            parseInt($('iframe').contents().find('#radius').val()),
            parseFloat($('iframe').contents().find('#opacity').val()),
            parseInt($('iframe').contents().find('#station').val()),
            gdo.net.instance[instanceId].dataserie);
            setTimeout(function () { gdo.net.app["SharingEconomy"].uploadMapPosition(instanceId); }, 300);
            //gdo.net.app["SharingEconomy"].updateChange(instanceId);
        }

        setTimeout(function () {
            gdo.net.app["SharingEconomy"].drawFeatures(instanceId); //TODO Put it back
            /*gdo.net.instance[instanceId].stationsLayer = new ol.layer.Vector({
                source: gdo.net.instance[instanceId].stationSource,
                style: /*new ol.style.Style({
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
                })*/ /*
                gdo.net.instance[instanceId].styleFunction
            }); */

            /*gdo.net.instance[instanceId].trainstationsLayer = new ol.layer.Vector({
                source: gdo.net.instance[instanceId].trainstationSource,
                style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: gdo.net.instance[instanceId].stationWidth * 15,
                        fill: new ol.style.Fill({
                            color: 'green',
                            width: gdo.net.instance[instanceId].stationWidth * 15,
                        }),
                        stroke: new ol.style.Stroke({
                            color: 'black',
                            width: 1
                        })
                    })
                })
            }); */

            gdo.net.instance[instanceId].heatmapLayer = new ol.layer.Heatmap({
                //gradient: ['#00f', '#0ff', '#0f0', '#ff0', '#f00'],
                source: gdo.net.instance[instanceId].cycleSource,
                opacity: opacity,
                blur: blur,
                radius: radius
            });
            setTimeout(function () {
                map.addLayer(gdo.net.instance[instanceId].bingLayer);
                map.addLayer(gdo.net.instance[instanceId].cartodbLayer);
                map.addLayer(gdo.net.instance[instanceId].openCycleLayer);
                map.addLayer(gdo.net.instance[instanceId].stamenLayer);
                //map.addLayer(gdo.net.instance[instanceId].stationsLayer);
                //map.addLayer(gdo.net.instance[instanceId].trainstationsLayer);
                map.addLayer(gdo.net.instance[instanceId].heatmapLayer);
                gdo.net.app["SharingEconomy"].server.requestBingLayerVisible(instanceId);
                gdo.net.app["SharingEconomy"].server.requestCartoDBLayerVisible(instanceId);
                gdo.net.app["SharingEconomy"].server.requestOpenCycleLayerVisible(instanceId);
                gdo.net.app["SharingEconomy"].server.requestStamenLayerVisible(instanceId);
                gdo.net.app["SharingEconomy"].server.requestStationLayerVisible(instanceId);
                gdo.net.app["SharingEconomy"].server.requestHeatmapLayerVisible(instanceId);
                gdo.net.app["SharingEconomy"].server.requestProperties(instanceId);
                //gdo.net.app["SharingEconomy"].server.startAnimation();
                gdo.consoleOut('.SharingEconomy', 1, "Requests sent");
            }, 700);

        }, 700);
    }, 700);
}

gdo.net.app["SharingEconomy"].drawFeatures = function (instanceId) {
    /* //BIKE DOCKS
    for (var index1 in gdo.net.app["SharingEconomy"].stations) {
        if (gdo.net.app["SharingEconomy"].stations.hasOwnProperty((index1))) {
            var station1 = gdo.net.app["SharingEconomy"].stations[index1];
            var geom = new ol.geom.Point(ol.proj.transform([parseFloat(station1.coordinates[1]), parseFloat(station1.coordinates[0])], 'EPSG:4326', 'EPSG:3857'));
            var feature = new ol.Feature({
                geometry: geom,
                id: parseInt(station1.id)
            });
            feature.setId(station1.id);
            gdo.net.instance[instanceId].stationSource.addFeature(feature);
            gdo.consoleOut('.SharingEconomy', 3, "Adding Station " + station1.name + " with id " + station1.id);
        }
    } */

    /* //TRAIN STATIONS
    for (var index1 in gdo.net.app["SharingEconomy"].trainstations) {
        if (gdo.net.app["SharingEconomy"].trainstations.hasOwnProperty((index1))) {
            var station1 = gdo.net.app["SharingEconomy"].trainstations[index1];
            var geom = new ol.geom.Point(ol.proj.transform([parseFloat(station1.coordinates[1]), parseFloat(station1.coordinates[0])], 'EPSG:4326', 'EPSG:3857'));
            var feature = new ol.Feature({
                geometry: geom,
                id: parseInt(station1.id)
            });
            feature.setId(station1.id);
            gdo.net.instance[instanceId].trainstationSource.addFeature(feature);
            gdo.consoleOut('.SharingEconomy', 3, "Adding TrainStation " + station1.name + " with id " + station1.id);
        }
    } */

    //DATA
    for (var index3 in gdo.net.app["SharingEconomy"].data) {
        if (gdo.net.app["SharingEconomy"].data.hasOwnProperty((index3))) {
            var dataPoint = gdo.net.app["SharingEconomy"].data[index3];
            datax = dataPoint;
            var geom2 = new ol.geom.Point(ol.proj.transform([parseFloat(dataPoint.coordinates[1]), parseFloat(dataPoint.coordinates[0])], 'EPSG:4326', 'EPSG:3857'));
            var feature2 = new ol.Feature({
                geometry: geom2
            });
            feature2.set('weight', parseFloat(dataPoint.entries[gdo.net.app["SharingEconomy"].timeStep]));
            feature2.set('entries', dataPoint.entries);
            //feature2.set('exits', dataPoint.exits);
            //feature2.set('emptiness', dataPoint.emptiness);
            gdo.net.instance[instanceId].cycleSource.addFeature(feature2);
        }
    }

    //do for all
}

gdo.net.app["SharingEconomy"].calculateLocalCenter = function (topLeft, bottomRight) {
    var diffTotal = [parseFloat(bottomRight[0]) - parseFloat(topLeft[0]), parseFloat(bottomRight[1]) - parseFloat(topLeft[1])];
    var diffUnit = [diffTotal[0] / gdo.net.section[gdo.net.node[gdo.clientId].sectionId].cols, diffTotal[1] / gdo.net.section[gdo.net.node[gdo.clientId].sectionId].rows];
    var center = [parseFloat(topLeft[0]) + (diffUnit[0] * (0.5 + gdo.net.node[gdo.clientId].sectionCol)), parseFloat(topLeft[1]) + (diffUnit[1] * (0.5 + gdo.net.node[gdo.clientId].sectionRow))];
    return center;
}

gdo.net.app["SharingEconomy"].initClient = function (clientId) {
    var instanceId = gdo.net.node[gdo.clientId].appInstanceId;
    gdo.consoleOut('.SharingEconomy', 1, 'Initializing SharingEconomy App Instance ' + instanceId + ' Client at Node ' + clientId);
    gdo.loadScript('ui', 'sharingEconomy', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('3d', 'sharingEconomy', gdo.SCRIPT_TYPE.APP);
    gdo.net.instance[instanceId].isInitialized = false;
    gdo.net.app["SharingEconomy"].C = 156543.034;
    gdo.net.app["SharingEconomy"].R = 6378137;

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

    gdo.net.app["SharingEconomy"].server.requestMapPosition(instanceId, false);
}

gdo.net.app["SharingEconomy"].initControl = function (instanceId) {
    gdo.loadScript('ui', 'sharingEconomy', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('3d', 'sharingEconomy', gdo.SCRIPT_TYPE.APP);
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

    gdo.net.app["SharingEconomy"].server.requestMapPosition(instanceId, true);
    gdo.consoleOut('.SharingEconomy', 1, 'Initializing SharingEconomy Control at Instance ' + instanceId);
}

gdo.net.app["SharingEconomy"].terminateClient = function (instanceId) {
    gdo.consoleOut('.SharingEconomy', 1, 'Terminating SharingEconomy Client at Node ' + instanceId);
}

gdo.net.app["SharingEconomy"].terminateControl = function (instanceId) {
    gdo.consoleOut('.SharingEconomy', 1, 'Terminating SharingEconomy App Control at Instance ' + instanceId);
}

gdo.net.app["SharingEconomy"].uploadMapPosition = function (instanceId) {
    var center = gdo.net.instance[instanceId].map.getView().getCenter();
    var topLeft = gdo.net.instance[instanceId].map.getCoordinateFromPixel([0, 0]);
    var bottomRight = gdo.net.instance[instanceId].map.getCoordinateFromPixel(gdo.net.instance[instanceId].map.getSize());
    var size = gdo.net.instance[instanceId].map.getSize();
    var width = size[0];
    var height = size[1];
    gdo.net.app["SharingEconomy"].server.uploadMapPosition(instanceId, topLeft, center, bottomRight, gdo.net.instance[instanceId].map.getView().getResolution(), width, height, gdo.net.instance[instanceId].map.getView().getZoom());
}

gdo.net.app["SharingEconomy"].changeEvent = function (instanceId) {
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        if (gdo.net.instance[instanceId].isInitialized) {
            gdo.net.app["SharingEconomy"].uploadMapPosition(instanceId);
        }
    }
}

gdo.net.app["SharingEconomy"].updateCenter = function (instanceId) {
    //gdo.consoleOut('.SharingEconomy', 4, gdo.net.instance[instanceId].map.getView().getCenter());
    gdo.net.instance[instanceId].map.getView().setCenter(gdo.net.instance[instanceId].map.getView().getCenter());
}
gdo.net.app["SharingEconomy"].update = function (instanceId, mapCenter, mapResolution, zoom) {
    //gdo.consoleOut('.SharingEconomy', 4, gdo.net.instance[instanceId].map.getView().getCenter() + " Zoom " + zoom);
    gdo.net.instance[instanceId].map.getView().setCenter(mapCenter);
    gdo.net.instance[instanceId].map.getView().setResolution(mapResolution);
    //gdo.net.instance[instanceId].map.getView().setZoom(zoom);
}

