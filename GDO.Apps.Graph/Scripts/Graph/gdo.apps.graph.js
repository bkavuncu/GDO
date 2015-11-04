/*
1. Read respective browser data file
2. Translate SVG based on browser coordinates
3. Render nodes & links
*/



//document.body
//.getElementsByTagName('iframe')[0]
//.onload = function () {
 //   console.log("Time after rendering (using onload): " + window.performance.now());
//};




$(function () {
    gdo.consoleOut('.GRAPHRENDERER', 1, 'Loaded Graph Renderer JS');

    /* global variables */

    // arrays to store data
    var links, nodes, mostConnectedNodes, labels, k;
    var minLinks = 3;

    // boolean to track if current graph is zoomed
    var globalZoomed;

    // set size of nodes and links
    var zoomedRadius = 5;
    var zoomedStrokeWidth = 2;
    var zoomedFontSize = 16;
    var normalRadius = 3;
    var normalStrokeWidth = 1;
    var normalFontSize = 10;

    // rgb setting to track current color scheme
    var r, g, b;
    r = 0;
    g = 50;
    b = 20;   // range is 0 to 255

    // rgb setting for highlighted nodes
    var highlightR, highlightG, highlightB;

    highlightR = 207;
    highlightG = 35;
    highlightB = 49;


    // r 50 g 100 b 0 (lime green); r 0 g 50 b 100 (nice blue); 
    // r 50, g 100, b 50 (pastel green)


    var maxLinks = 5;
    var maxRGB = Math.max(r, g, b);
    //console.log(maxRGB);
    var rgbIncrement = (255 - maxRGB) / maxLinks;
    //amount of increment remaining divide by no. of possible links 
    // (to know how much to increase for every increase in link)

    //console.log(rgbIncrement);


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
            logDom.append("<p>" + message + "</p>");

            scroll_bottom(logDom[0]);

        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            // do nothing
        }
    }


    $.connection.graphAppHub.client.logTime = function (message) {

        var logDom = $("iframe").contents().find("#message_from_server");
        // append new "p" element for each msg, instead of replacing existing one
        logDom.append("<p>" + message + "</p>");

        scroll_bottom(logDom[0]);
    }


    var overallFolder; // defined in renderGraph()
    var nodeList;

    $.connection.graphAppHub.client.renderSearch = function (folderName) {

        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            var basePath = "\\Web\\Graph\\graph\\" + overallFolder + "\\search\\" + folderName + "\\";
            var nodesPath = basePath + "nodes.json";
            var linksPath = basePath + "links.json";
            searchPath = nodesPath;

            var highlightDom = document.body
                        .getElementsByTagName('iframe')[0]
                        .contentDocument.getElementById("highlight");

            var linksDom = highlightDom.append("g")
                           .attr("id", "sublinks");

            renderSearchLinks(linksPath);
            renderSearchNodes(nodesPath);
            

            function renderSearchNodes(file) {
                var xhr = new XMLHttpRequest();

                xhr.open("GET", file, true);
                xhr.send();

                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        nodeList = JSON.parse(xhr.responseText);

                        var radius;
                        if (!globalZoomed) {
                            radius = normalRadius + 2;
                        } else {
                            radius = zoomedRadius + 2;
                        }

                        nodeList.forEach(function (node) {

                                highlightDom.append("circle")
                                    .attr("r", radius)
                                    .attr("cx", node.pos.x)
                                    .attr("cy", node.pos.y)
                                    .attr("fill", "rgb(" + highlightR + "," + highlightG + "," + highlightB + ")")
                                ;
                            
                        });

                    }
                }
            }


            function renderSearchLinks(file) {
                var xhr = new XMLHttpRequest();

                xhr.open("GET", file, true);
                xhr.send();

                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        var linkList = JSON.parse(xhr.responseText);

                        var strokeWidth;

                        if (!globalZoomed) {
                            strokeWidth = normalStrokeWidth;
                        } else {
                            strokeWidth = zoomedStrokeWidth;
                        }

                        linkList.forEach(function (link) {

                            linksDom.append("line")
                                .attr("x1", link.startPos.x)
                                .attr("y1", link.startPos.y)
                                .attr("x2", link.endPos.x)
                                .attr("y2", link.endPos.y)
                                .attr("stroke-width", strokeWidth)
                                .attr("stroke", "#333");

                        });

                    }
                }
            }
        }
    }


    $.connection.graphAppHub.client.renderSearchLabels = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            var highlightDom = document.body
                                    .getElementsByTagName('iframe')[0]
                                    .contentDocument.getElementById("highlight");

            var fontSize, padding;

            if (!globalZoomed) {
                fontSize = normalFontSize;
                padding = 3;
            } else {
                fontSize = zoomedFontSize;
                padding = 4;
            }

            nodeList.forEach(function (node) {

                    highlightDom.append("text")
                        .attr("x", node.pos.x + padding)
                        .attr("y", node.pos.y - padding)
                        .text(node.label)
                        .attr("font-size", fontSize)
                        .attr("fill", "white");
                    ;
                
            });

        }
    }

    $.connection.graphAppHub.client.hideSublinks = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            var dom = document.body
                                    .getElementsByTagName('iframe')[0]
                                    .contentDocument.getElementById("sublinks");

            while (dom.firstChild) {
                dom.removeChild(dom.firstChild);
            }
        }
    }

    $.connection.graphAppHub.client.setRGB = function (colourScheme) {
        gdo.consoleOut('.GRAPHRENDERER', 1, 'Setting colour scheme to: ' + colourScheme);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            if (colourScheme == "blue") {
                r = 0;
                g = 20;
                b = 50;
            } else if (colourScheme == "green") {
                r = 0;
                g = 50;
                b = 20;
            } else if (colourScheme == "yellow") {
                r = 30;
                g = 30;
                b = 0;
            } else if (colourScheme == "orange") {
                r = 50;
                g = 20;
                b = 0;
            }
        }
    }


    $.connection.graphAppHub.client.hideHighlight = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            var highlightDom = document.body
                                    .getElementsByTagName('iframe')[0]
                                    .contentDocument.getElementById("highlight");

            while (highlightDom.firstChild) {
                highlightDom.removeChild(highlightDom.firstChild);
            }
        }
    }


    $.connection.graphAppHub.client.renderMostConnectedNodes = function (numLinks) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            var highlightDom = document.body
                                    .getElementsByTagName('iframe')[0]
                                    .contentDocument.getElementById("highlight");

            var radius;
            if (!globalZoomed) {
                radius = normalRadius + 2;
            } else {
                radius = zoomedRadius + 2;
            }

            mostConnectedNodes.forEach(function (node) {

                if (node[2] >= numLinks) {

                    highlightDom.append("circle")
                        .attr("r", radius)
                        .attr("cx", node[0])
                        .attr("cy", node[1])
                        .attr("fill", "rgb(" + highlightR + "," + highlightG + "," + highlightB + ")")
                    ;
                    console.log("node pos: " + node[0] + ", " + node[1]);
                }
            });

        }
    }


    $.connection.graphAppHub.client.renderMostConnectedLabels = function (numLinks) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            var highlightDom = document.body
                                    .getElementsByTagName('iframe')[0]
                                    .contentDocument.getElementById("highlight");


            var fontSize, padding;

            if (!globalZoomed) {
                fontSize = normalFontSize;
                padding = 3;
            } else {
                fontSize = zoomedFontSize;
                padding = 4;
            }


            mostConnectedNodes.forEach(function (node) {

                if (node[2] >= numLinks) {
                    console.log("label: " + labels[node[3]] + ", pos: " + node[0] + ", " + node[1] + ", node id: " + node[3]);

                    highlightDom.append("text")
                        .attr("x", node[0] + padding)
                        .attr("y", node[1] - padding)
                        .text(labels[node[3]])
                        .attr("font-size", fontSize)
                        .attr("fill", "white");
                    ;

                    
                }
            });



        }
    }


    $.connection.graphAppHub.client.hideNodes = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            var nodesDom = document.body
                                    .getElementsByTagName('iframe')[0]
                                    .contentDocument.getElementById("nodes")

            while (nodesDom.firstChild) {
                nodesDom.removeChild(nodesDom.firstChild);
            }
        }
    }

    $.connection.graphAppHub.client.renderNodes = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            var nodesDom = document.body
                                    .getElementsByTagName('iframe')[0]
                                    .contentDocument.getElementById("nodes");

            var radius;
            if (!globalZoomed) {
                radius = normalRadius;
            } else {
                radius = zoomedRadius;
            }

            nodes.forEach(function (node) {

                var inc = Math.round(rgbIncrement * node[2]); //multiply rgbIncrement by no. of links each node has

                nodesDom.append("circle")
                    .attr("r", radius)
                    .attr("cx", node[0])
                    .attr("cy", node[1])
                    .attr("fill", "rgb(" + (r + inc) + "," + (g + inc) + "," + (b + inc) + ")")
                ;

            });

        }
    }

    //TODO: Refactor duplicating code for hideLinks and hideLabels
    $.connection.graphAppHub.client.hideLinks = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            var linksDom = document.body
                                    .getElementsByTagName('iframe')[0]
                                    .contentDocument.getElementById("links")

            while (linksDom.firstChild) {
                linksDom.removeChild(linksDom.firstChild);
            }
        }
    }

    //TODO: change name to showLinks
    $.connection.graphAppHub.client.renderLinks = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            var linksDom = document.body
                                    .getElementsByTagName('iframe')[0]
                                    .contentDocument.getElementById("links");

            var strokeWidth;

            if (!globalZoomed) {
                strokeWidth = normalStrokeWidth;
            } else {
                strokeWidth = zoomedStrokeWidth;
            }

            links.forEach(function (link) {

                linksDom.append("line")
                    .attr("x1", link[0])
                    .attr("y1", link[1])
                    .attr("x2", link[2])
                    .attr("y2", link[3])
                    .attr("stroke-width", strokeWidth)
                    .attr("stroke", "#333");

            });

        }
    }



    $.connection.graphAppHub.client.hideLabels = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            var labelsDom = document.body
                                    .getElementsByTagName('iframe')[0]
                                    .contentDocument.getElementById("labels");

            while (labelsDom.firstChild) {
                labelsDom.removeChild(labelsDom.firstChild);
            }
        }
    }

    $.connection.graphAppHub.client.renderLabels = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            var labelsDom = document.body
                                    .getElementsByTagName('iframe')[0]
                                    .contentDocument.getElementById("labels");

            var fontSize, padding;

            if (!globalZoomed) {
                fontSize = normalFontSize;
                padding = 2;
            } else {
                fontSize = zoomedFontSize;
                padding = 3;
            }



            nodes.forEach(function (node, index) {

                labelsDom.append("text")
                    .attr("x", node[0] + padding)
                    .attr("y", node[1] - padding)
                    .text(labels[index])
                    .attr("font-size", fontSize)
                    .attr("fill", "white");
                ;

            });
        }
    }

    $.connection.graphAppHub.client.pan = function (direction) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            var panRate = 10;

            var svgElement = document.body
                                    .getElementsByTagName('iframe')[0]
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
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
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
                    addEventListener.removeEventListener = removeEventListener
                    addEventListener.addEventListener = addEventListener

                    module.exports = addEventListener

                    var Events = null

                    function addEventListener(el, eventName, listener, useCapture) {
                        Events = Events || (
                          document.addEventListener ?
    { add: stdAttach, rm: stdDetach } :
    { add: oldIEAttach, rm: oldIEDetach }
                        )

                        return Events.add(el, eventName, listener, useCapture)
                    }

                    function removeEventListener(el, eventName, listener, useCapture) {
                        Events = Events || (
                          document.addEventListener ?
    { add: stdAttach, rm: stdDetach } :
    { add: oldIEAttach, rm: oldIEDetach }
                        )

                        return Events.rm(el, eventName, listener, useCapture)
                    }

                    function stdAttach(el, eventName, listener, useCapture) {
                        el.addEventListener(eventName, listener, useCapture)
                    }

                    function stdDetach(el, eventName, listener, useCapture) {
                        el.removeEventListener(eventName, listener, useCapture)
                    }

                    function oldIEAttach(el, eventName, listener, useCapture) {
                        if (useCapture) {
                            throw new Error('cannot useCapture in oldIE')
                        }

                        el.attachEvent('on' + eventName, listener)
                    }

                    function oldIEDetach(el, eventName, listener, useCapture) {
                        el.detachEvent('on' + eventName, listener)
                    }

                }, {}], 6: [function (require, module, exports) {

                    // main code

                    // simply append to svg canvas that has been set up previously 
                    // when renderGraph() was called
                    var linksDom = document.body
                                    .getElementsByTagName('iframe')[0]
                                    .contentDocument.getElementById("links");

                    var nodesDom = document.body
                                    .getElementsByTagName('iframe')[0]
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
                                nodesFilePath = basePath + "\\nodes\\" + fileName + ".bin";
                                linksFilePath = basePath + "\\links\\" + fileName + ".bin";
                                labelsFilePath = basePath + "\\labels\\" + fileName + ".json";

                                console.log(fileName + " is being rendered.");

                                renderNodes(nodesFilePath);
                                renderLinks(linksFilePath);
                                readPartitionLabels(labelsFilePath);
                            }
                        }
                    }



                    // new optimised rendering, to read from binary pos files
                    function renderNodes(file) {

                        console.log("Rendering nodes from: " + file);

                        var xhr = new XMLHttpRequest();
                        xhr.open("GET", file, true);
                        xhr.responseType = "arraybuffer";
                        xhr.send();

                        xhr.onreadystatechange = function () {
                            var rawBuffer = xhr.response;

                            if (rawBuffer)
                                var data = new Float32Array(rawBuffer);  // will auto-format buffer, and convert byte into float array

                            if (data) {    // if condition needed because data may not be ready the first time this function is called
                                // partitionPos = [row, col]
                                var partitionPos = [data[0], data[1]];

                                // nodes = [[x, y, numLinks], [], ...]

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
                                }

                                /* 
                                //for debugging
                                console.log("partitionPos x: " + partitionPos[0]);
                                console.log("partitionPos y: " + partitionPos[1]);
                                console.log("nodes length: " + nodes.length);
                                console.log("nodes data: ")
                                console.log(nodes);
                                */


                                // rendering                               

                                currentNodes.forEach(function (node) {

                                    var inc = Math.round(rgbIncrement * node[2]);

                                    nodesDom.append("circle")
                                        .attr("r", zoomedRadius)
                                        .attr("cx", node[0])
                                        .attr("cy", node[1])
                                        .attr("fill", "rgb(" + (r + inc) + "," + (g + inc) + "," + (b + inc) + ")")
                                    ;

                                });

                            }
                        }
                    }


                    function renderLinks(file) {

                        console.log("Rendering links from: " + file);

                        var xhr = new XMLHttpRequest();
                        xhr.open("GET", file, true);
                        xhr.responseType = "arraybuffer";
                        xhr.send();

                        xhr.onreadystatechange = function () {
                            var rawBuffer = xhr.response;

                            if (rawBuffer)
                                var data = new Float32Array(rawBuffer);  // will auto-format buffer, and convert byte into float array

                            if (data) {    // data may not be ready the first time this function is called

                                // partitionPos = [row, col]
                                var partitionPos = [data[0], data[1]];

                                // links = [[x1, y1, x2, y2], [], ...]
                                var currentLinks = [];

                                // read links data and add each link onto array
                                for (var i = 2; i < data.length - 3; i += 4) {
                                    links.push([data[i], data[i + 1], data[i + 2], data[i + 3]]);
                                    currentLinks.push([data[i], data[i + 1], data[i + 2], data[i + 3]]);
                                }

                                // render edges

                                currentLinks.forEach(function (link) {

                                    linksDom.append("line")
                                        .attr("x1", link[0])
                                        .attr("y1", link[1])
                                        .attr("x2", link[2])
                                        .attr("y2", link[3])
                                        .attr("stroke-width", zoomedStrokeWidth)
                                        .attr("stroke", "#333"); //B8B8B8
                                });

                            }

                        };
                    }


                    function readPartitionLabels(file) {
                        var xhr = new XMLHttpRequest();

                        xhr.open("GET", file, true);
                        xhr.send();

                        xhr.onreadystatechange = function () {
                            if (xhr.readyState == 4 && xhr.status == 200) {
                                data = JSON.parse(xhr.responseText);

                                data.forEach(function (label) {
                                    labels.push(label);
                                }
                                );

                            }
                        }
                    }

                }, { "simplesvg": 1 }]
            }, {}, [6]);
        }
    }


    // improved renderGraph() implementation
    // @param (string) folderNameDigit: specifies which folder to read from
    // @param (boolean) zoomed: indicates if it's a zoomed graph; 'true' means zoomed
    $.connection.graphAppHub.client.renderGraph = function (folderNameDigit, zoomed) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            gdo.consoleOut('.GRAPHRENDERER', 1, 'Instance - ' + gdo.clientId + ": Downloading Graph : " + "AppInstance_" + gdo.net.node[gdo.clientId].appInstanceId + "Partition_" + gdo.net.node[gdo.clientId].sectionRow + "_" + gdo.net.node[gdo.clientId].sectionCol);

            var basePath, fileName, nodesFilePath, linksFilePath, labelsFilePath;
            var clientRow = gdo.net.node[gdo.clientId].sectionRow;
            var clientCol = gdo.net.node[gdo.clientId].sectionCol;

            overallFolder = folderNameDigit;

            if (!zoomed) {
                globalZoomed = false;
                basePath = "\\Web\\Graph\\graph\\" + folderNameDigit + "\\normal";
                fileName = clientRow + "_" + clientCol;

                /*
                linksFilePath = "\\Web\\Graph\\graph\\" + folderNameDigit + "\\normal\\links\\" + gdo.net.node[gdo.clientId].sectionRow + "_" + gdo.net.node[gdo.clientId].sectionCol + ".bin";
                */
            } else {  // for zoomed in graph, read the file that's 1 row and 1 col more
                globalZoomed = true;
                basePath = "\\Web\\Graph\\graph\\" + folderNameDigit + "\\zoomed";
                fileName = (clientRow + 1) + "_" + (clientCol + 1);
            }

            nodesFilePath = basePath + "\\nodes\\" + fileName + ".bin";
            linksFilePath = basePath + "\\links\\" + fileName + ".bin";
            labelsFilePath = basePath + "\\labels\\" + fileName + ".json";

            var settings = {
                // for SVG translation in each browser, since coordinates of data are spread across the whole section
                defaultDisplayDimension: {
                    width: gdo.net.node[gdo.clientId].width,
                    height: gdo.net.node[gdo.clientId].height
                },
                svgDom: document.body
                                    .getElementsByTagName('iframe')[0]
                                    .contentDocument.getElementById("graphArea")
            };


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
                    addEventListener.removeEventListener = removeEventListener
                    addEventListener.addEventListener = addEventListener

                    module.exports = addEventListener

                    var Events = null

                    function addEventListener(el, eventName, listener, useCapture) {
                        Events = Events || (
                          document.addEventListener ?
    { add: stdAttach, rm: stdDetach } :
    { add: oldIEAttach, rm: oldIEDetach }
                        )

                        return Events.add(el, eventName, listener, useCapture)
                    }

                    function removeEventListener(el, eventName, listener, useCapture) {
                        Events = Events || (
                          document.addEventListener ?
    { add: stdAttach, rm: stdDetach } :
    { add: oldIEAttach, rm: oldIEDetach }
                        )

                        return Events.rm(el, eventName, listener, useCapture)
                    }

                    function stdAttach(el, eventName, listener, useCapture) {
                        el.addEventListener(eventName, listener, useCapture)
                    }

                    function stdDetach(el, eventName, listener, useCapture) {
                        el.removeEventListener(eventName, listener, useCapture)
                    }

                    function oldIEAttach(el, eventName, listener, useCapture) {
                        if (useCapture) {
                            throw new Error('cannot useCapture in oldIE')
                        }

                        el.attachEvent('on' + eventName, listener)
                    }

                    function oldIEDetach(el, eventName, listener, useCapture) {
                        el.detachEvent('on' + eventName, listener)
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

                    console.log("Time before reading nodesPos.bin: " + window.performance.now());
                    renderNodes(nodesFilePath);
                    console.log("Time before reading linksPos.bin: " + window.performance.now());
                    renderLinks(linksFilePath);

                    // read in labels and store in variable 'labels' for rendering later
                    readLabels(labelsFilePath);

                    // new optimised rendering, to read from binary pos files
                    function renderNodes(file) {

                        console.log("Rendering nodes from: " + file);

                        var xhr = new XMLHttpRequest();
                        xhr.open("GET", file, true);
                        xhr.responseType = "arraybuffer";
                        xhr.send();

                        xhr.onreadystatechange = function () {
                            var rawBuffer = xhr.response;

                            if (rawBuffer)
                                var data = new Float32Array(rawBuffer);  // will auto-format buffer, and convert byte into float array

                            if (data) {    // if condition needed because data may not be ready the first time this function is called
                                console.log("Time after reading nodesPos.bin: " + window.performance.now());

                                // partitionPos = [row, col]
                                var partitionPos = [data[0], data[1]];

                                // nodes = [[x, y, numLinks], [], ...]
                                // global variable
                                nodes = [];
                                mostConnectedNodes = [];

                                k = 0; // to keep track of nodes index within nodes array

                                for (var i = 2; i < data.length - 2; i += 3) {
                                    nodes.push([data[i], data[i + 1], data[i + 2]]);

                                    // last array element is index of node, so as to identify its label later
                                    if (data[i + 2] >= minLinks) {
                                        mostConnectedNodes.push([data[i], data[i + 1], data[i + 2], k]);
                                    }

                                    k++;
                                }

                                console.log("value of k : " + k);
                                /* 
                                //for debugging

                                console.log("partitionPos x: " + partitionPos[0]);
                                console.log("partitionPos y: " + partitionPos[1]);
                                console.log("nodes length: " + nodes.length);
                                console.log("nodes data: ")
                                console.log(nodes);
                                */


                                // rendering

                                // offset here is used to set viewBox property of SVG canvas, 
                                // to make SVG top left corner starts from offset.x and offset.y
                                // if setting translation of each element, it should then be 
                                // negative, to make the whole element closer towards (0,0)
                                var offset = {
                                    x: partitionPos[1] * settings.defaultDisplayDimension.width,
                                    y: partitionPos[0] * settings.defaultDisplayDimension.height
                                };

                                svgRoot.attr("viewBox", offset.x + " " + offset.y + " " + settings.defaultDisplayDimension.width + " " + settings.defaultDisplayDimension.height);


                                var radius;
                                if (!zoomed) {
                                    radius = normalRadius;
                                } else {
                                    radius = zoomedRadius;
                                }

                                nodes.forEach(function (node) {

                                    var inc = Math.round(rgbIncrement * node[2]); //multiply rgbIncrement by no. of links each node has

                                    nodesDom.append("circle")
                                        .attr("r", radius)
                                        .attr("cx", node[0])
                                        .attr("cy", node[1])
                                        .attr("fill", "rgb(" + (r + inc) + "," + (g + inc) + "," + (b + inc) + ")")
                                    ;

                                });

                                console.log("Time after appending nodes: " + window.performance.now());

                            }
                        }
                    }


                    function renderLinks(file) {

                        console.log("Rendering links from: " + file);

                        var xhr = new XMLHttpRequest();
                        xhr.open("GET", file, true);
                        xhr.responseType = "arraybuffer";
                        xhr.send();

                        xhr.onreadystatechange = function () {
                            var rawBuffer = xhr.response;

                            if (rawBuffer)
                                var data = new Float32Array(rawBuffer);  // will auto-format buffer, and convert byte into float array

                            if (data) {    // data may not be ready the first time this function is called

                                console.log("Time after reading linksPos.bin: " + window.performance.now());

                                // partitionPos = [row, col]
                                var partitionPos = [data[0], data[1]];

                                // links = [[x1, y1, x2, y2], [], ...]
                                links = [];

                                // read links data and add each link onto array
                                for (var i = 2; i < data.length - 3; i += 4) {
                                    links.push([data[i], data[i + 1], data[i + 2], data[i + 3]]);
                                }

                                // render edges

                                var strokeWidth;
                                if (!zoomed)
                                    strokeWidth = normalStrokeWidth;
                                else
                                    strokeWidth = zoomedStrokeWidth;


                                links.forEach(function (link) {

                                    linksDom.append("line")
                                        .attr("x1", link[0])
                                        .attr("y1", link[1])
                                        .attr("x2", link[2])
                                        .attr("y2", link[3])
                                        .attr("stroke-width", strokeWidth)
                                        .attr("stroke", "#333"); //B8B8B8
                                });

                                console.log("Time after appending links: " + window.performance.now());
                            }

                        };
                    }

                    function readLabels(file) {
                        var xhr = new XMLHttpRequest();

                        xhr.open("GET", file, true);
                        xhr.send();

                        xhr.onreadystatechange = function () {
                            if (xhr.readyState == 4 && xhr.status == 200) {
                                labels = JSON.parse(xhr.responseText);
                            }
                        }
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
