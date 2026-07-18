# Ball Maze

A PWA homage to the classic wooden "ball in a maze" (labyrinth) toy: tilt
your phone to roll a steel ball through a maze from the top-left start to the
green goal.

**Play it**: [austegard.com/fun-and-games/ball-maze/](https://austegard.com/fun-and-games/ball-maze/)

## Gameplay

- **Tilt to move** — the ball accelerates in the direction you tilt the
  device (DeviceOrientation). On iOS the Start button requests motion
  permission, as required.
- **Points for distance** — you earn 1 point for each *new* cell of ground
  you reach. Backtracking (or re-covering ground after falling in a hole)
  earns nothing, so hole penalties actually stick — repeated deaths can't
  be farmed back into a rising score.
- **Endless levels, generated at runtime** — each level generates a fresh
  random maze (recursive backtracker), starting at 6×9 cells and growing
  every level until cells would drop below 22 px on the current screen;
  after that, difficulty keeps ramping through hole count (up to 14 on the
  path plus 18 decoys).
- **Level bonus** — completing level *N* awards 100 × *N* points, so the
  stakes keep rising.
- **Holes** — from level 2 on, holes appear in the board. Roll over one and
  the ball drops in: −25 points and back to the start. Like the physical
  toy, most holes sit **on** the solution path, offset to one side of the
  corridor so a narrow safe edge remains — hug the wall to get past. The
  rest are decoys in dead ends. The geometry guarantees the open side is
  always passable, so every maze stays winnable.
- **Best score** — persisted in `localStorage`.
- **Version check** — tap the green goal disc to toggle a debug readout in
  the score slot: game version, the orientation angle currently being
  countered, and the viewport dimensions (e.g. `v11 a90 844x390`). Tap
  again to restore the score. Handy for verifying which build an
  installed copy is actually running.
- **Continue where you left off** — the run (current level + score) is saved
  to `localStorage` on every score change and level transition. Reopening
  the app offers "Continue · Level N" alongside "Start over"; resuming
  regenerates a fresh maze of the saved level.

No tilt sensor? Arrow keys / WASD or dragging on the board work as
fallbacks, so it's playable on desktop too.

## PWA

Self-contained directory (own `manifest.webmanifest`, `sw.js`, icons) so the
service-worker scope stays isolated to `/fun-and-games/ball-maze/` — same
pattern as `/motion-player/`. The service worker precaches the app shell and
uses stale-while-revalidate, so the game is installable and playable offline.

## Implementation notes

- Single canvas; the static board (wood, walls, holes, goal) is prerendered
  to an offscreen canvas per level, so each frame only blits it and draws the
  ball.
- Maze walls are merged into axis-aligned rects; ball collision is
  circle-vs-AABB closest-point resolution with restitution, integrated at a
  fixed 120 Hz timestep.
- **Orientation lock without the OS lock**: iOS Safari can't
  `screen.orientation.lock()`, so when the OS flips the viewport to
  landscape the app counter-rotates `#app` back to device-natural portrait
  with a CSS transform — visually the game never leaves portrait, even with
  the iOS orientation lock off. Tilt input uses raw device beta/gamma
  (identity mapping), which stays correct because the UI is always in
  device coordinates; pointer-drag deltas are un-rotated to match. The
  counter-rotation is applied synchronously on the orientation-change
  events (no debounce) so it lands inside the OS's own rotation animation
  and reads as one motion — no masking; frame analysis showed the OS
  animation ends cleanly on the corrected layout on its own. Installed
  (home-screen) apps can leave `screen.orientation` stuck after rotating,
  so the angle is taken from whichever source reports one —
  `window.orientation` still updates in standalone mode — with a
  last-resort quarter-turn inferred from the tilt sensor's gravity vector
  when every API is stuck. Native
  `screen.orientation.lock('portrait')` is still attempted at
  game start for platforms that support it (installed Android PWAs).
- A resize or orientation flip re-lays-out the **same** maze at the new
  size and carries the ball across proportionally — mid-level progress
  survives rotation.
