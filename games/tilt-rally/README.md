# Tilt Rally

A racing game for a phone held sideways like a steering wheel. Turning the phone steers. Tilting its top edge away from you is the throttle, and tilting it toward you is the brake. You race three laps against three computer cars, or against friends, on a generated mountain valley or on the real Nürburgring GP and Circuit de Monaco. It's an installable PWA drawn with WebGPU.

Play it at <https://austegard.com/games/tilt-rally/>.

## Starting a race

1. On a phone, lock rotation in portrait. The start screen is laid out for a phone held in portrait, as the motion permission prompt and the track list are.
2. Tap **Allow motion**, which lets the page read how the phone is turned and tilted (the only way it can steer), then choose a track and your options.
3. Tap **Start engine**, then turn the phone a quarter turn clockwise (top to the right) and hold it like a steering wheel. The race screen is drawn for that grip. The start lights count down and go out once the phone is sideways, and the pose you hold when they go out becomes straight ahead with no gas. If you turn it the wrong way, the screen tells you to turn it clockwise.

With rotation unlocked, or on a computer, the start screen and the race are laid out landscape, and the pose you hold when you tap Start engine is straight ahead.

## Controls

| input | does |
|---|---|
| turn the phone like a wheel | steer; turns under 1.5° are ignored, and full lock (the most the wheel turns) is at about 32° |
| tilt the top away 2° to 12° | throttle, full at 12° |
| tilt it toward you 3° to 12° | brake; held at a standstill, it reverses |
| double-tap the screen, or the **Center wheel** button at the top of the race screen | make the current pose straight ahead |
| arrow keys or WASD | steer, throttle and brake on a computer |

Both the wheel and the pedal are measured from the straight-ahead pose. A car that ends up far off the road (40 m for four seconds) is put back on the track where it left it.

The race screen shows lap and position at the top left, time and best lap and a map of the track at the top right, the wheel and pedal position at the bottom left (with the input in use: tilt, touch or keys), and speed and gear at the bottom right.

## Options

The start screen lists these. Your choices are remembered on the device.

- **Keep horizon level** (on by default) turns the 3D picture against the phone's rotation, so the road's horizon stays level with the real one while you steer.
- **Back-seat driver** (on by default): a passenger who shouts in big text, and out loud with Sound on. It warns of the next few seconds of road ("Slow down!", or "BRAKE!" when the corner needs hard braking), reacts to leaving the road, driving the wrong way, bumps, and places won or lost, and tells you to go if you crawl along well under what the road allows.
- **Sound** (on by default): the engine, and the back-seat driver's voice.
- **Touch pedals**: on-screen Gas and Brake pads at the bottom right control speed, and steering stays on the wheel. How far up the pad your thumb sits sets the strength, from light at the bottom edge to full at the top, and each pad fills to show its level. Phone browsers report no touch pressure, which is why position sets the strength ([force-touch experiment](https://github.com/oaustegard/experiments/tree/main/force-touch)).
- **Manual gears**: ▲ and ▼ buttons (paddles) on the left of the race screen change gear, with an automatic clutch; E and Q do the same on a keyboard. See Gears below.
- **Car damage** (off by default): see Car damage below.

## Gears

Six gears. Each gear has a rev limiter, which caps its speed at 58, 94, 130, 162, 194 and 230 km/h. Below 55% of that speed the engine pulls weakly, except in first. The automatic gearbox changes up at 93% of the gear's top speed, and down when the lower gear would be under 80% of its own. With Manual gears on, each change cuts drive for 0.12 s while the clutch works. A downshift that would overrev the engine is refused, and the paddle flashes red. At the limiter the engine brakes the car, even downhill.

## Car damage

With Car damage on, every car takes damage from 0 to 100%, from barriers and from other cars. Only hard impacts count: a glancing scrape costs almost nothing, hitting a street-circuit barrier at 100 km/h and 30° to it costs about a third, and a few of those, or one big crash between two cars, leave a car 60 to 80% damaged. Scraping along a barrier wears the car slowly.

- **Handling:** at full damage the car has 10% less grip and top speed, and proportionally less below that. Past 50% it pulls toward the side that took the most damage, so you have to hold the wheel off centre.
- **Looks:** the engine smokes, thicker as damage grows; the paint darkens and dulls, wears through to grey primer, and dents where the hits landed.
- **Race screen:** a Damage bar next to the position, red past half. The back-seat driver comments past 50% and again past 80%.
- The computer cars take damage too. In a race with friends, each player's own setting decides whether their car takes damage, and the host's decides for the computer cars; everyone sees the same dents and smoke.
- Damage lasts the whole race, also after the car is put back on the track, and resets with each new race.

## Tracks

**Track** on the start screen picks a generated valley or a real circuit. After a race, **Race again** reruns the same track and **New valley** generates another. `?track=nurburgring-gp` or `?track=monaco` in the address opens one directly. In a race with friends, the host's choice goes to everyone.

- **Generated valley:** a closed road through hills, with a ring of snow-capped mountains around it.
- **Nürburgring GP** (5.1 km, 56 m of climb): the Grand Prix circuit, with its real Eifel ground, the buildings around the paddock and grandstands, and its woods.
- **Circuit de Monaco** (3.3 km, 53 m of climb): a street circuit, so the road is narrower and lined with steel barriers with a red and white top. Touching one pushes the car back onto the road and costs speed. Around it are the town's buildings, the harbour and the sea, and the tunnel.

The real circuits come from OpenStreetMap, with heights from the EU-DEM elevation model. Map data © OpenStreetMap contributors, under the ODbL; the credit shows on the start screen and below the Center wheel button during the race.

## Racing friends

**Race friends** on the start screen opens a room with a four-character code and a link to share. Opening the link shows a **Join race** button in place of Race friends, and tapping it puts you in the same room. Up to four people race, and computer cars fill the empty places; anyone beyond four can watch. The host is whoever has been in the room longest. Only the host sees **Start race**, which sets the track, the starting order and the start, and the host's phone drives the computer cars.

In a race with friends the lights go out on the room's shared clock, whether or not you have turned the phone yet; your car stays pointed straight until you turn it.

Phones connect directly to each other where the network allows. When a direct link can't be made within 8 seconds, that pair talks through the matchmaking server. The room's player list shows each link as "direct" or "via server".

## How it works

The rest of this file is for people working on the code. Paths in the text are relative to `games/tilt-rally/`, and commands run from the repository root. To play a local copy, serve the repository root (`python3 -m http.server 8000`) and open `http://127.0.0.1:8000/games/tilt-rally/`; WebGPU needs a recent Chrome, Edge or Safari.

### The phone as a wheel

The browser reports the phone's orientation as three angles: alpha (the compass heading), beta and gamma. The page converts beta and gamma into `up`, the direction of gravity in the phone's own coordinates, `(-cos β sin γ, sin β, cos β cos γ)`, and ignores alpha, so compass drift cannot move the wheel. Steering is the angle `up` has turned within the screen's plane since the straight-ahead pose, and it means the same thing whichever way round the phone is held. The pedal is the change in `asin(up.z)`, the component of gravity that points out of the screen. Raw beta jumps by 180° when the screen tilts past vertical, which is close to how a sideways phone is held; `up` changes smoothly through that point, so the controls do not glitch there.

### Physics

Car physics runs at 120 Hz in a bicycle model: the turn rate is capped by tyre grip (2 g on tarmac), and a sideways slide dies away faster on tarmac than on gravel or grass.

Off the pedals the car coasts like a road car, losing about 0.6 m/s² at 150 km/h and 0.2 m/s² at 40 km/h on flat tarmac; on either pedal the full drivetrain and tyre load apply.

Weight transfer follows the tyres' push: hard acceleration lightens the front, so the turn rate cap drops by up to 8% and the steering answers more slowly, and braking loads it, so the car turns in sharper and rotates up to 6% more.

A stability assist, always on for the player, eases the throttle and scrubs speed when the wheel is past three quarters of full lock with the tyres at their limit, harder the faster you go. A driver who holds full gas and steers well makes every bend wider than 40 m in radius; tighter hairpins need the brake.

The computer cars aim at a point ahead in their lane, steer by the curvature of the road ahead, and follow a speed plan worked out from it. The back-seat driver reads the same speed plan 2.5 s ahead of the player: "Slow down!" for moderate braking, "BRAKE!" past about 1.1 g, and no complaint repeated within six seconds.

### Rendering

- **Terrain (compute shader):** each of 160,000 terrain vertices finds its nearest track sample, sinks into a ditch beside the road, and blends into hills, or into the real ground on a real circuit.
- **Tyre smoke, dust and engine smoke (compute shader):** a pool of 4,096 particles, drawn straight from the storage buffer.
- **Cars:** each body is lofted from 64 cross-sections between nose and tail, each a 12-point half profile (floor, sill, flank, shoulder, glasshouse, roof). The paint is clear-coated, with a Fresnel reflection of the sky and a tight sun highlight, racing stripes and a seven-segment race number on each door. The body leans out of corners and pitches on a damped spring, about 2° nose up under full power and 3.5° down under full braking, while the wheels stay planted. The tail lamps light only on the brake, brighter the harder it is pressed. Damage is tracked in four zones (front, rear, either side) and reaches the shader in the unused bottom row of each car's instance matrix.
- **Everything else:** 4× MSAA, a sky with sun and procedural clouds, kerbs, lines and the start checker drawn by the road shader, and instanced trees, chevron boards, buildings, cars and wheels.

`engine.js` holds the track, physics and renderer and has no DOM, so it also runs in a Web Worker. That is how the GPU Bridge (a helper that runs WebGPU jobs on a real laptop or phone browser) renders race frames. `index.html` owns the input, the race screen and the sound.

### Multiplayer

`workers/rally-lobby` (at the repository root) is a Cloudflare Worker with one Durable Object per room, deployed at `rally-lobby.austegard.workers.dev`. It accepts connections only from austegard.com, passes the WebRTC connection setup between phones, keeps the clock every race start is timed on, and stores nothing. Each phone simulates its own car and sends its position 20 times a second over a WebRTC data channel: positions on an unreliable, unordered channel, start and leave messages on a reliable one. Other cars are drawn by projecting their last update forward and easing toward it. When two players' cars collide, each phone pushes only its own car. There is no TURN server (the usual relay for WebRTC), so when a direct link fails, the pair talks through the room's WebSocket. When a player leaves, their car leaves everyone's race; if the host leaves, the computer cars go too.

To measure the links on real networks, `node tests/rally-observer.mjs ROOM [minutes]` joins the room with code ROOM (the four characters on the phones' room screen) as an observer and prints what it receives, which never races or hosts; the phones show it as "measuring the links". Every phone sends it a report every 3 s: device, browser and network type, and for each link its path, how long the direct link took to open, the connection types it settled on, the round trip, an in-game ping, car updates per second, the longest gap between updates, and frame rate. It runs its WebSocket from headless Chromium, so it works from a machine whose network only allows HTTPS through a proxy.

### Building a track

`tracks/build_track.py` builds a track file from an OpenStreetMap circuit relation (standard library only):

```bash
python3 games/tilt-rally/tracks/build_track.py --relation 38567 --start 50.33489,6.94496 --id nurburgring-gp --name "Nürburgring GP" --out games/tilt-rally/tracks/nurburgring-gp.json
```

It fetches the relation from the OSM API, finds the closed loop through its one-way ways (the race direction), starts the loop at the point nearest `--start`, converts to metres, smooths lightly, and samples the ground height every 15 m from EU-DEM v1.1 (Copernicus) via OpenTopoData. Street circuits need `--chain`, which joins the race sections end to end (pit lane excluded), because their one-way tags follow everyday traffic and their streets don't always meet; `--clockwise` sets the direction, `--half-width` the road's half-width (7 m by default, 5 m at Monaco) and `--barriers` adds barriers. Heights missing over water are filled from neighbouring readings, and sections tagged `tunnel` are bridged between their mouths:

```bash
python3 games/tilt-rally/tracks/build_track.py --relation 148194 --chain --clockwise yes --half-width 5 --barriers --start 43.7347,7.4206 --id monaco --name "Circuit de Monaco" --out games/tilt-rally/tracks/monaco.json
```

`tracks/build_scenery.py` adds the surroundings:

```bash
python3 games/tilt-rally/tracks/build_scenery.py --track games/tilt-rally/tracks/monaco.json --out games/tilt-rally/tracks/monaco-scenery.json
```

It samples ground heights on a 25 m grid around the circuit (about one call a second to OpenTopoData; cells with no value are sea), takes building footprints from the OSM API (height from the mapped height or floor count), drops buildings that sit on the open road, marks those over a tunnel so the game lifts them clear of it, outlines the woods, and links the scenery file from the track file. A track without a scenery file is surrounded by generated countryside.

A new track appears in the game once its file is in `tracks/` and it has an `<option>` in the Track list in `index.html`, with the file's id as its value.

### Checks

The checks drive the game in headless Chromium through Playwright, with SwiftShader (a software stand-in for a GPU) providing WebGPU. Run them from the repository root after `npm install`. Stills go to the directory named by the `OUT` environment variable (default `/tmp/tilt-rally`).

```bash
node tests/tilt-rally-check.mjs math        # orientation -> wheel and pedal on known poses
node tests/tilt-rally-check.mjs demo        # autopilot race: no WebGPU errors, all cars moving and on the road
node tests/tilt-rally-check.mjs tilt        # synthetic orientation events: tilt away accelerates, clockwise steers right, tilt back brakes
node tests/tilt-rally-check.mjs cars        # close-up stills of the cars
node tests/tilt-rally-check.mjs grip        # a full-gas driver with perfect aim stays on every bend of radius over 40 m
node tests/tilt-rally-check.mjs feel        # coast-down rate, body pitch under gas and brake, tail lamps off and on the brake
node tests/tilt-rally-check.mjs backseat    # the back-seat driver warns before a corner taken too fast, notices leaving the road, and urges a slow driver on
node tests/tilt-rally-check.mjs permission  # the motion prompt comes on the start screen, and Start engine waits for the answer
node tests/tilt-rally-check.mjs controls    # touch pedals and paddles: limiter, upshifts, refused downshift, brake
node tests/tilt-rally-check.mjs pedals      # thumb position on a pedal sets its strength, in landscape and on a portrait-locked phone
node tests/tilt-rally-check.mjs circuit     # the Nürburgring GP and Monaco load, are credited, and the autopilot races both inside the road edges
node tests/tilt-rally-check.mjs intro       # the start screen fits a portrait phone without scrolling
node tests/tilt-rally-check.mjs rotated     # a portrait-locked phone: the race screen fills it, with the corner readouts in the right corners
node tests/tilt-rally-check.mjs damage      # damage on Monaco: barrier hits raise it, it costs top speed, off changes nothing
node tests/tilt-rally-check.mjs multi       # three players against a local copy of the Worker, using `npx wrangler@4.20.0`, or the command in the `WRANGLER` environment variable: direct, relayed, and one leaving
```

The multi check confirms that the starts land within 0.3 s and that each phone sees the other cars within 8 m of where their own phones have them. These checks confirm the logic, not how the game feels in the hand, and real phones on mobile data are untested.
