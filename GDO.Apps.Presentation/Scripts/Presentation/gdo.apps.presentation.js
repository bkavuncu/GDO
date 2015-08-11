$(function () {
    gdo.consoleOut('.Presentation', 1, 'Loaded Presentation JS');
    $$.connection.presentationAppHub.client.setMessage = function(message) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.Presentation', 1, 'Message from server:' + message);
            $("iframe").contents().find("#message_from_server").html(message);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            //do nothing
        }
    }
    $.connection.presentationAppHub.client.receivePptInfo = function (fileNameDigit, pageCount, currentPage) {
        gdo.consoleOut('.Presentation', 1, 'Get ppt info from server!');
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            if (fileNameDigit == "" || pageCount == 0) {
                gdo.consoleOut('.Presentation', 1, 'PPT is not ready! [Control]');
                $("iframe").contents().find("#ppt_thumbnail").attr("src", "");
                $("iframe").contents().find("#previous_page").prop('disabled', true);
                $("iframe").contents().find("#next_page").prop('disabled', true);
                $("iframe").contents().find("#current_page_number").html(0);
                $("iframe").contents().find("#page_count").html(0);
            } else {
                gdo.consoleOut('.Presentation', 1, 'Instance - ' + gdo.controlId + ": Downloading PPT thumbnail, page: " + currentPage);
                $("iframe").contents().find("#ppt_thumbnail").attr("src", "\\Web\\Presentation\\PPTs\\" + fileNameDigit + "\\thumb_" + currentPage + ".png");
                if (currentPage == 0) {
                    $("iframe").contents().find("#previous_page").prop('disabled', true);
                } else {
                    $("iframe").contents().find("#previous_page").prop('disabled', false);
                }
                if (currentPage == (pageCount - 1)) {
                    $("iframe").contents().find("#next_page").prop('disabled', true);
                } else {
                    $("iframe").contents().find("#next_page").prop('disabled', false);
                }
                $("iframe").contents().find("#current_page_number").html(currentPage + 1);
                $("iframe").contents().find("#page_count").html(pageCount);
            }
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            if (fileNameDigit == "" || pageCount == 0) {
                gdo.consoleOut('.Presentation', 1, 'PPT is not ready! [Client]');
            } else {
                gdo.consoleOut('.Presentation', 1, 'Instance - ' + gdo.clientId + ": Downloading PPT image :" + currentPage + "_" + gdo.net.node[gdo.clientId].sectionCol + "_" + gdo.net.node[gdo.clientId].sectionRow + ".png");
                $("iframe").contents().find("#image_tile").attr("src", "\\Web\\Presentation\\PPTs\\" + fileNameDigit + "\\" + "crop_" + currentPage + "_" + gdo.net.node[gdo.clientId].sectionCol + "_" + gdo.net.node[gdo.clientId].sectionRow + ".png");
            }
        }
    }

});

gdo.net.app["Presentation"].previousPage = function () {
    gdo.consoleOut('.Presentation', 1, 'Previous page');
    gdo.net.app["Presentation"].server.requestPreviousPage(gdo.controlId);
}

gdo.net.app["Presentation"].nextPage = function () {
    gdo.consoleOut('.Presentation', 1, 'Next page');
    gdo.net.app["Presentation"].server.requestNextPage(gdo.controlId);
}

gdo.net.app["Presentation"].refreshPage = function() {
    gdo.consoleOut('.Presentation', 1, 'Refresh!');
    gdo.net.app["Presentation"].server.requestRefresh(gdo.controlId);
}

gdo.net.app["Presentation"].initClient = function () {
    gdo.consoleOut('.Presentation', 1, 'Initializing Presentation App Client at Node ' + gdo.clientId);
    gdo.net.app["Presentation"].server.requestPptInfo(gdo.net.node[gdo.clientId].appInstanceId);
}

gdo.net.app["Presentation"].initControl = function () {
    gdo.consoleOut('.Presentation', 1, 'Initializing Presentation App Control at Node ' + gdo.controlId);
    gdo.controlId = getUrlVar("controlId");
    $("iframe").contents().find("#ppt_thumbnail").attr("src", "");
    $("iframe").contents().find("#previous_page").prop('disabled', true);
    $("iframe").contents().find("#next_page").prop('disabled', true);
    $("iframe").contents().find("#current_page_number").html(0);
    $("iframe").contents().find("#page_count").html(0);
    gdo.net.app["Presentation"].server.requestPptInfo(gdo.controlId);
}

gdo.net.app["Presentation"].terminateClient = function () {
    gdo.consoleOut('.Presentation', 1, 'Terminating Presentation App Client at Node ' + gdo.clientId);
}

gdo.net.app["Presentation"].ternminateControl = function () {
    gdo.consoleOut('.Presentation', 1, 'Terminating Presentation App Control at Instance ' + gdo.controlId);
}
