# Tilt Invaders

Space Invaders for a phone, steered by tilting it. Your guns fire on their own.

**[Play](https://austegard.com/fun-and-games/tilt-invaders/)** | **[Source](https://github.com/oaustegard/oaustegard.github.io/blob/main/fun-and-games/tilt-invaders/index.html)**

## Playing

Press Launch, hold the phone the way you want to play, and press LEVEL: that pose becomes centre. Roll the phone left and right to fly; the ship's position follows the angle, and the pause menu sets how far you have to tilt for a full sweep (22° by default). Tap the dial in the bottom bar to re-level mid-game. iOS asks for motion permission when you press Launch.

Dragging on the playfield also moves the ship and takes over from tilt for a moment. On a computer, the mouse or the arrow keys move it, `Space` sets off a nuke, `P` pauses and `M` mutes.

Easy (the default) gives five ships, two nukes, slower enemy fire and a gentler march; Arcade gives three ships and one nuke. Each difficulty keeps its own best score and remembers the furthest wave reached, and you can start at wave 1, 6, 11 and so on once you have got there.

## Invaders

The formation marches as in the arcade game: across, down a row at the edge, faster as it thins out. If it reaches the ground, Earth is lost whatever ships you have left. Your four bunkers erode a few cells at a time where shots land, from both sides, and the invaders crush them as they come down.

| | points |
|---|---|
| squid, top row | 30 |
| crab, middle rows | 20 |
| drone, bottom rows | 10 |
| saucer | 50, 100, 150 or 300 |

The saucer crosses the top now and then and always drops a capsule. The 23rd volley you fire, and every 15th after it, scores 300 on the saucer, as it did in the arcade.

Later waves add more:

- From wave 3 (wave 4 on Easy), invaders peel off the bottom of the formation and dive at you, firing on the way, then loop back into place. A diver is worth double.
- From wave 4 the squids are armoured and take two hits; from wave 8 the crabs are too.
- From wave 6, half the drones split into two small invaders when shot, and the formations change shape: checkers, wings, a diamond, an arrow, columns, an hourglass, a crown.
- From wave 7 some shots are aimed at you.
- Every fifth wave is a mothership. It fires fans of shots, sprays a sweeping spiral, launches small invaders and charges a beam that tracks you before it fires; the red core underneath takes triple damage. Below half health it attacks faster.

Kills less than a second apart build a chain that raises the score of each kill, up to ×4. A shot that passes close under your ship without hitting it is a graze, worth 10. Clearing a wave scores a bonus for accuracy and another if you lost no ship on it. An extra ship comes every 10,000 points on Easy and every 15,000 on Arcade.

## Capsules

Some invaders drop a capsule when they die; fly into it to catch it.

| | | lasts |
|---|---|---|
| D | double cannon; a second D makes it faster, a third adds a third barrel | until you lose a ship |
| S | spread: three shots, then five | until you lose a ship |
| L | laser: shots that go through several invaders | until you lose a ship |
| R | rapid fire | 10 s, stacks to 20 |
| M | homing missiles, up to three per launch | until you lose a ship |
| W | two wingmen that fire with you; a second W gives them angled shots | until you lose a ship |
| O | a shield that takes one hit | until hit |
| T | time stop: invaders, their shots and the mothership freeze | 6 s |
| N | one more nuke, up to five | |
| + | extra ship | |

Catching the weapon you already have raises its level, up to III. Losing a ship costs one weapon level and the missiles, wingmen and rapid fire.

The red NUKE button clears every enemy shot, destroys every diving invader and the bottom two rows of the formation, destroys the saucer and takes 12% of the mothership's health.

At game over, Share sends a card with the score through the phone's share sheet; browsers without file sharing download it.

## How it's built

One self-contained HTML file, no build step. It installs as an app (Add to Home Screen) and plays offline through `sw.js`, which fetches the page network-first so updates show on the next load.

- **Rendering**: raw WebGPU into a half-float HDR target. Every sprite (invaders, saucer, mothership, ship, shots, capsules) is pixel art packed into one atlas, and the fragment shader draws each pixel as a small lit LED cell, bevelled towards the upper left. The bunkers are a cell grid uploaded as a texture whenever a shot chews into them. A full-screen shader draws three layers of drifting stars, a nebula from rotated value noise, and the night side of Earth along the bottom, with city lights and an atmosphere that turns red as the invaders get close. Particles live in a 16,384-slot ring buffer: the CPU writes each one once at birth, and the vertex shader computes its position from a closed form with drag and gravity, so a dead invader can burst into its own pixels at no CPU cost. A five-level bloom chain, shockwaves that bend the image, chromatic aberration on explosions, screen shake and ACES tone mapping finish the frame, and an optional CRT mode adds scanlines, an aperture grille and a curved screen. Browsers without WebGPU get a plainer Canvas 2D renderer.
- **Simulation**: fixed 120 Hz steps.
- **Sound**: everything is synthesized with Web Audio. Each block of five waves has its own key, chord progression and seeded lead melody on a 25% pulse wave with echo, over a square arpeggio and noise drums. The score has no bass part: the invaders' march is the bass. The score schedules every sixteenth note ahead of time, the game decides which of them carry a march step, and the formation moves when that note sounds, so the march walks down the current chord and tightens from half notes to sixteenths as the formation thins out. The saucer has its own warbling siren.
- **Input**: `deviceorientation` turned into gravity's component along the screen, as in [Plumb](../plumb/), so it works sitting up or lying down.
