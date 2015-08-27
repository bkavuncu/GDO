$(function () {
    gdo.consoleOut('.Images', 1, 'Loaded Image Tiles JS');
    $.connection.imagesAppHub.client.receiveImageName = function (imageName, imageNameDigit) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.Images', 1, 'Instance - ' + gdo.controlId + ": Downloading Image : " + imageName + " with id: " + imageNameDigit);
            $("iframe").contents().find("#thumbnail_control > img").attr("src", "\\Web\\Images\\images\\" + imageNameDigit + "\\thumb.png");
            $("iframe").contents().find("#thumbnail_control > img").load(function () {
                $("iframe")[0].contentWindow.initializeCropper();
            });
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            // do nothing
        }
    }
    /*
    $.connection.imagesAppHub.client.receiveDisplayMode = function(display_mode) {
        gdo.net.app["Images"].display_mode = display_mode;
        gdo.net.app["Images"].setDisplayModeSelect();
    }
    */
    $.connection.imagesAppHub.client.setDigitText = function (digits) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.Images', 1, 'Set digits ' + digits);
            $("iframe").contents().find("#image_digit").val(digits);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            // do nothing  
        }
    }
    $.connection.imagesAppHub.client.tilesReady = function() {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.Images', 1, 'Requesting tiles');
            gdo.net.app["Images"].server.requestTilesInfo(gdo.net.node[gdo.clientId].appInstanceId,
                                                          gdo.net.node[gdo.clientId].sectionCol,
                                                          gdo.net.node[gdo.clientId].sectionRow);   
        }
    }
    $.connection.imagesAppHub.client.setTiles = function(imageNameDigit, rotate, blockWidth, blockHeight, tilesInfo) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.Images', 1, 'Fetching tiles');
            if (tilesInfo != "") {
                tilesJson = JSON.parse(tilesInfo);
                $("iframe")[0].contentWindow.setTiles(imageNameDigit, rotate, blockWidth, blockHeight, tilesJson);
            } else {
                $("iframe")[0].contentWindow.setTiles(imageNameDigit, rotate, blockWidth, blockHeight, {});
            }
        }
    }
    $.connection.imagesAppHub.client.reloadIFrame = function() {
        $("iframe").attr("src", $("iframe").attr("src"));
    }
    $.connection.imagesAppHub.client.setMessage = function (message) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.Images', 1, 'Message from server:' + message);
            $("iframe").contents().find("#message_from_server").html(message);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }
    $.connection.imagesAppHub.client.setThumbNailImageInfo = function(imageInfo) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            if (imageInfo != null) {
                gdo.consoleOut('.Images', 1, 'Set thumbnail image information');
                var imageJson = JSON.parse(imageInfo);
                $("iframe")[0].contentWindow.setThumbNailImageInfo(imageJson);
            } else {
                $("iframe")[0].contentWindow.setThumbNailDisplayMode(1); // FILL as Default
            }
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }
    $.connection.imagesAppHub.client.getSectionSize = function (section_width, section_height){
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.Images', 1, 'Got section size information');
            $("iframe")[0].contentWindow.getSectionSize(section_width, section_height);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }
});

//gdo.net.app["Images"].display_mode = 0;
gdo.net.app["Images"].control_status = 0; // 0 disabled, 1 activated

/*
gdo.net.app["Images"].setDisplayModeSelect = function () {
    if (gdo.net.app["Images"].display_mode == 0) {
        $("iframe").contents().find("#display_mode_value").html("FIT Mode");
    } else {
        $("iframe").contents().find("#display_mode_value").html("FILL Mode");
    }
    $("iframe")[0].contentWindow.setThumbNailDisplayMode();
}
*/

gdo.net.app["Images"].initClient = function () {
    gdo.consoleOut('.Images', 1, 'Initializing Image Tiles App Client at Node ' + gdo.clientId);
    //gdo.net.app["Images"].server.requestImageName(gdo.net.node[gdo.clientId].appInstanceId);
    gdo.net.app["Images"].server.requestTilesInfo(gdo.net.node[gdo.clientId].appInstanceId,
                                                  gdo.net.node[gdo.clientId].sectionCol,
                                                  gdo.net.node[gdo.clientId].sectionRow);   
}

gdo.net.app["Images"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.net.app["Images"].control_status = 0;
    //gdo.net.app["Images"].server.requestDisplayMode(gdo.controlId);
    gdo.net.app["Images"].server.requestImageName(gdo.controlId);
    gdo.consoleOut('.Images', 1, 'Initializing Image Tiles App Control at Instance ' + gdo.controlId);
}

gdo.net.app["Images"].terminateClient = function () {
    gdo.consoleOut('.Images', 1, 'Terminating Image Tiles App Client at Node ' + clientId);
}

gdo.net.app["Images"].ternminateControl = function () {
    gdo.consoleOut('.Images', 1, 'Terminating Image Tiles App Control at Instance ' + gdo.controlId);
}
