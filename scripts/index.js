import { loadGeometryBenchmark } from './benchmarks/geometryThreeBenchmark';
import { loadGeometryBenchmark2 } from './benchmarks/geometryThreeBenchmark2';
import { loadPlayCanvasBenchmark } from './benchmarks/playCanvasBenchmark';
import { loadBabylonBenchmark } from './benchmarks/babylonBenchmark';
import GlStats from 'stats-gl';

const apiSelector = document.getElementById('api-selector');
const benchmarkSelector = document.getElementById('benchmark-selector');
const confirmButton = document.getElementById('confirm-button');
//const canvas = document.getElementById("app");

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
        loadGeometryBenchmark(selectedApi, statsGL);
    } else if (selectedBenchmark === 'geometry2') {
        loadGeometryBenchmark2(selectedApi, statsGL);
    } else if (selectedBenchmark === 'babylon1') {
        loadPlayCanvasBenchmark(selectedApi, statsGL);
    } else if (selectedBenchmark === 'babylon2') {
        loadBabylonBenchmark(selectedApi, statsGL);
    } else if (selectedBenchmark === 'play-canvas') {
        loadPlayCanvasBenchmark(selectedApi, statsGL);
    } else {
        console.warn('Nothing selected');
    }
});