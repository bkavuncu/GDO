/*
1. Read respective browser data file
2. Translate SVG based on browser coordinates
3. Render nodes & links
*/



$(function () {
    gdo.consoleOut('.GRAPHRENDERER', 1, 'Loaded Graph Renderer JS');

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

    $.connection.graphAppHub.client.setMessage = function (message) {
        gdo.consoleOut('.GRAPHRENDERER', 1, 'Message from server: ' + message);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {

            var logDom = $("iframe").contents().find("#message_from_server");
            // append new "p" element for each msg, instead of replacing existing one
            logDom.empty().append("<p>" + message + "</p>");

            scroll_bottom(logDom[0]);

        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            // do nothing
        }
    }


    $.connection.graphAppHub.client.logTime = function (message) {

        var logDom = $("iframe").contents().find("#message_from_server");
        // append new "p" element for each msg, instead of replacing existing one
        logDom.empty().append("<p>" + message + "</p>");

        scroll_bottom(logDom[0]);
    }


    $.connection.graphAppHub.client.setFields = function (options) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.Graph', 1, 'Set fields ');

            //add fields in loaded graph to the appropriate droplists
            var elem1 = $("iframe").contents().find("#select_label");
            var elem2 = $("iframe").contents().find("#select_SearchFields");
            var elem3 = $("iframe").contents().find("#select_SearchLabels");
            var elem4 = $("iframe").contents().find("#select_mostConnectedLabels");
            $.each(options, function () {
                elem1.append($("<option />").val(this).text(this));
                elem2.append($("<option />").val(this).text(this));
                elem3.append($("<option />").val(this).text(this));
                elem4.append($("<option />").val(this).text(this));
            });
        } 
    }

    $.connection.graphAppHub.client.renderLabels = function (field, color) {
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

    $.connection.graphAppHub.client.hideLabels = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            var labelsDom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("labels");
            while (labelsDom.firstChild) {
                labelsDom.removeChild(labelsDom.firstChild);
            }
        }
    }


    /*
    EXPERIMENTAL
    */
    $.connection.graphAppHub.client.renderFuzzy = function (option, color) {


        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            var highlightDom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("highlight");

            nodes.forEach(function (node) {
                var value = 0;
                switch (option) {
                    case 1:
                        value = node.query1Result;
                        break;
                    case 2:  //BC evil
                        value = node.query2Result;
                        break;
                    case 3:  //Marvel interesting
                        value = node.query3Result;
                        break;
                    case 4:  //Miserables popular
                        value = node.query4Result;
                        break;
                    case 5:  //Miserables non-popular
                        value = node.query5Result;
                        break;
                    case 6:  //Most active editors
                        value = node.query6Result;
                        break;
                    case 7:  //Longest editions
                        value = node.query7Result;
                        break;
                    default :
                        alert("Invalid query number!");
                }

                if (value >= 0.5) {
                    highlightDom.append("circle")
                        .attr("r", Math.ceil(node.Size)+5)
                        .attr("cx", node.Pos.X)
                        .attr("cy", node.Pos.Y)
                        .attr("fill", color);
                }
            });

            /*function findMatchingNodes() {
                //each browser has to calculate the matching nodes for the whole graph, and store them in their highlightedNodes var
                // the neighbour nodes are also stored in the highlightedNeighbours var
                highlightedNodes = [];  // empty it from previous searches
                highlightedNeighbours = [];  // empty it from previous searches

                var queryRE = new RegExp(searchquery, 'i'); // case-insensitive
                allnodes.forEach(function (node) {
                    if (node.Attrs[field]) { // if the field does not exist for the curent node, skip
                        if (node.Attrs[field].search(queryRE) != -1) {
                            highlightedNodes.push(node.ID);
                            node.Adj.forEach(function (neighbour) { // save all its neighbours in a variable
                                highlightedNeighbours.push(neighbour);
                            });
                        }
                    }
                });
            } */

            /*function renderSearchNodes() {
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
                });
            }*/

            /*function renderSearchLinks() {

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
            } */
        }
    }

    /**********************************************************************************************************/


    $.connection.graphAppHub.client.renderSearch = function (searchquery, field) {

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

    $.connection.graphAppHub.client.renderSearchLabels = function (field) {
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

    $.connection.graphAppHub.client.hideSublinks = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            var dom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("sublinks");
            while (dom.firstChild) {
                dom.removeChild(dom.firstChild);
            }
        }
    }


    $.connection.graphAppHub.client.setRGB = function (colourScheme) {
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


    $.connection.graphAppHub.client.hideHighlight = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            var highlightDom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("highlight");
            while (highlightDom.firstChild) {
                highlightDom.removeChild(highlightDom.firstChild);
            }
        }
    }


    $.connection.graphAppHub.client.renderMostConnectedNodes = function (numLinks, color) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            var highlightDom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("highlight");

            //var radius = globalZoomed ? zoomedRadius + 2 : normalRadius + 2;

            mostConnectedNodes.forEach(function (node) {
                if (node.NumLinks >= numLinks) {  // mostConnectedNodes has all nodes with numLinks > 3
                    highlightDom.append("circle")
                        .attr("r", Math.ceil(node.Size)+5)
                        .attr("cx", node.Pos.X)
                        .attr("cy", node.Pos.Y)
                        .attr("fill", color);   
                }
            });
        }
    }

    $.connection.graphAppHub.client.renderMostConnectedLabels = function (numLinks, field, color) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            var highlightDom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("highlight");

            var fontSize = globalZoomed ? zoomedFontSize : normalFontSize;

            mostConnectedNodes.forEach(function (node) {
                if (node.NumLinks >= numLinks) {   // mostConnectedNodes contains nodes with numLinks > 3
                    highlightDom.append("text")
                        .attr("x", node.Pos.X + Math.ceil(node.Size) + 1)
                        .attr("y", node.Pos.Y - Math.ceil(node.Size) - 1)
                        .text(node.Attrs[field] ? node.Attrs[field] : "")  // if the field does not exist for the curent node, print nothing
                        .attr("font-size", fontSize+5)
                        .attr("fill", color); 
                }
            });
        }
    }


    $.connection.graphAppHub.client.hideNodes = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            var nodesDom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("nodes");
            while (nodesDom.firstChild) {
                nodesDom.removeChild(nodesDom.firstChild);
            }
        }
    }

    //TODO this function must be changed to use proper colours and sizes
    $.connection.graphAppHub.client.renderNodes = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            var nodesDom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("nodes");

            //var radius = globalZoomed ? zoomedRadius : normalRadius;

            nodes.forEach(function (node) {
                var inc = Math.round(rgbIncrement * node.NumLinks); //multiply rgbIncrement by no. of links each node has

                var radius = allNodesSameSize ? normalRadius : Math.ceil(node.Size);

                nodesDom.append("circle")
                    .attr("r", radius) // radius
                    .attr("cx", node.Pos.X)
                    .attr("cy", node.Pos.Y)
                    .attr("fill", "rgb(" + (currentColor.r + inc) + "," + (currentColor.g + inc) + "," + (currentColor.b + inc) + ")");   // Nodes: any colour scheme
            });
        }
    }


    $.connection.graphAppHub.client.hideLinks = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            var linksDom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("links");
            while (linksDom.firstChild) {
                linksDom.removeChild(linksDom.firstChild);
            }
        }
    }

    $.connection.graphAppHub.client.showLinks = function () {
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


    $.connection.graphAppHub.client.pan = function (direction) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            var panRate = 10;

            var svgElement = document.body.getElementsByTagName('iframe')[0]
                                          .contentDocument.getElementById("graph");

            var viewBox = svgElement.getAttribute('viewBox');

            var viewBoxValues = viewBox.split(' ');	// split and convert viewBox values into array			

            // convert values to float (original type is string)
            viewBoxValues[0] = parseFloat(viewBoxValues[0]);// represents x coordinate of top left corner
            viewBoxValues[1] = parseFloat(viewBoxValues[1]);// represents y coordinate of top left corner	

            if (direction == "left") {
                viewBoxValues[0] += panRate;      // Manipulate x coordinate
            } else if (direction == "right") {
                viewBoxValues[0] -= panRate;
            } else if (direction == "up") {
                viewBoxValues[1] += panRate;      // Manipulate y coordinate
            } else if (direction == "down") {
                viewBoxValues[1] -= panRate;
            }

            svgElement.setAttribute('viewBox', viewBoxValues.join(' '));	// Convert viewBoxValues array into a string separated by white space characters
        }
    }

    // Function to render buffer for zoomed-in graph
    $.connection.graphAppHub.client.renderBuffer = function (folderNameDigit) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            gdo.consoleOut('.GRAPHRENDERER', 1, 'Instance - ' + gdo.clientId + ": Rendering graph buffer");


            (function e(t, n, r) { function s(o, u) { if (!n[o]) { if (!t[o]) { var a = typeof require == "function" && require; if (!u && a) return a(o, !0); if (i) return i(o, !0); var f = new Error("Cannot find module '" + o + "'"); throw f.code = "MODULE_NOT_FOUND", f } var l = n[o] = { exports: {} }; t[o][0].call(l.exports, function (e) { var n = t[o][1][e]; return s(n ? n : e) }, l, l.exports, e, t, n, r) } return n[o].exports } var i = typeof require == "function" && require; for (var o = 0; o < r.length; o++) s(r[o]); return s })({
                1: [function (require, module, exports) {
                    module.exports = svg;

                    svg.compile = require('./lib/compile');

                    var compileTemplate = svg.compileTemplate = require('./lib/compile_template');

                    var domEvents = require('add-event-listener');

                    var svgns = "http://www.w3.org/2000/svg";
                    var xlinkns = "http://www.w3.org/1999/xlink";

                    function svg(element, attrBag) {
                        var svgElement = augment(element);
                        if (attrBag === undefined) {
                            return svgElement;
                        }

                        var attributes = Object.keys(attrBag);
                        for (var i = 0; i < attributes.length; ++i) {
                            var attributeName = attributes[i];
                            var value = attrBag[attributeName];
                            if (attributeName === 'link') {
                                svgElement.link(value);
                            } else {
                                svgElement.attr(attributeName, value);
                            }
                        }

                        return svgElement;
                    }

                    function augment(element) {
                        var svgElement = element;

                        if (typeof element === "string") {
                            svgElement = window.document.createElementNS(svgns, element);
                        } else if (element.simplesvg) {
                            return element;
                        }

                        var compiledTempalte;

                        svgElement.simplesvg = true; // this is not good, since we are monkey patching svg
                        svgElement.attr = attr;
                        svgElement.append = append;
                        svgElement.link = link;
                        svgElement.text = text;

                        // add easy eventing
                        svgElement.on = on;
                        svgElement.off = off;

                        // data binding:
                        svgElement.dataSource = dataSource;

                        return svgElement;

                        function dataSource(model) {
                            if (!compiledTempalte) compiledTempalte = compileTemplate(svgElement);
                            compiledTempalte.link(model);
                            return svgElement;
                        }

                        function on(name, cb, useCapture) {
                            domEvents.addEventListener(svgElement, name, cb, useCapture);
                            return svgElement;
                        }

                        function off(name, cb, useCapture) {
                            domEvents.removeEventListener(svgElement, name, cb, useCapture);
                            return svgElement;
                        }

                        function append(content) {
                            var child = svg(content);
                            svgElement.appendChild(child);

                            return child;
                        }

                        function attr(name, value) {
                            if (arguments.length === 2) {
                                if (value !== null) {
                                    svgElement.setAttributeNS(null, name, value);
                                } else {
                                    svgElement.removeAttributeNS(null, name);
                                }

                                return svgElement;
                            }

                            return svgElement.getAttributeNS(null, name);
                        }

                        function link(target) {
                            if (arguments.length) {
                                svgElement.setAttributeNS(xlinkns, "xlink:href", target);
                                return svgElement;
                            }

                            return svgElement.getAttributeNS(xlinkns, "xlink:href");
                        }

                        function text(textContent) {
                            if (textContent !== undefined) {
                                svgElement.textContent = textContent;
                                return svgElement;
                            }
                            return svgElement.textContent;
                        }
                    }

                }, { "./lib/compile": 2, "./lib/compile_template": 3, "add-event-listener": 5 }], 2: [function (require, module, exports) {
                    var parser = require('./domparser.js');
                    var svg = require('../');

                    module.exports = compile;

                    function compile(svgText) {
                        try {
                            svgText = addNamespaces(svgText);
                            return svg(parser.parseFromString(svgText, "text/xml").documentElement);
                        } catch (e) {
                            throw e;
                        }
                    }

                    function addNamespaces(text) {
                        if (!text) return;

                        var namespaces = 'xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg"';
                        var match = text.match(/^<\w+/);
                        if (match) {
                            var tagLength = match[0].length;
                            return text.substr(0, tagLength) + ' ' + namespaces + ' ' + text.substr(tagLength);
                        } else {
                            throw new Error('Cannot parse input text: invalid xml?');
                        }
                    }

                }, { "../": 1, "./domparser.js": 4 }], 3: [function (require, module, exports) {
                    module.exports = template;

                    var BINDING_EXPR = /{{(.+?)}}/;

                    function template(domNode) {
                        var allBindings = Object.create(null);
                        extractAllBindings(domNode, allBindings);

                        return {
                            link: function (model) {
                                Object.keys(allBindings).forEach(function (key) {
                                    var setter = allBindings[key];
                                    setter.forEach(changeModel);
                                });

                                function changeModel(setter) {
                                    setter(model);
                                }
                            }
                        };
                    }

                    function extractAllBindings(domNode, allBindings) {
                        var nodeType = domNode.nodeType;
                        var typeSupported = (nodeType === 1) || (nodeType === 3);
                        if (!typeSupported) return;
                        var i;
                        if (domNode.hasChildNodes()) {
                            var domChildren = domNode.childNodes;
                            for (i = 0; i < domChildren.length; ++i) {
                                extractAllBindings(domChildren[i], allBindings);
                            }
                        }

                        if (nodeType === 3) { // text
                            bindTextContent(domNode, allBindings);
                        }

                        if (!domNode.attributes) return; // this might be a text. Need to figure out what to do in that case

                        var attrs = domNode.attributes;
                        for (i = 0; i < attrs.length; ++i) {
                            bindDomAttribute(attrs[i], domNode, allBindings);
                        }
                    }

                    function bindDomAttribute(domAttribute, element, allBindings) {
                        var value = domAttribute.value;
                        if (!value) return; // unary attribute?

                        var modelNameMatch = value.match(BINDING_EXPR);
                        if (!modelNameMatch) return; // does not look like a binding

                        var attrName = domAttribute.localName;
                        var modelPropertyName = modelNameMatch[1];
                        var isSimpleValue = modelPropertyName.indexOf('.') < 0;

                        if (!isSimpleValue) throw new Error('simplesvg currently does not support nested bindings');

                        var propertyBindings = allBindings[modelPropertyName];
                        if (!propertyBindings) {
                            propertyBindings = allBindings[modelPropertyName] = [attributeSetter];
                        } else {
                            propertyBindings.push(attributeSetter);
                        }

                        function attributeSetter(model) {
                            element.setAttributeNS(null, attrName, model[modelPropertyName]);
                        }
                    }
                    function bindTextContent(element, allBindings) {
                        // todo reduce duplication
                        var value = element.nodeValue;
                        if (!value) return; // unary attribute?

                        var modelNameMatch = value.match(BINDING_EXPR);
                        if (!modelNameMatch) return; // does not look like a binding

                        var modelPropertyName = modelNameMatch[1];
                        var isSimpleValue = modelPropertyName.indexOf('.') < 0;

                        var propertyBindings = allBindings[modelPropertyName];
                        if (!propertyBindings) {
                            propertyBindings = allBindings[modelPropertyName] = [textSetter];
                        } else {
                            propertyBindings.push(textSetter);
                        }

                        function textSetter(model) {
                            element.nodeValue = model[modelPropertyName];
                        }
                    }

                }, {}], 4: [function (require, module, exports) {
                    module.exports = createDomparser();

                    function createDomparser() {
                        if (typeof DOMParser === 'undefined') {
                            return {
                                parseFromString: fail
                            };
                        }
                        return new DOMParser();
                    }

                    function fail() {
                        throw new Error('DOMParser is not supported by this platform. Please open issue here https://github.com/anvaka/simplesvg');
                    }

                }, {}], 5: [function (require, module, exports) {
                    addEventListener.removeEventListener = removeEventListener;
                    addEventListener.addEventListener = addEventListener;

                    module.exports = addEventListener;

                    var Events = null;

                    function addEventListener(el, eventName, listener, useCapture) {
                        Events = Events || (
                            document.addEventListener ?
                            { add: stdAttach, rm: stdDetach } :
                            { add: oldIEAttach, rm: oldIEDetach }
                        );

                        return Events.add(el, eventName, listener, useCapture)
                    }

                    function removeEventListener(el, eventName, listener, useCapture) {
                        Events = Events || (
                            document.addEventListener ?
                            { add: stdAttach, rm: stdDetach } :
                            { add: oldIEAttach, rm: oldIEDetach }
                        );

                        return Events.rm(el, eventName, listener, useCapture);
                    }

                    function stdAttach(el, eventName, listener, useCapture) {
                        el.addEventListener(eventName, listener, useCapture);
                    }

                    function stdDetach(el, eventName, listener, useCapture) {
                        el.removeEventListener(eventName, listener, useCapture);
                    }

                    function oldIEAttach(el, eventName, listener, useCapture) {
                        if (useCapture) {
                            throw new Error('cannot useCapture in oldIE');
                        }

                        el.attachEvent('on' + eventName, listener);
                    }

                    function oldIEDetach(el, eventName, listener, useCapture) {
                        el.detachEvent('on' + eventName, listener);
                    }

                }, {}], 6: [function (require, module, exports) {

                    // main code

                    // simply append to svg canvas that has been set up previously 
                    // when renderGraph() was called
                    var linksDom = document.body.getElementsByTagName('iframe')[0]
                                                .contentDocument.getElementById("links");

                    var nodesDom = document.body.getElementsByTagName('iframe')[0]
                                                .contentDocument.getElementById("nodes");

                    var clientRow = gdo.net.node[gdo.clientId].sectionRow;
                    var clientCol = gdo.net.node[gdo.clientId].sectionCol;

                    var basePath = "\\Web\\Graph\\graph\\" + folderNameDigit + "\\zoomed";
                    var fileName, nodesFilePath, linksFilePath;

                    for (var i = 0; i < 3; ++i) {
                        for (var j = 0; j < 3; ++j) {
                            if (i == 1 && j == 1) { // skip original partition
                                continue;
                            } else {
                                fileName = (clientRow + i) + "_" + (clientCol + j);
                                nodesFilePath = basePath + "\\nodes\\" + fileName + ".json";
                                linksFilePath = basePath + "\\links\\" + fileName + ".json";

                                console.log(fileName + " is being rendered.");

                                renderNodes(nodesFilePath);
                                renderLinks(linksFilePath);
                            }
                        }
                    }



                    // new optimised rendering, to read from binary pos files
                    function renderNodes(file) {

                        console.log("Rendering nodes from: " + file);

                        var xhr = new XMLHttpRequest();
                        xhr.open("GET", file, true);
                        xhr.send();

                        xhr.onreadystatechange = function () {
                            if (xhr.readyState == 4 && xhr.status == 200) {
                                nodes = JSON.parse(xhr.responseText);

                                /*
                                // currentNodes keep track of nodes to be rendered for this round
                                // previous bug: used 'nodes', instead of 'currentNodes' to render
                                // which resulted in some nodes & links being rendered extra times
                                var currentNodes = [];
                                for (var i = 2; i < data.length - 2; i += 3) {
                                    // push onto overall nodes array
                                    nodes.push([data[i], data[i + 1], data[i + 2]]);

                                    // push onto current nodes array for rendering of current partition
                                    currentNodes.push([data[i], data[i + 1], data[i + 2]]);

                                    // push onto most connected nodes
                                    if (data[i + 2] >= minLinks) {
                                        mostConnectedNodes.push([data[i], data[i + 1], data[i + 2], k]);       
                                    }

                                    k++;
                                }  */

                                // RENDERING
                                nodes.forEach(function (node) {

                                    //var inc = Math.round(rgbIncrement * node.NumLinks); //multiply rgbIncrement by no. of links each node has

                                    nodesDom.append("circle")
                                        .attr("r", zoomedRadius)
                                        .attr("cx", node.Pos.X)
                                        .attr("cy", node.Pos.Y)
                                        //.attr("fill", "rgb(" + (currentColor.r + inc) + "," + (currentColor.g + inc) + "," + (currentColor.b + inc) + ")");
                                        .attr("fill", "red");    // Nodes: UNUSED??
                                });

                            }
                        }
                    }


                    function renderLinks(file) {

                        console.log("Rendering links from: " + file);

                        var xhr = new XMLHttpRequest();
                        xhr.open("GET", file, true);
                        xhr.send();

                        xhr.onreadystatechange = function () {
                            if (xhr.readyState == 4 && xhr.status == 200) {
                                links = JSON.parse(xhr.responseText);
                                console.log("Time after reading linksPos.json: " + window.performance.now());

                                // render edges
                                links.forEach(function (link) {

                                    linksDom.append("line")
                                        .attr("x1", link.StartPos.X)
                                        .attr("y1", link.StartPos.Y)
                                        .attr("x2", link.EndPos.X)
                                        .attr("y2", link.EndPos.Y)
                                        .attr("stroke-width", zoomedStrokeWidth)
                                        .attr("stroke", "rgb(" + link.R + "," + link.G + "," + link.B + ")");
                                });

                                console.log("Time after appending links: " + window.performance.now());
                            }
                        };
                    }

                }, { "simplesvg": 1 }]
            }, {}, [6]);
        }
    }


    // improved renderGraph() implementation
    // @param (string) folderNameDigit: specifies which folder to read from
    // @param (boolean) zoomed: indicates if it's a zoomed graph; 'true' means zoomed
    $.connection.graphAppHub.client.renderGraph = function (folderNameDigit, zoomed) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            //alert("RENDER GRAPH: this should be called only once per graph...")

            gdo.consoleOut('.GRAPHRENDERER', 1, 'Instance - ' + gdo.clientId + ": Downloading Graph : " + "AppInstance_" + gdo.net.node[gdo.clientId].appInstanceId + "Partition_" + gdo.net.node[gdo.clientId].sectionRow + "_" + gdo.net.node[gdo.clientId].sectionCol);

            var basePath, fileName;
            var clientRow = gdo.net.node[gdo.clientId].sectionRow;
            var clientCol = gdo.net.node[gdo.clientId].sectionCol;

            if (!zoomed) {
                globalZoomed = false;
                basePath = "\\Web\\Graph\\graph\\" + folderNameDigit + "\\normal";
                fileName = clientRow + "_" + clientCol;

            } else {  // for zoomed in graph, read the file that's 1 row and 1 col more
                globalZoomed = true;
                basePath = "\\Web\\Graph\\graph\\" + folderNameDigit + "\\zoomed";
                fileName = (clientRow + 1) + "_" + (clientCol + 1);
            }

            var nodesFilePath = basePath + "\\nodes\\" + fileName + ".json";
            var linksFilePath = basePath + "\\links\\" + fileName + ".json";
            var allnodesFilePath = basePath + "\\nodes\\" + "all" + ".json";

            var settings = {
                // for SVG translation in each browser, since coordinates of data are spread across the whole section
                defaultDisplayDimension: {
                    width: gdo.net.node[gdo.clientId].width,
                    height: gdo.net.node[gdo.clientId].height
                },
                svgDom: document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("graphArea")
            };

            //Be sure that mostConnectedNodes is empty from previous Graphs
            mostConnectedNodes = [];

            (function e(t, n, r) { function s(o, u) { if (!n[o]) { if (!t[o]) { var a = typeof require == "function" && require; if (!u && a) return a(o, !0); if (i) return i(o, !0); var f = new Error("Cannot find module '" + o + "'"); throw f.code = "MODULE_NOT_FOUND", f } var l = n[o] = { exports: {} }; t[o][0].call(l.exports, function (e) { var n = t[o][1][e]; return s(n ? n : e) }, l, l.exports, e, t, n, r) } return n[o].exports } var i = typeof require == "function" && require; for (var o = 0; o < r.length; o++) s(r[o]); return s })({
                1: [function (require, module, exports) {
                    module.exports = svg;

                    svg.compile = require('./lib/compile');

                    var compileTemplate = svg.compileTemplate = require('./lib/compile_template');

                    var domEvents = require('add-event-listener');

                    var svgns = "http://www.w3.org/2000/svg";
                    var xlinkns = "http://www.w3.org/1999/xlink";

                    function svg(element, attrBag) {
                        var svgElement = augment(element);
                        if (attrBag === undefined) {
                            return svgElement;
                        }

                        var attributes = Object.keys(attrBag);
                        for (var i = 0; i < attributes.length; ++i) {
                            var attributeName = attributes[i];
                            var value = attrBag[attributeName];
                            if (attributeName === 'link') {
                                svgElement.link(value);
                            } else {
                                svgElement.attr(attributeName, value);
                            }
                        }

                        return svgElement;
                    }

                    function augment(element) {
                        var svgElement = element;

                        if (typeof element === "string") {
                            svgElement = window.document.createElementNS(svgns, element);
                        } else if (element.simplesvg) {
                            return element;
                        }

                        var compiledTempalte;

                        svgElement.simplesvg = true; // this is not good, since we are monkey patching svg
                        svgElement.attr = attr;
                        svgElement.append = append;
                        svgElement.link = link;
                        svgElement.text = text;

                        // add easy eventing
                        svgElement.on = on;
                        svgElement.off = off;

                        // data binding:
                        svgElement.dataSource = dataSource;

                        return svgElement;

                        function dataSource(model) {
                            if (!compiledTempalte) compiledTempalte = compileTemplate(svgElement);
                            compiledTempalte.link(model);
                            return svgElement;
                        }

                        function on(name, cb, useCapture) {
                            domEvents.addEventListener(svgElement, name, cb, useCapture);
                            return svgElement;
                        }

                        function off(name, cb, useCapture) {
                            domEvents.removeEventListener(svgElement, name, cb, useCapture);
                            return svgElement;
                        }

                        function append(content) {
                            var child = svg(content);
                            svgElement.appendChild(child);

                            return child;
                        }

                        function attr(name, value) {
                            if (arguments.length === 2) {
                                if (value !== null) {
                                    svgElement.setAttributeNS(null, name, value);
                                } else {
                                    svgElement.removeAttributeNS(null, name);
                                }

                                return svgElement;
                            }

                            return svgElement.getAttributeNS(null, name);
                        }

                        function link(target) {
                            if (arguments.length) {
                                svgElement.setAttributeNS(xlinkns, "xlink:href", target);
                                return svgElement;
                            }

                            return svgElement.getAttributeNS(xlinkns, "xlink:href");
                        }

                        function text(textContent) {
                            if (textContent !== undefined) {
                                svgElement.textContent = textContent;
                                return svgElement;
                            }
                            return svgElement.textContent;
                        }
                    }

                }, { "./lib/compile": 2, "./lib/compile_template": 3, "add-event-listener": 5 }], 2: [function (require, module, exports) {
                    var parser = require('./domparser.js');
                    var svg = require('../');

                    module.exports = compile;

                    function compile(svgText) {
                        try {
                            svgText = addNamespaces(svgText);
                            return svg(parser.parseFromString(svgText, "text/xml").documentElement);
                        } catch (e) {
                            throw e;
                        }
                    }

                    function addNamespaces(text) {
                        if (!text) return;

                        var namespaces = 'xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg"';
                        var match = text.match(/^<\w+/);
                        if (match) {
                            var tagLength = match[0].length;
                            return text.substr(0, tagLength) + ' ' + namespaces + ' ' + text.substr(tagLength);
                        } else {
                            throw new Error('Cannot parse input text: invalid xml?');
                        }
                    }

                }, { "../": 1, "./domparser.js": 4 }], 3: [function (require, module, exports) {
                    module.exports = template;

                    var BINDING_EXPR = /{{(.+?)}}/;

                    function template(domNode) {
                        var allBindings = Object.create(null);
                        extractAllBindings(domNode, allBindings);

                        return {
                            link: function (model) {
                                Object.keys(allBindings).forEach(function (key) {
                                    var setter = allBindings[key];
                                    setter.forEach(changeModel);
                                });

                                function changeModel(setter) {
                                    setter(model);
                                }
                            }
                        };
                    }

                    function extractAllBindings(domNode, allBindings) {
                        var nodeType = domNode.nodeType;
                        var typeSupported = (nodeType === 1) || (nodeType === 3);
                        if (!typeSupported) return;
                        var i;
                        if (domNode.hasChildNodes()) {
                            var domChildren = domNode.childNodes;
                            for (i = 0; i < domChildren.length; ++i) {
                                extractAllBindings(domChildren[i], allBindings);
                            }
                        }

                        if (nodeType === 3) { // text:
                            bindTextContent(domNode, allBindings);
                        }

                        if (!domNode.attributes) return; // this might be a text. Need to figure out what to do in that case

                        var attrs = domNode.attributes;
                        for (i = 0; i < attrs.length; ++i) {
                            bindDomAttribute(attrs[i], domNode, allBindings);
                        }
                    }

                    function bindDomAttribute(domAttribute, element, allBindings) {
                        var value = domAttribute.value;
                        if (!value) return; // unary attribute?

                        var modelNameMatch = value.match(BINDING_EXPR);
                        if (!modelNameMatch) return; // does not look like a binding

                        var attrName = domAttribute.localName;
                        var modelPropertyName = modelNameMatch[1];
                        var isSimpleValue = modelPropertyName.indexOf('.') < 0;

                        if (!isSimpleValue) throw new Error('simplesvg currently does not support nested bindings');

                        var propertyBindings = allBindings[modelPropertyName];
                        if (!propertyBindings) {
                            propertyBindings = allBindings[modelPropertyName] = [attributeSetter];
                        } else {
                            propertyBindings.push(attributeSetter);
                        }

                        function attributeSetter(model) {
                            element.setAttributeNS(null, attrName, model[modelPropertyName]);
                        }
                    }
                    function bindTextContent(element, allBindings) {
                        // todo reduce duplication
                        var value = element.nodeValue;
                        if (!value) return; // unary attribute?

                        var modelNameMatch = value.match(BINDING_EXPR);
                        if (!modelNameMatch) return; // does not look like a binding

                        var modelPropertyName = modelNameMatch[1];
                        var isSimpleValue = modelPropertyName.indexOf('.') < 0;

                        var propertyBindings = allBindings[modelPropertyName];
                        if (!propertyBindings) {
                            propertyBindings = allBindings[modelPropertyName] = [textSetter];
                        } else {
                            propertyBindings.push(textSetter);
                        }

                        function textSetter(model) {
                            element.nodeValue = model[modelPropertyName];
                        }
                    }

                }, {}], 4: [function (require, module, exports) {
                    module.exports = createDomparser();

                    function createDomparser() {
                        if (typeof DOMParser === 'undefined') {
                            return {
                                parseFromString: fail
                            };
                        }
                        return new DOMParser();
                    }

                    function fail() {
                        throw new Error('DOMParser is not supported by this platform. Please open issue here https://github.com/anvaka/simplesvg');
                    }

                }, {}], 5: [function (require, module, exports) {
                    addEventListener.removeEventListener = removeEventListener;
                    addEventListener.addEventListener = addEventListener;

                    module.exports = addEventListener;

                    var Events = null

                    function addEventListener(el, eventName, listener, useCapture) {
                        Events = Events || (
                            document.addEventListener ?
                            { add: stdAttach, rm: stdDetach } :
                            { add: oldIEAttach, rm: oldIEDetach }
                        );

                        return Events.add(el, eventName, listener, useCapture)
                    }

                    function removeEventListener(el, eventName, listener, useCapture) {
                        Events = Events || (
                            document.addEventListener ?
                            { add: stdAttach, rm: stdDetach } :
                            { add: oldIEAttach, rm: oldIEDetach }
                        );

                        return Events.rm(el, eventName, listener, useCapture);
                    }

                    function stdAttach(el, eventName, listener, useCapture) {
                        el.addEventListener(eventName, listener, useCapture);
                    }

                    function stdDetach(el, eventName, listener, useCapture) {
                        el.removeEventListener(eventName, listener, useCapture);
                    }

                    function oldIEAttach(el, eventName, listener, useCapture) {
                        if (useCapture) {
                            throw new Error('cannot useCapture in oldIE');
                        }

                        el.attachEvent('on' + eventName, listener);
                    }

                    function oldIEDetach(el, eventName, listener, useCapture) {
                        el.detachEvent('on' + eventName, listener);
                    }

                }, {}], 6: [function (require, module, exports) {

                    // main code

                    var svg = require('simplesvg');

                    // reset SVG by removing all child elements (if any)
                    while (settings.svgDom.firstChild) {
                        settings.svgDom.removeChild(settings.svgDom.firstChild);
                    }


                    // set up svgRoot

                    // svg() is a function provided by simplesvg, which creates a svg element,
                    // and augment the elements' capabilities by defining functions such as attr()
                    // which replaces DOM element's setAttribute() 

                    var svgRoot = svg("svg");

                    svgRoot.attr("width", "100%")
                         .attr("height", "100%") //previously: settings.defaultDisplayDimension.height
                         .attr("id", "graph");

                    settings.svgDom.appendChild(svgRoot);


                    var linksDom = svgRoot.append("g")
                        .attr("id", "links");

                    var nodesDom = svgRoot.append("g")
                        .attr("id", "nodes");

                    var highlightDom = svgRoot.append("g")
                        .attr("id", "highlight");

                    var labelsDom = svgRoot.append("g")
                        .attr("id", "labels");


                    console.log("Time before rendering: " + window.performance.now());

                    loadAllNodes();

                    console.log("Time before reading nodesPos.json: " + window.performance.now());
                    renderNodes(nodesFilePath);
                    console.log("Time before reading linksPos.json: " + window.performance.now());
                    renderLinks(linksFilePath);

                    function loadAllNodes() {
                        var xhr = new XMLHttpRequest();
                        xhr.open("GET", allnodesFilePath, true);
                        xhr.send();

                        xhr.onreadystatechange = function () {
                            if (xhr.readyState == 4 && xhr.status == 200) {
                                allnodes = JSON.parse(xhr.responseText);
                            }
                        }
                    }

                    // new optimised rendering, to read from distributed json files
                    function renderNodes(file) {

                        console.log("Rendering nodes from: " + file);

                        var xhr = new XMLHttpRequest();
                        xhr.open("GET", file, true);
                        xhr.send();

                        xhr.onreadystatechange = function () {
                            if (xhr.readyState == 4 && xhr.status == 200) {
                                nodes = JSON.parse(xhr.responseText);
                                console.log("Time after reading nodesPos.json: " + window.performance.now());

                                var partitionPos = file.match(/(\d+)_(\d+)\.json/);   //row and col of section , I could get them directly from gdo

                                // RENDERING

                                // offset here is used to set viewBox property of SVG canvas, 
                                // to make SVG top left corner starts from offset.x and offset.y
                                // if setting translation of each element, it should then be 
                                // negative, to make the whole element closer towards (0,0)
                                var offset = {
                                    x: partitionPos[2] * settings.defaultDisplayDimension.width,
                                    y: partitionPos[1] * settings.defaultDisplayDimension.height
                                };

                                svgRoot.attr("viewBox", offset.x + " " + offset.y + " " + settings.defaultDisplayDimension.width + " " + settings.defaultDisplayDimension.height);

                                //var radius = zoomed ? zoomedRadius : normalRadius;

                                nodes.forEach(function (node) {

                                    if (node.NumLinks > minLinks) {
                                        mostConnectedNodes.push(node);
                                    }

                                    var radius = allNodesSameSize ? normalRadius : Math.ceil(node.Size);

                                    //var inc = Math.round(rgbIncrement * node.NumLinks); //multiply rgbIncrement by no. of links each node has
                                    nodesDom.append("circle")
                                        .attr("r", radius) // radius
                                        .attr("cx", node.Pos.X)
                                        .attr("cy", node.Pos.Y)
                                        //.attr("fill", "rgb(" + (currentColor.r + inc) + "," + (currentColor.g + inc) + "," + (currentColor.b + inc) + ")");
                                        .attr("fill", "rgb(" + node.R + "," + node.G + "," + node.B + ")");
                                });

                                console.log("Time after appending nodes: " + window.performance.now());

                            }
                        }
                    }

                    function renderLinks(file) {

                        console.log("Rendering links from: " + file);

                        var xhr = new XMLHttpRequest();
                        xhr.open("GET", file, true);
                        xhr.send();

                        xhr.onreadystatechange = function () {
                            if (xhr.readyState == 4 && xhr.status == 200) {
                                links = JSON.parse(xhr.responseText);
                                console.log("Time after reading linksPos.json: " + window.performance.now());

                                // render edges
                                var strokeWidth = zoomed ? zoomedStrokeWidth : normalStrokeWidth;

                                links.forEach(function (link) {
                                    linksDom.append("line")
                                        .attr("x1", link.StartPos.X)
                                        .attr("y1", link.StartPos.Y)
                                        .attr("x2", link.EndPos.X)
                                        .attr("y2", link.EndPos.Y)
                                        .attr("stroke-width", strokeWidth)
                                        .attr("stroke", "rgb(" + link.R + "," + link.G + "," + link.B + ")");
                                });
                                console.log("Time after appending links: " + window.performance.now());
                            }

                        };
                    }

                }, { "simplesvg": 1 }]
            }, {}, [6]);
        }
    }
});

//gdo.net.app["Graph"].displayMode = 0;

gdo.net.app["Graph"].initClient = function () {
    gdo.consoleOut('.GRAPHRENDERER', 1, 'Initializing Graph Renderer App Client at Node ' + gdo.clientId);
    gdo.net.app["Graph"].server.requestRendering(gdo.net.node[gdo.clientId].appInstanceId);
}

gdo.net.app["Graph"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.net.app["Graph"].server.requestRendering(gdo.controlId);
    gdo.consoleOut('.GRAPHRENDERER', 1, 'Initializing Graph Renderer App Control at Instance ' + gdo.controlId);
}

gdo.net.app["Graph"].terminateClient = function () {
    gdo.consoleOut('.GRAPHRENDERER', 1, 'Terminating Graph Renderer App Client at Node ' + clientId);
}

gdo.net.app["Graph"].ternminateControl = function () {
    gdo.consoleOut('.GRAPHRENDERER', 1, 'Terminating Graph Renderer App Control at Instance ' + gdo.controlId);
}
