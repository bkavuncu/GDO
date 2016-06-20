#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
precision mediump int;

// Camera Controls
uniform float width;
uniform float height;
uniform float xRot;
uniform float yRot;
uniform float focal;
uniform vec3 translation;
uniform float eyeHeight;

// Sphere function
float primitiveSphere(vec3 p, float r) {
	return length(p) - r;
}

vec3 march(vec3 ro, vec3 rd) {

    // Sky color
	vec3 color = vec3(0.0, 0.0, 0.0);

	// p - point of current ray
	vec3 p = ro;

    // t - total distance ray travelled
	float t = 0.0;

    for (int i = 0; i < 100; i++) {
	
		// ray origin + ray direction * total distance
		p = ro + rd * t;

		float d = primitiveSphere(p, 0.5);

		if (d < 0.01) {
		    color = vec3(1.0 - (t+d)/10.0,0.0,0.0);

			break;
		}

		// increase total distance by ray distance
		t += d;
	}

	return color;
}