

$(function () {
    gdo.consoleOut('.CORTICAL', 1, 'Loaded Cortical JS');

    $.getScript("../../Scripts/Cortical/retina-sdk-1.0.js")
        .done(function (script, textStatus) {
        })
        .fail(function (jqxhr, settings, exception) {
     });


    // when div content exceeds div height, call this function 
    // to align bottom of content with bottom of div
    scroll_bottom = function (div) {
        if (div.scrollHeight > div.clientHeight)
            div.scrollTop = div.scrollHeight - div.clientHeight;
    }

    $.connection.corticalAppHub.client.setMessage = function (message) {
        gdo.consoleOut('.CORTICAL', 1, 'Message from server: ' + message);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {

            var logDom = $("iframe").contents().find("#message_from_server");
            // append new "p" element for each msg, instead of replacing existing one
            logDom.empty().append("<p>" + message + "</p>");

            scroll_bottom(logDom[0]);

        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            // do nothing
        }
    }


    $.connection.corticalAppHub.client.logTime = function (message) {

        var logDom = $("iframe").contents().find("#message_from_server");
        // append new "p" element for each msg, instead of replacing existing one
        logDom.empty().append("<p>" + message + "</p>");

        scroll_bottom(logDom[0]);
    }


    /************************************************
    WORD
    */
    $.connection.corticalAppHub.client.initWordConf_layout = function () {
        // var screenNumber = instance.nodeMap[i % instance.cols][Math.floor(i / instance.cols)];

        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.Cortical', 1, 'Initiate WordConf layout ');

            /* Ideally, one column and four rows
                1. empty
                2. text_area
                3. div
                4. empty
            */
            var graphArea = $("iframe").contents().find("#graphArea");
            graphArea.empty();
            switch (gdo.net.node[gdo.clientId].sectionRow) {
                case 0:
                    graphArea.append($("<h1 class='corticalh1'>cortical.io demo</h1><h2 class='corticalh2'>Create fingerprint of a word</h2>"));
                    break;
                case 1:
                    graphArea.append($("<input class='big' type='text' id='queryWord' value='' readonly />"));
                    break;
                case 2:
                    graphArea.append($("<div id='resultsDIV'></div>"));
                    break;
                case 3:
                    graphArea.append($("<h1></h1>"));
                    break;
            }
        }
    }

    $.connection.corticalAppHub.client.updateWordField = function (query) {
        var instanceId = gdo.net.node[gdo.clientId].appInstanceId;
        var configName = gdo.net.instance[instanceId].configName;
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && configName == "Word") {
            if (gdo.net.node[gdo.clientId].sectionRow == 1) {
                var graphArea = $("iframe").contents().find("#queryWord");
                graphArea.val(query);
            }
        }
    }

    $.connection.corticalAppHub.client.renderWordFingerprint = function (query) {
        var instanceId = gdo.net.node[gdo.clientId].appInstanceId;
        var configName = gdo.net.instance[instanceId].configName;
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && configName == "Word") {
            if (gdo.net.node[gdo.clientId].sectionRow == 1) {
                var graphArea = $("iframe").contents().find("#queryWord");
                graphArea.val(query);
            }
            if (gdo.net.node[gdo.clientId].sectionRow == 2) {
                var graphArea = $("iframe").contents().find("#resultsDIV");
                graphArea.empty();

                var fullClient = retinaSDK.FullClient("9a92e650-e524-11e5-8378-4dad29be0fab");

                var list = [];
                list.push({ "text": query });
                var images = fullClient.getImages({ expressions: list, plot_shape: "circle", image_scalar: 5 });

                for (var d = 0; d < images.length; d++) {
                    var img = document.createElement("img");
                    img.className = "retinaImage";
                    img.src = "data:image/png;base64," + images[d].image_data;
                    graphArea.append(img);
                }
            }
        }
    }


    /************************************************
    TEXT
    */
    $.connection.corticalAppHub.client.initTextConf_layout = function () {

        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.Cortical', 1, 'Initiate TextConf layout ');

            /* Ideally, one column and four rows
                1. empty
                2. text_area
                3. div with keywords
                4. empty
            */
            var graphArea = $("iframe").contents().find("#graphArea");
            graphArea.empty();
            switch (gdo.net.node[gdo.clientId].sectionRow) {
                case 0:
                    graphArea.append($("<h1 class='corticalh1'>cortical.io demo</h1><h2 class='corticalh2'>Extract keywords of a text</h2>"));
                    break;
                case 1:
                    graphArea.append($("<div id='textDIV' class='readableText'></div>"));
                    break;
                case 2:
                    graphArea.append($("<div id='keywordsDIV'></div>"));
                    break;
                case 3:
                    graphArea.append($("<div id='resultsDIV'></div>"));
                    break;
            }
        }
    }

    $.connection.corticalAppHub.client.renderTextKeywords = function (text) {
        var instanceId = gdo.net.node[gdo.clientId].appInstanceId;
        var configName = gdo.net.instance[instanceId].configName;
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && configName == "Text") {
            if (gdo.net.node[gdo.clientId].sectionRow == 1) {
                var graphArea = $("iframe").contents().find("#textDIV");
                graphArea.html(text);
            }
            else if (gdo.net.node[gdo.clientId].sectionRow == 2) {
                //get the keywords for the given text
                var fullClient = retinaSDK.FullClient("9a92e650-e524-11e5-8378-4dad29be0fab");
                var keywords = fullClient.getKeywordsForText({ "text": text });
                //put the keywords in the screen
                var graphArea = $("iframe").contents().find("#keywordsDIV");
                graphArea.append($("<h1 class='corticalh1'>text keywords and fingerprint</h1>"));
                var list = graphArea.append("<ul style='list-style-type:none'>").children("ul"); //the ul we have just created
                for(var i=0; i<keywords.length; i++){
                    list.append("<li>"+keywords[i]+"</li>");
                }
            }
            else if (gdo.net.node[gdo.clientId].sectionRow == 3) {

                var fullClient = retinaSDK.FullClient("9a92e650-e524-11e5-8378-4dad29be0fab");
                var exp = [];
                exp.push({ "text": text });
                var images = fullClient.getImages({ expressions: exp, plot_shape: "square", image_scalar: 5 });

                var graphArea = $("iframe").contents().find("#resultsDIV");
                graphArea.empty();

                for (var d = 0; d < images.length; d++) {
                    var img = document.createElement("img");
                    img.className = "retinaImage";
                    img.src = "data:image/png;base64," + images[d].image_data;
                    graphArea.append(img);
                }

            }
        }
    }

    $.connection.corticalAppHub.client.updateTextField = function (text) {
        var instanceId = gdo.net.node[gdo.clientId].appInstanceId;
        var configName = gdo.net.instance[instanceId].configName;
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && configName == "Text") {
            if (gdo.net.node[gdo.clientId].sectionRow == 1) {
                var graphArea = $("iframe").contents().find("#textDIV");
                graphArea.html(text);
            }
        }
    }



    /************************************************
    COMPARE
    */
    $.connection.corticalAppHub.client.initCompareConf_layout = function () {

        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.Cortical', 1, 'Initiate CompareConf layout ');

            /* Ideally, four rows>
                1. empty
                2. text_area
                3. div
                4. empty
            */
            var graphArea = $("iframe").contents().find("#graphArea");
            graphArea.empty();
            switch (gdo.net.node[gdo.clientId].sectionRow) {
                case 0:
                    if (gdo.net.node[gdo.clientId].sectionCol == 1) {
                        graphArea.append($("<h1 class='corticalh1'>cortical.io demo</h1><h2 class='corticalh2'>Semantic comparison of terms</h2>"));
                    }
                    break;
                case 1:
                    if (gdo.net.node[gdo.clientId].sectionCol == 0) {
                        graphArea.append($("<input class='big' type='text' id='queryWord' value='' readonly />"));
                    } else if (gdo.net.node[gdo.clientId].sectionCol == 1) {
                        graphArea.append($("<h1 class='corticalh1 centered big'>VS</h1>"));
                    } else if (gdo.net.node[gdo.clientId].sectionCol == 2) {
                        graphArea.append($("<input class='big' type='text' id='queryWord' value='' readonly />"));
                    }
                    break;
                case 2:
                    graphArea.append($("<div id='resultsDIV'></div>"));
                    break;
                case 3:
                    graphArea.append($("<h1></h1>"));
                    break;
            }
        }
    }

    $.connection.corticalAppHub.client.updateCompareWordFields = function (termA, termB) {
        var instanceId = gdo.net.node[gdo.clientId].appInstanceId;
        var configName = gdo.net.instance[instanceId].configName;
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && configName == "Compare") {
            if (gdo.net.node[gdo.clientId].sectionCol == 0) {
                var graphArea = $("iframe").contents().find("#queryWord");
                graphArea.val(termA);
            } else if (gdo.net.node[gdo.clientId].sectionCol == 2) {
                var graphArea = $("iframe").contents().find("#queryWord");
                graphArea.val(termB);
            }
        }
    }

    $.connection.corticalAppHub.client.renderCompareFingerprints = function (termA, termB) {
        var instanceId = gdo.net.node[gdo.clientId].appInstanceId;
        var configName = gdo.net.instance[instanceId].configName;
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && configName == "Compare") {
            if (gdo.net.node[gdo.clientId].sectionRow == 2) {
                var graphArea = $("iframe").contents().find("#resultsDIV");
                graphArea.empty();

                var fullClient = retinaSDK.FullClient("9a92e650-e524-11e5-8378-4dad29be0fab");
                var img = document.createElement("img");
                img.className = "retinaImage";

                // put retinas appropriately...
                if (gdo.net.node[gdo.clientId].sectionCol == 0) {
                    var image = fullClient.getImage({ expression: { "term": termA }, plot_shape: "square", image_scalar: 5 });
                    img.className = "retinaImage";
                    img.src = "data:image/png;base64," + image;
                } else if (gdo.net.node[gdo.clientId].sectionCol == 1) {
                    var image = fullClient.compareImage({ expressions: [{ "text": termA }, { "text": termB }], plot_shape: "square", image_scalar:5 });
                    img.className = "comparisonFingerprint";
                    img.src = "data:image/png;base64," + image;
                } else if (gdo.net.node[gdo.clientId].sectionCol == 2) {
                    var image = fullClient.getImage({ expression: { "term": termB }, plot_shape: "square", image_scalar: 5 });
                    img.className = "retinaImage";
                    img.src = "data:image/png;base64," + image;
                }
                graphArea.append(img);
            }
        }
    }



    /*$.connection.corticalAppHub.client.renderLabels = function (field, color) {
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
    }*/

    /*$.connection.corticalAppHub.client.hideLabels = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            var labelsDom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("labels");
            while (labelsDom.firstChild) {
                labelsDom.removeChild(labelsDom.firstChild);
            }
        }
    } */


    /*$.connection.corticalAppHub.client.renderSearch = function (searchquery, field) {

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
    }*/

    /*$.connection.corticalAppHub.client.renderSearchLabels = function (field) {
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
    */

    /*$.connection.corticalAppHub.client.hideSublinks = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            var dom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("sublinks");
            while (dom.firstChild) {
                dom.removeChild(dom.firstChild);
            }
        }
    } */


/*    $.connection.corticalAppHub.client.renderMostConnectedNodes = function (numLinks, color) {
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
    }*/

/*    $.connection.corticalAppHub.client.renderMostConnectedLabels = function (numLinks, field, color) {
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
    }*/


/*    $.connection.corticalAppHub.client.hideNodes = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            var nodesDom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("nodes");
            while (nodesDom.firstChild) {
                nodesDom.removeChild(nodesDom.firstChild);
            }
        }
    }*/

    /*$.connection.corticalAppHub.client.renderNodes = function () {
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
    }*/


    /*$.connection.corticalAppHub.client.hideLinks = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

            var linksDom = document.body.getElementsByTagName('iframe')[0].contentDocument.getElementById("links");
            while (linksDom.firstChild) {
                linksDom.removeChild(linksDom.firstChild);
            }
        }
    }*/

   /* $.connection.corticalAppHub.client.showLinks = function () {
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
    }*/


});


gdo.net.app["Cortical"].initClient = function () {
    gdo.consoleOut('.CORTICAL', 1, 'Initializing Cortical App Client at Node ' + gdo.clientId);
    //gdo.net.app["Cortical"].server.initCorticalWord(gdo.net.node[gdo.clientId].appInstanceId); 
}

gdo.net.app["Cortical"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    var configName = gdo.net.instance[gdo.controlId].configName;
    if (configName == "Text") {
        gdo.net.app["Cortical"].server.initCorticalText(gdo.controlId);
    } else if (configName == "Word") {
        gdo.net.app["Cortical"].server.initCorticalWord(gdo.controlId);
    } else if (configName == "Compare") {
        gdo.net.app["Cortical"].server.initCorticalCompare(gdo.controlId);
    }
    gdo.consoleOut('.CORTICAL', 1, 'Initializing Cortical App Control at Instance ' + gdo.controlId);
}

gdo.net.app["Cortical"].terminateClient = function () {
    gdo.consoleOut('.CORTICAL', 1, 'Terminating Cortical App Client at Node ' + clientId);
}

gdo.net.app["Cortical"].ternminateControl = function () {
    gdo.consoleOut('.CORTICAL', 1, 'Terminating Cortical App Control at Instance ' + gdo.controlId);
}
