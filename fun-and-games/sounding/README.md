# Sounding

Minesweeper drawn entirely on the GPU. The field is a sea floor: each tap sends a sonar ping across
it, a flood opening washes outward ring by ring, marked mines sit under pulsing beacons that light
their neighbours, and hitting a mine sets off every unmarked mine on the board, nearest first.
Installable PWA; Canvas 2D fallback where WebGPU is missing.

Live: <https://austegard.com/fun-and-games/sounding/>

## Controls

| input | does |
|---|---|
| tap / left-click a closed cell | sound it (open it) |
| hold 0.4 s / right-click / Space over a cell | mark or unmark it |
| tap a number | if its marks match the number, open the rest of its neighbours |
| MARK button or F | taps mark instead of open |
| R | new field |

Three fields: 9×9 with 10 mines, 16×16 with 40, and 30×16 with 99, which stands up as 16×30 on a
portrait screen. The first cell you open and its eight neighbours never hold a mine. Best times are
kept per field in this browser.

## How it is built

- **One fragment shader draws the board.** A full-screen triangle; each pixel finds its cell and
  reads four floats from a storage buffer: state, the time the cell opens, the time it was marked,
  and its count (9 for a mine, 10 for the one you hit). Caps are rounded-box SDFs with a bevel
  normal lit by a point light that follows the pointer and drifts when idle. Floors are recessed and
  shadowed along edges whose neighbour is still capped. Every animation is a function of the clock
  and those timestamps, so the rules just write times and the shader does the rest.
- **Flood openings are scheduled.** The breadth-first fill stamps each ring 30 ms after the last, so
  a large opening ripples out from the tap, each cap shrinking into a flash.
- **Numbers** come from a glyph atlas rendered at the board's pixel size on every resize (sharp
  glyph in red, blurred copy in green for the glow), so they sample close to 1:1 at any zoom.
- **Losing.** Unmarked mines are stamped with detonation times by distance from the hit, 85 ms
  per cell. The shader adds a red bloom, a displacement shockwave across the whole field, blast
  light on neighbouring cells, then a scorched floor under each mine. Correct marks stay; wrong
  marks are crossed out.
- **Winning.** A green wave spreads from the last cell opened; beacons turn green as it passes and
  any mines you did not mark get marked as it reaches them.
- **Particles.** A 32,768-slot ring buffer on the GPU, moved by one compute pass and drawn as
  instanced quads: sparks, smoke, spinning cap debris, rising bubbles, and sonar dust off newly
  opened cells. A negative age is a delay, so the whole chain of blasts is uploaded at once and each
  burst wakes on cue.
- **Sound** is synthesized in Web Audio: a ping and its echo (lower for bigger openings), a click
  and thump for marks, filtered noise for blasts. iOS gets `navigator.audioSession.type =
  'playback'` and the hidden-switch haptic, as in [Plumb](../plumb/).
- **PWA**: `manifest.json`, and `sw.js` precaches the shell with the page itself network-first.

## Testing

The Playwright checks live with the experiment that produced this page:
[`oaustegard/experiments/sounding`](https://github.com/oaustegard/experiments/tree/main/sounding).
They cover the rules and touch input on the 2D view and run the WebGPU renderer on SwiftShader
through `?offscreen`, which renders to a texture and copies it to a 2D canvas, because headless
Chromium loses any device that presents to a canvas. Not yet played on a real phone.
