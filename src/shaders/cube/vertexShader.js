const vertexShader = `

uniform vec3 uCamPos;
uniform mat4 uInverseModelMat;
uniform vec3 uMinBound;
uniform vec3 uMaxBound;
uniform vec3 uObjectPosition;
uniform vec3 uObjectScale;

varying vec2 vScreenSpaceUV;
varying vec3 vUv;
varying vec4 vPosition;
varying vec4 vRayOrigin;
varying vec3 vHitPos;
varying vec2 vScreenSpaceOrigin;
varying vec3 vWorldPosition;
varying vec4 vClipSpacePos;

void main() {

    vec4 worldPosition = modelViewMatrix * vec4(position, 1.0);
    vec3 viewDirection = normalize(-worldPosition.xyz);

    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz; // Calculate world position
    
    vClipSpacePos = modelViewMatrix * projectionMatrix * vec4(uObjectPosition, 1.0); // Compute clip space position

    gl_Position = projectionMatrix * viewMatrix * vec4(vWorldPosition, 1.0); // Set the position of the vertex
    

    // vUv = vWorldPosition.xyz;
    // vUv = vWorldPosition;
    vUv = (vWorldPosition - uObjectPosition) / uObjectScale;
    vPosition = worldPosition;
    // vRayOrigin = uInverseModelMat * vec4(uCamPos, 1.0);
    vRayOrigin = vec4(uCamPos, 1.0);
    // vHitPos = worldPosition.xyz;
    vHitPos = position;

}

`
export default vertexShader
