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

The spirit-level vial in the header shows roll against the neutral angle, with ticks at the dead zone
and at full speed. Tapping it sets the current angle as level; Start and Resume do the same, so you
can play lying down. Keyboard works on a desktop: arrows, X/Z, space, C, P.

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
  per frame. The gravity vector comes from `deviceorientation` as (cos β · sin γ, sin β) in screen
  coordinates. Each grain has a hashed depth and is pushed back once it sinks deeper than that into
  the downhill wall, so the dust pools as a layer that sloshes like liquid in a vial when you tilt.
  Locks and line clears push radial bursts through it. Without WebGPU, or after a device loss, a
  Canvas 2D version of the same simulation runs 1,600 grains.
- **PWA**: `manifest.json` (fullscreen, portrait), `sw.js` precaches the shell and refreshes it in
  the background, screen wake lock while playing, haptics through `navigator.vibrate` where the
  browser supports it (Android, not iOS).

## Testing

The Playwright checks (rules, controls, and an offscreen run of both WGSL modules) live with the
experiment that produced this page: [`oaustegard/experiments/plumb`](https://github.com/oaustegard/experiments/tree/main/plumb).
Nothing here has run on a real phone yet. The jab and shake thresholds are first guesses and the
most likely things to need tuning.
