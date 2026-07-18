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
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 5;
const YT_LOAD_TIMEOUT_MS = 6000;
const CHROME_AUTOHIDE_MS = 3000;
const TOAST_MS = 1600;

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

  toast: document.getElementById('toast'),
};

/* ===================== Persistence ===================== */

function loadPrefs() {
  const defaults = { sensitivity: 1, verticalPan: true, rollStabilize: true, invertX: false };
  try {
    const raw = localStorage.getItem(LS_PREFS);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
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
};

const rendered = { x: 0, y: 0, roll: 0, zoom: 1 };
let coverSize = { W: 0, H: 0 };

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

/* ===================== Cover sizing ===================== */

function computeCoverSize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const W = Math.max(w, h * ASPECT);
  const H = W / ASPECT;
  coverSize = { W, H };
  el.ytWrapper.style.width = `${W}px`;
  el.ytWrapper.style.height = `${H}px`;
}

/* ===================== Pan clamp ===================== */

function pxPerDeg(sensitivity) {
  const w = window.innerWidth;
  const h = window.innerHeight;
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
  const vw = window.innerWidth;
  const vh = window.innerHeight;
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
    const roll = state.rollStabilize ? rendered.roll : 0;
    const rotated = rotatePoint(dxPx, dyPx, -roll);
    state.panX += rotated.x;
    state.panY += rotated.y;
    showChrome();
  },
  onPinch(factor, cxPx, cyPx) {
    const rect = el.stage.getBoundingClientRect();
    const mx = cxPx - rect.width / 2;
    const my = cyPx - rect.height / 2;
    const roll = state.rollStabilize ? rendered.roll : 0;
    const v = rotatePoint(mx, my, -roll);

    const oldZoom = state.zoom;
    const newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, oldZoom * factor));
    if (newZoom !== oldZoom) {
      const invFactor = 1 / newZoom - 1 / oldZoom;
      state.panX += v.x * invFactor;
      state.panY += v.y * invFactor;
      state.zoom = newZoom;
    }
    showChrome();
  },
  onTap() {
    toggleChrome();
  },
  onDoubleTap() {
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
    if (engine) engine.recenter();
    toast('Recentered');
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
});

let motionPermissionState = null; // null | 'granted' | 'denied' | 'unsupported'

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
}

function disableMotion() {
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
  if (state.motionEnabled) {
    disableMotion();
    toast('Motion off');
  } else {
    enableMotion();
  }
  showChrome();
});

el.btnRecenter.addEventListener('click', () => {
  if (engine) engine.recenter();
  toast('Recentered');
  showChrome();
});

/* orientation-change re-baseline (spec: settle ~300ms then recenter) */
let orientationSettleTimer = null;
function handleOrientationChange() {
  clearTimeout(orientationSettleTimer);
  orientationSettleTimer = setTimeout(() => {
    computeCoverSize();
    if (engine && engine.active) engine.recenter();
  }, 300);
}
window.addEventListener('orientationchange', handleOrientationChange);
if (screen.orientation && screen.orientation.addEventListener) {
  screen.orientation.addEventListener('change', handleOrientationChange);
}

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
}
function closeSettings() {
  el.settingsSheet.hidden = true;
  el.settingsScrim.hidden = true;
  showChrome();
}
el.btnSettings.addEventListener('click', openSettings);
el.settingsClose.addEventListener('click', closeSettings);
el.settingsScrim.addEventListener('click', closeSettings);

el.settingSensitivity.value = String(state.sensitivity);
el.settingSensitivityVal.textContent = state.sensitivity.toFixed(1);
el.settingVertical.checked = state.verticalPan;
el.settingRoll.checked = state.rollStabilize;
el.settingInvert.checked = state.invertX;

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
          try { ytPlayer.playVideo(); } catch { /* ignore */ }
        },
        onStateChange: (ev) => {
          // 1 = playing, 2 = paused (YT.PlayerState)
          ytIsPlaying = ev.data === 1;
          updatePlayPauseIcon();
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

el.btnMute.addEventListener('click', () => {
  if (ytIsMuted) unmute(); else mute();
  showChrome();
});
el.unmuteChip.addEventListener('click', () => {
  unmute();
  showChrome();
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
  renderRecents();
}

function showPlayerScreen(videoId) {
  el.landing.hidden = true;
  el.player.hidden = false;
  el.playerError.hidden = true;
  el.player.classList.remove('chrome-hidden');
  computeCoverSize();
  startRenderLoop();
  showChrome();
  createYtPlayer(videoId);
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

/* ===================== Resize ===================== */

window.addEventListener('resize', () => {
  if (!el.player.hidden) computeCoverSize();
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
