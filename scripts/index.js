import { loadGeometryBenchmark } from './benchmarks/geometryThreeBenchmark';
import { loadGeometryBenchmark2 } from './benchmarks/geometryThreeBenchmark2';
import { loadPlayCanvasBenchmark } from './benchmarks/playCanvasBenchmark';
import { loadBabylonBenchmark } from './benchmarks/babylonBenchmark';
import ThreeStats  from 'three/examples/jsm/libs/stats.module.js';
import GlStats from 'stats-gl';

const apiSelector = document.getElementById('api-selector');
const benchmarkSelector = document.getElementById('benchmark-selector');
const confirmButton = document.getElementById('confirm-button');
//const canvas = document.getElementById("app");

// stats
var stats0 = new ThreeStats();
stats0.showPanel( 0 );
stats0.domElement.style.cssText = 'position:fixed;bottom:3px;left:0px;';
document.body.appendChild( stats0.dom );

/*var stats1 = new Stats();
stats1.showPanel( 1 );
stats1.domElement.style.cssText = 'position:fixed;bottom:3px;left:80px;';
document.body.appendChild( stats1.dom );

var stats2 = new Stats();
stats2.showPanel( 2 );
stats2.domElement.style.cssText = 'position:fixed;bottom:3px;left:160px;';
document.body.appendChild( stats2.dom );*/

// GL stats
let statsGL = new GlStats( {
precision: 3,
horizontal: false
} );
document.body.appendChild( statsGL.dom );
statsGL.domElement.style.cssText = 'position:fixed;bottom:243px;left:0px;';
//statsGL.dom.style.position = 'absolute';

confirmButton.addEventListener('click', () => {
    const selectedBenchmark = benchmarkSelector.value;
    const selectedApi = apiSelector.value;

    // Load the specific benchmark based on selection
    if (selectedBenchmark === 'geometry1') {
        loadGeometryBenchmark(selectedApi, stats0, statsGL);
    } else if (selectedBenchmark === 'geometry2') {
        loadGeometryBenchmark2(selectedApi, stats0, statsGL);
    } else if (selectedBenchmark === 'babylon1') {
        loadPlayCanvasBenchmark(selectedApi, stats0, statsGL);
    } else if (selectedBenchmark === 'babylon2') {
        loadBabylonBenchmark(selectedApi, stats0, statsGL);
    } else if (selectedBenchmark === 'play-canvas') {
        loadPlayCanvasBenchmark(selectedApi, stats0, statsGL);
    } else {
        console.warn('Nothing selected');
    }
});