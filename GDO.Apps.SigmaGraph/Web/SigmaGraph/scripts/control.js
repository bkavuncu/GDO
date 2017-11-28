/// <reference path="H:\GDO\GDO.Apps.SigmaGraph\Scripts/SigmaGraph/gdo.apps.SigmaGraph.js" />
/// <reference path="control.js" />
$(document).on('change', '.btn-file :file', function () {
    var input = $(this),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
    input.trigger('fileselect', [numFiles, label]);
});

$(document).ready(function () {
    $('.btn-file :file').on('fileselect', function (event, numFiles, label) {

        var input = $(this).parents('.input-group').find(':text'),
            log = numFiles > 1 ? numFiles + ' files selected' : label;

        if (input.length) {
            input.val(log);
        }
    });
});

$(window).ready(function () {
    const gdo = parent.gdo;

    // Setup canvas
    const canvas = document.getElementById("field_of_view");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    gdo.canvas = canvas;

    // Setup object to plot
    gdo.imagesToPlot = new Map();

    // Handle movement type
    let type;
    canvas.addEventListener("touchstart", handleType, false);
    function handleType(ev) {
        if (ev.touches.length === 1) {
            type = 'pan';
        } else if (ev.touches.length === 2) {
            type = 'zoom';
        }
    }

    // Handle panning
    let lastPanPos;
    let totalPanXShift;
    let totalPanYShift;
    canvas.addEventListener("touchstart", handleStartPan, false);
    canvas.addEventListener("touchmove", handleMovePan, false);
    canvas.addEventListener("touchend", handleEndPan, false);

    function handleStartPan(ev) {
        if (type === 'pan') {
            console.log('start pan');
            lastPanPos = getMousePos(canvas, ev.touches[0]);
            totalPanXShift = 0;
            totalPanYShift = 0;
        }
    }

    function handleMovePan(ev) {
        if (type === 'pan') {
            console.log('move pan');

            const currentPanPos = getMousePos(canvas, ev.touches[0]);
            gdo.imagesToPlot.forEach(function (image) {
                image.currentX += currentPanPos.x - lastPanPos.x;
                image.currentY += currentPanPos.y - lastPanPos.y;
            });

            totalPanXShift += currentPanPos.x - lastPanPos.x;
            totalPanYShift += currentPanPos.y - lastPanPos.y;
            lastPanPos = currentPanPos;
        }
    }

    function handleEndPan(ev) {
        if (type === 'pan') {
            console.log("end pan");
            gdo.net.app["SigmaGraph"].server.pan(gdo.controlId, totalPanXShift / canvas.width, totalPanYShift / canvas.height);
            type = 'none';
        }
    }

    // Handle zooming
    let originalZoomCenter;
    let originalZoomDistance;
    let lastZoomRatio;
    canvas.addEventListener("touchstart", handleStartZoom, false);
    canvas.addEventListener("touchmove", handleMoveZoom, false);
    canvas.addEventListener("touchend", handleEndZoom, false);

    function handleStartZoom(ev) {
        if (type === 'zoom') {
            console.log('start zoom');
            const originalZoomPoints = [getMousePos(canvas, ev.touches[0]), getMousePos(canvas, ev.touches[1])];
            originalZoomCenter = midpoint(originalZoomPoints);
            originalZoomDistance = distance(originalZoomPoints);
            lastZoomRatio = 1;
        }
    }

    function handleMoveZoom(ev) {
        if (type === 'zoom') {
            console.log('move zoom');
            // Calculate the zoom ratio
            const zoomPoints = [getMousePos(canvas, ev.touches[0]), getMousePos(canvas, ev.touches[1])];
            const zoomPointsDistance = distance(zoomPoints);
            const zoomRatioRelativeToStart = zoomPointsDistance / originalZoomDistance;
            const zoomRatioRelativeToLastMove = zoomRatioRelativeToStart / lastZoomRatio;
            const ratio = zoomRatioRelativeToLastMove;
            // Calculate the new position of image UL and LR
            gdo.imagesToPlot.forEach(function (image) {
                let currentXLowerRight = image.currentX + image.currentWidth;
                let currentYLowerRight = image.currentY + image.currentHeight;
                image.currentX = image.currentX * ratio + originalZoomCenter.x * (1 - ratio);
                image.currentY = image.currentY * ratio + originalZoomCenter.y * (1 - ratio);
                currentXLowerRight = currentXLowerRight * ratio + originalZoomCenter.x * (1 - ratio);
                currentYLowerRight = currentYLowerRight * ratio + originalZoomCenter.y * (1 - ratio);
                image.currentWidth = currentXLowerRight - image.currentX;
                image.currentHeight = currentYLowerRight - image.currentY;
            });

            // Update state
            lastZoomRatio = zoomRatioRelativeToStart;
        }
    }

    function handleEndZoom(ev) {
        if (type === 'zoom') {
            console.log('end zoom');
            gdo.net.app["SigmaGraph"].server.zoom(gdo.controlId,
                originalZoomCenter.x / canvas.width,
                originalZoomCenter.y / canvas.height,
                lastZoomRatio);
            type = 'none';
        }
    }

    // Helper functions
    function getMousePos(canvasDom, touchEvent) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: touchEvent.clientX - rect.left,
            y: touchEvent.clientY - rect.top
        };
    }

    function midpoint(points) {
        return {
            x: (points[0].x + points[1].x) / 2,
            y: (points[0].y + points[1].y) / 2
        };
    }

    function distance(points) {
        return Math.sqrt(
            Math.pow((points[0].x - points[1].x), 2) +
            Math.pow((points[0].y - points[1].y), 2));
    }

    function plotImages() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        gdo.imagesToPlot.forEach(function (canvasImage) {
            ctx.drawImage(canvasImage.image, canvasImage.currentX, canvasImage.currentY, canvasImage.currentWidth, canvasImage.currentHeight);
        });
    }

    (function animloop() {
        requestAnimationFrame(animloop);
        plotImages();
    })();
});

$(function () {
    var gdo = parent.gdo;
    document.getElementById("showGraph").onclick = function () {
        gdo.net.app["SigmaGraph"].server.showGraphInControlUI(gdo.controlId);
    }

    $("#image_digit_button").click(function () {
        var gdo = parent.gdo;
        gdo.net.app["SigmaGraph"].server.initiateProcessing(gdo.controlId, $("#graph_digit").val());
    });

    $("#graph_digit").keypress(function (e) {
        if (e.keyCode == 13) {
            $("#image_digit_button").click();
        }
    });

    // Trigger panning
    $("#up").click(function () {
        gdo.net.app["SigmaGraph"].server.triggerPanning(gdo.controlId, "up");
    });

    $("#left").click(function () {
        gdo.net.app["SigmaGraph"].server.triggerPanning(gdo.controlId, "left");
    });

    $("#down").click(function () {
        gdo.net.app["SigmaGraph"].server.triggerPanning(gdo.controlId, "down");
    });

    $("#right").click(function () {
        gdo.net.app["SigmaGraph"].server.triggerPanning(gdo.controlId, "right");
    });

    $("#zoomIn").click(function () {
        gdo.net.app["SigmaGraph"].server.triggerZoomIn(gdo.controlId);
    });

    $("#zoomOut").click(function () {
        gdo.net.app["SigmaGraph"].server.triggerZoomOut(gdo.controlId);
    });
    
    $("#showAll").click(function () {
        $("#attributes").empty();
        return new Promise((resolve, reject) => {
            gdo.net.app["SigmaGraph"].server.showAllAttributes(gdo.controlId)
                .done(function() {
                    console.log(gdo.net.app["SigmaGraph"].attributes);
                    var attributes = gdo.net.app["SigmaGraph"].attributes;
                    var attributesList = document.getElementById("attributes");
                    for (var i = 0; i < attributes.length; i++) {
                        var entry = new Option(attributes[i], i);
                        attributesList.options.add(entry);
                    }
                });
        });
    });


    // $("#attributes").change(function () {
    //     var key = $(this).val();
    //     var value = gdo.net.app["SigmaGraph"].attributes[key];
    //     gdo.net.app["SigmaGraph"].server.triggerFilter(gdo.controlId, value);
    // });

    $("#select_object").change(function () {
        $("#select_property").empty();
         
        var e = document.getElementById("select_object");
        var value = e.options[e.selectedIndex].value;


        return new Promise((resolve, reject) => {
            gdo.net.app["SigmaGraph"].server.setAllAttributes(gdo.controlId)
                .done(function () {
                    var attributes = [];
                    if (value == "edge") {
                        attributes = gdo.net.app["SigmaGraph"].edgeAttributes;
                    } else if (value == "node") {
                        attributes = gdo.net.app["SigmaGraph"].nodeAttributes;
                    }

                    var attributeList = document.getElementById("select_property");
                    for (var i = 0; i < attributes.length; i++) {
                        var entry = new Option(attributes[i], attributes[i]);
                        attributeList.options.add(entry);
                    }
            });
        });
        
    });

    $("#select_property").change(function () {
        
    });

    $("#select_visual_attribute").change(function () {
         
    })

    $("#red").click(function () {
        var type = $("#select_object").val();
        var property = $("#select_property").val();
        var visual = $("#select_visual_attribute").val();
        var funcText = $("#js_code").val();
        var color = $("select_colour").val();
        
        switch (visual) {
            case "isVisible":
                gdo.net.app["SigmaGraph"].server.triggerFilter(gdo.controlId, type, property, visual, funcText);
                break;
            case "colorByFunc":
                gdo.net.app["SigmaGraph"].server.triggerColorByFunc(gdo.controlId, type, property, funcText);
                break;
            case "colorByFilter":
                gdo.net.app["SigmaGraph"].server.triggerColorByFilter(gdo.controlId, type, property, funcText, color);
                break;
            default:
                break;
        }
    })

    gdo.net.app["SigmaGraph"].initControl();
});