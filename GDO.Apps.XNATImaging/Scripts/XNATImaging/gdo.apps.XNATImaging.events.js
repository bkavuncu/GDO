"use strict";

/*
** Sets mouse handlers for control Node
*/
gdo.net.app["XNATImaging"].setEventHandlers = function (instanceId, markingCoords) {

    gdo.consoleOut('.XNATImaging', 1, "Image stack finished loading");

    var papaya = gdo.net.app["XNATImaging"].papaya;
    var containers = gdo.net.app["XNATImaging"].papayaContainers;

    if (markingCoords != null) {
        console.log(markingCoords);
        console.log(containers[0].viewer);
        containers[0].viewer.markingCoords = markingCoords;
        containers[0].viewer.drawMarkers();
    }

    // orientation select menu change event
    $("iframe").contents().find("#viewSelect").on("selectmenuchange", function (event, ui) {
        var viewer = containers[0].viewer;
        var viewText = $("iframe").contents().find("#viewSelect option:selected").text();
        gdo.consoleOut(".XNATImaging", 1, "Switching to view: " + viewText);

        gdo.net.app["XNATImaging"].sendImageParams(instanceId);
        viewer.rotateToView(viewText);
        gdo.net.app["XNATImaging"].initializeSlider(); 
    });

    // color table select menu change event
    $("iframe").contents().find("#colorSelect").on("selectmenuchange", function (event, ui) {
        var viewer = containers[0].viewer;
        var colorText = $("iframe").contents().find("#colorSelect option:selected").text();
        gdo.consoleOut(".XNATImaging", 1, "Switching to color table: " + colorText);

        var volume = viewer.screenVolumes[0];
        volume.changeColorTable(viewer, colorText);

        gdo.net.app["XNATImaging"].sendImageParams(instanceId);

    });

    // mouse up event
    $("iframe").contents().find('#papayaContainer0').mouseup(function (e) {
        gdo.consoleOut(".XNATImaging", 1, "mouseup");

        gdo.net.app["XNATImaging"].updateSlider();
        gdo.net.app["XNATImaging"].sendImageParams(instanceId);
    });

    // touch end event
    $("iframe").contents().find('#papayaContainer0').on("touchend", function (e) {
        gdo.consoleOut(".XNATImaging", 1, "touchend");

        gdo.net.app["XNATImaging"].updateSlider();
        gdo.net.app["XNATImaging"].sendImageParams(instanceId);
    });

    // marker table hotlink navigation event
    $("iframe").contents().find("#markerTable").click(function () {
        gdo.net.app["XNATImaging"].updateSlider();
        gdo.net.app["XNATImaging"].sendImageParams(instanceId);
    });

    // Bind the range slider events
    $("iframe").contents().find('#slice-range').on("input", function (event) {
        var currentImageIndex = containers[0].viewer.mainImage.currentSlice;
        // Get the range input value
        var newImageIndex = parseInt(event.currentTarget.value, 10);

        // Switch images, if necessary
        if (newImageIndex !== currentImageIndex) {

            //gdo.consoleOut(".XNATImaging", 1, "Updating image using slider to " + newImageIndex);

            var viewer = containers[0].viewer;
            var mainImage = viewer.mainImage;

            if (mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
                viewer.currentCoord.z = newImageIndex;
            } else if (mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
                viewer.currentCoord.y = newImageIndex;
            } else if (mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
                viewer.currentCoord.x = newImageIndex;
            }

            gdo.net.app["XNATImaging"].sendImageParams(instanceId);
            viewer.gotoCoordinate(viewer.currentCoord);
        }
    });

    $("iframe").contents().find("#lesionsCheckBox").click(function () {
        if ($(this).prop("checked") == true) {
            if (containers[0].viewer.initialized) {
                papaya.Container.showImage(0, 1);
            }
        }
        else if ($(this).prop("checked") == false) {
            papaya.Container.hideImage(0, 1);
        }
    });

    gdo.net.app["XNATImaging"].initializeSlider();
}

gdo.net.app["XNATImaging"].updateSlider = function () {
    var slider = $("iframe").contents().find('#slice-range').get(0);
    var viewer = gdo.net.app["XNATImaging"].papayaContainers[0].viewer;

    slider.value = viewer.mainImage.currentSlice;
}

gdo.net.app["XNATImaging"].initializeSlider = function() {
    // Initialize slider input range
    //gdo.consoleOut(".XNATImaging", 3, "Initialized slider");

    var slider = $("iframe").contents().find('#slice-range').get(0);
    var containers = gdo.net.app["XNATImaging"].papayaContainers;
    var viewer = containers[0].viewer;

    // Set minimum and maximum value
    slider.min = 0;
    slider.step = 1;

    var max = 160;
    var currentOrientation = "";
    if (!viewer.initialized) {
        setTimeout(function () {  // setTimeout necessary in Chrome
            console.log(viewer);
            currentOrientation = gdo.net.app["XNATImaging"].getCurrentOrientation();
        }, 6000);
    }
    if (currentOrientation === "Axial") {
        max = viewer.volume.header.imageDimensions.zDim;
    } else if (currentOrientation === "Coronal") {
        max = viewer.volume.header.imageDimensions.yDim;
    } else if (currentOrientation === "Sagittal") {
        max = viewer.volume.header.imageDimensions.xDim;
    }
    slider.max = max;

    // Set current value
    slider.value = slider.max / 2;
    gdo.consoleOut(".XNATImaging", 1, "Initialised slider with range 0-" + slider.max + "(" + slider.value + ")");
    gdo.consoleOut(".XNATImaging", 1, "Initialised slider to current index " + slider.value);
}


/*
** Sets event handlers for buttons on Control node
*/
gdo.net.app["XNATImaging"].initButtons = function (instanceId) {
    var containers = gdo.net.app["XNATImaging"].papayaContainers;
    var appConfig = gdo.net.app["XNATImaging"].appConfig;

    $("iframe").contents().find("#resetButton")
    .unbind()
    .click(function () {
        gdo.net.app["XNATImaging"].resetView(instanceId);
    });

    $("iframe").contents().find("#playButton")
    .unbind()
    .click(function () {
        gdo.net.app["XNATImaging"].playAll(instanceId);
    });

    $("iframe").contents().find("#rectangleMarkerButton")
        .unbind()
        .click(function () {
            gdo.consoleOut('.XNATImaging', 1, "Mark button pressed");

            if (containers[0].viewer.isMarkingMode) {
                containers[0].viewer.isMarkingMode = false;
                gdo.consoleOut(".XNATImaging", 1, containers[0].viewer.isMarkingMode);
                $(this).val("Place markers disabled");
                $(this).removeClass('btn-success');
                $(this).addClass('btn-default');

                $("iframe").contents().find(".papaya-viewer canvas").css("cursor", "crosshair");
            } else {
                containers[0].viewer.isMarkingMode = true;
                gdo.consoleOut(".XNATImaging", 1, containers[0].viewer.isMarkingMode);
                $(this).val("Place markers enabled");
                $(this).removeClass('btn-default');
                $(this).addClass('btn-success');
                
                $("iframe").contents().find(".papaya-viewer canvas").css("cursor", "url(../../Scripts/XNATImaging/images/redmarker.png),copy");
            }
        });

    $("iframe").contents().find("#markerClearButton")
        .unbind()
        .click(function () {
            gdo.consoleOut('.XNATImaging', 1, "Clear all markers");
            containers[0].viewer.clearMarkers();

            gdo.net.app["XNATImaging"].sendImageParams();
        });

    // create patient select and switch Screen container
    gdo.net.app["XNATImaging"].fillSwitchScreenContainer(appConfig);

    // patient change event
    $("iframe").contents().find("#patientSelect").unbind().bind("selectmenuchange", function (event, ui) {
        var viewer = containers[0].viewer;
        var patientId = $("iframe").contents().find("#patientSelect option:selected").text();
        gdo.consoleOut(".XNATImaging", 1, "Switching to patient: " + patientId);

        gdo.net.app["XNATImaging"].server.setPatient(instanceId, patientId);
        containers[0].viewer.clearMarkers();
    });

    // switch Zoom Display event handler
    $("iframe").contents().find("#switchScreenContainer input.btn")
        .unbind()
        .click(function (event) {
            $("iframe").contents().find("#switchScreenContainer input.btn").removeClass("btn-success");
            $("iframe").contents().find("#switchScreenContainer input.btn").addClass("btn-primary");
            $(event.target).removeClass("btn-primary");
            $(event.target).addClass("btn-success");
            var index = event.target.id.substr(event.target.id.length - 1);
            var url = appConfig.mriUrlList[index].url;
            gdo.consoleOut(".XNATImaging", 1, url);
            var modality = event.target.value;

            gdo.net.app["XNATImaging"].server.requestScreenSwitch(instanceId, url, modality);

            appConfig.controlUrl = url;

            if (url.includes("baseline")) {
                gdo.net.app["XNATImaging"].lesionsOverlay = gdo.net.app["XNATImaging"].appConfig.overlayLesions[0];
            } else if (url.includes("followup")) {
                gdo.net.app["XNATImaging"].lesionsOverlay = gdo.net.app["XNATImaging"].appConfig.overlayLesions[1];
            }
            gdo.net.app["XNATImaging"].initializePapaya(instanceId, "control", url, containers[0].viewer.markingCoords);
        });
}


gdo.net.app["XNATImaging"].fillSwitchScreenContainer = function (appConfig) {

    // sort list by modality string
    appConfig.mriUrlList.sort(function (a, b) {
        if (a.modality < b.modality) return -1;
        if (a.modality > b.modality) return 1;
        return 0;
    });

    $("iframe").contents().find("#switchScreenContainer").empty();
    // create an input button for each entry in mriUrlList
    var rowCounter = 0;
    for (var i = 0; i < appConfig.mriUrlList.length; i++) {
        if (rowCounter % 2 === 0) {
            $("iframe").contents().find("#switchScreenContainer").append("<div class='row'>");
        }
        var buttonStyle = "btn-primary";
        if (appConfig.mriUrlList[i].url === appConfig.controlUrl) {
            buttonStyle = "btn-success";
        }
        $("iframe").contents().find("#switchScreenContainer").append("<input id='screen" + i + "' type='button' class='btn " + buttonStyle + "'/ value='" + appConfig.mriUrlList[i].modality + "'/>");

        if (rowCounter % 2 === 0) {
            $("iframe").contents().find("#switchScreenContainer").append("</div>");
        }
        rowCounter++;
    }
}


gdo.net.app["XNATImaging"].createPatientSwitchMenu = function (appConfig) {

    for (var i = 0; i < appConfig.patientsList.length; i++) {
        var optionString = "";
        if (appConfig.patientsList[i] === appConfig.patient) {
            optionString = "<option selected='selected'>" + appConfig.patient + "</option>";
        } else {
            optionString = "<option>" + appConfig.patientsList[i] + "</option>";
        }
        $("iframe").contents().find("#patientSelect").append(optionString);
    }

    $("iframe").contents().find("#patientSelect").selectmenu();
    gdo.net.app["XNATImaging"].selectPatientInitialized = true;
}


/*
** Method to handle stack play event
*/
gdo.net.app["XNATImaging"].playAll = function (instanceId) {
    var viewer = gdo.net.app["XNATImaging"].papayaContainers[0].viewer;

    if (gdo.net.app["XNATImaging"].playing === false) {
        gdo.net.app["XNATImaging"].playing = true;
        $('iframe').contents().find('#playButton').val("Pause");
        gdo.net.app["XNATImaging"].interval = setInterval(function () {
            if (gdo.net.app["XNATImaging"].playing && !gdo.net.app["XNATImaging"].lastSlice()) {
                gdo.net.app["XNATImaging"].incrementSlider(instanceId);

            } else {
                clearInterval(gdo.net.app["XNATImaging"].interval);
                gdo.net.app["XNATImaging"].playing = false;
                $('iframe').contents().find('#playButton').val("Play");
            }
        }, 200);

    } else {
        gdo.net.app["XNATImaging"].pause(instanceId);
    }
}

/*
** Increments slider by 1
*/
gdo.net.app["XNATImaging"].incrementSlider = function (instanceId) {
    var viewer = gdo.net.app["XNATImaging"].papayaContainers[0].viewer;

    var orientation = gdo.net.app["XNATImaging"].getCurrentOrientation();
    if (orientation === "Sagittal") {
        viewer.incrementSagittal(false, 1);
    } else if (orientation === "Coronal") {
        viewer.incrementCoronal(true, 1);
    } else if (orientation === "Axial") {
        viewer.incrementAxial(true, 1);
    }

    gdo.net.app["XNATImaging"].sendImageParams(instanceId);
    gdo.net.app["XNATImaging"].updateSlider();
}

/*
** Resets to top of image stack
** TODO: May consider resetting image param values to defaults here as well
*/
gdo.net.app["XNATImaging"].resetView = function (instanceId) {
    var papaya = gdo.net.app["XNATImaging"].papaya;
    var viewer = gdo.net.app["XNATImaging"].papayaContainers[0].viewer;

    var center = new papaya.core.Coordinate(Math.floor(viewer.volume.header.imageDimensions.xDim / 2),
                    Math.floor(viewer.volume.header.imageDimensions.yDim / 2),
                    Math.floor(viewer.volume.header.imageDimensions.zDim / 2));
    viewer.gotoCoordinate(center);
    gdo.net.app["XNATImaging"].pause(instanceId);
    gdo.net.app["XNATImaging"].updateSlider();
}

/*
** Method to handle pausing the stack playAll() function
*/
gdo.net.app["XNATImaging"].pause = function (instanceId) {
    clearInterval(gdo.net.app["XNATImaging"].interval);
    $('iframe').contents().find('#playButton').val("Play");
    gdo.net.app["XNATImaging"].playing = false;
    gdo.net.app["XNATImaging"].sendImageParams(instanceId);
}