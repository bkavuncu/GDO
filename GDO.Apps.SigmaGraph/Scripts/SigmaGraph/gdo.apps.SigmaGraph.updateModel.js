/**
* Includes functions that update the model (data).
*/

/**
 * Saves the partial graph currently being rendered to the server
 * as a base64 encoded image.
 * TODO using this function will break the ability to run multiple instances of SigmaGraph on the GDO
 */
gdo.net.app["SigmaGraph"].savePartialGraphImageToServer = function () {
    const name = "R" + gdo.nodeRow + "C" + gdo.nodeCol + ".png";
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