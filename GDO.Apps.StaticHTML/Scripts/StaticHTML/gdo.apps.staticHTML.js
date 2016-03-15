$(function () {
    gdo.consoleOut('.StaticHTML', 1, 'Loaded StaticHTML JS');
    $.connection.staticHTMLAppHub.client.receiveURL = function (instanceId,url) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.StaticHTML', 1, 'Instance - ' + instanceId + ": Received URL : " + url);
            $("iframe").contents().find("#html_frame")
                .attr("src", url);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.StaticHTML', 1, 'Instance - ' + instanceId + ": Received URL : " + url);
            $("iframe").contents().find("#wrapper")
                .css("width", gdo.net.section[gdo.net.instance[instanceId].sectionId].width / gdo.net.section[gdo.net.instance[instanceId].sectionId].cols + "px")
                .css("height", gdo.net.section[gdo.net.instance[instanceId].sectionId].height / gdo.net.section[gdo.net.instance[instanceId].sectionId].rows + "px");
            var scale = "scale(" + gdo.net.section[gdo.net.instance[instanceId].sectionId].cols + ")";
            var offsetX = gdo.net.node[gdo.clientId].sectionCol * (100 / (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols-1));
            var offsetY = gdo.net.node[gdo.clientId].sectionRow * (100 / (gdo.net.section[gdo.net.instance[instanceId].sectionId].rows-1));
            var origin = offsetX + "% " + offsetY + "%";
            gdo.consoleOut('.StaticHTML', 1, "#" + origin + "#");
            $("iframe").contents().find("#html_frame")
                .attr("src",url)
                .css("width", gdo.net.section[gdo.net.instance[instanceId].sectionId].width / gdo.net.section[gdo.net.instance[instanceId].sectionId].cols + "px")
                .css("height", gdo.net.section[gdo.net.instance[instanceId].sectionId].height / gdo.net.section[gdo.net.instance[instanceId].sectionId].rows + "px")
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

gdo.net.app["StaticHTML"].initClient = function () {
    gdo.consoleOut('.StaticHTML', 1, 'Initializing StaticHTML App Client at Node ' + gdo.clientId);
    gdo.net.app["StaticHTML"].server.requestURL(gdo.net.node[gdo.clientId].appInstanceId);
}

gdo.net.app["StaticHTML"].initControl = function (controlId) {
    gdo.net.app["StaticHTML"].server.requestURL(controlId);
    gdo.consoleOut('.StaticHTML', 1, 'Initializing StaticHTML App Control at Instance ' + controlId);

    $("iframe").contents().find("#url_submit")
    .unbind()
    .click(function () {
        gdo.consoleOut('.StaticHTML', 1, 'Sending URL to Clients :' + $("iframe").contents().find('#url_input').val());
        gdo.net.app["StaticHTML"].server.setURL(gdo.controlId, $("iframe").contents().find('#url_input').val());
    });
}

gdo.net.app["StaticHTML"].terminateClient = function () {
    gdo.consoleOut('.StaticHTML', 1, 'Terminating StaticHTML App Client at Node ' + clientId);
}

gdo.net.app["StaticHTML"].ternminateControl = function () {
    gdo.consoleOut('.StaticHTML', 1, 'Terminating StaticHTML App Control at Instance ' + gdo.controlId);
}
