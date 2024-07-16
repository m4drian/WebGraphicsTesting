import * as BABYLON from '@babylonjs/core';
//import * as BabylonMaterials from '@babylonjs/materials';

const NUM_BOXES = 700;
const NUM_LIGHTS = 6; //shouldnt exceed 6 for this example
let T_TIME = 12000;

async function createEngine(canvas, rendererType) {
  if (rendererType === 'webgl') {
    console.info('WebGL selected');
    const engine = new BABYLON.Engine(canvas, false, {
      antialias: false, 
      stencil: false, 
      depth: true, 
      alpha: true, 
      premultipliedAlpha: true, 
      preserveDrawingBuffer: false, 
      powerPreference: "high-performance"});
    return engine
  } else if (rendererType === 'webgpu') {
    console.info('WebGPU selected');
    const engine = new BABYLON.WebGPUEngine(canvas, {
      antialias: false, 
      stencil: false, 
      depth: true, 
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

function setupLight(scene, position, color, material){
  const light = new BABYLON.SpotLight("light", position, new BABYLON.Vector3(0, -1, 0), Math.PI / 1.7, 2, scene);
  light.intensity = 1.6;
  light.diffuse = color;
  light.specular = new BABYLON.Color3(0.2, 0.2, 0.2);
  light.shadowEnabled = true;
  light.shadowMinZ = 0;
  light.shadowMaxZ = 15;
  light.alwaysSelectAsActiveMesh = true;
  let shadowGenerator = new BABYLON.ShadowGenerator(2048, light);

  const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.25}, scene);
  sphere.material = material
  sphere.position = light.position;
  sphere.material.disableLighting = true;
  sphere.alwaysSelectAsActiveMesh = true;
  //return [light, sphere];
  return { light, sphere, shadowGenerator };
}

function setupBoxes(scene, position, material){
  const box = BABYLON.MeshBuilder.CreateBox("box", { size: 0.06 }, scene);
  box.position = position;
  box.receiveShadows = true;
  box.material = material;
  box.alwaysSelectAsActiveMesh = true; //intentionally drawing all meshes
  return box;
}

export function lightsBabylon(rendererType, statsGL, benchmarkData) {
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

        var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 4, 16, BABYLON.Vector3.Zero(), scene);
        //camera.setTarget(BABYLON.Vector3.Zero());
        camera.detachControl();
        //camera.attachControl(canvas, true);

        // material colors
        const mats = [
          new BABYLON.Color3(1, 1, 0),
          new BABYLON.Color3(1, 0, 1),
          new BABYLON.Color3(0, 1, 1),
          new BABYLON.Color3(1, 1, 1),
          new BABYLON.Color3(0.6, 0.6, 0.6)
        ]

        const lightColors = [
          new BABYLON.Color3(0.8, 0.1, 0.1), //red
          new BABYLON.Color3(0.1, 0.8, 0.1), //green
          new BABYLON.Color3(0.1, 0.1, 0.8), //blue
          new BABYLON.Color3(1, 1, 1) //white
        ]

        const materials = [
          new BABYLON.StandardMaterial("redMat", scene),
          new BABYLON.StandardMaterial("greenMat", scene),
          new BABYLON.StandardMaterial("blueMat", scene),
          new BABYLON.StandardMaterial("whiteMat", scene)
        ]

        materials[0].emissiveColor = lightColors[0];
        materials[1].emissiveColor = lightColors[1];
        materials[2].emissiveColor = lightColors[2];
        materials[3].emissiveColor = lightColors[3];
        
        // lights
        const numLights = NUM_LIGHTS;
        const lights = [];
        const lightRadius = 4;

        for (let i = 0; i < numLights; i++) {
          const angle = i * (Math.PI * 2) / numLights;
          const position = new BABYLON.Vector3(Math.cos(angle) * lightRadius, 4, Math.sin(angle) * lightRadius);
          const color = lightColors[i % lightColors.length];//new BABYLON.Color3(Math.random(), Math.random(), Math.random());
          const material = materials[i % materials.length]; // Reuse materials

          const lightData = setupLight(scene, position, color, material);
          lights.push(lightData);
        }
      
        // box
        var material1 = new BABYLON.StandardMaterial("standardMat", scene);
        material1.diffuseColor = mats[4];
        material1.specularColor = mats[4];
        material1.ambientColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        const diffuseTex = new BABYLON.Texture("scripts/benchmarks/textures/hedge03Diffuse2k.jpg", scene);
        material1.diffuseTexture = diffuseTex;
        material1.bumpTexture = new BABYLON.Texture("scripts/benchmarks/textures/hedge03normal2k.jpg", scene);
        material1.emissiveTexture = diffuseTex;
        material1.emissiveIntensity = 0.3;
        material1.maxSimultaneousLights = numLights;

        let boxes = [];
        const numBoxes = NUM_BOXES;
        const boxRadius = 2.9;
        for (let i = 0; i < numBoxes; i++) {
          const angle = i * (Math.PI * 2) / numBoxes;
          const position = new BABYLON.Vector3(Math.cos(angle) * boxRadius, Math.random() * 2.5 + 0.2, Math.sin(angle) * boxRadius);

          const boxData = setupBoxes(scene, position, material1);
          boxes.push(boxData);
        }

        const box = BABYLON.MeshBuilder.CreateBox("box", { size: 0.9 }, scene);
        box.position = new BABYLON.Vector3(0, 1, 0);
        box.receiveShadows = true;
        box.material = material1;
        //box.material.disableLighting = true; //unlit material

        // Rotate the box on every frame update
        scene.registerBeforeRender(() => {
          box.rotation.x += 0.0032;
          box.rotation.y += 0.0016;
        });

        //Rotate boxes
        scene.registerBeforeRender(() => {
          for (let i = 0; i < boxes.length; i++) {
            boxes[i].rotation.x += 0.004;
            boxes[i].rotation.y += 0.008;
          }
        });

        // ground
        var groundMat = new BABYLON.StandardMaterial("groundMat", scene);
        groundMat.diffuseColor = mats[4];
        groundMat.specularColor = mats[4];
        groundMat.ambientColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        groundMat.maxSimultaneousLights = numLights;
      
        const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 14, height: 14}, scene);	
        ground.material = groundMat;
        ground.receiveShadows = true;

        lights.forEach((sg) => {
          sg.shadowGenerator.addShadowCaster(box);
          boxes.forEach((x) => {sg.shadowGenerator.addShadowCaster(x);})
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

          //cleanup
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