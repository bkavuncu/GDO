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

    $.connection.xNATImagingAppHub.client.receiveControl = function (instanceId, controlName) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received Control : " + controlName);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received Control : " + controlName);
            gdo.net.app["XNATImaging"].clientControl(instanceId, controlName);
        }
    }

    /*  TODO: Add receive method to update image parameters based on control input
        Update image parameters
        WW/WC
        Zoom
        Pan
        currentImgIndex
    */
});

gdo.net.app["XNATImaging"].getSection = function(row, col) {
    if (col < 2) {
        return "MRI";
    } else if (col == 2) {
        return "PDF";
    } else if (col < 6) {
        return "ZOOM";
    }
};

gdo.net.app["XNATImaging"].initClient = function () {
    var nodeId = gdo.clientId;

    gdo.consoleOut('.XNATImaging', 1, 'Initializing XNATImaging App Client at Node ' + nodeId);

    var row = gdo.net.node[nodeId].row;
    var col = gdo.net.node[nodeId].col;
    var section = gdo.net.app["XNATImaging"].getSection(row, col);

    gdo.consoleOut('.XNATImaging', 1, 'Part of section: ' + section);

    if (section == "MRI") {
        gdo.net.app["XNATImaging"].setupMRI(nodeId, row, col);

    } else if (section == "PDF") {
        gdo.net.app["XNATImaging"].setupPDF(row, col);

    } else if (section == "ZOOM") {
        gdo.net.app["XNATImaging"].setupZOOM();
    }
}

gdo.net.app["XNATImaging"].initControl = function () {
    gdo.controlId = getUrlVar("controlId");
    gdo.net.app["XNATImaging"].server.requestName(gdo.controlId);
    gdo.consoleOut('.XNATImaging', 1, 'Initializing XNATImaging App Control at Instance ' + gdo.controlId);

    $("iframe").contents().find("#viewSelect").selectmenu();

    gdo.net.instance[gdo.controlId].playing = false;
    gdo.net.instance[gdo.controlId].interval = null;

    var mode = "t1";
    var url = "GSK131086_000001/Baseline/flair";
    gdo.net.instance[gdo.controlId].stack = {
        currentImageIndex: 0,
        imageIds: []
    }
    gdo.net.app["XNATImaging"].initialiseCS(url, mode, 900, 600, gdo.controlId);

    gdo.net.app["XNATImaging"].initButtons(gdo.controlId);
}

gdo.net.app["XNATImaging"].setupMRI = function(nodeId, row, col) {
    var url;
    var mode;

    switch (row) {
        case 1:
            mode = "flair";
            if (col == 0) {
                $("iframe").contents().find(".heading h3").text(mode.toUpperCase());
                $("iframe").contents().find(".heading h3").css({ "padding-bottom": 0 });
                url = "GSK131086_000001/Baseline/flair";
            } else {
                url = "GSK131086_000001/Followup/flair";
            }
            break;
        case 2:
            mode = "t1";
            if (col == 0) {
                $("iframe").contents().find(".heading h3").text(mode.toUpperCase());
                $("iframe").contents().find(".heading h3").css({ "padding-bottom": 0 });
                url = "GSK131086_000001/Baseline/t1";
            } else {
                url = "GSK131086_000001/Followup/t1";
            }
            break;
        case 3:
            mode = "ajax";
            if (col == 0) {
                $("iframe").contents().find(".heading h3").text(mode.toUpperCase());
                $("iframe").contents().find(".heading h3").css({ "padding-bottom": 0 });
                url = "/data/experiments/CENTRAL_E07330/scans/7/files?format=json";
            } else {
                url = "/data/experiments/CENTRAL_E07330/scans/7/files?format=json";
            }
            break;
    }
    if (row == 0) {
        $("iframe").contents().find("#main").empty();
        $("iframe").contents().find("#main").append("<div class='heading'>");
        if (col == 0) {
            $("iframe").contents().find(".heading").append("<h1>Multiple Sclerosis Imaging</h1>");
            $("iframe").contents().find(".heading").append("<h2>Baseline</h2>");
        } else {
            $("iframe").contents().find(".heading").append("<h2>Followup</h2>");
        }
        $("iframe").contents().find("#main").append("</div>");
    } else {
        gdo.net.instance[nodeId].playing = false;
        gdo.net.instance[nodeId].interval = null;

        gdo.net.instance[nodeId].stack = {
            currentImageIndex: 0,
            imageIds: []
        }
        gdo.net.app["XNATImaging"].initialiseCS(url, mode, 1300, 900, nodeId);
    }
}

gdo.net.app["XNATImaging"].setupPDF = function (row, col) {
    // hardcoded pdf urls based on screen row
    switch (row) {
        case 1:
            $("iframe").contents().find("#main")
            .html(
                "<object data='../../Scripts/XNATImaging/pdf/GSK131086_000001_140926_msmetrix_report-3.pdf#zoom=150&amp;#toolbar=0' type='application/pdf' width='100%' height='1080px'>" +
                "<embed src='../../Scripts/XNATImaging/pdf/GSK131086_000001_140926_msmetrix_report-3.pdf#zoom=150&amp;#toolbar=0' type='application/pdf' />" +
                "</object>"
            );
            break;
        case 2:
            $("iframe").contents().find("#main")
            .html(
                "<object data='../../Scripts/XNATImaging/pdf/GSK131086_000001_msmetrix_report-2.pdf#zoom=150&amp;#toolbar=0' type='application/pdf' width='100%' height='1080px'>" +
                "<embed src='../../Scripts/XNATImaging/pdf/GSK131086_000001_msmetrix_report-2.pdf#zoom=150&amp;#toolbar=0' type='application/pdf' />" +
                "</object>"
            );
            break;
        case 3:
            $("iframe").contents().find("#main")
            .html(
                "<object data='../../Scripts/XNATImaging/pdf/GSK131086_000001_150925_msmetrix_report-3.pdf#zoom=150&amp;#toolbar=0' type='application/pdf' width='100%' height='1080px'>" +
                "<embed src='../../Scripts/XNATImaging/pdf/GSK131086_000001_150925_msmetrix_report-3.pdf#zoom=150&amp;#toolbar=0' type='application/pdf' />" +
                "</object>"
            );
            break;
        default:
            $("iframe").contents().find("#main").empty();
            $("iframe").contents().find("#main").append("<div class='heading'>");
            $("iframe").contents().find(".heading").append("<h1>Reports</h1>");
            $("iframe").contents().find("#main").append("</div>");
    }
}

gdo.net.app["XNATImaging"].setupZOOM = function() {
    $("iframe").contents().find("#main").empty();
    $("iframe").contents().find("#main").append("<div class='heading'>");
    $("iframe").contents().find(".heading").append("<h3>ZOOM ZOOM ZOOM</h3>");
    $("iframe").contents().find("#main").append("</div>");
    $("iframe").contents().find("#main").append("<p>Zoom goes here!</p>");
}

gdo.net.app["XNATImaging"].initialiseCS = function (url, mode, width, height, instanceId) {

    var view = {
        zoomLevel: 2.34,
        windowWidth: 394,
        windowCenter: 192
    }

    if (mode == "ajax") {
        var baseUrl = "https://central.xnat.org";
        $.ajax({
            method: 'GET',
            url: baseUrl + url,
            headers: {
                'Content-Type': 'application/json'
            },
            success: function(data) {
                gdo.consoleOut(data);
                var filtered = _.filter(data.ResultSet.Result,
                    function(image) {
                        return image.collection === "DICOM";
                    });
                gdo.net.instance[instanceId].stack.imageIds = _.map(filtered,
                    function(image) {
                        return "wadouri:" + baseUrl + image.URI;
                    })
                //gdo.consoleOut(gdo.net.instance[instanceId].stack.imageIds);
                gdo.net.app["XNATImaging"].sortImageStack(instanceId, mode);
                setTimeout(function() {
                        gdo.net.app["XNATImaging"].getImageStack(width, height, instanceId);
                    },
                    1000);
                gdo.consoleOut("Loaded Image Stack");
            }
        });
    } else {
        var baseUrl = "http://localhost:12332/Scripts/XNATImaging/Scans/";
        $.ajax({
            url: baseUrl + url,
            success: function(data) {
                //List all png or jpg or gif file names in the page
                $(data).find('a:contains("dcm")')
                    .each(function() {
                        var filename = this.href.replace(window.location.host, "").replace("http:///", "");
                        gdo.net.instance[instanceId].stack.imageIds.push("wadouri:" + "http://localhost:12332/" + filename);
                        //console.log(filename);
                    });

                //console.log(gdo.net.instance[instanceId].stack.imageIds);

                setTimeout(function() {
                        gdo.net.app["XNATImaging"].getImageStack(width, height, instanceId);
                    },
                    1000);
                gdo.consoleOut("Loaded Image Stack");
            }
        });
    }
}

gdo.net.app["XNATImaging"].sortImageStack = function (instanceId, mode) {
    function compareNumbers (a, b) {
        //1.3.12.2.1107.5.2.36.40436.30000014081908371717200000064-8-41-skte63.dcm
        //index
        var strippedA = a.substr(a.lastIndexOf("/") + 1);
        var strippedB = b.substr(b.lastIndexOf("/") + 1);
        //gdo.consoleOut(strippedA);

        //8-41-skte63.dcm
        strippedA = strippedA.substring(strippedA.indexOf("-"));
        strippedB = strippedB.substring(strippedB.indexOf("-"));
        //gdo.consoleOut(strippedA);

        //8-41
        strippedA = strippedA.substring(0, strippedA.lastIndexOf("-"));
        strippedB = strippedB.substring(0, strippedB.lastIndexOf("-"));
        //gdo.consoleOut(strippedA);

        //41
        strippedA = strippedA.substring(strippedA.lastIndexOf("-") + 1);
        strippedB = strippedB.substring(strippedB.lastIndexOf("-") + 1);
        //gdo.consoleOut(strippedA);

        return parseInt(strippedA) - parseInt(strippedB);
    }

    if (mode == "ajax") {
        gdo.net.instance[instanceId].stack.imageIds = gdo.net.instance[instanceId].stack.imageIds.sort(compareNumbers);
    }
}

gdo.net.app["XNATImaging"].getImageStack = function (width, height, instanceId) {
    var element = $("iframe").contents().find('#dicomImage').get(0);
    cornerstone.enable(element);

    cornerstoneTools.mouseInput.enable(element);
    cornerstoneTools.mouseWheelInput.enable(element);

    // load and display first image
    var imagePromise = gdo.net.app["XNATImaging"].updateTheImage(instanceId);
    var numLoadedImages = 1;
    $("iframe").contents().find("#mrtopleft").text("Image: " + 1);

    gdo.consoleOut("First image loaded?");

    // add handlers for mouse events once the image is loaded.
    imagePromise.then(function () {
        gdo.consoleOut("Image promise loaded");
        var viewport = cornerstone.getViewport(element);
        // Temp Fix for followup image brightness
        if (viewport.voi.windowCenter < -350) {
            viewport.voi.windowCenter = 35;
            viewport.voi.windowWidth = 80;
            cornerstone.setViewport(element, viewport);
        }

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
                gdo.net.app["XNATImaging"].navigateDown(instanceId);
                if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
                    gdo.consoleOut('.XNATImaging', 1, 'Sending Control to Clients :' + 'Down');
                    gdo.net.app["XNATImaging"].server.setControl(instanceId, $("iframe").contents().find('#downNavigationButton').text());
                }
            } else if (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) {
                if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
                    gdo.consoleOut('.XNATImaging', 1, 'Sending Control to Clients :' + 'Up');
                    gdo.net.app["XNATImaging"].server.setControl(instanceId, $("iframe").contents().find('#upNavigationButton').text());
                }
                gdo.net.app["XNATImaging"].navigateUp(instanceId);
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

    for (var i = 1; i < gdo.net.instance[instanceId].stack.imageIds.length; i++) {
        // load entire image stack without displaying
        cornerstone.loadAndCacheImage(gdo.net.instance[instanceId].stack.imageIds[i]).then(function (image) {
            //cornerstone.displayImage(element, image);
            numLoadedImages++;
        });
    }

    // resize dicom image frame to fill screen
    gdo.consoleOut("Resize 1000");
    $("iframe").contents().find('#dicomImage').width(width).height(height);
    cornerstone.resize(element);
}

gdo.net.app["XNATImaging"].updateTheImage = function (instanceId) {
    return cornerstone.loadImage(gdo.net.instance[instanceId].stack.imageIds[gdo.net.instance[instanceId].stack.currentImageIndex]).then(function (image) {
        $("iframe").contents().find("#mrtopleft").text("Image: " + (gdo.net.instance[instanceId].stack.currentImageIndex + 1));

        var element = $("iframe").contents().find('#dicomImage').get(0);
        var viewport = cornerstone.getViewport(element);
        cornerstone.displayImage(element, image, viewport);
        gdo.consoleOut("Image " + gdo.net.instance[instanceId].stack.currentImageIndex + " loaded and displaying");
    });
};

gdo.net.app["XNATImaging"].clientControl = function(instanceId, controlName) {
    
    switch(controlName) {
    
        case 'Up':
            gdo.consoleOut('.XNATImaging', 1, 'Receiving Control to Clients :' + 'Up');
            gdo.net.app["XNATImaging"].navigateUp(instanceId);
            break;
        case 'Down':
            gdo.consoleOut('.XNATImaging', 1, 'Receiving Control to Clients :' + 'Down');
            gdo.net.app["XNATImaging"].navigateDown(instanceId);
            break;
        case 'Reset View':
            gdo.consoleOut('.XNATImaging', 1, 'Receiving Control to Clients :' + 'Reset');
            gdo.net.app["XNATImaging"].resetView(gdo.clientId);
            break;
        case 'Play':
            gdo.consoleOut('.XNATImaging', 1, 'Receiving Control to Clients :' + 'Play');
            gdo.net.app["XNATImaging"].playAll(gdo.clientId);
            break;
        default:
            gdo.consoleOut('.XNATImaging', 1, "Not a command");
    }
}

gdo.net.app["XNATImaging"].initButtons = function (instanceId) {

    $("iframe").contents().find("#upNavigationButton")
       .unbind()
       .click(function () {
           gdo.consoleOut('.XNATImaging', 1, 'Sending Control to Clients :' + 'Up');
           gdo.net.app["XNATImaging"].server.setControl(instanceId, $("iframe").contents().find('#upNavigationButton').text());
           gdo.net.app["XNATImaging"].navigateUp(instanceId);
       });

    $("iframe").contents().find("#downNavigationButton")
    .unbind()
    .click(function () {
        gdo.consoleOut('.XNATImaging', 1, 'Sending Control to Clients :' + 'Down');
        gdo.net.app["XNATImaging"].server.setControl(instanceId, $("iframe").contents().find('#downNavigationButton').text());
        gdo.net.app["XNATImaging"].navigateDown(instanceId);
    });

    $("iframe").contents().find("#resetButton")
    .unbind()
    .click(function () {
        gdo.consoleOut('.XNATImaging', 1, 'Sending Control to Clients :' + 'Reset');
        gdo.net.app["XNATImaging"].server.setControl(instanceId, $("iframe").contents().find('#resetButton').text());
        gdo.net.app["XNATImaging"].resetView(instanceId);
    });

    $("iframe").contents().find("#playButton")
    .unbind()
    .click(function () {
        gdo.consoleOut('.XNATImaging', 1, 'Sending Control to Clients :' + 'Play');
        gdo.net.app["XNATImaging"].server.setControl(instanceId, $("iframe").contents().find('#playButton').text());

        gdo.net.app["XNATImaging"].playAll(instanceId);
    });

    $("iframe").contents().find("#highlightButton")
        .unbind()
        .click(function () {
            gdo.consoleOut('.XNATImaging', 1, "Highlight");
    });

    $("iframe").contents().find("#markerButton")
        .unbind()
        .click(function () {
            gdo.consoleOut('.XNATImaging', 1, "Mark");
    });

}

gdo.net.app["XNATImaging"].navigateUp = function (instanceId) {
    var id;
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        id = instanceId;
    } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
        id = gdo.clientId;
    }
    if (gdo.net.instance[id].stack.currentImageIndex < gdo.net.instance[id].stack.imageIds.length - 1) {
        gdo.net.instance[id].stack.currentImageIndex++;
        gdo.net.app["XNATImaging"].updateTheImage(id);
    }
}

gdo.net.app["XNATImaging"].navigateDown = function (instanceId) {
    var id;
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        id = instanceId;
    } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
        id = gdo.clientId;
    }
    if (gdo.net.instance[id].stack.currentImageIndex > 0) {
        gdo.net.instance[id].stack.currentImageIndex--;
        gdo.net.app["XNATImaging"].updateTheImage(id);
    }
}

gdo.net.app["XNATImaging"].resetView = function(instanceId) {
    gdo.net.instance[instanceId].stack.currentImageIndex = 0;
    gdo.net.app["XNATImaging"].updateTheImage(instanceId);
}

/* TODO: Clean mess; make pausing work on client properly/in sync
** TODO: Want to push currentImg onto clients on pause
*/
gdo.net.app["XNATImaging"].playAll = function (instanceId) {
    console.log("Playing: " + gdo.net.instance[instanceId].playing);
    if (gdo.net.instance[instanceId].playing == false && gdo.net.instance[instanceId].stack.currentImageIndex < gdo.net.instance[instanceId].stack.imageIds.length - 1) {
        gdo.net.instance[instanceId].playing = true;
        $('iframe').contents().find('#playButton').text("Pause");
        gdo.net.instance[instanceId].interval = setInterval(function () {
            if (gdo.net.instance[instanceId].stack.currentImageIndex < gdo.net.instance[instanceId].stack.imageIds.length - 1 && gdo.net.instance[instanceId].playing) {
                
                gdo.net.instance[instanceId].stack.currentImageIndex++;
                gdo.net.app["XNATImaging"].updateTheImage(instanceId);
            } else {
                clearInterval(gdo.net.instance[instanceId].interval);
                $('iframe').contents().find('#playButton').text("Play");
                gdo.net.instance[instanceId].playing = false;
            }
        }, 300);
    } else if (gdo.net.instance[instanceId].playing == true || gdo.net.instance[instanceId].stack.currentImageIndex >= gdo.net.instance[instanceId].stack.imageIds.length) {
        $('iframe').contents().find('#playButton').text("Play");
        clearInterval(gdo.net.instance[instanceId].interval);
        gdo.net.instance[instanceId].playing = false;
    }
    console.log("Playing: " + gdo.net.instance[instanceId].playing);
}

gdo.net.app["XNATImaging"].terminateClient = function () {
    gdo.consoleOut('.XNATImaging', 1, 'Terminating XNATImaging App Client at Node ' + clientId);
}

gdo.net.app["XNATImaging"].terminateControl = function () {
    gdo.consoleOut('.XNATImaging', 1, 'Terminating XNATImaging App Control at Instance ' + gdo.controlId);
}