# Careen

Tile matching for a phone, where tilting the phone sets which way the tiles fall. Every tile slides
to the low wall; three or more of a colour in a row or column clear. New tiles pour in from the high
side on a timer, and the game ends when a pour finds no room. Installable PWA; WebGPU draws the
board, with a Canvas 2D fallback where WebGPU is missing.

Live: <https://austegard.com/games/careen/>. Open it on a phone, press Start (iOS asks for motion
access then), and use Add to Home Screen to install it full-screen and offline.

## Controls

| input | does |
|---|---|
| tilt past the threshold (16° on Easy, 13° on Normal) | gravity turns left, right or up; back inside the threshold it falls down again |
| swipe a tile | swap it with the neighbour in that direction, or move it into an empty cell |
| tap two neighbouring tiles | the same swap |
| ◎ button | make the current pose level |
| arrow buttons, arrow keys or WASD | turn gravity when tilt steering is off or unavailable |
| P, Esc or Space | pause |

Hold the phone the way you want to play when you press Start: that pose is level, and tiles fall
toward the bottom of the screen. Tilting is measured from it, so lying down works as well as sitting
up. The dial in the bottom bar shows a ball where the tiles would go and a dashed ring at the turning
threshold; a turn needs the tilt to hold for 0.12 s, and a turned direction holds until the tilt falls
under 70% of the threshold, so a shaky hand does not flip the board. Pause has a slider for the
threshold (8° to 30°).

## Rules

- **Levels.** Easy: 7×9 board, five colours, half full at the start, three tiles every 9 s, hints.
  Normal: 8×10, six colours, four tiles every 6 s. Every 30 tiles cleared is a level. Each level
  shortens the pour interval (5% on Easy down to 3 s, 7% on Normal down to 2 s), and every fourth
  level adds a tile to each pour, so no pace survives for ever. Tuned by simulation: a player who
  makes the first clearing move they find every 4 s lasts a median 13 minutes on Easy and 5 on
  Normal; one move a second, 18 and 7.
- **Pours** drop each new tile into the line along gravity with the most room, so they land on the
  shortest stacks. The next pour's colours show above the timer. The timer bar and the board's high
  edge turn red when fewer than two pours' worth of cells are free.
- **Chains.** A clear lets the tiles above it fall, which can line up the next clear. Each clear in
  a cascade multiplies the score by the chain count. A gravity turn during a cascade keeps the chain
  going; a swap starts a new one.
- **Score.** 10 a tile, 20 more for each tile a run has past three, times the chain.
- **Hints** (Easy only). After 7 s with nothing happening, the game looks for a gravity turn that
  would clear something, then for a swap, and lights the arrow or the pair.

## How it is built

- `logic.js` holds the rules as plain state (pack, match, swap, pour, fill, hint), with no DOM and no
  timing. `node tests/careen-logic.mjs` tests it, including a 400-move random game that checks that
  tile records and cells never fall out of sync.
- Tiles slide toward their cells with acceleration, so a turn mid-slide bends the motion
  and does not restart it. A landing squashes the tile along the direction it was moving.
- **WebGPU**: a full-screen pass draws the well, a faint grid, streaks flowing toward the low wall,
  a glow on that wall and the red danger pulse. Tiles are one instanced draw: each shape is a signed
  distance field (circle, rounded square, triangle, diamond, hexagon, cross), bevelled from
  object-space finite differences of a height field, lit by a light that follows the phone's tilt,
  with a shadow cast toward the low wall. A compute pass moves the sparks from each clear under the
  board's gravity and bounces them off its walls. The shapes differ per colour, so the game does not
  depend on telling red from green.
- **Canvas 2D** fallback draws the same board flat; `?renderer=2d` forces it.
- Sound is synthesized in Web Audio: the pops climb a pentatonic scale with the chain.
- `?seed=N` fixes the tile colours. `window.__careen` exposes state and moves for tests.
