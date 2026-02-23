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

const dragState = {
    index:   null,
    offsetX: 0,
    offsetY: 0,
};

/**
 * Get the canvas-relative {x, y} from a mouse or touch event.
 * @param {MouseEvent|TouchEvent} e
 * @param {HTMLCanvasElement} canvas
 * @returns {{ x: number, y: number }}
 */
function getEventPos(e, canvas) {
    const rect   = canvas.getBoundingClientRect();
    const source = e.touches ? e.touches[0] : e;
    return {
        x: source.clientX - rect.left,
        y: source.clientY - rect.top,
    };
}

/**
 * Return the index of the topmost vertex under (x, y), or null if none.
 * Iterates in reverse draw order so the visually topmost node wins.
 * @param {number} x
 * @param {number} y
 * @returns {number|null}
 */
function hitTest(x, y) {
    for (let i = positions.length - 1; i >= 0; i--) {
        const dx = x - positions[i].x;
        const dy = y - positions[i].y;
        if (Math.sqrt(dx * dx + dy * dy) <= NODE_R) return i;
    }
    return null;
}

/**
 * Attach all mouse and touch drag listeners to the canvas.
 * Call this once after the canvas element exists in the DOM.
 */
function initDragListeners() {
    const canvas = document.getElementById('graphCanvas');

    function onDown(e) {
        if (steps.length === 0) return;
        const pos = getEventPos(e, canvas);
        const hit = hitTest(pos.x, pos.y);
        if (hit === null) return;

        e.preventDefault();
        dragState.index   = hit;
        dragState.offsetX = positions[hit].x - pos.x;
        dragState.offsetY = positions[hit].y - pos.y;
        canvas.style.cursor = 'grabbing';
    }

    function onMove(e) {
        if (dragState.index === null) {
            if (steps.length > 0) {
                const pos = getEventPos(e, canvas);
                canvas.style.cursor = hitTest(pos.x, pos.y) !== null ? 'grab' : 'default';
            }
            return;
        }

        e.preventDefault();
        const pos = getEventPos(e, canvas);

        positions[dragState.index] = {
            x: Math.max(NODE_R, Math.min(canvas.width  - NODE_R, pos.x + dragState.offsetX)),
            y: Math.max(NODE_R, Math.min(canvas.height - NODE_R, pos.y + dragState.offsetY)),
        };

        if (steps.length > 0) drawGraph(steps[currentStep].coloring);
    }

    function onUp() {
        if (dragState.index === null) return;
        dragState.index     = null;
        canvas.style.cursor = 'default';
    }

    canvas.addEventListener('mousedown',  onDown);
    canvas.addEventListener('mousemove',  onMove);
    canvas.addEventListener('mouseup',    onUp);
    canvas.addEventListener('mouseleave', onUp);

    canvas.addEventListener('touchstart', onDown, { passive: false });
    canvas.addEventListener('touchmove',  onMove, { passive: false });
    canvas.addEventListener('touchend',   onUp);
}