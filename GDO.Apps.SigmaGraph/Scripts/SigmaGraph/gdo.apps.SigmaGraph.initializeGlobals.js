/**
 * Initialize global static constants, instance constants,
 * and instance variables.
 */

// Initialize global static constants.
gdo.epsilon = 1E-6;
gdo.basePath = "\\Web\\SigmaGraph\\graphmls\\"; 

/**
 * Initialize global constants of this rendering instance.
 */
gdo.net.app["SigmaGraph"].initInstanceGlobalConstants = function () {
    console.log('Initializing instance global constants');
    gdo.controlId = gdo.net.node[gdo.clientId].appInstanceId;
    gdo.nodeRow = gdo.net.node[gdo.clientId].sectionRow;
    gdo.nodeCol = gdo.net.node[gdo.clientId].sectionCol;
    gdo.numRows = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].rows;
    gdo.numCols = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].cols;
    gdo.graphContainer = window.frames['app_frame'].children[0]
        .contentDocument.getElementById('graphArea');
    gdo.loader = window.frames['app_frame'].children[0]
        .contentDocument.getElementById('loaderContainer');
    const positionInfo = gdo.graphContainer.getBoundingClientRect();
    gdo.canvasHeightInPx = positionInfo.height / 2;
    gdo.canvasWidthInPx = positionInfo.width / 2;
    gdo.sigmaInstance = new sigma({
        renderers: [
            {
                type: 'webgl',
                container: gdo.graphContainer
            }
        ],
        settings: {
            autoRescale: false,
            clone: false
        }
    });
    gdo.sigmaInstance.renderers[0].bind('render',
        function (e) {
            console.log('Time to render: ' + (window.performance.now() - gdo.stopWatch));
            gdo.stopWatch = window.performance.now();
        });
    gdo.numParseWorkers = 2;
    gdo.parseWorkers = [...Array(gdo.numParseWorkers)].map(function () {
        return new Worker("../Scripts/SigmaGraph/parseWorker.js");
    });
    gdo.parallelParse = false;
}

/**
 * Initialize global variables of this rendering instance.
 *
 * Parameters of width, centroid are for the whole graph, not current node
 * Need to calculate relevant parameters for current node
 */
gdo.net.app["SigmaGraph"].initInstanceGlobalVariables = function (xWidth, yWidth, xCentroid, yCentroid) {
    console.log('Initializing instance global variables');
    gdo.graphXCentroid = xCentroid;
    gdo.graphYCentroid = yCentroid;
    gdo.xWidth = xWidth / gdo.numCols;
    gdo.yWidth = yWidth / gdo.numRows;
    gdo.xCentroid = gdo.xWidth * gdo.nodeCol + gdo.xWidth / 2 + xCentroid - xWidth / 2;
    gdo.yCentroid = gdo.yWidth * gdo.nodeRow + gdo.yWidth / 2 + yCentroid - yWidth / 2;
    gdo.xRatio = 1;
    gdo.yRatio = 1;
    gdo.xTotalShift = 0;
    gdo.yTotalShift = 0;
    gdo.sigmaInstance.graph.clear();
    gdo.net.app.SigmaGraph.map = null;
}