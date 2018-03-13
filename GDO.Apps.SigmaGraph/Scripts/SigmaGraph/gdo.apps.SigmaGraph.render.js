/**
* Functions for rendering the graph with sigma.js
* TODO extract some helper functions into a seperate file
*/

/**
 * Renders the graph.
 */
gdo.net.app["SigmaGraph"].renderGraph = async function () {
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
    gdo.stopWatch = window.performance.now();
    filesGraphObjects.forEach(handleFileGraphObjects);
    gdo.sigmaInstance.graph.nodes().forEach(convertServerCoordsToSigmaCoords);
    console.log("Time to add objects: " + (window.performance.now() - gdo.stopWatch));

    // Render the new graph
    gdo.stopWatch = window.performance.now();
    // gdo.sigmaInstance.refresh({ skipIndexation: true });
    gdo.sigmaInstance.refresh();

    gdo.net.app["SigmaGraph"].server.doneRendering(gdo.controlId);
}

gdo.net.app["SigmaGraph"].nameVertices = async function(params) {
    var objAttribute = params[0];
    var attribute = params[1];
    var textFunc = params[2];
    var func = eval('('+textFunc+')');
    var fontColor = params[3];
    var fontSize = params[4];
    var labelAttr = params[5];

    function helper(node) {
        return (node.attrs[attribute] != null && func(isNaN(node.attrs[attribute]) ? node.attrs[attribute] : node.attrs[attribute] - "0"));
    }
    if (objAttribute === "node") {
        gdo.sigmaInstance.graph.nodes().forEach(function(node) {
            node.label = helper(node) ? node.attrs[labelAttr] || "" : "";
        });
    } 

    await gdo.sigmaInstance.settings({drawLabels: true, labelThreshold: 0, defaultLabelColor: fontColor, defaultLabelSize: parseInt(fontSize)});

    // setTimeout(function(){ 
    gdo.sigmaInstance.refresh();
    gdo.net.app["SigmaGraph"].server.doneRendering(gdo.controlId);
    // }, 3000);
    // gdo.sigmaInstance.refresh({ skipIndexation: true });
    // gdo.net.app["SigmaGraph"].server.doneRendering(gdo.controlId);
}

gdo.net.app["SigmaGraph"].colorByValue = async function (params) {
    //  change the hub and control file
    console.log('start color by Func');
    var objAttribute = params[0];
    var attribute = params[1];
    var lowerBound = parseFloat(params[2]);
    var upperBound = parseFloat(params[3]);

    var parseDate = function(list) {
        var result = list.filter(function(node) {
            if (isNaN(Date.parse(node.attrs["date"]))) {
                node.color = "#696969";
                return false;
            }
            return true;
        });
        return result;
    }

    var expDateValue = function(value) {
        return Math.exp(1.0 * value / 1E12);
    }


    var valueRange = function (objattr, attr) {
        var max = -Infinity, min = Infinity, list, arr;

        if (objattr == 'node') {
            list = gdo.sigmaInstance.graph.nodes().filter(function(node) {
                if (node.attrs[attr] != null) {
                    return true;
                } else {
                    node.color = "#696969";
                }
            });

            if (attr == "date") {
                list = parseDate(list);
                arr = list.map(a => Date.parse(a.attrs[attr]));
                for (var i = 0; i < arr.length; i++) if (arr[i] > max) {
                    max = arr[i];
                }
                max = expDateValue(max);

                for (var i = 0; i < arr.length; i++) if (arr[i] < min) {
                    min = arr[i];
                }
                min = expDateValue(min);
            } else {
                arr = list.map(a => a.attrs[attr]);
                for (var i = 0; i < arr.length; i++) if (arr[i] > max) {
                    max = arr[i];
                    console.log(max);
                }
                for (var i = 0; i < arr.length; i++) {
                    if (arr[i] < min) min = arr[i];
                }
            }

            // TODO change as above, avoid too many edge (exceed apply method range)
        } else if (objattr == 'edge') {
            list = gdo.sigmaInstance.graph.edges().filter(function (node) {
                if (node.attrs[attr] != null) {
                    return true;
                }
                return false;
            });


            if (attr == "date") {
                list = parseDate(list);
                max = Math.max.apply(Math,
                    parseDate(list).map(a => Date.parse(a.attrs[attr])));

                min = Math.min.apply(Math,
                    parseDate(list).map(a => Date.parse(a.attrs[attr])));
            } else {
                max = Math.max.apply(Math,
                    list.map(a => a.attrs[attr]));
                min = Math.min.apply(Math,
                    list.map(a => a.attrs[attr]));
            }
        }
        return [max, min, list];
    }

    /**
    * https://gist.github.com/mjackson/5311256
    * Converts an HSL color value to RGB. Conversion formula
    * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
    * Assumes h, s, and l are contained in the set [0, 1] and
    * returns r, g, and b in the set [0, 255].
     *
    * @param   Number  h       The hue
    * @param   Number  s       The saturation
    * @param   Number  l       The lightness
    * @return  Array           The RGB representation
    */
    function hslToRgb(h, s, l) {
        var r, g, b;

        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;

            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
    }

    var color = function ( node, attr, max, min, lowerBound, upperBound) {
        var h, s, l;
        s = 1;
        l = 0.5;
        if (attr == "date") {
            h = lowerBound + ((expDateValue(Date.parse(node.attrs[attr])) - min) / (max - min)) * (upperBound - lowerBound);
        } else {
            h = lowerBound + ((node.attrs[attr] - min) / (max - min)) * (upperBound - lowerBound);
        }
        var rgb = hslToRgb(h, s, l);
        var color = '#' +
            toPaddedHexString(rgb[0], 2) +
            toPaddedHexString(rgb[1], 2) +
            toPaddedHexString(rgb[2], 2);
        return color;
    }

    // don't clear the sigma graph
    var helper = function(item, attr, max, min , lb, ub) {
        if (item.attrs[attr] != null) {
            item.color = color(item, attr, max, min , lb, ub);
        }
    }

    var range = valueRange(objAttribute, attribute);
    var max = range[0];
    var min = range[1];
    var objlist = range[2];

    if (!isNaN(max)) {
        gdo.net.app["SigmaGraph"].validity = true;
        objlist.forEach(node => helper(node, attribute, max, min, lowerBound, upperBound));       
        gdo.sigmaInstance.refresh({ skipIndexation: true });
        gdo.net.app["SigmaGraph"].server.doneRendering(gdo.controlId);
    } else {
        gdo.net.app["SigmaGraph"].validity = false;
        gdo.net.app["SigmaGraph"].server.reportInvalidity(gdo.controlId);
    }
    console.log(gdo.net.app["SigmaGraph"].validity);
}

gdo.net.app["SigmaGraph"].colorByFilter = async function(params) {
    var objAttribute = params[0];
    var attribute = params[1];
    var textFunc = params[2];
    var setColor = params[3];
    var colorFunc = eval('('+textFunc+')');
    
    var helper = function(item, color, attr, func) {
        if (item.attrs[attr] != null && func(item.attrs[attr])) {
            item.color = color;
        }
    }
    if (objAttribute === "node") {
        gdo.sigmaInstance.graph.nodes().forEach(node => helper(node, setColor, attribute, colorFunc));
    } else if (objAttribute === "edge") {
        gdo.sigmaInstance.graph.edges().forEach(edge => helper(edge, setColor, attribute, colorFunc));
    }

    gdo.sigmaInstance.refresh({ skipIndexation: true });
    gdo.net.app["SigmaGraph"].server.doneRendering(gdo.controlId);

}

gdo.net.app["SigmaGraph"].filterGraph = async function (attributeList) {
    console.log(gdo.controlId);
    gdo.sigmaInstance.graph.filterobj(attributeList);

    gdo.sigmaInstance.refresh({ skipIndexation: true });
    gdo.net.app["SigmaGraph"].server.doneRendering(gdo.controlId);
}
/*
gdo.net.app["SigmaGraph"].filterGraph = async function(attributeList) {
    var objAttribute = attributeList[0];
    var attribute = attributeList[1];
    var textFunc = attributeList[2];
    var func = eval('('+textFunc+')');
    gdo.debugFunc = func;
    console.log(attributeList);
    var helper = function(node) {
        return node.attrs[attribute] != null && func(isNaN(node.attrs[attribute]) ? node.attrs[attribute] : node.attrs[attribute] - "0");
    }
    
    var filterFunc = function(node) {
        console.log(func(isNaN(node.attrs[attribute]) ? node.attrs[attribute] : node.attrs[attribute] - "0"));
        if(!helper(node)) {
            (objAttribute == "node") ? gdo.sigmaInstance.graph.dropNode(node.id) : gdo.sigmaInstance.graph.dropEdge(node.id);
        } 
    }

    if (objAttribute == "node") {
        gdo.sigmaInstance.graph.nodes().forEach(filterFunc);
    } else if (objAttribute == "edge") {
        gdo.sigmaInstance.graph.edges().forEach(filterFunc);
    }
    gdo.sigmaInstance.refresh({ skipIndexation: true });
    gdo.net.app["SigmaGraph"].server.doneRendering(gdo.controlId);
}
*/
/**
 * Show the spinning icon that indicates that the graph is loading.
 */
gdo.net.app["SigmaGraph"].showSpinner = function () {
    gdo.loader.style.display = "block";
}

/**
 * Hide the spinning icon that indicates that the graph is loading.
 */
gdo.net.app["SigmaGraph"].hideSpinner = function () {
    gdo.loader.style.display = "none";
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

/**
 * Returns a list of objects representing the centroids of all quadtree
 * leaves matching this nodes field of view.
 */
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
        function infiniteRetry() {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", filePath, true);
            xhr.onload = function () {
                if (this.status === 200) {
                    resolve(this.response);
                } else {
                    console.log('Error Getting File: ' + this.status);
                    setTimeout(infiniteRetry, 0);
                }
            };
            xhr.send();
        }
        infiniteRetry();
    });
}

/**
 * Converts the node in the server coordinate system to the same
 * node in the sigma coordinate system. Mutates the given node.
 * @param {any} node the node in the server coordinate system
 * @return the node in the sigma coordinate system
 */
function convertServerCoordsToSigmaCoords(node) {
    node.x = (node.x - gdo.xCentroid) * gdo.canvasWidthInPx * 1 / (gdo.xWidth / 2);
    node.y = (node.y - gdo.yCentroid) * gdo.canvasHeightInPx * 1 / (gdo.yWidth / 2);
}

/**
 * Modifies graph objects from quadtree leaf file to be sigma
 * graph compatible, and adds these objects to the sigma instance.
 * @param {any} fileGraphObjects
 */
function handleFileGraphObjects(fileGraphObjects) {
    fileGraphObjects.nodes.forEach(node => {
        node.x = node.pos.x;
        node.y = node.pos.y;
        if (node.r || node.g || node.b) {
            node.color = "#" +
                toPaddedHexString(node.r, 2) +
                toPaddedHexString(node.g, 2) +
                toPaddedHexString(node.b, 2);
        } else {
            node.color = "#89f";
        }
        // What should the max be? 5? 12?
        node.size = Math.min(12, node.size) || 3;
        try {
            gdo.sigmaInstance.graph.addNode(node);
        } catch (err) {
        }
    });

    fileGraphObjects.edges.forEach(edge => {
        edge.id = edge.source + " to " + edge.target;
        if (edge.r || edge.g || edge.b) {
            edge.color = "#" +
                toPaddedHexString(edge.r, 2) +
                toPaddedHexString(edge.g, 2) +
                toPaddedHexString(edge.b, 2);
        } else {
            edge.color = "#339";
        }
        try {
            gdo.sigmaInstance.graph.addEdge(edge);
        } catch (err) {
        }
    });
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
async function addLeafBoxes() {
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

/**
 * Converts a number from 0 to 255 inclusive to its hexadecimal
 * reprensentation and zero pads it to len digits.
 * https://stackoverflow.com/questions/9909038/formatting-hexadecimal-number-in-javascript
 * @param {any} num
 * @param {any} len
 * @return num as a hexadecimal string zero padded to len digits
 */
function toPaddedHexString(num, len) {
    const str = num.toString(16);
    return "0".repeat(len - str.length) + str;
}
