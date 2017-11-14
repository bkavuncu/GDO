var viewer;

window.onload = function () {
    viewer = OpenSeadragon({
        id: "graph",
        prefixUrl: "\\Scripts\\Control\\openseadragon\\images\\",
        tileSources: {
            type: "image",
            url: "\\Web\\SigmaGraph\\images\\06c774b45.jpg"
        }
    });
}
