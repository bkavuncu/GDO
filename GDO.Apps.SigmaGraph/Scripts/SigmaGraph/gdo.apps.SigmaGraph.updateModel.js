/**
* Includes functions that update the model (data).
*/

/**
 * Saves the partial graph currently being rendered to the server
 * as a base64 encoded image.
 * TODO using this function will break the ability to run multiple instances of SigmaGraph on the GDO
 */
gdo.net.app["SigmaGraph"].savePartialGraphImageToServer = function () {
    const name = "R " + gdo.nodeRow + " C " + gdo.nodeCol + ".png";
    const image = gdo.graphContainer.getElementsByClassName("sigma-scene")[0].toDataURL();
    $.ajax({
        type: 'POST',
        url: '/Web/SigmaGraph/images',
        data: JSON.stringify({
            name: name,
            image: image
        }),
        contentType: 'application/json',
        dataType: 'json'
    });
}

/**
 * Updates the control graph view with the image specified by
 * imagePath and the location also specified by imagePath.
 * @param {} imagePath a path of the form /SigmaGraph/images/R (row) C (col).png
 *                     where (row) and (col) are integers representing the row
 *                     and column of the partial graph that the image represents
 */
gdo.net.app["SigmaGraph"].updateImagesToPlot = async function (imagePath) {
    const imagePathSplit = imagePath.split(" ");
    const row = parseInt(imagePathSplit[1]);
    const col = parseInt(imagePathSplit[3]);

    const sectionId = gdo.net.instance[gdo.controlId].sectionId;
    const rows = gdo.net.section[sectionId].rows;
    const cols = gdo.net.section[sectionId].cols;

    const initialX = col / cols * gdo.canvas.width;
    const initialY = row / rows * gdo.canvas.height;
    const initialWidth = 1 / cols * gdo.canvas.width;
    const initialHeight = 1 / rows * gdo.canvas.height;
    const name = "R" + row + "C" + col;

    const canvasImage = await httpGet(imagePath).then(createImage).then(image => {
        return new CanvasImage(initialX, initialY, initialWidth, initialHeight, image);
    });
    gdo.imagesToPlot.set(name, canvasImage);
    console.log('number of images: ', gdo.imagesToPlot.length);
}

/**
* Returns a promise that fullfulls with the file contents of the
* file pointed to be filePath.
* @param {any} filePath the location of the file
*/
function httpGet(filePath) {
    // TODO handle errors
    return new Promise(function (resolve, reject) {
        function infiniteRetry() {
            const xhr = new XMLHttpRequest();
            xhr.open("GET", filePath, true);
            xhr.onload = function () {
                if (this.status === 200) {
                    resolve(this.response);
                } else {
                    console.log('Error Getting File: ' + this.status);
                    setTimeout(infiniteRetry, 0);
                }
            };
            xhr.send();
        }
        infiniteRetry();
    });
}

/**
 * Returns a promise that fullfulls with an Image object representing
 * the base64Image string.
 * @param {any} base64Image
 */
function createImage(base64Image) {
    return new Promise(function(resolve, reject) {
        const image = new Image();
        image.onload = function() {
            resolve(this);
        };
        image.src = base64Image;
    });
}

/**
 * Represents an image in a canvas frame.
 */
class CanvasImage {
    constructor(initialX, initialY, initialWidth, initialHeight, image) {
        this.currentX = initialX;
        this.currentY = initialY;
        this.currentWidth = initialWidth;
        this.currentHeight = initialHeight;
        this.image = image;
    }
}