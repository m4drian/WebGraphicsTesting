/**
 * @typedef {Object} THREE
 * @property {Function} Scene
 * @property {Function} PerspectiveCamera
 * @property {Function} WebGLRenderer
 * @property {Function} BoxGeometry
 * @property {Function} MeshBasicMaterial
 * @property {Function} Mesh
 */

/**
 * @type {THREE}
 */
import * as THREE from 'three';
import {getRandomBaseColor,getMonochromaticColor} from './colorScheme.js';

// Set up the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color("#0d0c18");

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create geometry and material
const geometry = new THREE.BoxGeometry(1, 1, 1);

// Generate a large number of cubes and add them to the scene
const NUM_OBJECTS = 10000;
for (let i = 0; i < NUM_OBJECTS; i++) {
    const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: getMonochromaticColor(getRandomBaseColor(),50) });
    const cubeMesh = new THREE.Mesh(geometry, material);
    cubeMesh.position.x = Math.random() * 200 - 105;
    cubeMesh.position.y = Math.random() * 110 - 55;
    cubeMesh.position.z = Math.random() * 100 - 80;
    scene.add(cubeMesh);
}

// Set up camera position
camera.position.set(1,1,100);
camera.lookAt(0,0,0);

// Render function


function animate() {
    requestAnimationFrame(animate);

    // Rotate cubes
    scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
            object.rotation.x += 0.001;
            object.rotation.y += 0.01;
        }
    });

    // Render scene
    renderer.render(scene, camera);
}

// Start animation loop
animate();