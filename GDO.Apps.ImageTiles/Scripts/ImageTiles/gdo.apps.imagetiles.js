
$(function() {
    gdo.consoleOut('.IMAGETILES', 1, 'Loaded Image Tiles JS');
    /*$.connection.imageTilesAppHub.client.receiveTile = function (imageVal) {
        gdo.consoleOut('.IMAGETILES', 1, 'Received at Node ' + gdo.clientId);
        $("iframe").css("background-image", "url(data:image/png;base64," + imageVal + ")");
    }*/
});

gdo.net.app["ImageTiles"].initClient = function () {
    gdo.consoleOut('.IMAGETILES', 1, 'Initializing Image Tiles App Client at Node ' + gdo.clientId);
    gdo.net.app["ImageTiles"].server.requestTile(gdo.net.node[gdo.clientId].appInstanceId, gdo.net.node[gdo.clientId].sectionCol, gdo.net.node[gdo.clientId].sectionRow);
}

gdo.net.app["ImageTiles"].initControl = function() {
    gdo.consoleOut('.IMAGETILES', 1, 'Initializing Image Tiles App Control at Instance ' + gdo.clientId);
    $("iframe").contents().find("#files").bind('change', gdo.net.app["ImageTiles"].handleFileSelect);
    //$("iframe").contents().find("#files").bind('dragover', gdo.net.app["ImageTiles"].handleDragOver);
    //$("iframe").contents().find("#files").bind('drop', gdo.net.app["ImageTiles"].handleFileDrop);
    gdo.net.app["ImageTiles"].displayMode = 0;
}

gdo.net.app["ImageTiles"].uploadImage = function (image) {
    gdo.consoleOut('.IMAGETILES', 1, 'Instance ' + gdo.clientId + ": Uploading Image");
    gdo.net.app["ImageTiles"].server.uploadImage(gdo.net.node[gdo.clientId].appInstanceId, image, gdo.net.app["ImageTiles"].displayMode);
    gdo.consoleOut('.IMAGETILES', 1, 'Instance ' + gdo.clientId + ": Uploaded Image");
}

gdo.net.app["ImageTiles"].handleFileSelect = function (evt) {
    gdo.consoleOut('.IMAGETILES', 1, 'Instance ' + gdo.clientId + ": File Selected");
    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0; i < files.length; i++) {
        if (files[i] != null || files[i] != undefined) {
            output.push('<li><strong>', escape(files[i].name), '</strong> (', files[i].type || 'n/a', ') - ',
            files[i].size, ' bytes, last modified: ',
            files[i].lastModifiedDate ? files[i].lastModifiedDate.toLocaleDateString() : 'n/a',
            '</li>');
            gdo.net.app["ImageTiles"].processImage(files[i]);
        }
    }
    $("iframe").contents().find("#list").innerHTML = '<ul>' + output.join('') + '</ul>';
}

gdo.net.app["ImageTiles"].handleFileDrop = function (evt) {
    gdo.consoleOut('.IMAGETILES', 1, 'Instance ' + gdo.clientId + ": File Dropped");
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
        output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                    f.size, ' bytes, last modified: ',
                    f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
                    '</li>');
    }
    $("iframe").contents().find("#list").innerHTML = '<ul>' + output.join('') + '</ul>';
}

gdo.net.app["ImageTiles"].handleDragOver = function (evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

gdo.net.app["ImageTiles"].processImage = function (f)
{
    gdo.consoleOut('.IMAGETILES', 1, 'Instance ' + gdo.clientId + ": Processing File: " + f.name + " with type " + f.type);
    //if (!f.type.match('image/jpeg')) {
        var reader = new FileReader();
        reader.onload = (function(theFile) {
            return function(e) {
                var span = document.createElement('span');
                span.innerHTML = [
                    '<img class="thumb" src="', e.target.result,
                    '" title="', escape(theFile.name), '"/>'
                ].join('');
                $("iframe").contents().find("#list").insertBefore(span, null);
                gdo.net.app["ImageTiles"].uploadImage(e.target.result);
            };
        })(f);
        reader.readAsDataURL(f);
    //} else {
    //    gdo.consoleOut('.IMAGETILES', 1, 'Instance ' + gdo.clientId + ": File Processed is not a Image: " + f.name);
    //}
}

gdo.net.app["ImageTiles"].processImages = function (files) {
    gdo.consoleOut('.IMAGETILES', 1, 'Instance ' + gdo.clientId + ": Processing Images");
    for (var i = 0; i<files.length; i++) {
        gdo.net.app["ImageTiles"].processImage(files[i]);
    }
}