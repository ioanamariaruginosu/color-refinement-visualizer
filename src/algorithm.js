// ─── COLOR REFINEMENT ALGORITHM ──────────────────────────────────────────────
// Takes a vertex count and edge list, returns an array of steps, each describing the coloring at that iteration.
// Algorithm overview:
//   1. Start with all vertices in class 0 (uniform coloring).
//   2. Each iteration: compute a signature per vertex = (current_color, sorted neighbor colors).
//   3. Map unique signatures to new integer color IDs (consistently ordered).
//   4. If no vertex changed color, the partition is stable, so stop.
//   5. Otherwise record the new coloring and repeat.
//
// A step object has the shape:
//   { coloring: number[], title: string, desc: string }

/**
 * Run color refinement on a graph and return all intermediate steps.
 *
 * @param {number}   n         - Number of vertices (0-indexed).
 * @param {number[][]} edgeList - Array of [u, v] undirected edge pairs.
 * @returns {{ coloring: number[], title: string, desc: string }[]}
 */
function computeColorRefinementSteps(n, edgeList) {
    const adj = Array.from({ length: n }, () => []);
    for (const [u, v] of edgeList) {
        adj[u].push(v);
        adj[v].push(u);
    }

    const steps = [];
    let coloring = new Array(n).fill(0);
    steps.push({
        coloring: [...coloring],
        title: 'Step 0 — Initial Coloring',
        desc: `All ${n} vertices assigned to class 0`,
    });

    for (let iteration = 1; iteration <= 200; iteration++) {
        const signatures = coloring.map((c, v) => {
            const neighborColors = adj[v].map(u => coloring[u]).sort((a, b) => a - b);
            return JSON.stringify([c, neighborColors]);
        });

        const uniqueSigs = [...new Set(signatures)].sort();
        const sigToColor = new Map(uniqueSigs.map((s, i) => [s, i]));
        const newColoring = signatures.map(s => sigToColor.get(s));
        const changed = newColoring.some((c, i) => c !== coloring[i]);

        coloring = newColoring;
        const numClasses = new Set(coloring).size;

        if (!changed) {
            steps.push({
                coloring: [...coloring],
                title: `Step ${iteration} — Stable (Fixed Point)`,
                desc: `No changes. Algorithm converged with ${numClasses} color class${numClasses !== 1 ? 'es' : ''}.`,
            });
            break;
        }

        steps.push({
            coloring: [...coloring],
            title: `Step ${iteration} — Refinement`,
            desc: `Partitioned into ${numClasses} color class${numClasses !== 1 ? 'es' : ''} based on neighborhood signatures`,
        });
    }

    return steps;
}