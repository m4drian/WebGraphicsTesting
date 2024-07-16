import * as THREE from 'three';
import { MeshPhongNodeMaterial, MeshBasicNodeMaterial } from 'three/nodes';
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';

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
    stencil: true, 
    depth: true, 
    alpha: true, 
    powerPreference: "high-performance" 
  } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( 1440, 810 );
  //renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  return renderer;
}

function initGeometries() {
  const geometries = [
    //geometries with similar number of triangles
    new THREE.ConeGeometry( 0.2, 0.2, 40 ), //tris: 80
		new THREE.BoxGeometry( 0.2, 0.2, 0.2, 2, 2, 1 ), //tris: 84
		new THREE.SphereGeometry( 0.2, 8, 6 ), //tris: 80
  ];
  return geometries;
}

function createMaterial() {
  const material = new MeshPhongNodeMaterial({
    color: 0x999999,
    shininess: 0,
    specular: 0x222222
  } );
  material.castShadow = true;
  return material;
}

function initMeshes(scene, geometries, numObjects) {
  const material = createMaterial();

  //object to make rotation easier
  let parentObject = new THREE.Object3D();
  scene.add(parentObject);

  const boxRadius = 4;
  for (let i = 0; i < numObjects; i++) {
    const angle = i * (Math.PI * 2) / numObjects;
    const newMesh = new THREE.Mesh(geometries[i%3], material);
    newMesh.frustumCulled = false; // disabled for benchmark consistency
    newMesh.position.x = Math.cos(angle) * boxRadius;
    newMesh.position.y = Math.random() * 2.5 + 0.5;
    newMesh.position.z = Math.sin(angle) * boxRadius;
    newMesh.castShadow = true;
    //newMesh.receiveShadow = true;
    parentObject.add(newMesh);
    scene.add(newMesh);
  }

  //adding plane
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(25,25), material);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -0.5;
  plane.userData.id = 1;
  plane.receiveShadow = true;
  plane.castShadow = true;

  scene.add(plane);
}

function initLights(scene) {
  const numLights = 32; //shouldnt exceed 6
  const lightRadius = 7;
  const lightHeight = 6;

  const lightColors = [
    new THREE.Color(0.8, 0.1, 0.1), // red
    new THREE.Color(0.1, 0.8, 0.1), // green
    new THREE.Color(0.1, 0.1, 0.8), // blue
    new THREE.Color(1, 1, 1) // white
  ];

  for (let i = 0; i < numLights; i++) {
    const angle = i * (Math.PI * 2) / numLights;
    const light = new THREE.SpotLight( lightColors[i%4], 100 );
    light.position.set(Math.cos(angle) * lightRadius, lightHeight, Math.sin(angle) * lightRadius);
    //light.angle = Math.PI / 4;
    light.penumbra = 0.3;
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 8;
    light.shadow.camera.far = 200;
    light.shadow.bias = 0.002;
    light.shadow.radius = 4;
    //light.shadow.camera.fov = 30;
    const targetObject = new THREE.Object3D();
    targetObject.position.set(light.position.x, lightHeight-100, light.position.y);
    scene.add(targetObject);
    light.target = targetObject;

    const newMesh = new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.2), new MeshBasicNodeMaterial({color: lightColors[i%4]}));
    newMesh.position.set(Math.cos(angle) * lightRadius, lightHeight, Math.sin(angle) * lightRadius)
    scene.add(newMesh);
    scene.add(light);
  }
}

function setupScene() {
  let scene = new THREE.Scene();
  scene.background = new THREE.Color("#0d0c18");
  scene.fog = new THREE.Fog( 0x222244, 5, 29 );
  return scene;
}

function setupCamera() {
  let camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);
  camera.position.set(0, 13, 13);
  camera.lookAt(0, 0, 0);
  camera.userData.id = 2;
  return camera;
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
    if (object instanceof THREE.Mesh && object.userData.id != 1) {
      object.rotation.y += fps * 0.00005;//rotateY(fps * 0.00005);
    }
  });

  await renderer.renderAsync(scene, camera);
}

export function lightsThree(rendererType, statsGL, benchmarkData) {
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

  // geometries
  const geometries = initGeometries();
  const numObjects = 40; // Number of objects to create
  initMeshes( scene, geometries, numObjects );

  // lights
  initLights(scene);

  //lazy delay implementation so everything loads properly (important for WebGL)
  let shouldRender = false;

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
    }, 10000);
  }, 11000);

  // animate
  renderer.renderAsync(scene, camera); // loading first frame before benchmark starts
  let time = (performance || Date).now();
  renderer.setAnimationLoop(() => {
    if (shouldRender) {
      animate( scene, camera, renderer, statsGL, time, benchmarkData )
    }
  });
}
