/**
 * This worker parses graphml files into Javascript objects
 * and returns the objects to the main thread.
 */

const gdo = {};

self.onmessage = async function (e) {
    gdo.stopWatch = self.performance.now();
    const filePaths = e.data;
    const filesGraphObjects = await Promise.all(filePaths.map(function (filePath) {
        return httpGet(filePath).then((fileText) => {
            const graph = JSON.parse(fileText);
            return graph;
        });
    }));
    console.log('Time to download and parse...' + (self.performance.now() - gdo.stopWatch));

    gdo.stopWatch = self.performance.now();
    self.postMessage(filesGraphObjects);
    console.log('Time to post message...' + (self.performance.now() - gdo.stopWatch));
};

/**
* Returns a promise that fullfulls with the file contents of the
* file pointed to be filePath.
* @param {any} filePath the location of the file
*/
function httpGet(filePath) {
    // TODO handle errors
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", filePath, true);
        xhr.onload = function () {
            if (this.status === 200) {
                resolve(this.response);
            }
        };
        xhr.send();
    });
}
