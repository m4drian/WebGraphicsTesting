import * as BABYLON from 'babylonjs';

export function loadBabylonBenchmark(canvas) {
  // Load the 3D engine
  const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

  // Create a basic BJS Scene object
  const scene = new BABYLON.Scene(engine);

  // Create a FreeCamera and set its position
  const camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), scene);
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.attachControl(canvas, false);

  // Create a cube mesh
  const box = BABYLON.MeshBuilder.CreateBox("myBox", { size: 2 }, scene);

  // Rotate the box on every frame update
  scene.registerBeforeRender(() => {
    box.rotation.x += 0.01; // Adjust the value to control rotation speed
    box.rotation.y += 0.02;
  });

  // Resize handler
  window.addEventListener('resize', () => {
    engine.resize();
  });

  return scene; // Return the created scene
  }