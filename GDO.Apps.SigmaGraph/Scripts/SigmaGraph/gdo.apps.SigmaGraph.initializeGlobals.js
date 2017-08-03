/**
 * Initialize global static constants, instance constants,
 * and instance variables.
 */

// Initialize global static constants.
gdo.epsilon = 1E-6;
gdo.basePath = "\\Web\\SigmaGraph\\graphmls\\";// todo note that you will NOT be able to reply upon this. 

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
    gdo.xWidth = 1 / gdo.numCols;
    gdo.yWidth = 1 / gdo.numRows;
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
            autoRescale: false
        }
    });
    gdo.sigmaInstance.renderers[0].bind('render',
        function (e) {
            console.log('Time to render: ' + (window.performance.now() - gdo.stopWatch));
        });
    gdo.numParseWorkers = 2;
    gdo.parseWorkers = [...Array(gdo.numParseWorkers)].map(function () {
        return new Worker("../Scripts/SigmaGraph/parseWorker.js");
    });
    gdo.parallelParse = false;
}

/**
 * Initialize global variables of this rendering instance.
 */
gdo.net.app["SigmaGraph"].initInstanceGlobalVariables = function () {
    console.log('Initializing instance global variables');
    gdo.xCentroid = gdo.xWidth * gdo.nodeCol + gdo.xWidth / 2;
    gdo.yCentroid = gdo.yWidth * gdo.nodeRow + gdo.yWidth / 2;
    gdo.totalRatio = 1;
    gdo.xTotalShift = 0;
    gdo.yTotalShift = 0;
    gdo.sigmaInstance.graph.clear();
}