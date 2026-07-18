# Motion Player — Implementation Spec

A single-page PWA (installable to iPhone/Android home screen) that plays YouTube
videos inline and lets the user pan/zoom/stabilize the picture using **touch or
physical phone motion**. Lives at `/motion-player/` on austegard.com (Jekyll
static site, no build step, no bundler — plain ES modules).

## The experience

1. Open `/motion-player/?v=dQw4w9WgXcQ` (or `?url=<any youtube url>`, or paste a
   URL on the landing screen). Video plays inline, muted-autoplay, filling the
   screen in **cover** mode: in portrait, a 16:9 landscape video is scaled so its
   *height* fills the screen — most of its width overflows horizontally.
2. **Touch**: one-finger drag pans the picture. Two-finger pinch zooms (about the
   pinch midpoint), clamped to `[containScale, 5]` where `containScale` is the
   dynamic "fit" zoom — the scale at which the whole video is visible (~0.27 in
   portrait for a 16:9 video, ~1 in landscape). Double-tap resets pan and
   **toggles zoom between "Fill" (cover, zoom 1) and "Fit" (contain, zoom =
   containScale)**, showing a "Fill"/"Fit" toast. Single tap toggles the
   control chrome.
3. **Motion** (opt-in via a button, required for iOS permission): turning the
   phone left/right (yaw) pans the picture horizontally — *window metaphor*:
   turn left → you see more of the left side of the video. Tilting up/down
   (pitch) pans vertically (toggleable). Twirling the phone about the screen
   normal (roll) **counter-rotates the video** so the picture stays level and
   world-stable through a full continuous 360° twirl.
4. Works in portrait and landscape; zoom available in both.

## Files (all under `motion-player/` unless noted)

| File | Owner | Purpose |
|---|---|---|
| `index.html` | app agent | markup, meta/PWA tags, loads styles + modules |
| `styles.css` | app agent | all styling |
| `app.js` | app agent | bootstrap, URL parsing, YT player, view-state, render loop, UI wiring |
| `motion.js` | engine agent | pure math + `MotionEngine` (ES module, Node-testable) |
| `gestures.js` | engine agent | `GestureController` pointer-event gesture recognizer |
| `tests/motion.test.mjs` | engine agent | `node --test` unit tests for the math |
| `manifest.webmanifest` | pwa agent | PWA manifest |
| `sw.js` | pwa agent | service worker, shell cache |
| `scripts/make_icons.py` | pwa agent | stdlib-only PNG icon generator |
| `icons/*.png` | pwa agent | generated icons |
| `README.md` | pwa agent | user + developer docs |
| `../tests/motion-player.spec.js` (repo root `tests/`) | app agent | Playwright smoke test |

No file is touched by two agents. Everything below is normative.

---

## Coordinate conventions (normative — do not improvise)

- **Device frame**: `x` right edge of screen, `y` top of screen, `z` out of the
  screen toward the user (W3C).
- **World frame**: `x` East, `y` North, `z` Up.
- `deviceorientation` supplies intrinsic Tait-Bryan angles Z-X'-Y'':
  `R = Rz(alpha) · Rx(beta) · Ry(gamma)` maps device coords → world coords
  (`v_world = R · v_device`). Angles arrive in degrees.
- Matrices are `number[9]`, row-major.

### Derived quantities

- **View axis** (where the back of the phone points):
  `v = R · (0, 0, −1)` (unit vector, world frame).
- **Yaw** `psi = atan2(−v.x, v.y)` degrees. Upright portrait facing North →
  `psi = 0`; turning the phone **left** (toward West) → `psi = +90`.
- **Pitch** `theta = asin(clamp(v.z, −1, 1))` degrees. Phone flat on table,
  screen up → `theta = −90`; upright → `theta = 0`; tilting the top of the
  phone back/up raises `theta`.
- **Screen roll**: `up_dev = Rᵀ · (0, 0, 1)` (world Up in device coords), then
  `phi = atan2(up_dev.x, up_dev.y)` degrees. Upright portrait → `phi = 0`.
  This is the rotation of the world's up direction within the screen plane.

### Verified test vectors (must be encoded as unit tests)

With `M = eulerToMatrix(alpha, beta, gamma)`:

1. `M = eulerToMatrix(0, 90, 0)` (upright portrait, facing North):
   `psi ≈ 0`, `theta ≈ 0`, `phi ≈ 0`.
2. `eulerToMatrix(90, 90, 0)`: `psi ≈ +90` (turned left/West), `theta ≈ 0`.
3. `eulerToMatrix(0, 45, 0)`: `theta ≈ −45`. `eulerToMatrix(0, 0, 0)` (flat,
   screen up): `theta ≈ −90`.
4. **Twirl invariance**: for the upright pose `R0 = eulerToMatrix(0, 90, 0)`
   and a rotation of the device about its own screen normal by `t` degrees
   (post-multiply: `R = R0 · RzDev(t)` where `RzDev(t)` is rotation about
   device z), `screenRoll(R) ≈ +t` for `t` in `{10, 45, 90, 170}` — i.e. a
   counter-clockwise device twirl (as seen by the user) yields `phi = +t`.
   Sweeping `t` over `0..350` in 10° steps and unwrapping must be continuous
   (no jump > 15° between steps): this is the 360° twirl guarantee.
5. **Unwrap**: `unwrapDeg(170, −170) = 190`, `unwrapDeg(−170, 170) = −190`,
   `unwrapDeg(10, 20) = 20` (i.e. returns `next` adjusted by ±360·k to be
   within 180 of `prev`).

### How the app uses the outputs (sign contract)

All outputs are **deltas relative to a calibration baseline** (captured at
motion-enable, on `recenter()`, and on screen-orientation change):

- `panXdeg = unwrapped(psi − psi0)` — positive = user turned phone left.
  App maps it to a **positive screen-x translation** (image slides right,
  revealing the left of the video).
- `panYdeg = unwrapped(theta − theta0)` — positive = tilted up. App maps to
  **positive screen-y translation** (image slides down, revealing the top).
- `rollDeg = unwrapped(phi − phi0)` — the app applies **`rotate(rollDeg)`**
  (CSS, clockwise-positive) to the video wrapper. This is the counter-rotation:
  user twirls device CCW by t → `phi` increases by t → CSS rotates the picture
  CW by t *relative to the screen*, i.e. the picture stays fixed in the world.

### Gimbal handling (normative)

When the phone is near-flat, world Up is nearly parallel to the screen normal
and `phi` is undefined/noisy. Compute `w = hypot(up_dev.x, up_dev.y)`;
when `w < 0.25`, **hold the last stable `phi`** (do not update roll). Yaw is
similarly degenerate when the view axis is near-vertical
(`|v.z| > 0.97`): hold last `psi`.

### Screen-orientation compensation

`phi`, `psi` panning axes are defined in *device* coordinates; the CSS pixel
frame rotates when the OS rotates the UI. Subtract
`screen.orientation?.angle ?? window.orientation ?? 0` from `phi` before
baselining/diffing, and **recenter the baseline on `orientationchange`**
(after a ~300ms settle delay) so the picture never jumps when the OS rotates.

---

## `motion.js` exports (exact API)

```js
export function eulerToMatrix(alphaDeg, betaDeg, gammaDeg): number[9]
export function viewYawPitchDeg(m): { yaw: number, pitch: number }
export function screenRollDeg(m): number          // phi as defined above
export function unwrapDeg(prevDeg, nextDeg): number
export function rotZ(deg): number[9]              // helpers used by tests
export function matMul(a, b): number[9]

export class MotionEngine {
  constructor(opts = {})   // { onUpdate(sample), smoothing = 0.25 }
  static async requestPermission()  // 'granted' | 'denied' | 'unsupported'
      // calls DeviceOrientationEvent.requestPermission() when it exists (iOS);
      // resolves 'granted' immediately elsewhere; never throws.
  start()                  // addEventListener('deviceorientation', ...) +
                            // absolute-fallback watchdog (see below)
  stop()                   // removes both listeners, clears the watchdog
  recenter()               // next event re-baselines psi0/theta0/phi0
  get active(): boolean
  lastRawEvent             // {alpha,beta,gamma,absolute,timestamp} of the
                           // most recent raw event, or null if none yet
  eventCount               // running count of all raw events received
}
```

`onUpdate` receives `{ panXdeg, panYdeg, rollDeg }` — already baselined,
unwrapped, exponentially smoothed (`smoothed += k·(target − smoothed)` per
event), gimbal-guarded. The engine must be constructible and its pure functions
importable in Node (no `window` access at module top level; guard all DOM/event
usage inside methods).

### Robustness: absolute-orientation fallback (normative)

Some Android/Chrome stacks never fire `deviceorientation` and only ever
deliver `deviceorientationabsolute`. `start()` arms a watchdog: if no regular
`deviceorientation` event has arrived within 1.5 s, it *also* attaches the
same processing path to `deviceorientationabsolute` (both listeners stay
attached afterward — no need to detach the regular one). To avoid
double-processing the same physical sample when a stack fires both, an
absolute event is ignored if a regular event arrived less than 500 ms ago
(tracked via a `lastRegularEventAt` timestamp). `stop()` removes whichever
listeners were attached. Every raw event, from either source, updates
`lastRawEvent` and increments `eventCount` before any gimbal/baseline
processing — including events with a null `alpha/beta/gamma` (they're
otherwise ignored, but still evidence the platform is delivering *something*).

## `gestures.js` exports (exact API)

```js
export class GestureController {
  constructor(el, cb = {})
  // cb: { onPan(dxPx, dyPx),            // one-finger drag deltas since last event
  //       onPinch(factor, cxPx, cyPx),  // multiplicative scale since last event, midpoint in el coords
  //       onTap(), onDoubleTap() }
  destroy()
}
```

Pointer Events only (`pointerdown/move/up/cancel` + `setPointerCapture`),
`touch-action: none` is set by CSS. Tap = < 300 ms and < 12 px travel;
double-tap = second tap within 350 ms / 40 px (suppress the single-tap callback
via a 360 ms timer). During a 2-pointer pinch, midpoint movement also emits
`onPan`. Must not preventDefault scrolling issues away — the overlay element
has `touch-action: none` so the browser never scrolls.

## `app.js` responsibilities

### URL / video identity
- Accept `?v=<11-char id>` or `?url=<encoded url>`; also tolerate `?v=<full url>`.
  Extract IDs from `watch?v=`, `youtu.be/`, `shorts/`, `embed/`, `live/` forms.
- No param → landing screen with a paste input + "Play" button, list of up to 5
  recent videos from `localStorage` (`motion-player:recent`, `[{id, title?, ts}]`),
  and a "how to install" hint (Share → Add to Home Screen / Chrome ⋮ → Add).
- On play, `history.replaceState` to `?v=<id>` so bookmark/share/relaunch works;
  push the id into recents.

### YouTube playback
- Load `https://www.youtube.com/iframe_api` lazily; build the player in a host
  div with `playerVars: { playsinline: 1, autoplay: 1, mute: 1, controls: 0,
  rel: 0, iv_load_policy: 3, fs: 0, disablekb: 1 }`.
- The whole iframe sits under a transparent gesture overlay — the iframe never
  receives touches. All control is via the IFrame API: play/pause toggle,
  mute/unmute, seek ±10 s. Show a big unmute chip while muted.
- If the API fails to load (offline/blocked), show a friendly error on the
  landing screen — the shell must still render (Playwright-testable without
  YouTube network access).
- **Sound intent** (`soundOn`, persisted, default `true`): autoplay policy
  requires muted playback, so the player always boots muted regardless of
  intent. Once ready and playing muted, the **first** `pointerdown` anywhere
  on the gesture overlay is a genuine user gesture — if `soundOn` is `true`
  and the video is still muted, auto-unmute right there (toast "Sound on").
  Explicitly pressing the mute button sets `soundOn = false` and persists;
  unmuting (mute button or the unmute chip) sets `soundOn = true` and
  persists. The unmute chip still shows while muted regardless of `soundOn`.

### View state & render loop
Single source of truth:

```js
state = {
  zoom: 1,            // touch zoom, clamped [containScale, 5] (dynamic floor, see below)
  panX, panY,         // touch pan, CSS px, screen frame
  motion: { panXdeg, panYdeg, rollDeg },  // latest engine sample (0s when off)
  motionEnabled, rollStabilize, verticalPan,   // toggles (persist to localStorage)
  sensitivity,        // 0.5..3, default 1 (persist)
  soundOn,            // default true (persist) — see "Sound intent" below
  fitMode,            // true when zoom is at/near containScale — see below
}
```

- Base cover size (JS, on resize): given viewport `w×h` and aspect `A = 16/9`,
  iframe size `W = max(w, h·A)`, `H = W / A`. Center it. Zoom multiplies on top.
- **Dynamic zoom floor** (`containScale`): recomputed alongside cover size as
  `min(w / W, h / H)` — the zoom level at which the whole cover-sized video
  fits inside the viewport ("contain"/"fit"). This replaces a hardcoded
  `ZOOM_MIN = 0.5`, which was too tight to see the full video width in
  portrait (~0.27 for 16:9). All zoom clamps (pinch, double-tap, programmatic)
  use `[containScale, 5]`.
- **`fitMode`**: `true` whenever `zoom <= containScale * 1.02` (i.e. the user
  is at/near "fit"), recomputed after every pinch and every double-tap;
  `false` once the user zooms above that. On resize/orientation-change, after
  recomputing cover size + `containScale`: if `fitMode`, snap zoom to the
  *new* `containScale` (so "fit" stays "fit" across rotation instead of
  shrinking further); otherwise just re-clamp zoom into `[containScale, 5]`.
- Degrees→px: `pxPerDeg = (1.4 · max(w, h) / 90) · 3 · sensitivity` — i.e. about
  30° of yaw sweeps a full screen-length at sensitivity 1. (Constant factored
  into one named function; tune later.)
- Composite transform on the wrapper (order matters):
  `translate(-50%, -50%) rotate(var(--roll)) scale(var(--zoom)) translate(var(--tx), var(--ty))`
  with `--tx/--ty` in the *rotated* (video) frame. Touch pan deltas arrive in
  screen px — rotate them by `−roll` before adding to `panX/panY`. Motion pan
  (`panXdeg·pxPerDeg`) adds in the same video frame.
- Clamp total pan so the video center never leaves the viewport and edges can't
  come further in than 25% of the viewport (soft-clamp: overshoot decays).
- rAF loop lerps rendered values toward targets (`k = 0.28`) and writes the CSS
  custom properties on the wrapper — never touch layout properties per-frame.
- Double-tap: reset pan→0, `engine.recenter()`, and **toggle zoom** between
  cover (`zoom = 1`, "Fill") and contain (`zoom = containScale`, "Fit") —
  whichever the user is not currently at — with a "Fill"/"Fit" toast.

### Chrome (controls)
- Screen-aligned (outside the transformed wrapper), auto-hides after 3 s of no
  interaction; single tap toggles. Safe-area-inset padding.
- Buttons: play/pause, mute, −10 s, +10 s, **Motion** toggle (runs the iOS
  permission flow on first enable; label the denied state), **Recenter**,
  settings (⚙ bottom sheet: sensitivity slider, vertical-pan toggle,
  roll-stabilize toggle, invert-X toggle, live motion diagnostics row), and a
  home/back button (→ landing).
- Show a transient toast for state changes ("Motion on", "Permission denied —
  use touch", "Recentered", "Fill"/"Fit", "Sound on", "No motion data — this
  browser may not support device orientation").
- **Motion diagnostics** (`#motion-debug` in the settings sheet): while the
  sheet is open, refresh ~5×/sec with either "no motion events" or the most
  recent raw `α β γ` (1 decimal) plus the current `state.motion` pan/roll
  outputs and the permission state — lets a user report exactly what their
  phone delivers when motion sensing appears dead. Sourced from
  `MotionEngine#lastRawEvent` / `#eventCount` (see `motion.js` below).
- **Motion watchdog**: after `engine.start()`, if `engine.eventCount` is still
  `0` after 2.5 s, toast "No motion data — this browser may not support
  device orientation", flip the Motion toggle back off, and `engine.stop()` —
  the device/browser isn't delivering orientation events at all, so leaving
  the toggle "on" would be a lie.
- Register `sw.js` on load (scope `./`; skip silently on failure or
  `location.protocol === 'file:'`).

### Playwright smoke test (`tests/motion-player.spec.js`, repo root tests dir)
Follows the repo's existing `@playwright/test` style (`test`/`expect` from
`@playwright/test`, baseURL http://localhost:8080). Must **not** require
YouTube to be reachable:
- `/motion-player/` loads with zero `pageerror`s; landing UI visible.
- Typing `https://youtu.be/dQw4w9WgXcQ` + clicking Play flips to player mode
  (player host div appears) and URL becomes `?v=dQw4w9WgXcQ`.
- `/motion-player/?v=dQw4w9WgXcQ` boots straight into player mode, zero
  `pageerror`s (the YT script tag may fail to load — app must catch that).
- Unit-ish check in-page: `import('./motion.js')` and assert the twirl test
  vector (spec §test-vectors #4) from the browser context.
- Dynamic zoom floor: with the viewport forced to a portrait size, assert
  `window.__motionPlayerDebug().containScale` (a test-only read-only snapshot
  hook — not used by the app itself) is well below the old hardcoded
  `ZOOM_MIN = 0.5`, confirming the fix from a desktop browser without needing
  to simulate a real pinch gesture.

## Visual design

Dark, minimal, phone-first. Background `#000`. Chrome: translucent
`rgba(15,17,22,.72)` with `backdrop-filter: blur(12px)`, 1px `#ffffff1a`
borders, `border-radius: 14px`, accent `#38bdf8` (active toggles use it),
system font stack, icons inline SVG (no external assets). Landing screen:
centered column, app name "Motion Player", one-line tagline
("Pan with your hands. Literally."), input, recents, install hint. Everything
must respect `env(safe-area-inset-*)` and `100dvh`.

## PWA specifics (pwa agent)

- `manifest.webmanifest`: name "Motion Player", short_name "Motion",
  `start_url: "./"`, `scope: "./"`, `display: "standalone"`,
  `orientation: "any"` (omit or "any" — portrait lock would kill landscape mode),
  `background_color/theme_color: "#000000"`, icons 192 + 512 (`purpose: "any"`)
  and 512 (`purpose: "maskable"`).
- `index.html` gets (app agent adds these, listed here for coordination):
  `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`,
  `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style: black-translucent`,
  `<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">`,
  `<link rel="manifest" href="manifest.webmanifest">`, `theme-color #000`.
- `sw.js`: version-string cache name; precache `./`, `index.html`, `app.js`,
  `motion.js`, `gestures.js`, `styles.css`, `manifest.webmanifest`, icons.
  Stale-while-revalidate for same-origin GETs within scope; **never intercept
  cross-origin** (YouTube). `skipWaiting` + `clients.claim`.
- Icons via `scripts/make_icons.py`, **Python stdlib only** (zlib + struct PNG
  writer, no Pillow): dark rounded-square `#0b0d12`, a centered play triangle in
  accent `#38bdf8`, encircled by a ~300° arc ring (suggesting rotation) in
  `#5eead4`. Analytic per-pixel anti-aliasing (distance-based alpha) is enough.
  Outputs: `icon-192.png`, `icon-512.png`, `maskable-512.png` (same art at 70%
  scale, full-bleed background), `apple-touch-icon.png` (180, opaque bg).
  Script must be deterministic and re-runnable.
