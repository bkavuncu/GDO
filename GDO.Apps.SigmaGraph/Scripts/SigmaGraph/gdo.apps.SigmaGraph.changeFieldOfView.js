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
    zoomXCenter = zoomXCenter / gdo.totalRatio + gdo.xTotalShift;
    zoomYCenter = zoomYCenter / gdo.totalRatio + gdo.yTotalShift;

    gdo.xCentroid = zoomXCenter + (gdo.xCentroid - zoomXCenter) / ratio;
    gdo.yCentroid = zoomYCenter + (gdo.yCentroid - zoomYCenter) / ratio;
    gdo.xWidth /= ratio;
    gdo.yWidth /= ratio;

    gdo.totalRatio *= ratio;
    gdo.xTotalShift = gdo.xTotalShift/ratio + zoomXCenter * (ratio - 1) / ratio;
    gdo.yTotalShift = gdo.yTotalShift/ratio + zoomYCenter * (ratio - 1) / ratio;
    gdo.net.app["SigmaGraph"].renderGraph();
}

/**
 * Changes the field of view to the field of view after panning
 * xShift to the right and yShift down. Then renders the graph with the
 * updated field of view.
 * @param {} xShift the amount to shift right in control displacements
 * @param {} yShift the amount to shift down in control displacements
 */
gdo.net.app["SigmaGraph"].pan = function (xShift, yShift) {
    gdo.xCentroid -= xShift / gdo.totalRatio;
    gdo.yCentroid -= yShift / gdo.totalRatio;

    gdo.xTotalShift -= xShift / gdo.totalRatio;
    gdo.yTotalShift -= yShift / gdo.totalRatio;
    gdo.net.app["SigmaGraph"].renderGraph();
}
