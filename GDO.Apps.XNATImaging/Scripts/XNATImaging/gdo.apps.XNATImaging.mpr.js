var currentImage = '';
var currentImageOrientation = '';
var imageOrientations = ["AXIAL", "SAGITTAL", "CORONAL"];

var getImageOrientationPatient = function (imageOrientation) {
    //rowX, rowY, rowZ, colX, colY, colZ
    //var imageOrientation = currentImage.string('x00200037');
    //console.log(imageOrientation);
    var startIndex = 0;
    var values = [];
    var indexOfSlash = imageOrientation.indexOf('\\', startIndex);
    while (indexOfSlash != -1) {
        values.push(imageOrientation.substring(startIndex, indexOfSlash));
        startIndex = indexOfSlash + 1;
        //imageOrientation = imageOrientation.substr(startIndex);
        indexOfSlash = imageOrientation.indexOf('\\', startIndex);
        if (indexOfSlash == -1) {
            values.push(imageOrientation.substr(startIndex));
        }
    }

    var rowX = values[0];
    var rowY = values[1];
    var rowZ = values[2];
    var colX = values[3];
    var colY = values[4];
    var colZ = values[5];

    var obliquityThresholdCosineValue = 0.8;

    var getMajorAxisFromPatientRelativeDirectionCosine = function (x, y, z) {
        var axis = null;

        var orientationX = x < 0 ? "R" : "L";
        var orientationY = y < 0 ? "A" : "P";
        var orientationZ = z < 0 ? "F" : "H";

        var absX = Math.abs(x);
        var absY = Math.abs(y);
        var absZ = Math.abs(z);

        // The tests here really don't need to check the other dimensions,
        // just the threshold, since the sum of the squares should be == 1.0
        // but just in case ...

        if (absX > obliquityThresholdCosineValue && absX > absY && absX > absZ) {
            axis = orientationX;
        }
        else if (absY > obliquityThresholdCosineValue && absY > absX && absY > absZ) {
            axis = orientationY;
        }
        else if (absZ > obliquityThresholdCosineValue && absZ > absX && absZ > absY) {
            axis = orientationZ;
        }
        return axis;
    }

    var label = null;
    var rowAxis = getMajorAxisFromPatientRelativeDirectionCosine(rowX, rowY, rowZ);
    var colAxis = getMajorAxisFromPatientRelativeDirectionCosine(colX, colY, colZ);
    //console.log(rowAxis);
    //console.log(colAxis);
    if (rowAxis != null && colAxis != null) {
        if ((rowAxis.indexOf("R") > -1 || rowAxis.indexOf("L") > -1)
            && (colAxis.indexOf("A") > -1 || colAxis.indexOf("P") > -1))
            label = "AXIAL";
        else if ((colAxis.indexOf("R") > -1 || colAxis.indexOf("L") > -1)
            && (rowAxis.indexOf("A") > -1 || rowAxis.indexOf("P") > -1))
            label = "AXIAL";

        else if ((rowAxis.indexOf("R") > -1 || rowAxis.indexOf("L") > -1)
            && (colAxis.indexOf("H") > -1 || colAxis.indexOf("F") > -1))
            label = "CORONAL";
        else if ((colAxis.indexOf("R") > -1 || colAxis.indexOf("L") > -1)
            && (rowAxis.indexOf("H") > -1 || rowAxis.indexOf("F") > -1))
            label = "CORONAL";

        else if ((rowAxis.indexOf("A") > -1 || rowAxis.indexOf("P") > -1)
            && (colAxis.indexOf("H") > -1 || colAxis.indexOf("F") > -1))
            label = "SAGITTAL";
        else if ((colAxis.indexOf("A") > -1 || colAxis.indexOf("P") > -1)
            && (rowAxis.equals("H") > -1 || rowAxis.equals("F") > -1))
            label = "SAGITTAL";
    }
    else {
        label = "OBLIQUE";
    }
    //console.log(label);
    return label;
}

gdo.net.app["XNATImaging"].getImageProperties = function (url) {
    var deferred = $.Deferred();
    try {

        var currentImageLoaded = getDICOM(url);
        currentImageLoaded.then(function(data) {
            //gdo.consoleOut(".XNATImaging", 1, currentImage);
            var imageOrientation = data.string('x00200037');
            //gdo.consoleOut(".XNATImaging", 1, imageOrientation);
            currentImageOrientation = getImageOrientationPatient(imageOrientation);
            var imageAndOrientation = { url: url, orientation: currentImageOrientation };
            //gdo.consoleOut(".XNATImaging", 1, currentImageOrientation);

            deferred.resolve(imageAndOrientation);
        });
        //var imageOrientation = currentImage.string('x00200037');
        //currentImageOrientation = getImageOrientationPatient(imageOrientation);

        //imageOrientations.push(currentImageOrientation);
        //console.log(currentImageOrientation);

    } catch (e) {
        deferred.reject(e);
    }
    return deferred.promise();
}

var getDICOM = function (url) {

    var deferred = $.Deferred();
    try {
        var oReq = new XMLHttpRequest();
        try {
            oReq.open("get", url, true);
        }
        catch (err) {
            alert("can't open file");
            return false;
        }

        oReq.responseType = "arraybuffer";
        oReq.onreadystatechange = function (oEvent) {
            if (oReq.readyState == 4) {
                if (oReq.status == 200) {
                    var byteArray = new Uint8Array(oReq.response);
                    var parsedDicom = dumpByteArray(byteArray);
                    deferred.resolve(parsedDicom);
                }
                else {
                    alert('Status: HTTP Error - status code ' + oReq.status + '; error text = ' + oReq.statusText);
                }
            }
        };
        oReq.send();
    } catch (e) {
        deferred.reject(e);
    }
    return deferred.promise();

}

var setCurrentImageDicom2 = function (url) {

    var oReq = new XMLHttpRequest();
    try {
        oReq.open("get", url, true);
    }
    catch (err) {
        alert("can't open file");
        return false;
    }

    oReq.responseType = "arraybuffer";
    oReq.onreadystatechange = function (oEvent) {
        if (oReq.readyState == 4) {
            if (oReq.status == 200) {
                var byteArray = new Uint8Array(oReq.response);
                dumpByteArray(byteArray);
                /*
                var imageOrientation = currentImage.string('x00200037');
                currentImageOrientation = getImageOrientationPatient(imageOrientation);
                imageOrientations.push(currentImageOrientation);
                console.log(currentImageOrientation);*/
            }
            else {
                alert('Status: HTTP Error - status code ' + oReq.status + '; error text = ' + oReq.statusText);
            }
        }
    };
    oReq.send();
}

var dumpByteArray = function (byteArray) {
    // Here we have the file data as an ArrayBuffer.  dicomParser requires as input a
    // Uint8Array so we create that here
    var kb = byteArray.length / 1024;
    var mb = kb / 1024;
    var byteStr = mb > 1 ? mb.toFixed(3) + " MB" : kb.toFixed(0) + " KB";
    //document.getElementById('statusText').innerHTML = 'Status: Parsing ' + byteStr + ' bytes, please wait..';
    // set a short timeout to do the parse so the DOM has time to update itself with the above message

    var currentImage = dicomParser.parseDicom(byteArray);
    return currentImage;
    // Here we call dumpDataSet to recursively iterate through the DataSet and create an array
    // of strings of the contents.


    /*
    setTimeout(function() {

        // Invoke the paresDicom function and get back a DataSet object with the contents
        var dataSet;
        try {
            var start = new Date().getTime();
            currentImage = dicomParser.parseDicom(byteArray);
            // Here we call dumpDataSet to recursively iterate through the DataSet and create an array
            // of strings of the contents.
            var imageOrientation = currentImage.string('x00200037');
            currentImageOrientation = getImageOrientationPatient(imageOrientation);
            console.log(currentImageOrientation);
        }
        catch(err)
        {
            alert('Status: Error - ' + err + ' (file of size ' + byteStr + ' )');
        }
    },1);*/
}

gdo.net.app["XNATImaging"].getCurrentImageOrientation = function (index) {

    console.log(imageOrientations[index]);
    return imageOrientations[index];
}