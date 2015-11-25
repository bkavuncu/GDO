/*
1. Read respective browser data file
2. Translate SVG based on browser coordinates
3. Render nodes & links
*/



$(function () {
    gdo.consoleOut('.GRAPHRENDERER', 1, 'Loaded Graph Renderer JS');

    // arrays to store data
    var links, nodes, labels, mostConnectedNodes = [];
    var minLinks = 3;

    // boolean to track if current graph is zoomed
    var globalZoomed;

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


    var overallFolder; // defined in renderGraph()
    var nodeList;

    $.connection.graphAppHub.client.renderSearch = function (folderName) {
        alert("THIS IS THE RENDERSEARCH_1 FUNCTION!");         //TODO FIX remove

        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            var basePath = "\\Web\\Graph\\graph\\" + overallFolder + "\\search\\" + folderName + "\\";
            var nodesPath = basePath + "nodes.json";
            var linksPath = basePath + "links.json";
            searchPath = nodesPath;

            var highlightDom = document.body.getElementsByTagName('iframe')[0]
                                            .contentDocument.getElementById("highlight");

            var linksDom = highlightDom.append("g")
                                       .attr("id", "sublinks");

            alert("SEARCH> readytorender Links");         //TODO FIX remove
            renderSearchLinks(linksPath);
            alert("SEARCH> readytorender Nodes");         //TODO FIX remove
            renderSearchNodes(nodesPath);
            alert("SEARCH> Links and Nodes rendered");         //TODO FIX remove
            

            function renderSearchNodes(file) {
                var xhr = new XMLHttpRequest();

                xhr.open("GET", file, true);
                xhr.send();

                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        nodeList = JSON.parse(xhr.responseText);        //TODO FIX

                        var radius = globalZoomed ? zoomedRadius + 2 : normalRadius + 2;

                        nodeList.forEach(function (node) {

                            highlightDom.append("circle")
                                .attr("r", radius)
                                .attr("cx", node.Pos.X)
                                .attr("cy", node.Pos.Y)
                                .attr("fill", "rgb(" + highlightedColor.r + "," + highlightedColor.g + "," + highlightedColor.b + ")");  // Nodes: search mode                            
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
                        var linkList = JSON.parse(xhr.responseText);          //TODO FIX

                        var strokeWidth = globalZoomed ? zoomedStrokeWidth : normalStrokeWidth;

                        linkList.forEach(function (link) {

                            linksDom.append("line")
                                .attr("x1", link.StartPos.X)
                                .attr("y1", link.StartPos.Y)
                                .attr("x2", link.EndPos.X)
                                .attr("y2", link.EndPos.Y)
                                .attr("stroke-width", strokeWidth)
                                .attr("stroke", "#B8B8B8");
                        });

                    }
                }
            }
        }
    }

    $.connection.graphAppHub.client.renderSearchLabels = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            var highlightDom = document.body.getElementsByTagName('iframe')[0]
                                            .contentDocument.getElementById("highlight");

            var fontSize = globalZoomed ? zoomedFontSize : normalFontSize;
            var padding = globalZoomed ? 4 : 3;

            alert("THIS IS THE RENDERSEARCHLABELS_1 FUNCTION!");         //TODO FIX remove

            nodeList.forEach(function (node) {

                    highlightDom.append("text")
                        .attr("x", node.Pos.X + padding)
                        .attr("y", node.Pos.Y - padding)
                        .text(node.Label)
                        .attr("font-size", fontSize)
                        .attr("fill", "yellow");      // Labels: search mode
            });

        }
    }

    $.connection.graphAppHub.client.hideSublinks = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            alert("THIS IS THE HIDESUBLINKS_1 FUNCTION!");         //TODO FIX remove
            var dom = document.body.getElementsByTagName('iframe')[0]
                                    .contentDocument.getElementById("sublinks");

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

            alert("THIS IS THE HIDEHIGHLIGHT_1 FUNCTION!");         //TODO FIX remove
            var highlightDom = document.body
                                    .getElementsByTagName('iframe')[0]
                                    .contentDocument.getElementById("highlight");

            while (highlightDom.firstChild) {
                highlightDom.removeChild(highlightDom.firstChild);
            }
        }
    }


    $.connection.graphAppHub.client.renderMostConnectedNodes = function (numLinks) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            alert("THIS IS THE rendermostconnected_1 FUNCTION! " + numLinks);         //TODO FIX remove

            var highlightDom = document.body
                                    .getElementsByTagName('iframe')[0]
                                    .contentDocument.getElementById("highlight");

            var radius = globalZoomed ? zoomedRadius + 2 : normalRadius + 2;

            mostConnectedNodes.forEach(function (node) {

                if (node.NumLinks >= numLinks) {  // TODO is this check really necessary?

                    highlightDom.append("circle")
                        .attr("r", Math.ceil(node.Size))
                        .attr("cx", node.Pos.X)
                        .attr("cy", node.Pos.Y)
                        .attr("fill", "rgb(" + highlightedColor.r + "," + highlightedColor.g + "," + highlightedColor.b + ")");    // Nodes: highlighted mode
                }
            });

        }
    }

    $.connection.graphAppHub.client.renderMostConnectedLabels = function (numLinks) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            alert("THIS IS THE rendermostconnectedlabels_1 FUNCTION!" + numLinks);         //TODO FIX remove

            var highlightDom = document.body
                                    .getElementsByTagName('iframe')[0]
                                    .contentDocument.getElementById("highlight");


            var fontSize = globalZoomed ? zoomedFontSize : normalFontSize;
            var padding = globalZoomed ? 5 : 3;

            mostConnectedNodes.forEach(function (node) {

                if (node.NumLinks >= numLinks) {   // TODO is this check really necessary?
                    console.log("label: " + node.Label + ", pos: " + node.Pos.X + ", " + node.Pos.Y + ", node id: " + node.ID);

                    highlightDom.append("text")
                        .attr("x", node.Pos.X + padding)
                        .attr("y", node.Pos.Y - padding)
                        .text(node.Label)
                        .attr("font-size", fontSize)
                        .attr("fill", "green");    // Labels: highlighted mode        
                }
            });

        }
    }


    $.connection.graphAppHub.client.hideNodes = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            alert("THIS IS THE HIDENODES_1 FUNCTION!");         //TODO FIX remove

            var nodesDom = document.body.getElementsByTagName('iframe')[0]
                                        .contentDocument.getElementById("nodes");

            while (nodesDom.firstChild) {
                nodesDom.removeChild(nodesDom.firstChild);
            }
        }
    }

    $.connection.graphAppHub.client.renderNodes = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            alert("THIS IS THE RENDERNODES_3 FUNCTION!");         //TODO FIX remove

            var nodesDom = document.body.getElementsByTagName('iframe')[0]
                                        .contentDocument.getElementById("nodes");

            var radius = globalZoomed ? zoomedRadius : normalRadius;

            nodes.forEach(function (node) {

                var inc = Math.round(rgbIncrement * node.NumLinks); //multiply rgbIncrement by no. of links each node has

                nodesDom.append("circle")
                    .attr("r", radius)
                    .attr("cx", node.Pos.X)
                    .attr("cy", node.Pos.Y)
                    .attr("fill", "rgb(" + (currentColor.r + inc) + "," + (currentColor.g + inc) + "," + (currentColor.b + inc) + ")");   // Nodes: any colour scheme
            });

        }
    }

    $.connection.graphAppHub.client.hideLinks = function () {
        alert("THIS IS THE HIDELINKS_1 FUNCTION!");         //TODO FIX remove
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            var linksDom = document.body.getElementsByTagName('iframe')[0]
                                        .contentDocument.getElementById("links");

            while (linksDom.firstChild) {
                linksDom.removeChild(linksDom.firstChild);
            }
        }
    }

    $.connection.graphAppHub.client.showLinks = function () {
        alert("THIS IS THE RENDERLINKS_1 FUNCTION!");         //TODO FIX remove
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            var linksDom = document.body.getElementsByTagName('iframe')[0]
                                        .contentDocument.getElementById("links");

            var strokeWidth = globalZoomed ? zoomedStrokeWidth : normalStrokeWidth;

            links.forEach(function (link) {

                linksDom.append("line")
                    .attr("x1", link.StartPos.X)
                    .attr("y1", link.StartPos.Y)
                    .attr("x2", link.EndPos.X)
                    .attr("y2", link.EndPos.Y)
                    .attr("stroke-width", strokeWidth)
                    .attr("stroke", "#B8B8B8");
            });

        }
    }



    $.connection.graphAppHub.client.hideLabels = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            alert("THIS IS THE HIDELABELS_2 FUNCTION!");         //TODO FIX remove

            var labelsDom = document.body.getElementsByTagName('iframe')[0]
                                         .contentDocument.getElementById("labels");

            while (labelsDom.firstChild) {
                labelsDom.removeChild(labelsDom.firstChild);
            }
        }
    }

    $.connection.graphAppHub.client.renderLabels = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            alert("THIS IS THE RENDERLABELS_2 FUNCTION!");         //TODO FIX remove

            var labelsDom = document.body.getElementsByTagName('iframe')[0]
                                         .contentDocument.getElementById("labels");

            var fontSize = globalZoomed ? zoomedFontSize : normalFontSize;
            var padding =  globalZoomed ? 5 : 3;

            nodes.forEach(function (node, index) {

                labelsDom.append("text")
                    .attr("x", node.Pos.X + padding)
                    .attr("y", node.Pos.Y - padding)
                    .text(labels[index])
                    .attr("font-size", fontSize)
                    .attr("fill", "white");    // Labels: normal mode
                ;
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

            alert("THIS IS RENDERBUFFER!_1 FUNCTION!");         //TODO FIX remove

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
                                        .attr("stroke", "#B8B8B8");
                                });

                                console.log("Time after appending links: " + window.performance.now());
                            }
                        };
                    }

                    function readPartitionLabels(file) {
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


    // improved renderGraph() implementation
    // @param (string) folderNameDigit: specifies which folder to read from
    // @param (boolean) zoomed: indicates if it's a zoomed graph; 'true' means zoomed
    $.connection.graphAppHub.client.renderGraph = function (folderNameDigit, zoomed) {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            alert("THIS IS RENDERGRAPH!_1 FUNCTION!");         //TODO FIX remove

            gdo.consoleOut('.GRAPHRENDERER', 1, 'Instance - ' + gdo.clientId + ": Downloading Graph : " + "AppInstance_" + gdo.net.node[gdo.clientId].appInstanceId + "Partition_" + gdo.net.node[gdo.clientId].sectionRow + "_" + gdo.net.node[gdo.clientId].sectionCol);

            var basePath, fileName;
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

            var nodesFilePath = basePath + "\\nodes\\" + fileName + ".json";
            var linksFilePath = basePath + "\\links\\" + fileName + ".json";    
            var labelsFilePath = basePath + "\\labels\\" + fileName + ".json";

            var settings = {
                // for SVG translation in each browser, since coordinates of data are spread across the whole section
                defaultDisplayDimension: {
                    width: gdo.net.node[gdo.clientId].width,
                    height: gdo.net.node[gdo.clientId].height
                },
                svgDom: document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("graphArea")
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

                    console.log("Time before reading nodesPos.json: " + window.performance.now());
                    renderNodes(nodesFilePath);
                    console.log("Time before reading linksPos.json: " + window.performance.now());
                    renderLinks(linksFilePath);

                    // read in labels and store in variable 'labels' for rendering later
                    readLabels(labelsFilePath);

                    // new optimised rendering, to read from binary pos files
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

                                var radius = zoomed ? zoomedRadius : normalRadius;

                                nodes.forEach(function (node) {

                                    if (node.NumLinks > minLinks) {
                                        mostConnectedNodes.push(node);
                                    } 

                                    //var inc = Math.round(rgbIncrement * node.NumLinks); //multiply rgbIncrement by no. of links each node has

                                    nodesDom.append("circle")
                                        .attr("r", Math.ceil(node.Size)) // radius
                                        //.attr("r", radius) // radius
                                        .attr("cx", node.Pos.X)
                                        .attr("cy", node.Pos.Y)
                                        //.attr("fill", "rgb(" + (currentColor.r + inc) + "," + (currentColor.g + inc) + "," + (currentColor.b + inc) + ")");
                                        //.attr("fill", "cyan");    // Nodes: normal mode
                                        .attr("fill","rgb(" + node.R + "," + node.G + "," + node.B + ")");
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
                                        .attr("stroke", "#B8B8B8");
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
