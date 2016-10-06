$(function () {
    gdo.consoleOut('.Images', 1, 'Loaded Image Tiles JS');
    $.connection.imagesAppHub.client.receiveImageName = function (imageName, imageNameDigit) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
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
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.consoleOut('.Images', 1, 'Set digits ' + digits);
            $("iframe").contents().find("#image_digit").val(digits);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            // do nothing  
        }
    }
    $.connection.imagesAppHub.client.tilesReady = function() {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.Images', 1, 'Requesting tiles');
            gdo.net.app["Images"].server.requestTilesInfo(gdo.net.node[gdo.clientId].appInstanceId,
                                                          gdo.net.node[gdo.clientId].sectionCol,
                                                          gdo.net.node[gdo.clientId].sectionRow);   
        }

    }
    $.connection.imagesAppHub.client.setTiles = function(imageNameDigit, rotate, blockWidth, blockHeight, tilesInfo) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
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
<<<<<<< HEAD
    $.connection.imagesAppHub.client.reloadIFrame = function () {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            if (gdo.controlId == instanceId)
            {
                $("iframe").attr("src", $("iframe").attr("src"));
            }
        } else {
            $("iframe").attr("src", $("iframe").attr("src"));    
        }
        
=======
    $.connection.imagesAppHub.client.reloadIFrame = function (instanceId) {
        // Reload frame if not called by other app
        var src = $("iframe").attr("src");
        var controlId = src.substring(src.indexOf("?") + 1);
        var id = controlId.substring(controlId.indexOf("=") + 1);
        if (parseInt(id) === instanceId) {
          $("iframe").attr("src", $("iframe").attr("src"));
        }
>>>>>>> 55e7383eff3efffa5326d72753c6ff2387683126
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
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
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
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.consoleOut('.Images', 1, 'Got section size information');
            $("iframe")[0].contentWindow.getSectionSize(section_width, section_height);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }

    $.connection.imagesAppHub.client.shiftImage = function (instanceId, style, direction, distance, imageName, mode) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.Images', 1, 'Shfiting image');
            var finish = 0;
            $("iframe").contents().find("#image-tiles img").each(function () {
                finish++;
            });
            if (style === "animate") {
                $("iframe").contents().find("#image-tiles img").each(function () {      
                        var left = $(this).position().left;
                        if (direction === 1) {
                            $(this).animate({
                                left: left + distance
                            }, function () {
                                finish--;
                                if (finish === 0) {                         
                                    gdo.net.app["Images"].server.showImage(instanceId, imageName, mode);
                                }
                            });
                        } else {
                            $(this).animate({
                                left: left - distance
                            }, function () {
                                finish--;
                                if (finish === 0) {                   
                                    gdo.net.app["Images"].server.showImage(instanceId, imageName, mode);
                                }
                            });
                        }
                });
            } else if (style === "fadeOut") {
                $("iframe").contents().find("body").fadeOut('slow', function () {
        
                
                    gdo.net.app["Images"].server.showImage(instanceId, imageName, mode);
                        $(this).fadeIn('slow', function () {
                        });
                    
                });
            }

        }
    }

    $.connection.imagesAppHub.client.receiveCanvasData = function (instanceId, dataURL) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.Images', 1, 'Got section size information');
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //gdo.consoleOut('.Images', 1, "Receiving Canvas data ");
            $("iframe")[0].contentWindow.setCanvasData(dataURL);
            $("iframe").contents().find("#wrapper")
                     .css("width", gdo.net.section[gdo.net.instance[instanceId].sectionId].width / gdo.net.section[gdo.net.instance[instanceId].sectionId].cols + "px")
                     .css("height", gdo.net.section[gdo.net.instance[instanceId].sectionId].height / gdo.net.section[gdo.net.instance[instanceId].sectionId].rows + "px");


            var scaleX = gdo.net.section[gdo.net.instance[instanceId].sectionId].cols;
            var scaleY = gdo.net.section[gdo.net.instance[instanceId].sectionId].rows;
            var col = gdo.net.node[gdo.clientId].sectionCol + 1;
            var row = gdo.net.node[gdo.clientId].sectionRow + 1;
          
            var originX = (scaleX === 1) ? 0 : ((col - 1) * 100 / (scaleX - 1));
            var originY = (scaleY === 1) ? 0 : ((row - 1) * 100 / (scaleY - 1));
            var scale = "scale(" + scaleX + ", " + scaleY + ")";
            var origin = originX + "%" + originY + "%";

            $("iframe").contents().find("#paint-canvas")
                .css("zoom", 1)
                .css("-moz-transform", scale)
                .css("-moz-transform-origin", origin)
                .css("-o-transform", scale)
                .css("-o-transform-origin", origin)
                .css("-webkit-transform", scale)
                .css("-webkit-transform-origin", origin);
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
