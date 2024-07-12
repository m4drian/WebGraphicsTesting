import * as BABYLON from '@babylonjs/core';
import * as BabylonMaterials from '@babylonjs/materials';

console.log(BABYLON)

async function createEngine(canvas, rendererType) {
  if (rendererType === 'webgl') {
    console.info('WebGL selected');
    return new BABYLON.Engine(canvas, true);
  } else if (rendererType === 'webgpu') {
    console.info('WebGPU selected');
    const engine = new BABYLON.WebGPUEngine(canvas);
    await engine.initAsync();
    return engine;
  } else {
    console.warn('Unsupported renderer type:', rendererType);
    return null;
  }
}

export function loadBabylonBenchmark(canvas, rendererType) {
  // Load the 3D engine
  createEngine(canvas, rendererType)
    .then(engine => {
      if (engine) {
        const scene = new BABYLON.Scene(engine);

        const camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvas, false);
      
        const box = BABYLON.MeshBuilder.CreateBox("box", { size: 2 }, scene);
      
        // Rotate the box on every frame update
        scene.registerBeforeRender(() => {
          box.rotation.x += 0.0001;
          box.rotation.y += 0.0002;
        });
      
        //const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
      
        // Resize handler
        /*window.addEventListener('resize', () => {
          engine.resize();
        });*/
      
        //const emissive = scene.getTextureByName("BoomBox_Mat (Normal)");
        var normalMaterial = new BabylonMaterials.NormalMaterial("normalMat", scene);
        box.material = normalMaterial;
        box.material.disableLighting = true; //unlit material
      
        engine.runRenderLoop(() => {
          scene.render();
        })
      
        return scene;
      }
    })
    .catch(error => {
      console.error('Error creating engine:', error);
    });
}