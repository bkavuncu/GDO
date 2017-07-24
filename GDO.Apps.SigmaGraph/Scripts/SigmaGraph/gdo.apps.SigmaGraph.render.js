﻿/**
* Functions for rendering the graph with sigma.js
*/

// Initialize global static constants.
gdo.epsilon = 1E-6;
gdo.basePath = "\\Web\\SigmaGraph\\graphmls\\";// todo note that you will NOT be able to reply upon this. 

/**
 * Initialize global constants of this rendering instance.
 */
gdo.net.app["SigmaGraph"].initInstanceGlobalConstants = function() {
    console.log('Initializing instance global constants');
    gdo.controlId = gdo.net.node[gdo.clientId].appInstanceId;
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
        function(e) {
            console.log('Time to render: ' + (window.performance.now() - gdo.stopWatch));
        });
    gdo.numParseWorkers = 2;
    gdo.parseWorkers = [...Array(gdo.numParseWorkers)].map(function() {
        return new Worker("../Scripts/SigmaGraph/parseWorker.js");
    });
    gdo.parallelParse = false;
}

/**
 * Initialize global variables of this rendering instance.
 */
gdo.net.app["SigmaGraph"].initInstanceGlobalVariables = function () {
    console.log('Initializing instance global variables');
    gdo.xWidth = 1 / gdo.numCols;
    gdo.yWidth = 1 / gdo.numRows;
    gdo.xCentroid = gdo.xWidth * gdo.nodeCol + gdo.xWidth / 2;
    gdo.yCentroid = gdo.yWidth * gdo.nodeRow + gdo.yWidth / 2;
    gdo.totalRatio = 1;
    gdo.xTotalShift = 0;
    gdo.yTotalShift = 0;
    gdo.sigmaInstance.graph.clear();
}

/**
 * Renders the graph.
 */
gdo.net.app["SigmaGraph"].renderGraph = async function () {//todo note this is an experimental feature
    console.log('Rendering graph...');
    // Get location of files containing objects to render.
    gdo.stopWatch = window.performance.now();
    const filePaths = await getFilesWithin();
    console.log('Time to get graph object file paths: ' + (window.performance.now() - gdo.stopWatch));

    // Get the nodes and edges
    gdo.stopWatch = window.performance.now();
    let filesGraphObjects = await parseFilesToGraphObjects(filePaths);
    console.log('Time to download and parse graph object files: ' + (window.performance.now() - gdo.stopWatch));
    gdo.stopWatch = window.performance.now();
    filesGraphObjects = filesGraphObjects.reduce((a, b) => a.concat(b), []);
    console.log('Time to combine web worker results: ' + (window.performance.now() - gdo.stopWatch));

    // Clear the sigma graph
    gdo.sigmaInstance.graph.clear();

    // Filter and add the nodes and edges to the graph
    filesGraphObjects.forEach(function (fileGraphObjects) {
        gdo.stopWatch = window.performance.now();
        const fileNodesInFOV = fileGraphObjects.nodes;
        fileNodesInFOV.forEach(node => {
            node.x = node.pos.x;
            node.y = node.pos.y;
            node.color = node.color || "#00f";
            node.size = node.size || 3;
        });
        console.log('Time to convert nodes into sigma nodes: ' + (window.performance.now() - gdo.stopWatch));
        gdo.stopWatch = window.performance.now();
        fileNodesInFOV.forEach(node => {
            try {
                gdo.sigmaInstance.graph.addNode(node);
            } catch (err) {}
        });
        console.log('Time to add nodes to sigma graph: ' + (window.performance.now() - gdo.stopWatch));

        gdo.stopWatch = window.performance.now();
        let fileEdgesInFOV = fileGraphObjects.edges;
        fileEdgesInFOV.forEach(edge => {
            edge.id = edge.source + " to " + edge.target;
            edge.color = edge.color || "#f00";
        });
        console.log('Time to convert edges into sigma edges: ' + (window.performance.now() - gdo.stopWatch));
        gdo.stopWatch = window.performance.now();
        fileEdgesInFOV.forEach(edge => {
            try {
                gdo.sigmaInstance.graph.addEdge(edge);
            } catch (err) {}
        });
        console.log('Time to add edges to sigma graph: ' + (window.performance.now() - gdo.stopWatch));

        gdo.stopWatch = window.performance.now();
        gdo.sigmaInstance.graph.nodes().forEach(node => {
            if (!node.converted) {
                convertServerCoordsToSigmaCoords(node);
                node.converted = true;
            }
        });
        console.log('Time to convert node coordinates: ' + (window.performance.now() - gdo.stopWatch));
    });

    addDebugGrid();
    // Render the new graph
    gdo.stopWatch = window.performance.now();
    gdo.sigmaInstance.refresh({ skipIndexation: false });
}

/**
 * Returns a list of locations of JSON files which contain graph objects
 * in this field of view.
 */
async function getFilesWithin() {
    const filePaths = await new Promise((resolve, reject) => {
        gdo.net.app["SigmaGraph"].server.getFilesWithin(gdo.controlId, gdo.xCentroid, gdo.yCentroid, gdo.xWidth, gdo.yWidth)
            .done(function(filePaths) {
                resolve(filePaths);
            });
    });
    return filePaths.map((filePath) => "../../" + filePath);
}

async function getLeafBoxes() {
    const boxes = await new Promise((resolve, reject) => {
        gdo.net.app["SigmaGraph"].server.getLeafBoxes(gdo.controlId, gdo.xCentroid, gdo.yCentroid, gdo.xWidth, gdo.yWidth)
            .done(function (boxes) {
                resolve(boxes);
            });
    });
    return boxes;
}

/**
 * Returns a promise that resolves with the graph objects contained
 * in the files pointed to by filePaths.
 * @param {any} filePaths
 * @return the promise
 */
function parseFilesToGraphObjects(filePaths) {
    if (gdo.parallelParse) {
        const filePathsSplit = [...Array(gdo.numParseWorkers)].map(() => []);
        filePaths.forEach(function(filePath, index) {
            index = index % gdo.numParseWorkers;
            filePathsSplit[index].push(filePath);
        });

        gdo.parseWorkers.forEach(function(worker, index) {
            worker.postMessage(filePathsSplit[index]);
        });

        return Promise.all(gdo.parseWorkers.map(function(worker) {
            return new Promise(function(resolve, reject) {
                const startTime = window.performance.now();
                worker.onmessage = function(e) {
                        const filesGraphObjects = e.data;
                        console.log('Time to resolve worker promise: ' + (window.performance.now() - startTime));
                        resolve(filesGraphObjects);
                };
            });
        }));
    } else {
        return Promise.all(filePaths.map(function(filePath) {
            return httpGet(filePath).then((jsonString)=> JSON.parse(jsonString));
        }));
    }
}

/**
* Returns a promise that fullfulls with the file contents of the
* file pointed to be filePath.
* @param {any} filePath the location of the file
*/
function httpGet(filePath) {
    // TODO handle errors
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", filePath, true);
        xhr.onload = function () {
            if (this.status === 200) {
                resolve(this.response);
            }
        };
        xhr.send();
    });
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
    let count = 0;
    [...Array(11).keys()].forEach(function (x) {
        x /= 10;
        [...Array(11).keys()].forEach(function(y) {
            y /= 10;
            count += 1;
            const gridNode = { id: "debug" + count, x: x, y: y, color: "#00f", size: 4 };
            convertServerCoordsToSigmaCoords(gridNode);
            gdo.sigmaInstance.graph.addNode(gridNode);
        });
    });
}

/**
 * Show a box for each leaf of the quad tree being rendered.
 * For debugging purposes.
 */
function addLeafBoxes() {
    let leafBoxes = await getLeafBoxes();
    leafBoxes = leafBoxes.map(function (leafBox) {
        return eval('({' + leafBox + '})');
    });
    leafBoxes.forEach((leafBox, index) => {
        const upperLeft = {
            id: "debugUpperLeft - " + index,
            x: leafBox.xCentroid - leafBox.xWidth / 2,
            y: leafBox.yCentroid - leafBox.yWidth / 2,
            color: "#0f0"
        };
        const upperRight = {
            id: "debugUpperRight - " + index,
            x: leafBox.xCentroid + leafBox.xWidth / 2,
            y: leafBox.yCentroid - leafBox.yWidth / 2,
            color: "#0f0"
        };
        const lowerLeft = {
            id: "debugLowerLeft - " + index,
            x: leafBox.xCentroid - leafBox.xWidth / 2,
            y: leafBox.yCentroid + leafBox.yWidth / 2,
            color: "#0f0"
        };
        const lowerRight = {
            id: "debugLowerRight - " + index,
            x: leafBox.xCentroid + leafBox.xWidth / 2,
            y: leafBox.yCentroid + leafBox.yWidth / 2,
            color: "#0f0"
        };
        convertServerCoordsToSigmaCoords(upperLeft);
        convertServerCoordsToSigmaCoords(upperRight);
        convertServerCoordsToSigmaCoords(lowerLeft);
        convertServerCoordsToSigmaCoords(lowerRight);
        gdo.sigmaInstance.graph
            .addNode(upperLeft)
            .addNode(upperRight)
            .addNode(lowerLeft)
            .addNode(lowerRight)
            .addEdge({ id: "debugE1 - " + index, source: upperLeft.id, target: upperRight.id, color: "#0f0", size: 20 })
            .addEdge({ id: "debugE2 - " + index, source: upperRight.id, target: lowerRight.id, color: "#0f0", size: 20 })
            .addEdge({ id: "debugE3 - " + index, source: lowerRight.id, target: lowerLeft.id, color: "#0f0", size: 20 })
            .addEdge({ id: "debugE4 - " + index, source: lowerLeft.id, target: upperLeft.id, color: "#0f0", size: 20 })
            .addEdge({ id: "debugE5 - " + index, source: lowerLeft.id, target: upperRight.id, color: "#0f0", size: 20 })
            .addEdge({ id: "debugE6 - " + index, source: upperLeft.id, target: lowerRight.id, color: "#0f0", size: 20 });
    });
}