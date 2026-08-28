import "./style.css";
import * as THREE from "three";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import { Text } from "troika-three-text";
import vertexShader from "./shaders/vertex.glsl";
import textVertex from "./shaders/textVertex.glsl";
import gsap from "gsap";

const blobs = [
  {
    name: "Color Fusion",
    background: "#9D73F7",
    config: {
      uPositionFrequency: 1,
      uPositionStrength: 0.3,
      uSmallWavePositionFrequency: 0.5,
      uSmallWavePositionStrength: 0.7,
      roughness: 0.8,
      metalness: 0.1,
      envMapIntensity: 0.4,
      clearcoat: 0,
      clearcoatRoughness: 0,
      transmission: 0,
      flatShading: false,
      wireframe: false,
      map: "cosmic-fusion",
    },
  },
  {
    name: "Purple Mirror",
    background: "#5300B1",
    config: {
      uPositionFrequency: 0.584,
      uPositionStrength: 0.276,
      uSmallWavePositionFrequency: 0.899,
      uSmallWavePositionStrength: 1.266,
      roughness: 0.15,
      metalness: 0.5,
      envMapIntensity: 0.4,
      clearcoat: 0.2,
      clearcoatRoughness: 0,
      transmission: 0,
      flatShading: false,
      wireframe: false,
      map: "purple-rain",
    },
  },
  {
    name: "Alien Goo",
    background: "#45ACD8",
    config: {
      uPositionFrequency: 1.022,
      uPositionStrength: 0.99,
      uSmallWavePositionFrequency: 0.378,
      uSmallWavePositionStrength: 0.341,
      roughness: 0.3,
      metalness: 0.3,
      envMapIntensity: 0.4,
      clearcoat: 0.4,
      clearcoatRoughness: 0.5,
      transmission: 0,
      flatShading: false,
      wireframe: false,
      map: "lucky-day",
    },
  },
];

let isAnimating = false;
let currIdx = 0;

// Canvas
const canvas =
  document.querySelector("canvas.webgl") || document.createElement("canvas");
if (!canvas.classList.contains("webgl")) {
  canvas.classList.add("webgl");
  document.body.appendChild(canvas);
}

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("#9D73F7"); //default initial color

// Uniforms
const uniforms = {
  uTime: { value: 0 },
  uPositionStrength: { value: blobs[currIdx].config.uPositionStrength },
  uPositionFrequency: { value: blobs[currIdx].config.uPositionFrequency },
  uTimeFrequency: { value: 0.7 },
  uSmallWavesPositionFrequency: {
    value: blobs[currIdx].config.uSmallWavePositionFrequency,
  },
  uSmallWavesTimeFrequency: { value: 0.7 },
  uSmallWavesPositionStrength: {
    value: blobs[currIdx].config.uSmallWavePositionStrength,
  },
};

// Geometry
const mergeGeometry = new mergeVertices(new THREE.IcosahedronGeometry(1, 90));

// Texture Loader Helper
const textureLoader = new THREE.TextureLoader();
const loadTexture = (name) => {
  const tex = textureLoader.load(`/${name}.png`);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
};

// Material
const material = new CustomShaderMaterial({
  baseMaterial: THREE.MeshPhysicalMaterial,
  // color: 0x00ffcc,
  metalness: blobs[currIdx].config.metalness,
  roughness: blobs[currIdx].config.roughness,
  map: loadTexture(blobs[currIdx].config.map),
  vertexShader,
  uniforms,
});

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

// TEXT MATERIAL
const textMaterial = new THREE.ShaderMaterial({
  vertexShader: textVertex,
  fragmentShader: `void main() {gl_FragColor = vec4(1.0);}`,
  side: THREE.DoubleSide,
  uniforms: {
    progress: { value: 0 },
    direction: { value: 1 },
  },
});

const texts = blobs.map((blob, index) => {
  const myText = new Text();
  myText.text = blob.name;
  myText.material = textMaterial;
  myText.fontSize = window.innerWidth / 5000;
  myText.color = blob.color;
  if (index !== 0) myText.scale.set(0, 0, 0);
  myText.position.set(0, 0, 2);
  myText.letterSpacing = -0.06;
  myText.anchorX = "center";
  myText.anchorY = "middle";
  myText.glyphGeometryDetail = 20;
  scene.add(myText);
  myText.sync();
  scene.add(myText);
  return myText; //returned so later on we can animate it.
});

// Loading Manager
const loadingManager = new THREE.LoadingManager();

// Environment Map (HDR)
// const rgbeLoader = new RGBELoader(loadingManager);
// rgbeLoader.load("./garden.hdr", (texture) => {
//   texture.mapping = THREE.EquirectangularReflectionMapping;
//   // scene.background = texture;
//   // scene.environment = texture;
// });

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

// Update blob config helper function
const updateBlobConfig = (config) => {
  if (config.uPositionFrequency !== undefined)
    gsap.to(uniforms.uPositionFrequency, {
      value: config.uPositionFrequency,
      duration: 2,
      ease: "power2.inOut",
    });
  if (config.uPositionStrength !== undefined)
    gsap.to(uniforms.uPositionStrength, {
      value: config.uPositionStrength,
      duration: 2,
      ease: "power2.inOut",
    });
  if (config.uSmallWavePositionFrequency !== undefined)
    gsap.to(uniforms.uSmallWavesPositionFrequency, {
      value: config.uSmallWavePositionFrequency,
      duration: 2,
      ease: "power2.inOut",
    });
  if (config.uSmallWavePositionStrength !== undefined)
    gsap.to(uniforms.uSmallWavesPositionStrength, {
      value: config.uSmallWavePositionStrength,
      duration: 2,
      ease: "power2.inOut",
    });

  if (config.roughness !== undefined)
    gsap.to(material, {
      roughness: config.roughness,
      duration: 2,
      ease: "power2.inOut",
    });
  if (config.metalness !== undefined)
    gsap.to(material, {
      metalness: config.metalness,
      duration: 2,
      ease: "power2.inOut",
    });
  if (config.envMapIntensity !== undefined)
    gsap.to(material, {
      envMapIntensity: config.envMapIntensity,
      duration: 2,
      ease: "power2.inOut",
    });
  if (config.clearcoat !== undefined)
    gsap.to(material, {
      clearcoat: config.clearcoat,
      duration: 2,
      ease: "power2.inOut",
    });
  if (config.clearcoatRoughness !== undefined)
    gsap.to(material, {
      clearcoatRoughness: config.clearcoatRoughness,
      duration: 2,
      ease: "power2.inOut",
    });
  if (config.transmission !== undefined)
    gsap.to(material, {
      transmission: config.transmission,
      duration: 2,
      ease: "power2.inOut",
    });

  if (config.flatShading !== undefined) {
    material.flatShading = config.flatShading;
    material.needsUpdate = true;
  }
  if (config.wireframe !== undefined) {
    material.wireframe = config.wireframe;
  }

  if (config.map !== undefined) {
    textureLoader.load(`/${config.map}.png`, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      console.log("CURRENT TEXTURE", config.map);
      material.map = texture;
      material.needsUpdate = true;
    });
  }
};

// Wheel Limiter

window.addEventListener("wheel", (e) => {
  if (isAnimating) return;
  isAnimating = true;
  let direction = Math.sign(e.deltaY);
  let next = (currIdx + direction + blobs.length) % blobs.length;
  console.log("Ranned", next);

  // TODO Add scrollTrigger with pin so hold in scroll will make text pause in middle of transition, and scroll down will reverse it. for better UX. (I know scrollTrigger, but applying it here is little different than normal one.)

  // Swirlling logic
  gsap.to(textMaterial.uniforms.progress, {
    value: 0.5,
    duration: 2,
    onComplete: () => {
      isAnimating = false;
      textMaterial.uniforms.progress.value = 0.0;
      currIdx = next;
    },
  });

  // TODO: use timeline to run swirl and shift at the same time, and to get next text slide in too in the same time only.
  // Movement logic
  texts[next].scale.set(1, 1, 1);
  texts[next].position.x = direction * 3;

  gsap.to(texts[currIdx].position, {
    x: -direction * 3,
    duration: 2,
    ease: "power2.inOut",
  });
  gsap.to(texts[next].position, {
    x: 0,
    duration: 2,
    ease: "power2.inOut",
  });

  const bg = new THREE.Color(blobs[next].background);
  gsap.to(scene.background, {
    r: bg.r,
    g: bg.g,
    b: bg.b,
    duration: 2,
    ease: "linear",
  });

  // Update blob uniforms and material properties for next blob
  updateBlobConfig(blobs[next].config);
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

// Studio Environment Lighting (Neutral reflections without background photos)
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(
  new RoomEnvironment(),
  0.04,
).texture;

// Controls
// const controls = new OrbitControls(camera, canvas);
// controls.enableDamping = true;

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
