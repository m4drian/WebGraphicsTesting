import { loadGeometryBenchmark } from './benchmarks/geometryThreeBenchmark';
import { loadGeometryBenchmark2 } from './benchmarks/geometryThreeBenchmark2';
import { loadPlayCanvasBenchmark } from './benchmarks/playCanvasBenchmark';
import { loadBabylonBenchmark } from './benchmarks/babylonBenchmark';
import Stats from 'three/examples/jsm/libs/stats.module.js';

const apiSelector = document.getElementById('api-selector');
const benchmarkSelector = document.getElementById('benchmark-selector');
const confirmButton = document.getElementById('confirm-button');
const canvas = document.getElementById("app");

var stats0 = new Stats();
stats0.showPanel( 0 );
stats0.domElement.style.cssText = 'position:fixed;bottom:20px;left:0px;';
document.body.appendChild( stats0.dom );

var stats1 = new Stats();
stats1.showPanel( 1 );
stats1.domElement.style.cssText = 'position:fixed;bottom:20px;left:80px;';
document.body.appendChild( stats1.dom );

var stats2 = new Stats();
stats2.showPanel( 2 );
stats2.domElement.style.cssText = 'position:fixed;bottom:20px;left:160px;';
document.body.appendChild( stats2.dom );

confirmButton.addEventListener('click', () => {
    const selectedBenchmark = benchmarkSelector.value;
    const selectedApi = apiSelector.value;

    canvas.innerHTML = '';

    // Load the specific benchmark based on selection
    if (selectedBenchmark === 'geometry1') {
        loadGeometryBenchmark(canvas, selectedApi, stats0, stats1, stats2);
    } else if (selectedBenchmark === 'geometry2') {
        loadGeometryBenchmark2(canvas, selectedApi, stats0);
    } else if (selectedBenchmark === 'babylon1') {
        loadPlayCanvasBenchmark(canvas, selectedApi);
    } else if (selectedBenchmark === 'babylon2') {
        loadBabylonBenchmark(canvas, selectedApi);
    } else if (selectedBenchmark === 'play-canvas') {
        loadPlayCanvasBenchmark(canvas, selectedApi);
    } else {
        console.warn('Nothing selected');
    }
});