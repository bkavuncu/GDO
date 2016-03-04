
function rotationParams(xRot, yRot, yHeight, modToggle) {
    this.xRot = xRot;
    this.yRot = yRot;
    this.yHeight = yHeight;
    this.modToggle = modToggle;
}

var modLoc;
var rotationParams;

// Camera settings
var sensitivity = 0.05;

var xRotLoc;
var xRot = 0.0;
var xRotLeft = false;
var xRotRight = false;

var yRotLoc;
var yRot = 0.0;
var yRotUp = false;
var yRotDown = false;

var focalLoc;
var focal = 1/Math.tan((315/32)*(Math.PI/180));
var focalIn = false;
var focalOut = false;

var transLoc;
var forward = false;
var backward = false;
var left = false;
var right = false;
var up = false;
var down = false;
var xTrans = 0.0;
var yTrans = 0.0;
var zTrans = -2.0;

var eyeLoc;
var xEye = 0.0;
var yEye = 0.0;
var zEye = 0.0;


window.onkeydown = function () {
    //alert(event.keyCode);
    // up - rotate up
    if (event.keyCode == 38) {
        yRotUp = true;
    }

    // down - rotate down
    if (event.keyCode == 40) {
        yRotDown = true;
    }

    // left - rotate left
    if (event.keyCode == 37) {
        xRotLeft = true;
    }

    // right - rotate right
    if (event.keyCode == 39) {
        xRotRight = true;
    }

    // + - zoom in
    if (event.keyCode == 107) {
        focalIn = true;
    }

    // - - zoom out
    if (event.keyCode == 109) {
        focalOut = true;
    }

    // w - forward
    if (event.keyCode == 87) {
        forward = true;
    }

    // s - backward
    if (event.keyCode == 83) {
        backward = true;
    }

    // a - left
    if (event.keyCode == 65) {
        left = true;
    }

    // d - right
    if (event.keyCode == 68) {
        right = true;
    }

    // pgup - up
    if (event.keyCode == 33) {
        up = true;
    }

    // pddown - backward
    if (event.keyCode == 34) {
        down = true;
    }
}

window.onkeyup = function () {
    // up - rotate up
    if (event.keyCode == 38) {
        yRotUp = false;
    }

    // down - rotate down
    if (event.keyCode == 40) {
        yRotDown = false;
    }

    // left - rotate left
    if (event.keyCode == 37) {
        xRotLeft = false;
    }

    // right - rotate right
    if (event.keyCode == 39) {
        xRotRight = false;
    }

    // + - zoom in
    if (event.keyCode == 107) {
        focalIn = false;
    }

    // - - zoom out
    if (event.keyCode == 109) {
        focalOut = false;
    }

    // w - forward
    if (event.keyCode == 87) {
        forward = false;
    }

    // s - backward
    if (event.keyCode == 83) {
        backward = false;
    }
    // a - left
    if (event.keyCode == 65) {
        left = false;
    }

    // d - right
    if (event.keyCode == 68) {
        right = false;
    }

    // pgup - up
    if (event.keyCode == 33) {
        up = false;
    }

    // pddown - backward
    if (event.keyCode == 34) {
        down = false;
    }
}

function cameraMovements() {

    if (yRotUp) {
        yRot += sensitivity;
    }
    if (yRotDown) {
        yRot -= sensitivity;
    }
    gl.uniform1f(yRotLoc, rotationParams.yRot);

    if (xRotLeft) {
        xRot += sensitivity;
    }
    if (xRotRight) {
        xRot -= sensitivity;
    }
    gl.uniform1f(xRotLoc, rotationParams.xRot);

    if (focalIn) {
        focal += sensitivity;
    }
    if (focalOut) {
        focal -= sensitivity;
    }
    gl.uniform1f(focalLoc, focal);

    if (forward) {
        zTrans += sensitivity
    }
    if (backward) {
        zTrans -= sensitivity
    }
    if (left) {
        xTrans -= sensitivity
    }
    if (right) {
        xTrans += sensitivity
    }
    if (up) {
        yTrans += sensitivity
    }
    if (down) {
        yTrans -= sensitivity
    }
    gl.uniform3f(transLoc, xTrans, yTrans, zTrans);

    gl.uniform1f(eyeLoc, -rotationParams.yHeight);
}
