# Doom on the GPU

The Doom engine rewritten as WebGPU compute shaders, playing Freedoom's first episode. The renderer
and the game simulation both run on the GPU. JavaScript reads the WAD, writes the keys into a
uniform buffer each frame, and plays the sounds that the GPU queues.

Live: <https://austegard.com/fun-and-games/doom/>. It needs a browser with WebGPU: a recent Chrome,
Edge or Safari.

## Controls

| input | does |
|---|---|
| W A S D, arrows | move and turn; A and D strafe |
| mouse | turn and look up or down, after a click on the screen captures the pointer |
| shift | run |
| space, E | open doors and press switches |
| alt + ← → | strafe with the arrow keys |
| esc | menu |
| phone | swivel or tilt the phone sideways to turn, tilt it forward and back to look up and down, ◎ recentres; the left thumb drags a floating stick to walk and strafe, the right thumb drags to turn |

On a phone, the pose at Play is level: the back camera's elevation against gravity sets the look pitch, the screen's roll steers, and swivel (the rotation rate projected on gravity) turns directly. The menu switches each one on or off and sets the turn speed. Looking up and down shears the view by moving the horizon row, as later source ports do; the original engine could not. A death restarts the level on the next use press. The menu also loads your own `doom1.wad`,
`doom.wad` or `doom2.wad`.

## How it is built

The game state lives in seven GPU buffers: textures and tables (`G`), level geometry (`M`), sectors,
things, line specials, the player and world counters, and the framebuffer. `shaders.js` writes the
buffer offsets of each WAD and level into the WGSL as constants and compiles one shader module per
level.

- **Rendering.** `render` runs one thread per screen column. Each thread walks the BSP tree front
  to back with an explicit 64-entry stack, because WGSL has no recursion, and skips any node whose
  bounding box the column's ray misses. It draws each wall piece, floor and ceiling as it reaches
  it, then stops once a solid wall closes the column. Floors and ceilings are textured per pixel
  from the plane distance, which replaces Doom's visplanes. Lighting uses Doom's `zlight` and
  `scalelight` formulas against the WAD's COLORMAP.
- **Sprites.** `project` runs one thread per thing and appends each visible sprite to a list with
  an atomic counter. The column threads then draw masked mid-textures and sprites through a depth
  buffer. A floor or ceiling pixel stores the depth of the wall that ended its span, which
  reproduces Doom's sprite clipping by wall silhouettes.
- **Game tic.** A tic is four single-thread kernels in a row:
  - `ticPlayer` does input, thrust, collision through the blockmap, sliding and stepping.
  - `ticMobjs` runs every thing's state machine.
  - `ticActivate` runs the line specials that were crossed or used during the tic.
  - `ticWorld` moves doors, lifts, floors, crushers and light effects.

  Line activations go through a queue in the world buffer. Without it, crossing a teleport line
  would call `tryMove` from inside `tryMove`, and WGSL forbids that cycle.
- **Specials as data.** `specials.js` encodes Doom's 140-odd line specials as one word each:
  trigger, repeatability, action, argument and key. The WGSL dispatches on the action code.
  `info.js` holds Doom's state and thing tables, generated from `info.c`.
- **What JavaScript does each frame.** It writes the input, encodes N tics plus the render and
  status bar passes, and copies 1 KB of the world buffer back to the CPU. That readback carries the
  sound queue and the level-exit flag.

## Not done yet

Weapons and monsters. Monsters animate but don't act, and the gun isn't drawn or fired. The
automap, menus and intermission screens are also missing.

## Licences

The engine code is GPL-2.0 (`LICENSE.md`), because it follows id Software's Doom source and its
tables come from `info.c`. `e1.wad.gz` is Freedoom 0.13.0 cut down to episode one's maps and the
graphics and sounds they use. Freedoom is BSD-licensed (`FREEDOOM-COPYING.txt`).
