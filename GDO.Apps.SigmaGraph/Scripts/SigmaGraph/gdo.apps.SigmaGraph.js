/**
 * Includes definitions for client side methods accessible by the server
 * and loads necessary javascript libraries.
 */

$(function () {
    gdo.consoleOut('.SIGMAGRAPHRENDERER', 1, 'Loaded Sigma Graph Renderer JS');

    $.connection.sigmaGraphAppHub.client.initInstanceGlobalVariables =
        gdo.net.app["SigmaGraph"].initInstanceGlobalVariables;

    $.connection.sigmaGraphAppHub.client.renderGraph = function () {
        gdo.net.app["SigmaGraph"].renderGraph();
    }

    $.connection.sigmaGraphAppHub.client.filterGraph = function (attribute) {
        gdo.net.app["SigmaGraph"].filterGraph(attribute);
    }

    $.connection.sigmaGraphAppHub.client.pan = gdo.net.app["SigmaGraph"].pan;

    $.connection.sigmaGraphAppHub.client.zoom = gdo.net.app["SigmaGraph"].zoom;

    $.connection.sigmaGraphAppHub.client.showSpinner = gdo.net.app["SigmaGraph"].showSpinner;

    $.connection.sigmaGraphAppHub.client.hideSpinner = gdo.net.app["SigmaGraph"].hideSpinner;

    $.connection.sigmaGraphAppHub.client.savePartialGraphImageToServer =
        gdo.net.app["SigmaGraph"].savePartialGraphImageToServer;

    $.connection.sigmaGraphAppHub.client.updateImagesToPlot = function (imagePath) {
        if (gdo.clientMode === gdo.CLIENT_MODE.CONTROL) {
            gdo.net.app["SigmaGraph"].updateImagesToPlot(imagePath);
        }
    }

    // When div content exceeds div height, call this function 
    // to align bottom of content with bottom of div
    scroll_bottom = function (div) {
        if (div.scrollHeight > div.clientHeight)
            div.scrollTop = div.scrollHeight - div.clientHeight;
    }

    $.connection.sigmaGraphAppHub.client.setMessage = function (message) {
        gdo.consoleOut('.SIGMAGRAPHRENDERER', 1, 'Message from server: ' + message);
        gdo.net.app["SigmaGraph"].attributes = message;
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            var logDom = $("iframe").contents().find("#message_from_server");
            // Append new "p" element for each msg, instead of replacing existing one
            logDom.empty().append("<p>" + message + "</p>");
            scroll_bottom(logDom[0]);
        }
    }

    $.connection.sigmaGraphAppHub.client.setAttribute = function (attributes) {
        gdo.consoleOut('.SIGMAGRAPHRENDERER', 1, 'Message from server: set attributes');
        /*
        var attributesList = document.getElementById("attributes");
        for (var i = 0; i < attributes.length; i++) {
            var entry = new Option(attributes[i], i);
            attributesList.options.add(entry);
        }
        */
        gdo.net.app["SigmaGraph"].attributes = attributes;
    }




    $.connection.sigmaGraphAppHub.client.logTime = function (message) {
        var logDom = $("iframe").contents().find("#message_from_server");
        // Append new "p" element for each msg, instead of replacing existing one
        logDom.empty().append("<p>" + message + "</p>");
        scroll_bottom(logDom[0]);
    }
});

gdo.net.app["SigmaGraph"].attributes = [];

gdo.net.app["SigmaGraph"].initClient = function () {
    gdo.net.app["SigmaGraph"].initInstanceGlobalConstants();
    gdo.consoleOut('.SIGMAGRAPHRENDERER', 1, 'Initializing Graph Renderer App Client at Node ' + gdo.clientId);
}

gdo.net.app["SigmaGraph"].initControl = function () {
    gdo.controlId = parseInt(getUrlVar("controlId"));
    gdo.consoleOut('.SIGMAGRAPHRENDERER', 1, 'Initializing Graph Renderer App Control at Instance ' + gdo.controlId);
}

gdo.net.app["SigmaGraph"].terminateClient = function () {
    gdo.consoleOut('.SIGMAGRAPHRENDERER', 1, 'Terminating Graph Renderer App Client at Node ' + gdo.clientId);
}

gdo.net.app["SigmaGraph"].ternminateControl = function () {
    gdo.consoleOut('.SIGMAGRAPHRENDERER', 1, 'Terminating Graph Renderer App Control at Instance ' + gdo.controlId);
}

gdo.loadScript('sigma.min', 'SigmaGraph', gdo.SCRIPT_TYPE.APP);
gdo.loadScript('initializeGlobals', 'SigmaGraph', gdo.SCRIPT_TYPE.APP);
gdo.loadScript('render', 'SigmaGraph', gdo.SCRIPT_TYPE.APP);
gdo.loadScript('changeFieldOfView', 'SigmaGraph', gdo.SCRIPT_TYPE.APP);
gdo.loadScript('updateModel', 'SigmaGraph', gdo.SCRIPT_TYPE.APP);
