const vertexShader = `

uniform vec3 uCamPos;
uniform mat4 uInverseModelMat;
uniform mat4 uModelViewMatrix;

varying vec2 vUv;
varying vec4 vPosition;
varying vec4 vRayOrigin;
varying vec3 vHitPos;
varying mat4 vModelMatrix;
varying vec3 vWorldPos;
varying vec4 vClipPos;

void main() {

    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    vec4 clipPos = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vClipPos = clipPos;
    gl_Position = clipPos;
}

`
export default vertexShader
