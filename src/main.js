import "./style.css";
import * as THREE from "three";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import GUI from "lil-gui";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

// GUI Setup
const gui = new GUI({ title: "Blob Shader Controls" });

// Canvas
const canvas =
  document.querySelector("canvas.webgl") || document.createElement("canvas");
if (!canvas.classList.contains("webgl")) {
  canvas.classList.add("webgl");
  document.body.appendChild(canvas);
}

// Scene
const scene = new THREE.Scene();

// Uniforms
const uniforms = {
  uTime: { value: 0 },
  uPositionStrength: { value: 0.05 },
  uPositionFrequency: { value: 1.2 },
  uTimeFrequency: { value: 0.7 },
  uSmallWavesPositionFrequency: { value: 1.2 },
  uSmallWavesTimeFrequency: { value: 0.7 },
  uSmallWavesPositionStrength: { value: 0.05 },
};

// Add Uniform Controls to GUI
const bigWavesFolder = gui.addFolder("Big Waves");
bigWavesFolder
  .add(uniforms.uPositionStrength, "value", 0, 1, 0.005)
  .name("Position Strength");
bigWavesFolder
  .add(uniforms.uPositionFrequency, "value", 0, 10, 0.1)
  .name("Position Frequency");
bigWavesFolder
  .add(uniforms.uTimeFrequency, "value", 0, 5, 0.05)
  .name("Time Frequency");

const smallWavesFolder = gui.addFolder("Small Waves");
smallWavesFolder
  .add(uniforms.uSmallWavesPositionStrength, "value", 0, 0.5, 0.005)
  .name("Position Strength");
smallWavesFolder
  .add(uniforms.uSmallWavesPositionFrequency, "value", 0, 10, 0.1)
  .name("Position Frequency");
smallWavesFolder
  .add(uniforms.uSmallWavesTimeFrequency, "value", 0, 5, 0.05)
  .name("Time Frequency");

// Geometry
const mergeGeometry = new mergeVertices(new THREE.IcosahedronGeometry(1, 90));

// Material
const material = new CustomShaderMaterial({
  baseMaterial: THREE.MeshPhysicalMaterial,
  color: 0x00ffcc,
  metalness: 0.3,
  roughness: 0.4,
  vertexShader,
  uniforms,
});

const materialFolder = gui.addFolder("Material");
materialFolder.addColor(material, "color");
materialFolder.add(material, "metalness", 0, 1, 0.01);
materialFolder.add(material, "roughness", 0, 1, 0.01);
materialFolder.add(material, "wireframe");

mergeGeometry.computeTangents();

// Mesh
const mesh = new THREE.Mesh(mergeGeometry, material);
scene.add(mesh);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 10);
pointLight.position.set(2, 3, 4);
scene.add(pointLight);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.z = 3;
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Animation Loop
const clock = new THREE.Clock();

const tick = () => {
  // Update uniforms
  uniforms.uTime.value = clock.getElapsedTime();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
