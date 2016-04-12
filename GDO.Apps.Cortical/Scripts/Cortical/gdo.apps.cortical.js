

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

            /* Ideally, four rows and three columns
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

});


gdo.net.app["Cortical"].initClient = function () {
    gdo.consoleOut('.CORTICAL', 1, 'Initializing Cortical App Client at Node ' + gdo.clientId);
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
