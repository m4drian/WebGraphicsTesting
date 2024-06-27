import * as THREE from 'three';
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';
import { getMonochromaticColor, getRandomBaseColor } from '../colorScheme.js';

function setupScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0d0c18");
    return scene;
}

function setupCamera() {
    const camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);
    camera.position.set(1, 1, 100);
    camera.lookAt(0, 0, 0);
    return camera;
}

function setupWebGLRenderer() {
    const renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( 1600, 900 );
    document.body.appendChild(renderer.domElement);
    return renderer;
}

function setupWebGPURenderer() {
    const renderer = new WebGPURenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( 1600, 900 );
    document.body.appendChild( renderer.domElement );
    return renderer;
}

function createGeometry(scene) {
    const geometry = new THREE.SphereGeometry( 1, 32, 16 );// verts:482, Edges: 992, Faces: 512, Tris: 960
    const NUM_OBJECTS = 5000;
    for (let i = 0; i < NUM_OBJECTS; i++) {
        const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: getMonochromaticColor(getRandomBaseColor(), 50) });
        const cubeMesh = new THREE.Mesh(geometry, material);
        cubeMesh.position.x = Math.random() * 200 - 105;
        cubeMesh.position.y = Math.random() * 110 - 55;
        cubeMesh.position.z = Math.random() * 100 - 80;
        scene.add(cubeMesh);
    }
}

function animate(scene, camera, renderer, rendererType, stats0, stats1, stats2) {
    function render() {
        requestAnimationFrame(render);

        if (rendererType === 'webgl')
        {
            renderer.clear();
        } else {
            renderer.clearAsync();
        }

        // Rotate
        /*scene.traverse((object) => {
            if (object instanceof THREE.Mesh) {
                object.rotation.x += 0.005;
                object.rotation.y += 0.01;
            }
        });*/

        if (rendererType === 'webgl')
        {
            renderer.render(scene, camera);
        } else {
            renderer.renderAsync(scene, camera);
        }

        stats0.update();
        stats1.update();
        stats2.update();
    }
    
    render();
}

export function loadGeometryBenchmark(rendererType, stats0, stats1, stats2) {

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
    animate(scene, camera, renderer, rendererType, stats0, stats1, stats2);
}