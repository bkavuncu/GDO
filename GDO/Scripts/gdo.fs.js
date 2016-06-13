function initFS(mb) {
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    window.webkitStorageInfo.requestQuota(PERSISTENT, 1024 * 1024 * mb, function (grantedBytes) {
        window.requestFileSystem(PERSISTENT, grantedBytes, onInitFS, function (err) { gdo.consoleOut("FS", "ERROR", err) });
    }, function(err){gdo.consoleOut("FS","ERROR",err)});
}

function onInitFS(filesystem) {
    gdo.consoleOut("FS","INFO","Opened file system: " + filesystem.name);
    fs = filesystem;
}

function saveFile(path, name, data) {
    fs.root.getFile(path + name, { create: true }, function (fileEntry) {
        fileEntry.createWriter(function (fileWriter) {
            fileWriter.seek(fileWriter.length); 
            fileWriter.write(data);
        }, errorHandler);
    }, errorHandler);
}

function createFile(path, name) {
    createDir(fs.root, path);
    fs.root.getFile(path+name, { create: true, exclusive: true }, function (fileEntry) {
    }, errorHandler);
}

function removeFile(path, name) {
    fs.root.getFile(path + name, { create: false }, function (fileEntry) {
        fileEntry.remove(function () {
            gdo.consoleOut("FS", "INFO", "File removed:" + name);
        }, errorHandler);
    }, errorHandler);
}

function appendToFile(path, name, data) {
    fs.root.getFile(path+name, {create: false}, function(fileEntry) {
        fileEntry.createWriter(function(fileWriter) {
            fileWriter.seek(fileWriter.length); 
            fileWriter.write(data);
        }, errorHandler);
    }, errorHandler);
}

function getFile(path, name) {
    var data;
    fs.root.getFile(path+name, {}, function (fileEntry) {
        fileEntry.file(function (file) {
            var reader = new FileReader();
            reader.onloadend = function (e) {
                data = this.result;
            };
            reader.readAsText(file);
        }, errorHandler);
    }, errorHandler);
    return data;
}

function createDir(path) {
    // Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
    var folders = path.split('/');
    if (folders[0] == '.' || folders[0] == '') {
        folders = folders.slice(1);
    }
    fs.root.getDirectory(folders[0], { create: true }, function (dirEntry) {
        // Recursively add the new subfolder (if we still have another to create).
        if (folders.length) {
            createDir(dirEntry, folders.slice(1));
            gdo.consoleOut("FS", "INFO", "Path created:" + path);
        }
    }, errorHandler);
}

function removeDir(path) {
    fs.root.getDirectory(path, {}, function (dirEntry) {
        dirEntry.removeRecursively(function () {
            gdo.consoleOut("FS", "INFO", "Directory removed:" + path);
        }, errorHandler);
    }, errorHandler);
}

function getDir() {
    //TODO
}
