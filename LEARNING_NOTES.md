# Three.js & GLSL Shader Learning Notes

A collection of technical learnings, bugs encountered, and verified solutions in this project.

---

## 1. Vertex Shader Normal Calculation for Noise Displacement

### 🐛 Problem / Bug
The displaced 3D blob mesh had missing depth, step/slice artifacts, flat shading bands, and corrupted lighting highlights across its surface.

### 🔍 Root Cause
In `vertex.glsl`, the finite difference calculation for `csm_Normal` attempted to sample neighboring displaced positions `A` and `B` using the same axis (`bitangent`):

```glsl
// ❌ INCORRECT (Collinear Sample Vectors):
vec3 bitangent = cross(tangent.xyz, normal);
float shift = 0.07;
vec3 A = csm_Position + shift * bitangent;
vec3 B = csm_Position - shift * bitangent; // Collinear with A!
```

Because `A` and `B` both lay on the `bitangent` line, vectors `(displacedA - displacedPos)` and `(displacedB - displacedPos)` were parallel. The cross product of parallel vectors evaluates to `vec3(0.0)`, corrupting `csm_Normal` and breaking PBR surface lighting.

### ✅ Solution
Sample `posA` along `tangent.xyz` and `posB` along `bitangent` to form two orthogonal tangent vectors across the displaced surface, and reduce `shift` to `0.01` for accurate derivatives:

```glsl
// ✅ CORRECT (Orthogonal Tangent & Bitangent Sampling):
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
```

---

## 2. Metallic PBR Materials & Neutral Studio Lighting

### 🐛 Problem / Bug
When disabling photographic HDRI maps (`garden.hdr`), metallic objects (`metalness: 1, roughness: 0`) became black or completely invisible because metallic PBR materials rely on environment reflections.

### ✅ Solution
Use `THREE.PMREMGenerator` with `RoomEnvironment` from `three/examples/jsm/environments/RoomEnvironment.js` to supply clean, neutral studio softbox lighting and reflections without photo landscapes:

```javascript
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(
  new RoomEnvironment(),
  0.04
).texture;
```

---

## 3. Troika Text Custom Shader Materials

### 🐛 Problem / Bug
Creating a custom `ShaderMaterial` (`textMaterial`) for Troika `Text` without assigning `myText.material = textMaterial` caused Troika text to render with standard built-in materials and ignore custom vertex swirl shaders.

### ✅ Solution
Assign `myText.material = textMaterial` directly to each Troika `Text` instance. Troika wraps the material while maintaining its MSDF glyph fragment shader:

```javascript
const texts = blobs.map((blob) => {
  const myText = new Text();
  myText.text = blob.name;
  myText.material = textMaterial; // Assign custom shader material
  // ...
  return myText;
});
```

---

## 4. Render Loop Dependency on `LoadingManager`

### 🐛 Problem / Bug
Nesting `tick()` (`requestAnimationFrame`) inside `loadingManager.onLoad(...)` caused the render loop to freeze when `loadingManager` had 0 active items tracked.

### ✅ Solution
Execute `tick()` independently in the main animation setup scope so `renderer.render(scene, camera)` starts immediately on page load.

---

## 5. PBR Metalness & Specular Reflections Overriding Diffuse Textures

### 🐛 Problem / Bug
Textures loaded properly (`purple-rain.png` and `lucky-day.png`), but the 2nd and 3rd blobs appeared as solid silver chrome.

### 🔍 Root Cause
In standard PBR (`MeshPhysicalMaterial`), a surface with `metalness: 1.0` and `roughness: 0.0` or high `clearcoat: 1.0` acts as a pure mirror reflecting 100% of the studio environment lighting (`scene.environment`). The white studio light reflections completely overpower and blind out the base color diffuse texture map underneath.

### ✅ Solution
Balance `roughness`, `metalness`, and `envMapIntensity` so diffuse texture maps remain vibrant while preserving glossy/metallic specular highlights:

```javascript
// ✅ Balanced PBR Config:
config: {
  roughness: 0.15,        // Sheen instead of pure 0 mirror
  metalness: 0.5,         // Allows diffuse texture map to show
  envMapIntensity: 0.4,   // Prevents specular reflection from washing out textures
  clearcoat: 0.2,
  map: "purple-rain",
}
```
