# Tilt Rally

A racing game for a phone held sideways like a steering wheel. Turning the phone steers. Tilting its top edge away from you is the throttle, and tilting it toward you is the brake. You race three laps of a generated mountain valley against three computer cars. It's an installable PWA drawn with WebGPU.

Live: <https://austegard.com/games/tilt-rally/>. On a phone, turn on rotation lock in portrait. The page then draws itself turned a quarter turn counter-clockwise, so turn the phone a quarter turn clockwise to drive. With rotation unlocked, or on a computer, it lays out landscape as usual. The start screen fits on one screen: lock rotation and turn the phone, tap Allow motion (iOS asks for motion access here, before the race), then tap Start engine. On iPhone, Safari asks for motion access at that point; if you refuse, only a keyboard can drive. `?seed=N` picks another valley.

## Controls

| input | does |
|---|---|
| turn the phone like a wheel | steer; rotations under 1.5° are ignored, and full lock is at about 32° |
| tilt the top away 2° to 12° | throttle, full at 12° |
| tilt it toward you 3° to 12° | brake, then reverse from a standstill |
| double-tap the screen, or Center wheel | make the current pose straight ahead |
| arrow keys or WASD | steer, throttle and brake on a computer |

Hold the phone the way you want to drive when you press Start engine. That pose becomes straight ahead with no gas, and both the wheel and the pedal are measured from it, so there is no calibration step. **Keep horizon level** (on by default) tilts the 3D picture opposite to the phone, so the road's horizon stays level with the real one while you steer.

## How the phone becomes a wheel

The browser reports the phone's orientation as three angles: alpha (the compass heading), beta and gamma. The page converts beta and gamma into the direction of gravity in the phone's own coordinates, `(-cos β sin γ, sin β, cos β cos γ)`, and ignores alpha, so compass drift cannot move the wheel. Steering is the angle that gravity direction has turned within the screen's plane since the start, and it means the same thing whichever way round the phone is held. The pedal is the change in `asin(up.z)`, the component of gravity that points out of the screen. Held sideways, the phone sits exactly where the raw beta value jumps by 180° as the screen tilts past vertical. The gravity vector stays smooth through that jump, so the controls do not glitch there.

## The cars

Each body is lofted from 64 cross-sections between nose and tail. Every cross-section is a 12-point half profile (floor, sill, flank, shoulder, glasshouse, roof) whose dimensions vary smoothly along the car. The sills lift into wheel arches, and normals are smoothed across the grid. Paint is clear-coated: the diffuse colour, a Fresnel reflection of the sky and valley, and a tight sun highlight. On top of the paint are the racing stripes and a seven-segment race number drawn on each door. The glass reflects the sky. The wheels spin with distance travelled, the front pair steer, and the five-spoke rims are drawn in the shader. The body leans out of corners, and the tail lamps brighten when the car brakes.

## What runs on the GPU

- **Terrain carving (compute).** Each of 160,000 terrain vertices finds its nearest track sample, sinks into a ditch beside the road, and blends out to noise-generated hills and a ring of snow-capped mountains.
- **Tyre smoke and dust (compute).** A pool of 4,096 particles is spawned from the rear wheels when the car slides or leaves the tarmac, and drawn straight from the storage buffer.
- **Rendering.** 4× MSAA. The sky has a sun and procedural clouds; the road shader draws the kerbs, lines and start checker; trees, chevron boards, cars and wheels are instanced.

Car physics runs on the CPU at 120 Hz. It uses a simple bicycle model: turning rate is capped by tyre grip (2 g on tarmac), and sideways slide dies away faster on tarmac than on gravel or grass. A stability assist helps the player: when the wheel is past three quarters of full lock and the tyres are at their limit, it eases the throttle and scrubs speed, harder the faster you go. A driver who holds full gas and steers well then makes every sweeping bend; only the tightest hairpin needs the brake. The computer cars aim at a point ahead in their lane, steer by the curvature of the road ahead, and follow a speed plan worked out from it.

`engine.js` holds the track, physics and renderer and has no DOM, so it also runs in a Worker. The GPU Bridge uses that to render race frames on a real phone or laptop GPU. `index.html` owns the input, the HUD and the sound.

## Checks

```bash
node tests/tilt-rally-check.mjs math   # orientation -> wheel and pedal on known poses
node tests/tilt-rally-check.mjs demo   # autopilot race on SwiftShader: no WebGPU errors, all cars moving and on the road
node tests/tilt-rally-check.mjs tilt   # synthetic orientation events: tilt away accelerates, clockwise steers right, tilt back brakes
node tests/tilt-rally-check.mjs cars   # close-up stills of the cars
node tests/tilt-rally-check.mjs grip      # a full-gas driver with perfect aim stays on every bend wider than 40 m
node tests/tilt-rally-check.mjs intro     # the start screen fits a portrait phone without scrolling, buttons on screen
node tests/tilt-rally-check.mjs rotated   # a portrait phone: the turned stage fills the screen, HUD corners land where expected
```

SwiftShader is a software stand-in for a GPU, and the tilt check uses synthetic orientation events, so these confirm the logic but not how the game feels in the hand.
