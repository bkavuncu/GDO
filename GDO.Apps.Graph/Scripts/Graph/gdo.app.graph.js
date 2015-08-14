$(function () {
    gdo.consoleOut('.GRAPHRENDERER', 1, 'Loaded Graph Renderer JS');

    
    $.connection.graphAppHub.client.renderGraph = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            document.body
                .getElementsByTagName('iframe')[0]
                .contentDocument.getElementById("graph")
                .innerHTML = "Hello Control page!";
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {

        }
    }

    /*
    $.connection.graphAppHub.client.receiveImageName = function (imageName, imageNameDigit) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.GRAPHRENDERER', 1, 'Instance - ' + gdo.controlId + ": Downloading Image : " + imageName + " with id: " + imageNameDigit);
            $("iframe").contents().find("#thumbnail_image").attr("src", "\\Web\\Graph\\images\\" + imageNameDigit + "\\thumb.png");
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.GRAPHRENDERER', 1, 'Instance - ' + gdo.clientId + ": Downloading Image : " + imageName + "_" + gdo.net.node[gdo.clientId].appInstanceId + "_" + gdo.net.node[gdo.clientId].sectionCol + "_" + gdo.net.node[gdo.clientId].sectionRow + ".png");
            $("iframe").contents().find("#image_tile").attr("src", "\\Web\\Graph\\images\\" + imageNameDigit + "\\" + "crop" + "_" + gdo.net.node[gdo.clientId].sectionCol + "_" + gdo.net.node[gdo.clientId].sectionRow + ".png");
        }
    }
    */
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
