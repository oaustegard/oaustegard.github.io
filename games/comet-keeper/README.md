# Comet Keeper

An arcade game for a phone, played with the wrist. Sentinels at the far end of a starlit lane throw comets at you. Tilt the top of the phone toward you as one lands to catch it, then flick the top away to throw it back.

**[Play](https://austegard.com/games/comet-keeper/)** | **[Source](https://github.com/oaustegard/oaustegard.github.io/blob/main/games/comet-keeper/index.html)**

## Playing

Press Play, hold the phone the way you mean to play, and press Ready: that pose is level. The first game opens with a six-step training run, which the Training button repeats.

| move | what it does |
|---|---|
| roll the phone left or right | moves the cradle across the lane |
| flick the top away | throws what you hold; with empty hands it punches an arriving comet back |
| flick the top toward you | catches a comet as it reaches its ring |
| hold the top tilted back | slows time while the blue bar lasts |

Each comet draws a ring on the cradle's line that closes as the comet arrives. A catch or punch counts from 0.3 s before contact to 0.09 s after, and one within 0.075 s of contact is perfect: a perfect catch charges the comet gold, so it hits twice as hard.

A harder flick throws farther. The sentinels stand at different depths, so a weak flick lands short of the back row; the pause menu shows the speed of your last flick and how the game is reading it. A sentinel is in reach when the throw's arc is still at its height when it gets there: the front row takes almost no power, the deepest back row about 60%. A throw that is roughly lined up with a sentinel in reach curves onto it; one that is not in reach drops under it and misses.

Three things come down the lane:

- **Comets** (cyan) can be caught or punched. One that hits the cradle unhandled only breaks your chain.
- **Thorns** (red) cost a heart if you catch them or let them hit. Punch them back, which sends them straight at the sentinel that threw them, or roll aside.
- **Stones** (amber) cost a heart if you punch them or let them hit. They are heavy: the flick that catches one has to be at least 2.4 times the flick threshold. A thrown stone hits for three and splashes onto its neighbours.

A throw that meets an incoming comet head-on destroys both. Sentinels from wave 4 creep forward, and one that reaches you costs a heart. Every fifth wave is the Warden, which can only be hurt while its eye is open. Clearing a wave restores a heart, up to three. Consecutive catches, punches and kills build a chain that raises the score multiplier by ×0.5 every four, up to ×4.

On a computer, `←` `→` move, `↑` throws (hold it longer to throw farther) or punches, `↓` catches, and holding `↓` slows time. On a touchscreen without motion access, drag sideways to move, swipe up to throw or punch, swipe down to catch, and keep the finger down after a downward swipe to slow time. `P` pauses and `M` mutes.

## Flick detection

The game turns `deviceorientation` into the phone's gravity vector and takes two angles from it: roll, which steers as in [Prism Break](../prism-break/), and pitch, the lean of the top toward you. Pitch is measured from a neutral pose that follows slow drift, quickly while the phone rests near it and slowly when you hold it away, so after a change of posture the pitch is level again within about ten seconds. Roll keeps the level you set until you press Level here in the pause menu.

A flick begins when the pitch rate passes a threshold (110°/s at the Normal setting; Light and Firm are in the pause menu) and ends when the rate drops below half its peak or 150 ms have passed. The peak sets the strength. After a forward flick the wrist swings back, and that swing must not read as a catch. So for 0.4 s after a flick, the opposite flick needs 1.6 times the rate and has to carry past the neutral pose. Holding the phone still produces no flicks, and a catch that runs straight into a forward whip reads as both.

The rate comes from the derivative of the pitch angle until `devicemotion`'s gyroscope reading has been checked against it. After 30 samples of real motion, a least-squares fit gives the gyroscope's sign and scale. Browsers have disagreed on both, and on degrees against radians. Once the two agree (correlation above 0.6), the gyroscope supplies the rate, because it has no smoothing lag. Steering pauses for the length of a flick so the wrist motion does not move the cradle.

## Implementation

One self-contained HTML file with no build step, drawn on a Canvas 2D context with additive glows. It installs as an app and plays offline through `sw.js`, which fetches the page network-first so updates show on the next load.

- **Lane**: a perspective projection with the horizontal scale compressed, so the far rows stay wide enough to aim at. Sentinels further back float higher, so a back row shows above the front row instead of behind it.
- **Simulation**: fixed 120 Hz steps scaled by the slow-time factor, with a few frames of hit-stop on perfect catches and kills. Comets fly on arcs timed to reach the cradle line at a set moment, which is what the rings count down to. Throws are ballistic, so power decides range.
- **Sound**: synthesized with Web Audio, with a quiet generative backing of a drone and pentatonic plucks that speeds up each wave. A tick marks the moment a comet you are lined up with enters the catch window. Play needs no taps, so the loop restarts audio that the browser has suspended (iOS can do this after the motion-permission sheet) and asks for a tap if that fails.
- **Haptics**: the Vibration API where there is one. Safari on iOS has none, so there the game toggles a hidden `<input type=checkbox switch>`, which gives a haptic tick on iOS 18 and later.
- **Tests**: [`tests/comet-keeper.spec.js`](../../tests/comet-keeper.spec.js) replays scripted orientation and gyroscope streams through the detector, with the gyroscope absent and reporting radians, and plays the first training drills from the keyboard.
