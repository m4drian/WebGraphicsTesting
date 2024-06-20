// Import necessary modules
import * as THREE from 'three';
import * as WebGPU from 'three/addons/capabilities/WebGPU.js';
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';
import { getRandomBaseColor, getMonochromaticColor } from '../colorScheme.js';

// Function to set up the scene
function setupScene() {
    // Set up the scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0d0c18");
    return scene;
}

// Function to set up the camera
function setupCamera() {
    // Set up the camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(1, 1, 100);
    camera.lookAt(0, 0, 0);
    return camera;
}

// Function to set up WebGL renderer
function setupWebGLRenderer() {
    // Set up the renderer
    const renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( 2560, 1440 );//window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    return renderer;
}

// Function to set up WebGPU renderer
function setupWebGPURenderer() {

    // Set up the renderer
    const renderer = new WebGPURenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( 2560, 1440 );
    //renderer.setAnimationLoop( animate );
    document.body.appendChild( renderer.domElement );
    return renderer;
}

// Function to create gemetric objects and add them to the scene
function createGeometry(scene) {
    const geometry = new THREE.SphereGeometry( 1, 32, 16 );// verts:482, Edges: 992, Faces: 512, Tris: 960 //BoxGeometry(1, 1, 1);
    const NUM_OBJECTS = 10000;
    for (let i = 0; i < NUM_OBJECTS; i++) {
        const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: getMonochromaticColor(getRandomBaseColor(), 50) });
        const cubeMesh = new THREE.Mesh(geometry, material);
        cubeMesh.position.x = Math.random() * 200 - 105;
        cubeMesh.position.y = Math.random() * 110 - 55;
        cubeMesh.position.z = Math.random() * 100 - 80;
        scene.add(cubeMesh);
    }
}

// Function to animate the scene
function animate(scene, camera, renderer, rendererType) {
    function render() {
        requestAnimationFrame(render);

        if (rendererType === 'webgl')
        {
            renderer.clear();
        } else {
            renderer.clearAsync();
        }

        // Rotate cubes
        scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.rotation.x += 0.001;
                object.rotation.y += 0.01;
            }
        });

        // Render scene
        if (rendererType === 'webgl')
        {
            renderer.render(scene, camera);
        } else {
            renderer.renderAsync(scene, camera);
        }
    }
    render();
}

// Function to run the benchmark
export function loadGeometryBenchmark(rendererType) {
    const scene = setupScene();
    const camera = setupCamera();
    let renderer = null
    if (rendererType === 'webgl')
    {
        console.info('WebGL selected');
        renderer = setupWebGLRenderer();
    } else {
        console.info('WebGPU selected');
        renderer = setupWebGPURenderer();
    }
    createGeometry(scene);
    animate(scene, camera, renderer, rendererType);
}