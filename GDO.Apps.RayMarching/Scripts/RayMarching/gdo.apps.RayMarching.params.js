var parameters;
var locations1;
var locations2;

function params() {
    this.xRot = 0;
    this.yRot = 0;
    this.yHeight = 0;
    this.xTrans = 0;
    this.yTrans = 0;
    this.zTrans = -2;
}

function locs() {
    this.xRotLoc;
    this.yRotLoc;
    this.transLoc;
    this.eyeLoc;
}

function applyParams(locations, gl) {

    gl.uniform1f(locations.yRotLoc, parameters.yRot);
    gl.uniform1f(locations.xRotLoc, parameters.xRot);
    gl.uniform3f(locations.transLoc, parameters.xTrans, parameters.yTrans, parameters.zTrans);
    gl.uniform1f(locations.eyeLoc, -parameters.yHeight);// is this needed?
}
