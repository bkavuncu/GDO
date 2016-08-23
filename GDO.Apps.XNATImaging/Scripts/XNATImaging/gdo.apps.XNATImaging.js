"use strict";

$(function () {
    gdo.consoleOut('.XNATImaging', 1, 'Loaded XNATImaging JS');

    $.connection.xNATImagingAppHub.client.receiveControl = function (instanceId, controlName) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received Control : " + controlName);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received Control : " + controlName);
            gdo.net.app["XNATImaging"].clientControl(instanceId, controlName);
        }
    }

    $.connection.xNATImagingAppHub.client.receiveConfig = function (instanceId, json) {
        if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
            gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received Control config : ");
            gdo.consoleOut('.XNATImaging', 1, JSON.stringify(json));
            gdo.net.app["XNATImaging"].setupControl(instanceId, json);
        } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
            gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received screen config ");
            gdo.consoleOut('.XNATImaging', 1, JSON.stringify(json));
            gdo.net.app["XNATImaging"].setupClient(instanceId, json);
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
        function (instanceId, currentImageId, windowWidth, windowCenter, scale, translationX, translationY, view, currentCoord, markingCoords) {
            console.log(markingCoords);
            if (gdo.clientMode == gdo.CLIENT_MODE.CONTROL) {
                // ignore
                gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received ImageUpdate");
            } else if (gdo.clientMode == gdo.CLIENT_MODE.NODE) {
                gdo.consoleOut('.XNATImaging', 1, 'Instance - ' + instanceId + ": Received ImageUpdate");
                gdo.net.app["XNATImaging"].updateImageParams(instanceId, currentImageId, windowWidth, windowCenter, scale, translationX, translationY, view, currentCoord, markingCoords);
            }
        }
});

/*
** Entry point for Client nodes
*/
gdo.net.app["XNATImaging"].initClient = function (papaya, containers) {
    var instanceId = gdo.net.node[gdo.clientId].appInstanceId;
    gdo.loadScript('utility', 'XNATImaging', gdo.SCRIPT_TYPE.APP);

    gdo.net.app["XNATImaging"].papaya = papaya;
    gdo.net.app["XNATImaging"].papayaContainers = containers;
    gdo.net.instance[instanceId].playing = false;
    gdo.net.instance[instanceId].interval = null;

    console.log(gdo.net.app["XNATImaging"].instances[instanceId].config);

    gdo.consoleOut('.XNATImaging', 1, 'Initializing XNATImaging App Client at Node ' + gdo.clientId);

    console.log(containers[0].viewer.initialized);
    console.log(containers[0].viewer);
    gdo.net.app["XNATImaging"].server.requestConfig(instanceId, gdo.clientId);
}

gdo.net.app["XNATImaging"].setupClient = function (instanceId, appConfig) {
    var row = gdo.net.node[gdo.clientId].row;
    var col = gdo.net.node[gdo.clientId].col;
    //var url = appConfig.controlUrl;

    gdo.net.app["XNATImaging"].appConfig = appConfig;
    gdo.net.app["XNATImaging"].screenConfig = appConfig.screens.config;
    gdo.net.app["XNATImaging"].patientName = appConfig.patientName;

    var screenConfig = appConfig.screens.config;
    var mode = screenConfig.mode;

    if (mode == "mri") {
        gdo.net.app["XNATImaging"].initializePapaya(instanceId, mode, screenConfig.url, gdo.net.node[gdo.clientId].width, gdo.net.node[gdo.clientId].height);

    } else if (mode == "pdf") {
        gdo.net.app["XNATImaging"].setupPDF();

    } else if (mode == "zoom") {
        gdo.net.app["XNATImaging"].initializePapaya(instanceId, mode, screenConfig.url, gdo.net.node[gdo.clientId].width, gdo.net.node[gdo.clientId].height);

    } else if (mode == "text" || mode == "title" || mode == "subheading") {
        gdo.net.app["XNATImaging"].setupText(mode);
    }
}

/*
** Entry point for Control node
*/
gdo.net.app["XNATImaging"].initControl = function (instanceId, papaya, containers) {
    gdo.loadScript('utility', 'XNATImaging', gdo.SCRIPT_TYPE.APP);
    gdo.loadScript('events', 'XNATImaging', gdo.SCRIPT_TYPE.APP);

    gdo.net.app["XNATImaging"].papaya = papaya;
    gdo.net.app["XNATImaging"].papayaContainers = containers;

    $("iframe").contents().find("#viewSelect").selectmenu();

    gdo.net.instance[instanceId].playing = false;
    gdo.net.instance[instanceId].interval = null;
    gdo.net.instance[instanceId].stack = {
        currentImageIndex: 0,
        imageUrl: ""
    }

    gdo.net.app["XNATImaging"].server.requestConfig(instanceId, 0);
}

gdo.net.app["XNATImaging"].setupControl = function(instanceId, appConfig) {
    gdo.consoleOut('.XNATImaging', 1, 'Initializing XNATImaging App Control at Instance ' + instanceId);

    var mode = "control";
    var url = appConfig.controlUrl;
    gdo.net.app["XNATImaging"].appConfig = appConfig;
    gdo.net.app["XNATImaging"].patientName = appConfig.patientName;

    gdo.net.app["XNATImaging"].initializePapaya(instanceId, mode, url, 1000, 750);
    gdo.net.app["XNATImaging"].initButtons(instanceId);
}

gdo.net.app["XNATImaging"].initializePapaya = function (instanceId, mode, url, width, height) {

    var papaya = gdo.net.app["XNATImaging"].papaya;
    var containers = gdo.net.app["XNATImaging"].papayaContainers;
    var appConfig = gdo.net.app["XNATImaging"].appConfig;

    var baseUrl = appConfig.host + appConfig.mriUrl;
    //"http://dsigdotesting.doc.ic.ac.uk/Scripts/XNATImaging/Scans/";
    //"http://localhost:12332/Scripts/XNATImaging/Scans/";

    gdo.net.app["XNATImaging"].imageUrl = baseUrl + url;
    gdo.consoleOut(".XNATImaging", 1, mode);

    var params = [];
    var imageUrl = gdo.net.app["XNATImaging"].imageUrl;
    var imageName = "baseline_t1";

    params["images"] = [imageUrl];
    //params[imageName] = { min: 10, max: 1345 };
    params["worldSpace"] = false;
    params["radiological"] = false;
    params["padAllImages"] = true;
    params["smoothDisplay"] = false;
    params["mainView"] = appConfig.defaultOrientation;
    params["showControls"] = false;
    params["fullScreen"] = false;
    params["kioskMode"] = true;
        
    switch (mode) {
        case "control":
            // add handlers for mouse events once the image is loaded
            papaya.Container.allowPropagation = true;
            params["kioskMode"] = false;
            params["orthogonal"] = true;
            params["loadingComplete"] = gdo.net.app["XNATImaging"].setMouseHandlers(instanceId);
            break;
        case "zoom":
            params["fullScreen"] = true;
            params["orthogonalTall"] = false;
            params["smoothDisplay"] = true;
            params["zoom"] = true;
            params["zoomCanvasDim"] = appConfig.screens.config.zoomCanvasDim;
            params["loadingComplete"] = gdo.net.app["XNATImaging"].setupZoomCanvas();
            containers[0].preferences.showCrosshairs = "No";
        case "mri":
            params["orthogonal"] = appConfig.screens.config.orthogonal ? true : false;
            break;
        default:
            console.log("No accepted mode found in config");
    }

    console.log(params);
    papaya.Container.resetViewer(0, params);
        
    
}

/*
** Resize papaya for zoom canvas
*/
gdo.net.app["XNATImaging"].setupZoomCanvas = function () {

    var papaya = gdo.net.app["XNATImaging"].papaya;
    var containers = gdo.net.app["XNATImaging"].papayaContainers;
    var appConfig = gdo.net.app["XNATImaging"].appConfig;

    //papayaContainers[0].viewer.resizeViewer([4347, 3788]);
    var canvasWidth = appConfig.screens.config.zoomCanvasDim[0];
    var canvasHeight = appConfig.screens.config.zoomCanvasDim[1];
    var offsetX = appConfig.screens.config.zoomOffset[0];
    var offsetY = appConfig.screens.config.zoomOffset[1];
    var displayWidth = appConfig.screens.config.displaySize[0];
    var displayHeight = appConfig.screens.config.displaySize[1];

    if (appConfig.screens.config.orthogonal) {
        canvasHeight = canvasWidth / 1.5;
    }

    var dicomDiv = $("iframe").contents().find('#dicomImage');
    // resize container div to match child divs and canvas
    dicomDiv.width(canvasWidth).height(canvasHeight);

    var iframe = $("iframe")[0];
    console.log(iframe);
    console.log($(iframe));

    
    // if orthogonal height = width / 1.5
    // else height/width ~ 1

    setTimeout(function () {  // setTimeout necessary in Chrome
        iframe.contentWindow.scrollTo((canvasWidth / displayWidth) * offsetX, (canvasHeight / displayHeight) * offsetY);
    }, 2000);

    gdo.consoleOut(".XNATImaging", 1, "Width x Height of display: (" + gdo.net.node[gdo.clientId].width + " x " + gdo.net.node[gdo.clientId].height + ")");
    gdo.consoleOut(".XNATImaging", 1, "Canvas dimensions: (" + canvasWidth + " x " + canvasHeight + ")");
    gdo.consoleOut(".XNATImaging", 1, "Offset image by: (" + offsetX + ", " + offsetY + ")");
        //var scaleFactorX = canvasWidth / width;
        //var scaleFactorY = canvasHeight / height;
        

        /*var viewport = cornerstone.getViewport(element);
        viewport.translation.x += (-offsetX * width)/viewport.scale;
        viewport.translation.y += (-offsetY * height)/viewport.scale;
        cornerstone.setViewport(element, viewport);
        gdo.consoleOut(".XNATImaging", 1, "Scale of image: (" + viewport.scale + ")");*/

        /*var canvas = containers[0].viewer.canvas;
        var ctx = canvas.getContext('2d');
        ctx.transform(6, 0, 0, 8, -offsetX * width, -height * 10);

        // var ctx = img.getCanvas().getContext('2d');
        // ctx.drawImage(img, offsetX, offsetY, width/3, height/3, 0, 0, width, height);*/
}

gdo.net.app["XNATImaging"].sendImageParam = function (instanceId) {
    var containers = gdo.net.app["XNATImaging"].papayaContainers;
    var viewer = containers[0].viewer;
    var volume = viewer.screenVolumes[0];
    var diffX = 0;
    var diffY = 0;
    var diffScale = 0;
    var viewText = $("iframe").contents().find("#viewSelect option:selected").text();

    gdo.net.app["XNATImaging"].server.setImageConfig(instanceId,
        viewer.mainImage.currentSlice,
        volume.screenMin,
        volume.screenMax,
        diffScale,
        diffX,
        diffY,
        viewText,
        viewer.currentCoord,
        viewer.markingCoords);
    gdo.consoleOut(".XNATImaging", 1, "Set New Image Config");
}

/*
** Update image parameters using data received from server
*/
gdo.net.app["XNATImaging"].updateImageParams = function (
                                            instanceId, currentImageId, windowWidth, windowCenter,
                                            scale, translationX, translationY, view, currentCoord, markingCoords) {
    
    var viewer = gdo.net.app["XNATImaging"].papayaContainers[0].viewer;
    var volume = viewer.screenVolumes[0];
    console.log(volume);

    if (volume.screenMin )
    console.log(volume.screenMin, volume.screenMax);
    volume.setScreenRange(windowWidth, windowCenter);

    viewer.markingCoords = markingCoords;
    viewer.drawMarkers();

    console.log(currentCoord);
    console.log(viewer.currentCoord);

    // TODO: test conditional
    //if (viewer.currentCoord.x != currentCoord.x || viewer.currentCoord.y != currentCoord.y || viewer.currentCoord.z != currentCoord.z {
    console.log(currentCoord);
    viewer.gotoCoordinate(currentCoord);
    //}

    if (gdo.net.app["XNATImaging"].getSliceDirection(view) != viewer.mainImage.sliceDirection) {
        viewer.rotateToView(view);
    }

}


gdo.net.app["XNATImaging"].setupText = function (mode) {
    var screenConfig = gdo.net.app["XNATImaging"].appConfig.screens.config;

    $("iframe").contents().find("#main").empty();
    $("iframe").contents().find("#main").append("<div class='heading'>");
    if (mode == "title") {
        $("iframe").contents().find(".heading").append("<h1>" + screenConfig.text + "</h1>");
    } else if (mode == "subheading") {
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

    var appConfig = gdo.net.app["XNATImaging"].appConfig;
    var screenConfig = appConfig.screens.config;

    $("iframe").contents().find("#main")
    .html(
        "<object data='" + appConfig.pdfUrl + appConfig.patientName + "/" + appConfig.patientName + screenConfig.url + "#zoom=" + screenConfig.zoomFactor + "&amp;#toolbar=0' type='application/pdf' width='100%' height='1080px'>" +
        "<embed src='" + appConfig.pdfUrl + appConfig.patientName + "/" + appConfig.patientName + screenConfig.url + "#zoom=" + screenConfig.zoomFactor + "&amp;#toolbar=0' type='application/pdf' />" +
        "</object>"
    );
}

/*
** Initialise Client nodes on Zoom section of app
*/
gdo.net.app["XNATImaging"].initZoom = function (instanceId, json) {
    //$("iframe").contents().find(".papaya").empty();
    //$("iframe").contents().find('#main').append("<button id='testButton' type='button'>MoveIt</button>");
    /*$("iframe").contents().find("#main").append(
        "<div id='dicomImage' style='width: 1920px; height: 1080px;'>" + 
            "<div class='papaya' data-params='params'>" + 
            "</div>" + 
        "</div>"
    );*/

    gdo.net.instance[instanceId].zoomView = {
        zoomId: json.id,
        url: json.url,
        topLeft: json.topLeft,
        bottomRight: json.topRight,
        zoomFactor: json.zoomFactor
    }

    gdo.net.app["XNATImaging"].initializePapaya(instanceId, "zoom", json.url, gdo.net.node[gdo.clientId].width, gdo.net.node[gdo.clientId].height);
}


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
** Method to handle scrolling up the image stack
*/
gdo.net.app["XNATImaging"].navigateUp = function (instanceId) {

}

/*
** Method to handle scrolling down the image stack
*/
gdo.net.app["XNATImaging"].navigateDown = function (instanceId) {

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
    /*if (gdo.net.instance[instanceId].playing == false && gdo.net.instance[instanceId].stack.currentImageIndex < gdo.net.instance[instanceId].stack.imageIds.length - 1) {
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
    console.log("Playing: " + gdo.net.instance[instanceId].playing);*/
}

gdo.net.app["XNATImaging"].terminateClient = function () {
    gdo.consoleOut('.XNATImaging', 1, 'Terminating XNATImaging App Client at Node ' + clientId);
}

gdo.net.app["XNATImaging"].terminateControl = function () {
    gdo.consoleOut('.XNATImaging', 1, 'Terminating XNATImaging App Control at Instance ' + gdo.controlId);
}