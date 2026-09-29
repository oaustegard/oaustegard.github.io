# Fractal Dive

An endless zoom with two fractals, rendered in the browser with [OpenSeadragon](https://openseadragon.github.io/). Switch between them with the button at the top right (`?f=cells` opens the second one directly).

- **Gasket**: Pascal's triangle mod 2 (a Sierpinski gasket) with glowing hole edges.
- **Cells**: stacked, warped Voronoi cells. Each octave has its own hashed grid, and finer octaves fade in as pixels allow.

Scroll, pinch or drag to move. Double-tap (or double-click, or press Space) to dive automatically. Any manual input, or another double-tap, stops it.

## How the zoom stays unbounded

Double precision runs out after about 45 octaves, so the view never uses one global coordinate.

- The view sits inside a *frame*: an OpenSeadragon item rendered from an exact BigInt cell index plus a double offset within that cell.
- When the zoom leaves the range 0.85 to 2.6, a new frame is built at the view centre, loaded underneath the old item, and swapped in once its tiles are ready. The camera is renormalised in the same tick, so nothing jumps.
- Old items, frames and worker copies are dropped at each swap, and the OpenSeadragon tile cache is capped at 90 tiles, so memory stays flat.
- Tiles are drawn by a small pool of web workers, with a main-thread fallback if workers are unavailable.
- Gasket classification is exact at any depth (checked against brute-force BigInt digit tests). Cells hash the absolute cell index, so every frame agrees on the same picture.

## Files

`fractal-dive.html` is one hand-written file. It loads OpenSeadragon 6.1.1 from jsDelivr and has no build step.
