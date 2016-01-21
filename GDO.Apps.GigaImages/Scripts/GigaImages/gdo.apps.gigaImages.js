var OpenSeadragon = parent.OpenSeadragon;

$(function () {
    gdo.consoleOut('.GigaImages', 1, 'Loaded GigaImages JS');

    $.connection.gigaImagesAppHub.client.receivePosition = function (instanceId, topLeft, center, bottomRight, zoom, width, height) {
        gdo.consoleOut('.GigaImages', 1, 'Received Position: topLeft:'+topLeft+', center:'+center+', bottomRight:'+bottomRight+', zoom:'+zoom+', width:'+width+', height:'+height);
        if (gdo.clientMode == gdo.CLIENT_MODE.NODE && gdo.net.node[gdo.clientId].appInstanceId == instanceId) {
            zoom = parseFloat(zoom);
            var localCenter = gdo.net.app["GigaImages"].calculateLocalCenter(topLeft, bottomRight);
            var nodePixels = gdo.net.node[gdo.clientId].width * gdo.net.node[gdo.clientId].height;
            var controlPixels = parseFloat(width) * parseFloat(height);
            var numOfNodes = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].cols * gdo.net.section[gdo.net.node[gdo.clientId].sectionId].rows;
            var localZoom = zoom / Math.sqrt((nodePixels * numOfNodes) / controlPixels);
            
            if (!gdo.net.instance[instanceId].isInitialized) {
                gdo.net.app["GigaImages"].initGigaImage(instanceId, localCenter, localZoom, gdo.net.app["GigaImages"].config[gdo.net.instance[instanceId].configName].properties);
                gdo.net.instance[instanceId].isInitialized = true;
            }
            gdo.net.instance[instanceId].osd.viewport.panTo(new OpenSeadragon.Point(localCenter[0], localCenter[1]), true).zoomTo(localZoom);
        }
    }

    $.connection.gigaImagesAppHub.client.receiveInitialPosition = function (instanceId, center, zoom) {
        gdo.consoleOut('.GigaImages', 1, 'Received Initial Position: center:' + center + ', zoom:' + zoom);
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.controlId == instanceId) {
            gdo.net.instance[instanceId].isInitialized = true;
            zoom = parseFloat(zoom);
            gdo.net.app["GigaImages"].initGigaImage(instanceId, center, zoom, gdo.net.app["GigaImages"].config[gdo.net.instance[instanceId].configName].properties);

            gdo.net.instance[instanceId].osd.addHandler('resize', function (viewer) {
                gdo.net.app["GigaImages"].changeEvent(instanceId);
            });
            gdo.net.instance[instanceId].osd.addHandler('zoom', function (viewer) {
                gdo.net.app["GigaImages"].changeEvent(instanceId);
            });
            gdo.net.instance[instanceId].osd.addHandler('pan', function (viewer) {
                gdo.net.app["GigaImages"].changeEvent(instanceId);
            });
            gdo.net.app["GigaImages"].uploadPosition(instanceId);
        }
    }
});


gdo.net.app["GigaImages"].initGigaImage = function (instanceId, center, zoom, properties) {
    gdo.consoleOut('.GigaImages', 1, 'Initializing OpenSeaDragon on ' + instanceId + ' with Properties:' + properties);
    var osd = OpenSeadragon(properties);
    osd.setFullPage(true);
    if (gdo.clientMode == gdo.CLIENT_MODE.NODE && gdo.net.node[gdo.clientId].appInstanceId == instanceId) {
        osd.clearControls();
    }
    gdo.net.instance[instanceId].osd = osd;
}

gdo.net.app["GigaImages"].calculateLocalCenter = function (topLeft, bottomRight) {
    var diffTotal = [parseFloat(bottomRight[0]) - parseFloat(topLeft[0]), parseFloat(bottomRight[1]) - parseFloat(topLeft[1])];
    var diffUnit = [diffTotal[0] / gdo.net.section[gdo.net.node[gdo.clientId].sectionId].cols, diffTotal[1] / gdo.net.section[gdo.net.node[gdo.clientId].sectionId].rows];
    var center = [parseFloat(topLeft[0]) + (diffUnit[0] * (0.5 + gdo.net.node[gdo.clientId].sectionCol)), parseFloat(topLeft[1]) + (diffUnit[1] * (0.5 + gdo.net.node[gdo.clientId].sectionRow))];
    return center;
}

gdo.net.app["GigaImages"].initClient = function (clientId) {
    var instanceId = gdo.net.node[gdo.clientId].appInstanceId;
    gdo.consoleOut('.GigaImages', 1, 'Initializing GigaImages App Instance ' + instanceId + ' Client at Node ' + clientId);
    gdo.net.instance[instanceId].isInitialized = false;

    gdo.net.instance[instanceId].sectionWidth = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].width;
    gdo.net.instance[instanceId].sectionHeight = gdo.net.section[gdo.net.node[gdo.clientId].sectionId].height;
    gdo.net.instance[instanceId].sectionPixels = gdo.net.instance[instanceId].sectionWidth * gdo.net.instance[instanceId].sectionHeight;
    gdo.net.instance[instanceId].sectionOffsetX = gdo.net.instance[instanceId].sectionWidth / 2;
    gdo.net.instance[instanceId].sectionOffsetY = gdo.net.instance[instanceId].sectionHeigth / 2;

    gdo.net.instance[instanceId].nodeWidth = gdo.net.node[gdo.clientId].width;
    gdo.net.instance[instanceId].nodeHeigth = gdo.net.node[gdo.clientId].height;
    gdo.net.instance[instanceId].nodePixels = gdo.net.instance[instanceId].nodeWidth * gdo.net.instance[instanceId].nodeHeigth;
    gdo.net.instance[instanceId].nodeOffsetX = gdo.net.instance[instanceId].nodeWidth * (gdo.net.node[gdo.clientId].sectionCol + 1);
    gdo.net.instance[instanceId].nodeOffsetY = gdo.net.instance[instanceId].nodeHeight * (gdo.net.node[gdo.clientId].sectionRow + 1);

    gdo.net.instance[instanceId].offsetX = gdo.net.instance[instanceId].sectionOffsetX - gdo.net.instance[instanceId].nodeOffsetX;
    gdo.net.instance[instanceId].offsetY = gdo.net.instance[instanceId].sectionOffsetY - gdo.net.instance[instanceId].nodeOffsetY;

    gdo.net.app["GigaImages"].server.requestPosition(instanceId, false);
}

gdo.net.app["GigaImages"].initControl = function (instanceId) {
    gdo.net.instance[instanceId].isInitialized = false;
    gdo.net.instance[instanceId].sectionWidth = gdo.net.section[gdo.net.instance[gdo.controlId].sectionId].width;
    gdo.net.instance[instanceId].sectionHeight = gdo.net.section[gdo.net.instance[gdo.controlId].sectionId].height;
    gdo.net.instance[instanceId].sectionRatio = gdo.net.instance[instanceId].sectionWidth / gdo.net.instance[instanceId].sectionHeight;
    gdo.net.instance[instanceId].controlMaxWidth = 1490;
    gdo.net.instance[instanceId].controlMaxHeight = 700;
    gdo.net.instance[instanceId].controlRatio = gdo.net.instance[instanceId].controlMaxWidth / gdo.net.instance[instanceId].controlMaxHeight;
    gdo.net.instance[instanceId].controlWidth = 700;
    gdo.net.instance[instanceId].controlHeight = 350;
    if (gdo.net.instance[instanceId].sectionRatio >= gdo.net.instance[instanceId].controlRatio) {
        gdo.net.instance[instanceId].controlWidth = gdo.net.instance[instanceId].controlMaxWidth;
        gdo.net.instance[instanceId].controlHeight = (gdo.net.instance[instanceId].sectionHeight * gdo.net.instance[instanceId].controlWidth) / gdo.net.instance[instanceId].sectionWidth;
    } else {
        gdo.net.instance[instanceId].controlHeight = gdo.net.instance[instanceId].controlMaxHeight;
        gdo.net.instance[instanceId].controlWidth = (gdo.net.instance[instanceId].sectionWidth * gdo.net.instance[instanceId].controlHeight) / gdo.net.instance[instanceId].sectionHeight;
    }
    $("iframe").contents().find(".openseadragon-container").css("width", gdo.net.instance[instanceId].controlWidth);
    $("iframe").contents().find(".openseadragon-container").css("height", gdo.net.instance[instanceId].controlHeight);

    gdo.net.app["GigaImages"].server.requestPosition(instanceId, true);
    gdo.consoleOut('.GigaImages', 1, 'Initializing GigaImages Control at Instance ' + instanceId);
}

gdo.net.app["GigaImages"].terminateClient = function (instanceId) {
    gdo.consoleOut('.GigaImages', 1, 'Terminating GigaImages Client at Node ' + instanceId);
}

gdo.net.app["GigaImages"].terminateControl = function (instanceId) {
    gdo.consoleOut('.GigaImages', 1, 'Terminating GigaImages App Control at Instance ' + instanceId);
}

gdo.net.app["GigaImages"].uploadPosition = function (instanceId) {
    var center = [gdo.net.instance[0].osd.viewport.homeBounds.getCenter().x, gdo.net.instance[0].osd.viewport.homeBounds.getCenter().y];
    var topLeft = [gdo.net.instance[0].osd.viewport.getBounds().x, gdo.net.instance[0].osd.viewport.getBounds().y];
    var bottomRight = [gdo.net.instance[0].osd.viewport.getBounds().x + gdo.net.instance[0].osd.viewport.getBounds().width, gdo.net.instance[0].osd.viewport.getBounds().y + gdo.net.instance[0].osd.viewport.getBounds().height];
    var zoom = gdo.net.instance[0].osd.viewport.getZoom();
    var width = parseInt($("iframe").contents().find(".openseadragon-container").css("width"));
    var height = parseInt($("iframe").contents().find(".openseadragon-container").css("height"));
    gdo.net.app["GigaImages"].server.uploadPosition(instanceId, topLeft, center, bottomRight, zoom, width, height);
}

gdo.net.app["GigaImages"].changeEvent = function (instanceId) {
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        if (gdo.net.instance[instanceId].isInitialized) {
            gdo.net.app["GigaImages"].uploadPosition(instanceId);
        }
    }
}
