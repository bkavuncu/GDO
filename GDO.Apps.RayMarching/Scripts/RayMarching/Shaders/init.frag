
vec3 calcRayIntercept(float x, float y) {

	// x rotation
	float x2 = x*cos(xRot) - focal*sin(xRot);
    float focal2 = x*sin(xRot) + focal*cos(xRot);
    x = x2;

    // y rotation
    float y2 = y*cos(yRot) - focal2*sin(yRot);
    focal2 = y*sin(yRot) + focal2*cos(yRot);
    y = y2;

    // ri - ray intercept
    // calculate where ray passes through the screen
    vec3 ri = vec3(x, y - eyeHeight*cos(yRot), focal2 - eyeHeight*sin(yRot));

    return ri;
}

void rayMarch() {

    // Keep eye in the origin of the scene
    vec3 eye = vec3(0, 0, 0);

    // Get x between -1.0 - 1.0
    float x = gl_FragCoord.x * 2.0 / width - 1.0;

    // Get y between -1.0 - 1.0
    float y = gl_FragCoord.y * 2.0 / height - 1.0;

    // Apply aspect ratio
    float ratio = height / width;
    y *= ratio;

    float xDiffAA = 0.5 / width;
    float yDiffAA = 0.5*ratio / height;

    // Ray screen intercept
    vec3 ri = calcRayIntercept(x, y);

    // Set pixel colour
    vec3 color = march(translation, normalize(ri));
    gl_FragColor = vec4(color,0.999);

    // Anti alias
    /*
	vec3 ro1 = calcRayOrigin(x+xDiffAA, y);
	vec3 ro2 = calcRayOrigin(x-xDiffAA, y);
	vec3 ro3 = calcRayOrigin(x, y+yDiffAA);
	vec3 ro4 = calcRayOrigin(x+xDiffAA, y-yDiffAA);
	vec4 c1 = march(translation, normalize(ro1));
	vec4 c2 = march(translation, normalize(ro2));
	vec4 c3 = march(translation, normalize(ro3));
	vec4 c4 = march(translation, normalize(ro4));
	gl_FragColor = (c1+c2+c3+c4)/4.0;
	*/
}

void main() {
    rayMarch();
}