gdo.net.app["XNATImaging"].getCurrentOrientation = function () {
    var papaya = gdo.net.app["XNATImaging"].papaya;
    var containers = gdo.net.app["XNATImaging"].papayaContainers;

    if (containers[0].viewer.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_AXIAL) {
        return "Axial";
    } else if (containers[0].viewer.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_CORONAL) {
        return "Coronal";
    } else if (containers[0].viewer.mainImage.sliceDirection === papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL) {
        return "Sagittal";
    }
}

gdo.net.app["XNATImaging"].getSliceDirection = function (orientation) {
    var papaya = gdo.net.app["XNATImaging"].papaya;
    var view = orientation.toLowerCase();

    switch (view) {
        case "axial":
            return papaya.viewer.ScreenSlice.DIRECTION_AXIAL;
        case "coronal":
            return papaya.viewer.ScreenSlice.DIRECTION_CORONAL;
        case "sagittal":
            return papaya.viewer.ScreenSlice.DIRECTION_SAGITTAL;
    }
}

gdo.net.app["XNATImaging"].lastSlice = function () {
    var viewer = gdo.net.app["XNATImaging"].papayaContainers[0].viewer;
    var orientation = gdo.net.app["XNATImaging"].getCurrentOrientation();
    var max;

    if (orientation == "Sagittal") {
        max = viewer.volume.header.imageDimensions.xDim;
    } else if (orientation == "Coronal") {
        max = viewer.volume.header.imageDimensions.yDim;
    } else if (orientation == "Axial") {
        max = viewer.volume.header.imageDimensions.zDim;
    }

    if (viewer.mainImage.currentSlice < max - 1) {
        return false;
    }
    return true;
}