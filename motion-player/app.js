// Motion Player — app.js
// Bootstrap, URL parsing, YouTube player, view-state, render loop, UI wiring.
// See SPEC.md for the normative contract. Imports the sibling engine/gesture
// modules by their exact spec'd API — do not change these import specifiers.
import { MotionEngine } from './motion.js';
import { GestureController } from './gestures.js';

/* ===================== Constants ===================== */

const LS_RECENT = 'motion-player:recent';
const LS_PREFS = 'motion-player:prefs';
const ASPECT = 16 / 9;
const LERP_K = 0.28;
// ZOOM_MIN is no longer a hardcoded constant — the zoom floor is the dynamic
// "contain" scale (computed in computeCoverSize()) so the whole video width
// is always reachable by zooming out, in both portrait and landscape.
const ZOOM_MAX = 5;
const YT_LOAD_TIMEOUT_MS = 6000;
const CHROME_AUTOHIDE_MS = 3000;
const TOAST_MS = 1600;
const MOTION_WATCHDOG_MS = 2500;
const MOTION_DEBUG_INTERVAL_MS = 200;

/* ===================== DOM refs ===================== */

const el = {
  landing: document.getElementById('landing'),
  player: document.getElementById('player'),
  landingForm: document.getElementById('landing-form'),
  urlInput: document.getElementById('url-input'),
  landingError: document.getElementById('landing-error'),
  recents: document.getElementById('recents'),
  recentsList: document.getElementById('recents-list'),

  stage: document.getElementById('stage'),
  ytWrapper: document.getElementById('yt-wrapper'),
  ytHost: document.getElementById('yt-host'),
  gestureOverlay: document.getElementById('gesture-overlay'),
  unmuteChip: document.getElementById('unmute-chip'),
  playerError: document.getElementById('player-error'),

  chromeTop: document.getElementById('chrome-top'),
  chromeBottom: document.getElementById('chrome-bottom'),
  btnHome: document.getElementById('btn-home'),
  btnMotion: document.getElementById('btn-motion'),
  btnRecenter: document.getElementById('btn-recenter'),
  btnSettings: document.getElementById('btn-settings'),
  btnBack10: document.getElementById('btn-back10'),
  btnFwd10: document.getElementById('btn-fwd10'),
  btnPlayPause: document.getElementById('btn-playpause'),
  iconPlay: document.getElementById('icon-play'),
  iconPause: document.getElementById('icon-pause'),
  btnMute: document.getElementById('btn-mute'),
  iconVolOn: document.getElementById('icon-vol-on'),
  iconVolOff: document.getElementById('icon-vol-off'),

  settingsSheet: document.getElementById('settings-sheet'),
  settingsScrim: document.getElementById('settings-scrim'),
  settingsClose: document.getElementById('settings-close'),
  settingSensitivity: document.getElementById('setting-sensitivity'),
  settingSensitivityVal: document.getElementById('setting-sensitivity-val'),
  settingVertical: document.getElementById('setting-vertical'),
  settingRoll: document.getElementById('setting-roll'),
  settingInvert: document.getElementById('setting-invert'),
  settingCaptions: document.getElementById('setting-captions'),
  motionDebug: document.getElementById('motion-debug'),

  toast: document.getElementById('toast'),
};

/* ===================== Persistence ===================== */

function loadPrefs() {
  const defaults = { sensitivity: 1, verticalPan: true, rollStabilize: true, invertX: false, soundOn: true, motionOn: true, captionsOn: false };
  try {
    const raw = localStorage.getItem(LS_PREFS);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    const merged = { ...defaults, ...parsed };
    // The sensitivity range narrowed from 0.5–3 to 0.1–2; clamp persisted
    // values from the old range into the current slider bounds.
    merged.sensitivity = Math.min(2, Math.max(0.1, Number(merged.sensitivity) || 1));
    return merged;
  } catch {
    return defaults;
  }
}

function savePrefs() {
  try {
    localStorage.setItem(LS_PREFS, JSON.stringify({
      sensitivity: state.sensitivity,
      verticalPan: state.verticalPan,
      rollStabilize: state.rollStabilize,
      invertX: state.invertX,
      soundOn: state.soundOn,
      motionOn: state.motionOn,
      captionsOn: state.captionsOn,
    }));
  } catch { /* storage unavailable — ignore */ }
}

function loadRecents() {
  try {
    const raw = localStorage.getItem(LS_RECENT);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function pushRecent(id, title) {
  try {
    let recents = loadRecents().filter((r) => r.id !== id);
    recents.unshift({ id, title: title || id, ts: Date.now() });
    recents = recents.slice(0, 5);
    localStorage.setItem(LS_RECENT, JSON.stringify(recents));
    return recents;
  } catch {
    return loadRecents();
  }
}

/* ===================== URL / video-id parsing ===================== */

function isBareId(s) {
  return /^[A-Za-z0-9_-]{11}$/.test(s);
}

export function extractVideoId(input) {
  if (!input) return null;
  const trimmed = String(input).trim();
  if (isBareId(trimmed)) return trimmed;

  let url;
  try {
    url = new URL(trimmed);
  } catch {
    try {
      url = new URL('https://' + trimmed);
    } catch {
      return null;
    }
  }

  const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '');

  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    return id && isBareId(id) ? id : null;
  }

  if (host === 'youtube.com' || host.endsWith('.youtube.com')) {
    const v = url.searchParams.get('v');
    if (v && isBareId(v)) return v;
    const m = url.pathname.match(/\/(shorts|embed|live)\/([A-Za-z0-9_-]{11})/);
    if (m) return m[2];
  }

  return null;
}

function parseQueryVideoId() {
  const params = new URLSearchParams(location.search);
  const v = params.get('v');
  if (v) {
    const id = extractVideoId(v);
    if (id) return id;
  }
  const url = params.get('url');
  if (url) {
    let decoded = url;
    try { decoded = decodeURIComponent(url); } catch { /* already decoded */ }
    const id = extractVideoId(decoded);
    if (id) return id;
  }
  // Web Share Target (Android): YouTube shares the link in `text` (sometimes
  // `title`), not `url`. Try each verbatim, then any URL embedded in the text.
  for (const key of ['text', 'title']) {
    const value = params.get(key);
    if (!value) continue;
    const id = extractVideoId(value);
    if (id) return id;
    const embedded = value.match(/https?:\/\/\S+/);
    if (embedded) {
      const embeddedId = extractVideoId(embedded[0]);
      if (embeddedId) return embeddedId;
    }
  }
  return null;
}

/* ===================== View state ===================== */

const prefs = loadPrefs();

const state = {
  zoom: 1,
  panX: 0,
  panY: 0,
  motion: { panXdeg: 0, panYdeg: 0, rollDeg: 0 },
  motionEnabled: false,
  rollStabilize: prefs.rollStabilize,
  verticalPan: prefs.verticalPan,
  invertX: prefs.invertX,
  sensitivity: prefs.sensitivity,
  soundOn: prefs.soundOn,
  // Persisted intent to use motion control; actual activation still requires
  // the iOS permission gesture (see the first-gesture auto-enable).
  motionOn: prefs.motionOn,
  // Subtitles default OFF: YouTube force-enables captions on muted playback
  // (and we always autoplay muted), so we explicitly unload the captions
  // module unless the user opts in.
  captionsOn: prefs.captionsOn,
  // true when zoom is at/near the "contain" (fit) scale — see updateFitMode().
  fitMode: false,
};

const rendered = { x: 0, y: 0, roll: 0, zoom: 1 };
let coverSize = { W: 0, H: 0 };
// Dynamic zoom floor: min(vw/coverW, vh/coverH) — the scale at which the
// entire video is visible ("contain"). Recomputed wherever coverSize is
// recomputed (computeCoverSize()). Replaces the old hardcoded ZOOM_MIN.
let containScale = 1;

/* ===================== Toast ===================== */

let toastTimer = null;
function toast(msg) {
  el.toast.textContent = msg;
  el.toast.hidden = false;
  // Force reflow so repeated toasts re-trigger the transition.
  void el.toast.offsetWidth;
  el.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.toast.classList.remove('show');
    setTimeout(() => { el.toast.hidden = true; }, 220);
  }, TOAST_MS);
}

/* ===================== Orientation neutralization ===================== */
// iOS Safari offers no way for a web app to lock orientation, so when the OS
// flips the viewport to landscape we counter-rotate #app back to the
// device's natural portrait with a CSS transform — no OS orientation lock
// needed, the app never visually leaves portrait. Technique ported from Ball
// Maze (fun-and-games/ball-maze/game.js), including its later refinements:
// prefer whichever angle source reports a rotation (window.orientation still
// updates when standalone iOS freezes screen.orientation), gate to portrait-
// natural devices, wait out iOS's staggered angle/resize signals before
// painting (avoids the mid-rotation shrink), and infer the quarter-turn from
// gravity when every API is stuck. Synchronous flip handling makes a rotation
// read as one motion.
//
// viewportW()/viewportH() return the device-natural dimensions, which are
// invariant across OS rotation — so cover size, containScale, zoom and pan
// never need to change (no re-layout, no jump) when the OS flips.

const appEl = document.getElementById('app');
let uiAngle = 0; // viewport rotation the neutralizer is currently countering

// In installed (home-screen) web apps iOS can leave screen.orientation stuck
// at its launch value after a rotation, so prefer whichever source reports a
// rotation; the deprecated window.orientation still updates reliably in
// standalone mode. inferredAngle is a last-resort quarter-turn deduced from
// gravity when BOTH report 0 yet the viewport is landscape — it clears itself
// as soon as a real source speaks or portrait returns.
let inferredAngle = null;
function orientationAngle() {
  const so = (screen.orientation && screen.orientation.angle != null)
    ? screen.orientation.angle : null;
  const wo = (typeof window.orientation === 'number') ? window.orientation : null;
  let a = so || wo || 0;
  if (a === 0) {
    if (inferredAngle != null && window.innerWidth > window.innerHeight) {
      a = inferredAngle;
    } else {
      inferredAngle = null;
    }
  } else {
    inferredAngle = null;
  }
  return ((a % 360) + 360) % 360;
}

// Counter-rotation only makes sense on portrait-natural devices (phones). On
// landscape-natural screens (desktops, some tablets) angle 90/270 means the
// device was turned to PORTRAIT — forcing our portrait layout sideways there
// would be exactly wrong. type and angle come from the same update, so this
// stays consistent even mid-rotation.
function naturalPortrait() {
  const o = screen.orientation;
  if (!o || !o.type) return window.innerHeight >= window.innerWidth;
  const landscapeType = o.type.indexOf('landscape') === 0;
  const quarterTurn = o.angle === 90 || o.angle === 270;
  return landscapeType === quarterTurn;
}

/** Device-natural width/height — invariant under OS rotation. */
function viewportW() {
  return (uiAngle === 90 || uiAngle === 270) ? window.innerHeight : window.innerWidth;
}
function viewportH() {
  return (uiAngle === 90 || uiAngle === 270) ? window.innerWidth : window.innerHeight;
}

function neutralizeOrientation(forceAngle) {
  uiAngle = forceAngle != null ? forceAngle : orientationAngle();
  // don't counter-rotate on landscape-natural devices (see naturalPortrait)
  if (forceAngle == null && !naturalPortrait()) uiAngle = 0;
  const s = appEl.style;
  if (uiAngle === 90 || uiAngle === 270) {
    // innerWidth/innerHeight can be stale mid-rotation on iOS; min/max yields
    // the right device-natural portrait box (short × long) either way
    const w = Math.min(window.innerWidth, window.innerHeight);
    const h = Math.max(window.innerWidth, window.innerHeight);
    s.width = w + 'px';
    s.height = h + 'px';
    s.transformOrigin = 'top left';
    s.transform = uiAngle === 90
      ? `translateY(${w}px) rotate(-90deg)`
      : `translateX(${h}px) rotate(90deg)`;
  } else if (uiAngle === 180) {
    s.width = window.innerWidth + 'px';
    s.height = window.innerHeight + 'px';
    s.transformOrigin = 'center center';
    s.transform = 'rotate(180deg)';
  } else {
    s.width = '';
    s.height = '';
    s.transform = '';
    s.transformOrigin = '';
  }
}

/**
 * Un-rotate a viewport-oriented vector into app-space (device-natural
 * portrait) coordinates — the inverse of the linear part of
 * neutralizeOrientation()'s transform. #app's transform-origin is 0 0, but
 * every caller here works in vectors/center-relative points (pan deltas;
 * pinch midpoint relative to the stage center), so the additive translation
 * term cancels and this single linear map serves both call sites.
 */
function unrotateVector(dx, dy, angle) {
  switch (angle) {
    case 90: return { x: -dy, y: dx };
    case 270: return { x: dy, y: -dx };
    case 180: return { x: -dx, y: -dy };
    default: return { x: dx, y: dy };
  }
}

async function tryNativeLock() {
  // Works in installed/fullscreen contexts on Android; iOS throws (no
  // screen.orientation.lock support there) and the CSS counter-rotation
  // above covers it instead. Never unlock.
  try {
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock('portrait');
    }
  } catch { /* not supported here — counter-rotation covers it */ }
}

/* ===================== Cover sizing ===================== */

function computeCoverSize() {
  const w = viewportW();
  const h = viewportH();
  const W = Math.max(w, h * ASPECT);
  const H = W / ASPECT;
  coverSize = { W, H };
  el.ytWrapper.style.width = `${W}px`;
  el.ytWrapper.style.height = `${H}px`;
  // "contain" scale: the zoom level at which the full cover-sized video fits
  // entirely inside the viewport (letterboxed/pillarboxed as needed). This
  // is the dynamic zoom floor — ~0.27 in portrait for a 16:9 video, ~1 in
  // landscape.
  containScale = Math.min(w / W, h / H);
}

/** Recompute state.fitMode from the current zoom vs. containScale. */
function updateFitMode() {
  state.fitMode = state.zoom <= containScale * 1.02;
}

/**
 * After coverSize/containScale change (resize, orientation change): if the
 * user was at "fit", stay at fit (snap to the new containScale) so rotating
 * never shrinks the picture further; otherwise just re-clamp zoom into the
 * new [containScale, ZOOM_MAX] range.
 */
function reconcileZoomToContainScale() {
  if (state.fitMode) {
    state.zoom = containScale;
  } else {
    state.zoom = Math.min(ZOOM_MAX, Math.max(containScale, state.zoom));
  }
}

/* ===================== Pan clamp ===================== */

function pxPerDeg(sensitivity) {
  const w = viewportW();
  const h = viewportH();
  return (1.4 * Math.max(w, h) / 90) * 3 * sensitivity;
}

function softClampAxis(v, max) {
  if (max <= 0) return 0;
  const abs = Math.abs(v);
  if (abs <= max) return v;
  const excess = abs - max;
  const soft = max + excess * 0.35;
  return Math.sign(v) * Math.min(soft, max * 1.6);
}

function maxPanFor(zoom) {
  const vw = viewportW();
  const vh = viewportH();
  const scaledW = coverSize.W * zoom;
  const scaledH = coverSize.H * zoom;
  const overflowX = Math.max(0, (scaledW - vw) / 2);
  const overflowY = Math.max(0, (scaledH - vh) / 2);
  const maxScreenX = overflowX + 0.25 * vw;
  const maxScreenY = overflowY + 0.25 * vh;
  return { x: maxScreenX / zoom, y: maxScreenY / zoom };
}

function rotatePoint(x, y, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return { x: x * cos - y * sin, y: x * sin + y * cos };
}

/* ===================== Gesture wiring ===================== */

const gestures = new GestureController(el.gestureOverlay, {
  onPan(dxPx, dyPx) {
    // The overlay's local coords are viewport-oriented (its bounding rect is
    // the post-transform, viewport-aligned box); un-rotate into app space
    // before the existing roll-compensation rotation. See "Orientation
    // neutralization" above.
    const un = unrotateVector(dxPx, dyPx, uiAngle);
    const roll = state.rollStabilize ? rendered.roll : 0;
    const rotated = rotatePoint(un.x, un.y, -roll);
    state.panX += rotated.x;
    state.panY += rotated.y;
    showChrome();
  },
  onPinch(factor, cxPx, cyPx) {
    const rect = el.stage.getBoundingClientRect();
    const mx = cxPx - rect.width / 2;
    const my = cyPx - rect.height / 2;
    // mx/my are viewport-oriented, center-relative — un-rotate the same way
    // as onPan's deltas before applying roll compensation.
    const un = unrotateVector(mx, my, uiAngle);
    const roll = state.rollStabilize ? rendered.roll : 0;
    const v = rotatePoint(un.x, un.y, -roll);

    const oldZoom = state.zoom;
    const newZoom = Math.min(ZOOM_MAX, Math.max(containScale, oldZoom * factor));
    if (newZoom !== oldZoom) {
      const invFactor = 1 / newZoom - 1 / oldZoom;
      state.panX += v.x * invFactor;
      state.panY += v.y * invFactor;
      state.zoom = newZoom;
      updateFitMode();
    }
    showChrome();
  },
  onTap() {
    toggleChrome();
  },
  onDoubleTap() {
    // Toggle between "Fill" (cover, zoom 1) and "Fit" (contain, zoom =
    // containScale) — whichever the user is NOT currently at.
    const goingToFit = !state.fitMode;
    state.zoom = Math.min(ZOOM_MAX, Math.max(containScale, goingToFit ? containScale : 1));
    state.panX = 0;
    state.panY = 0;
    updateFitMode();
    if (engine) engine.recenter();
    toast(goingToFit ? 'Fit' : 'Fill');
    showChrome();
  },
});

/* ===================== Motion engine wiring ===================== */

const engine = new MotionEngine({
  onUpdate(sample) {
    state.motion.panXdeg = sample.panXdeg;
    state.motion.panYdeg = sample.panYdeg;
    state.motion.rollDeg = sample.rollDeg;
  },
  smoothing: 0.25,
  // #app is counter-rotated back to device-natural portrait ourselves (see
  // "Orientation neutralization"), so the engine should treat the screen
  // angle as always 0 and ride straight through orientationchange with no
  // re-baseline — the UI never actually leaves device-natural portrait from
  // the engine's point of view.
  compensateScreenAngle: false,
});

let motionPermissionState = null; // null | 'granted' | 'denied' | 'unsupported'
let motionWatchdogTimer = null;

// NOTE (iOS permission gesture requirement): DeviceOrientationEvent
// .requestPermission() must be *called* synchronously within the click
// handler's task, before any other `await`. enableMotion() is invoked
// directly (not awaited) from the btnMotion click handler below, and the
// very first thing it does — with no prior `await` — is call
// MotionEngine.requestPermission(), which itself calls
// DeviceOrientationEvent.requestPermission() as its first statement. Do not
// insert any `await` (or anything that yields to the event loop) ahead of
// that call, or iOS Safari will silently reject the permission prompt.
async function enableMotion() {
  if (motionPermissionState === null || motionPermissionState === 'denied') {
    try {
      motionPermissionState = await MotionEngine.requestPermission();
    } catch {
      motionPermissionState = 'unsupported';
    }
  }

  if (motionPermissionState === 'denied') {
    toast('Permission denied — use touch');
    state.motionEnabled = false;
    updateMotionButton();
    return;
  }
  if (motionPermissionState === 'unsupported') {
    toast('Motion not supported on this device');
    state.motionEnabled = false;
    el.btnMotion.disabled = true;
    updateMotionButton();
    return;
  }

  engine.start();
  state.motionEnabled = true;
  toast('Motion on');
  updateMotionButton();

  // Watchdog: if the engine hasn't received a single orientation event
  // (regular or absolute-fallback) after a few seconds, this device/browser
  // likely doesn't deliver motion data at all — tell the user and back out
  // of "motion enabled" so the UI doesn't lie about the toggle state.
  clearTimeout(motionWatchdogTimer);
  motionWatchdogTimer = setTimeout(() => {
    motionWatchdogTimer = null;
    if (state.motionEnabled && engine.eventCount === 0) {
      toast('No motion data — this browser may not support device orientation');
      engine.stop();
      state.motionEnabled = false;
      state.motion.panXdeg = 0;
      state.motion.panYdeg = 0;
      state.motion.rollDeg = 0;
      updateMotionButton();
    }
  }, MOTION_WATCHDOG_MS);
}

function disableMotion() {
  clearTimeout(motionWatchdogTimer);
  motionWatchdogTimer = null;
  engine.stop();
  state.motionEnabled = false;
  state.motion.panXdeg = 0;
  state.motion.panYdeg = 0;
  state.motion.rollDeg = 0;
  updateMotionButton();
}

function updateMotionButton() {
  el.btnMotion.setAttribute('aria-pressed', String(state.motionEnabled));
}

el.btnMotion.addEventListener('click', () => {
  // Explicit button presses record intent (persisted); the watchdog's
  // auto-backout in enableMotion() deliberately does not.
  if (state.motionEnabled) {
    disableMotion();
    state.motionOn = false;
    savePrefs();
    toast('Motion off');
  } else {
    state.motionOn = true;
    savePrefs();
    enableMotion();
  }
  showChrome();
});

el.btnRecenter.addEventListener('click', () => {
  if (engine) engine.recenter();
  toast('Recentered');
  showChrome();
});

// Orientation-change handling now lives in the "Orientation neutralization"
// section above: the #app counter-rotation plus the invariant viewportW()/
// viewportH() helpers mean cover size, containScale, zoom and pan are all
// unaffected by an OS rotation, and the engine (compensateScreenAngle:
// false) rides straight through it with no re-baseline. See
// handleViewportChange() below, wired to resize/orientationchange/
// screen.orientation 'change'.

/* ===================== Render loop ===================== */

function decayOvershoot() {
  const max = maxPanFor(state.zoom);
  if (Math.abs(state.panX) > max.x) {
    const target = softClampAxis(state.panX, max.x);
    state.panX += (target - state.panX) * 0.08;
  }
  if (Math.abs(state.panY) > max.y) {
    const target = softClampAxis(state.panY, max.y);
    state.panY += (target - state.panY) * 0.08;
  }
}

function composeTargets() {
  const scale = pxPerDeg(state.sensitivity);
  const invertMul = state.invertX ? -1 : 1;
  const motionX = state.motion.panXdeg * scale * invertMul;
  const motionY = state.verticalPan ? state.motion.panYdeg * scale : 0;
  const roll = state.rollStabilize ? state.motion.rollDeg : 0;

  const max = maxPanFor(state.zoom);
  const targetX = softClampAxis(state.panX + motionX, max.x);
  const targetY = softClampAxis(state.panY + motionY, max.y);

  return { targetX, targetY, targetRoll: roll, targetZoom: state.zoom };
}

let rafId = null;
function renderLoop() {
  decayOvershoot();
  const { targetX, targetY, targetRoll, targetZoom } = composeTargets();

  rendered.x += (targetX - rendered.x) * LERP_K;
  rendered.y += (targetY - rendered.y) * LERP_K;
  rendered.roll += (targetRoll - rendered.roll) * LERP_K;
  rendered.zoom += (targetZoom - rendered.zoom) * LERP_K;

  el.ytWrapper.style.setProperty('--tx', `${rendered.x}px`);
  el.ytWrapper.style.setProperty('--ty', `${rendered.y}px`);
  el.ytWrapper.style.setProperty('--roll', `${rendered.roll}deg`);
  el.ytWrapper.style.setProperty('--zoom', String(rendered.zoom));

  rafId = requestAnimationFrame(renderLoop);
}

function startRenderLoop() {
  if (rafId === null) rafId = requestAnimationFrame(renderLoop);
}
function stopRenderLoop() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

/* ===================== Chrome auto-hide ===================== */

let chromeHideTimer = null;
function showChrome() {
  el.player.classList.remove('chrome-hidden');
  clearTimeout(chromeHideTimer);
  chromeHideTimer = setTimeout(() => {
    if (el.settingsSheet.hidden) el.player.classList.add('chrome-hidden');
  }, CHROME_AUTOHIDE_MS);
}
function toggleChrome() {
  if (el.player.classList.contains('chrome-hidden')) {
    showChrome();
  } else {
    el.player.classList.add('chrome-hidden');
    clearTimeout(chromeHideTimer);
  }
}

/* ===================== Settings sheet ===================== */

function openSettings() {
  el.settingsSheet.hidden = false;
  el.settingsScrim.hidden = false;
  showChrome();
  startMotionDebugUpdates();
}
function closeSettings() {
  el.settingsSheet.hidden = true;
  el.settingsScrim.hidden = true;
  showChrome();
  stopMotionDebugUpdates();
}
el.btnSettings.addEventListener('click', openSettings);
el.settingsClose.addEventListener('click', closeSettings);
el.settingsScrim.addEventListener('click', closeSettings);

/* Live motion diagnostics — updates while the settings sheet is open so a
 * user can report exactly what their device delivers (bug: "motion sensing
 * reported completely dead on a real phone"). */
let motionDebugTimer = null;
function updateMotionDebugRow() {
  const perm = motionPermissionState || 'not requested';
  if (!engine.eventCount) {
    el.motionDebug.textContent = `no motion events (permission: ${perm})`;
    return;
  }
  const raw = engine.lastRawEvent;
  const fmt = (n) => (typeof n === 'number' ? n.toFixed(1) : '—');
  const { panXdeg, panYdeg, rollDeg } = state.motion;
  el.motionDebug.textContent =
    `α${fmt(raw && raw.alpha)} β${fmt(raw && raw.beta)} γ${fmt(raw && raw.gamma)}` +
    `  pan(${fmt(panXdeg)}, ${fmt(panYdeg)}) roll ${fmt(rollDeg)}` +
    `  perm:${perm}`;
}
function startMotionDebugUpdates() {
  stopMotionDebugUpdates();
  updateMotionDebugRow();
  motionDebugTimer = setInterval(updateMotionDebugRow, MOTION_DEBUG_INTERVAL_MS);
}
function stopMotionDebugUpdates() {
  if (motionDebugTimer !== null) {
    clearInterval(motionDebugTimer);
    motionDebugTimer = null;
  }
}

el.settingSensitivity.value = String(state.sensitivity);
el.settingSensitivityVal.textContent = state.sensitivity.toFixed(1);
el.settingVertical.checked = state.verticalPan;
el.settingRoll.checked = state.rollStabilize;
el.settingInvert.checked = state.invertX;
el.settingCaptions.checked = state.captionsOn;

el.settingSensitivity.addEventListener('input', () => {
  state.sensitivity = parseFloat(el.settingSensitivity.value);
  el.settingSensitivityVal.textContent = state.sensitivity.toFixed(1);
  savePrefs();
});
el.settingVertical.addEventListener('change', () => {
  state.verticalPan = el.settingVertical.checked;
  savePrefs();
});
el.settingRoll.addEventListener('change', () => {
  state.rollStabilize = el.settingRoll.checked;
  savePrefs();
});
el.settingInvert.addEventListener('change', () => {
  state.invertX = el.settingInvert.checked;
  savePrefs();
});
el.settingCaptions.addEventListener('change', () => {
  state.captionsOn = el.settingCaptions.checked;
  savePrefs();
  applyCaptionsPref();
});

// YouTube force-enables captions on muted playback; there is no playerVar to
// force them OFF, so we load/unload the html5 player's captions module to
// match the user's preference (applied on ready and on toggle).
function applyCaptionsPref() {
  if (!ytPlayer || !ytReady) return;
  if (state.captionsOn) {
    safeCall(() => ytPlayer.loadModule('captions'));
  } else {
    safeCall(() => ytPlayer.unloadModule('captions'));
  }
}

/* ===================== YouTube IFrame API ===================== */

let ytApiPromise = null;
function loadYouTubeAPI() {
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve, reject) => {
    let settled = false;

    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error('YouTube API load timed out'));
    }, YT_LOAD_TIMEOUT_MS);

    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prevReady === 'function') {
        try { prevReady(); } catch { /* ignore third-party handler errors */ }
      }
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      resolve(window.YT);
    };

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      reject(new Error('YouTube API script failed to load'));
    };
    document.head.appendChild(script);
  });
  return ytApiPromise;
}

let ytPlayer = null;
let ytReady = false;
let ytIsPlaying = false;
let ytIsMuted = true;

function showPlayerError(message) {
  el.playerError.textContent = message;
  el.playerError.hidden = false;
}

// YT.Player replaces the host div with its iframe, and destroy() removes
// that iframe without restoring the div — recreate it for replays.
function ensureYtHost() {
  let host = document.getElementById('yt-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'yt-host';
    el.ytWrapper.appendChild(host);
  }
  el.ytHost = host;
  return host;
}

async function createYtPlayer(videoId) {
  try {
    const YT = await loadYouTubeAPI();
    if (!YT || !YT.Player) throw new Error('YT.Player unavailable');

    ytPlayer = new YT.Player(ensureYtHost(), {
      videoId,
      playerVars: {
        playsinline: 1,
        autoplay: 1,
        mute: 1,
        controls: 0,
        rel: 0,
        iv_load_policy: 3,
        fs: 0,
        disablekb: 1,
      },
      events: {
        onReady: () => {
          ytReady = true;
          el.unmuteChip.hidden = false;
          applyCaptionsPref();
          try { ytPlayer.playVideo(); } catch { /* ignore */ }
        },
        onStateChange: (ev) => {
          // 1 = playing, 2 = paused (YT.PlayerState)
          ytIsPlaying = ev.data === 1;
          updatePlayPauseIcon();
          // YouTube may re-arm captions when playback starts (muted-autoplay
          // auto-captions); re-assert the preference. Idempotent.
          if (ev.data === 1) applyCaptionsPref();
        },
        onError: () => {
          showPlayerError('This video could not be played.');
        },
      },
    });
  } catch (err) {
    showPlayerError('Could not reach YouTube — check your connection.');
  }
}

function updatePlayPauseIcon() {
  el.iconPlay.hidden = ytIsPlaying;
  el.iconPause.hidden = !ytIsPlaying;
}
function updateMuteIcon() {
  el.iconVolOn.hidden = ytIsMuted;
  el.iconVolOff.hidden = !ytIsMuted;
  el.btnMute.setAttribute('aria-pressed', String(ytIsMuted));
  el.unmuteChip.hidden = !ytIsMuted || !ytReady;
}
updateMuteIcon();

function safeCall(fn) {
  try { return fn(); } catch { return undefined; }
}

el.btnPlayPause.addEventListener('click', () => {
  if (!ytPlayer) return;
  if (ytIsPlaying) {
    safeCall(() => ytPlayer.pauseVideo());
  } else {
    safeCall(() => ytPlayer.playVideo());
  }
  showChrome();
});

function unmute() {
  if (!ytPlayer) return;
  safeCall(() => ytPlayer.unMute());
  safeCall(() => ytPlayer.setVolume(100));
  ytIsMuted = false;
  updateMuteIcon();
}
function mute() {
  if (!ytPlayer) return;
  safeCall(() => ytPlayer.mute());
  ytIsMuted = true;
  updateMuteIcon();
}

// Explicit user intent: pressing mute/unmute (button or chip) persists
// soundOn so future sessions auto-unmute (or don't) without being asked.
function userUnmute() {
  unmute();
  state.soundOn = true;
  savePrefs();
}
function userMute() {
  mute();
  state.soundOn = false;
  savePrefs();
}

el.btnMute.addEventListener('click', () => {
  if (ytIsMuted) userUnmute(); else userMute();
  showChrome();
});
el.unmuteChip.addEventListener('click', () => {
  userUnmute();
  showChrome();
});

// Autoplay policy requires muted playback, but we remember the user's sound
// intent (state.soundOn, persisted) and auto-unmute on their first genuine
// gesture on the gesture overlay (a real user gesture, so it's allowed to
// unmute) — no need to make them tap the mute button every session.
let firstGestureUnmuteArmed = true;
let firstGestureMotionArmed = true;
el.gestureOverlay.addEventListener('pointerdown', () => {
  if (firstGestureUnmuteArmed) {
    firstGestureUnmuteArmed = false;
    if (state.soundOn && ytReady && ytIsMuted) {
      unmute();
      toast('Sound on');
    }
  }
  // Motion defaults ON: on iOS the permission prompt must ride a genuine user
  // gesture, so the first tap on the player doubles as the auto-enable moment.
  // (Non-iOS auto-enables in showPlayerScreen without waiting for a tap.)
  if (firstGestureMotionArmed) {
    firstGestureMotionArmed = false;
    if (state.motionOn && !state.motionEnabled &&
        motionPermissionState !== 'denied' && motionPermissionState !== 'unsupported') {
      enableMotion();
    }
  }
});

el.btnBack10.addEventListener('click', () => {
  if (!ytPlayer) return;
  const t = safeCall(() => ytPlayer.getCurrentTime()) || 0;
  safeCall(() => ytPlayer.seekTo(Math.max(0, t - 10), true));
  showChrome();
});
el.btnFwd10.addEventListener('click', () => {
  if (!ytPlayer) return;
  const t = safeCall(() => ytPlayer.getCurrentTime()) || 0;
  safeCall(() => ytPlayer.seekTo(t + 10, true));
  showChrome();
});

/* ===================== Screen switching ===================== */

function showLanding() {
  el.landing.hidden = false;
  el.player.hidden = true;
  stopRenderLoop();
  disableMotion();
  stopMotionDebugUpdates();
  renderRecents();
}

function showPlayerScreen(videoId) {
  el.landing.hidden = true;
  el.player.hidden = false;
  el.playerError.hidden = true;
  el.player.classList.remove('chrome-hidden');
  computeCoverSize();
  reconcileZoomToContainScale();
  startRenderLoop();
  showChrome();
  tryNativeLock();
  firstGestureUnmuteArmed = true;
  firstGestureMotionArmed = true;
  createYtPlayer(videoId);
  // Motion defaults ON. Where no permission gesture is required (Android,
  // desktop), start it right away; iOS waits for the first tap (see the
  // gesture-overlay pointerdown handler).
  if (state.motionOn && !state.motionEnabled &&
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof DeviceOrientationEvent.requestPermission !== 'function') {
    enableMotion();
  }
}

el.btnHome.addEventListener('click', () => {
  history.replaceState({}, '', location.pathname);
  if (ytPlayer) safeCall(() => ytPlayer.destroy());
  ytPlayer = null;
  ytReady = false;
  showLanding();
});

/* ===================== Landing UI ===================== */

function renderRecents() {
  const recents = loadRecents();
  el.recentsList.innerHTML = '';
  if (!recents.length) {
    el.recents.hidden = true;
    return;
  }
  el.recents.hidden = false;
  for (const r of recents) {
    const li = document.createElement('li');
    li.textContent = r.title || r.id;
    li.dataset.id = r.id;
    li.addEventListener('click', () => playVideo(r.id));
    el.recentsList.appendChild(li);
  }
}

function showLandingError(message) {
  el.landingError.textContent = message;
  el.landingError.hidden = false;
}
function clearLandingError() {
  el.landingError.hidden = true;
  el.landingError.textContent = '';
}

function playVideo(id) {
  clearLandingError();
  history.replaceState({}, '', `?v=${id}`);
  pushRecent(id);
  showPlayerScreen(id);
}

el.landingForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const raw = el.urlInput.value.trim();
  if (!raw) {
    showLandingError('Paste a YouTube URL or 11-character video ID.');
    return;
  }
  const id = extractVideoId(raw);
  if (!id) {
    showLandingError("Couldn't find a video ID in that — try a full YouTube URL.");
    return;
  }
  playVideo(id);
});

/* ===================== Service worker ===================== */

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => { /* ignore */ });
  });
}

/* ===================== Resize / orientation ===================== */

// Re-run the neutralizer so #app stays counter-rotated, and — only when the
// device-natural viewport actually changed, since viewportW()/viewportH() are
// invariant across an OS rotation — recompute cover size / re-clamp zoom.
function applyViewport() {
  neutralizeOrientation();
  if (!el.player.hidden) {
    computeCoverSize();
    reconcileZoomToContainScale();
  }
}

// An OS flip is applied SYNCHRONOUSLY (no debounce) so it lands inside the
// OS's own rotation animation and reads as one motion rather than a rotate-
// then-flip-back. But on iOS the resize event and the orientation-angle
// update arrive at different moments during a rotation; painting while they
// disagree briefly shows an un-countered (shrunken) landscape layout. So while
// the reported angle and the viewport shape disagree on a portrait-natural
// device, hold off — poll until they agree, then apply in one shot. Plain
// same-orientation resizes (chrome show/hide, on-screen keyboard) keep a
// debounce, since some browsers report transient dims mid-change.
let viewportChangeTimer = null;
let agreeRetries = 0;
function handleViewportChange(orientationEvent) {
  clearTimeout(viewportChangeTimer);
  const angle = orientationAngle();
  const angleLandscape = angle === 90 || angle === 270;
  const viewportLandscape = window.innerWidth > window.innerHeight;
  if (naturalPortrait() && angleLandscape !== viewportLandscape) {
    if (agreeRetries < 12) {
      agreeRetries++;
      viewportChangeTimer = setTimeout(() => handleViewportChange(true), 50);
      return;
    }
    if (viewportLandscape) {
      // No angle source ever spoke (stuck standalone API): deduce the
      // quarter-turn from gravity — at angle 90 screen-down is -gamma, so a
      // negative device-x (gamma) tilt means the device turned to 90.
      const g = engine && engine.lastRawEvent ? engine.lastRawEvent.gamma : 0;
      inferredAngle = (g != null && g < 0) ? 90 : 270;
    }
  }
  agreeRetries = 0;
  if (angle !== uiAngle || orientationEvent) {
    applyViewport();                              // flip: apply immediately
  } else {
    viewportChangeTimer = setTimeout(applyViewport, 150); // resize: debounce
  }
}
window.addEventListener('resize', () => handleViewportChange(false));
window.addEventListener('orientationchange', () => handleViewportChange(true));
if (screen.orientation && screen.orientation.addEventListener) {
  screen.orientation.addEventListener('change', () => handleViewportChange(true));
}
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => handleViewportChange(false));
}
neutralizeOrientation();

/* ===================== Test/debug hook ===================== */

// Read-only snapshot of internal view-state for Playwright tests (e.g. bug:
// "cannot zoom out far enough in portrait" — asserts the dynamic contain
// scale replaced the old hardcoded ZOOM_MIN). Not used by the app itself.
window.__motionPlayerDebug = () => ({
  containScale,
  coverSize: { ...coverSize },
  zoom: state.zoom,
  fitMode: state.fitMode,
  uiAngle,
  inferredAngle,
});

/* ===================== Boot ===================== */

function boot() {
  const id = parseQueryVideoId();
  if (id) {
    pushRecent(id);
    showPlayerScreen(id);
  } else {
    showLanding();
  }
}

boot();
