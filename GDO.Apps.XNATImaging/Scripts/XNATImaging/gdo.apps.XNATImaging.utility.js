gdo.net.app["XNATImaging"].getCurrentOrientation = function () {
    var papaya = gdo.net.app["XNATImaging"].papaya;
    var containers = gdo.net.app["XNATImaging"].papayaContainers;

    console.log(containers[0].viewer);
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