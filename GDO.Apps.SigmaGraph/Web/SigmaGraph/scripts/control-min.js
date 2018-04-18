/// <reference path="H:\GDO\GDO.Apps.SigmaGraph\Scripts/SigmaGraph/gdo.apps.SigmaGraph.js" />
/// <reference path="control.js" />

              function post(path,json) {
                             $.post(path, json);
              }

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

            totalPanXShift += currentPanPos.x - lastPanPos.x;
            totalPanYShift += currentPanPos.y - lastPanPos.y;
            lastPanPos = currentPanPos;
        }
    }

    function handleEndPan(ev) {
        if (type === 'pan') {
            console.log("end pan");
			post('http://146.169.32.119/api/Script/RunMethod',
                { "Mod": "gdo.net.app.SigmaGraph.server", "Func": "pan", "Params": [0, totalPanXShift / canvas.width, totalPanYShift / canvas.height], "InstanceId" : 0 }
            );
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

            // Update state
            lastZoomRatio = zoomRatioRelativeToStart;
        }
    }

    function handleEndZoom(ev) {
        if (type === 'zoom') {
            console.log('end zoom');
			post('http://146.169.32.119/api/Script/RunMethod',
                { "Mod": "gdo.net.app.SigmaGraph.server", "Func": "zoom", "Params": [0, originalZoomCenter.x / canvas.width,originalZoomCenter.y / canvas.height, lastZoomRatio], "InstanceId" : 0 }
            );
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
    }

    (function animloop() {
        requestAnimationFrame(animloop);
        plotImages();
    })();
});