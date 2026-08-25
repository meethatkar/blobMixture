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
    float shift = 0.07;
    vec3 A = csm_Position + shift * bitangent;
    vec3 B = csm_Position - shift * bitangent;

    float blob = getBlob(csm_Position);
    csm_Position += blob * normal;

    A += getBlob(A)*normal;
    B += getBlob(B)*normal;
    
    // normalize the above values
    vec3 NA = normalize(A - csm_Position);
    vec3 NB = normalize(B - csm_Position);

    csm_Normal = -cross(NA,NB);
}