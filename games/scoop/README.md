# Scoop

Minesweeper on a lawn, drawn on the GPU. The long grass hides dog poop. Sweep a patch and the
grass is cut away in a spray of clippings; bag a patch you think hides a heap and a green poop bag
drops onto it with a crinkle. Step in one and you get a splat, then every unbagged heap on the lawn
turns up, nearest first, with stink lines, a green stink wave rolling across the grass and flies
that stay to circle. Clear the lawn and a wave of sunshine turns every bag gold. Installable PWA;
Canvas 2D fallback where WebGPU is missing.

Live: <https://austegard.com/games/scoop/>

## Controls

| input | does |
|---|---|
| tap / left-click long grass | sweep it |
| hold 0.4 s / right-click / Space over grass | bag it, or take the bag back |
| tap a number | if its bags match the number, sweep the rest of its neighbours |
| BAG button or F | taps bag instead of sweep |
| R | new lawn |

Three lawns: 9×9 with 10 heaps, 16×16 with 40, and 30×16 with 99, which stands up as 16×30 on a
portrait screen. The first patch you sweep and its eight neighbours are always clean. Best times
are kept per size in this browser.

## How it is built

Scoop is a reskin of [Sounding](../sounding/) with the same rules engine and render structure: one
full-screen fragment shader draws the whole lawn from per-cell timestamps (state, sweep time, bag
time, count), and a 32,768-slot GPU particle buffer with delayed spawns does the rest.

- **Grass tufts** are rounded-box SDFs with a bevel, textured with hashed blades whose tops sway in
  a wind that travels across the lawn, lit by a sun spot that follows the pointer.
- **Swept lawn** is mown short and striped by row, shaded along any edge where long grass still stands.
- **Poop** is four stacked ellipses drawn bottom up, each lit as a dome and creased where it sits on
  the one below, with three wavy stink lines rising from it. The one you stepped in is flattened onto
  a splat.
- **Bags** are a pear-shaped body, a pinched neck and two knot ears, joined with a smooth union,
  crinkled by perturbing the normal, and dropped in with a decaying bounce.
- **Particles**: grass clippings, poop chunks, stink clouds, confetti, gold sparkles, and flies,
  which keep their heap's position in the colour channels and spring back to it while they jink.
- **Sound** is synthesized: band-passed noise for a broom swish, a plastic crinkle and plop for a
  bag, a low-passed squelch with a falling blorp, a fly's sawtooth buzz, and a squeaky toy on a win.

## Testing

The Playwright checks live in [`oaustegard/experiments/scoop`](https://github.com/oaustegard/experiments/tree/main/scoop).
Not yet played on a real phone.
