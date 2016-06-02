#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
precision mediump int;

uniform float width;
uniform float height;
uniform float xRot;
uniform float yRot;
uniform float focal;
uniform vec3 translation;
uniform float eyeHeight;

uniform int maxSteps;
uniform float minDetail;
uniform float fog;

uniform float ambience;
uniform float lightIntensity;
uniform float lightSize;
uniform vec3 lightLoc;

uniform int fractal;
uniform int iterations;
uniform float power;
uniform vec4 colour;
uniform float scale;
uniform vec4 c;
uniform float threshold;

uniform int modFunction;

// Cylinder function
float primitiveCylinder(vec3 p, vec2 h) {
	vec2 d = abs(vec2(length(p.xz), p.y)) - h;
	return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

// Sphere function
float primitiveSphere(vec3 p, float r) {
	return length(p) - r;
}

// Torus function
float sdTorus(vec3 p, vec2 t) {
	vec2 q = vec2(length(p.xz) - t.x, p.y);
	return length(q) - t.y;
}

// Twist function
float opTwist(vec3 p) {
	float c = cos(20.0*p.y);
	float s = sin(20.0*p.y);
	mat2  m = mat2(c, -s, s, c);
	vec3  q = vec3(m*p.xz, p.y);
	return sdTorus(q, vec2(0.2, 0.4));
}

// Mod function
vec3 modPoint(vec3 p, float gap) {
	return mod(p, gap) - vec3(gap / 2.0);
}

void sphereFold(inout vec3 z, inout float dz)
{
	float r2 = dot(z, z);
	if (r2 < 0.5)
	{
		float temp = 2.0;
		z *= temp;
		dz *= temp;
	}
	else if (r2 < 1.0)
	{
		float temp = 1.0 / r2;
		z *= temp;
		dz *= temp;
	}
}

void boxFold(inout vec3 z, inout float dz)
{
	z = clamp(z, -1.0, 1.0) * 2.0 - z;
}

float DE(vec3 pos) {

	//

	if (modFunction == 1) {
		pos = modPoint(pos, 3.0);
	}
	//float d = opTwist(p);
	// float d = primitiveSphere(p, 0.5);
	//return d;

	if (fractal == 0) {

		// Treat as sphere beyond 2.0
		//if (length(pos) > 2.0) {
		//return length(pos) - 1.9;
		//}

		float Bailout = 2.0;
		//float Power = 8.0;

		vec3 z = pos;
		float dr = 1.0;
		float r = 0.0;
		for (int i = 0; i < 1 / 0; i++) {

			// Weird bug - without 2nd line it crashes ???
			if (i >= iterations) break;
			if (i>1 / 0) break;

			r = length(z);
			if (r>Bailout) break;

			// convert to polar coordinates
			float theta = acos(z.z / r);
			float phi = atan(z.y, z.x);
			dr = pow(r, power - 1.0)*power*dr + 1.0;

			// scale and rotate the point
			float zr = pow(r, power);
			theta = theta*power;
			phi = phi*power;

			// convert back to cartesian coordinates
			z = zr*vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
			z += pos;
		}
		return 0.5*log(r)*r / dr;

	}
	else if (fractal == 1) {

		vec3 z = pos;

		//float scale = 2.0;
		vec3 offset = z;
		float dr = 1.0;
		for (int n = 0; n < 500; n++)
		{
			if (n >= iterations) {
				break;
			}
			boxFold(z, dr);
			sphereFold(z, dr);
			z = scale * z + offset;
			dr = dr * abs(scale) + 1.0;
		}
		float r = length(z);
		return r / abs(dr);

	}
	else {

		//vec4 c = vec4(0.18, 0.88, 0.24, 0.16);
		//float threshold = 10.0;

		vec4 p = vec4(pos, 0.0);
		vec4 dp = vec4(1.0, 0.0, 0.0, 0.0);
		for (int i = 0; i < 1 / 0; i++) {
			if (i > iterations) break;
			dp = 2.0* vec4(p.x*dp.x - dot(p.yzw, dp.yzw), p.x*dp.yzw + dp.x*p.yzw + cross(p.yzw, dp.yzw));
			p = vec4(p.x*p.x - dot(p.yzw, p.yzw), vec3(2.0*p.x*p.yzw)) + c;
			float p2 = dot(p, p);
			if (p2 > threshold) break;
		}
		float r = length(p);
		return  0.5 * r * log(r) / length(dp);
	}

}

float shadow(vec3 ro, vec3 rd, float dist, float detail) {
	float res = 1.0;
	float t = 0.0;
	for (int i = 0; i < 1 / 0; i++) {
		if (i >= maxSteps) return 0.0;
		if (t > dist) break;

		float d = DE(ro + rd*t);
		if (d < detail) {
			return 0.0;
		}

		if (d < lightSize * t / dist) {
			res = min(res, d / (lightSize * t / dist));
		}

		t += d;

	}
	return res;
}

vec3 march(vec3 ro, vec3 rd) {

	// Sky color
	vec3 color = vec3(0.0, 0.0, 0.0);

	// p - point of current ray
	vec3 p = ro;

	// Lighting
	//vec3 lightLoc = vec3(4.0, 2.0, -2.0);
	//float lightIntensity = 50.0;
	vec3 lightDirection;
	vec3 normal = vec3(0.0);
	float ao = 1.0;
	float attenuation = 1.0;

	// Shading
	vec3 ambientColour = vec3(0.0, 0.0, 0.0);
	vec3 diffuseColour = vec3(1.0, 1.0, 1.0);
	vec3 specularColour = vec3(1.0, 1.0, 1.0);

	// t - total distance ray travelled
	float t = 0.0;

	float detail = minDetail;

	float minDistToLight = 1.0 / 0.0;

	for (int i = 0; i < 1 / 0; ++i) {
		if (i >= maxSteps) break;

		// ray origin + ray direction * total distance
		p = ro + rd * t;

		// find min detail
		float minVisibleDetail = (t / focal) * (0.5 / width);
		detail = minVisibleDetail > minDetail ? minVisibleDetail : minDetail;

		// distance estimators
		// Fractal
		float d1 = abs(DE(p));
		// Floor
		float d2 = abs(p.y + 2.0);
		float d3 = length(p - lightLoc);
		float d = min(d1, d2);
		d = min(d, d3);

		minDistToLight = min(minDistToLight, d3);

		if (d < detail) {
			if (d1 < d2) {

				ambientColour = colour.xyz;
				diffuseColour = colour.xyz;

				attenuation = lightIntensity / (pow((distance(p, lightLoc)), 2.0));
				attenuation = clamp(attenuation, 0.0, 1.0);
				lightDirection = normalize(-p + lightLoc);

				float shadingDetail = detail / 2.0;
				vec3 xDir = vec3(shadingDetail, 0.0, 0.0);
				vec3 yDir = vec3(0.0, shadingDetail, 0.0);
				vec3 zDir = vec3(0.0, 0.0, shadingDetail);
				normal = normalize(vec3(DE(p + xDir) - DE(p - xDir),
					DE(p + yDir) - DE(p - yDir),
					DE(p + zDir) - DE(p - zDir)));

				// Ambient Occlusion
				float aoFactor = 0.0;
				float delta = detail;
				float aoTotal = 0.0;
				for (int j = 1; j < 6; j++) {
					vec3 aoPos = p + normal * delta * float(j);
					float surfaceDist = distance(aoPos, p);
					float nearestDist = abs(DE(aoPos));
					float expDist = 1.0 / pow(2.0, float(i));
					aoTotal += expDist * abs(surfaceDist - nearestDist);
					aoFactor += expDist * max(surfaceDist, abs(surfaceDist - nearestDist));
				}

				ao = 1.0 - (aoTotal / aoFactor);

				break;

			}
			else {

				// Floor colour
				if (mod(p.x, 1.0) < 0.5) {
					if (mod(p.z, 1.0) < 0.5) {
						diffuseColour = vec3(0.0, 0.0, 0.0);
						ambientColour = vec3(0.0, 0.0, 0.0);
					}
					else {
						diffuseColour = vec3(1.0);
						ambientColour = vec3(1.0);
					}
				}
				else {
					if (mod(p.z, 1.0) < 0.5) {
						diffuseColour = vec3(1.0);
						ambientColour = vec3(1.0);
					}
					else {
						diffuseColour = vec3(0.0, 0.0, 0.0);
						ambientColour = vec3(0.0, 0.0, 0.0);
					}
				}


				attenuation = lightIntensity / (pow((distance(p, lightLoc)), 2.0));
				attenuation = clamp(attenuation, 0.0, 1.0);
				normal = vec3(0.0, 1.0, 0.0);
				lightDirection = normalize(-p + lightLoc);

				break;
			}
		}

		// increase total distance by ray distance
		t += d;
	}

	// Shadows
	float s = shadow(p + 2.0*detail*normal, lightDirection, distance(p, lightLoc), detail);

	// Shading
	// Ambience
	ambientColour *= ambience;
	color = (ambientColour + s * diffuseColour  * attenuation * max(dot(normal, lightDirection), 0.0)
		+ s * specularColour * attenuation * pow(max(dot(normalize(reflect(lightDirection, normal)), rd), 0.0), 200.0) / 3.0);

	// Ambient occlusion
	color *= ao;


	// Fog
	vec3 fogColor = vec3(0.0, 0.0, 0.0);
	color = mix(color, fogColor, 1.0 - exp(-t*fog));

	if (minDistToLight < lightSize) {
		color = mix(color, vec3(1.0), (lightIntensity / 20.0)* pow(1.0 - minDistToLight / lightSize, 2.0));
	}

	return color;

}

