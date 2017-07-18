/**
 * This worker parses graphml files into Javascript objects
 * and returns the objects to the main thread.
 */

const gdo = {};
importScripts("browserifiedParser.js");

self.onmessage = async function (e) {
    const filePaths = e.data;
    const filesGraphObjects = await Promise.all(filePaths.map(function (filePath) {
        return httpGet(filePath).then(parseGraphML);
    }));
    self.postMessage(filesGraphObjects);
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

/**
 * Returns a promise that fulfulls with a javascript object
 * representation of the contents of graphMLText.
 * @param {any} graphMLText the contents of a graphml file
 */
function parseGraphML(graphMLText) {
    return new Promise(function (resolve, reject) {
        const parser = new gdo.graphml.GraphMLParser();
        parser.parse(graphMLText, function (err, graph) {
            if (err !== null) return reject(err);
            resolve(graph);
        });
    });
}