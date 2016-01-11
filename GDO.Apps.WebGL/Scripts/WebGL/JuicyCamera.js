JuicyCamera = function (camera, target) {

    this.camera = camera;
    this.target = target;
    
    this.z = camera.position.z;
    
    this.movementSpeed = 0.006;
    this.rotationSpeed = 0.006;
    
    this.updateMovement = function( delta ) {
    
        // Move to
        var difference = new THREE.Vector3(0,0,0);
        
        var thing = this.target.localToWorld(new THREE.Vector3(0,50,0));
        
        thing.z = this.z;

        difference.subVectors(thing, this.camera.position);
        
        difference.multiplyScalar(delta * this.movementSpeed);
        
        camera.position.add(difference);     
	};
    
    this.updateRotation = function( delta ) {
        //Rotation
        this.camera.quaternion.slerp(this.target.quaternion, THREE.Math.clamp(delta * this.rotationSpeed, 0, 1));           
	};
    
    
    this.reset = function() {
        camera.position = target.position.clone();
        camera.position.z = this.z;
    }
}