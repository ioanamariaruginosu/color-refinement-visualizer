/**
 * Rebuild the color legend to show which vertices belong to each class.
 * One row per unique class, showing a colored dot, class ID, and member list.
 *
 * @param {number[]} coloring - Array mapping vertex index → color class ID.
 */
function updateLegend(coloring) {
    const classes = [...new Set(coloring)].sort((a, b) => a - b);

    document.getElementById('colorLegend').innerHTML = classes.map(c => {
        const members = coloring
            .map((col, i) => (col === c ? i : -1))
            .filter(i => i >= 0);

        return `
      <div class="legend-item">
        <div class="legend-dot" style="background:${getNodeColor(c)}"></div>
        <span style="color:var(--text)">Class ${c}</span>
        <span style="color:var(--muted);margin-left:auto;font-size:0.73rem">
          {${members.join(', ')}}
        </span>
      </div>
    `;
    }).join('');
}

/**
 * Update the stats card with counts for the current step:
 * - Total vertices and edges
 * - Number of color classes
 * - Size (vertex count) of each class
 *
 * @param {number[]} coloring - Array mapping vertex index → color class ID.
 */
function updateStats(coloring) {
    const classes = [...new Set(coloring)].sort((a, b) => a - b);

    const classSizeRows = classes.map(c => {
        const count = coloring.filter(x => x === c).length;
        return `<div style="color:${getNodeColor(c)}">
      &nbsp;&nbsp;c${c}: ${count} node${count !== 1 ? 's' : ''}
    </div>`;
    }).join('');

    document.getElementById('statsContent').innerHTML = `
    <div>Vertices: <span style="color:var(--text)">${numVerts}</span></div>
    <div>Edges: <span style="color:var(--text)">${edges.length}</span></div>
    <div>Color classes: <span style="color:var(--accent)">${classes.length}</span></div>
    <div style="margin-top:8px;color:var(--muted);font-size:0.7rem">Class sizes:</div>
    ${classSizeRows}
  `;
}

let currentTab = 'manual';

/**
 * Switch the edge-input area between the Manual and Upload panels.
 * Updates tab button active states and panel visibility.
 *
 * @param {string} tab  - 'manual' or 'upload'
 * @param {HTMLElement} btn - The tab button that was clicked
 */
function switchTab(tab, btn) {
    currentTab = tab;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('manualPanel').style.display = tab === 'manual' ? '' : 'none';
    document.getElementById('uploadPanel').style.display = tab === 'upload' ? '' : 'none';
}