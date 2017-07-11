/**
* Functions for rendering the graph with sigma.js
*/

gdo.epsilon = 1E-6;
gdo.basePath = "\\Web\\SigmaGraph\\graphmls\\";

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

    // Node global variables.
    gdo.xWidth = 1 / gdo.numCols;
    gdo.yWidth = 1 / gdo.numRows;
    gdo.xCentroid = gdo.xWidth * gdo.nodeCol + gdo.xWidth / 2;
    gdo.yCentroid = gdo.yWidth * gdo.nodeRow + gdo.yWidth / 2;
}

/**
 * Renders the graph.
 */
gdo.net.app["SigmaGraph"].renderGraph = async function () {
    gdo.consoleOut('.SIGMAGRAPHRENDERER', 1, 'Rendering graph...');
    // Get location of files containing objects to render.
    //const fileNames = gdo.net.app["SigmaGraph"].server.getFilesWithin(xCentroid, yCentroid, xWidth, yWidth);
    const filePaths = [gdo.basePath + 'oneDiagonalEdge.graphml'];

    // Get the nodes and edges
    const filesGraphObjects = await Promise.all(filePaths.map(function(filePath) {
        return httpGet(filePath).then(parseGraphML);
    }));

    // Clear the sigma graph
    gdo.sigmaInstance.graph.clear();

    // Filter and add the nodes and edges to the graph
    filesGraphObjects.forEach(function (fileGraphObjects) {
        const fileNodesInFOV = fileGraphObjects.nodes
            .map(function(node) {
                return {
                    id: node.id,
                    x: node._attributes.x,
                    y: node._attributes.y,
                    color: node._attributes.label
                }
            })
            .map(convertServerCoordsToSigmaCoords);    // TODO .filter(nodeIsWithinFOV)
        const fileEdgesInFOV = fileGraphObjects.edges; // TODO .filter(edgeIsWithinFOV);

        fileNodesInFOV.forEach(node => {
            gdo.sigmaInstance.graph.addNode(node);
        });
        fileEdgesInFOV.forEach(edge => {
            gdo.sigmaInstance.graph.addEdge(edge);
        });
    });

    // Render the new graph
    gdo.sigmaInstance.refresh();
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
        xhr.onload = function() {
            if (this.status === 200) {
                resolve(this.response);
            }
        }
        xhr.send();
    });
}

/**
 * Returns a promise that fulfulls with a javascript object
 * representation of the contents of graphMLText.
 * @param {any} graphMLText the contents of a graphml file
 */
function parseGraphML(graphMLText) {
    return new Promise(function (resolve, reject) {
        const parser = new gdo.graphml.GraphMLParser();
        parser.parse(graphMLText, function(err, graph) {
            if (err !== null) return reject(err);
            resolve(graph);
        });
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

    const fovContainsWholeLink = edge.source.x >= xMin && edge.target.x >= xMin
                                && edge.source.x <= xMax && edge.target.x <= xMax
                                && edge.source.y >= yMin && edge.target.y >= yMin
                                && edge.source.y <= yMax && edge.target.y <= yMax;

    return fovContainsWholeLink
        || intersectsHorizontalSegment(edge, yMax, xMin, xMax)
        || intersectsHorizontalSegment(edge, yMin, xMin, xMax)
        || intersectsVerticalSegment(edge, xMin, yMin, yMax)
        || intersectsVerticalSegment(edge, xMax, yMin, yMax);
}

/**
 * Determines whether or not the edge intersects the horizontal
 * line segment between (minX, y) and (maxX, y).
 * @param {any} edge
 * @param {any} y
 * @param {any} xMin
 * @param {any} xMax
 */
function intersectsHorizontalSegment(edge, y, xMin, xMax) {
    if (edge.targetX - edge.sourceX <= gdo.epsilon) {
        return edge.sourceX >= minX && edge.sourceX <= maxX;
    }
    // The lines intersect at (x = 1/m (y-y_o) + x_0, y = y)
    const slope = (edge.targetY - edge.sourceY) / (edge.targetX - edge.sourceY);
    const xIntersect = 1 / slope * (y - edge.sourceY) + edge.sourceX;
    return xIntersect >= xMin && xIntersect <= xMax;
}

/**
 * Determines whether or not the edge intersects the vertical
 * line segment between (x, minY) and (x, maxY).
 * @param {any} edge
 * @param {any} x
 * @param {any} yMin
 * @param {any} yMax
 */
function intersectsVerticalSegment(edge, x, yMin, yMax) {
    if (edge.targetX - edge.sourceX <= gdo.epsilon) {
        return edge.sourceX - x <= gdo.epsilon;
    }
    // The lines intersect at (x = x, y = m(x-x_0) + y_0)
    const slope = (edge.targetY - edge.sourceY) / (edge.targetX - edge.sourceX);
    const yIntersect = slope * (x - edge.sourceX) + edge.sourceY;
    return yIntersect >= yMin && yIntersect <= yMax;
}

/**
 * Converts the node in the server coordinate system to the same
 * node in the sigma coordinate system. 
 * @param {any} node the node in the server coordinate system
 * @return the node in the sigma coordinate system
 */
function convertServerCoordsToSigmaCoords(node) {
    return {
        id: node.id,
        x: (node.x - gdo.xCentroid) * gdo.canvasWidthInPx * 1 / (gdo.xWidth / 2),
        y: -(-node.y + gdo.yCentroid) * gdo.canvasHeightInPx * 1 / (gdo.yWidth / 2),
        color: node.color
    }
}
