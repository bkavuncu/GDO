$(function () {
    gdo.consoleOut('.Images', 1, 'Loaded Image Tiles JS');
    $.connection.imagesAppHub.client.receiveImageName = function (imageName, imageNameDigit) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.Images', 1, 'Instance - ' + gdo.controlId + ": Downloading Image : " + imageName + " with id: " + imageNameDigit);
            $("iframe").contents().find("#thumbnail_control > img").attr("src", "\\Web\\Images\\images\\" + imageNameDigit + "\\thumb.png");
            $("iframe").contents().find("#thumbnail_control > img").load(function () {
                $("iframe")[0].contentWindow.initializeCropper();
            });
            //gdo.net.instances[instanceId].isImageProcessed
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
    $.connection.imagesAppHub.client.reloadIFrame = function (instanceId) {
        // Reload frame if not called by other app
        var src = $("iframe").attr("src");
        var controlId = src.substring(src.indexOf("?") + 1);
        var id = controlId.substring(controlId.indexOf("=") + 1);
        if (parseInt(id) === instanceId) {
          $("iframe").attr("src", $("iframe").attr("src"));
        }
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

    $.connection.imagesAppHub.client.receiveCanvasData = function (instanceId, dataURL) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.Images', 1, 'Got section size information');
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //gdo.consoleOut('.Images', 1, "Receiving Canvas data ");
            $("iframe")[0].contentWindow.setCanvasData(dataURL);
            $("iframe")
                .contents()
                .find("#wrapper")
                .css("width",
                    gdo.net.section[gdo.net.instance[instanceId].sectionId].width /
                    gdo.net.section[gdo.net.instance[instanceId].sectionId].cols +
                    "px")
                .css("height",
                    gdo.net.section[gdo.net.instance[instanceId].sectionId].height /
                    gdo.net.section[gdo.net.instance[instanceId].sectionId].rows +
                    "px");
            var responsiveMode = false;
            if (!responsiveMode) {
                var s;
                if (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols > 1) {
                    var scale = "scale(" + gdo.net.section[gdo.net.instance[instanceId].sectionId].cols + ")";
                } else {
                    var scale = "scale(1.01)";
                }

                if (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols >
                    gdo.net.section[gdo.net.instance[instanceId].sectionId].rows) {

                    var offsetX = gdo.net.node[gdo.clientId].sectionCol *
                    (100 / (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols - 1));
                    var offsetY = gdo.net.node[gdo.clientId].sectionRow *
                    (100 /
                    (gdo.net.section[gdo.net.instance[instanceId].sectionId].rows +
                        (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols -
                            gdo.net.section[gdo.net.instance[instanceId].sectionId].rows) -
                        1));
                    var origin = offsetX + "% " + offsetY + "%";
                    var width = gdo.net.section[gdo.net.instance[instanceId].sectionId].width /
                        gdo.net.section[gdo.net.instance[instanceId].sectionId].cols;
                    var height = gdo.net.section[gdo.net.instance[instanceId].sectionId].height /
                        gdo.net.section[gdo.net.instance[instanceId].sectionId].rows;

                } else if (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols <
                    gdo.net.section[gdo.net.instance[instanceId].sectionId].rows) {

                    if (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols == 1) {
                        var offsetX = gdo.net.node[gdo.clientId].sectionCol *
                        (100 / (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols));
                        var offsetY = 100 *
                            gdo.net.node[gdo.clientId].sectionRow *
                            (100 /
                            (gdo.net.section[gdo.net.instance[instanceId].sectionId].rows *
                            (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols)));
                    } else {
                        var offsetX = gdo.net.node[gdo.clientId].sectionCol *
                        (100 / (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols - 1));
                        var offsetY = gdo.net.node[gdo.clientId].sectionRow *
                        (100 /
                        (gdo.net.section[gdo.net.instance[instanceId].sectionId].rows *
                        (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols - 1)));
                    }
                    var origin = offsetX + "% " + offsetY + "%";
                    var width = gdo.net.section[gdo.net.instance[instanceId].sectionId].width /
                        gdo.net.section[gdo.net.instance[instanceId].sectionId].cols;
                    var height = gdo.net.section[gdo.net.instance[instanceId].sectionId].height;

                } else {

                    var offsetX = gdo.net.node[gdo.clientId].sectionCol *
                    (100 / (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols - 1));
                    var offsetY = gdo.net.node[gdo.clientId].sectionRow *
                    (100 / (gdo.net.section[gdo.net.instance[instanceId].sectionId].rows - 1));
                    var origin = offsetX + "% " + offsetY + "%";
                    var width = gdo.net.section[gdo.net.instance[instanceId].sectionId].width /
                        gdo.net.section[gdo.net.instance[instanceId].sectionId].cols;
                    var height = gdo.net.section[gdo.net.instance[instanceId].sectionId].height /
                        gdo.net.section[gdo.net.instance[instanceId].sectionId].rows;
                }
                //gdo.consoleOut('.Images', 4, origin);
           
                $("iframe")
                    .contents()
                    .find("#paint-canvas")
                    .css("zoom", 1)
                    .css("-moz-transform", scale)
                    .css("-moz-transform-origin", origin)
                    .css("-o-transform", scale)
                    .css("-o-transform-origin", origin)
                    .css("-webkit-transform", scale)
                    .css("-webkit-transform-origin", origin)
                    .css("width", width + "px")
                    .css("height", height + "px");

            } else {
                var screenWidth = gdo.net.section[gdo.net.instance[instanceId].sectionId].width /
                    gdo.net.section[gdo.net.instance[instanceId].sectionId].cols;
                var screenHeight = gdo.net.section[gdo.net.instance[instanceId].sectionId].height /
                    gdo.net.section[gdo.net.instance[instanceId].sectionId].rows;

                var xOffset = -gdo.net.node[gdo.clientId].sectionCol * screenWidth;
                var yOffset = -gdo.net.node[gdo.clientId].sectionRow * screenHeight;
                var width = gdo.net.section[gdo.net.instance[instanceId].sectionId].width;
                var height = gdo.net.section[gdo.net.instance[instanceId].sectionId].height;

                gdo.consoleOut('.StaticHTML', 0, 'ScreenWidth: ' + screenWidth + " ScreenHeight: " +
                    screenHeight + " xOffset: " + xOffset + " yOffset: " + yOffset + " width: " +
                    width + " height: " + height);

                var origin = "0% 0%";
                var transform = "translate(" + xOffset + "px," + yOffset + "px)";

                gdo.consoleOut('.StaticHTML', 0, 'Transform: ' + transform);

                $("iframe")
                    .contents()
                    .find("#paint-canvas")
                    .css("position", "absolute")
                    .css("zoom", 1)
                    .css("-moz-transform", transform)
                    .css("-moz-transform-origin", origin)
                    .css("-o-transform", transform)
                    .css("-o-transform-origin", origin)
                    .css("-webkit-transform", transform)
                    .css("-webkit-transform-origin", origin)
                    .css("width", width + "px")
                    .css("height", height + "px");
            }

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
    gdo.controlId = parseInt(getUrlVar("controlId"));
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
