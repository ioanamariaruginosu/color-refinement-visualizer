// ─── CANVAS RENDERER ─────────────────────────────────────────────────────────
// Draws the graph onto a <canvas> element.
// Each vertex is a circle with a glow effect, colored by its class.
// Edges are drawn as thin gray lines beneath the nodes.

const NODE_R = 22; // Radius of each vertex circle in pixels

/**
 * Return a unique HSL color for a given class ID.
 * Uses the golden angle (137.508°) to spread colors evenly around the hue wheel,
 * ensuring visually distinct colors even with many classes (up to 50+).
 * @param {number} classId
 * @returns {string} CSS hsl() color string
 */
function getNodeColor(classId) {
    const hue = (classId * 137.508) % 360;
    return `hsl(${hue}, 70%, 60%)`;
}

/**
 * Convert an HSL color string to an "r,g,b" string for use in rgba().
 * Renders the color onto a temporary canvas to extract RGB values.
 * @param {string} hsl - e.g. "hsl(210, 70%, 60%)"
 * @returns {string} e.g. "100,149,237"
 */
function hexToRgb(hsl) {
    const tmp = document.createElement('canvas');
    tmp.width = tmp.height = 1;
    const ctx = tmp.getContext('2d');
    ctx.fillStyle = hsl;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `${r},${g},${b}`;
}

/**
 * Resize the canvas to fill its container, then draw the full graph.
 * Must be called each time positions or coloring change.
 *
 * @param {number[]} coloring - Array mapping vertex index → color class ID.
 */
function drawGraph(coloring) {
    const canvas = document.getElementById('graphCanvas');
    const area = document.getElementById('graphArea');

    canvas.width = area.offsetWidth;
    canvas.height = area.offsetHeight;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (positions.length !== numVerts) computePositions();

    drawEdges(ctx);
    drawNodes(ctx, coloring);
}

/**
 * Draw all edges as thin semi-transparent lines.
 * @param {CanvasRenderingContext2D} ctx
 */
function drawEdges(ctx) {
    ctx.strokeStyle = 'rgba(100,100,150,0.4)';
    ctx.lineWidth = 1.5;

    for (const [u, v] of edges) {
        if (u >= positions.length || v >= positions.length) continue;
        ctx.beginPath();
        ctx.moveTo(positions[u].x, positions[u].y);
        ctx.lineTo(positions[v].x, positions[v].y);
        ctx.stroke();
    }
}

/**
 * Draw all vertices with glow, fill, border, index label, and class badge.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number[]} coloring
 */
function drawNodes(ctx, coloring) {
    positions.forEach((p, i) => {
        const color = getNodeColor(coloring[i]);
        const rgb = hexToRgb(color);

        const grd = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, NODE_R * 2.5);
        grd.addColorStop(0, `rgba(${rgb},0.25)`);
        grd.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, NODE_R * 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, NODE_R, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},0.2)`;
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 13px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(i, p.x, p.y);

        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = color;
        ctx.fillText(`c${coloring[i]}`, p.x, p.y + NODE_R + 12);
    });
}