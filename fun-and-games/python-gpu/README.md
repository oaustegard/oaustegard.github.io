# Python on the GPU

Four browser demos whose simulation step is a plain Python function, compiled ahead of time to a WebGPU compute shader by `pykernel`:

- **Mandelbrot** (`mandelbrot.html`): one `escape()` call per pixel, recomputed whenever the view moves. Drag, scroll or pinch, and double-click to dive. The view is kept in the URL hash so it can be shared.
- **Reaction–diffusion** (`gray-scott.html`): Gray–Scott chemistry with presets, drawn with the pointer.
- **Colliding galaxies** (`galaxy.html`): two disc galaxies, with every pair's gravity summed each step.
- **Ripple tank** (`ripples.html`): the wave equation, with rain, clicks and a double slit.
- **Playground** (`playground.html`): write your own kernels in the browser. Examples are in `playground/*.py`.

At startup each page runs every kernel once on a small fixed input and compares the GPU output with the result CPython computed for the same input at build time. The panel shows the outcome. The GPU works in f32 and CPython in f64, so the comparison uses a small relative tolerance, which each kernel file states.

## Build and runtime

`kernels/<demo>.py` holds `@kernel` functions. The first parameter is the invocation index; `list[float]` parameters become storage buffers, and `int` and `float` parameters become a uniform struct. The files import `sin`, `exp` and the other math functions from `math`, so they also run as ordinary Python.

`python3 build.py` (standard library only) translates every kernel with `vendor/pykernel.py`. It runs each kernel's `CHECKS` input through CPython and writes `generated/<demo>.js`, which holds the WGSL, the binding manifest, the Python source and the check data. `python3 build.py --check` exits 1 if a generated file is stale. Rebuild after editing a kernel.

`pk-runtime.js` hosts the shaders. It builds buffers and the uniform struct from the manifest, dispatches, runs the startup check, and holds the two hand-written drawing shaders: `FieldView` maps a float grid through a colour ramp and `PointsView` draws additive sprites. These only display finished buffers; all simulation happens in the generated kernels.

`vendor/pykernel.py` is a copy of `py-wasm-bench/arms/wgsl/pykernel.py` in [oaustegard/experiments](https://github.com/oaustegard/experiments). It came out of the benchmark there, and its subset, design and limits are documented in that directory's `NOTES.md`.

## Playground

`playground.html` compiles the editor's Python with `pykernel.js`, a JavaScript port of `vendor/pykernel.py`. `python3 tests/make_corpus.py` records what the Python compiler does with the demo kernels, the playground examples and pykernel's own test inputs. `node tests/check_pykernel_js.mjs` requires the port to give identical WGSL, manifests and error text on all of them. `node tests/check_module.mjs` covers `translateModule`, which splits an editor buffer into kernels. After changing `vendor/pykernel.py`, carry the change into `pykernel.js` and run all three.

The program model is described on the page itself. Every `list[float]` parameter is a persistent grid buffer, and `w`, `h`, `t`, `frame`, `mx`, `my` and `mdown` are filled in automatically. Other scalars become sliders (`# slider NAME MIN MAX DEFAULT`). `init` runs once, the rest every frame (`# steps N` repeats them), and `out` is displayed (`# display LO HI` or `# display cyclic FREQ`). Share links carry the source in the URL hash.

## Controls and URL options

- `?px=N` caps the number of canvas pixels (default 2.5 million) for slow GPUs.
- `galaxy.html?n=N` sets the star count.
- `ripples.html?mode=slit` opens in double-slit mode.
- `playground.html?example=life` opens an example.

## Requirements

A browser with WebGPU: current Chrome, Edge or Safari, or Firefox on Windows and macOS. Without it each page explains why it cannot run.
