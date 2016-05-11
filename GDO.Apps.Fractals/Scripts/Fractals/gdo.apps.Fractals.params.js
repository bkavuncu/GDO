﻿
function params(xRot, yRot, yHeight, xTrans, yTrans, zTrans, maxSteps, detail, ambience, iterations, modToggle) {
    this.xRot = xRot;
    this.yRot = yRot;
    this.yHeight = yHeight;
    this.modToggle = modToggle;
    this.xTrans = xTrans;
    this.yTrans = yTrans;
    this.zTrans = zTrans;
    this.maxSteps = maxSteps;
    this.detail = detail;
    this.ambience = ambience;
    this.iterations = iterations;
}
var params;

var modLoc;

var xRotLoc;
var yRotLoc;
var transLoc;

var eyeLoc;

var maxStepsLoc;
var detailLoc;

var ambienceLoc;

var iterationsLoc;

function applyParams() {

    gl.uniform1f(yRotLoc, params.yRot);
    gl.uniform1f(xRotLoc, params.xRot);
    gl.uniform3f(transLoc, params.xTrans, params.yTrans, params.zTrans);
    gl.uniform1f(eyeLoc, -params.yHeight);
    gl.uniform1i(modLoc, params.modToggle);
    gl.uniform1i(maxStepsLoc, params.maxSteps);
    gl.uniform1f(detailLoc, Math.pow(10.0, params.detail));
    gl.uniform1f(ambienceLoc, params.ambience);
    gl.uniform1i(iterationsLoc, params.iterations);
}
