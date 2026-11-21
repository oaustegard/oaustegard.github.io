# Swarmfall

A formation shooter for a phone: a swarm of enemies gathers at the top of the screen and takes turns diving at your ship at the bottom. You steer by tilting the phone, and your guns fire on their own.

**[Play](https://austegard.com/games/swarmfall/)** | **[Source](https://github.com/oaustegard/oaustegard.github.io/blob/main/games/swarmfall/index.html)**

## Playing

Press Launch, hold the phone the way you want to play, and press LEVEL: that pose becomes centre. Roll the phone left and right to fly; the ship's position follows the angle, and the pause menu sets how far you have to roll for a full sweep (22° by default). To re-level mid-game, tap the round dial with the green marble in the bottom bar. iOS asks for motion permission when you press Launch.

Dragging on the playfield also moves the ship and takes over from tilt for a moment. On a computer the ship follows the mouse pointer, or the arrow keys move it; `Space` sets off a nuke, `P` pauses and `M` mutes.

A shot from an enemy, or an enemy flying into you, costs a ship; the game ends when the last one goes. Easy (the default) gives four ships, slower enemies and shots, and fewer enemies diving at once; Arcade gives three ships, and its swarm dives harder and shoots more. Both start with one nuke. Each difficulty keeps its own best score and the furthest stage reached, and you can start at stage 1, 5, 9 and so on once you have got there.

## The swarm

Each stage has forty enemies of three kinds:

| | where in the formation | points in formation | points diving |
|---|---|---|---|
| moth | bottom two rows | 40 | 90 |
| mantis | middle two rows | 70 | 160 |
| warden (takes two hits) | top row | 120 | 350 |

They arrive in five groups, from the left, the right and the top, along looping paths, and settle into the formation. While they arrive the formation sways from side to side; once everyone is in place it spreads out and draws back in, once every two bars of the music. Attacks begin as soon as a dozen have settled, before the rest have arrived: members of the formation take aimed shots at you, and others start diving: an enemy peels off with a half loop, homes in on you with a weave and fires on the way down. Most fly off the bottom and come back in from the top; from stage 5 some turn and climb straight back to their place instead. When five or fewer are left, they dive in quick succession.

From stage 2 a warden dives with up to two mantises from the row below it as escorts. Shoot the escorts down before the warden for a bonus of 500 each. A warden shot down in mid-dive always drops a drone pod; catch it for wingmen, the same as the W capsule below.

Enemies also fire while they are still arriving, and their aimed shots lead a moving ship. Dives get faster, more frequent and more numerous as the stages go up.

Stages 3, 7, 11 and so on are bonus stages: forty enemies loop through without firing, and flying into them does no harm. Every one is downed by a single hit. Each one you shoot down is worth 100, and the stage pays another 100 for each at the end, or 10,000 if you got all forty.

Kills less than a second apart build a chain that raises each kill's score, up to ×4. An enemy shot that passes close under your ship without hitting it is a graze, worth 10. Clearing a stage scores a bonus for accuracy and another if you lost no ship on it. Extra ships come at 20,000 points and every 60,000 after that on Easy, and at 30,000 and every 80,000 after on Arcade.

## Capsules

Some enemies drop a capsule when you shoot them down; fly into it to catch it. You start with a single cannon, which keeps at most two bolts in the air at once. Any of the three weapon capsules (D, S, L) replaces it and lifts that cap, and catching the weapon you already have raises its level, up to III.

| | |
|---|---|
| D double | two parallel bolts; three at level III |
| S spread | a fan of three bolts; five from level II |
| L laser | bolts that pierce several enemies |
| R rapid | faster fire for ten seconds, and no two-bolt cap |
| M missiles | a salvo of homing missiles about once a second; each catch adds one to the salvo, up to three |
| W wingmen | two small drones beside your ship that fire too; a second catch makes each fire an extra angled bolt |
| O shield | absorbs one hit |
| T time stop | the swarm and its shots freeze for six seconds |
| N nuke | one more nuke |
| + | one more ship |

Losing a ship costs one weapon level, and your missiles, wingmen and rapid fire. A nuke destroys every enemy shot, every enemy that is diving or arriving, and the two lowest rows of the formation.

## How it is made

One HTML file, no libraries. The sprites are pixel art drawn as lit LED cells by a WebGPU shader, each sprite turned to face the way it flies. Particles are a ring buffer whose motion has a closed form, so the GPU works out where every one is each frame and the CPU only writes new ones. The scene renders to a half-float target with five levels of bloom, shockwave ripples, chromatic aberration and an optional CRT mask, then ACES tone mapping. A Canvas 2D renderer takes over where WebGPU is missing.

The arrival paths are Catmull-Rom splines through hand-placed points, sampled once into a polyline with cumulative length so an enemy moves along them at a set speed; each path drawn for the left side is mirrored for the right. A dive has no fixed path: a half loop, then a heading that turns toward you at a limited rate.

The music is synthesized in Web Audio: every four stages get their own key, chord progression and seeded lead melody, over a walking bass, an arpeggio and drums. The engine started as a fork of [Tilt Invaders](../tilt-invaders/).
