import * as BABYLON from '@babylonjs/core';
import * as BabylonMaterials from '@babylonjs/materials';

async function createEngine(canvas, rendererType) {
  if (rendererType === 'webgl') {
    console.info('WebGL selected');
    const engine = new BABYLON.Engine(canvas, false, {antialias: false, stencil: false, depth: false, alpha: true, premultipliedAlpha: true, preserveDrawingBuffer: false});
    return engine
  } else if (rendererType === 'webgpu') {
    console.info('WebGPU selected');
    const engine = new BABYLON.WebGPUEngine(canvas, {antialias: false, stencil: false, depth: false, alpha: true, premultipliedAlpha: true});
    await engine.initAsync();
    return engine;
  } else {
    console.warn('Unsupported renderer type:', rendererType);
    return null;
  }
}

export function loadBabylonBenchmark(rendererType, statsGL, benchmarkData) {
  console.log(BABYLON)

  let canvas = document.createElement('canvas');
  canvas.width = 1440;
  canvas.height = 810;
  canvas.id = "mycanvas";

  document.body.appendChild(canvas);

  // Load the 3D engine
  createEngine(canvas, rendererType)
    .then(engine => {
      if (engine) {
        let scene = new BABYLON.Scene(engine);

        const camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5, -10), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.detachControl();
        //camera.attachControl(canvas, true);
      
        const box = BABYLON.MeshBuilder.CreateBox("box", { size: 2 }, scene);
      
        // Rotate the box on every frame update
        scene.registerBeforeRender(() => {
          box.rotation.x += 0.0004;
          box.rotation.y += 0.0008;
        });
      
        //const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
      
        // Resize handler
        /*window.addEventListener('resize', () => {
          engine.resize();
        });*/
      
        var normalMaterial = new BabylonMaterials.NormalMaterial("normalMat", scene);
        box.material = normalMaterial;
        box.material.disableLighting = true; //unlit material

        let time = (performance || Date).now();
        engine.runRenderLoop(() => {
          scene.render();

          // gathering performance metrics
          time = (performance || Date).now();
          if (time >= statsGL.prevTime + 1000) {
            const fps = (statsGL.frames * 1000) / (time - statsGL.prevTime);
            benchmarkData.push(fps);
          }
          statsGL.update();
        })

        setTimeout(() => {
          console.info('benchmark stopped');
          let cpuLogs = statsGL.averageCpu.logs;
          engine.stopRenderLoop();
          scene.dispose();
          scene = null;
          engine.dispose();
          engine = null;
          document.body.removeChild(canvas);

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
      
        // stats
        statsGL.init( canvas );

        return scene;
      }
    })
    .catch(error => {
      console.error('Error creating engine:', error);
    });
}