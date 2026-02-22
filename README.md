# ColorRefine

An interactive, step-by-step visualizer for the **Color Refinement** (also called *Naive Vertex Classification* or *1-dimensional Weisfeiler-Leman*) algorithm on undirected graphs.

## What is Color Refinement?

Color Refinement is an iterative graph partitioning algorithm:

1. **Initialize** — assign every vertex the same color class (class 0).
2. **Refine** — in each round, compute a *signature* for every vertex:
   `signature(v) = (current_color(v), sorted multiset of neighbor colors)`
   Map distinct signatures to new color IDs.
3. **Repeat** until no vertex changes color (fixed point / stable partition).

The stable partition is the coarsest stable coloring of the graph. It is used in graph isomorphism testing, graph neural networks (as the theoretical basis of message passing), and canonical form computation.

## Features

- Set the number of vertices
- Manual edge entry — add edges one by one in the sidebar
- Excel / CSV upload — drag-and-drop or click to upload (see format below)
- Step-by-step visualization
- Forward / backward navigation
- Color legend and per-step stats in the sidebar
- Progress dots showing position in the refinement sequence

## Getting Started

No build step required. Just open `index.html` in a browser.

```
git clone <your-repo-url>
cd color-refinement-visualizer
open index.html
```

## Excel / CSV Format

The file must have two columns: source vertex and target vertex (0-indexed integers). A header row is optional and will be skipped automatically.

| Column A | Column B |
|----------|----------|
| 0        | 1        |
| 1        | 2        |
| 2        | 3        |
| 0        | 3        |

- Supported formats: `.xlsx`, `.xls`, `.csv`
- Vertices must be in range `[0, numVertices - 1]`
- Self-loops are ignored
- Each edge only needs to be listed once (the graph is undirected)

## File Structure

| File | Responsibility |
|------|---------------|
| `index.html` | HTML structure and script loading order |
| `style.css` | All visual styles and CSS variables |
| `graph.js` | Vertex count, circular layout, manual edge input |
| `upload.js` | Excel/CSV parsing with SheetJS, drag-and-drop |
| `algorithm.js` | Color refinement — pure function, returns all steps |
| `renderer.js` | Canvas drawing: nodes, edges, glows, labels |
| `navigation.js` | Step navigation, keyboard shortcuts, progress dots |
| `sidebar.js` | Color legend, stats panel, tab switcher |
| `main.js` | Wires everything together, `buildAndRun()`, `notify()` |

## Dependencies

- [SheetJS (xlsx)](https://sheetjs.com/) — loaded from cdnjs, used for parsing Excel files
- Google Fonts — JetBrains Mono + Space Grotesk