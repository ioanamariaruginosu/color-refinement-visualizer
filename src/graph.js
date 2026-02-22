let numVerts = 6;
let edges = [];
let positions = [];

/**
 * Read vertex count from the input field, clamp it, and recompute node positions.
 */
function applyVertices() {
    numVerts = parseInt(document.getElementById('numVertices').value) || 6;
    numVerts = Math.max(1, Math.min(50, numVerts));
    document.getElementById('numVertices').value = numVerts;
    computePositions();
    notify(`Graph set to ${numVerts} vertices`);
}

/**
 * Distribute vertices evenly around a circle centered in the canvas area.
 * Called before every render so positions always match the canvas size.
 */
function computePositions() {
    const canvas = document.getElementById('graphCanvas');
    const w = canvas.offsetWidth || 800;
    const h = canvas.offsetHeight || 500;
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.36;

    positions = [];
    for (let i = 0; i < numVerts; i++) {
        const angle = (2 * Math.PI * i / numVerts) - Math.PI / 2;
        positions.push({
            x: cx + r * Math.cos(angle),
            y: cy + r * Math.sin(angle),
        });
    }
}

/**
 * Append a new edge row to the edge list in the sidebar.
 * Optionally pre-fill with u and v values (used by demo defaults on load).
 */
function addEdgeRow(u = '', v = '') {
    const list = document.getElementById('edgeList');
    const row = document.createElement('div');
    row.className = 'edge-row';
    row.innerHTML = `
    <input type="number" placeholder="u" min="0" value="${u}" style="width:60px" class="eu" />
    <span style="color:var(--muted);font-size:0.9rem">—</span>
    <input type="number" placeholder="v" min="0" value="${v}" style="width:60px" class="ev" />
    <button onclick="this.parentElement.remove()">×</button>
  `;
    list.appendChild(row);
}

/**
 * Remove all manually entered edge rows from the sidebar list.
 */
function clearEdges() {
    document.getElementById('edgeList').innerHTML = '';
}

/**
 * Read all edge rows from the sidebar and return them as an array of [u, v] pairs.
 * Rows with missing or non-numeric values are silently skipped.
 */
function getManualEdges() {
    const rows = document.querySelectorAll('.edge-row');
    const result = [];
    rows.forEach(row => {
        const u = parseInt(row.querySelector('.eu').value);
        const v = parseInt(row.querySelector('.ev').value);
        if (!isNaN(u) && !isNaN(v)) result.push([u, v]);
    });
    return result;
}