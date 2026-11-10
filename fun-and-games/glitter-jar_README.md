# Glitter Jar

A jar of glitter on your GPU. Shake your phone to stir it up and watch it settle; tilt the phone and
the settled glitter pours toward the low side and sparkles as the light moves across it.

Live: <https://austegard.com/fun-and-games/glitter-jar.html>

## Controls

| input | effect |
|---|---|
| shake the phone | throws the glitter into a swirl that slowly calms down |
| tilt the phone | sets which way is down, and moves the light the flakes catch |
| drag | stirs the glitter along the stroke |
| tap or click | puffs the glitter away from that point |
| **Shake** or the space bar | a shake for computers |
| **Colour** or `C` | Rainbow, Gold, Silver, Rosé or Galaxy |
| ← → | tips the jar on a computer; ↑ or ↓ sets it upright |
| **Use motion** | on iPhone and iPad, asks for motion access, which iOS requires |

## How it works

Every flake is a particle in a WebGPU storage buffer: 40,000 on a phone, about 150,000 on a laptop screen,
and at most 260,000. One compute pass per frame moves them all. Each flake is pulled toward the local flow of the
liquid, which is a slowly drifting, divergence-free swirl whose strength rises with a shake and dies
away over a few seconds, plus a sinking speed that differs from flake to flake, so the big flakes
settle first. Each flake keeps its own distance from the glass, so settled glitter lies in a layer.

Flakes tumble while they move and lie still once they settle. A flake glints when its angle lines up
with the light, and the light follows the tilt of the phone, so a still pile sparkles as you tilt it.
The flakes are drawn as small instanced hexagons, with four-point stars on the ones that glint.

Without WebGPU the page says so. It needs a recent Chrome, Edge or Safari.
