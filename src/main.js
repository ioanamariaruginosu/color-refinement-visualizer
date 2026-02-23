let steps = []; // Filled by buildAndRun(), consumed by renderStep() and navigation.js

/**
 * Entry point for the Run button.
 * Collects graph data, runs the algorithm, and shows the first step.
 */
function buildAndRun() {
    applyVertices();

    edges = currentTab === 'manual' ? getManualEdges() : uploadedEdges;

    edges = edges.filter(([u, v]) =>
        u !== v &&
        u >= 0 && v >= 0 &&
        u < numVerts && v < numVerts
    );

    steps = computeColorRefinementSteps(numVerts, edges);
    currentStep = 0;

    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('stepBar').style.display = 'flex';
    document.getElementById('legendPanel').style.display = '';
    document.getElementById('colorLegendCard').style.display = '';
    document.getElementById('statsCard').style.display = '';

    computePositions();
    buildProgressDots();
    renderStep(0);

    notify(`Color refinement: ${steps.length} step${steps.length !== 1 ? 's' : ''}`);
}

/**
 * Render a single step: update the canvas, step bar, legend, and stats.
 * This is the main "display" function called by navigation and buildAndRun.
 *
 * @param {number} idx - Index into the `steps` array.
 */
function renderStep(idx) {
    const step = steps[idx];
    drawGraph(step.coloring);
    updateStepUI(idx);
    updateLegend(step.coloring);
    updateStats(step.coloring);
}

/**
 * Show a temporary toast notification at the top-right of the screen.
 * Automatically hides after 2.5 seconds.
 *
 * @param {string} msg - The message to display.
 */
function notify(msg) {
    const el = document.getElementById('notification');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
}

window.addEventListener('load', () => {
    computePositions();

    const defaultEdges = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,3],[1,4]];
    defaultEdges.forEach(([u, v]) => addEdgeRow(u, v));

    initDragListeners();

    window.addEventListener('resize', () => {
        computePositions();
        if (steps.length > 0) drawGraph(steps[currentStep].coloring);
    });
});