/*
 * A pre-processing program to transform Gephi JSON data for visualisation
 * Created by: David Chia (david.mhchia@gmail.com)
 */


/* Reads from JSON files (generated from Gephi)
 *
 * General steps:
 * 1. Read from file specified via command line
 * 2. Get min and max x, y values to determine dimension of graph
 *    and to transform the graph to start from (0,0)
 * 3. Create graph using data structure provided by ngraph.graph
 * 4. Prepare data to be written into different files
 * 5. Write data in output.json, nodes.json, labels.json,
 *    linksDistribution.json, linksPos.bin, nodesPos.bin
 */


// read the third argument of command line as filename
var filename = process.argv[2];
console.log("Processing: " + filename);

// import packages from npm
var createGraph = require('ngraph.graph');
var g = createGraph();

var fs = require('fs');
var data;

// start reading from file
fs.readFile(filename, function read(err, data) {
    if (err) {
        throw err;
    }

    // to get rect dimension
    var minX, minY, maxX, maxY;

    data = JSON.parse(data);

    // initialise variables for comparison later
    minX = data.nodes[0].x;
    minY = data.nodes[0].y;
    maxX = data.nodes[0].x;
    maxY = data.nodes[0].y;


    for (var i = 0; i < data.nodes.length; ++i) {

        var node = data.nodes[i];

        if (node.x < minX)
            minX = node.x;

        if (node.x > maxX)
            maxX = node.x;

        if (node.y < minY)
            minY = node.y;

        if (node.y > maxY)
            maxY = node.y;

        var nodeData = {
            pos: {
                x: node.x,
                y: node.y
            },
            label: node.label
        }

        g.addNode(node.id, nodeData);
    }

    var rectDimension = {
        width: maxX - minX,
        height: maxY - minY
    }


    for (var i = 0; i < data.edges.length; ++i) {
        var edge = data.edges[i];

        g.addLink(edge.source, edge.target);
    }


    g.forEachNode(function (node) {
        node.data.pos.x += -minX;
        node.data.pos.y += -minY;
    });


    var nodesArr = [];
    var linksArr = [];
    var nodesData = [];
    var labelsData = [];
    var linksDistribution = [];

    g.forEachNode(function (node) {

        var linkedNodesArr = [];

        function addLinkedNodes() {
            var linksArr = node.links;
            linksArr.forEach(function (link) {
                if (link.fromId == node.id) {
                    linkedNodesArr.push(link.toId);
                } else {
                    linkedNodesArr.push(link.fromId);
                }
            })
        }

        addLinkedNodes();

        // for output.json
        nodesArr.push(
            {
                id: node.id,
                pos: node.data.pos,
                adj: node.links.length,    // to get length of connected nodes (adjacent nodes)   // delete
                links: node.links,
                linkedNodes: linkedNodesArr
            }
        )

        // for nodes.json
        nodesData.push(
            {
                id: node.id,  // might be unnecessary (actually good to have it, so that if need to check through json data, could immediately identify which node it is, instead of counting from the start)
                label: node.data.label,
                pos: node.data.pos,
                adj: linkedNodesArr //connected nodes
            }
        )

        // for labels.json
        labelsData.push(node.data.label);

        // for linksDistribution.json
        linksDistribution.push(
            {
                numLinks: linkedNodesArr.length
            }
        );

    });


    // push links onto linksArr
    g.forEachLink(function (link) {
        var fromNode = g.getNode(link.fromId);
        var toNode = g.getNode(link.toId);

        var linkPos = {
            from: fromNode.data.pos,
            to: toNode.data.pos
        }

        linksArr.push(
            {
                fromId: link.fromId,
                toId: link.toId,
                pos: linkPos
            }
        );
    });


    var data = {
        rectDimension: rectDimension,
        nodes: nodesArr,
        links: linksArr
    }


    // write to output.json
    fs.writeFileSync("output.json", JSON.stringify(data));
    console.log("Finished writing output into output.json: " + (new Date).getTime());

    // output nodes data to nodes.json
    fs.writeFileSync("nodes.json", JSON.stringify(nodesData));
    console.log("Finished writing output into nodes.json: " + (new Date).getTime());

    // output labels data to labels.json
    fs.writeFileSync("labels.json", JSON.stringify(labelsData));
    console.log("Finished writing output into labels.json: " + (new Date).getTime());


    // linksDistribution data can be used for further graph analysis

    // output links distribution data to linksDistribution.json
    fs.writeFileSync("linksDistribution.json", JSON.stringify(linksDistribution));
    console.log("Finished writing output into linksDistribution.json: " + (new Date).getTime());

    // output links distribution into CSV file
    var json2csv = require('json2csv');
    var fields = ['numLinks'];

    json2csv({data: linksDistribution, fields: fields}, function (err, csv) {
        if (err) console.log(err);
        fs.writeFile('linksDistribution.csv', csv, function (err) {
            if (err) throw err;
            console.log("Finished writing output into linksDistribution.csv: " + (new Date).getTime());
        });
    });


    // process link positions into buffer and output into binary file

    //1. get links count
    //2. create byte buffer (each link needs 4 + 4 + 4 + 4 bytes, for x1, y1, x2, y2)
    //3. write to file

    //console.log("Starting to output into linksPos.bin: " + (new Date).getTime());
    var linksCount = linksArr.length;
    var linksBuf = new Buffer(linksCount * 16);
    var offset = 0;   // offset for buffer

    linksArr.forEach(function (link) {

        var pos = link.pos;

        linksBuf.writeFloatLE(pos.from.x, offset);
        linksBuf.writeFloatLE(pos.from.y, offset + 4);
        linksBuf.writeFloatLE(pos.to.x, offset + 8);
        linksBuf.writeFloatLE(pos.to.y, offset + 12);

        offset += 16;

    });


    fs.writeFileSync("linksPos.bin", linksBuf);
    console.log("Finished writing output into linksPos.bin: " + (new Date).getTime());
    /*
     // check if output is correct
     for (var i = 0; i < linksCount; ++i) {
     var readOffset = i * 16;
     console.log(linksBuf.readFloatLE(readOffset));
     console.log(linksBuf.readFloatLE(readOffset + 4));
     console.log(linksBuf.readFloatLE(readOffset + 8));
     console.log(linksBuf.readFloatLE(readOffset + 12));
     }
     */


// process node positions into buffer and output into binary file

    //console.log("Starting to output into nodesPos.bin: " + (new Date).getTime());

// 1. set up buffer and offset
    var nodesCount = nodesArr.length;
    var nodesBuf = new Buffer(nodesCount * 12 + 8);   // 4 + 4 + 4 bytes for x, y position & no. of connected nodes; 8 extra bytes to record rect dimension
    var offset = 0;   // offset for buffer


// 2. add data to buffer; rectDimension, followed each node's positions
    nodesBuf.writeFloatLE(rectDimension.width, offset);
    nodesBuf.writeFloatLE(rectDimension.height, offset + 4);
    offset += 8;

    nodesArr.forEach(function (node) {

        var pos = node.pos;

        nodesBuf.writeFloatLE(pos.x, offset);
        nodesBuf.writeFloatLE(pos.y, offset + 4);
        nodesBuf.writeFloatLE(node.links.length, offset + 8);

        offset += 12;
    });

// 3. write into file
    fs.writeFileSync("nodesPos.bin", nodesBuf);
    console.log("Finished writing output into nodesPos.bin: " + (new Date).getTime());


    // check if output is correct (first rectDimension, then each node's position & no. of connected nodes)

    /*
     console.log(nodesBuf.readFloatLE(0));
     console.log(nodesBuf.readFloatLE(4));

     for (var i = 0; i < nodesCount; ++i) {
     var readOffset = i * 12 + 8;
     console.log(nodesBuf.readFloatLE(readOffset));
     console.log(nodesBuf.readFloatLE(readOffset + 4));
     console.log(nodesBuf.readFloatLE(readOffset + 8));
     }
     */

});








