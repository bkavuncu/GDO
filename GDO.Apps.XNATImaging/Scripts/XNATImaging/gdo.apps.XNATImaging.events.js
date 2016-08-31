

/*
** Sets mouse handlers for control Node
*/
gdo.net.app["XNATImaging"].setMouseHandlers = function (instanceId) {

    gdo.consoleOut('.XNATImaging', 1, "Image stack finished loading");

    var papaya = gdo.net.app["XNATImaging"].papaya;
    var containers = gdo.net.app["XNATImaging"].papayaContainers;

    console.log(containers[0].viewer.initialized);
    gdo.net.app["XNATImaging"].initializeSlider();

    $("iframe").contents().find("#viewSelect").on("selectmenuchange", function (event, ui) {
        var viewer = containers[0].viewer;
        var viewText = $("iframe").contents().find("#viewSelect option:selected").text();
        console.log("Switching to: " + viewText);

        gdo.net.app["XNATImaging"].sendImageParam(instanceId);
        viewer.rotateToView(viewText);
        gdo.net.app["XNATImaging"].initializeSlider();
    });

    // mouse up event
    $("iframe").contents().find('#papayaContainer0').mouseup(function (e) {
        console.log("mouseup");

        gdo.net.app["XNATImaging"].initializeSlider();
        gdo.net.app["XNATImaging"].sendImageParam(instanceId);
    });

    // touch end event
    $("iframe").contents().find('#papayaContainer0').on("touchend", function (e) {
        console.log("touchend");

        gdo.net.app["XNATImaging"].initializeSlider();
        gdo.net.app["XNATImaging"].sendImageParam(instanceId);
    });

    // marker table hotlink navigation event
    $("iframe").contents().find("#markerTable").click(function () {
        gdo.net.app["XNATImaging"].initializeSlider();
        gdo.net.app["XNATImaging"].sendImageParam(instanceId);
    });

    // Bind the range slider events
    $("iframe").contents().find('#slice-range').on("input", function (event) {
        //gdo.consoleOut(".XNATImaging", 1, "slider input event");
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

            gdo.net.app["XNATImaging"].sendImageParam(instanceId);
            viewer.gotoCoordinate(viewer.currentCoord);
        }
    });
}


gdo.net.app["XNATImaging"].initializeSlider = function() {
    // Initialize slider input range
    gdo.consoleOut(".XNATImaging", 1, "Initialised slider");

    var slider = $("iframe").contents().find('#slice-range').get(0);
    var containers = gdo.net.app["XNATImaging"].papayaContainers;
    var viewer = containers[0].viewer;

    // Set minimum and maximum value
    slider.min = 0;
    slider.step = 1;

    var max = 255;
    var currentOrientation = "";
    if (viewer.initialized) {
        console.log(viewer);
        currentOrientation = gdo.net.app["XNATImaging"].getCurrentOrientation();
    }
    if (currentOrientation == "Axial") {
        max = viewer.volume.header.imageDimensions.zDim;
    } else if (currentOrientation == "Coronal") {
        max = viewer.volume.header.imageDimensions.yDim;
    } else if (currentOrientation == "Sagittal") {
        max = viewer.volume.header.imageDimensions.xDim;
    }

    slider.max = max;
    gdo.consoleOut(".XNATImaging", 1, "Initialised slider with range 0-" + slider.max);
    // Set current value
    if (viewer.initialized) {
        slider.value = viewer.mainImage.currentSlice;
    } else {
        slider.value = slider.max / 2;
    }
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

    $("iframe").contents().find("#rectangleMarkerButton")
        .unbind()
        .click(function () {
            gdo.consoleOut('.XNATImaging', 1, "Mark button pressed");

            if (containers[0].viewer.isMarkingMode) {
                containers[0].viewer.isMarkingMode = false;
                console.log(containers[0].viewer.isMarkingMode);
                $(this).val("Place markers disabled");
                $(this).removeClass('btn-success');
                $(this).addClass('btn-default');

                $("iframe").contents().find(".papaya-viewer canvas").css("cursor", "crosshair");
            } else {
                containers[0].viewer.isMarkingMode = true;
                console.log(containers[0].viewer.isMarkingMode);
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

            gdo.net.app["XNATImaging"].sendImageParam();
        });

    var rowCounter = 0;
    for (var i = 0; i < appConfig.mriUrlList.length; i++) {
        if (rowCounter % 2 == 0) {
            console.log("new row");
            $("iframe").contents().find("#switchScreenContainer").append("<div class='row'>");
        }
        var buttonStyle = "btn-primary";
        if (i == 0) {
            buttonStyle = "btn-success";
        }
        $("iframe").contents().find("#switchScreenContainer").append("<input id='screen" + i + "' type='button' class='btn " + buttonStyle + "'/ value='" + appConfig.mriUrlList[i].modality + "'/>");
        
        if (rowCounter % 2 == 0) {
            $("iframe").contents().find("#switchScreenContainer").append("</div>");
        }
        rowCounter++;
    }


    $("iframe").contents().find("#switchScreenContainer input.btn")
        .unbind()
        .click(function (event) {
            $("iframe").contents().find("#switchScreenContainer input.btn").removeClass("btn-success");
            $("iframe").contents().find("#switchScreenContainer input.btn").addClass("btn-primary");
            $(event.target).removeClass("btn-primary");
            $(event.target).addClass("btn-success");
            var index = event.target.id.substr(event.target.id.length - 1);
            var url = appConfig.mriUrlList[index].url;
            var modality = event.target.value;

            gdo.net.app["XNATImaging"].server.requestScreenSwitch(instanceId, url, modality);

            appConfig.controlUrl = url;
            gdo.net.app["XNATImaging"].initializePapaya(instanceId, "control", url);

    });



}