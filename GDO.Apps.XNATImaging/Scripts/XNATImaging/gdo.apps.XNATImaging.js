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

    gdo.net.app["XNATImaging"].initialiseCS();
}

gdo.net.app["XNATImaging"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.net.app["XNATImaging"].server.requestName(gdo.controlId);
    gdo.consoleOut('.XNATImaging', 1, 'Initializing XNATImaging App Control at Instance ' + gdo.controlId);

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

gdo.net.app["XNATImaging"].terminateClient = function () {
    gdo.consoleOut('.XNATImaging', 1, 'Terminating XNATImaging App Client at Node ' + clientId);
}

gdo.net.app["XNATImaging"].terminateControl = function () {
    gdo.consoleOut('.XNATImaging', 1, 'Terminating XNATImaging App Control at Instance ' + gdo.controlId);
}

gdo.net.app["XNATImaging"].initialiseCS = function() {

    var baseUri = "https://central.xnat.org";
    var currentImageIndex = 0;
    var imageIds = [];

    var view = {
        zoomLevel: 2.34,
        windowWidth: 394,
        windowCenter: 192
    }

    /*cornerstoneWADOImageLoader.configure({
        beforeSend: function (xhr) {
            // Add custom headers here (e.g. auth tokens)
            //xhr.setRequestHeader('x-auth-token', 'my auth token');
        }
    });
    var loaded = false;*/


    var updateTheImage = function (currentImageIndex) {
        currentImageIndex = currentImageIndex;
        return cornerstone.loadImage(imageIds[currentImageIndex]).then(function (image) {

            var viewport = cornerstone.getViewport(element);
            cornerstone.displayImage(element, image, viewport);
        });
    };
    
    var getImageStack = function() {
        element = $("iframe").contents().find('#dicomImage').get(0);
        cornerstone.enable(element);

        cornerstoneTools.mouseInput.enable(element);
        cornerstoneTools.mouseWheelInput.enable(element);

        // load and display first image
        var imagePromise = updateTheImage(0);
        var numLoadedImages = 1;

        // add handlers for mouse events once the image is loaded.
        // add handlers for mouse events once the image is loaded.
        imagePromise.then(function() {
            viewport = cornerstone.getViewport(element);
            $('#bottomright').text("Zoom: " + viewport.scale.toFixed(2) + "x");
            $('#bottomleft').text("WW/WC:" + Math.round(viewport.voi.windowWidth) + "/" + Math.round(viewport.voi.windowCenter));
            // add event handlers to pan image on mouse move
            $('#dicomImage').mousedown(function (e) {
                var lastX = e.pageX;
                var lastY = e.pageY;
                var mouseButton = e.which;
                $(document).mousemove(function (e) {
                    var deltaX = e.pageX - lastX,
                            deltaY = e.pageY - lastY;
                    lastX = e.pageX;
                    lastY = e.pageY;
                    if (mouseButton == 1) {
                        var viewport = cornerstone.getViewport(element);
                        viewport.voi.windowWidth += (deltaX / viewport.scale);
                        viewport.voi.windowCenter += (deltaY / viewport.scale);
                        cornerstone.setViewport(element, viewport);
                        $('#bottomleft').text("WW/WL:" + Math.round(viewport.voi.windowWidth) + "/" + Math.round(viewport.voi.windowCenter));
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
                        $('#bottomright').text("Zoom: " + viewport.scale.toFixed(2) + "x");
                    }
                });
                $(document).mouseup(function (e) {
                    $(document).unbind('mousemove');
                    $(document).unbind('mouseup');
                });
            });
            $('#dicomImage').on('mousewheel DOMMouseScroll', function (e) {
                // Firefox e.originalEvent.detail > 0 scroll back, < 0 scroll forward
                // chrome/safari e.originalEvent.wheelDelta < 0 scroll back, > 0 scroll forward
                if (e.originalEvent.wheelDelta < 0 || e.originalEvent.detail > 0) {
                    if (currentImageIndex == 0) {
                        updateTheImage(1);
                    }
                } else {
                    if (currentImageIndex == 1) {
                        updateTheImage(0);
                    }
                }
                //prevent page fom scrolling
                return false;
            });
            // Add event handler to the ww/wc apply button
            $('#x256').click(function (e) {
                $('#dicomImage').width(256).height(256);
                $('#dicomImageWrapper').width(256).height(256);
                cornerstone.resize(element);
            });
            $('#x512').click(function (e) {
                $('#dicomImage').width(512).height(512);
                $('#dicomImageWrapper').width(512).height(512);
                cornerstone.resize(element);
            });
            $('#invert').click(function (e) {
                var viewport = cornerstone.getViewport(element);
                if (viewport.invert === true) {
                    viewport.invert = false;
                } else {
                    viewport.invert = true;
                }
                cornerstone.setViewport(element, viewport);
            });
            $('#interpolation').click(function (e) {
                var viewport = cornerstone.getViewport(element);
                if (viewport.pixelReplication === true) {
                    viewport.pixelReplication = false;
                } else {
                    viewport.pixelReplication = true;
                }
                cornerstone.setViewport(element, viewport);
            });
            $('#hflip').click(function (e) {
                var viewport = cornerstone.getViewport(element);
                viewport.hflip = !viewport.hflip;
                cornerstone.setViewport(element, viewport);
            });
            $('#vflip').click(function (e) {
                var viewport = cornerstone.getViewport(element);
                viewport.vflip = !viewport.vflip;
                cornerstone.setViewport(element, viewport);
            });
            $('#rotate').click(function (e) {
                var viewport = cornerstone.getViewport(element);
                viewport.rotation+=90;
                cornerstone.setViewport(element, viewport);
            });
            $(element).mousemove(function(event)
            {
                var pixelCoords = cornerstone.pageToPixel(element, event.pageX, event.pageY);
                var x = event.pageX;
                var y = event.pageY;
                $('#coords').text("pageX=" + event.pageX + ", pageY=" + event.pageY + ", pixelX=" + pixelCoords.x + ", pixelY=" + pixelCoords.y);
            });

            $('#dicomImage').on('mousewheel DOMMouseScroll', function (e) {
                // Firefox e.originalEvent.detail > 0 scroll back, < 0 scroll forward
                // chrome/safari e.originalEvent.wheelDelta < 0 scroll back, > 0 scroll forward
                if (e.originalEvent.wheelDelta < 0 || e.originalEvent.detail > 0) {
                    if (currentImageIndex == 0) {
                        updateTheImage(1);
                    }
                } else {
                    if (currentImageIndex == 1) {
                        updateTheImage(0);
                    }
                }
                //prevent page fom scrolling
                return false;
            });

            $(element).mousemove(function(event)
            {
                var pixelCoords = cornerstone.pageToPixel(element, event.pageX, event.pageY);
                var x = event.pageX;
                var y = event.pageY;
                $('#coords').text("pageX=" + event.pageX + ", pageY=" + event.pageY + ", pixelX=" + pixelCoords.x + ", pixelY=" + pixelCoords.y);
            });
        });



        for (var i = 1; i < imageIds.length; i++) {
            // load entire image stack without displaying
            cornerstone.loadAndCacheImage(imageIds[i]).then(function(image) {
                //cornerstone.displayImage(element, image);
                numLoadedImages++;
            });
        }

    }
    
    var getImages = function () {
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
        setTimeout(function () {
            imageIds = imageIds.sort(compareNumbers);
            /*while(imageIds.length<1) {
                console.log(imageIds.length);
            }*/
            getImageStack();
            console.log("Loaded Image Stack");
        }, 3000);
    }

    $.ajax({
        method: 'GET',
        url: 'https://central.xnat.org/data/experiments/CENTRAL_E07330/scans/7/files?format=json',
        headers: {
            //'Authorization': 'Basic ' + 'uname' + ':' + 'pw',
            //or
            //'Authorization': 'Bearer ' + 'token'
            //
            'Content-Type': 'application/json'
        }
    }).done(function (data) {
        //console.log(data);
        var filtered = _.filter(data.ResultSet.Result, function (image) {
            return image.collection === "DICOM";
        });
        imageIds = _.map(filtered, function (image) {
            return "dicomweb:" + baseUri + image.URI;
        })
        //console.log(imageIds);
        getImages();
    });
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