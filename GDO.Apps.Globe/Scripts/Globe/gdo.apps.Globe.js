$(function() {
    gdo.consoleOut('.Globe', 1, 'Loaded Globe JS');

    $.connection.globeAppHub.client.setMessage = function (instanceId, message) {
        gdo.consoleOut('.Twitter', 1, 'Message from server: ' + message);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            $("iframe").contents().find("#message_from_server").html(message);
        }
    }

    $.connection.globeAppHub.client.setScalingMode = function (instanceId, mode) {
        gdo.consoleOut('.Twitter', 1, 'Setting the mode: ' + mode);
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.net.app["Globe"].setupHTMLTransform(instanceId, mode);
        }
    }

    $.connection.globeAppHub.client.receiveMarkerVisibility = function (instanceId, dMarkers) {
        var markers = JSON.parse(dMarkers);
        gdo.consoleOut('.Twitter', 1, "Received request to set markers " + markers.length);
        if ((gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) ||
            gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            for (var i = 0; i < markers.length; ++i) {
                gdo.consoleOut('.Twitter', 1, "Received request to set marker " + markers[i].id + " to " + markers[i].isVisible);
                if (markers[i].isVisible) {
                    gdo.net.instance[instanceId].markers[markers[i].id].openPopup();
                    gdo.net.instance[instanceId].markers[markers[i].id].isVisible = true;
                } else {
                    gdo.net.instance[instanceId].markers[markers[i].id].closePopup();
                    gdo.net.instance[instanceId].markers[markers[i].id].isVisible =false;
                }
            }

        }
    }

    $.connection.globeAppHub.client.pan = function (instanceId, x, y) {
        gdo.consoleOut('.Globe', 1, 'Instance - ' + instanceId + ": Received pan : (" + x + "," + y + ")");
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            $("iframe")[0].contentWindow.pan(x,y);
//            var center = gdo.net.instance[instanceId].getCenter();
//            center[0] += y;
//            center[1] += x;
//            gdo.net.instance[instanceId].panTo(center, { duration: 0.01 });
        }
    }
    $.connection.globeAppHub.client.zoom = function(instanceId, i) {
        gdo.consoleOut('.Globe', 1, 'Instance - ' + instanceId + ": Received zoom : (" + i + ")");
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            $("iframe")[0].contentWindow.zoom(i);
//            if (i > 0) {
//                gdo.net.instance[instanceId].zoomIn(i);
//            } else if (i < 0) {
//                gdo.net.instance[instanceId].zoomOut(-i);
//            }
        }
    }
    $.connection.globeAppHub.client.tilt = function(instanceId, i) {
        gdo.consoleOut('.Globe', 1, 'Instance - ' + instanceId + ": Received tilt : (" + i + ")");
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            $("iframe")[0].contentWindow.tilt(i);
//            var tilt = gdo.net.instance[instanceId].getTilt();
//            gdo.net.instance[instanceId].setTilt(tilt + i);
        }
    }

    $.connection.globeAppHub.client.receiveState = function (instanceId, lat, lng, zoom) {
        gdo.consoleOut('.Globe', 1, 'Instance - ' + instanceId + ": Received state : (" + lat + ","  + lng + ","+ zoom + ")");
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            $("iframe")[0].contentWindow.updatePosition(lat, lng, zoom);
        }
    }

    $.connection.globeAppHub.client.receiveMarkers = function (instanceId, markers) {
        gdo.consoleOut('.Globe', 1, 'Instance - ' + instanceId + ": Received markers");
        var dMarkers = JSON.parse(markers)
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.app["Globe"].processMarkers(instanceId, dMarkers);
            $("iframe")
               .contents()
               .find("#numberMarkers")
               .html(dMarkers.length);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.net.app["Globe"].processMarkers(instanceId, dMarkers);
        }

       
    }

});

gdo.net.app["Globe"].initClient = function() {
    gdo.consoleOut('.Globe', 1, 'Initializing Globe App Client at Node ' + gdo.clientId);
    gdo.net.instance[gdo.net.node[gdo.clientId].appInstanceId].mode = "L";
    gdo.net.app["Globe"].setupHTMLTransform(gdo.net.node[gdo.clientId].appInstanceId, 2);
    $("iframe")[0].contentWindow.intializeGlobe(gdo.net.node[gdo.clientId].appInstanceId);
    gdo.net.app["Globe"].server.getInit(gdo.net.node[gdo.clientId].appInstanceId);
//    console.log($("iframe")[0].contentWindow);
}

gdo.net.app["Globe"].initControl = function() {
    gdo.controlId = getUrlVar("controlId");
//    gdo.net.app["Globe"].server.requestName(gdo.controlId);
    gdo.consoleOut('.Globe', 1, 'Initializing Globe App Control at Instance ' + gdo.controlId);
    gdo.net.instance[gdo.controlId].mode = "L";
    var width = 1500.0;
    var height = width / gdo.net.section[gdo.net.instance[gdo.controlId].sectionId].width *
        gdo.net.section[gdo.net.instance[gdo.controlId].sectionId].height;
    gdo.consoleOut('.Globe', 1, 'Control using dims: ' + height + "," + width);

    $("iframe")
        .contents()
        .find("#earth_div")
        .css("width", width + "px")
        .css("height", height + "px");

    $("iframe")[0].contentWindow.intializeGlobe(gdo.controlId);
    gdo.net.app["Globe"].server.getInit(gdo.controlId);

}

gdo.net.app["Globe"].markerProperties = {
    maxWidth: 300
};

gdo.net.app["Globe"].processMarkers = function(instanceId, dMarkers) {
    
    
    $("iframe")[0].contentWindow.addMarkers(instanceId, dMarkers);
};

gdo.net.app["Globe"].broadcastState = function(instanceId, lat, lng, zoom) {
    gdo.consoleOut('.Globe', 1, 'Broadcasting state: ' + lat + "," + lng  + " , " + zoom);
    gdo.net.app["Globe"].server.updateState(instanceId, lat , lng, zoom);
};

gdo.net.app["Globe"].setupHTMLTransform = function(instanceId, mode) {
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

    if (mode == 1) {
        if (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols > 1) {
            var scale = "scale(" + gdo.net.section[gdo.net.instance[instanceId].sectionId].cols + ")";
        } else {
            var scale = "scale(1.01)";
        }
        var offsetX = gdo.net.node[gdo.clientId].sectionCol *
                    (100 / (gdo.net.section[gdo.net.instance[instanceId].sectionId].cols - 1));
        var offsetY = gdo.net.node[gdo.clientId].sectionRow *
        (100 / (gdo.net.section[gdo.net.instance[instanceId].sectionId].rows - 1));
        var origin = offsetX + "% " + offsetY + "%";
        var width = gdo.net.section[gdo.net.instance[instanceId].sectionId].width /
            gdo.net.section[gdo.net.instance[instanceId].sectionId].cols;
        var height = gdo.net.section[gdo.net.instance[instanceId].sectionId].height /
            gdo.net.section[gdo.net.instance[instanceId].sectionId].rows;
        gdo.consoleOut('.StaticHTML', 4, origin);
        $("iframe")
            .contents()
            .find("#earth_div")
            .css("zoom", 1)
            .css("-moz-transform", scale)
            .css("-moz-transform-origin", origin)
            .css("-o-transform", scale)
            .css("-o-transform-origin", origin)
            .css("-webkit-transform", scale)
            .css("-webkit-transform-origin", origin)
            .css("width", width + "px")
            .css("height", height + "px")
            .css("position", "fixed");
    } else if (mode == 2) {
       var screenWidth = gdo.net.section[gdo.net.instance[instanceId].sectionId].width /
      gdo.net.section[gdo.net.instance[instanceId].sectionId].cols;
        var screenHeight = gdo.net.section[gdo.net.instance[instanceId].sectionId].height /
            gdo.net.section[gdo.net.instance[instanceId].sectionId].rows;

        var xOffset = -gdo.net.node[gdo.clientId].sectionCol * screenWidth;
        var yOffset = -gdo.net.node[gdo.clientId].sectionRow * screenHeight;
        var width = gdo.net.section[gdo.net.instance[instanceId].sectionId].width;
        var height = gdo.net.section[gdo.net.instance[instanceId].sectionId].height;

        gdo.consoleOut('.Globe', 0, 'Node settings ScreenWidth: ' + screenWidth + " ScreenHeight: " + screenHeight +
            " xOffset: " + xOffset + " yOffset: " + yOffset +
            " width: " + width + " height: " + height);

        var origin = "0% 0%";
        var transform = "translate(" + xOffset + "px," + yOffset + "px)";

        gdo.consoleOut('.Globe', 0, 'Transform: ' + transform);
        $("iframe")
            .contents()
            .find("#earth_div")
            .css("zoom", 1)
                .css("-moz-transform", transform)
                .css("-moz-transform-origin", origin)
                .css("-o-transform", transform)
                .css("-o-transform-origin", origin)
                .css("-webkit-transform", transform)
                .css("-webkit-transform-origin", origin)
                .css("width", width + "px")
                .css("height", height + "px")
                .css("absolute", "fixed");
    } else {
        $("iframe")
            .contents()
            .find("#earth_div")
            .css("zoom", 1)
                .css("-moz-transform", "")
                .css("-moz-transform-origin", "")
                .css("-o-transform", "")
                .css("-o-transform-origin", "")
                .css("-webkit-transform", "")
                .css("-webkit-transform-origin", "")
                .css("width", "100%")
                .css("height", "100%")
                .css("position", "fixed");
    }
   

}


gdo.net.app["Globe"].terminateClient = function() {
    gdo.consoleOut('.Globe', 1, 'Terminating Globe App Client at Node ' + clientId);
}

gdo.net.app["Globe"].ternminateControl = function() {
    gdo.consoleOut('.Globe', 1, 'Terminating Globe App Control at Instance ' + gdo.controlId);
}