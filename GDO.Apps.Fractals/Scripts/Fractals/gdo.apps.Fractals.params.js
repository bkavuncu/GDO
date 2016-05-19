var parameters;
var locations;

function params() {
    this.xRot = 0;
    this.yRot = 0;
    this.yHeight = 0;
    this.xTrans = 0;
    this.yTrans = 0;
    this.zTrans = -2;
    this.maxSteps = 100;
    this.detail = -3;
    this.ambience = 0.5;
    this.lightIntensity = 50;
    this.lightSize = 0.25;
    this.lightX = 4;
    this.lightY = 2;
    this.lightZ = -2;
    this.iterations = 16;
    this.power = 8;
    this.red = 1;
    this.green = 0;
    this.blue = 0;
    this.modToggle = 0;
}

function locs() {
    this.xRotLoc;
    this.yRotLoc;
    this.transLoc;
    this.eyeLoc;
    this.maxStepsLoc;
    this.detailLoc;
    this.iterationsLoc;
    this.powerLoc;
    this.colourLoc;
    this.ambienceLoc;
    this.lightIntensityLoc;
    this.lightSizeLoc;
    this.lightLocLoc;
    this.modLoc;
}

function applyParams() {

    gl.uniform1f(locations.yRotLoc, parameters.yRot);
    gl.uniform1f(locations.xRotLoc, parameters.xRot);
    gl.uniform3f(locations.transLoc, parameters.xTrans, parameters.yTrans, parameters.zTrans);
    gl.uniform1f(locations.eyeLoc, -parameters.yHeight);
    gl.uniform1i(locations.maxStepsLoc, parameters.maxSteps);
    gl.uniform1f(locations.detailLoc, Math.pow(10.0, parameters.detail));
    gl.uniform1i(locations.iterationsLoc, parameters.iterations);
    gl.uniform1f(locations.powerLoc, parameters.power);
    gl.uniform4f(locations.colourLoc, parameters.red, parameters.green, parameters.blue, 1.0);
    gl.uniform1f(locations.ambienceLoc, parameters.ambience);
    gl.uniform1f(locations.lightIntensityLoc, parameters.lightIntensity);
    gl.uniform1f(locations.lightSizeLoc, parameters.lightSize);
    gl.uniform3f(locations.lightLocLoc, parameters.lightX, parameters.lightY, parameters.lightZ);
    gl.uniform1i(locations.modLoc, parameters.modToggle);
}
