# Snooker Break Simulator

Interactive 2D physics simulation comparing the traditional rearmost-red break shot to Shaun Murphy's third-red break shot from the 2026 World Snooker Championship final.

**[Live Demo](https://austegard.com/fun-and-games/snooker-break.html)** | **[Source Code](https://github.com/oaustegard/oaustegard.github.io/blob/main/fun-and-games/snooker-break.html)**

## Overview

In April 2026, Shaun Murphy and his coach Peter Ebdon (2002 world champion) introduced an unconventional break-off shot that targets the third red instead of the traditional rearmost red. Murphy reached the World final partly on the back of this innovation, claiming "I'm convinced there's a better shot than the one we've been playing for 100 years."

This simulator reproduces both shots so you can see the physics for yourself: the traditional break is a thin glance off the side of the rack that returns the cue ball to safety; Murphy's break makes deeper contact, channeling more energy into the pack and producing a wider spread of reds.

## Controls

- **Click anywhere on the table** to set the aim point
- **Spin pad**: drag the blue dot to set tip offset (top = topspin, down = backspin, sides = English). The red ring marks the 0.7r miscue limit
- **Cue speed slider**: 1–9 m/s (typical pro break speed is 6–7 m/s)
- **SHOOT** button or `Space` key to play the shot
- **R** to reset the rack, **C** to clear trails

### Demo presets

- **Traditional: rearmost red** — aim at the back-row corner on the cue's side, with backspin and right-hand sidespin. Frank Callan's classic safe break.
- **Murphy: third red** — aim at the third red along the cue-side line of balls (apex, row-2 corner, row-3 corner — the third one). "Higher up the rack" than traditional. Murphy's 2026 innovation.

## Physics Model

The simulation uses Marlow/Mathavan-fidelity physics, not arcade approximation:

- **Cloth friction**: Coulomb sliding friction (μ = 0.20) with proper slip-velocity-at-contact computation. Sliding ball decays to rolling state automatically; once rolling, lower rolling friction (μ = 0.01) takes over.
- **Ball-ball collisions**: Coefficient of restitution 0.94 along the line of centers, plus Coulomb-limited tangential friction (μ = 0.06) which produces the "throw" effect when sidespin is present.
- **Cushion bounces**: COR 0.70 with sidespin-to-tangential-velocity coupling, so right English on a straight cushion contact rebounds rightward as in real snooker.
- **Sidespin**: tracked as ω about the vertical axis, decays via contact-patch torque, transfers a small fraction on ball-ball contact.
- **Cue impact**: tip offset (vertical for top/back spin, horizontal for English) capped at 0.7 ball radii — beyond which a real cue would miscue.
- **Time step**: 0.5ms inner physics step, with continuous collision detection — required at break speeds (~7 m/s would tunnel a discrete-step simulator).

Constants from Marlow's *The Physics of Pocket Billiards* and Mathavan, Jackson & Parkin's papers in *Sports Engineering* on snooker-specific cloth and cushion behavior.

## Technical Details

- **Single-file architecture**: all HTML, CSS, and JavaScript in one `.html` file with no build step.
- **Rendering**: HTML5 Canvas, top-down 2D view, table dimensions in millimeters scaled to canvas pixels.
- **Frame loop**: `requestAnimationFrame` at ~60Hz, with 32 physics sub-steps per frame for stability.

## Credits

- **Creator**: Oskar Austegard ([@oaustegard](https://github.com/oaustegard))
- **Co-author**: Claude (Anthropic)
- **Inspired by**: NRK's article on Murphy's 2026 World Championship break shot, and the underlying snooker physics literature

---

For issues, feature requests, or contributions, please [open an issue](https://github.com/oaustegard/oaustegard.github.io/issues) on GitHub.
