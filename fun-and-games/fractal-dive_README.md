# Fractal Dive

An endless zoom into two fractals, drawn every frame by a WebGL2 fragment shader. **Julia** (the default) is the set for z² + c with c = 0.3 + 0.5i. **Bubbles** is an Apollonian gasket. Switch between them with the button at the top right, or open `?f=bubbles`.

## Controls

- Scroll or pinch to zoom, drag to pan.
- Double-tap, double-click or press Space to start the automatic dive. It picks a point on the fractal and zooms straight into it. Another double-tap eases it to a stop, and any other input stops it at once.
- Triple-tap, triple-click or press Shift+Space to rise back out. It eases to a stop at the starting view.
- Press H or click Reset to go back to the start.
- `?speed=` sets the dive speed in octaves per second (default 0.4).
- `?c=re,im` picks a different Julia parameter.

## How the zoom stays seamless

Double precision runs out after about 50 octaves, so neither mode keeps a global coordinate. Instead, each mode keeps the view in a coordinate system that it swaps out as you zoom. Because the fractal is invariant under each swap, the picture does not change.

- **Bubbles.** The camera is a Möbius map from the screen to the band model of the gasket. When the view gets small, the camera absorbs the same folds, reflections and circle inversions that the shader applies to each pixel. The gasket is invariant under all of them, so the picture stays the same. Colours depend only on exact screen-space circle geometry (radius, distance to the rim, direction from the centre), computed from the pixel's orbit, so they do not change either. Zooming back out switches to representations saved on the way down.
- **Julia.** The view is a linear chart at level m: it shows f applied m times to the true view. When the chart gets small, one more step of f is folded in. Across a view that small, f is linear to far below a pixel. Zooming out steps back through the inverse branch the chart came from. Escape counts are offset by m. The first iterations for each pixel run as perturbations of the chart centre's orbit, because a pixel's offset is below float precision next to the centre's value.

There are no tiles or caches. Only a short list of saved representations grows with depth, and it is used on the way back out. Render resolution adapts to keep frames smooth.

## Files

`fractal-dive.html` is one hand-written file with no dependencies.
