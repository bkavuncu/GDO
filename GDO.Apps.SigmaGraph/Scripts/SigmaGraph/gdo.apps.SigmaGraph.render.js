/**
* Functions for rendering the graph with sigma.js
*/

// Initialize global static constants.
gdo.epsilon = 1E-9;
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
};

/**
 * Renders the graph.
 */
gdo.net.app["SigmaGraph"].renderGraph = async function () {
    gdo.consoleOut('.SIGMAGRAPHRENDERER', 1, 'Rendering graph...');
    // Get location of files containing objects to render.
    //const fileNames = gdo.net.app["SigmaGraph"].server.getFilesWithin(xCentroid, yCentroid, xWidth, yWidth);
    const filePaths = [gdo.basePath + 'fourEdges.graphml'];
    const timeBeforeParse = window.performance.now();
    // Get the nodes and edges
    const filesGraphObjects = await Promise.all(filePaths.map(function(filePath) {
        return httpGet(filePath).then(parseGraphML);
    }));
    console.log(filesGraphObjects);
    console.log("Time to parse...");
    console.log(window.performance.now() - timeBeforeParse);

    // Clear the sigma graph
    gdo.sigmaInstance.graph.clear();

    // Filter and add the nodes and edges to the graph
    filesGraphObjects.forEach(function (fileGraphObjects) {
        const fileNodesInFOV = fileGraphObjects.nodes;
        fileNodesInFOV.forEach(node => {
            node.x = parseFloat(node.x);
            node.y = parseFloat(node.y);
            node.color = node.color || "#f00";
            node.size = node.size || 3;
        });
        fileNodesInFOV.forEach(node => {
            gdo.sigmaInstance.graph.addNode(node);
        });

        const fileEdgesInFOV = fileGraphObjects.edges.filter(edgeIsWithinFOV);
        fileEdgesInFOV.forEach(edge => {
            gdo.sigmaInstance.graph.addEdge(edge);
        });

        gdo.sigmaInstance.graph.nodes().forEach(node => {
            if (gdo.sigmaInstance.graph.degree(node.id) === 0) {
                gdo.sigmaInstance.graph.dropNode(node.id);
            } else {
                convertServerCoordsToSigmaCoords(node);
            }
        });
    });

    addDebugGrid();
    // Render the new graph
    gdo.sigmaInstance.refresh();
};

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
        xhr.responseType = 'document';
        xhr.overrideMimeType('text/xml');
        xhr.onload = function() {
            if (this.status === 200) {
                resolve(this.response);
            }
        };
        xhr.send();
    });
}

/**
 * Returns a promise that fulfulls with a javascript object
 * representation of the contents of graphMLText.
 * @param {any} graphMLText the contents of a graphml file
 */
function parseGraphML(xml) {
    return new Promise(function (resolve, reject) {
        function resolver() {
            return 'http://graphml.graphdrawing.org/xmlns';
        }
        const nodes = [];
        const nodesPath = "myns:graphml/myns:graph/myns:node";
        const xmlNodes = xml.evaluate(nodesPath, xml, resolver, XPathResult.ANY_TYPE, null);
        let xmlNode = xmlNodes.iterateNext();
        while (xmlNode) {
            const node = {};
            node.id = xmlNode.getAttribute('id');
            for (let index = 0; index < xmlNode.children.length; index++) {
                const child = xmlNode.children[index];
                node[child.getAttribute('key')] = child.innerHTML;
            }
            nodes.push(node);

            xmlNode = xmlNodes.iterateNext();
        }

        const edges = [];
        const edgesPath = "myns:graphml/myns:graph/myns:edge";
        const xmlEdges = xml.evaluate(edgesPath, xml, resolver, XPathResult.ANY_TYPE, null);
        let xmlEdge = xmlEdges.iterateNext();
        let edgeCount = 0;
        while (xmlEdge) {
            const edge = {};
            edge.id = 'E' + edgeCount;
            edge.source = xmlEdge.getAttribute('source');
            edge.target = xmlEdge.getAttribute('target');
            for (let index = 0; index < xmlEdge.children.length; index++) {
                const child = xmlEdge.children[index];
                edge[child.getAttribute('key')] = child.innerHTML;
            }
            edges.push(edge);

            edgeCount += 1;
            xmlEdge = xmlEdges.iterateNext();
        }

        const graph = {};
        graph.nodes = nodes;
        graph.edges = edges;
        resolve(graph);
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
    let count = 100;
    [...Array(11).keys()].forEach(function (x) {
        x /= 10;
        [...Array(11).keys()].forEach(function(y) {
            y /= 10;
            count += 1;
            const gridNode = { id: "N" + count, x: x, y: y, color: "#00f", size: 4 };
            convertServerCoordsToSigmaCoords(gridNode);
            gdo.sigmaInstance.graph.addNode(gridNode);
        });
    });
}