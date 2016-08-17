$(function () {
    gdo.consoleOut('.ResponsiveHTML', 1, 'Loaded ResponsiveHTML JS');
    $.connection.responsiveHTMLAppHub.client.receiveURL = function (instanceId, url) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.ResponsiveHTML', 1, 'Instance - ' + instanceId + ": Received URL : " + url);
            $("iframe").contents().find("#html_frame")
                .attr("src", url);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.ResponsiveHTML', 1, 'Instance - ' + instanceId + ": Received URL : " + url);
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


            var screenWidth = gdo.net.section[gdo.net.instance[instanceId].sectionId].width /
                gdo.net.section[gdo.net.instance[instanceId].sectionId].cols;
            var screenHeight = gdo.net.section[gdo.net.instance[instanceId].sectionId].height /
                gdo.net.section[gdo.net.instance[instanceId].sectionId].rows;

            var xOffset = -gdo.net.node[gdo.clientId].sectionCol * screenWidth;
            var yOffset = -gdo.net.node[gdo.clientId].sectionRow * screenHeight;
            var width = gdo.net.section[gdo.net.instance[instanceId].sectionId].width;
            var height = gdo.net.section[gdo.net.instance[instanceId].sectionId].height;

            gdo.consoleOut('.ResponsiveHTML', 0, 'ScreenWidth: ' + screenWidth + " ScreenHeight: " + screenHeight + " xOffset: " + xOffset + " yOffset: " + yOffset + " width: " + width + " height: " + height);

            var origin = "0% 0%";
            var transform = "translate(" + xOffset + "px," + yOffset + "px)";

            gdo.consoleOut('.ResponsiveHTML', 0, 'Transform: ' + transform);

            gdo.consoleOut('.ResponsiveHTML', 4, origin);
            $("iframe").contents().find("#html_frame")
                .attr("src", url)
                .css("zoom", 1)
                .css("-moz-transform", transform)
                .css("-moz-transform-origin", origin)
                .css("-o-transform", transform)
                .css("-o-transform-origin", origin)
                .css("-webkit-transform", transform)
                .css("-webkit-transform-origin", origin)
                .css("width", width + "px")
                .css("height", height + "px");
            gdo.consoleOut('.ResponsiveHTML', 0, 'Loaded URL:' + url);
        }
    }
});

gdo.net.app["ResponsiveHTML"].initClient = function () {
    gdo.consoleOut('.ResponsiveHTML', 1, 'Initializing ResponsiveHTML App Client at Node ' + gdo.clientId);
    setTimeout(function () { gdo.net.app["ResponsiveHTML"].server.requestURL(gdo.net.node[gdo.clientId].appInstanceId); }, 700);
}

gdo.net.app["ResponsiveHTML"].initControl = function (controlId) {
    gdo.net.app["ResponsiveHTML"].server.requestURL(controlId);
    gdo.consoleOut('.ResponsiveHTML', 1, 'Initializing ResponsiveHTML App Control at Instance ' + gdo.controlId);

    $("iframe").contents().find("#url_submit")
    .unbind()
    .click(function () {
        gdo.consoleOut('.ResponsiveHTML', 1, 'Sending URL to Clients :' + $("iframe").contents().find('#url_input').val());
        gdo.net.app["ResponsiveHTML"].server.setURL(gdo.controlId, $("iframe").contents().find('#url_input').val());
    });
}

gdo.net.app["ResponsiveHTML"].terminateClient = function () {
    gdo.consoleOut('.ResponsiveHTML', 1, 'Terminating ResponsiveHTML App Client at Node ' + clientId);
}

gdo.net.app["ResponsiveHTML"].ternminateControl = function () {
    gdo.consoleOut('.ResponsiveHTML', 1, 'Terminating ResponsiveHTML App Control at Instance ' + gdo.controlId);
}
