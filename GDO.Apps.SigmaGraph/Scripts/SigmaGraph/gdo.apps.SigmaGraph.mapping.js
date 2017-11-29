/**
 * For displaying a map underlay on SigmaGraph
 */

/* Show the map */
gdo.net.app.SigmaGraph.showMap = async function () {
    gdo.net.app.SigmaGraph.map.style.visibility = "visible";
}

/* Hide the map */
gdo.net.app.SigmaGraph.hideMap = async function () {
    gdo.net.app.SigmaGraph.map.style.visibility = "hidden";
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
            center: ol.proj.fromLonLat([37.41, 8.82]),
            zoom: 4
        })
    });
}