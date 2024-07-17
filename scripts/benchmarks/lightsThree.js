import * as THREE from 'three';
import { MeshPhongNodeMaterial, MeshBasicNodeMaterial } from 'three/nodes';
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';

const NUM_OBJECTS = 20;
const NUM_LIGHTS = 14;
const T_DELAY = 12000;
const T_TIME = 12000;
const USE_TEXTURES = false;

let fps = 0.0;

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
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;
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

function createMaterial(texDiffuse, texNormal, color = 0x777777, shininess = 0.05, specular = 0x222222) {
  let material = new MeshPhongNodeMaterial({
    color: color,
    shininess: shininess,
    specular: specular,
    map: texDiffuse || null,
    normalMap: texNormal || null
  } );
  material.castShadow = true;
  return material;
}

function initMeshes(scene, geometries, numObjects, texDiffuse, texNormal) {

  let tex1 = null;
  let tex2 = null;
  if(USE_TEXTURES){
    tex1 = texDiffuse;
    tex2 = texNormal;
  }
  const material = createMaterial(tex1, tex2, 0xFFFFFF, 0.5, 0x666666);
  const material2 = createMaterial(tex1, tex2, 0x666666, 0.01, 0x222222);

  //group to make rotation easier
  //const group = new THREE.Group();
  //group.userData.id = 3;
  //group.name = "boxGroup";

  // regular mesh creation
  const boxRadius = 6;
  for (let i = 0; i < numObjects; i++) {
    const angle = i * (Math.PI * 2) / numObjects;
    const newMesh = new THREE.Mesh(geometries[i%3], material);
    newMesh.frustumCulled = false; // disabled for benchmark consistency
    newMesh.position.set(
      Math.cos(angle) * boxRadius,
      Math.random() * 2.5 + 0.5,
      Math.sin(angle) * boxRadius
    );
    newMesh.castShadow = true;
    newMesh.userData.id = 3;
    //newMesh.receiveShadow = true;
    //group.add(newMesh);
    newMesh.center
    scene.add(newMesh);
  }
  //scene.add(group);

  // batching meshes
  /*const geometryCount = numObjects;
  const vertexCount = geometries.length * 512;
  const indexCount = geometries.length * 1024;

  const batchedMesh = new THREE.BatchedMesh(geometryCount, vertexCount, indexCount, material);
  console.info(batchedMesh);
  console.info(batchedMesh.constructor.name);

  const geometryIds = [];
  for (let i = 0; i < geometries.length; i++) {
    geometryIds.push(batchedMesh.addGeometry(geometries[i]));
  }

  const boxRadius = 4;
  for (let i = 0; i < numObjects; i++) {
    const geometryId = geometryIds[i % geometries.length];
    const instanceId = batchedMesh.addInstance(geometryId);

    // Set the instance's position using a matrix
    const angle = i * (Math.PI * 2) / numObjects;
    const position = new THREE.Vector3(
      Math.cos(angle) * boxRadius,
      Math.random() * 2.5 + 0.5,
      Math.sin(angle) * boxRadius);
    const matrix = new THREE.Matrix4();
    matrix.makeTranslation(position.x, position.y, position.z);
    batchedMesh.setMatrixAt(instanceId, matrix);
  }
  batchedMesh.frustumCulled = false;
  batchedMesh.castShadow = true;
  parentObject.add(batchedMesh);

  scene.add(batchedMesh);*/

  // plane
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(90,90), material2);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -0.7;
  plane.userData.id = 1;
  plane.receiveShadow = true;
  plane.castShadow = true;
  plane.frustumCulled = false;

  scene.add(plane);
}

function initLights(scene) {
  const numLights = NUM_LIGHTS;
  const lightRadius = 7;
  const lightHeight = 6;

  const lightColors = [
    new THREE.Color(1, 0, 0), // red
    new THREE.Color(0, 1, 0), // green
    new THREE.Color(0, 0, 1), // blue
    //new THREE.Color(1, 1, 1) // white
  ];

  for (let i = 0; i < numLights; i++) {
    const angle = i * (Math.PI * 2) / numLights;
    const light = new THREE.SpotLight( lightColors[i%lightColors.length], 100 );
    light.position.set(
      Math.cos(angle) * lightRadius, 
      lightHeight, 
      Math.sin(angle) * lightRadius
    );
    light.angle = Math.PI / 3.5;
    light.penumbra = 0.1;
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 200;
    light.shadow.bias = 0.002;
    light.shadow.radius = 4;
    //light.shadow.camera.fov = 30;
    const targetObject = new THREE.Object3D();
    targetObject.position.set(light.position.x, lightHeight-100, light.position.y);
    scene.add(targetObject);
    light.target = targetObject;

    const newMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.2,0.2,0.2), 
      new MeshBasicNodeMaterial({color: lightColors[i%lightColors.length]})
    );
    newMesh.position.set(
      Math.cos(angle) * lightRadius, 
      lightHeight, 
      Math.sin(angle) * lightRadius);
    newMesh.userData.id = 1;
    scene.add(newMesh);
    scene.add(light);
  }
}

function setupScene() {
  let scene = new THREE.Scene();
  scene.background = new THREE.Color("#0d0c18");
  scene.fog = new THREE.Fog( 0x222244, 5, 100 );
  return scene;
}

function setupCamera() {
  let camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);
  camera.position.set(0, 13, 13);
  camera.lookAt(0, 0, 0);
  camera.userData.id = 2;
  return camera;
}

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
    if (/*(object instanceof THREE.Mesh && object.userData.id != 1) || */object.userData.id === 3) {
      object.rotation.x += fps * 0.00005;
      object.rotation.y += fps * 0.0001;
      //object.rotateY(fps * 0.00005);
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
  const loadingManager = new THREE.LoadingManager();
  const textureLoader = new THREE.TextureLoader(loadingManager);
  const texDiffuse = textureLoader.load('scripts/benchmarks/textures/hedge03Diffuse1k.jpg');
  const texNormal = textureLoader.load('scripts/benchmarks/textures/hedge03normal1k.jpg');

  // benchmark
  let scene = setupScene();
  let camera = setupCamera();
  let renderer = setupRenderer( canvas, rendererType );

  // geometries
  const geometries = initGeometries();
  const numObjects = NUM_OBJECTS; // Number of objects to create
  initMeshes( scene, geometries, numObjects, texDiffuse, texNormal );

  // lights
  initLights(scene);

  //lazy delay implementation so everything loads properly (mostly for WebGL)
  let shouldRender = false;
  let delay = T_DELAY/3;
  if (rendererType == 'webgl')
  {
    delay = T_DELAY;
  }

  setTimeout(() => {
    console.info('benchmark started');
    shouldRender = true;
    camera.updateProjectionMatrix();

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
