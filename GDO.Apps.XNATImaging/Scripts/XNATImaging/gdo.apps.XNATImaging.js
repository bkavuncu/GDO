"use strict";

$(function () {
    gdo.consoleOut('.XNATImaging', 1, 'Loaded XNATImaging JS');

    $.connection.xNATImagingAppHub.client.receiveConfig = function (instanceId, json) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received control config : ");
            gdo.consoleOut('.XNATImaging', 1, JSON.stringify(json));
            gdo.net.app["XNATImaging"].setupControl(instanceId, json);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received screen config ");
            gdo.consoleOut('.XNATImaging', 1, JSON.stringify(json));
            gdo.net.app["XNATImaging"].setupClient(instanceId, json);
        }
    }

    $.connection.xNATImagingAppHub.client.receiveScreenSwitch = function (instanceId) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received screen switch : ");
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received screen switch ");
            
            if (gdo.net.app["XNATImaging"].screenConfig != null) {
                if (gdo.net.app["XNATImaging"].screenConfig.switchable) {
                    gdo.consoleOut(".XNATImaging", 1, "Requesting new config");
                    gdo.net.app["XNATImaging"].server.requestConfig(instanceId, gdo.clientId);
                }
            }
        }
    }

    $.connection.xNATImagingAppHub.client.receivePatientChange = function (instanceId) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received patient switch request ");
            gdo.net.app["XNATImaging"].server.requestConfig(instanceId, 0);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received patient switch request ");
            gdo.net.app["XNATImaging"].server.requestConfig(instanceId, gdo.clientId);
        }
    }

    /* 
    ** SignalR receive method to update image parameters based on control input
    **  Update image parameters:
    **  instanceId      int
    **  screenMin       dbl
    **  screenMax       dbl
    **  orientation     str
    **  currentCoord    obj
    **  markingCoords   obj
    **  colorTable      str
    */
    $.connection.xNATImagingAppHub.client.receiveImageUpdate =
        function (instanceId, windowWidth, windowCenter, orientation, currentCoord, markingCoords, colorTable) {
            if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
                // ignore
                gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received ImageUpdate");
            } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
                gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received ImageUpdate");
                if (gdo.net.app["XNATImaging"].screenConfig.mode == "zoom" || gdo.net.app["XNATImaging"].screenConfig.mode == "mri") {
                    gdo.net.app["XNATImaging"].updateImageParams(instanceId, windowWidth, windowCenter, orientation, currentCoord, markingCoords, colorTable);
                }
            }
        }
});


/*
** Entry point for Control node
*/
gdo.net.app["XNATImaging"].initControl = function (instanceId, papaya, containers) {
    gdo.loadScript('utility', 'XNATImaging', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('events', 'XNATImaging', gdo.SCRIPT_TYPE.APP);

    gdo.net.app["XNATImaging"].papaya = papaya;
    gdo.net.app["XNATImaging"].papayaContainers = containers;
    gdo.net.app["XNATImaging"].playing = false;
    gdo.net.app["XNATImaging"].interval = null;

    $("iframe").contents().find("#viewSelect").selectmenu();
    $("iframe").contents().find("#colorSelect").selectmenu();

    gdo.net.app["XNATImaging"].server.requestConfig(instanceId, 0);
}

gdo.net.app["XNATImaging"].setupControl = function (instanceId, appConfig) {
    gdo.consoleOut('.XNATImaging', 1, 'Initializing XNATImaging App Control at Instance ' + instanceId);

    var mode = "control";
    var url = appConfig.controlUrl;
    gdo.net.app["XNATImaging"].appConfig = appConfig;
    gdo.net.app["XNATImaging"].patientName = appConfig.patient;

    gdo.net.app["XNATImaging"].lesionsOverlay = appConfig.overlayLesions[0];

    gdo.consoleOut(".XNATImaging", 1, "Received app config: \n" + appConfig);

    gdo.net.app["XNATImaging"].initializePapaya(instanceId, mode, url);
    gdo.net.app["XNATImaging"].initButtons(instanceId);

    if (!gdo.net.app["XNATImaging"].selectPatientInitialized) {
        gdo.net.app["XNATImaging"].createPatientSwitchMenu(appConfig);
    }
}

/*
** Entry point for Client nodes
*/
gdo.net.app["XNATImaging"].initClient = function (papaya, containers, pdfjs) {
    var instanceId = gdo.net.node[gdo.clientId].appInstanceId;
    gdo.loadScript('utility', 'XNATImaging', gdo.SCRIPT_TYPE.APP);

    gdo.net.app["XNATImaging"].papaya = papaya;
    gdo.net.app["XNATImaging"].papayaContainers = containers;
    gdo.net.app["XNATImaging"].pdfjs = pdfjs;

    gdo.consoleOut('.XNATImaging', 1, 'Initializing XNATImaging App Client at Node ' + gdo.clientId);

    gdo.net.app["XNATImaging"].server.requestConfig(instanceId, gdo.clientId);
}


gdo.net.app["XNATImaging"].setupClient = function (instanceId, appConfig) {

    gdo.net.app["XNATImaging"].appConfig = appConfig;
    gdo.net.app["XNATImaging"].screenConfig = appConfig.screens.config;
    gdo.net.app["XNATImaging"].patientName = appConfig.patient;

    var screenConfig = gdo.net.app["XNATImaging"].screenConfig;
    var mode;

    if (appConfig != null && screenConfig != null) {
        mode = screenConfig.mode;
    } else {
        mode = "";
    }

    if (mode === "mri") {
        gdo.net.app["XNATImaging"].initializePapaya(instanceId, mode, screenConfig.url);

    } else if (mode === "pdf") {
        gdo.net.app["XNATImaging"].setupPDF();

    } else if (mode === "zoom") {
        gdo.net.app["XNATImaging"].initializePapaya(instanceId, mode, screenConfig.url);

    } else if (mode === "title" || mode === "topText" || mode === "subText") {
        gdo.net.app["XNATImaging"].setupText(mode);
    } else {
        $("iframe").contents().find("#main").empty();
    }
}


/*
** Initialise Client nodes in display text modes
*/
gdo.net.app["XNATImaging"].setupText = function (mode) {
    var screenConfig = gdo.net.app["XNATImaging"].appConfig.screens.config;

    $("iframe").contents().find("#main").empty();
    $("iframe").contents().find("#main").append("<div class='heading'>");
    if (mode === "title") {
        $("iframe").contents().find(".heading").append("<h1>" + screenConfig.text + "</h1>");
        if (gdo.net.node[gdo.clientId].col === 0) {
            $("iframe").contents().find(".heading").append("<h2>Patient ID: " + gdo.net.app["XNATImaging"].patientName + "</h2>");
        } else if (screenConfig.subText != null) {
            $("iframe").contents().find(".heading").append("<h2>" + screenConfig.subText + "</h2>");
        }
    } else if (mode === "topText") {
        $("iframe").contents().find(".heading").append("<h2>" + screenConfig.text + "</h2>");
    } else {
        $("iframe").contents().find(".heading").append("<h3>" + screenConfig.text.toUpperCase() + "</h3>");
    }
    $("iframe").contents().find("#main").append("</div>");
}


/*
** Initialise Client nodes on PDF section of app
*/
gdo.net.app["XNATImaging"].setupPDF = function () {

    $("iframe").contents().find("#main").empty();

    var PDFJS = gdo.net.app["XNATImaging"].pdfjs;
    var appConfig = gdo.net.app["XNATImaging"].appConfig;
    var screenConfig = appConfig.screens.config;

    $("iframe").contents().find("#main").append("<canvas id='pdf-canvas'/>");

    PDFJS.workerSrc = '../../Scripts/XNATImaging/pdf.worker.js';
    var url = "";
    if (appConfig.host === "https://central.xnat.org/") {
        url = appConfig.host + appConfig.mriUrl + appConfig.patient + "/files/" + screenConfig.url;
    } else {
        url = appConfig.pdfUrl + appConfig.patient + "/" + screenConfig.url;
    }

    // Fetch the PDF document from the URL using promises.
    PDFJS.getDocument(url).then(function (pdf) {
        // Fetch the page.
        pdf.getPage(1).then(function (page) {
            var scale = screenConfig.scale;
            var viewport = page.getViewport(scale);
            gdo.consoleOut(".XNATImaging", 1, viewport);

            // Prepare canvas using PDF page dimensions.
            var canvas = $("iframe").contents().find('#pdf-canvas')[0];
            var context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            var widthDifference = gdo.net.node[gdo.clientId].width * screenConfig.displaySize[0] - viewport.width;
            if (widthDifference > 0) {
                $("iframe").contents().find('#pdf-canvas').css("margin-left", widthDifference / 2 + "px");
            }

            var heightDifference = gdo.net.node[gdo.clientId].height * screenConfig.displaySize[1] - viewport.height;
            gdo.consoleOut(".XNATImaging", 1, "Height difference: " + heightDifference);
            if (heightDifference > 0) {
                $("iframe").contents().find('#pdf-canvas').css("margin-bottom", heightDifference + "px");
            }

            $("iframe").contents().find('#pdf-canvas').css("margin-top", "30px");

            // Render PDF page into canvas context.
            var renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            page.render(renderContext).then(function () {
                $("iframe").get(0).contentWindow.scrollTo(gdo.net.node[gdo.clientId].width * screenConfig.zoomOffset[0], gdo.net.node[gdo.clientId].height * screenConfig.zoomOffset[1])
            });
        });
    });
}

/*
** Initialises Papaya Nifti and Dicom viewer and sets its parameters
*/
gdo.net.app["XNATImaging"].initializePapaya = function (instanceId, mode, url, markingCoords) {

    var papaya = gdo.net.app["XNATImaging"].papaya;
    var appConfig = gdo.net.app["XNATImaging"].appConfig;
    var screenConfig = appConfig.screens.config;

    // Fix for empty screens being used for displaying Papaya after a configuration change
    if ($("iframe").contents().find("#dicomImage")[0] == null) {
        $("iframe").contents().find("#main").append("<div id='dicomImage'><div class='papaya' data-params='params'></div>");
    }
    var baseUrl = appConfig.host;
    if (baseUrl === "https://central.xnat.org/") {
        baseUrl += appConfig.mriUrl + appConfig.patient + "/files/";
    } else {
        baseUrl += appConfig.mriUrl + appConfig.patient + "/";
    }
    
    //appConfig.host + appConfig.mriUrl + appConfig.experimentName + "/";
    //"http://dsigdotesting.doc.ic.ac.uk/Scripts/XNATImaging/Scans/";
    //"http://localhost:12332/Scripts/XNATImaging/Scans/";

    gdo.net.app["XNATImaging"].imageUrl = baseUrl + url;
    gdo.consoleOut(".XNATImaging", 1, mode);

    var params = [];
    var imageUrl = gdo.net.app["XNATImaging"].imageUrl;
    var imageName = url;
    var imageIds = [imageUrl];
    params["luts"] = [
            { "name": "GMBlue", "data": [[0, 0.21, 0.34, 0.4], [1, 0.21, 0.34, 0.4]] },
            { "name": "Red", "data": [[0, 1, 0, 0], [1, 1, 0, 0]] }
    ];

    //overlays and colour contrasts
    if (gdo.clientMode == gdo.CLIENT_MODE.NODE && mode === "zoom") {
        if (screenConfig != undefined && screenConfig.overlays != undefined && screenConfig.overlays.length > 0) {
            for (var i = 0; i < screenConfig.overlays.length; i++) {
                imageIds.push(baseUrl + screenConfig.overlays[i]);

                if (screenConfig.overlays[i] == "gm_baseline.nii.gz" || screenConfig.overlays[i] === "gm_followup.nii.gz") {
                    params[screenConfig.overlays[i]] = { "alpha": 0.9, "lut": "GMBlue" };
                } else if (screenConfig.overlays[i] === "labeled_lesions_baseline.nii.gz" || screenConfig.overlays[i] === "labeled_lesions_followup.nii.gz") {
                    params[screenConfig.overlays[i]] = { "alpha": 0.8, "lut": "Red" };
                } else {
                    params[screenConfig.overlays[i]] = { "alpha": 0.8, "lut": "Grayscale" };
                }
            }
        }
    }

    if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL && gdo.net.app["XNATImaging"].lesionsOverlay != null) {
        gdo.consoleOut(".XNATImaging", 1, gdo.net.app["XNATImaging"].lesionsOverlay);
        imageIds.push(baseUrl + gdo.net.app["XNATImaging"].lesionsOverlay);
        params[gdo.net.app["XNATImaging"].lesionsOverlay] = { "alpha": 0.8, "lut": "Red" };
        $("iframe").contents().find("#lesionsCheckBox").prop('checked', true);
    }

    params["worldSpace"] = appConfig.worldSpace;
    params["smoothDisplay"] = true;
    params["images"] = imageIds;
    params["mainView"] = appConfig.defaultOrientation;
    params["radiological"] = false;
    params["showControls"] = false;
    params["fullScreen"] = false;
    params["kioskMode"] = true;

    switch (mode) {
        case "control":
            // add handlers for mouse events once the image is loaded
            papaya.Container.allowPropagation = true;
            params["kioskMode"] = true;
            params["orthogonal"] = true;
            params["loadingComplete"] = gdo.net.app["XNATImaging"].setEventHandlers(instanceId, markingCoords);
            break;

        case "zoom":
            params["fullScreen"] = true;
            params["orthogonalTall"] = false;
            params["zoom"] = true;

            var canvasWidth = gdo.net.node[gdo.clientId].width * appConfig.screens.config.displaySize[0];
            var canvasHeight = gdo.net.node[gdo.clientId].height * appConfig.screens.config.displaySize[1];
            params["zoomCanvasDim"] = [canvasWidth, canvasHeight];
            params["loadingComplete"] = gdo.net.app["XNATImaging"].setupZoomCanvas(canvasWidth, canvasHeight);

        case "mri":
            params["orthogonal"] = appConfig.screens.config.orthogonal ? true : false;

            var dicomDiv = $("iframe").contents().find('#dicomImage');

            if (screenConfig.color != null) {
                dicomDiv.css("border", "5px solid " + screenConfig.color);
            }
            break;
        default:
            gdo.consoleOut(".XNATImaging", 1, "No accepted mode found in config");
    }
    gdo.consoleOut(".XNATImaging", 1, params);
    papaya.Container.resetViewer(0, params);
}


/*
** Resize papaya for zoom canvas
*/
gdo.net.app["XNATImaging"].setupZoomCanvas = function (canvasWidth, canvasHeight) {

    var containers = gdo.net.app["XNATImaging"].papayaContainers;
    var screenConfig = gdo.net.app["XNATImaging"].appConfig.screens.config;

    containers[0].preferences.showCrosshairs = "No";

    var offsetX = screenConfig.zoomOffset[0];
    var offsetY = screenConfig.zoomOffset[1];
    var displayWidth = screenConfig.displaySize[0];
    var displayHeight = screenConfig.displaySize[1];

    // if orthogonal height = width / 1.5
    // else height/width ~ 1
    if (screenConfig.orthogonal) {
        canvasHeight = canvasWidth / 1.5;
    }

    var heightDifference = 0;
    if (gdo.net.node[gdo.clientId].height * displayHeight > canvasHeight) {
        heightDifference = gdo.net.node[gdo.clientId].height * displayHeight - canvasHeight;
        console.log(heightDifference);
        $("iframe").contents().find("#dicomImage").css("margin-bottom", heightDifference + "px");
    }

    var widthDifference = 0;
    if (gdo.net.node[gdo.clientId].width * displayWidth > canvasWidth) {
        widthDifference = gdo.net.node[gdo.clientId].width * displayWidth - canvasWidth;
        console.log(widthDifference);
        $("iframe").contents().find("#dicomImage").css("margin-right", widthDifference + "px");
    }

    // resize container div to match child divs and canvas
    var dicomDiv = $("iframe").contents().find('#dicomImage');
    dicomDiv.width(canvasWidth + widthDifference).height(canvasHeight + heightDifference);

    if (screenConfig.modality != null) {
        if ($("iframe").contents().find('.heading h1').length) {
            $("iframe").contents().find('.heading h1').text(screenConfig.modality);
        } else {
            $("iframe").contents().find('#main').append(
                "<div class='heading' style='position: absolute; width: 200%; height: 50%; top: 150px; left: 180px; z-index: 2'>" +
                "<h1 style='font-size: 180px; color: white'>" + screenConfig.modality + "</h1>" +
                "</div>"
            );
        }
    }

    var iframe = $("iframe")[0];
    setTimeout(function () {  // setTimeout necessary in Chrome
        iframe.contentWindow.scrollTo(gdo.net.node[gdo.clientId].width * offsetX, gdo.net.node[gdo.clientId].height * offsetY);
    }, 2000);

    gdo.consoleOut(".XNATImaging", 1, "Width x Height of display: (" + gdo.net.node[gdo.clientId].width + " x " + gdo.net.node[gdo.clientId].height + ")");
    gdo.consoleOut(".XNATImaging", 1, "Canvas dimensions: (" + canvasWidth + " x " + canvasHeight + ")");
    gdo.consoleOut(".XNATImaging", 1, "Offset image by: (" + offsetX + ", " + offsetY + ")");
}


/*
** Broadcasts updated image parameters to all client nodes
*/
gdo.net.app["XNATImaging"].sendImageParams = function (instanceId) {
    var containers = gdo.net.app["XNATImaging"].papayaContainers;
    var viewer = containers[0].viewer;
    var volume = viewer.screenVolumes[0];
    var viewText = $("iframe").contents().find("#viewSelect option:selected").text();
    var colorTable = $("iframe").contents().find("#colorSelect option:selected").text();

    gdo.net.app["XNATImaging"].server.setImageConfig(instanceId,
        volume.screenMin,
        volume.screenMax,
        viewText,
        viewer.currentCoord,
        viewer.markingCoords,
        colorTable);
    gdo.consoleOut(".XNATImaging", 1, "Set New Image Config");
}


/*
** Update image parameters using data received from server
*/
gdo.net.app["XNATImaging"].updateImageParams = function (instanceId, screenMin, screenMax, view, currentCoord, markingCoords, colorTable) {

    var screenConfig = gdo.net.app["XNATImaging"].screenConfig;
    var viewer = gdo.net.app["XNATImaging"].papayaContainers[0].viewer;
    var volume = viewer.screenVolumes[0];
    console.log(volume);

    if (screenConfig != null && screenConfig.imageData.screenMax != 0) {
        console.log(screenConfig.imageData);
        volume.setScreenRange(0, screenConfig.imageData.screenMax);
    }
    else if (volume.screenMin != screenMin || volume.screenMax != screenMax) {
        console.log(volume.screenMin, volume.screenMax);
        volume.setScreenRange(screenMin, screenMax);
    }

    viewer.markingCoords = markingCoords;
    viewer.drawMarkers();

    console.log(currentCoord);
    console.log(viewer.currentCoord);

    // TODO: test conditional
    //if (viewer.currentCoord.x != currentCoord.x || viewer.currentCoord.y != currentCoord.y || viewer.currentCoord.z != currentCoord.z {
    viewer.gotoCoordinate(currentCoord);
    //}

    if (gdo.net.app["XNATImaging"].getSliceDirection(view) != viewer.mainImage.sliceDirection) {
        viewer.rotateToView(view);
    }

    if (colorTable != null && screenConfig.mode == "mri" || (screenConfig.mode == "zoom" && screenConfig.switchable == true)) {
        volume.changeColorTable(viewer, colorTable);
    }
}


gdo.net.app["XNATImaging"].terminateClient = function () {
    gdo.consoleOut('.XNATImaging', 1, 'Terminating XNATImaging App Client at Node ' + clientId);
}


gdo.net.app["XNATImaging"].terminateControl = function () {
    gdo.consoleOut('.XNATImaging', 1, 'Terminating XNATImaging App Control at Instance ' + gdo.controlId);
}