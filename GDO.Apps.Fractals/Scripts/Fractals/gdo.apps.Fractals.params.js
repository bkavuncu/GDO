gdo.net.app["Fractals"].parameters;
gdo.net.app["Fractals"].locations1;
gdo.net.app["Fractals"].locations2;

gdo.net.app["Fractals"].params = function () {
    this.xRot = 0;
    this.yRot = 0;
    this.yHeight = 0;
    this.xTrans = 0;
    this.yTrans = 0;
    this.zTrans = -2;
    this.maxSteps = 100;
    this.detail = -3;
    this.fog = 0.1;
    this.ambience = 0.5;
    this.lightIntensity = 50;
    this.lightSize = 0.25;
    this.lightX = 4;
    this.lightY = 2;
    this.lightZ = -2;
    this.iterations = 12;
    this.power = 8;
    this.red = 1;
    this.green = 0;
    this.blue = 0;
    this.scale = 2;
    this.cx = -0.58;
    this.cy = 0.52;
    this.cz = 0.48;
    this.cw = 0.2;
    this.threshold = 10;
    this.modToggle = 0;
    this.fractal = 0;
}

gdo.net.app["Fractals"].locs = function () {
    this.xRotLoc;
    this.yRotLoc;
    this.transLoc;
    this.eyeLoc;
    this.maxStepsLoc;
    this.detailLoc;
    this.fogLoc;
    this.fractalLoc;
    this.iterationsLoc;
    this.powerLoc;
    this.colourLoc;
    this.scaleLoc;
    this.juliaCLoc;
    this.thresholdLoc;
    this.ambienceLoc;
    this.lightIntensityLoc;
    this.lightSizeLoc;
    this.lightLocLoc;
    this.modLoc;
}

gdo.net.app["Fractals"].applyParams = function (locations, gl) {

    gl.uniform1f(locations.yRotLoc, gdo.net.app["Fractals"].parameters.yRot);
    gl.uniform1f(locations.xRotLoc, gdo.net.app["Fractals"].parameters.xRot);
    gl.uniform3f(locations.transLoc, gdo.net.app["Fractals"].parameters.xTrans, gdo.net.app["Fractals"].parameters.yTrans, gdo.net.app["Fractals"].parameters.zTrans);
    gl.uniform1f(locations.eyeLoc, -gdo.net.app["Fractals"].parameters.yHeight);
    gl.uniform1i(locations.maxStepsLoc, gdo.net.app["Fractals"].parameters.maxSteps);
    gl.uniform1f(locations.detailLoc, Math.pow(10.0, gdo.net.app["Fractals"].parameters.detail));
    gl.uniform1f(locations.fogLoc, gdo.net.app["Fractals"].parameters.fog);
    gl.uniform1i(locations.fractalLoc, gdo.net.app["Fractals"].parameters.fractal);
    gl.uniform1i(locations.iterationsLoc, gdo.net.app["Fractals"].parameters.iterations);
    gl.uniform1f(locations.powerLoc, gdo.net.app["Fractals"].parameters.power);
    gl.uniform4f(locations.colourLoc, gdo.net.app["Fractals"].parameters.red, gdo.net.app["Fractals"].parameters.green, gdo.net.app["Fractals"].parameters.blue, 1.0);
    gl.uniform1f(locations.scaleLoc, gdo.net.app["Fractals"].parameters.scale);
    gl.uniform4f(locations.juliaCLoc, gdo.net.app["Fractals"].parameters.cx, gdo.net.app["Fractals"].parameters.cy, gdo.net.app["Fractals"].parameters.cz, gdo.net.app["Fractals"].parameters.cw);
    gl.uniform1f(locations.thresholdLoc, gdo.net.app["Fractals"].parameters.threshold);
    gl.uniform1f(locations.ambienceLoc, gdo.net.app["Fractals"].parameters.ambience);
    gl.uniform1f(locations.lightIntensityLoc, gdo.net.app["Fractals"].parameters.lightIntensity);
    gl.uniform1f(locations.lightSizeLoc, gdo.net.app["Fractals"].parameters.lightSize);
    gl.uniform3f(locations.lightLocLoc, gdo.net.app["Fractals"].parameters.lightX, gdo.net.app["Fractals"].parameters.lightY, gdo.net.app["Fractals"].parameters.lightZ);
    gl.uniform1i(locations.modLoc, gdo.net.app["Fractals"].parameters.modToggle);
}
