import * as THREE from 'three';
import { MeshNormalNodeMaterial } from 'three/nodes';
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';

function initGeometries() {
  const geometry = new THREE.SphereGeometry(1, 32, 16);//THREE.ConeGeometry(1, 2, 32, 16);// THREE.SphereGeometry(1, 32, 16); // can add more geometries
  return geometry;
}

function createMaterial() {
  const material = new MeshNormalNodeMaterial(); // Unlit material based on normals
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

function setupRenderer(myCanvas, selectWebGL) {
    const renderer = new WebGPURenderer( { canvas: myCanvas, antialias: true, forceWebGL: selectWebGL } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( 1440, 810 );
    document.body.appendChild(renderer.domElement);
    return renderer;
}

function animate(scene, camera, renderer, rendererType, stats0) {
  function render() {
    requestAnimationFrame(render);

    //renderer.clearAsync();

    // Update object rotations (assuming you want this)
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const rotationSpeed = randomizeRotationSpeed();
        object.rotation.x += rotationSpeed.x;
        object.rotation.y += rotationSpeed.y;
        object.rotation.z += rotationSpeed.z;
      }
    });

    renderer.renderAsync(scene, camera);

    stats0.update();
    //stats1.update();
    //stats2.update();
  }

  render();
}

export function loadGeometryBenchmark2(myCanvas, rendererType, stats0) {
  const scene = setupScene();
  const camera = setupCamera();
  let renderer = null;

  if (rendererType === 'webgl') {
    console.info('WebGL selected');
    renderer = setupRenderer(myCanvas, true);
  } else {
    console.info('WebGPU selected');
    renderer = setupRenderer(myCanvas, false);
  }

  const geometry = initGeometries();
  const numObjects = 50; // Number of objects to create
  initMesh(scene, geometry, numObjects);

  animate(scene, camera, renderer, rendererType, stats0);
}
