import * as THREE from 'three';
//import { BatchedMesh } from 'three/src/objects/BatchedMesh.js';
import { MeshNormalNodeMaterial } from 'three/nodes';
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';

//find object amount that caps benchmark, do it 3 more times
//100, 1000, 10000, x2, x3, x5
let NUM_OBJECTS = 100;
let T_DELAY = 6000;
let T_TIME = 12000;

function initGeometries() {
  const geometries = [
    //geometries with similar number of triangles
    new THREE.ConeGeometry( 0.06, 0.06, 40 ), //tris: 80
		new THREE.BoxGeometry( 0.06, 0.06, 0.06, 2, 2, 1 ), //tris: 84
		new THREE.SphereGeometry( 0.06, 8, 6 ), //tris: 80
  ];
  return geometries;
}

function createMaterial() {
  const material = new MeshNormalNodeMaterial(); // Unlit material based on normals
  return material;
}

function initMeshes(scene, geometries, numObjects) {
  const material = createMaterial();

  // batching meshes
  const geometryCount = numObjects;
  const vertexCount = geometries.length * 512;
  const indexCount = geometries.length * 1024;

  const batchedMesh = new THREE.BatchedMesh(geometryCount, vertexCount, indexCount, material);
  console.info(batchedMesh);
  console.info(batchedMesh.constructor.name);

  const geometryIds = [];
  for (let i = 0; i < geometries.length; i++) {
    geometryIds.push(batchedMesh.addGeometry(geometries[i]));
  }

  const boxRadius = 10;
  for (let i = 0; i < numObjects; i++) {
    const geometryId = geometryIds[i % geometries.length];
    const instanceId = batchedMesh.addInstance(geometryId);

    // Set the instance's position using a matrix
    const angle = i * (Math.PI * 2) / numObjects;
    const position = new THREE.Vector3(Math.cos(angle) * boxRadius,Math.random() * 5.5 + 3,Math.sin(angle) * boxRadius);
    //Math.random() * 200 - 105, Math.random() * 110 - 55, Math.random() * 100 - 80);
    const matrix = new THREE.Matrix4();
    matrix.makeTranslation(position.x, position.y, position.z);
    batchedMesh.setMatrixAt(instanceId, matrix);

    // old regular mesh creation
    //const newMesh = new THREE.Mesh(geometries[i%3], material);
    //instanceId.frustumCulled = false; // disabled for benchmark consistency
    //instanceId.position.x = Math.random() * 200 - 105;
    //instanceId.position.y = Math.random() * 110 - 55;
    //instanceId.position.z = Math.random() * 100 - 80;
    //scene.add(newMesh);
  }
  batchedMesh.frustumCulled = false;

  //adding plane
  //const plane = new THREE.Mesh(new THREE.PlaneGeometry(25,25), material);
  //plane.rotation.x = -Math.PI / 2;
  //plane.position.y = -1;

  scene.add(batchedMesh);
  //scene.add(plane);
}

function setupScene() {
  let scene = new THREE.Scene();
  scene.background = new THREE.Color("#0d0c18");
  return scene;
}

function setupCamera() {
  let camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);
  camera.position.set(1, 12, 14);
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

let fps = 0.0;
async function animate(scene, camera, renderer, statsGL, time, benchmarkData) {
  //renderer.clearAsync();

  // gathering performance metrics
  time = (performance || Date).now();
  if (time >= statsGL.prevTime + 1000) {
    fps = (statsGL.frames * 1000) / (time - statsGL.prevTime);
    benchmarkData.push(fps);
  }
  statsGL.update();

  // Update object rotations
  scene.traverse((object) => {
    if (object instanceof THREE.BatchedMesh) {
      //const rotationSpeed = randomizeRotationSpeed();
      //object.rotation.x += rotationSpeed.x;
      object.rotation.y += fps * 0.00005;
      //object.rotation.z += rotationSpeed.z;
    }
  });

  await renderer.renderAsync(scene, camera);
}

export function loadNormalsThree(rendererType, statsGL, benchmarkData) {
  // canvas
  let canvas = document.createElement('canvas');
  canvas.width = 1440;
  canvas.height = 810;
  canvas.id = "mycanvas";
  document.body.appendChild(canvas);

  // loader
  ///const loadingManager = new THREE.LoadingManager();
  //const textureLoader = new THREE.TextureLoader(loadingManager);
  //const texDiffuse = textureLoader.load('scripts/benchmarks/textures/hedge03Diffuse2k.jpg');
  //const texNormal = textureLoader.load('scripts/benchmarks/textures/hedge03normal2k.jpg');

  // benchmark
  let scene = setupScene();
  let camera = setupCamera();
  let renderer = setupRenderer( canvas, rendererType );

  const geometries = initGeometries();
  const numObjects = NUM_OBJECTS; // Number of objects to create
  initMeshes( scene, geometries, numObjects );

  //lazy delay implementation so everything loads properly (important for WebGL)
  let shouldRender = false;
  let delay = T_DELAY/3;
  if (rendererType == 'webgl')
  {
    delay = T_DELAY;
  }

  setTimeout(() => {
    console.info('benchmark started');
    shouldRender = true;

    // stats
    statsGL.init( renderer );

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
    }, T_TIME);
  }, delay);

  // animate
  renderer.renderAsync(scene, camera); // loading first frame before benchmark starts
  let time = (performance || Date).now();
  renderer.setAnimationLoop(() => {
    if (shouldRender) {
      animate( scene, camera, renderer, statsGL, time, benchmarkData )
    }
  });
}
