# gPu(doom)

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
| ctrl, F, click | fire |
| 1 – 7 | weapons |
| tab, M | automap; + and − or the mouse wheel zoom it (MAP and +/− buttons on a phone) |
| esc | DOOM's menu: New Game picks the episode and skill, Options holds resolution, tilt and level warp |
| phone | swivel or tilt the phone sideways to turn, tilt it forward and back to look up and down, ◎ recentres; the left thumb drags a floating stick to walk and strafe, the right thumb drags to turn |

On a phone, the pose at Play is level: the back camera's elevation against gravity sets the look pitch, the screen's roll steers, and swivel (the rotation rate projected on gravity) turns directly. The menu switches each one on or off and sets the turn speed. Looking up and down shears the view by moving the horizon row, as later source ports do; the original engine could not. A death restarts the level on the next use press. The menu also loads your own `doom1.wad`,
`doom.wad` or `doom2.wad`.

## How it is built

The game state lives in seven GPU buffers: textures and tables (`G`), level geometry (`M`), sectors,
things, line specials, the player and world counters, and the framebuffer. `shaders.js` writes the
buffer offsets of each WAD and level into the WGSL as constants and compiles one shader module per
level.

- **Rendering.** `render` runs one thread per screen column. The projection follows the screen
  height, as Doom's 160 does at 200 lines, so a widescreen window sees more to the sides. Each thread walks the BSP tree front
  to back with an explicit 64-entry stack, because WGSL has no recursion, and skips any node whose
  bounding box the column's ray misses. It draws each wall piece, floor and ceiling as it reaches
  it, then stops once a solid wall closes the column. Floors and ceilings are textured per pixel
  from the plane distance, which replaces Doom's visplanes. Lighting uses Doom's `zlight` and
  `scalelight` formulas against the WAD's COLORMAP.
- **Sprites.** `project` runs one thread per thing and appends each visible sprite to a list with
  an atomic counter. The column threads then draw masked mid-textures and sprites through a depth
  buffer. A floor or ceiling pixel stores the depth of the wall that ended its span, which
  reproduces Doom's sprite clipping by wall silhouettes.
- **Game tic.** A tic is five kernels in a row, four of them single-threaded:
  - `ticPlayer` does input, thrust, collision through the blockmap, sliding and stepping, and the
    weapon's state machine and shots.
  - `ticSight` runs one thread per monster to check whether it can see the player.
  - `ticMobjs` runs every thing's state machine, with the monster AI, attacks and missiles.
  - `ticActivate` runs the line specials that were crossed or used during the tic.
  - `ticWorld` moves doors, lifts, floors, crushers and light effects.

  WGSL forbids recursion, and DOOM's game code recurses in two places. Crossing a teleport line
  calls `tryMove` from inside `tryMove`, so line activations go through a queue in the world
  buffer. A monster's state action can change its own state, or damage something whose state
  then changes, so actions and damage write a requested state that only the state loop applies.
  Heavy functions such as `tryMove` and the hitscan trace each have one call site, because the
  shader compiler inlines every call.
- **Specials as data.** `specials.js` encodes Doom's 140-odd line specials as one word each:
  trigger, repeatability, action, argument and key. The WGSL dispatches on the action code.
  `info.js` holds Doom's state and thing tables, generated from `info.c`.
- **Automap and face.** The renderer sets bit 31 of a line's special word when it draws the
  line, which stands in for DOOM's `ML_MAPPED`. With the map open, `amClear` blanks the view and
  `amLines` runs one thread per line, plus seven for the player's arrow, each drawing its line
  in DOOM's colours. The status bar face is DOOM's `ST_updateFaceWidget`, run once a tic in
  `ticWorld`.
- **Smooth motion.** The game advances at DOOM's 35 tics a second, and the screen is drawn on
  every display frame. `ticSave` records each thing's position and each sector's floor and
  ceiling at the start of a tic, and `viewSetup` blends the view between the last two tics by how
  far the clock has moved toward the next one; `project` and `render` blend things and sectors
  the same way. Mouse, gyro and drag turns reach the view on the next frame and the following tic
  takes their sum, so turning is not delayed to tic rate. A frame without a tic costs about 1 ms
  on an iPhone.
- **Menus and intermission.** DOOM's menus (`m_menu.c`) and level-end screens (`wi_stuff.c`) are
  drawn on a 2D canvas from the WAD's own `M_` and `WI` graphics, at DOOM's 320×200 coordinates.
  Skill sets which things spawn (the map's per-skill flags), halves damage and doubles ammo on the
  easiest skill, and on Nightmare doubles ammo, halves the demons' run and bite tics, speeds up
  imp, cacodemon and baron fireballs, zeroes monster reaction time, and lets a corpse that has lain
  12 seconds rise again at its spawn point (`P_NightmareRespawn`).
- **Music.** `music.js` reads DOOM's MUS songs and the standard MIDI files Freedoom ships, and
  plays them in an AudioWorklet through an OPL-style FM synthesizer: 18 two-operator voices with
  OPL2 waveforms, envelope rates and feedback, set from the WAD's GENMIDI patches with DOOM's
  volume and frequency curves from Chocolate Doom's `i_oplmusic.c`.
- **What JavaScript does each frame.** It writes the input, encodes N tics plus the render and
  status bar passes, and copies 1 KB of the world buffer back to the CPU. That readback carries the
  sound queue and the level-exit flag.

## Releasing

Run `python3 fun-and-games/doom/stamp.py` before committing a change to any of the modules. It
stamps every `import` with one version. GitHub Pages lets a browser cache each file for ten
minutes on its own clock, so without the stamp a phone can run a new `index.html` against an old
`engine.js`.

## Not done yet

Monster behaviour is a port of DOOM's `A_Look`, `A_Chase` and attack functions, but it has had
little play-testing, and the music synth has been checked by its spectrum, not by ear.

## Licences

The engine code is GPL-2.0 (`LICENSE.md`), because it follows id Software's Doom source and its
tables come from `info.c`. `e1.wad.gz` is Freedoom 0.13.0 cut down to episode one's maps and the
graphics, sounds and music they use. Freedoom is BSD-licensed (`FREEDOOM-COPYING.txt`).
