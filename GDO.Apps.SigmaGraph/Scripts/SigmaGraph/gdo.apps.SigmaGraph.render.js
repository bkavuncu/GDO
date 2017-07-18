﻿/**
* Functions for rendering the graph with sigma.js
*/

// Initialize global static constants.
gdo.epsilon = 1E-9;
gdo.basePath = "\\Web\\SigmaGraph\\graphmls\\";// todo note that you will NOT be able to reply upon this. 

/**
 * Initialize global constants and variables of this rendering
 * instance.
 */
gdo.net.app["SigmaGraph"].initInstanceGlobals = function () {
    gdo.consoleOut('.SIGMAGRAPHRENDERER', 1, 'Initializing instance globals');
    // Node global constants.
    gdo.nodeRow = gdo.net.node[gdo.clientId].sectionRow;
    gdo.nodeCol = gdo.net.node[gdo.clientId].sectionCol;
    gdo.numRows = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].rows;
    gdo.numCols = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].cols;
    gdo.graphContainer = window.frames['app_frame'].children[0]
        .contentDocument.getElementById('graphArea');
    const positionInfo = gdo.graphContainer.getBoundingClientRect();
    gdo.canvasHeightInPx = positionInfo.height / 2;
    gdo.canvasWidthInPx = positionInfo.width / 2;
    gdo.sigmaInstance = new sigma({
        renderers: [{
            type: 'webgl',
            container: gdo.graphContainer
        }],
        settings: {
            autoRescale: false
        }
    });
    gdo.sigmaInstance.renderers[0].bind('render', function(e) {
        gdo.consoleOut('.RENDERER', 1, 'Time to render: ' + (window.performance.now() - gdo.stopWatch));
    });
    gdo.numParseWorkers = 2;
    gdo.parseWorkers = [...Array(gdo.numParseWorkers)].map(function() {
        return new Worker("../Scripts/SigmaGraph/parseWorker.js");
    });

    // Node global variables.
    gdo.xWidth = 1 / gdo.numCols;
    gdo.yWidth = 1 / gdo.numRows;
    gdo.xCentroid = gdo.xWidth * gdo.nodeCol + gdo.xWidth / 2;
    gdo.yCentroid = gdo.yWidth * gdo.nodeRow + gdo.yWidth / 2;
    gdo.totalRatio = 1;
    gdo.xTotalShift = 0;
    gdo.yTotalShift = 0;
};

/**
 * Renders the graph.
 */
gdo.net.app["SigmaGraph"].renderGraph = async function () {//todo note this is an experimental feature
    gdo.consoleOut('.SIGMAGRAPHRENDERER', 1, 'Rendering graph...');
    // Get location of files containing objects to render.
    gdo.stopWatch = window.performance.now();
    //const fileNames = gdo.net.app["SigmaGraph"].server.getFilesWithin(xCentroid, yCentroid, xWidth, yWidth);
    const filePaths = [gdo.basePath + 'marvel_heroes.graphml', gdo.basePath + 'marvel_heroes.graphml'];
    gdo.consoleOut('.RENDERER', 1, 'Time to get graph object file paths: ' + (window.performance.now() - gdo.stopWatch));

    // Get the nodes and edges
    let filesGraphObjects = await parseFilesToGraphObjects(filePaths);
    filesGraphObjects = filesGraphObjects.reduce((a, b) => a.concat(b), []);
    gdo.consoleOut('.RENDERER', 1, 'Time to download and parse graph object files: ' + (window.performance.now() - gdo.stopWatch));

    // Clear the sigma graph
    gdo.sigmaInstance.graph.clear();

    // Filter and add the nodes and edges to the graph
    filesGraphObjects.forEach(function (fileGraphObjects) {
        gdo.stopWatch = window.performance.now();
        const fileNodesInFOV = fileGraphObjects.nodes;
        fileNodesInFOV.forEach(node => {
            node.id = node._id;
            node.x = node._attributes.x;
            node.y = node._attributes.y;
            node.color = node._attributes.color || "#f00";
            node.size = node._attributes.size || 3;
        });
        gdo.consoleOut('.RENDERER', 1, 'Time to convert nodes into sigma nodes: ' + (window.performance.now() - gdo.stopWatch));
        gdo.stopWatch = window.performance.now();
        fileNodesInFOV.forEach(node => {
            try {
                gdo.sigmaInstance.graph.addNode(node);
            } catch (err) {}
        });
        gdo.consoleOut('.RENDERER', 1, 'Time to add nodes to sigma graph: ' + (window.performance.now() - gdo.stopWatch));

        gdo.stopWatch = window.performance.now();
        let fileEdgesInFOV = fileGraphObjects.edges;
        fileEdgesInFOV.forEach(edge => {
            edge.id = edge._id;
            edge.source = edge._source;
            edge.target = edge._target;
        });
        fileEdgesInFOV = fileEdgesInFOV.filter(edgeIsWithinFOV);
        gdo.consoleOut('.RENDERER', 1, 'Time to filter edges: ' + (window.performance.now() - gdo.stopWatch));
        gdo.stopWatch = window.performance.now();
        fileEdgesInFOV.forEach(edge => {
            try {
                gdo.sigmaInstance.graph.addEdge(edge);
            } catch (err) {}
        });
        gdo.consoleOut('.RENDERER', 1, 'Time to add edges to sigma graph: ' + (window.performance.now() - gdo.stopWatch));

        gdo.stopWatch = window.performance.now();
        gdo.sigmaInstance.graph.nodes().forEach(node => {
            //if (gdo.sigmaInstance.graph.degree(node.id) === 0) {
            //    gdo.sigmaInstance.graph.dropNode(node.id);
            //} else {
                convertServerCoordsToSigmaCoords(node);
            //}
        });
        gdo.consoleOut('.RENDERER', 1, 'Time to filter and convert node coordinates: ' + (window.performance.now() - gdo.stopWatch));
    });

    addDebugGrid();
    // Render the new graph
    gdo.stopWatch = window.performance.now();
    gdo.sigmaInstance.refresh({ skipIndexation: true });
};

/**
 * Returns a promise that resolves with the graph objects contained
 * in the files pointed to by filePaths.
 * @param {any} filePaths
 * @return the promise
 */
function parseFilesToGraphObjects(filePaths) {
    const filePathsSplit = [...Array(gdo.numParseWorkers)].map(() => []);
    filePaths.forEach(function(filePath, index) {
        index = index % gdo.numParseWorkers;
        filePathsSplit[index].push(filePath);
    });

    gdo.parseWorkers.forEach(function (worker, index) {
        worker.postMessage(filePathsSplit[index]);
    });

    return Promise.all(gdo.parseWorkers.map(function (worker) {
        return new Promise(function (resolve, reject) {
            worker.addEventListener('message',
                function (e) {
                    const filesGraphObjects = e.data;
                    resolve(filesGraphObjects);
                });
        });
    }));
}

/**
 * Determines whether or not the node is in this field of view.
 * @param {any} node
 * @return true if the node is in this field of view and false
 *          otherwise
 */
function nodeIsWithinFOV(node) {
    const xMin = gdo.xCentroid - gdo.xWidth / 2;
    const xMax = gdo.xCentroid + gdo.xWidth / 2;
    const yMin = gdo.yCentroid - gdo.yWidth / 2;
    const yMax = gdo.yCentroid + gdo.yWidth / 2;
    return node.X >= xMin && node.X <= xMax
        && node.Y >= yMin && node.Y <= yMax;
}

/**
 * Determines whether or not the edge is in the field of view.
 * @param {any} edge
 * @return true if the edge is in the field of view and false
 *          otherwise
 */
function edgeIsWithinFOV(edge) {
    const xMin = gdo.xCentroid - gdo.xWidth / 2;
    const xMax = gdo.xCentroid + gdo.xWidth / 2;
    const yMin = gdo.yCentroid - gdo.yWidth / 2;
    const yMax = gdo.yCentroid + gdo.yWidth / 2;

    const xSource = gdo.sigmaInstance.graph.nodes(edge.source).x;
    const ySource = gdo.sigmaInstance.graph.nodes(edge.source).y;
    const xTarget = gdo.sigmaInstance.graph.nodes(edge.target).x;
    const yTarget = gdo.sigmaInstance.graph.nodes(edge.target).y;

    const fovContainsWholeLink = xSource >= xMin && xTarget >= xMin
                                && xSource <= xMax && xTarget <= xMax
                                && ySource >= yMin && yTarget >= yMin
                                && ySource <= yMax && yTarget <= yMax;

    return fovContainsWholeLink
        || intersectsHorizontalSegment(edge, yMax, xMin, xMax)
        || intersectsHorizontalSegment(edge, yMin, xMin, xMax)
        || intersectsVerticalSegment(edge, xMin, yMin, yMax)
        || intersectsVerticalSegment(edge, xMax, yMin, yMax);
}

/**
 * Determines whether or not the edge intersects the horizontal
 * line segment between (xMin, y) and (xMax, y).
 * @param {any} edge
 * @param {any} y
 * @param {any} xMin
 * @param {any} xMax
 */
function intersectsHorizontalSegment(edge, y, xMin, xMax) {
    const xSource = gdo.sigmaInstance.graph.nodes(edge.source).x;
    const ySource = gdo.sigmaInstance.graph.nodes(edge.source).y;
    const xTarget = gdo.sigmaInstance.graph.nodes(edge.target).x;
    const yTarget = gdo.sigmaInstance.graph.nodes(edge.target).y;

    if (Math.abs(xTarget - xSource) <= gdo.epsilon) {
        return xSource >= xMin && xSource <= xMax;
    }
    // The lines intersect at (x = 1/m (y-y_o) + x_0, y = y)
    const slope = (yTarget - ySource) / (xTarget - ySource);
    const xIntersect = 1 / slope * (y - ySource) + xSource;
    return xIntersect >= xMin && xIntersect <= xMax;
}

/**
 * Determines whether or not the edge intersects the vertical
 * line segment between (x, yMin) and (x, yMax).
 * @param {any} edge
 * @param {any} x
 * @param {any} yMin
 * @param {any} yMax
 */
function intersectsVerticalSegment(edge, x, yMin, yMax) {
    const xSource = gdo.sigmaInstance.graph.nodes(edge.source).x;
    const ySource = gdo.sigmaInstance.graph.nodes(edge.source).y;
    const xTarget = gdo.sigmaInstance.graph.nodes(edge.target).x;
    const yTarget = gdo.sigmaInstance.graph.nodes(edge.target).y;

    if (Math.abs(xTarget - xSource) <= gdo.epsilon) {
        return Math.abs(xSource - x) <= gdo.epsilon;
    }
    // The lines intersect at (x = x, y = m(x-x_0) + y_0)
    const slope = (yTarget - ySource) / (xTarget - xSource);
    const yIntersect = slope * (x - xSource) + ySource;
    return yIntersect >= yMin && yIntersect <= yMax;
}

/**
 * Converts the node in the server coordinate system to the same
 * node in the sigma coordinate system. Mutates the given node.
 * @param {any} node the node in the server coordinate system
 * @return the node in the sigma coordinate system
 */
function convertServerCoordsToSigmaCoords(node) {
    node.x = (node.x - gdo.xCentroid) * gdo.canvasWidthInPx * 1 / (gdo.xWidth / 2);
    node.y = -(-node.y + gdo.yCentroid) * gdo.canvasHeightInPx * 1 / (gdo.yWidth / 2);
}

/**
 * Adds nodes to the sigma graph arranged as a rectangular grid.
 * For debugging purposes.
 */
function addDebugGrid() {
    let count = 100;
    [...Array(11).keys()].forEach(function (x) {
        x /= 10;
        [...Array(11).keys()].forEach(function(y) {
            y /= 10;
            count += 1;
            const gridNode = { id: "n" + count, x: x, y: y, color: "#00f", size: 4 };
            convertServerCoordsToSigmaCoords(gridNode);
            gdo.sigmaInstance.graph.addNode(gridNode);
        });
    });
}