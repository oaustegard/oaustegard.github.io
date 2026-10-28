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
| esc | DOOM's menu: New Game picks the episode and skill, Load Game and Save Game use six slots kept in the browser, Options holds resolution, tilt and level warp |
| iddqd, idkfa, idfa, idclip, iddt, idclevXY | DOOM's cheats, typed while playing |
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
  - `ticSave` (one thread per thing and sector) keeps the last tic's positions for smooth motion.
  - `ticPlayer` does `P_PlayerThink`: input, thrust, the view height, use, and the weapon's state
    machine and shots.
  - `ticMobjs` walks DOOM's thinker list in its order: the map's things as they were spawned,
    with the player's movement (`P_SlideMove` and stepping) at its own place among them, then the
    light effects, then everything spawned since. Monsters look, chase and attack here, checking
    sight by DOOM's walk of the BSP.
  - `ticActivate` runs the line specials that were crossed or used during the tic.
  - `ticWorld` moves doors, lifts, floors and crushers, and runs switch timers and the face.

  Things sit in per-cell lists of the blockmap, as in DOOM, so collision tests only the things
  near a move. With every one of E1M6's 192 monsters awake, a tic takes about 2.9 ms on a Mac.

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
  Each graphic is upscaled 4× once with Scale2x (twice), which keeps the pixel art's edges sharp,
  and the menu's items are measured and zoomed to fill the window (up to 1.6× DOOM's layout, below
  the logo on the title screen), with a drop shadow against the title art.
  Skill sets which things spawn (the map's per-skill flags), halves damage and doubles ammo on the
  easiest skill, and on Nightmare doubles ammo, halves the demons' run and bite tics, speeds up
  imp, cacodemon and baron fireballs, zeroes monster reaction time, and lets a corpse that has lain
  12 seconds rise again at its spawn point (`P_NightmareRespawn`).
- **Music.** `music.js` reads DOOM's MUS songs and the standard MIDI files Freedoom ships, and
  plays them in an AudioWorklet through an OPL-style FM synthesizer: 18 two-operator voices with
  OPL2 waveforms, envelope rates and feedback, set from the WAD's GENMIDI patches with DOOM's
  volume and frequency curves from Chocolate Doom's `i_oplmusic.c`.
- **Save games.** A save reads back the four state buffers (sectors, things, line specials and
  the world block) into IndexedDB; a load compiles the level and writes them back.
- **What JavaScript does each frame.** It writes the input, encodes N tics plus the render and
  status bar passes, and copies 1 KB of the world buffer back to the CPU. That readback carries the
  sound queue and the level-exit flag.

## Releasing

Run `python3 fun-and-games/doom/stamp.py` before committing a change to any of the modules. It
stamps every `import` with one version. GitHub Pages lets a browser cache each file for ten
minutes on its own clock, so without the stamp a phone can run a new `index.html` against an old
`engine.js`.

## Accuracy

The engine is checked against Chocolate Doom tic for tic. Scripted inputs go into a demo lump for
a Chocolate Doom build patched to print the player, every thing and every sector each tic, and
into the GPU engine, and the two traces are compared. On 23 demos of 714 tics each (E1M1, E1M2,
E1M4, E1M5 and E1M6, seven maps from episodes 2 to 4, and eleven Doom II maps from MAP01 to MAP32)
the random number index and the player's position, to the last 1/65536 of a unit, agree on every
tic. On the seven E1 and Doom II demos that also track monsters, their positions and health agree
on all 467,670 monster-tics. Their states differ on 7 of them, each a pain or death state set by another
thing's attack showing one tic late, because a state change requested from outside is applied at
the monster's next think. Two demos (E2M1 and MAP09) are compared only up to tic 565, where the
player has died and Chocolate's demo respawns them; the comparison harness doesn't restart levels.

Getting there took DOOM's arithmetic rather than an approximation of it:

- Positions are 16.16 integers and angles 32-bit BAMs, as DOOM keeps them. `FixedMul` and
  `FixedDiv` are emulated in 32-bit WGSL (split multiplies, long division), and DOOM's
  `finesine` and `tantoangle` tables are in the graphics buffer.
- The side-of-line tests (`P_PointOnLineSide`, `R_PointOnSide`, `P_PointOnDivlineSide`,
  `P_DivlineSide`) keep their truncated products, so a point within about 1/64 unit of a line
  falls where vanilla puts it.
- Movement, `P_SlideMove`, `P_CheckPosition`, sight through the BSP, hitscans
  (`P_PathTraverse` over the blockmap) and `P_RadiusAttack` follow p_map.c, p_maputl.c and
  p_sight.c, including the order in which they visit lines and things.
- Random numbers come from DOOM's table, drawn in DOOM's call order and thinker order.

## Not done yet

- The player's own thing doesn't animate its death: the view sinks as in DOOM, but the death
  sound plays at once rather than at `A_PlayerScream`'s frame.
- The music synth has been checked by its spectrum, not by ear.
- The site ships episode one only; the other episodes and Doom II are exercised by the comparison
  demos, not by play.

## Licences

The engine code is GPL-2.0 (`LICENSE.md`), because it follows id Software's Doom source and its
tables come from `info.c`. `e1.wad.gz` is Freedoom 0.13.0 cut down to episode one's maps and the
graphics, sounds and music they use. Freedoom is BSD-licensed (`FREEDOOM-COPYING.txt`).
