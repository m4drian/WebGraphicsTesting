import * as THREE from 'three';
import { MeshNormalNodeMaterial } from 'three/nodes';
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';

function initGeometries() {
  const geometries = [
    //geometries with similar amount of vertices and tris - verts:482, Tris: ~~960
    new THREE.SphereGeometry(1, 32, 16),
    new THREE.ConeGeometry(1, 2, 32, 16),
  ];
  return geometries;
}

function createMaterial() {
  const material = new MeshNormalNodeMaterial(); // Unlit material based on normals
  return material;
}

function initMeshes(scene, geometries, numObjects) {
  const material = createMaterial();
  const mesh = new THREE.Mesh(geometries[1], material);

  for (let i = 0; i < numObjects; i++) {
    const newMesh = mesh.clone();
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
  let scene = new THREE.Scene();
  scene.background = new THREE.Color("#0d0c18");
  return scene;
}

function setupCamera() {
  let camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);
  camera.position.set(1, 1, 100);
  camera.lookAt(0, 0, 0);
  return camera;
}

function setupRenderer(myCanvas, rendererType) {
  console.info(rendererType ,'selected');

  let selectWebGL = false;
  if (rendererType === 'webgl') {
    selectWebGL = true;
  }

  let renderer = null;
  // in this example WebGPU automatically sets alpha setting to "premultiplied" if true and "opaque" if false
  // WebGL has premultipliedAlpha set to true by default
  renderer = new WebGPURenderer( { 
    canvas: myCanvas, 
    antialias: false, 
    forceWebGL: selectWebGL, 
    stencil: false, 
    depth: false, 
    alpha: true, 
    powerPreference: "high-performance" 
  } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( 1440, 810 );
  return renderer;
}

async function animate(scene, camera, renderer, statsGL, time, benchmarkData) {
  //renderer.clearAsync();

  // Update object rotations
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      const rotationSpeed = randomizeRotationSpeed();
      object.rotation.x += rotationSpeed.x;
      object.rotation.y += rotationSpeed.y;
      object.rotation.z += rotationSpeed.z;
    }
  });

  await renderer.renderAsync(scene, camera);

  // gathering performance metrics
  time = (performance || Date).now();
  if (time >= statsGL.prevTime + 1000) {
    const fps = (statsGL.frames * 1000) / (time - statsGL.prevTime);
    benchmarkData.push(fps);
  }
  statsGL.update();
}

export function loadGeometryBenchmark2(rendererType, statsGL, benchmarkData) {
  // canvas
  let canvas = document.createElement('canvas');
  canvas.width = 1440;
  canvas.height = 810;
  canvas.id = "mycanvas";
  document.body.appendChild(canvas);

  // benchmark
  let scene = setupScene();
  let camera = setupCamera();
  let renderer = setupRenderer( canvas, rendererType );

  const geometries = initGeometries();
  const numObjects = 800; // Number of objects to create
  initMeshes( scene, geometries, numObjects );

  // stats
  statsGL.init( renderer );

  // animate
  let time = (performance || Date).now();
  renderer.setAnimationLoop(() => animate( scene, camera, renderer, statsGL, time, benchmarkData ));

  // cleanup
  setTimeout(() => {
    console.info('benchmark stopped');
    let cpuLogs = statsGL.averageCpu.logs;
    renderer.setAnimationLoop( null) ; 
    scene = null;
    camera = null;
    renderer.dispose();
    renderer = null;
    document.body.removeChild( canvas );

    // printing performance metrics
    let csvContent = 'cpu,\n';
    cpuLogs.forEach(dataPoint => 
      {csvContent += dataPoint + ',\n'
    });
    csvContent += 'fps,\n';
    benchmarkData.forEach(dataPoint => 
      {csvContent += dataPoint + ',\n'
    });
    const dataElement = document.getElementById('benchmarkData');
    dataElement.value = csvContent;
}, 10000);
}
