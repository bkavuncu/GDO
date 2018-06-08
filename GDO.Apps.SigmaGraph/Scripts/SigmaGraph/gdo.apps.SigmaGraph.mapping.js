/**
 * For displaying a map underlay on SigmaGraph
 *
 * I'm not sure how this performs at very large latitudes. Sorry!
 */


gdo.net.app["SigmaGraph"].toggleMap = function () {
    console.log("Toggling map");
    if (gdo.net.app.SigmaGraph.map_box.style.visibility == "hidden") {
        gdo.net.app.SigmaGraph.showMap();
    } else {
        gdo.net.app.SigmaGraph.hideMap();
    }
}


/* Show the map */
gdo.net.app["SigmaGraph"].showMap = async function () {
    if (gdo.net.app.SigmaGraph.map == null) {
        gdo.net.app.SigmaGraph.initMap();
    }
    gdo.net.app.SigmaGraph.mapAutozoom();
    gdo.net.app.SigmaGraph.map_box.style.visibility = "visible";
}


/* Hide the map */
gdo.net.app["SigmaGraph"].hideMap = async function () {
    gdo.net.app.SigmaGraph.map_box.style.visibility = "hidden";
}


gdo.net.app["SigmaGraph"].initMap = async function () {
    var ol = gdo.net.app.SigmaGraph.openLayers;

    var map = new ol.Map({
        target: 'map',
        controls: [],
        layers: [
            new ol.layer.Tile({
                visible: true,
                preload: Infinity,
                source: new ol.source.BingMaps({
                    key: 'AqJrkrOTlDJUTbioyay25R6bC-LoZaAggCaAGRV19SxySzPpMUpuukTvAiW6ldny',
                    imagerySet: 'CanvasDark',
                    maxZoom: 19
                })
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([-15, 14]),
            zoom: 8
        })
    });

    return gdo.net.app.SigmaGraph.map = map;
}


/**
 * Zooms map based on top left and bottom right lon, lat
 * Height zoom will be automatic.
 *
 * TODO: make this work for multiple screens
 */
gdo.net.app["SigmaGraph"].mapSetZoom = async function (lon1, lat1, lon2, lat2) {
    var ol = gdo.net.app.SigmaGraph.openLayers;
    var screen_width = $(gdo.net.app.SigmaGraph.map_box).width();
    var tr = ol.proj.fromLonLat([lon1, lat2]);
    var bl = ol.proj.fromLonLat([lon2, lat1]);
    var extent = ol.extent.boundingExtent([bl, tr])
    var width_m = extent[2] - extent[0]
    var resolution = width_m / screen_width;

    gdo.net.app.SigmaGraph.map.getView().setCenter(
        ol.proj.fromLonLat([(lon1 + lon2) / 2, (lat1 + lat2) / 2]));
    gdo.net.app.SigmaGraph.map.getView().setResolution(resolution);
}


gdo.net.app["SigmaGraph"].mapAutozoom = async function () {
    gdo.net.app.SigmaGraph.mapRescaleVertices();
    gdo.net.app.SigmaGraph.mapRescale();
}


gdo.net.app["SigmaGraph"].mapRescale = async function () {
    gdo.net.app.SigmaGraph.mapSetZoom(gdo.xCentroid - gdo.xWidth / 2, -gdo.yCentroid - gdo.yWidth / 2,
        gdo.xCentroid + gdo.xWidth / 2, -gdo.yCentroid + gdo.yWidth / 2);
}


gdo.net.app["SigmaGraph"].mapRescaleVertices = async function () {
    var xScale = $(gdo.net.app.SigmaGraph.map_box).width() / gdo.xWidth;
    var yScale = $(gdo.net.app.SigmaGraph.map_box).height() / gdo.yWidth;

    if (xScale > yScale) {
        gdo.net.app.SigmaGraph.zoomX(gdo.graphXCentroid, yScale / xScale);
    } else {
        gdo.net.app.SigmaGraph.zoomY(gdo.graphYCentroid, xScale / yScale);
    }
    gdo.net.app.SigmaGraph.renderGraph();
}