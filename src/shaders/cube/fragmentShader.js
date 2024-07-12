const fragmentShader = `

uniform float uTime;
uniform float progress;
uniform sampler2D texture01;
uniform vec4 uResolution;
uniform float dispersionOffset;
uniform float divideFactor;
uniform int count;
uniform float uSize;
uniform vec3 uForward;
uniform float uNearPlaneWidth;
uniform float uNearPlaneHeight;
uniform vec2 viewportSize;

varying vec2 vUv;
varying vec4 vPosition;
varying vec4 vRayOrigin;
varying vec3 vHitPos;

const float PI = 3.1415926;
const float HALF_PI = 0.5 * PI;
const float TWO_PI = 2.0 * PI;
const int LOOP = 16;

#define MAX_STEPS 40
#define MAX_DIST 40.
#define SURF_DIST 1e-3
#define samples 32
#define LOD 

float hash(in float v) { return fract(sin(v)*43237.5324); }
vec3 hash3(in float v) { return vec3(hash(v), hash(v*99.), hash(v*9999.)); }

float sphere(in vec3 p, in float r) { 
    float d = length(p) - r; 
    return d;
    }

float opSmoothUnion( float d1, float d2, float k ) {
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h);
}

#define BALL_NUM 5

float GetDist(vec3 p) {

	float d = length(p) - .3; // sphere
	d = length(vec2(length(p.xz) - .15, p.y)) - .02;
	return d;
}

float Raymarch(vec3 ro, vec3 rd) {
	float dO = 0.;
	float dS;
	for (int i = 0; i < MAX_STEPS; i++) {
		vec3 p = ro + rd * dO;
		dS = GetDist(p);
		dO += dS;
		if (dS < SURF_DIST || dO > MAX_DIST) break;
	}
	return dO;
}

vec3 GetNormal(in vec3 p) {
	vec2 e = vec2(1., -1.) * 1e-3;
    return normalize(
    	e.xyy * GetDist(p+e.xyy)+
    	e.yxy * GetDist(p+e.yxy)+
    	e.yyx * GetDist(p+e.yyx)+
    	e.xxx * GetDist(p+e.xxx)
    );
}

	void main() {

		// Calculate viewport UVs
		vec2 uv = vec2(gl_FragCoord.xy / uResolution.xy);

		// Transform UVs from [0, 1] to [-1, 1]
		uv = uv * 2.0 - 1.0; 

		vec3 forward = - normalize(uForward);
		vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
		vec3 up = cross(forward, right);

		// // Compute the ray origin based on the orthographic projection
		vec3 ro = vRayOrigin.xyz + uv.x * right + uv.y * up;

		// // The ray direction is constant
		vec3 rd = normalize(uForward);

		float d = Raymarch(ro, rd);

		vec3 col = vec3(0.0); 

		if ( d >= MAX_DIST )
			// discard;
			col = vec3(0.5);
		else {
			vec3 p = ro + rd * d;
			vec3 n = GetNormal(p);
			col.rgb = n;
		}
        gl_FragColor = vec4(col, 1.0);
        // gl_FragColor = vec4(rd, 1.0);
		// gl_FragColor = vec4(0., 0., 1., 1.0);
		// gl_FragColor = vec4(uv, 0.0, 1.0);
	}
`

export default fragmentShader
