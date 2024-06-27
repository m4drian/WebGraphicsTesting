import { loadGeometryBenchmark } from './benchmarks/geometryThreeBenchmark';
import { loadGeometryBenchmark2 } from './benchmarks/testBench';
import Stats from 'three/examples/jsm/libs/stats.module.js';

const apiSelector = document.getElementById('api-selector');
const benchmarkSelector = document.getElementById('benchmark-selector');
const confirmButton = document.getElementById('confirm-button');
const appContainer = document.getElementById('app');

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


    appContainer.innerHTML = '';

    // Load the specific benchmark based on selection
    if (selectedBenchmark === 'geometry') {
        loadGeometryBenchmark(selectedApi, stats0, stats1, stats2);
    } else if (selectedBenchmark === 'phong') {
        loadGeometryBenchmark2(stats0, stats1, stats2);
    } else if (selectedBenchmark === 'texture-mapping') {
        console.warn('Texture Mapping benchmark not implemented yet');
    } else {
        console.warn('Nothing selected');
    }
});