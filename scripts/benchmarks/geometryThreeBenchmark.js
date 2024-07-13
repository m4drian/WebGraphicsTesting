import * as THREE from 'three';
import WebGPURenderer from 'three/addons/renderers/webgpu/WebGPURenderer.js';
//import { getMonochromaticColor, getRandomBaseColor } from '../colorScheme.js';

function setupScene() {
    let scene = new THREE.Scene();
    scene.background = new THREE.Color("#0d0c18");
    return scene;
}

function setupCamera() {
    let camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);
    camera.position.set(1, 1, 100);
    camera.lookAt(0, 0, 0);
    return camera;
}

function setupRenderer(myCanvas, rendererType) {
    let renderer = null;
    console.info(rendererType, 'selected');

    if (rendererType === 'webgl') {
        renderer = new THREE.WebGLRenderer( { canvas: myCanvas, antialias: true } );
    } else {
        renderer = new WebGPURenderer( { canvas: myCanvas, antialias: true } );
    }
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( 1440, 810 );
    return renderer;
}

function createGeometry(scene) {
    const geometry = new THREE.ConeGeometry(1, 2, 32, 16)
    //const geometry = new THREE.SphereGeometry( 1, 32, 16 ); //verts:482, Edges: 992, Faces: 512, Tris: 960
    const numOfObjects = 5000;
    //const material = new THREE.MeshBasicMaterial({color: getMonochromaticColor(getRandomBaseColor(), 50)})
    const material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });

    for (let i = 0; i < numOfObjects; i++) {
        const cubeMesh = new THREE.Mesh(geometry, material);
        cubeMesh.position.x = Math.random() * 200 - 105;
        cubeMesh.position.y = Math.random() * 110 - 55;
        cubeMesh.position.z = Math.random() * 100 - 80;
        scene.add(cubeMesh);
    }
}

async function animate(scene, camera, renderer, rendererType, stats0, stats1, stats2) {

    if (rendererType === 'webgl')
    {
        renderer.clear();
    } else {
        renderer.clearAsync();
    }

    // Rotate
    scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
            object.rotation.x += 0.005;
            object.rotation.y += 0.01;
        }
    });

    if (rendererType === 'webgl')
    {
        renderer.render(scene, camera);
    } else {
        await renderer.renderAsync(scene, camera);
    }

    stats0.update();
    stats1.update();
    stats2.update();
}

export function loadGeometryBenchmark(rendererType, stats0, stats1, stats2) {
    let canvas = document.createElement('canvas');
    canvas.width = 1440;
    canvas.height = 810;
    canvas.id = "mycanvas";
    document.body.appendChild(canvas);

    let camera = setupCamera();
    let renderer = setupRenderer(canvas, rendererType);
    let scene = setupScene();

    createGeometry(scene);
    renderer.setAnimationLoop(() => animate(scene, camera, renderer, rendererType, stats0, stats1, stats2));

    setTimeout(() => {
        console.info('benchmark stopped');
        renderer.setAnimationLoop(null); 
        scene = null;
        camera = null;
        renderer.dispose();
        renderer = null;
        document.body.removeChild(canvas);
    }, 30000);
}