/**
* Functions for rendering the graph with sigma.js
*/

gdo.epsilon = 1E-6;
gdo.basePath = "\\Web\\SigmaGraph\\graphmls\\";
gdo.graphContainer = "app_frame";

/**
 * 
 */
gdo.net.app["SigmaGraph"].initInstanceGlobals = function () {
    gdo.consoleOut('.SIGMAGRAPHRENDERER', 1, 'Initializing instance globals');
    // Node global constants.
    gdo.nodeRow = gdo.net.node[gdo.clientId].sectionRow;
    gdo.nodeCol = gdo.net.node[gdo.clientId].sectionCol;
    gdo.numRows = gdo.net.section[gdo.clientId].rows;
    gdo.numCols = gdo.net.section[gdo.clientId].cols;
    gdo.xhr = new XMLHttpRequest();
    gdo.graphMLParser = new gdo.graphml.GraphMLParser();
    gdo.sigmaInstance = new sigma(gdo.graphContainer);

    // Node global variables.
    gdo.xWidth = 1 / gdo.numCols;
    gdo.yWidth = 1 / gdo.numRows;
    gdo.xCentroid = gdo.xWidth * gdo.nodeCol + gdo.xWidth / 2;
    gdo.yCentroid = gdo.yWidth * gdo.nodeRow + gdo.yWidth / 2;
}

/**
 * Renders the graph.
 */
gdo.net.app["SigmaGraph"].renderGraph = function () {
    gdo.consoleOut('.SIGMAGRAPHRENDERER', 1, 'Rendering graph...');
    // Get location of files containing objects to render.
    //const fileNames = gdo.net.app["SigmaGraph"].server.getFilesWithin(xCentroid, yCentroid, xWidth, yWidth);
    const fileNames = ['marvel_heroes.graphml'];

    // Parse as sigma graph
    const graphObjects = getGraphObjectsInFieldOfView(fileNames);
    const nodes = graphObjects.nodes;
    const edges = graphObjects.edges;

    // Clear the sigma graph and add the nodes and edges.
    sigmaInstance.clear();
    nodes.forEach(sigmaInstance.addNode);
    edges.forEach(sigmaInstance.addEdge);

    // Render the new graph
    s.refresh();
}

/**
 * Finds all nodes and edges in the file pointed to be fileNames that are
 * in the field of view.
 * @param {any} fileNames
 * @return the nodes and edges in files that are in the field of view.
 */
function getGraphObjectsInFieldOfView(fileNames) {
    const nodes = [];
    const edges = [];
    fileNames.forEach(function (fileName) {
        // Parse file for nodes and edges.
        gdo.consoleOut('.SIGMAGRAPHRENDERER', 1, 'Getting nodes and edges in field of view...');
        const fileGraphObjects = parseGraphMLForGraphObjects(fileName);
        const fileNodes = fileGraphObjects.nodes;
        const fileEdges = fileGraphObjects.edges;
        // Remove nodes and edges that aren't in the field of view.
        const nodesInFOV = fileNodes.filter(nodeIsWithinFOV);
        const edgesInFOV = fileEdges.filter(edgeIsWithinFOV);
        // TODO maybe not necessary if using camera
        // Convert node coordinates to sigma coordinates.
        nodesInFOV.forEach(function(node) {
            const sigmaCoords = convertServerCoordsToSigmaCoords(node.x, node.y);
            node.x = sigmaCoords.x;
            node.y = sigmaCoords.y;
        });
        // Discard extra attributes.
        // Add nodes to nodes and edges to edges.
        nodesInFOV.forEach(nodes.push);
        edgesInFOV.forEach(edges.push);
    });
    return {
        nodes: nodes,
        edges: edges
    };
}

/**
 * 
 * @param {any} fileName
 */
async function parseGraphMLForGraphObjects(fileName) {
    gdo.consoleOut('.SIGMAGRAPHRENDERER', 1, 'Downloading graph objects file at ' + gdo.basePath + fileName + "...");
    gdo.xhr.open("GET", gdo.basePath + fileName, false);
    gdo.xhr.send();
    gdo.consoleOut('.SIGMAGRAPHRENDERER', 1, 'Parsing graph objects file...');
    const fileGraphObjects = await parseGraphML(gdo.xhr.responseText).then(graph => graph);
    return fileGraphObjects;
}

function parseGraphML(graphMLText) {
    return new Promise(function(resolve, reject) {
        gdo.graphMLParser.parse(graphMLText, function(err, graph) {
            if (err !== null) return reject(err);
            resolve(graph);
        });
    });
}

/**
 * Determines whether or not the node is in the field of view.
 * @param {any} node
 */
function nodeIsWithinFOV(node) {
    const xMin = xCentroid - xWidth / 2;
    const xMax = xCentroid + xWidth / 2;
    const yMin = yCentroid - yWidth / 2;
    const yMax = yCentroid + yWidth / 2;
    return node.X >= xMin && node.X <= xMax
        && node.Y >= yMin && node.Y <= yMax;
}

/**
 * Determines whether or not the edge is in the field of view.
 * @param {any} edge
 */
function edgeIsWithinFOV(edge) {
    const xMin = xCentroid - xWidth / 2;
    const xMax = xCentroid + xWidth / 2;
    const yMin = yCentroid - yWidth / 2;
    const yMax = yCentroid + yWidth / 2;

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
 * line segment between (y, minX) and (y, maxX).
 * @param {any} edge
 * @param {any} y
 * @param {any} xMin
 * @param {any} xMax
 */
function intersectsHorizontalSegment(edge, y, xMin, xMax) {
    if (edge.targetX - edge.sourceX <= Epsilon) {
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
    if (edge.targetX - edge.sourceX <= epsilon) {
        return edge.sourceX - x <= epsilon;
    }
    // The lines intersect at (x = x, y = m(x-x_0) + y_0)
    const slope = (edge.targetY - edge.sourceY) / (edge.targetX - edge.sourceX);
    const yIntersect = slope * (x - edge.sourceX) + edge.sourceY;
    return yIntersect >= yMin && yIntersect <= yMax;
}

/**
 * Converts the point (x,y) in the server coordinate system to the same
 * point in the sigma coordinate system.
 * @param {any} x the server x coordinate
 * @param {any} y the server y coordinate
 * @return x and y in sigma coordinates
 */
function convertServerCoordsToSigmaCoords(x, y) {
    const xMin = xCentroid - xWidth / 2;
    const xMax = xCentroid + xWidth / 2;
    const yMin = yCentroid - yWidth / 2;
    const yMax = yCentroid + yWidth / 2;

    const xSigma = (x - xMin) / (xMax - xMin);
    const ySigma = (y - yMin) / (yMax - yMin);
    return {
        x: xSigma,
        y: ySigma
    };
}
