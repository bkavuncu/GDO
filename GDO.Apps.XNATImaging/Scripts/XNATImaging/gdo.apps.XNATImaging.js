"use strict";

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

    $.connection.xNATImagingAppHub.client.receiveConfig = function (instanceId, config) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received Config? nah");
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received Config : ");
            gdo.consoleOut('.XNATImaging', 1, JSON.stringify(config));
            gdo.net.app["XNATImaging"].initZoom(instanceId, config);
        }
    }

    /* 
    ** SignalR receive method to update image parameters based on control input
    **  Update image parameters:
    **  instanceId      int
    **  windowWidth     int
    **  windowCenter    int
    **  currentImageId  int
    **  scale           double
    **  translationX    double
    **  translationY    double
    */
    $.connection.xNATImagingAppHub.client.receiveImageUpdate =
        function (instanceId, currentImageId, windowWidth, windowCenter, scale, translationX, translationY, rotate) {
            if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
                // ignore
                gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received ImageUpdate");
            } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
                gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received ImageUpdate");
                gdo.net.app["XNATImaging"].updateImageParams(instanceId, currentImageId, windowWidth, windowCenter, scale, translationX, translationY, rotate);
            }
        }
});

/* 
**  Determine app section based on column
*/
gdo.net.app["XNATImaging"].getSection = function(col) {
    if (col < 2) {
        return "MRI";
    } else if (col == 2) {
        return "PDF";
    } else if (col < 6) {
        return "ZOOM";
    }
};

/*
** Entry point for Client nodes
*/
gdo.net.app["XNATImaging"].initClient = function (papaya, containers) {
    var instanceId = gdo.net.node[gdo.clientId].appInstanceId;
    gdo.loadScript('mpr', 'XNATImaging', gdo.SCRIPT_TYPE.APP);

    gdo.consoleOut('.XNATImaging', 1, 'Initializing XNATImaging App Client at Node ' + gdo.clientId);

    var row = gdo.net.node[gdo.clientId].row;
    var col = gdo.net.node[gdo.clientId].col;
    var section = gdo.net.app["XNATImaging"].getSection(col);

    gdo.consoleOut('.XNATImaging', 1, 'Part of section: ' + section);

    if (section == "MRI") {
        gdo.net.app["XNATImaging"].setupMRI(instanceId, row, col, papaya, containers);

    } else if (section == "PDF") {
        gdo.net.app["XNATImaging"].setupPDF(row);

    } else if (section == "ZOOM") {
        $("iframe").contents().find("#main").empty();
        $("iframe").contents().find("#main").append("<div class='heading'>");
        $("iframe").contents().find(".heading").append("<h3>ZOOM ZOOM ZOOM</h3>");
        $("iframe").contents().find("#main").append("</div>");
        $("iframe").contents().find("#main").append("<p>Zoom goes here!</p>");
        gdo.net.app["XNATImaging"].server.requestConfig(instanceId, gdo.clientId);
    }
}

/*
** Entry point for Control node
*/
gdo.net.app["XNATImaging"].initControl = function (instanceId, papaya, containers) {
    gdo.loadScript('mpr', 'XNATImaging', gdo.SCRIPT_TYPE.APP);

    gdo.consoleOut('.XNATImaging', 1, 'Initializing XNATImaging App Control at Instance ' + instanceId);

    $("iframe").contents().find("#viewSelect").selectmenu();

    

    gdo.net.instance[instanceId].playing = false;
    gdo.net.instance[instanceId].interval = null;

    var mode = "t1";
    var url = "GSK131086_000001/Baseline/flair";
    gdo.net.instance[instanceId].stack = {
        currentImageIndex: 0,
        imageIds: []
    }
    gdo.net.app["XNATImaging"].initialiseCS(url, mode, 900, 600, instanceId, papaya, containers);

    gdo.net.app["XNATImaging"].initButtons(instanceId);
}

/*
** Initialise Client nodes on MRI section of app
*/
gdo.net.app["XNATImaging"].setupMRI = function (instanceId, row, col, papaya, containers) {
    
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
                    url = "GSK131086_000001/Baseline/t1";
                } else {
                    url = "GSK131086_000001/Baseline/t1";
                }
                break;
        }

        gdo.net.instance[instanceId].playing = false;
        gdo.net.instance[instanceId].interval = null;

        gdo.net.instance[instanceId].stack = {
            currentImageIndex: 0,
            imageIds: []
        }
        gdo.net.app["XNATImaging"].initialiseCS(url, mode, 1300, 900, instanceId, papaya, containers);
    }
}

/*
** Initialise Client nodes on PDF section of app
*/
gdo.net.app["XNATImaging"].setupPDF = function (row) {
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

/*
** Initialise Client nodes on Zoom section of app
*/
gdo.net.app["XNATImaging"].initZoom = function (instanceId, json) {
    $("iframe").contents().find("#main").empty();
    //$("iframe").contents().find('#main').append("<button id='testButton' type='button'>MoveIt</button>");
    $("iframe").contents().find("#main").append(
        "<div id='dicomImage' update-image " +
        "mouse-wheel-up='' mouse-wheel-down='' mouse-click='' " +
        "class='cornerstone-enabled-image' oncontextmenu='return false' " +
        "unselectable='off' onselectstart='return false;' onmousedown='return false;'></div>"
    );

    gdo.net.instance[instanceId].playing = false;
    gdo.net.instance[instanceId].interval = null;

    gdo.net.instance[instanceId].stack = {
        currentImageIndex: 0,
        imageIds: []
    }
    gdo.net.instance[instanceId].zoomView = {
        zoomId: json.id,
        url: json.url,
        topLeft: json.topLeft,
        bottomRight: json.topRight,
        zoomFactor: json.zoomFactor
    }
    gdo.net.app["XNATImaging"].initialiseCS(json.url, "zoom", gdo.net.node[gdo.clientId].width, gdo.net.node[gdo.clientId].height, instanceId, papaya);
}

/*
** Gathers ImageIds Array from DICOM data source
*/
gdo.net.app["XNATImaging"].initialiseCS = function (url, mode, width, height, instanceId, papaya, containers) {

    // TODO: Scans to lowercase scans
    var baseUrl = "http://localhost:12332/Scripts/XNATImaging/Scans/";
        //"http://dsigdotesting.doc.ic.ac.uk/Scripts/XNATImaging/Scans/";
        //"http://localhost:12332/Scripts/XNATImaging/Scans/";
    $.ajax({
        url: baseUrl + url,
        success: function(data) {
            //List all png or jpg or gif file names in the page
            $(data).find('a:contains("dcm")')
                .each(function() {
                    var filename = this.href.replace(window.location.host, "").replace("http:///", "");
                    gdo.net.instance[instanceId].stack.imageIds.push("http://localhost:12332/" + filename);
                    //"http://dsigdotesting.doc.ic.ac.uk/"
                    //console.log(filename);
                });
        }
    });

    setTimeout(function() {
        if (mode == "zoom") {
            gdo.net.app["XNATImaging"].getZoomStack(width, height, instanceId);
        } else {
            gdo.consoleOut(".XNATImaging", 1, "non zoom node");

            gdo.net.app["XNATImaging"].getImageStack(width, height, instanceId, papaya, containers);

            var url = "http://localhost:12332/Scripts/XNATImaging/Scans/GSK131086_000001/Baseline/t1/Ad201713-MR-2-2678.dcm";
            $.when( gdo.net.app["XNATImaging"].getImageProperties(url) ).then(
                function (data) {
                    //console.log(data.url + ":" + data.orientation);
                }
            );
            //console.log(currentImageLoaded);
        }
    }, 1000);
    gdo.consoleOut('.XNATImaging', 1, "Loaded Image Stack");
}

gdo.net.app["XNATImaging"].initialiseSlider = function (instanceId, papaya, containers) {
    // Initialize range input
    var slider = $("iframe").contents().find('#slice-range').get(0);
    gdo.consoleOut(".XNATImaging", 1, "Initialised slider");
    // Set minimum and maximum value
    slider.min = 0;
    slider.step = 1;

    var max = 255;
    var currentOrientation = gdo.net.app["XNATImaging"].getCurrentOrientation(instanceId, papaya, containers);
    if (currentOrientation == "Axial") {
        max = containers[0].viewer.volume.header.imageDimensions.zDim;
    } else if (currentOrientation == "Coronal") {
        max = containers[0].viewer.volume.header.imageDimensions.yDim;
    } else if (currentOrientation == "Sagittal") {
        max = containers[0].viewer.volume.header.imageDimensions.xDim;
    } else {
        max = gdo.net.instance[instanceId].imageIds.length - 1;
    }

    slider.max = max;
    gdo.consoleOut(".XNATImaging", 1, "Initialised slider with range 0-" + slider.max);
    // Set current value
    //slider.value = gdo.net.instance[instanceId].stack.currentImageIndex;
    slider.value = containers[0].viewer.mainImage.currentSlice;
    gdo.consoleOut(".XNATImaging", 1, "Initialised slider to current index " + slider.value);
}

gdo.net.app["XNATImaging"].getCurrentOrientation = function(instanceId, papaya, containers) {
    var viewer = containers[0].viewer;
    var mainImage = viewer.mainImage;

    if (mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
        return "Axial";
    } else if (mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
        return "Coronal";
    } else if (mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
        return "Sagittal";
    }
}

/*
** Loads in image stack using cornerstone for Client and Control nodes
*/
gdo.net.app["XNATImaging"].getImageStack = function (width, height, instanceId, papaya, containers) {
    var params = [];
    var imageIds = gdo.net.instance[instanceId].stack.imageIds;
    //var imageIds = ["http://localhost:12332/Scripts/XNATImaging/Scans/GSK131086_000001/Baseline/t1/Ad201713-MR-2-2724.dcm", "http://localhost:12332/Scripts/XNATImaging/Scans/GSK131086_000001/Baseline/t1/Ad201713-MR-2-2725.dcm"];
    var imageName = "MPRAGE_ADNI_P2";

    params["images"] = [imageIds];
    //params[imageName] = { min: 10, max: 1345 };
    params["orthogonal"] = true;
    params["fullScreen"] = false;
    params["mainView"] = "sagittal";
    params["radiological"] = false;
    params["worldSpace"] = false;
    params["showControls"] = false;

    papaya.Container.resetViewer(0, params);

    console.log(papaya);
    console.log(containers);

    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        // add handlers for mouse events once the image is loaded
        gdo.net.app["XNATImaging"].setMouseHandlers(instanceId, papaya, containers);
    }

    // load and display first image
    //var imagePromise = gdo.net.app["XNATImaging"].updateTheImage(instanceId);

    /*imagePromise.then(function () {
        gdo.consoleOut('.XNATImaging', 1, "Image promise loaded");
        var viewport = cornerstone.getViewport(element);

        // Temp Fix for followup image brightness
        if (viewport.voi.windowCenter < -3500) {
            viewport.voi.windowCenter = 26;
            viewport.voi.windowWidth = 204;
            cornerstone.setViewport(element, viewport);
        }

        $("iframe").contents().find('#mrbottomright').text("Zoom: " + viewport.scale.toFixed(2) + "x");
        $("iframe").contents().find('#mrbottomleft').text("WW/WC:" + Math.round(viewport.voi.windowWidth) + "/" + Math.round(viewport.voi.windowCenter));
    });*/
}

/*
** Sets mouse handlers for control Node
*/
gdo.net.app["XNATImaging"].setMouseHandlers = function (instanceId, papaya, containers) {
    $("iframe").contents().find("#viewSelect").on("selectmenuchange", function (event, ui) {
        var text = $("iframe").contents().find("#viewSelect option:selected").text();
        console.log(text);
        var viewer = containers[0].viewer;
        console.log(viewer);
        switch (text) {
            case 'Sagittal':
            case 'Axial':
            case 'Coronal':
            default:
                containers[0].viewer.rotateViews();
                gdo.net.app["XNATImaging"].initialiseSlider(instanceId, papaya, containers);

                gdo.net.app["XNATImaging"].server.setImageConfig(instanceId, 1, 0,
                                                                    0, 0, 0, 0, true);
                gdo.consoleOut(".XNATImaging", 1, "Set New Image Config");
        }

        gdo.net.instance[instanceId].stack.currentImageIndex = viewer.mainImage.currentSlice;

        gdo.net.app["XNATImaging"].initialiseSlider(instanceId, papaya, containers);

    });

/*
    // add event handlers to pan image on mouse move
    $("iframe").contents().find('#dicomImage').mousedown(function (e) {
        var lastX = e.pageX;
        var lastY = e.pageY;
        var mouseButton = e.which;
        var diffX = 0.0;
        var diffY = 0.0;
        var diffScale = 0.0;
        $("iframe").contents().find('#dicomImage').mousemove(function(e) {
            var deltaX = e.pageX - lastX,
                deltaY = e.pageY - lastY;
            lastX = e.pageX;
            lastY = e.pageY;
            if (mouseButton == 1) {
                var viewport = cornerstone.getViewport(element);
                viewport.voi.windowWidth += (deltaX / viewport.scale);
                viewport.voi.windowCenter += (deltaY / viewport.scale);
                cornerstone.setViewport(element, viewport);
                $("iframe")
                    .contents()
                    .find('#mrbottomleft')
                    .text("WW/WL:" +
                        Math.round(viewport.voi.windowWidth) +
                        "/" +
                        Math.round(viewport.voi.windowCenter));
            } else if (mouseButton == 2) {
                var viewport = cornerstone.getViewport(element);
                diffX = (deltaX / viewport.scale);
                diffY = (deltaY / viewport.scale);
                viewport.translation.x += diffX;
                viewport.translation.y += diffY;
                cornerstone.setViewport(element, viewport);
            } else if (mouseButton == 3) {
                var viewport = cornerstone.getViewport(element);
                var oldScale = viewport.scale;
                viewport.scale += (deltaY / 100);
                cornerstone.setViewport(element, viewport);
                diffScale = viewport.scale / oldScale;
                $("iframe").contents().find('#mrbottomright').text("Zoom: " + viewport.scale.toFixed(2) + "x");
            }
        });
        $("iframe").contents().find('#dicomImage').mouseup(function () {
            $("iframe").contents().find('#dicomImage').unbind('mousemove');
            $("iframe").contents().find('#dicomImage').unbind('mouseup');

            if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
                var viewport = cornerstone.getViewport(element);
                var currentImageId = gdo.net.instance[instanceId].stack.currentImageIndex;

                gdo.consoleOut(".XNATImaging", 1, viewport.voi.windowWidth + ", " + viewport.voi.windowCenter + ", " + diffX + ", " + diffY + ", " + diffScale);
                gdo.net.app["XNATImaging"].server.setImageConfig(instanceId, currentImageId, viewport.voi.windowWidth,
                                                                    viewport.voi.windowCenter, diffScale, diffX, diffY, false);
                gdo.consoleOut(".XNATImaging", 1, "Set New Image Config");
            }
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
    });*/

    // Bind the range slider events
    $("iframe").contents().find('#slice-range').on("input", function (event) {
        //gdo.consoleOut(".XNATImaging", 1, "slider input event");
        var currentImageIndex = gdo.net.instance[instanceId].stack.currentImageIndex;
        // Get the range input value
        var newImageIndex = parseInt(event.currentTarget.value, 10);

        // Switch images, if necessary
        if (newImageIndex !== currentImageIndex) {

            gdo.consoleOut(".XNATImaging", 1, "Updating image using slider to " + newImageIndex);
            gdo.net.instance[instanceId].stack.currentImageIndex = newImageIndex;

            var viewer = containers[0].viewer;
            var mainImage = viewer.mainImage;

            if (mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
                viewer.currentCoord.z = newImageIndex;
            } else if (mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
                viewer.currentCoord.y = newImageIndex;
            } else if (mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
                viewer.currentCoord.x = newImageIndex;
            }

            viewer.gotoCoordinate(viewer.currentCoord);

            gdo.net.app["XNATImaging"].server.setImageConfig(instanceId, newImageIndex, 0, 0, 0, 0, 0, false);
            gdo.consoleOut(".XNATImaging", 1, "Set New Image Config- image id");
        }
    });
}

/*
** Update DICOM image using data received from server
*/
gdo.net.app["XNATImaging"].updateImageParams = function (
                                            instanceId, currentImageId, windowWidth, windowCenter,
                                            scale, translationX, translationY, rotate) {
    if (rotate) {
        console.log(papayaContainers);
        papayaContainers[0].viewer.rotateViews();
    }

    /*var element = $("iframe").contents().find("#dicomImage").get(0);
    var viewport = cornerstone.getViewport(element);

    gdo.consoleOut(".XNATImaging", 1, windowWidth + "/" + windowCenter + ", " + scale);

    viewport.voi.windowWidth = windowWidth;
    viewport.voi.windowCenter = windowCenter;
    // TODO: Figure out a scaling solution
    if (scale > 0) {
        viewport.scale *= scale;
    }

    // TODO: needs to be compatible with both MRI and ZOOM sections
    viewport.translation.x += translationX;
    viewport.translation.y += translationY;

    if (currentImageId != gdo.net.instance[instanceId].stack.currentImageIndex) {
        gdo.net.instance[instanceId].stack.currentImageIndex = currentImageId;
        gdo.net.app["XNATImaging"].updateTheImage(instanceId);
    }

    $("iframe").contents().find('#mrbottomleft').text("WW/WL:" + Math.round(windowWidth) + "/" + Math.round(windowCenter));
    $("iframe").contents().find('#mrbottomright').text("Zoom: " + viewport.scale.toFixed(2) + "x");

    cornerstone.setViewport(element, viewport);*/
}

/*
** Loads in image stack using cornerstone for Client nodes in Zoom section of app
*/
gdo.net.app["XNATImaging"].getZoomStack = function(width, height, instanceId) {
    var element = $("iframe").contents().find('#dicomImage').get(0);
    cornerstone.enable(element);

    cornerstoneTools.mouseInput.enable(element);
    cornerstoneTools.mouseWheelInput.enable(element);

    // load and display first image
    var imagePromise = gdo.net.app["XNATImaging"].updateTheImage(instanceId);

    var canvasWidth = width * 3;
    var canvasHeight = height * 4;

    // resize dicom image frame to fill screen
    gdo.consoleOut('.XNATImaging', 1, "Resize image to " + canvasWidth + "x" + canvasHeight);
    $("iframe").contents().find('#dicomImage').width(canvasWidth).height(canvasHeight);
    cornerstone.resize(element);

    gdo.consoleOut(".XNATImaging", 1, "Width x Height of image: (" + width + ", " + height + ")");
    gdo.consoleOut(".XNATImaging", 1, "Canvas dimensions: (" + canvasWidth + ", " + canvasHeight + ")");

    imagePromise.then(function () {

        //var scaleFactorX = canvasWidth / width;
        //var scaleFactorY = canvasHeight / height;
        var offsetX = gdo.net.instance[instanceId].zoomView.topLeft[0];
        var offsetY = gdo.net.instance[instanceId].zoomView.topLeft[1];
        gdo.consoleOut(".XNATImaging", 1, "Offset image by: (" + offsetX + ", " + offsetY + ")");

        var viewport = cornerstone.getViewport(element);
        viewport.translation.x += (-offsetX * width)/viewport.scale;
        viewport.translation.y += (-offsetY * height)/viewport.scale;
        cornerstone.setViewport(element, viewport);
        gdo.consoleOut(".XNATImaging", 1, "Scale of image: (" + viewport.scale + ")");
        
        var img = cornerstone.getImage(element);
        // var ctx = img.getCanvas().getContext('2d');
        // ctx.drawImage(img, offsetX, offsetY, width/3, height/3, 0, 0, width, height);
    });

    // load entire image stack without displaying
    /*for (var i = 1; i < gdo.net.instance[instanceId].stack.imageIds.length; i++) {
        cornerstone.loadAndCacheImage(gdo.net.instance[instanceId].stack.imageIds[i]);
    }*/
}

/*
** Updates currently displayed image of stack using cornerstone
*/
gdo.net.app["XNATImaging"].updateTheImage = function (instanceId) {
    var currentImgIdx = gdo.net.instance[instanceId].stack.currentImageIndex;
    var element = $("iframe").contents().find('#dicomImage').get(0);
    var viewport = cornerstone.getViewport(element);

    // Update the slider value
    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
        var slider = $("iframe").contents().find('#slice-range').get(0);
        if (slider.value != currentImgIdx) {
            gdo.consoleOut(".XNATImaging", 1, "Updating slider");
            slider.value = currentImgIdx;
        }
    }

    return cornerstone.loadAndCacheImage(gdo.net.instance[instanceId].stack.imageIds[currentImgIdx]).then(function (image) {
        $("iframe").contents().find("#mrtopleft").text("Image: " + (currentImgIdx + 1));

        cornerstone.displayImage(element, image, viewport);
        gdo.consoleOut('.XNATImaging', 1, "Image " + currentImgIdx + " loaded and displaying");
    });
};

/*
** Calls control functions based on received input from Control node
*/
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
            gdo.net.app["XNATImaging"].resetView(instanceId);
            break;
        case 'Play':
            gdo.consoleOut('.XNATImaging', 1, 'Receiving Control to Clients :' + 'Play');
            gdo.net.app["XNATImaging"].playAll(instanceId);
            break;
        case 'Pause':
            gdo.consoleOut('.XNATImaging', 1, 'Receiving Control to Clients :' + 'Pause');
            gdo.net.app["XNATImaging"].playAll(instanceId);
            break;
        default:
            gdo.consoleOut('.XNATImaging', 1, "Not a command");
    }
}

/*
** Sets event handlers for buttons on Control node
*/
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

/*
** Method to handle scrolling up the image stack
*/
gdo.net.app["XNATImaging"].navigateUp = function (instanceId) {
    if (gdo.net.instance[instanceId].stack.currentImageIndex < gdo.net.instance[instanceId].stack.imageIds.length - 1) {
        gdo.net.instance[instanceId].stack.currentImageIndex++;
        gdo.net.app["XNATImaging"].updateTheImage(instanceId);
    }
}

/*
** Method to handle scrolling down the image stack
*/
gdo.net.app["XNATImaging"].navigateDown = function (instanceId) {
    if (gdo.net.instance[instanceId].stack.currentImageIndex > 0) {
        gdo.net.instance[instanceId].stack.currentImageIndex--;
        gdo.net.app["XNATImaging"].updateTheImage(instanceId);
    }
}

/*
** Resets to top of image stack
** TODO: May consider resetting image param values to defaults here as well
*/
gdo.net.app["XNATImaging"].resetView = function(instanceId) {
    gdo.net.instance[instanceId].stack.currentImageIndex = 0;
    gdo.net.app["XNATImaging"].updateTheImage(instanceId);
    gdo.net.app["XNATImaging"].pause(instanceId);
}

/*
** Method to handle pausing the stack playAll() function
*/
gdo.net.app["XNATImaging"].pause = function(instanceId) {
    clearInterval(gdo.net.instance[instanceId].interval);
    $('iframe').contents().find('#playButton').text("Play");
    gdo.net.instance[instanceId].playing = false;
}

/*
** TODO: Clean mess; make pausing work on client in sync
** TODO: Need to implement synchronization algorithm for coregistered MRI image stacks
** Method to handle stack play event
*/
gdo.net.app["XNATImaging"].playAll = function (instanceId) {
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
        gdo.net.app["XNATImaging"].pause(instanceId);
    }
    console.log("Playing: " + gdo.net.instance[instanceId].playing);
}

gdo.net.app["XNATImaging"].terminateClient = function () {
    gdo.consoleOut('.XNATImaging', 1, 'Terminating XNATImaging App Client at Node ' + clientId);
}

gdo.net.app["XNATImaging"].terminateControl = function () {
    gdo.consoleOut('.XNATImaging', 1, 'Terminating XNATImaging App Control at Instance ' + gdo.controlId);
}

$("#button").click(function (e) {
    params["orthogonal"] = true;
    params["fullScreen"] = false;
    //alert("Fire!");
    //papaya.Container.resetViewer(0, params);
    //papayaContainers[0].viewer.rotateViews();
    var volume = papayaContainers[0].viewer.screenVolumes[0].volume;
    console.log(volume);

    var viewer = papayaContainers[0].viewer;
    console.log(viewer);

    //viewer.windowLevelChanged(50, 50);

});