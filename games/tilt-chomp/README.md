# Tilt Chomp

A maze-chase arcade game steered by tilting your phone.

**[Play](https://austegard.com/games/tilt-chomp/)** | **[Source](https://github.com/oaustegard/oaustegard.github.io/blob/main/games/tilt-chomp/index.html)**

## Playing

Hold the phone at whatever angle is comfortable and press Start; that angle counts as level. Tilt toward the direction you want to go. The dial in the bottom bar shows your current tilt as a marble; tap it to re-level. Small tilts inside a 7° dead zone are ignored, so you can hold a direction without flicker. iOS asks for motion permission when you press Start.

Without a motion sensor, swipe on the maze or use the arrow keys (or WASD). `P` or `Esc` pauses, `M` mutes.

At game over, Share sends a PNG card with your score, level, pellets eaten and the maze as you left it, through the phone's share sheet; browsers without file sharing download it instead.

## What's in it

- The classic 28×31 maze with 240 pellets, 4 power pellets and the side tunnel.
- Four ghosts with their arcade targeting: one chases you directly, one aims four tiles ahead of you, one flanks using the first ghost's position, and one gives up and retreats when it gets close. They alternate scatter and chase on the arcade schedule, turn blue and flee after a power pellet, and return to the house as eyes when eaten.
- Ghost chains score 200, 400, 800 and 1600. Fruit appears after 70 and 170 pellets, an extra life comes at 10,000, and speeds and fright time change by level.

## How it's built

One self-contained HTML file, no build step. It installs as an app (Add to Home Screen) and plays offline: `manifest.json` and the icons make it installable, and `sw.js` caches the page, icons and fonts.

- **Rendering**: a single WebGPU fragment shader draws the whole scene. The walls come from a signed-distance field computed once on the CPU (16 samples per tile) and uploaded as a texture; the shader draws a neon tube along an inset of that field and brightens the side facing the way you tilt. Pellets are read from a storage buffer, and the chomper, ghosts and fruit are drawn as signed-distance shapes from a small entity buffer. Browsers without WebGPU get a Canvas 2D renderer that reuses the same distance field.
- **Sound**: synthesized with Web Audio: the chomp, a siren that speeds up as the maze empties, fright and returning-eyes sirens, and an original start jingle.
- **Input**: `deviceorientation` mapped through the screen orientation, with a dead zone and axis hysteresis; swipe and keyboard as fallbacks.
