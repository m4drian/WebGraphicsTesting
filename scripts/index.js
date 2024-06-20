import { loadGeometryBenchmark } from './benchmarks/geometryBenchmark';

const apiSelector = document.getElementById('api-selector');
const benchmarkSelector = document.getElementById('benchmark-selector');
const confirmButton = document.getElementById('confirm-button');
const appContainer = document.getElementById('app');

confirmButton.addEventListener('click', (event) => {
    const selectedBenchmark = benchmarkSelector.value;
    const selectedApi = apiSelector.value;


    appContainer.innerHTML = '';

    // Load the specific benchmark based on selection
    if (selectedBenchmark === 'geometry') {
        loadGeometryBenchmark(selectedApi);
    } else if (selectedBenchmark === 'phong') {
        console.warn('Phong Shading benchmark not implemented yet');
    } else if (selectedBenchmark === 'texture-mapping') {
        console.warn('Texture Mapping benchmark not implemented yet');
    } else {
        console.warn('Nothing selected');
    }
});