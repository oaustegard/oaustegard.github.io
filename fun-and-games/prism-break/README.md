# Prism Break

A brick-breaking arcade game for a phone, steered by tilting it.

**[Play](https://austegard.com/fun-and-games/prism-break/)** | **[Source](https://github.com/oaustegard/oaustegard.github.io/blob/main/fun-and-games/prism-break/index.html)**

## Playing

Press Start, hold the phone the way you want to play, and press PLUMB: that pose becomes level. Roll the phone left and right to slide the paddle; the paddle's position follows the angle, and the pause menu sets how far you have to tilt for a full sweep (22° by default). Tap the dial in the bottom bar to re-level mid-game. iOS asks for motion permission when you press Start.

Tap to launch the ball and to fire lasers; hold to keep firing. Dragging on the playfield also moves the paddle and takes over from tilt for a moment. On a computer, the mouse or the arrow keys move it, click or space launches and fires, `P` pauses and `M` mutes.

Easy (the default) gives five balls and a slower ball; Arcade gives three and a faster one. Each difficulty keeps its own best score and remembers the furthest level reached, and you can start at any fifth level you have unlocked.

## Levels and bricks

Twenty hand-made levels, then levels generated from the level number without end: a symmetric shape, with tougher bricks, steel and bombs mixed in more often as you go. Every five levels is a new world with its own colour and its own tune.

- Glass bricks break in one hit, silver in two, gold in three; damaged ones crack.
- Steel never breaks.
- Bombs blow up their eight neighbours, and set off any bombs among them.
- Rainbow prize bricks always drop a capsule.

Breaking bricks without touching the paddle builds a chain; each brick in the chain adds 10% to the score, up to ×3.5, and the brick notes climb the scale as it grows.

## Capsules

| | | lasts |
|---|---|---|
| E | wider paddle, stacks twice | until you lose a ball |
| L | lasers from the paddle ends; a second L adds a centre gun and fires faster | until you lose a ball |
| M | splits every ball in three, up to twelve | |
| S | slows the ball | 15 s |
| C | the ball sticks to the paddle; tap to release | 20 s |
| F | fireball: goes straight through everything but steel | 10 s |
| G | giant ball: bigger, and damages every brick it touches | 14 s |
| B | an energy barrier across the floor that saves one ball; stacks to three | until used |
| + | extra ball | |
| R | shrinks the paddle (from level 4) | 12 s |

An extra ball also comes every 25,000 points.

At game over, Share sends a card with the score and the bricks you left through the phone's share sheet; browsers without file sharing download it.

## How it's built

One self-contained HTML file, no build step. It installs as an app (Add to Home Screen) and plays offline through `sw.js`, which fetches the page network-first so updates show on the next load.

- **Rendering**: raw WebGPU into a half-float HDR target. A full-screen shader draws the field, a grid that pulses on the music's beat and the neon walls. Bricks, ball, paddle, capsules and lasers are instanced quads shaded with signed-distance functions in one pipeline. Particles live in a 16,384-slot ring buffer: the CPU writes each one once at birth, and the vertex shader computes its position from a closed form with drag and gravity, so shards, sparks and embers cost nothing on the CPU after they spawn. A five-level bloom chain, shockwaves that bend the image around each break, chromatic aberration on explosions, screen shake and ACES tone mapping finish the frame. Browsers without WebGPU get a plainer Canvas 2D renderer.
- **Physics**: fixed 120 Hz steps, with the ball sub-stepped so it never moves more than half its radius at a time; circle-against-box collisions with the bricks, and the paddle sets the rebound angle from where the ball lands.
- **Sound**: everything is synthesized with Web Audio. The music is an original chiptune: each world has a key, a chord progression, a tempo and a lead melody generated from a seed, played on a 25% pulse wave with echo over a square arpeggio, triangle bass and noise drums, with a break every fourth loop.
- **Input**: `deviceorientation` turned into gravity's component along the screen, as in [Plumb](../plumb/), so it works sitting up or lying down.
