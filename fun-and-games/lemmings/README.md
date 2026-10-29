# gPu(lemmings)

A Lemmings-style game written as WebGPU compute shaders. The lemmings, the terrain they carve and the
picture all live in GPU buffers. JavaScript writes the cursor, the chosen skill and the release rate
into a uniform buffer each frame, and reads back a small block of counters for the panel and the sounds.

Live: <https://austegard.com/fun-and-games/lemmings/>. It needs a browser with WebGPU: a recent Chrome,
Edge or Safari.

The page is not affiliated with the 1991 game by DMA Design. The levels, pixel art and sounds were made
for it, and the mechanics follow the original's conventions: 17 ticks a second, a fall of more than 60
pixels kills, a builder lays twelve bricks, bashers and miners stop at steel.

## Controls

| input | does |
|---|---|
| click, tap | give the chosen skill to the lemming under the cursor |
| 1 – 8 | climber, floater, bomber, blocker, builder, basher, miner, digger |
| − / + | release rate |
| P, space | pause; skills can still be given while paused |
| F | fast forward |
| N twice | nuke: every lemming becomes a bomber |
| arrows / W A S D, wheel, drag, screen edges | scroll; click or drag the map under the level to jump |
| esc | the level menu |

## Levels

Eight levels, each built around a skill: digging through a floating island, a bridge held by a
blocker under a hanging ceiling, bashing through columns, mining under a steel wall into a crystal
cave, climbing a candy tower two screens tall and floating down its far side, zigzagging down six
ledges of a 400-pixel shaft, a level that needs several skills, and Exodus, which releases 10,000
lemmings from eight hatches into an autumn forest. A level taller than the 160-pixel view scrolls
up and down as well as sideways.

`levels.js` describes each level as a list of shapes and pieces: ground, floating slabs, lumpy
masses and caves in the theme's shaded earth, then drawn pieces with their own colours (fluted
columns, arches, crystals, mushrooms, brick walls, boulders, stalactites, trees, chains, vines).
Each terrain pixel stores a material and a palette colour. Decor is a fifth material that is drawn
but that lemmings walk through, so scenery never changes a puzzle. Behind the terrain, two
silhouette layers (mountains, spires, forest or towers, per theme) scroll more slowly than the level.

## How it is built

The DOOM port next door ([gPu(doom)](../doom/README.md)) runs most of DOOM's game logic in one kernel,
`ticMobjs`, which compiles to one enormous function, and GPU compilers take minutes over a function
that size on some Android and Windows drivers. This game is shaped so that no kernel grows like that.
`shaders.js` builds one WGSL module of about 880 lines with 28 entry points, and the largest kernel
holds one state's update and its helpers.

A tick is five compute passes:

1. `begin` (one thread) counts the tick down, opens the hatch and releases lemmings, and arms the nuke.
   `pick` and `assign` find the lemming under the cursor (an `atomicMin` over a key that prefers
   lemmings able to take the chosen skill, then the nearest) and give it the skill on a click.
   `fieldStamp` has every blocker mark the pixels around it in a field stamped with the tick number,
   so the field never needs clearing. `classify` counts down bomb timers and appends each lemming's
   index to the queue for its current state.
2. `queueArgs` turns the queue lengths into indirect dispatch sizes.
3. One kernel per state (`kWALK`, `kFALL`, `kBUILD`, `kBASH`, `kMINE`, `kDIG`, `kBLOCK` and ten
   more) runs through `dispatchWorkgroupsIndirect` over that state's queue only. A state with no
   lemmings in it costs an empty dispatch. A lemming that changes state joins the new queue on the next
   tick.
4. `editArgs` sizes the terrain edits.
5. `carve` and `lay` apply the edits the state kernels queued (bash, mine, dig and bomb masks, and
   builders' bricks), one workgroup per edit, removals before additions.

Every lemming reads the terrain and the blocker field as they were at the start of the tick, and the
edits land after all of them have moved. A tick's result therefore does not depend on the order in
which GPU threads run.

Drawing is two more kernels. `sprites` writes each lemming's frame into an overlay with `atomicMax`
on `(index << 4) | colour`, so overlapping lemmings always stack the same way, and puts a dot on the
minimap. `composite` runs one thread per screen pixel: it shades the terrain (earth with noise, grass
on top, riveted steel, brick), the water, the hatches and exits, takes the overlay where it is set,
and draws the selection box. A fragment shader scales the result to the canvas.

## Testing

`tests/lemmings-sim.mjs` runs headless under SwiftShader. It compiles every kernel, then plays a
scripted solution for each level, assigning skills to lemmings picked by position and state, and checks
that enough lemmings get home. Under SwiftShader the 28 kernels compile in about 2 seconds, and the
Exodus run (4,757 ticks with up to 10,000 lemmings) takes about 50 seconds on four CPU cores. On an
iPhone (Chrome on iOS 27) the 28 kernels compile in 1.5 seconds, and an Exodus tick with 5,000
lemmings out takes about 0.09 ms.

```
node tests/lemmings-sim.mjs            # every level
node tests/lemmings-sim.mjs 1 --shots /tmp/shots   # level 2 only, with screenshots
TRACE=0 node tests/lemmings-sim.mjs 1  # log lemming 0's state changes
```

Run `python3 fun-and-games/lemmings/stamp.py` before committing a change. It stamps every module
import with one version, so a browser never mixes new and cached files.
