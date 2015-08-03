$(function () {
    gdo.consoleOut('.IMAGETILES', 1, 'Loaded Image Tiles JS');
    $.connection.imageTilesAppHub.client.receiveImageName = function (imageName, imageNameDigit) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.IMAGETILES', 1, 'Instance - ' + gdo.controlId + ": Downloading Image : " + imageName);
            $("iframe").contents().find("#thumbnail_image").attr("src", "\\Web\\ImageTiles\\images\\" + imageNameDigit + "\\thumb.png");
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.IMAGETILES', 1, 'Instance - ' + gdo.clientId + ": Downloading Image : " + imageName + "_" + gdo.net.node[gdo.clientId].appInstanceId + "_" + gdo.net.node[gdo.clientId].sectionCol + "_" + gdo.net.node[gdo.clientId].sectionRow + ".png");
            $("iframe").contents().find("#image_tile").attr("src", "\\Web\\ImageTiles\\images\\" + imageNameDigit + "\\" + "crop" + "_" + gdo.net.node[gdo.clientId].sectionCol + "_" + gdo.net.node[gdo.clientId].sectionRow + ".png");
        }
    }
});

gdo.net.app["ImageTiles"].displayMode = 0;

gdo.net.app["ImageTiles"].initClient = function () {
    gdo.consoleOut('.IMAGETILES', 1, 'Initializing Image Tiles App Client at Node ' + gdo.clientId);
    gdo.net.app["ImageTiles"].server.requestImageName(gdo.net.node[gdo.clientId].appInstanceId);
}

gdo.net.app["ImageTiles"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.net.app["ImageTiles"].server.requestImageName(gdo.controlId);
    gdo.consoleOut('.IMAGETILES', 1, 'Initializing Image Tiles App Control at Instance ' + gdo.controlId);
}

gdo.net.app["ImageTiles"].terminateClient = function () {
    gdo.consoleOut('.IMAGETILES', 1, 'Terminating Image Tiles App Client at Node ' + gdo.clientId);
}

gdo.net.app["ImageTiles"].ternminateControl = function () {
    gdo.consoleOut('.IMAGETILES', 1, 'Terminating Image Tiles App Control at Instance ' + gdo.controlId);
}
