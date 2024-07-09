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
uniform mat4 uInverseModelMat;

uniform vec3 uCamPos;
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

varying vec2 vUv;
varying vec4 vPosition;
varying vec4 vRayOrigin;
varying vec3 vHitPos;
varying mat4 vModelMatrix;
varying vec3 vWorldPos;
varying vec4 vClipPos;

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
	d = length(vec2(length(p.xz) - .25, p.y)) - .08;
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

		// Calculate NDC coordinates
    	vec2 ndc = vClipPos.xy / vClipPos.w;
    
    	// Calculate view space coordinates
    	vec4 viewSpace = inverse(uProjectionMatrix) * vec4(ndc, -1.0, 1.0);
    	viewSpace /= viewSpace.w;

		// Calculate world space ray origin
		vec3 rayOrigin = (inverse(uModelViewMatrix) * viewSpace).xyz;
		
		// Ray direction is constant in view space for orthographic projection
		vec3 rayDirection = normalize((inverse(uModelViewMatrix) * vec4(uCamPos, 0.0)).xyz);
		
		// Transform to object space if needed
		vec3 ro = (uInverseModelMat * vec4(rayOrigin, 1.0)).xyz;
		vec3 rd = normalize((uInverseModelMat * vec4(rayDirection, 0.0)).xyz);
    



		// vec3 ro = (uInverseModelMat * vec4(vRayOrigin.xyz + uv.x * right + uv.y * up, 1.0)).xyz;
		// // vec3 ro = vRayOrigin.xyz + uv.x * right + uv.y * up;
		// vec3 rd = normalize((uInverseModelMat * vec4(uForward, 1.0)).xyz);

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
	}
`

export default fragmentShader
