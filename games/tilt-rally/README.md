# Tilt Rally

A racing game for a phone held sideways like a steering wheel. Turning the phone steers. Tilting its top edge away from you is the throttle, and tilting it toward you is the brake. You race three laps of a generated mountain valley against three computer cars. It's an installable PWA drawn with WebGPU.

Live: <https://austegard.com/games/tilt-rally/>. On a phone, turn on rotation lock in portrait. The page then draws itself turned a quarter turn counter-clockwise, so turn the phone a quarter turn clockwise to drive. With rotation unlocked, or on a computer, it lays out landscape as usual. The start screen fits on one screen: lock rotation and turn the phone, tap Allow motion, then Start engine. iOS asks for motion access at the first tap on the start screen; if you go straight for Start engine, the race waits on the start screen until you answer. On iPhone, Safari asks for motion access at that point; if you refuse, only a keyboard can drive. `?seed=N` picks another valley.

## Controls

| input | does |
|---|---|
| turn the phone like a wheel | steer; rotations under 1.5° are ignored, and full lock is at about 32° |
| tilt the top away 2° to 12° | throttle, full at 12° |
| tilt it toward you 3° to 12° | brake, then reverse from a standstill |
| double-tap the screen, or Center wheel | make the current pose straight ahead |
| **Touch pedals** (option) | Gas and Brake pads at the bottom right replace the tilt for speed; steering stays on the wheel. Where the thumb sits sets the strength: the bottom of the brake is 20% braking, the top is full, and gas runs from 35% to full. Braking builds over about half a second, gas over a quarter; lifting off is instant. Each pad fills to show its level. Pressure would be better, but an iPhone browser reports none ([force-touch experiment](https://github.com/oaustegard/experiments/tree/main/force-touch)) |
| **Manual gears** (option) | ▲ and ▼ paddles on the left change gear, with an automatic clutch; E and Q on a keyboard |
| arrow keys or WASD | steer, throttle and brake on a computer |

Hold the phone the way you want to drive when you press Start engine. That pose becomes straight ahead with no gas, and both the wheel and the pedal are measured from it, so there is no calibration step. **Keep horizon level** (on by default) tilts the 3D picture opposite to the phone, so the road's horizon stays level with the real one while you steer.

## Racing friends

**Race friends** on the start screen opens a room with a four-character code and a link to share (`?room=CODE`). Anyone who opens the link and taps **Join race** lands in the same room. Up to four people race; empty grid places go to computer cars, and anyone beyond four can watch. The host is whoever has been in the room longest. Only the host has a **Start race** button: it picks the valley, the grid and the moment the lights go out, and runs the computer cars.

- **Matchmaking:** `workers/rally-lobby` is a Cloudflare Worker with one Durable Object per room, deployed at `rally-lobby.austegard.workers.dev`. It accepts connections only from austegard.com, passes the WebRTC handshake between phones, keeps the clock every race start is timed on, and stores nothing.
- **Racing:** each phone simulates its own car and sends its position 20 times a second over a WebRTC data channel. Positions go on an unreliable, unordered channel; start and leave messages go on a reliable one. Other cars are drawn by projecting the last update forward and easing toward it.
- **Without a direct link:** some mobile networks block direct connections, and there is no TURN relay. If a pair's direct link isn't open after 8 seconds, they talk through the room's WebSocket instead. The lobby shows each link as "direct" or "via server".
- **Bumps** between two phones' cars move only the car the phone itself simulates, so each phone sees its own car pushed, not the other's.
- **Leaving:** when a player leaves, their car leaves everyone's race. If the host leaves, the computer cars go with them.

**Measuring real networks.** `node tests/rally-observer.mjs ROOM [minutes]` joins a room as `observer:claude`. Observers never race or host, and the phones show them as "measuring the links". While one is present, every phone sends it a report every 3 s: device, browser and network type; then, for each link, its path (direct or via server), how long the direct link took to open, the ICE candidate types and transport it settled on (host = same network, srflx = through the NAT via STUN, relay = TURN), the network round trip, an in-game ping over the race channel, car updates per second, the longest gap between updates, and frame rate. The observer's WebSocket runs in headless Chromium so a cloud session can reach the room through its HTTPS proxy, even though WebRTC itself can't get out.

`node tests/tilt-rally-check.mjs multi` runs three players against a local copy of the Worker (`wrangler dev`): one joins over WebRTC, one with WebRTC removed has to race through the room relay, and one leaves mid-race. It checks that the starts land within 0.3 s and that each phone sees the others' cars within 8 m of where those phones have them. Real phones on mobile data are untested.

## Tracks

**Track** on the start screen picks a generated valley (a new one each time from **New valley**) or a real circuit. `?track=nurburgring-gp` opens one directly. In a race with friends, the host's choice goes to everyone.

- **Nürburgring GP** (5.1 km, 56 m of climb): the Grand Prix circuit from OpenStreetMap relation 38567, with heights from EU-DEM v1.1 (Copernicus) via OpenTopoData. The circuit itself is real; the countryside around it is generated.
- Map data © OpenStreetMap contributors, under the ODbL. The credit shows on the start screen and under Center wheel during the race.

`tracks/build_track.py` builds a track file from any circuit relation:
`python3 games/tilt-rally/tracks/build_track.py --relation 38567 --start 50.33489,6.94496 --id nurburgring-gp --name "Nürburgring GP" --out games/tilt-rally/tracks/nurburgring-gp.json`
It fetches the relation from the OSM API, finds the closed loop through its one-way ways (the race direction), starts the loop nearest `--start` (the start-finish line, here the middle of the pit lane's extent), converts to metres, smooths lightly, and samples the ground height every 15 m. Standard library only.

## Gears

Six gears; the limiter cuts in at 58, 94, 130, 162, 194 and 230 km/h. Below 55% of the limit speed the engine bogs, except in first, where the clutch slips. The automatic box changes up at 93% and down when the lower gear would run under 80%, so it stays where the engine pulls. With Manual gears on, each change cuts drive for 0.12 s while the clutch works. A downshift that would push the engine past the limiter is refused, and the paddle flashes red. Past the limiter, engine braking stops the car from running away downhill. The options you pick are remembered on that device.

## The back-seat driver

An option on the start screen, on by default. It shouts in big text, and out loud when Sound is on. Ahead of you, it works out the hardest braking the next 2.5 seconds of road will need, using the same speed plan the computer cars drive to. Moderate braking gets "Slow down!", and anything harder than about 1.1 g gets "BRAKE!". Behind you, it reacts to leaving the road, going the wrong way, bumps, and places won or lost. If you crawl along well under what the road allows, it tells you to go. It leaves gaps between shouts and won't repeat the same complaint within six seconds, though "BRAKE!" can still interrupt.

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
node tests/tilt-rally-check.mjs backseat  # it shouts before the corner a full-gas driver leaves, notices the exit, and urges a crawler on
node tests/tilt-rally-check.mjs permission  # the iOS motion prompt comes on the start screen, and Start engine waits for the answer
node tests/tilt-rally-check.mjs controls  # touch pedals and paddles through the on-screen controls: limiter, upshifts, refused downshift, brake
node tests/tilt-rally-check.mjs pedals    # thumb position on a pedal sets its strength, in landscape and turned portrait
node tests/tilt-rally-check.mjs circuit   # the Nürburgring GP loads, is credited, and the autopilot races it on the road
node tests/tilt-rally-check.mjs intro     # the start screen fits a portrait phone without scrolling, buttons on screen
node tests/tilt-rally-check.mjs rotated   # a portrait phone: the turned stage fills the screen, HUD corners land where expected
```

SwiftShader is a software stand-in for a GPU, and the tilt check uses synthetic orientation events, so these confirm the logic but not how the game feels in the hand.
