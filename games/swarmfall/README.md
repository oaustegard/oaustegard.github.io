# Swarmfall

A formation shooter for a phone, steered by tilting it. Your guns fire on their own.

**[Play](https://austegard.com/games/swarmfall/)** | **[Source](https://github.com/oaustegard/oaustegard.github.io/blob/main/games/swarmfall/index.html)**

## Playing

Press Launch, hold the phone the way you want to play, and press LEVEL: that pose becomes centre. Roll the phone left and right to fly; the ship's position follows the angle, and the pause menu sets how far you have to tilt for a full sweep (22° by default). Tap the dial in the bottom bar to re-level mid-game. iOS asks for motion permission when you press Launch.

Dragging on the playfield also moves the ship and takes over from tilt for a moment. On a computer, the mouse or the arrow keys move it, `Space` sets off a nuke, `P` pauses and `M` mutes.

Easy (the default) gives five ships, two nukes, slower flyers and shots and fewer divers at once; Arcade gives three ships and one nuke. Each difficulty keeps its own best score and the furthest stage reached, and you can start at stage 1, 5, 9 and so on once you have got there.

## The swarm

Each stage, forty flyers arrive in five groups along looping paths and settle into a formation at the top. While they arrive the formation sways from side to side; once it is complete it breathes in and out, one breath every two bars of the music. Then they start diving: a flyer peels off with a half loop, homes in on you with a weave, fires on the way down and either flies off the bottom and comes back in from the top or, from stage 5, turns and climbs straight back to its place. When five or fewer are left, they dive in quick succession.

| | in formation | diving |
|---|---|---|
| moth | 40 | 90 |
| mantis | 70 | 160 |
| warden (two hits) | 120 | 350 |

From stage 2 a warden dives with up to two mantis escorts from the row below it. Shoot the escorts down before the warden for a bonus of 500 each. A warden shot down in mid-dive drops its drone pod; catch it for a wingman (two at most).

From stage 4 on Easy, and stage 2 on Arcade, flyers fire as they arrive too. Dives get faster, more frequent and more numerous as the stages go up.

Stages 3, 7, 11 and so on are bonus stages: forty flyers loop through without firing and without hurting you. Each hit is worth 100, and the stage pays 100 more per hit at the end, or 10,000 if you got all forty.

Kills less than a second apart build a chain that raises each kill's score, up to ×4. A shot that passes close under your ship without hitting it is a graze, worth 10. Clearing a stage scores a bonus for accuracy and another if you lost no ship on it. An extra ship comes every 15,000 points on Easy and every 20,000 on Arcade.

## Capsules

Some flyers drop a capsule when they die; fly into it to catch it.

| | |
|---|---|
| D double | two bolts, then three |
| S spread | a fan of three, then five |
| L laser | bolts that pierce |
| R rapid | faster fire for a while |
| M missiles | homing missiles, up to three |
| W wingmen | escort drones that fire too |
| O shield | absorbs one hit |
| T time stop | the swarm and its shots freeze for six seconds |
| N nuke | one more nuke |
| + | one more ship |

The plain cannon keeps at most two bolts in the air at once; any capsule weapon, or rapid fire, lifts that cap. Catching the weapon you already have raises its level, up to III. Losing a ship costs one weapon level and the add-ons. A nuke clears every shot, everything in flight and the two lowest rows of the formation.

## How it is made

One HTML file, no libraries. The sprites are pixel art drawn as lit LED cells by a WebGPU shader, each sprite turned to face the way it flies. Particles are a ring buffer whose motion has a closed form, so the GPU works out where every one is each frame and the CPU only writes new ones. The scene renders to a half-float target with five levels of bloom, shockwave ripples, chromatic aberration and an optional CRT mask, then ACES tone mapping. A Canvas 2D renderer takes over where WebGPU is missing.

Flight paths are Catmull-Rom splines through hand-placed points, sampled once into a polyline with cumulative length so a flyer moves along them at a set speed; the right-hand paths are mirrors of the left. Dives are steered rather than scripted: a fixed half loop, then a heading that turns toward you at a limited rate.

The music is synthesized in Web Audio: every four stages get their own key, chord progression and seeded lead melody, over a walking bass, an arpeggio and drums. The engine started as a fork of [Tilt Invaders](../tilt-invaders/).
