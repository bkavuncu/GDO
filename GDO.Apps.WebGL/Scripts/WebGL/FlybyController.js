FlybyController = function (engine, camera, controlCanvas, waypoints, speed, onFinish) {

    this.engine = engine;
    this.camera = camera;
    this.controlCanvas = controlCanvas;

    this.onFinish = onFinish;

    this.waypoints = waypoints;
    this.nextWaypoint = 0;

    this.speed = speed;

    this.updateLoop = function () {

        if (this.nextWaypoint == this.waypoints.length) {
            this.stop();
            this.onFinish();
            return;
        }

        var targetPosition = this.waypoints[this.nextWaypoint];

        if(BABYLON.Vector3.DistanceSquared(targetPosition, this.camera.position) < 1) {
            this.nextWaypoint++;
            this.updateLoop();
            return;
        }

        var moveAmount = targetPosition.subtract(this.camera.position);
        moveAmount.normalize();

        moveAmount.scaleInPlace(this.engine.getDeltaTime() * this.speed);

        this.camera.position.addInPlace(moveAmount);
    }

    this.start = function () {
        this.camera.detachControl(this.controlCanvas);
        this.engine.runRenderLoop(this.updateLoop.bind(this));
    }

    this.stop = function () {
        this.camera.attachControl(this.controlCanvas);
        this.engine.stopRenderLoop(this.updateLoop.bind(this));
    }

    this.reset = function () {
        this.nextWaypoint = 0;
        this.camera.position.copyFromFloats(0,0,0);
    }
}