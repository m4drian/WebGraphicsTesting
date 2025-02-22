import * as BABYLON from '@babylonjs/core';
import * as BabylonMaterials from '@babylonjs/materials';

//1000,2000,4000,6000,8000,10000
const NUM_BOXES = 10000;
const T_TIME = 24000;

async function createEngine(canvas, rendererType) {
  if (rendererType === 'webgl') {
    console.info('WebGL selected');
    const engine = new BABYLON.Engine(canvas, false, {
      antialias: false, 
      stencil: false, 
      depth: true, 
      alpha: true, 
      premultipliedAlpha: true, 
      preserveDrawingBuffer: true, 
      powerPreference: "high-performance"
    });
    return engine
  } else if (rendererType === 'webgpu') {
    console.info('WebGPU selected');
    const engine = new BABYLON.WebGPUEngine(canvas, {
      antialias: false, 
      stencil: false, 
      depth: false, 
      alpha: true, 
      premultipliedAlpha: true, 
      powerPreference: "high-performance"
    });
    // optimizations
    engine.compatibilityMode = false;
    await engine.initAsync();
    return engine;
  } else {
    console.warn('Unsupported renderer type:', rendererType);
    return null;
  }
}

function setupBoxes(scene, position, material){
  const box = BABYLON.MeshBuilder.CreateBox("box", { size: 0.04 }, scene);
  box.position = position;
  box.receiveShadows = true;
  box.material = material;
  box.alwaysSelectAsActiveMesh = true; //intentionally drawing all meshes
  return box;
}

export function loadBabylonBenchmark(rendererType, statsGL, benchmarkData) {
  benchmarkData = [];
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

        const camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 3, -8), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.detachControl();
        //camera.attachControl(canvas, true);
      
        const box = BABYLON.MeshBuilder.CreateBox("box", { size: 1.5 }, scene);
      
        // Rotate the box on every frame update
        scene.registerBeforeRender(() => {
          box.rotation.x += 0.016;
          box.rotation.y += 0.008;
        });
      
        //const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
      
        // Resize handler
        /*window.addEventListener('resize', () => {
          engine.resize();
        });*/
      
        var normalMaterial = new BabylonMaterials.NormalMaterial("normalMat", scene);
        box.material = normalMaterial;
        box.material.disableLighting = true; //unlit material

        //setup boxes with normal material
        let boxes = [];
        const userInputElement = document.getElementById("userNumber");
        const userNumber = parseFloat(userInputElement.value); // Convert to a number
        let numBoxes = NUM_BOXES;
        // Check if user entered a number and handle empty input
        if (isNaN(userNumber) || userNumber === "") {
          console.log("Using default value:", NUM_BOXES);
        } else {
          numBoxes = userNumber;
        }
        const boxRadius = 2.9;
        for (let i = 0; i < numBoxes; i++) {
          const angle = i * (Math.PI * 2) / numBoxes;
          const position = new BABYLON.Vector3(Math.cos(angle) * boxRadius, Math.random() * 1.5 - 0.75, Math.sin(angle) * boxRadius);

          const boxData = setupBoxes(scene, position, normalMaterial);
          boxes.push(boxData);
        }

        //Rotate boxes
        scene.registerBeforeRender(() => {
          for (let i = 0; i < boxes.length; i++) {
            boxes[i].rotation.x += 0.0006;
            boxes[i].rotation.y += 0.0012;
          }
        });

        // render loop
        scene.executeWhenReady(() => {
          //optimization
          engine.snapshotRendering = true;

          console.info('benchmark started');
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
            cpuLogs.forEach(dataPoint => {
              if(dataPoint != 0){
                csvContent += dataPoint + '\n'
              }
            });
            csvContent += 'fps\n';
            benchmarkData.forEach(dataPoint => 
              {csvContent += dataPoint + '\n'
            });
            const dataElement = document.getElementById('benchmarkData');
            dataElement.value = csvContent;
          }, T_TIME);
        
          // stats
          statsGL.init( canvas );
        });

        return scene;
      }
    })
    .catch(error => {
      console.error('Error creating engine:', error);
    });
}