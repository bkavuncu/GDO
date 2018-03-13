/**
 * Functions relating to changing the part of the graph being
 * rendered on each screen.
 * TODO do some refactoring/commenting to make clear how the control/server/sigma coordinates interact
 */

/**
 * Changes the field of view to the field of view after zooming in on
 * the point (zoomXCenter, zoomYCenter) at a factor of ratio. Then renders
 * the graph with the updated field of view.
 * @param {} zoomXCenter the x coordinate of the zoom center in control coordinates
 * @param {} zoomYCenter the y coordinate of the zoom center in control coordinates
 * @param {} ratio the ratio at which to zoom
 */
gdo.net.app["SigmaGraph"].zoom = function (zoomXCenter, zoomYCenter, ratio) {
    gdo.net.app["SigmaGraph"].zoomX(zoomXCenter, ratio);
    gdo.net.app["SigmaGraph"].zoomY(zoomYCenter, ratio);
    gdo.net.app["SigmaGraph"].renderGraph();
    gdo.net.app["SigmaGraph"].redofiltering();

    //not sure about how this work
    //gdo.net.app["SigmaGraph"].mapRescale();
    
    
}

gdo.net.app["SigmaGraph"].zoomX = function (zoomXCenter, ratio) {
    zoomXCenter = zoomXCenter / gdo.xRatio + gdo.xTotalShift;
    gdo.xCentroid = zoomXCenter + (gdo.xCentroid - zoomXCenter) / ratio;
    gdo.xWidth /= ratio;

    gdo.xRatio *= ratio;
    gdo.xTotalShift = gdo.xTotalShift / ratio + zoomXCenter * (ratio - 1) / ratio;
}

gdo.net.app["SigmaGraph"].zoomY = function (zoomYCenter, ratio) {
    zoomYCenter = zoomYCenter / gdo.yRatio + gdo.yTotalShift;
    gdo.yCentroid = zoomYCenter + (gdo.yCentroid - zoomYCenter) / ratio;
    gdo.yWidth /= ratio;

    gdo.yRatio *= ratio;
    gdo.yTotalShift = gdo.yTotalShift / ratio + zoomYCenter * (ratio - 1) / ratio;
}

/**
 * Changes the field of view to the field of view after panning
 * xShift to the right and yShift down. Then renders the graph with the
 * updated field of view.
 * @param {} xShift the amount to shift right in control displacements
 * @param {} yShift the amount to shift down in control displacements
 */
gdo.net.app["SigmaGraph"].pan = function (xShift, yShift) {
    gdo.xCentroid -= xShift / gdo.xRatio;
    gdo.yCentroid -= yShift / gdo.yRatio;

    gdo.xTotalShift -= xShift / gdo.xRatio;
    gdo.yTotalShift -= yShift / gdo.yRatio;
    gdo.net.app["SigmaGraph"].renderGraph();
}


gdo.net.app["SigmaGraph"].redofiltering = function () {
    var filters = gdo.net.app["SigmaGraph"].filterlist;
    var type, attr;
    for (i = 0; i < filters.length; i++) {
        type = filters[i].key;
        attr = filters[i].value;
        switch (type) {
            case "f":
                gdo.net.app["SigmaGraph"].filterGraph(attr)
                break;
            case "cv":
                gdo.net.app["SigmaGraph"].colorByValue(attr)
                break;
            case "cf":
                gdo.net.app["SigmaGraph"].colorByFilter(attr)
                break;
            case "vn":
                gdo.net.app["SigmaGraph"].nameVertices(attr)
                break;
        }
    }
}