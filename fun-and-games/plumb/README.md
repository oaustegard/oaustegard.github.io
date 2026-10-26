# Plumb

Falling blocks for a phone, played by tilting it. Installable PWA; SVG draws the well and pieces,
WebGPU runs a particle field behind it that settles under the phone's real gravity, and the motion
sensors replace most of the buttons.

Live: <https://austegard.com/fun-and-games/plumb/>. Open it on a phone, press Start (iOS asks for
motion access then), and use Add to Home Screen to install it full-screen and offline.

## Controls

| motion | does | touch fallback |
|---|---|---|
| roll left / right | steers; speed scales with the angle past a 4° dead zone, up to 15.5 columns/s at the "full speed" angle (default 24°) | drag sideways, one column per cell width |
| tip the top toward you | soft drop, up to 20×: a steeper well falls faster | drag down |
| jab the phone forward | hard drop: a spike along the screen normal over 15 m/s², dominant over the other axes | swipe down |
| shake sideways | hold: three alternating x-axis spikes inside 700 ms | swipe up |
| tap | rotate clockwise; left third of the well rotates counter-clockwise | same |

Start, Resume and New game each spend about a second reading how you hold the phone and treat
that pose as level, so sitting up, lying down or holding the phone overhead all play the same. The
spirit-level vial in the header shows roll against that level, with ticks at the dead zone and at
full speed; tapping it re-levels mid-game. "FAST" next to the tilt readout means the tip soft-drop
is on. Roll and tip are read from gravity's components along the screen's own axes (cos β · sin γ
and sin β), not from the raw γ angle, which flips sign once the screen faces the floor. Keyboard works on a desktop: arrows, X/Z, space, C, P.

## How it is built

- **Rules.** 10×20 well with two hidden rows, 7-bag randomizer, SRS rotation with the standard
  wall-kick tables, ghost, hold, three-piece preview, 0.5 s lock delay with at most 15 resets,
  guideline gravity curve and scoring (four lines is called "Plumb!").
- **Tilt steering is analog.** Roll sets a lateral velocity that accumulates fractional columns; the
  piece leans by that fraction between steps, so a gentle tilt reads as drift, not as a twitchy
  per-column jump.
- **SVG** holds 200 pre-built cell rects updated only on lock, 4 active and 4 ghost rects moved by
  one transform per frame, per-piece gradients, and the board tilts slightly in 3D with the phone.
- **WebGPU**: 16,384 grains (4,096 with reduced motion), one compute pass and one instanced draw
  per frame. The dust's gravity vector comes from `deviceorientation`, in screen
  coordinates relative to the calibrated pose, so the dust is a readout of the steering: at level it
  rests along the bottom, and it slides toward the side the piece is drifting to, harder the steeper
  the roll. Each grain has a hashed depth and is pushed back once it sinks deeper than that into the
  wall it is sliding toward, so it moves as a layer. Locks and line clears push radial bursts through it. Without WebGPU, or after a device loss, a
  Canvas 2D version of the same simulation runs 1,600 grains.
- **PWA**: `manifest.json` (fullscreen, portrait), `sw.js` precaches the shell and refreshes it in
  the background, screen wake lock while playing, haptics through `navigator.vibrate` where the
  browser supports it (Android, not iOS).

## Testing

The Playwright checks (rules, controls, and an offscreen run of both WGSL modules) live with the
experiment that produced this page: [`oaustegard/experiments/plumb`](https://github.com/oaustegard/experiments/tree/main/plumb).
Nothing here has run on a real phone yet. The jab and shake thresholds are first guesses and the
most likely things to need tuning.
