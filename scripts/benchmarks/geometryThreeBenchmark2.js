import * as THREE from 'three';
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';
import { getMonochromaticColor, getRandomBaseColor } from '../colorScheme.js';

function initGeometries() {
  const geometry = new THREE.SphereGeometry(1, 32, 16); // can add more geometries
  return geometry;
}

function createMaterial() {
  const material = new THREE.MeshNormalNodeMaterial(); // Unlit material based on normals
  return material;
}

function initMesh(scene, geometry, numObjects) {
  const material = createMaterial();
  const mesh = new THREE.Mesh(geometry, material);

  for (let i = 0; i < numObjects; i++) {
    const newMesh = mesh.clone(); // Clone the base mesh for each object
    newMesh.position.x = Math.random() * 200 - 105;
    newMesh.position.y = Math.random() * 110 - 55;
    newMesh.position.z = Math.random() * 100 - 80;
    scene.add(newMesh);

    // color scheme
    newMesh.material.color = new THREE.Color(getMonochromaticColor(getRandomBaseColor(), 50));
  }
}

function randomizeRotationSpeed() {
  return new THREE.Vector3(Math.random() * 0.005, Math.random() * 0.01, 0); // Random rotation speed vector
}

function setupScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0d0c18");
    return scene;
}

function setupCamera() {
    const camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);
    camera.position.set(1, 1, 100);
    camera.lookAt(0, 0, 0);
    return camera;
}

function setupWebGLRenderer() {
    const renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( 1600, 900 );
    document.body.appendChild(renderer.domElement);
    return renderer;
}

function setupWebGPURenderer() {
    const renderer = new WebGPURenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( 1600, 900 );
    document.body.appendChild( renderer.domElement );
    return renderer;
}
function animate(scene, camera, renderer, rendererType, stats0, stats1, stats2) {
  function render() {
    requestAnimationFrame(render);

    if (rendererType === 'webgl') {
      renderer.clear();
    } else {
      renderer.clearAsync();
    }

    // Update object rotations (assuming you want this)
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.rotation.add(randomizeRotationSpeed()); // Apply random rotation speed
      }
    });

    if (rendererType === 'webgl') {
      renderer.render(scene, camera);
    } else {
      renderer.renderAsync(scene, camera);
    }

    stats0.update();
    stats1.update();
    stats2.update();
  }

  render();
}

export function loadGeometryBenchmark2(rendererType, stats0, stats1, stats2) {
  const scene = setupScene();
  const camera = setupCamera();
  let renderer = null;

  if (rendererType === 'webgl') {
    console.info('WebGL selected');
    renderer = setupWebGLRenderer();
  } else {
    console.info('WebGPU selected');
    renderer = setupWebGPURenderer();
  }

  const geometry = initGeometries();
  const numObjects = 5000; // Number of objects to create
  initMesh(scene, geometry, numObjects);

  animate(scene, camera, renderer, rendererType, stats0, stats1, stats2);
}
