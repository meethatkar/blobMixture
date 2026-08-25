uniform float uTime;
varying vec2 vUv;

void main() {
    // Dynamic color based on UV coordinates and time
    vec3 color = vec3(vUv.x, vUv.y, sin(uTime) * 0.5 + 0.5);
    gl_FragColor = vec4(color, 1.0);
}
