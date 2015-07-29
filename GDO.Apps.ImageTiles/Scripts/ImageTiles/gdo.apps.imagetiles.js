
$(function() {
    gdo.consoleOut('.IMAGETILES', 1, 'Loaded Image Tiles JS');
    $.connection.imageTilesAppHub.client.receiveTile = function (defaultP2PMode) {

        var fileLocation;
        $("body").css("background-image", "url(" + fileLocation + ")");

    }
});


