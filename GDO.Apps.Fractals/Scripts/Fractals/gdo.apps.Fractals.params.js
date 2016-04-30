
function params(xRot, yRot, yHeight, modToggle) {
    this.xRot = xRot;
    this.yRot = yRot;
    this.yHeight = yHeight;
    this.modToggle = modToggle;
}
var params;

var modLoc;

var xRotLoc;
var yRotLoc;

var transLoc;
var xTrans = 0.0;
var yTrans = 0.0;
var zTrans = -2.0;

var eyeLoc;

var maxStepsLoc;

function applyParams() {

    gl.uniform1f(yRotLoc, params.yRot);
    gl.uniform1f(xRotLoc, params.xRot);
    gl.uniform3f(transLoc, xTrans, yTrans, zTrans);
    gl.uniform1f(eyeLoc, -params.yHeight);
    gl.uniform1i(modLoc, params.modToggle);
}
