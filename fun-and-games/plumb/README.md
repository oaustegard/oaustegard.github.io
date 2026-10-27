# Plumb

Falling blocks for a phone, played by tilting it. Installable PWA; SVG draws the well and pieces,
WebGPU shatters cleared rows into shards that fall away, and the motion
sensors replace most of the buttons.

Live: <https://austegard.com/fun-and-games/plumb/>. Open it on a phone, press Start (iOS asks for
motion access then), and use Add to Home Screen to install it full-screen and offline.

## Controls

| motion | does | touch fallback |
|---|---|---|
| roll left / right | steers; speed scales with the angle past a 4° dead zone, up to 15.5 columns/s at the "full speed" angle (default 24°) | drag sideways, one column per cell width |
| tip the top toward you | soft drop, up to 20×: a steeper well falls faster | drag down |
| jab the phone forward | hard drop: a spike along the screen normal over 15 m/s², dominant over the other axes | swipe down |
| shake sideways | hold: three alternating x-axis spikes inside 700 ms | swipe up |
| tap | rotate clockwise; left third of the well rotates counter-clockwise | same |

After Start, hold the phone the way you want to play (sitting up, lying down, on your side) and
press **Plumb**: that pose becomes level. The card shows the screen's angle from flat and the roll
while you hold it. The tip soft-drop starts 20° steeper than plumb. Pause has **Plumb again** for
when you change position, and tapping the spirit-level vial mid-game re-plumbs on the spot. Two
spirit levels, both centred on the plumbed pose: the one in the header shows roll, with ticks at the
steering dead zone and the ends at full speed; a tall one beside the board shows tip, with the bubble
rising as you tip steeper and a red cap where the tip soft-drop starts (hidden when tip-to-drop is
off). Tapping either re-plumbs. The tilt readout turns brass and reads FAST while the
tip soft-drop is on. Roll and tip are read from gravity's components along the screen's own axes
(cos β · sin γ and sin β), not from the raw γ angle, which flips sign once the screen faces the floor. Keyboard works on a desktop: arrows, X/Z, space, C, P.

## How it is built

- **Rules.** 10×20 well with two hidden rows, 7-bag randomizer, SRS rotation with the standard
  wall-kick tables, ghost, hold, three-piece preview, 0.5 s lock delay with at most 15 resets,
  guideline gravity curve and scoring (four lines is called "Plumb!").
- **Tilt steering is analog.** Roll sets a lateral velocity that accumulates fractional columns; the
  piece leans by that fraction between steps, so a gentle tilt reads as drift, not as a twitchy
  per-column jump.
- **SVG** holds 200 pre-built cell rects updated only on lock, 4 active and 4 ghost rects moved by
  one transform per frame, per-piece gradients, and the board tilts slightly in 3D with the phone.
- **WebGPU shards.** A cleared row breaks into nine shards per cell in that cell's colour; a
  locking piece throws a small puff from its bottom cells. Shards fly out, spin, fall down the screen
  and drift toward the side the piece is steering to, then fade within about 1.5 s. A 4,096-slot ring
  buffer on the GPU holds them; the CPU only writes newly spawned shards, one compute pass moves them
  and one instanced draw renders them on a transparent canvas above the board. When nothing is alive
  the GPU work stops. Without WebGPU, or after a device loss, a Canvas 2D version does the same.
  This replaced an ambient dust field that, having no particle-to-particle forces, collapsed onto
  the flow lines of its own noise field and drew streaks.
- **Music.** The Tetris theme is the Russian folk song "Korobeiniki" (Nekrasov's 1861 poem, sung
  to a traditional melody), which is in the public domain; game arrangements of it, such as
  Hirokazu Tanaka's 1989 Game Boy version, are not. This is an original chiptune setting of the folk
  tune in the form A A B A: a 25%-duty pulse-wave lead (built with `createPeriodicWave`), a triangle
  bass bouncing between octaves on one chord root per bar, noise-channel hats on the eighths and a
  snare on 2 and 4. All of it is synthesized in Web Audio with no audio files, scheduled a quarter
  second ahead from the frame loop. Tempo starts at 132 bpm and gains 6 bpm per level, up to 200.
  It stops on pause and has its own toggle, separate from the sound effects.
- **Game-over music.** Bars 3 to 6 of Chopin's funeral march (Piano Sonata No. 2 in B-flat minor,
  Op. 35, 1839; public domain), the march heard at Soviet state funerals. Bars 1-2 only toll B-flat
  and are skipped. Notes and rhythms were checked against a MIDI of the score (mfiles.co.uk): the
  B-flat toll with its turn down through D-flat and C, then the same figure a third higher on D-flat,
  where Chopin's lower voice in parallel thirds enters; it ends on a held D-flat over B-flat. Melody
  an octave up on square waves, a triangle bass rocking between his left-hand roots B-flat and
  D-flat on every beat, a muffled drum on beats 1 and 3, at 52 bpm, about 20 seconds. It plays once
  and stops when you leave the game-over screen. A test checks every melody onset against the beat
  grid; the first version had the rhythm wrong and an A natural that is not in the score.
- **PWA and updates**: `manifest.json` (fullscreen, portrait) and `sw.js`. The page is fetched
  network-first, other files cache-first with a background refresh, and every network fetch skips the
  HTTP cache (GitHub Pages sends `max-age=600`). A home-screen app on iOS resumes instead of
  reloading, so the page asks the worker to check for a new version each time it returns to the
  foreground and every 30 minutes; when a new worker takes over, the page reloads itself, but only on
  the title or game-over screen. Screen wake lock while playing.
- **Sound and haptics on iOS.** Web Audio is muted by the silent switch unless the page sets
  `navigator.audioSession.type = 'playback'`, which it does (the in-game Sound toggle still mutes).
  iOS has no `navigator.vibrate`; since iOS 18 a click on a hidden `<input type="checkbox" switch>`
  plays the system haptic, but only inside a tap, so iPhones feel taps, swipes and the drops they
  cause and not pieces that land on their own. Android uses `navigator.vibrate` for everything.

## Testing

The Playwright checks (rules, controls, and an offscreen run of both WGSL modules) live with the
experiment that produced this page: [`oaustegard/experiments/plumb`](https://github.com/oaustegard/experiments/tree/main/plumb).
Nothing here has run on a real phone yet. The jab and shake thresholds are first guesses and the
most likely things to need tuning.
