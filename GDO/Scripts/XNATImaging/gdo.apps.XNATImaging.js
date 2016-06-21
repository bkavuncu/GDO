$(function () {
    gdo.consoleOut('.XNATImaging', 1, 'Loaded XNATImaging JS');
    $.connection.xNATImagingAppHub.client.receiveName = function (instanceId, name) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received Name : " + name);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received Name : " + name);
            $("iframe").contents().find("#hello_text").empty().append("Hello " + name);
        }
    }

    $.connection.xNATImagingAppHub.receiveControl = function (instanceId, controlName) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received Control : " + controlName);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received Control : " + controlName);
            gdo.net.app["XNATImaging"].clientControl(instanceId, controlName);
        }
    }
});

gdo.net.app["XNATImaging"].initClient = function () {
    gdo.consoleOut('.XNATImaging', 1, 'Initializing XNATImaging App Client at Node ' + gdo.clientId);

    gdo.net.app["XNATImaging"].initialiseCS(1300, 900);
}

gdo.net.app["XNATImaging"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.net.app["XNATImaging"].server.requestName(gdo.controlId);
    gdo.consoleOut('.XNATImaging', 1, 'Initializing XNATImaging App Control at Instance ' + gdo.controlId);

    gdo.net.app["XNATImaging"].initialiseCS(800, 600);

    $("iframe").contents().find("#hello_submit")
    .unbind()
    .click(function () {
        gdo.consoleOut('.XNATImaging', 1, 'Sending Name to Clients :' + $("iframe").contents().find('#hello_input').val());
        gdo.net.app["XNATImaging"].server.setName(gdo.controlId, $("iframe").contents().find('#hello_input').val());
    });

    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        $("iframe").contents().find("#upNavigationButton")
        .unbind()
        .click(function () {
            gdo.consoleOut('.XNATImaging', 1, 'Sending Control to Clients :' + 'Up');
            //gdo.consoleOut('.XNATImaging', 1, 'Sending Name to Clients :' + $("iframe").contents().find('#upNavigationButton').val());
            gdo.net.app["XNATImaging"].server.setControl(gdo.controlId, $("iframe").contents().find('#upNavigationButton').text());

        });

        $("iframe").contents().find("#downNavigationButton")
        .unbind()
        .click(function () {
            gdo.consoleOut('.XNATImaging', 1, 'Sending Control to Clients :' + 'Down');
            gdo.net.app["XNATImaging"].server.setControl(gdo.controlId, $("iframe").contents().find('#downNavigationButton').text());

        });
    }
}

gdo.net.app["XNATImaging"].updateTheImage = function (stack) {
    return cornerstone.loadImage(stack.imageIds[stack.currentImageIndex]).then(function (image) {

        var viewport = cornerstone.getViewport(element);
        cornerstone.displayImage(element, image, viewport);
        console.log("Image " + stack.currentImageIndex + " loaded");
    });
};

gdo.net.app["XNATImaging"].initialiseCS = function(width, height) {

    var baseUrl = "https://central.xnat.org";
    var stack = {
        currentImageIndex: 0,
        imageIds: []
    }

    var view = {
        zoomLevel: 2.34,
        windowWidth: 394,
        windowCenter: 192
    }
    
    $.ajax({
        method: 'GET',
        url: baseUrl + '/data/experiments/CENTRAL_E07330/scans/7/files?format=json',
        headers: {
            //'Authorization': 'Basic ' + 'uname' + ':' + 'pw',
            //or
            //'Authorization': 'Bearer ' + 'token'
            //
            'Content-Type': 'application/json'
        }
    }).done(function (data) {
        console.log(data);
        var filtered = _.filter(data.ResultSet.Result, function (image) {
            return image.collection === "DICOM";
        });
        stack.imageIds = _.map(filtered, function (image) {
            return "dicomweb:" + baseUrl + image.URI;
        })
        //console.log(stack.imageIds);
        gdo.net.app["XNATImaging"].sortImageStack(stack);
        gdo.net.app["XNATImaging"].getImageStack(stack);
        console.log("Loaded Image Stack");
    });
    
}

gdo.net.app["XNATImaging"].sortImageStack = function (stack) {
    function compareNumbers(a, b) {
        //1.3.12.2.1107.5.2.36.40436.30000014081908371717200000064-8-41-skte63.dcm
        //index
        var strippedA = a.substr(a.lastIndexOf("/") + 1);
        var strippedB = b.substr(b.lastIndexOf("/") + 1);
        //console.log(strippedA);

        //8-41-skte63.dcm
        strippedA = strippedA.substring(strippedA.indexOf("-"));
        strippedB = strippedB.substring(strippedB.indexOf("-"));
        //console.log(strippedA);

        //8-41
        strippedA = strippedA.substring(0, strippedA.lastIndexOf("-"));
        strippedB = strippedB.substring(0, strippedB.lastIndexOf("-"));
        //console.log(strippedA);

        //41
        strippedA = strippedA.substring(strippedA.lastIndexOf("-") + 1);
        strippedB = strippedB.substring(strippedB.lastIndexOf("-") + 1);
        //console.log(strippedA);

        return parseInt(strippedA) - parseInt(strippedB);
    }

    // wait for next call before attempting to load image URLs with cornerstone
    //setTimeout(function () {
        stack.imageIds = stack.imageIds.sort(compareNumbers);
        /*while(stack.imageIds.length<1) {
            console.log(stack.imageIds.length);
        }*/
        //getImageStack();
    //}, 1000);
}

gdo.net.app["XNATImaging"].getImageStack = function (stack) {
    element = $("iframe").contents().find('#dicomImage').get(0);
    cornerstone.enable(element);

    cornerstoneTools.mouseInput.enable(element);
    cornerstoneTools.mouseWheelInput.enable(element);

    // load and display first image
    var imagePromise = gdo.net.app["XNATImaging"].updateTheImage(stack);
    var numLoadedImages = 1;

    console.log("First image loaded?");

    // add handlers for mouse events once the image is loaded.
    imagePromise.then(function () {
        console.log("Image promise loaded");
        var viewport = cornerstone.getViewport(element);
        $("iframe").contents().find('#mrbottomright').text("Zoom: " + viewport.scale.toFixed(2) + "x");
        $("iframe").contents().find('#mrbottomleft').text("WW/WC:" + Math.round(viewport.voi.windowWidth) + "/" + Math.round(viewport.voi.windowCenter));
        // add event handlers to pan image on mouse move
        $("iframe").contents().find('#dicomImage').mousedown(function (e) {
            var lastX = e.pageX;
            var lastY = e.pageY;
            var mouseButton = e.which;
            $("iframe").contents().find('#dicomImage').mousemove(function (e) {
                var deltaX = e.pageX - lastX,
                        deltaY = e.pageY - lastY;
                lastX = e.pageX;
                lastY = e.pageY;
                if (mouseButton == 1) {
                    var viewport = cornerstone.getViewport(element);
                    viewport.voi.windowWidth += (deltaX / viewport.scale);
                    viewport.voi.windowCenter += (deltaY / viewport.scale);
                    cornerstone.setViewport(element, viewport);
                    $("iframe").contents().find('#mrbottomleft').text("WW/WL:" + Math.round(viewport.voi.windowWidth) + "/" + Math.round(viewport.voi.windowCenter));
                }
                else if (mouseButton == 2) {
                    var viewport = cornerstone.getViewport(element);
                    viewport.translation.x += (deltaX / viewport.scale);
                    viewport.translation.y += (deltaY / viewport.scale);
                    cornerstone.setViewport(element, viewport);
                }
                else if (mouseButton == 3) {
                    var viewport = cornerstone.getViewport(element);
                    viewport.scale += (deltaY / 100);
                    cornerstone.setViewport(element, viewport);
                    $("iframe").contents().find('#mrbottomright').text("Zoom: " + viewport.scale.toFixed(2) + "x");
                }
            });
            $("iframe").contents().find('#dicomImage').mouseup(function (e) {
                $("iframe").contents().find('#dicomImage').unbind('mousemove');
                $("iframe").contents().find('#dicomImage').unbind('mouseup');
            });
        });

        $("iframe").contents().find('#dicomImage').on('mousewheel DOMMouseScroll', function (e) {
            // Firefox e.originalEvent.detail > 0 scroll back, < 0 scroll forward
            // chrome/safari e.originalEvent.wheelDelta < 0 scroll back, > 0 scroll forward
            if (e.originalEvent.wheelDelta < 0 || e.originalEvent.detail > 0) {
                stack.currentImageIndex--;
                gdo.net.app["XNATImaging"].updateTheImage(stack);
            } else if (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) {
                stack.currentImageIndex++;
                gdo.net.app["XNATImaging"].updateTheImage(stack);
            }

            //prevent page fom scrolling
            return false;
        });

        $(element).mousemove(function (event) {
            var pixelCoords = cornerstone.pageToPixel(element, event.pageX, event.pageY);
            var x = event.pageX;
            var y = event.pageY;
        });
    });

    for (var i = 1; i < stack.imageIds.length; i++) {
        // load entire image stack without displaying
        cornerstone.loadAndCacheImage(imageIds[i]).then(function (image) {
            //cornerstone.displayImage(element, image);
            numLoadedImages++;
        });
    }

    // resize dicom image frame to fill screen
    console.log("Resize 1000");
    $("iframe").contents().find('#dicomImage').width(width).height(height);
    cornerstone.resize(element);
}

gdo.net.app["XNATImaging"].clientControl = function(instanceId, controlName) {
    
    switch(controlName) {
    
        case 'upNavigation':
            navigateUp();
            break;
        default:
            gdo.consoleOut("Not a command");
    }
}

gdo.net.app["XNATImaging"].initButtons = function() {
    $("#iframe").contents().find("#resetButton")
        .unbind()
        .click(function() {
            
        });
}


gdo.net.app["XNATImaging"].terminateClient = function () {
    gdo.consoleOut('.XNATImaging', 1, 'Terminating XNATImaging App Client at Node ' + clientId);
}

gdo.net.app["XNATImaging"].terminateControl = function () {
    gdo.consoleOut('.XNATImaging', 1, 'Terminating XNATImaging App Control at Instance ' + gdo.controlId);
}