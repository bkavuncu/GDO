$(function () {
    gdo.consoleOut('.BitCoins', 1, 'Loaded BitCoin Tiles JS');
    $.connection.BitCoinsAppHub.client.receiveBitCoinName = function (BitCoinName, BitCoinNameDigit) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.BitCoins', 1, 'Instance - ' + gdo.controlId + ": Downloading BitCoin : " + BitCoinName + " with id: " + BitCoinNameDigit);
            $("iframe").contents().find("#thumbnail_control > img").attr("src", "\\Web\\BitCoins\\BitCoins\\" + BitCoinNameDigit + "\\thumb.png");
            $("iframe").contents().find("#thumbnail_control > img").load(function () {
                $("iframe")[0].contentWindow.initializeCropper();
            });
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            // do nothing
        }
    }
    /*
    $.connection.BitCoinsAppHub.client.receiveDisplayMode = function(display_mode) {
        gdo.net.app["BitCoins"].display_mode = display_mode;
        gdo.net.app["BitCoins"].setDisplayModeSelect();
    }
    */
    $.connection.BitCoinsAppHub.client.setDigitText = function (digits) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.BitCoins', 1, 'Set digits ' + digits);
            $("iframe").contents().find("#BitCoin_digit").val(digits);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            // do nothing  
        }
    }
    $.connection.BitCoinsAppHub.client.tilesReady = function() {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.BitCoins', 1, 'Requesting tiles');
            gdo.net.app["BitCoins"].server.requestTilesInfo(gdo.net.node[gdo.clientId].appInstanceId,
                                                          gdo.net.node[gdo.clientId].sectionCol,
                                                          gdo.net.node[gdo.clientId].sectionRow);   
        }
    }
    $.connection.BitCoinsAppHub.client.setTiles = function(BitCoinNameDigit, rotate, blockWidth, blockHeight, tilesInfo) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            // do nothing
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.BitCoins', 1, 'Fetching tiles');
            if (tilesInfo != "") {
                tilesJson = JSON.parse(tilesInfo);
                $("iframe")[0].contentWindow.setTiles(BitCoinNameDigit, rotate, blockWidth, blockHeight, tilesJson);
            } else {
                $("iframe")[0].contentWindow.setTiles(BitCoinNameDigit, rotate, blockWidth, blockHeight, {});
            }
        }
    }
    $.connection.BitCoinsAppHub.client.reloadIFrame = function() {
        $("iframe").attr("src", $("iframe").attr("src"));
    }
    $.connection.BitCoinsAppHub.client.setMessage = function (message) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.BitCoins', 1, 'Message from server:' + message);
            $("iframe").contents().find("#message_from_server").html(message);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }
    $.connection.BitCoinsAppHub.client.setThumbNailBitCoinInfo = function(BitCoinInfo) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            if (BitCoinInfo != null) {
                gdo.consoleOut('.BitCoins', 1, 'Set thumbnail BitCoin information');
                var BitCoinJson = JSON.parse(BitCoinInfo);
                $("iframe")[0].contentWindow.setThumbNailBitCoinInfo(BitCoinJson);
            } else {
                $("iframe")[0].contentWindow.setThumbNailDisplayMode(1); // FILL as Default
            }
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }
    $.connection.BitCoinsAppHub.client.getSectionSize = function (section_width, section_height){
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.BitCoins', 1, 'Got section size information');
            $("iframe")[0].contentWindow.getSectionSize(section_width, section_height);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }
});

//gdo.net.app["BitCoins"].display_mode = 0;
gdo.net.app["BitCoins"].control_status = 0; // 0 disabled, 1 activated

/*
gdo.net.app["BitCoins"].setDisplayModeSelect = function () {
    if (gdo.net.app["BitCoins"].display_mode == 0) {
        $("iframe").contents().find("#display_mode_value").html("FIT Mode");
    } else {
        $("iframe").contents().find("#display_mode_value").html("FILL Mode");
    }
    $("iframe")[0].contentWindow.setThumbNailDisplayMode();
}
*/

gdo.net.app["BitCoins"].initClient = function () {
    gdo.consoleOut('.BitCoins', 1, 'Initializing BitCoin Tiles App Client at Node ' + gdo.clientId);
    //gdo.net.app["BitCoins"].server.requestBitCoinName(gdo.net.node[gdo.clientId].appInstanceId);
    gdo.net.app["BitCoins"].server.requestTilesInfo(gdo.net.node[gdo.clientId].appInstanceId,
                                                  gdo.net.node[gdo.clientId].sectionCol,
                                                  gdo.net.node[gdo.clientId].sectionRow);   
}

gdo.net.app["BitCoins"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.net.app["BitCoins"].control_status = 0;
    //gdo.net.app["BitCoins"].server.requestDisplayMode(gdo.controlId);
    gdo.net.app["BitCoins"].server.requestBitCoinName(gdo.controlId);
    gdo.consoleOut('.BitCoins', 1, 'Initializing BitCoin Tiles App Control at Instance ' + gdo.controlId);
}

gdo.net.app["BitCoins"].terminateClient = function () {
    gdo.consoleOut('.BitCoins', 1, 'Terminating BitCoin Tiles App Client at Node ' + clientId);
}

gdo.net.app["BitCoins"].ternminateControl = function () {
    gdo.consoleOut('.BitCoins', 1, 'Terminating BitCoin Tiles App Control at Instance ' + gdo.controlId);
}
