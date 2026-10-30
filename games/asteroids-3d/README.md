# Asteroids 3D

First-person Asteroids: the rocks are all around you, and you fly through them.

**[Play](https://austegard.com/games/asteroids-3d/)** | **[Source](https://github.com/oaustegard/oaustegard.github.io/blob/main/games/asteroids-3d/index.html)**

## Playing

- **Tilt** to steer. Hold the phone at whatever angle is comfortable and press Launch; that angle counts as level. Tilt the top toward you to climb, away to dive, and rock it side to side (or turn it like a steering wheel in landscape) to turn. The crosshair button re-levels. "Invert pitch" in the menu flips the climb direction.
- **Tap** anywhere to fire; hold for rapid fire. The two guns alternate. When a rock sits inside the orange brackets, shots lead it so they arrive where it will be.
- **Slide** the bar on the right up to thrust and down to brake. It springs back to the middle when you let go, and the ship keeps coasting. "Throttle on the left" in the menu moves it to the other side.

On a keyboard: arrows or WASD steer, Space fires, R thrusts, F brakes, P pauses, M mutes.

Pick a level in the menu; the choice is remembered and each level keeps its own best score.

| | Easy (default) | Advanced |
|---|---|---|
| Rock speed | under half | full |
| Rocks per wave | 3 + wave, up to 12 | 5 + 2 × wave, up to 19 |
| Aim assist cone | 16° | 7.5° |
| Hits | shots count a near miss, rocks must come closer to hit you | exact |
| Ships | 5, extra every 5,000 | 3, extra every 10,000 |
| Shield after respawn | 5 s | 3 s |
| Steering | 75% turn rate, full turn at 30° tilt | full rate at 24° |

Big rocks split into two medium ones, medium into two small, small ones vanish (20, 50 and 100 points). Clearing a wave scores 500 times the wave number and the next wave has two more rocks. A rock hitting you costs a ship. At game over, Share sends a PNG card with the last view of the field and your score through the share sheet, or downloads it.

The radar at the bottom maps every rock by direction: the centre is dead ahead, the dashed ring is level with you, the rim is straight behind. Red dots are close.

The [original 2D version](../asteroids.html) is still on the site.

## How it's built

One self-contained HTML file with no build step and no engine. It installs as an app and plays offline (`manifest.json`, `sw.js`, icons).

- **World**: space is a cube 360 units across that wraps in all three directions, the 3D version of the arcade screen wrap. Everything is drawn relative to the ship at its nearest copy, and fog hides the seam.
- **Rendering** (WebGPU, WGSL):
  - Rocks are one icosphere drawn instanced. The vertex shader displaces each instance with its own seeded noise and computes smooth normals by finite differences, so no two rocks share a shape. The fragment shader adds a noise bump map in rock space, faded with distance, and lights it with the sun, a hemisphere fill, a rim, a dim headlight and up to eight point lights from explosions.
  - The nebula is baked once into a cube map at load; the sky pass samples it and adds two layers of stars, and the rocks' fog fades to the nebula colour behind them.
  - Bullets, sparks, flashes and the speed dust are one instanced pass of camera-facing capsules, blended additively.
  - The scene renders to a 16-bit float target, then a five-level bloom, ACES tone mapping, vignette, slight chromatic aberration (more when hit) and dither.
  - Render resolution drops once if the first seconds run slow. Browsers without WebGPU get a message and a link to the 2D game.
- **Sound** (Web Audio, all synthesized): explosions and near-miss whooshes are placed in 3D with HRTF panners that follow the ship's orientation, so headphones tell you where a rock went off. Everything runs through a generated stereo convolution reverb and a compressor. The engine is detuned saws and filtered noise opened up by the throttle, with a retro-thruster hiss for the brake and wind that rises with speed. The arcade heartbeat quickens as a wave thins out, under a slow A-minor drone.
- **Tilt**: the gravity direction is rebuilt from `deviceorientation` beta and gamma and rotated into the screen's frame, so steering works the same in portrait and landscape and doesn't flip when the phone is held upright.
