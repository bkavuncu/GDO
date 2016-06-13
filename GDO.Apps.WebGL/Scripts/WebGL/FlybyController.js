FlybyController = function (engine, camera, controlCanvas, waypoints, speed, onFinish) {

    this.engine = engine;
    this.camera = camera;
    this.controlCanvas = controlCanvas;

    this.onFinish = onFinish;

    this.waypoints = waypoints;
    this.nextWaypoint = 0;

    this.speed = speed;

    this.timer = 2000;

    this.updateLoop = function () {

        if (this.nextWaypoint == this.waypoints.length) {
            this.stop();
            this.onFinish();
            return;
        }

        if (this.timer > 0) {
            this.timer -= this.engine.getDeltaTime();
            return;
        }
        
        var distanceToMove = this.engine.getDeltaTime() * this.speed;

        var targetPosition = this.waypoints[this.nextWaypoint];

        if(BABYLON.Vector3.DistanceSquared(targetPosition, this.camera.position) < distanceToMove*distanceToMove) {
            this.nextWaypoint++;
            this.updateLoop();
            return;
        }

        var moveAmount = targetPosition.subtract(this.camera.position);
        moveAmount.normalize();

        moveAmount.scaleInPlace(distanceToMove);

        this.camera.position.addInPlace(moveAmount);
    }.bind(this)

    this.start = function () {
        this.camera.detachControl(this.controlCanvas);
        this.engine.runRenderLoop(this.updateLoop);
    }

    this.stop = function () {
        this.camera.attachControl(this.controlCanvas);
        this.engine.stopRenderLoop(this.updateLoop);
    }

    this.reset = function () {
        this.nextWaypoint = 0;
        this.timer = 2000;
        this.camera.position.copyFromFloats(0, 0, 0);
        this.camera.rotation.copyFromFloats(0, 0, 0);
    }
}