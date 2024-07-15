import { loadGeometryBenchmark } from './benchmarks/normalsThree';
import { loadGeometryBenchmark2 } from './benchmarks/batchedNormalsThree';
import { loadPlayCanvasBenchmark } from './benchmarks/batchingPlayCanvas';
import { loadBabylonBenchmark } from './benchmarks/normalsBabylon';
import { lightsBabylon } from './benchmarks/lightsBabylon';
import GlStats from 'stats-gl';

const apiSelector = document.getElementById('api-selector');
const benchmarkSelector = document.getElementById('benchmark-selector');
const confirmButton = document.getElementById('confirm-button');
//const canvas = document.getElementById("app");
const benchmarkData = [];
//const benchmarkCPUData = [];
//const benchmarkGPUData = [];

// GL stats
let statsGL = new GlStats( {
    logsPerSecond: 20,
    samplesLog: 200, // collect logs for 10 seconds
    precision: 2,
    horizontal: false
} );
document.body.appendChild( statsGL.dom );
statsGL.domElement.style.cssText = 'position:fixed;bottom:243px;left:0px;';
//statsGL.dom.style.position = 'absolute';
//statsGL.totalCpuDuration;
//statsGL.totalGpuDuration;
confirmButton.addEventListener('click', () => {
    const selectedBenchmark = benchmarkSelector.value;
    const selectedApi = apiSelector.value;

    // Load the specific benchmark based on selection
    if (selectedBenchmark === 'geometry1') {
        loadGeometryBenchmark(selectedApi, statsGL, benchmarkData);
    } else if (selectedBenchmark === 'geometry2') {
        loadGeometryBenchmark2(selectedApi, statsGL, benchmarkData);
    } else if (selectedBenchmark === 'babylon1') {
        loadBabylonBenchmark(selectedApi, statsGL, benchmarkData);
    } else if (selectedBenchmark === 'babylon2') {
        lightsBabylon(selectedApi, statsGL, benchmarkData);
    } else if (selectedBenchmark === 'play-canvas') {
        loadPlayCanvasBenchmark(selectedApi, statsGL, benchmarkData);
    } else {
        console.warn('Nothing selected');
    }
});