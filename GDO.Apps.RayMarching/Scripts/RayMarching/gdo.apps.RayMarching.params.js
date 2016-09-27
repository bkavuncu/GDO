gdo.net.app["RayMarching"].parameters;
gdo.net.app["RayMarching"].locations1;
gdo.net.app["RayMarching"].locations2;

gdo.net.app["RayMarching"].params = function () {
    this.xRot = 0;
    this.yRot = 0;
    this.yHeight = 0;
    this.xTrans = 0;
    this.yTrans = 0;
    this.zTrans = -2;
}

gdo.net.app["RayMarching"].locs = function () {
    this.xRotLoc;
    this.yRotLoc;
    this.transLoc;
    this.eyeLoc;
}

gdo.net.app["RayMarching"].applyParams = function (locations, gl) {

    gl.uniform1f(locations.yRotLoc, gdo.net.app["RayMarching"].parameters.yRot);
    gl.uniform1f(locations.xRotLoc, gdo.net.app["RayMarching"].parameters.xRot);
    gl.uniform3f(locations.transLoc, gdo.net.app["RayMarching"].parameters.xTrans, gdo.net.app["RayMarching"].parameters.yTrans, gdo.net.app["RayMarching"].parameters.zTrans);
    gl.uniform1f(locations.eyeLoc, -gdo.net.app["RayMarching"].parameters.yHeight);
}
