$(function () {
    gdo.consoleOut('.IMAGETILES', 1, 'Loaded Image Tiles JS');
    $.connection.imagesAppHub.client.receiveImageName = function (imageName, imageNameDigit) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.IMAGETILES', 1, 'Instance - ' + gdo.controlId + ": Downloading Image : " + imageName);
            $("iframe").contents().find("#thumbnail_image").attr("src", "\\Web\\Images\\images\\" + imageNameDigit + "\\thumb.png");
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.IMAGETILES', 1, 'Instance - ' + gdo.clientId + ": Downloading Image : " + imageName + "_" + gdo.net.node[gdo.clientId].appInstanceId + "_" + gdo.net.node[gdo.clientId].sectionCol + "_" + gdo.net.node[gdo.clientId].sectionRow + ".png");
            $("iframe").contents().find("#image_tile").attr("src", "\\Web\\Images\\images\\" + imageNameDigit + "\\" + "crop" + "_" + gdo.net.node[gdo.clientId].sectionCol + "_" + gdo.net.node[gdo.clientId].sectionRow + ".png");
        }
    }
});

gdo.net.app["Images"].displayMode = 0;

gdo.net.app["Images"].initClient = function () {
    gdo.consoleOut('.IMAGETILES', 1, 'Initializing Image Tiles App Client at Node ' + gdo.clientId);
    gdo.net.app["Images"].server.requestImageName(gdo.net.node[gdo.clientId].appInstanceId);
}

gdo.net.app["Images"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.net.app["Images"].server.requestImageName(gdo.controlId);
    gdo.consoleOut('.IMAGETILES', 1, 'Initializing Image Tiles App Control at Instance ' + gdo.controlId);
}

gdo.net.app["Images"].terminateClient = function () {
    gdo.consoleOut('.IMAGETILES', 1, 'Terminating Image Tiles App Client at Node ' + clientId);
}

gdo.net.app["Images"].ternminateControl = function () {
    gdo.consoleOut('.IMAGETILES', 1, 'Terminating Image Tiles App Control at Instance ' + gdo.controlId);
}
