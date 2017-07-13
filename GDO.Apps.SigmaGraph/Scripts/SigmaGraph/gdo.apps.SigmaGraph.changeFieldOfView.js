/**
 * Functions relating to changing the part of the graph being
 * rendered on each screen.
 */

/**
 * Changes the field of view to the field of view after zooming in on
 * the point (zoomXCenter, zoomYCenter) at a factor of ratio. Then renders
 * the graph with the updated field of view.
 * @param {} zoomXCenter the x coordinate of the zoom center in server coordinates
 * @param {} zoomYCenter the y coordinate of the zoom center in server coordinates
 * @param {} ratio the ratio at which to zoom
 */
gdo.net.app["SigmaGraph"].zoom = function (zoomXCenter, zoomYCenter, ratio) {
    gdo.xCentroid = zoomXCenter + (gdo.xCentroid - zoomXCenter) / ratio;
    gdo.yCentroid = zoomYCenter + (gdo.yCentroid - zoomYCenter) / ratio;
    gdo.xWidth /= ratio;
    gdo.yWidth /= ratio;
    gdo.net.app["SigmaGraph"].renderGraph();
}

/**
 * Changes the field of view to the field of view after panning
 * xShift to the right and yShift down. Then renders the graph with the
 * updated field of view.
 * @param {} xShift the amount to shift right in server coordinates
 * @param {} yShift the amount to shift down in server coordinates
 */
gdo.net.app["SigmaGraph"].pan = function (xShift, yShift) {
    gdo.xCentroid = gdo.xCentroid - xShift;
    gdo.yCentroid = gdo.yCentroid + yShift;
    gdo.net.app["SigmaGraph"].renderGraph();
}
