#include simplexNoise4d.glsl
attribute vec3 tangent;

uniform float uTime;

// For big geomtery
uniform float uPositionStrength;
uniform float uPositionFrequency;
uniform float uTimeFrequency;

// For small geometry
uniform float uSmallWavesPositionFrequency;
uniform float uSmallWavesTimeFrequency;
uniform float uSmallWavesPositionStrength;

float getBlob(vec3 position){
    vec3 wrappedPosition = position;
    wrappedPosition += simplexNoise4d(vec4(position*uPositionFrequency, uTime*uTimeFrequency))*uPositionStrength;
    // last num (.3) is overall strength of the first noise
    
    return simplexNoise4d(vec4(wrappedPosition*uSmallWavesPositionFrequency, uTime*uSmallWavesTimeFrequency))*uSmallWavesPositionStrength;
}

void main(){
    vec3 bitangent = cross(tangent.xyz, normal);
    float shift = 0.01;

    vec3 posA = csm_Position + shift * tangent.xyz;
    vec3 posB = csm_Position + shift * bitangent;

    float blob = getBlob(csm_Position);
    vec3 displacedPosition = csm_Position + blob * normal;

    vec3 displacedA = posA + getBlob(posA) * normal;
    vec3 displacedB = posB + getBlob(posB) * normal;

    vec3 toA = displacedA - displacedPosition;
    vec3 toB = displacedB - displacedPosition;

    csm_Position = displacedPosition;
    csm_Normal = normalize(cross(toA, toB));
}