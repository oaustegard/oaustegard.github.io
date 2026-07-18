# Ball Maze

A PWA homage to the classic wooden "ball in a maze" (labyrinth) toy: tilt
your phone to roll a steel ball through a maze from the top-left start to the
green goal.

**Play it**: [austegard.com/fun-and-games/ball-maze/](https://austegard.com/fun-and-games/ball-maze/)

## Gameplay

- **Tilt to move** — the ball accelerates in the direction you tilt the
  device (DeviceOrientation). On iOS the Start button requests motion
  permission, as required.
- **Points for distance** — you earn 1 point for every cell-length of ground
  the ball covers.
- **5 levels, easy to hard** — each level generates a fresh random maze
  (recursive backtracker), growing from 6×9 up to 14×21 cells.
- **Level bonus** — completing level *N* awards 100 × *N* points.
- **Holes** — from level 2 on, holes appear in the board. Roll over one and
  the ball drops in: −25 points and back to the start. Like the physical
  toy, most holes sit **on** the solution path, offset to one side of the
  corridor so a narrow safe edge remains — hug the wall to get past. The
  rest are decoys in dead ends. The geometry guarantees the open side is
  always passable, so every maze stays winnable.
- **Best score** — persisted in `localStorage`.

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
- Device orientation is remapped by `screen.orientation.angle` so tilt stays
  correct in any screen orientation.
