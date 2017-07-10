/*
1. Read respective browser data file
2. Translate SVG based on browser coordinates
3. Render nodes & links
*/

$(function () {
    gdo.consoleOut('.SIGMAGRAPHRENDERER', 1, 'Loaded Sigma Graph Renderer JS');

    $.connection.sigmaGraphAppHub.client.renderGraph = gdo.net.app["SigmaGraph"].renderGraph;















    // arrays to store data
    var links, nodes, allnodes, mostConnectedNodes = [];
    var minLinks = 3;

    var highlightedNodes = [];  //stores the ID of the nodes matching the query
    var highlightedNeighbours = [];  //stores the ID of the neighbour nodes of those matching the query

    // boolean to track if current graph is zoomed
    var globalZoomed;

    // flag to indicate if all nodes should have the same size. If so, 'normalRadius' is the value to be used.
    var allNodesSameSize = false;

    // set size of nodes and links
    var zoomedRadius = 5;
    var zoomedStrokeWidth = 2;
    var zoomedFontSize = 30;
    var normalRadius = 3;
    var normalStrokeWidth = 1;
    var normalFontSize = 20;


    var blueColor = { r: 100, g: 175, b: 255 };
    var greenColor = { r: 75, g: 255, b: 125 };
    var orangeColor = { r: 255, g: 150, b: 50 };
    var redColor = { r: 255, g: 50, b: 50 };

    var currentColor = blueColor;    // rgb setting to track current color scheme
    var highlightedColor = { r: 250, g: 255, b: 0 };   // rgb setting for highlighted nodes
    var highlightedColor2 = { r: 255, g: 153, b: 0 };   // rgb setting for highlighted nodes
    var highlightedColor3 = redColor;


    var maxLinks = 5;
    var maxRGB = Math.max(currentColor.r, currentColor.g, currentColor.b);
    var rgbIncrement = (255 - maxRGB) / maxLinks;
    //amount of increment remaining divide by no. of possible links 
    // (to know how much to increase for every increase in link)


    // when div content exceeds div height, call this function 
    // to align bottom of content with bottom of div
    scroll_bottom = function (div) {
        if (div.scrollHeight > div.clientHeight)
            div.scrollTop = div.scrollHeight - div.clientHeight;
    }

    $.connection.sigmaGraphAppHub.client.setMessage = function (message) {
        gdo.consoleOut('.SIGMAGRAPHRENDERER', 1, 'Message from server: ' + message);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {

            var logDom = $("iframe").contents().find("#message_from_server");
            // append new "p" element for each msg, instead of replacing existing one
            logDom.empty().append("<p>" + message + "</p>");

            scroll_bottom(logDom[0]);

        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            // do nothing
        }
    }


    $.connection.sigmaGraphAppHub.client.logTime = function (message) {

        var logDom = $("iframe").contents().find("#message_from_server");
        // append new "p" element for each msg, instead of replacing existing one
        logDom.empty().append("<p>" + message + "</p>");

        scroll_bottom(logDom[0]);
    }

    $.connection.sigmaGraphAppHub.client.setFields = function (options, instanceId) {
        // !!If you add and gdo.controlId check here, it will break the Twitter applications!!
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.SIGMAGraph', 1, 'Set fields ');

            gdo.net.instance[instanceId].graphFields = options;
            gdo.net.instance[instanceId].graphFieldsLoaded = true;
            //add fields in loaded graph to the appropriate droplists
            var elem1 = $("iframe").contents().find("#select_label");
            var elem2 = $("iframe").contents().find("#select_SearchFields");
            var elem3 = $("iframe").contents().find("#select_SearchLabels");
            var elem4 = $("iframe").contents().find("#select_mostConnectedLabels");
            elem1.html();
            elem2.html();
            elem3.html();
            elem4.html();
            $.each(options, function () {
                elem1.append($("<option />").val(this).text(this));
                elem2.append($("<option />").val(this).text(this));
                elem3.append($("<option />").val(this).text(this));
                elem4.append($("<option />").val(this).text(this));
            });
        } 
    }

    $.connection.sigmaGraphAppHub.client.renderLabels = function (field, color) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            var labelsDom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("labels");

            var fontSize = globalZoomed ? zoomedFontSize : normalFontSize;

            nodes.forEach(function (node) {
                labelsDom.append("text")
                    .attr("x", node.Pos.X + Math.ceil(node.Size) + 1)
                    .attr("y", node.Pos.Y - Math.ceil(node.Size) - 1)
                    .text(node.Attrs[field] ? node.Attrs[field] : "")  // if the field does not exist for the curent node, print nothing
                    .attr("font-size", fontSize)
                    .attr("fill", color);
            });
        }
    }

    $.connection.sigmaGraphAppHub.client.hideLabels = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            var labelsDom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("labels");
            while (labelsDom.firstChild) {
                labelsDom.removeChild(labelsDom.firstChild);
            }
        }
    }


    $.connection.sigmaGraphAppHub.client.renderSearch = function (searchquery, field) {

        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            var highlightDom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("highlight");
            var linksDom = highlightDom.append("g").attr("id", "sublinks");

            findMatchingNodes(); // To render links properly, each browser needs to know all matched nodes.
            renderSearchNodes(); // Each browser renders its mathching and neighbour nodes
            renderSearchLinks(); // Each browser renders its links

            function findMatchingNodes() {
                //each browser has to calculate the matching nodes for the whole graph, and store them in their highlightedNodes var
                // the neighbour nodes are also stored in the highlightedNeighbours var
                highlightedNodes = [];  // empty it from previous searches
                highlightedNeighbours = [];  // empty it from previous searches

                var queryRE = new RegExp(searchquery, 'i'); // case-insensitive
                allnodes.forEach(function(node) {
                    if (node.Attrs[field]) { // if the field does not exist for the curent node, skip
                        if (node.Attrs[field].search(queryRE) != -1) {
                            highlightedNodes.push(node.ID);
                            node.Adj.forEach(function(neighbour) { // save all its neighbours in a variable
                                highlightedNeighbours.push(neighbour);
                            });
                        }
                    }
                });
            }

            function renderSearchNodes() {
                //var radius = globalZoomed ? zoomedRadius : normalRadius;

                //Each browser render the matching and neighbour nodes among its nodes. 
                nodes.forEach(function (node) {
                    // is this node a match?
                    if (highlightedNodes.indexOf(node.ID) != -1) {
                        highlightDom.append("circle")
                            .attr("r", Math.ceil(node.Size) + 5)
                            .attr("cx", node.Pos.X)
                            .attr("cy", node.Pos.Y)
                            .attr("fill", "rgb(" + highlightedColor.r + "," + highlightedColor.g + "," + highlightedColor.b + ")");
                    }
                    // else, is this a neighbour?
                    else if (highlightedNeighbours.indexOf(node.ID) != -1) {
                        highlightDom.append("circle")
                            .attr("r", Math.ceil(node.Size) + 5)
                            .attr("cx", node.Pos.X)
                            .attr("cy", node.Pos.Y)
                            .attr("fill", "rgb(" + highlightedColor2.r + "," + highlightedColor2.g + "," + highlightedColor2.b + ")");
                    }
                    /* // do nothing (or paint in a another way)
                    else {
                        highlightDom.append("circle")
                            .attr("r", Math.ceil(node.Size))
                            .attr("cx", node.Pos.X)
                            .attr("cy", node.Pos.Y)
                            .attr("fill", "gray"); // Nodes: search mode, not selected
                        } */
                });
            }


            function renderSearchLinks() {

                var strokeWidth = globalZoomed ? zoomedStrokeWidth : normalStrokeWidth;

                //because highlightedNodes has the relevant nodes for the whole graph, this will work even though matching nodes not being in the target browser
                links.forEach(function (link) {
                    //TODO we could improve this by using different colours depending on whether the searched node is the source or the target
                    if (highlightedNodes.indexOf(link.Source) != -1
                        || highlightedNodes.indexOf(link.Target) != -1) {

                        linksDom.append("line")
                            .attr("x1", link.StartPos.X)
                            .attr("y1", link.StartPos.Y)
                            .attr("x2", link.EndPos.X)
                            .attr("y2", link.EndPos.Y)
                            .attr("stroke-width", strokeWidth)
                            .attr("stroke", "yellow");
                    }
                });
            }
        }
    }

    $.connection.sigmaGraphAppHub.client.renderSearchLabels = function (field) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            var highlightDom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("highlight");

            var fontSize = globalZoomed ? zoomedFontSize : normalFontSize;

            nodes.forEach(function (node) {
                // is this node a match?
                if (highlightedNodes.indexOf(node.ID) != -1) {
                    highlightDom.append("text")
                        .attr("x", node.Pos.X + Math.ceil(node.Size) + 1)
                        .attr("y", node.Pos.Y - Math.ceil(node.Size) - 1)
                        .text(node.Attrs[field] ? node.Attrs[field] : "") // if the field does not exist for the current node, print nothing (should exist unless the user has changed the droplist...)
                        .attr("font-size", fontSize)
                        .attr("fill", "rgb(" + highlightedColor3.r + "," + highlightedColor3.g + "," + highlightedColor3.b + ")");
                }
                // else, is this a neighbour?
                else if (highlightedNeighbours.indexOf(node.ID) != -1) {
                    highlightDom.append("text")
                        .attr("x", node.Pos.X + Math.ceil(node.Size) + 1)
                        .attr("y", node.Pos.Y - Math.ceil(node.Size) - 1)
                        //.text(node.Attrs[field] ? node.Attrs[field] : "") // if the field does not exist for the current node, print nothing
                        .text(node.Label) // print the label instead
                        .attr("font-size", fontSize)
                        .attr("fill", "rgb(" + highlightedColor2.r + "," + highlightedColor2.g + "," + highlightedColor2.b + ")"); 
                }
            });

        }
    }

    $.connection.sigmaGraphAppHub.client.hideSublinks = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            var dom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("sublinks");
            while (dom.firstChild) {
                dom.removeChild(dom.firstChild);
            }
        }
    }


    $.connection.sigmaGraphAppHub.client.setRGB = function (colourScheme) {
        gdo.consoleOut('.GRAPHRENDERER', 1, 'Setting colour scheme to: ' + colourScheme);
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            if (colourScheme == "blue") {
                currentColor = blueColor;
            } else if (colourScheme == "green") {
                currentColor = greenColor;
            } else if (colourScheme == "orange") {
                currentColor = orangeColor;
            } else if (colourScheme == "red") {
                currentColor = redColor;
            }
        }
    }


    $.connection.sigmaGraphAppHub.client.hideHighlight = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            var highlightDom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("highlight");
            while (highlightDom.firstChild) {
                highlightDom.removeChild(highlightDom.firstChild);
            }
        }
    }


    $.connection.sigmaGraphAppHub.client.renderMostConnectedNodes = function (numLinks, color) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            var highlightDom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("highlight");

            //var radius = globalZoomed ? zoomedRadius + 2 : normalRadius + 2;

            mostConnectedNodes.forEach(function (node) {
                if (node.NumLinks >= numLinks) {  // mostConnectedNodes has all nodes with numLinks > 3
                    highlightDom.append("circle")
                        .attr("r", Math.ceil(node.Size))
                        .attr("cx", node.Pos.X)
                        .attr("cy", node.Pos.Y)
                        .attr("fill", color);   
                }
            });
        }
    }

    $.connection.sigmaGraphAppHub.client.renderMostConnectedLabels = function (numLinks, field, color) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            var highlightDom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("highlight");

            var fontSize = globalZoomed ? zoomedFontSize : normalFontSize;

            mostConnectedNodes.forEach(function (node) {
                if (node.NumLinks >= numLinks) {   // mostConnectedNodes contains nodes with numLinks > 3
                    highlightDom.append("text")
                        .attr("x", node.Pos.X + Math.ceil(node.Size) + 1)
                        .attr("y", node.Pos.Y - Math.ceil(node.Size) - 1)
                        .text(node.Attrs[field] ? node.Attrs[field] : "")  // if the field does not exist for the curent node, print nothing
                        .attr("font-size", fontSize)
                        .attr("fill", color); 
                }
            });
        }
    }


    $.connection.sigmaGraphAppHub.client.setNodeSize = function(nodeSize) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            normalRadius = nodeSize;
            allNodesSameSize = true;
            document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("nodes").childNodes.forEach(function (node) {
                node.setAttribute("r", normalRadius);
            });
        }
    }

    $.connection.sigmaGraphAppHub.client.setNodesOriginalSize = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            allNodesSameSize = false;
            var nodesDom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("nodes");
            //Remove previous nodes
            while (nodesDom.firstChild) {
                nodesDom.removeChild(nodesDom.firstChild);
            }
            //Add nodes with their proper size
            nodes.forEach(function (node) {
                nodesDom.append("circle")
                    .attr("r", Math.ceil(node.Size))
                    .attr("cx", node.Pos.X)
                    .attr("cy", node.Pos.Y)
                    .attr("fill", "rgb(" + node.R + "," + node.G + "," + node.B + ")");
            });
        }
    }

    $.connection.sigmaGraphAppHub.client.hideNodes = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            var nodesDom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("nodes");
            while (nodesDom.firstChild) {
                nodesDom.removeChild(nodesDom.firstChild);
            }
        }
    }

    $.connection.sigmaGraphAppHub.client.hideLinks = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            var linksDom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("links");
            while (linksDom.firstChild) {
                linksDom.removeChild(linksDom.firstChild);
            }
        }
    }

    $.connection.sigmaGraphAppHub.client.showLinks = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            var linksDom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("links");

            var strokeWidth = globalZoomed ? zoomedStrokeWidth : normalStrokeWidth;

            links.forEach(function (link) {

                linksDom.append("line")
                    .attr("x1", link.StartPos.X)
                    .attr("y1", link.StartPos.Y)
                    .attr("x2", link.EndPos.X)
                    .attr("y2", link.EndPos.Y)
                    .attr("stroke-width", strokeWidth)
                    .attr("stroke", "rgb(" + link.R + "," + link.G + "," + link.B + ")");
            });
        }
    }
});

//gdo.net.app["Graph"].displayMode = 0;

gdo.net.app["SigmaGraph"].initClient = function () {
    gdo.net.app["SigmaGraph"].initInstanceGlobals();
    gdo.net.app["SigmaGraph"].renderGraph();

    gdo.consoleOut('.SIGMAGRAPHRENDERER', 1, 'Initializing Graph Renderer App Client at Node ' + gdo.clientId);
    gdo.net.app["SigmaGraph"].server.requestRendering(gdo.net.node[gdo.clientId].appInstanceId);
}

gdo.net.app["SigmaGraph"].initControl = function () {
    gdo.net.app["SigmaGraph"].initInstanceGlobals();
    gdo.net.app["SigmaGraph"].renderGraph();

    gdo.controlId = parseInt(getUrlVar("controlId"));
    gdo.net.instance[gdo.clientId].graphFieldsLoaded = false;
    gdo.net.app["SigmaGraph"].server.requestRendering(gdo.controlId);
    gdo.net.app["SigmaGraph"].server.getFields(gdo.controlId);
    gdo.consoleOut('.SIGMAGRAPHRENDERER', 1, 'Initializing Graph Renderer App Control at Instance ' + gdo.controlId);
}

gdo.net.app["SigmaGraph"].terminateClient = function () {
    gdo.consoleOut('.SIGMAGRAPHRENDERER', 1, 'Terminating Graph Renderer App Client at Node ' + clientId);
}

gdo.net.app["SigmaGraph"].ternminateControl = function () {
    gdo.consoleOut('.SIGMAGRAPHRENDERER', 1, 'Terminating Graph Renderer App Control at Instance ' + gdo.controlId);
}

gdo.loadScript('sigma.min', 'SigmaGraph', gdo.SCRIPT_TYPE.APP);
gdo.loadScript('browserified.graphml', 'SigmaGraph', gdo.SCRIPT_TYPE.APP);
gdo.loadScript('render', 'SigmaGraph', gdo.SCRIPT_TYPE.APP);
//gdo.loadScript('logging', 'SigmaGraph', gdo.SCRIPT_TYPE.APP);

