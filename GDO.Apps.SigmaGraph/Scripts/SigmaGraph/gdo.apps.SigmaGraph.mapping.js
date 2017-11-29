/**
 * For displaying a map underlay on SigmaGraph
 *
 * I'm not sure how this performs at very large latitudes. Sorry!
 */

/* Show the map */

gdo.net.app.SigmaGraph.showMap = async function () {
    gdo.net.app.SigmaGraph.map_box.style.visibility = "visible";
}

/* Hide the map */
gdo.net.app.SigmaGraph.hideMap = async function () {
    gdo.net.app.SigmaGraph.map_box.style.visibility = "hidden";
}

gdo.net.app["SigmaGraph"].initMap = async function () {
    var ol = gdo.net.app.SigmaGraph.openLayers;

    var map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
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
 * Function adapted from Moveable Type under CC license
 * http://www.movable-type.co.uk/scripts/latlong.html
 */
width_metres = function (lon1, lon2, lat) {
    var R = 6371 * 1000;
    var dLon = (lon2 - lon1).toRad();
    var a = Math.cos(lat.toRad()) * Math.cos(lat.toRad()) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}
Number.prototype.toRad = function () {
    return this * Math.PI / 180;
}

/**
 * Zooms map based on top left and bottom right lon, lat
 * Height zoom will be automatic.
 *
 * TODO: make this work for multiple screens
 */
gdo.net.app["SigmaGraph"].setZoom = async function (lon1, lat1, lon2, lat2) {
    var ol = gdo.net.app.SigmaGraph.openLayers;
    var screen_width = $(gdo.net.app.SigmaGraph.map_box).width();
    var width_m = width_metres(lon1, lon2, lat2);
    var resolution = width_m / screen_width;

    gdo.net.app.SigmaGraph.map.getView().setCenter(ol.proj.fromLonLat([(lon1 + lon2) / 2, (lat1 + lat2) / 2]))
    gdo.net.app.SigmaGraph.map.getView().setResolution(resolution);
}