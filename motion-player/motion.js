// motion.js — pure math + MotionEngine for the Motion Player PWA.
//
// Coordinate conventions (see SPEC.md, normative):
//   Device frame: x = right edge of screen, y = top of screen, z = out of
//                 the screen toward the user (W3C deviceorientation).
//   World frame:  x = East, y = North, z = Up.
//   deviceorientation gives intrinsic Tait-Bryan angles Z-X'-Y'':
//     R = Rz(alpha) * Rx(beta) * Ry(gamma)   maps device coords -> world
//     coords (v_world = R * v_device). Angles arrive in degrees.
//   Matrices are number[9], row-major: m[i*3+j] is row i, col j.
//
// This module is a plain ES module with no dependencies. It must be
// importable under Node with no `window`/`document` access at module top
// level — all DOM/event usage lives inside MotionEngine's instance methods,
// guarded by `typeof window !== 'undefined'` checks.

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

// --- Elementary rotation matrices (row-major number[9]) --------------------
// These are internal helpers; only rotZ is part of the public API (tests use
// it to build the "twirl about device z" matrix in the twirl-invariance
// test vector).

/** Rotation about Z axis, degrees -> row-major number[9]. */
export function rotZ(deg) {
  const r = deg * DEG2RAD;
  const c = Math.cos(r), s = Math.sin(r);
  return [c, -s, 0, s, c, 0, 0, 0, 1];
}

function rotX(deg) {
  const r = deg * DEG2RAD;
  const c = Math.cos(r), s = Math.sin(r);
  return [1, 0, 0, 0, c, -s, 0, s, c];
}

function rotY(deg) {
  const r = deg * DEG2RAD;
  const c = Math.cos(r), s = Math.sin(r);
  return [c, 0, s, 0, 1, 0, -s, 0, c];
}

/** Row-major 3x3 matrix product a * b. */
export function matMul(a, b) {
  const r = new Array(9);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let s = 0;
      for (let k = 0; k < 3; k++) s += a[i * 3 + k] * b[k * 3 + j];
      r[i * 3 + j] = s;
    }
  }
  return r;
}

/**
 * Build the device->world rotation matrix from intrinsic Tait-Bryan angles
 * (alpha, beta, gamma), in degrees, per the W3C deviceorientation convention:
 * R = Rz(alpha) . Rx(beta) . Ry(gamma).
 */
export function eulerToMatrix(alphaDeg, betaDeg, gammaDeg) {
  return matMul(matMul(rotZ(alphaDeg), rotX(betaDeg)), rotY(gammaDeg));
}

/**
 * View axis v = R . (0, 0, -1) (where the back of the phone points, world
 * frame), then:
 *   yaw   psi   = atan2(-v.x, v.y)               degrees
 *   pitch theta = asin(clamp(v.z, -1, 1))        degrees
 */
export function viewYawPitchDeg(m) {
  // v = R * (0,0,-1) = -(third column of m)
  const vx = -m[2];
  const vy = -m[5];
  const vz = -m[8];
  const yaw = Math.atan2(-vx, vy) * RAD2DEG;
  const pitch = Math.asin(clamp(vz, -1, 1)) * RAD2DEG;
  return { yaw, pitch };
}

/**
 * Screen roll phi: up_dev = R^T . (0, 0, 1) (world Up expressed in device
 * coords) = third row of m, then phi = atan2(up_dev.x, up_dev.y) degrees.
 * Upright portrait -> phi = 0.
 */
export function screenRollDeg(m) {
  const upX = m[6];
  const upY = m[7];
  return Math.atan2(upX, upY) * RAD2DEG;
}

/**
 * Unwrap `nextDeg` relative to `prevDeg` so the result is within 180 degrees
 * of prevDeg, adjusting by a multiple of 360. This keeps an angle stream
 * continuous across the +-180 seam (e.g. a full 360 degree twirl reads as a
 * smooth monotonic ramp rather than repeated jumps).
 */
export function unwrapDeg(prevDeg, nextDeg) {
  let d = nextDeg - prevDeg;
  d = ((d + 180) % 360 + 360) % 360 - 180; // wrap d into (-180, 180]
  return prevDeg + d;
}

/** Exponential smoothing step: smoothed += k * (target - smoothed). */
export function expSmooth(current, target, k) {
  return current + k * (target - current);
}

// --- MotionEngine ------------------------------------------------------

const GIMBAL_ROLL_W = 0.25;   // hold last phi when hypot(up.x, up.y) < this
const GIMBAL_YAW_VZ = 0.97;   // hold last psi when |v.z| > this
const ORIENTATION_SETTLE_MS = 300;
// Some Android/Chrome stacks never fire 'deviceorientation' and only ever
// deliver 'deviceorientationabsolute'. If no regular event has arrived
// within this window after start(), also listen for the absolute variant.
const ABSOLUTE_FALLBACK_WATCHDOG_MS = 1500;
// Once regular events are flowing again, ignore absolute events that land
// within this many ms of the last regular one (avoid double-processing the
// same physical sample from both event types).
const ABSOLUTE_DEDUPE_WINDOW_MS = 500;

export class MotionEngine {
  /**
   * @param {object} opts
   * @param {(sample: {panXdeg:number, panYdeg:number, rollDeg:number}) => void} [opts.onUpdate]
   * @param {number} [opts.smoothing=0.25]
   * @param {boolean} [opts.compensateScreenAngle=true] - Subtract
   *   screen.orientation.angle from the raw screen-roll reading, and
   *   re-baseline on 'orientationchange' (after a settle delay) so the
   *   picture doesn't jump when the OS rotates the viewport. Set false when
   *   the caller neutralizes OS rotation itself (see SPEC.md "Screen-
   *   orientation compensation" / the motion-player #app counter-rotation):
   *   in that case the engine should treat the screen angle as always 0 and
   *   ride straight through orientationchange with no re-baseline, since the
   *   UI never actually leaves device-natural portrait.
   */
  constructor(opts = {}) {
    this.onUpdate = typeof opts.onUpdate === 'function' ? opts.onUpdate : null;
    this.smoothing = typeof opts.smoothing === 'number' ? opts.smoothing : 0.25;
    this.compensateScreenAngle = opts.compensateScreenAngle !== false;

    this._active = false;

    // Continuous (unwrapped, gimbal-held) tracked raw values across events.
    this._lastPsiRaw = null;
    this._lastPhiRaw = null;
    this._lastTheta = null;

    // Baselines captured at start / recenter / post-orientationchange.
    this._psi0 = null;
    this._theta0 = null;
    this._phi0 = null;
    this._needsBaseline = true;

    // Exponentially smoothed output values.
    this._sPanX = 0;
    this._sPanY = 0;
    this._sRoll = 0;

    this._orientationTimer = null;
    this._watchdogTimer = null;
    this._absoluteAttached = false;
    // Timestamp (ms) of the last genuine 'deviceorientation' event, used to
    // dedupe against 'deviceorientationabsolute' — 0 means "none yet".
    this._lastRegularEventAt = 0;

    // Diagnosability (see SPEC.md / AGENTS bug report): the most recent raw
    // event received (regular or absolute), and a running count of all raw
    // events, so callers can tell "engine started but nothing ever arrived"
    // apart from "engine working fine".
    this.lastRawEvent = null;
    this.eventCount = 0;

    // Bind handlers once so add/removeEventListener refer to the same fn.
    this._onDeviceOrientation = this._onDeviceOrientation.bind(this);
    this._onDeviceOrientationAbsolute = this._onDeviceOrientationAbsolute.bind(this);
    this._onOrientationChange = this._onOrientationChange.bind(this);
  }

  /**
   * Request permission to read device orientation. Never throws.
   * @returns {Promise<'granted'|'denied'|'unsupported'>}
   */
  static async requestPermission() {
    if (typeof DeviceOrientationEvent === 'undefined') return 'unsupported';
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const result = await DeviceOrientationEvent.requestPermission();
        return result === 'granted' ? 'granted' : 'denied';
      } catch (_err) {
        return 'denied';
      }
    }
    return 'granted';
  }

  get active() {
    return this._active;
  }

  start() {
    if (this._active) return;
    this._active = true;
    this._needsBaseline = true;
    this._lastRegularEventAt = 0;
    this._absoluteAttached = false;
    this.eventCount = 0;
    this.lastRawEvent = null;

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('deviceorientation', this._onDeviceOrientation);
      window.addEventListener('orientationchange', this._onOrientationChange);

      if (typeof setTimeout === 'function') {
        this._watchdogTimer = setTimeout(() => {
          this._watchdogTimer = null;
          // No regular 'deviceorientation' event arrived in time — some
          // Android/Chrome stacks only ever deliver the "absolute" variant.
          // Attach it too (keep both attached); the handler dedupes.
          if (this._active && this._lastRegularEventAt === 0 &&
              typeof window.addEventListener === 'function') {
            window.addEventListener('deviceorientationabsolute', this._onDeviceOrientationAbsolute);
            this._absoluteAttached = true;
          }
        }, ABSOLUTE_FALLBACK_WATCHDOG_MS);
      }
    }
  }

  stop() {
    if (!this._active) return;
    this._active = false;
    if (this._orientationTimer !== null) {
      clearTimeout(this._orientationTimer);
      this._orientationTimer = null;
    }
    if (this._watchdogTimer !== null) {
      clearTimeout(this._watchdogTimer);
      this._watchdogTimer = null;
    }
    if (typeof window !== 'undefined' && typeof window.removeEventListener === 'function') {
      window.removeEventListener('deviceorientation', this._onDeviceOrientation);
      window.removeEventListener('orientationchange', this._onOrientationChange);
      if (this._absoluteAttached) {
        window.removeEventListener('deviceorientationabsolute', this._onDeviceOrientationAbsolute);
        this._absoluteAttached = false;
      }
    }
  }

  /** Re-baseline psi0/theta0/phi0 on the next incoming event. */
  recenter() {
    this._needsBaseline = true;
    // Snap output to zero immediately; the next event will set the new
    // baseline so the following delta is ~0, keeping the picture from
    // jumping while we wait for that event to arrive.
    this._sPanX = 0;
    this._sPanY = 0;
    this._sRoll = 0;
  }

  _currentOrientationAngle() {
    if (!this.compensateScreenAngle) return 0;
    if (typeof screen !== 'undefined' && screen.orientation &&
        typeof screen.orientation.angle === 'number') {
      return screen.orientation.angle;
    }
    if (typeof window !== 'undefined' && typeof window.orientation === 'number') {
      return window.orientation;
    }
    return 0;
  }

  _onOrientationChange() {
    // When the caller neutralizes OS rotation itself (compensateScreenAngle:
    // false), the screen angle is always treated as 0 and the UI never
    // actually leaves device-natural portrait, so there is nothing to
    // re-baseline — roll stabilization rides straight through the flip.
    if (!this.compensateScreenAngle) return;
    if (this._orientationTimer !== null) clearTimeout(this._orientationTimer);
    const fire = () => {
      this._orientationTimer = null;
      this._needsBaseline = true;
      this._sPanX = 0;
      this._sPanY = 0;
      this._sRoll = 0;
    };
    if (typeof setTimeout === 'function') {
      this._orientationTimer = setTimeout(fire, ORIENTATION_SETTLE_MS);
    } else {
      fire();
    }
  }

  /** Handler for the regular 'deviceorientation' event. */
  _onDeviceOrientation(event) {
    this._lastRegularEventAt = Date.now();
    this._processOrientationEvent(event);
  }

  /**
   * Handler for the 'deviceorientationabsolute' fallback event (only
   * attached after the start() watchdog sees no regular event in time).
   * Skip processing if regular events are already flowing again — some
   * stacks fire both, and we don't want to double-process the same sample.
   */
  _onDeviceOrientationAbsolute(event) {
    const now = typeof Date !== 'undefined' ? Date.now() : 0;
    if (now - this._lastRegularEventAt < ABSOLUTE_DEDUPE_WINDOW_MS) return;
    this._processOrientationEvent(event);
  }

  _processOrientationEvent(event) {
    const { alpha, beta, gamma } = event;

    this.eventCount++;
    this.lastRawEvent = {
      alpha,
      beta,
      gamma,
      absolute: !!event.absolute,
      timestamp: typeof Date !== 'undefined' ? Date.now() : 0,
    };

    if (alpha == null || beta == null || gamma == null) return;

    const m = eulerToMatrix(alpha, beta, gamma);
    const { yaw: psiRaw, pitch: thetaRaw } = viewYawPitchDeg(m);
    const orientAngle = this._currentOrientationAngle();
    const phiRaw = screenRollDeg(m) - orientAngle;

    // Gimbal-degeneracy tests, computed from the same matrix.
    const vz = -m[8];
    const upX = m[6];
    const upY = m[7];
    const w = Math.hypot(upX, upY);

    // Yaw: hold last psi when the view axis is near-vertical.
    let psi;
    if (this._lastPsiRaw == null) {
      psi = psiRaw;
    } else if (Math.abs(vz) > GIMBAL_YAW_VZ) {
      psi = this._lastPsiRaw;
    } else {
      psi = unwrapDeg(this._lastPsiRaw, psiRaw);
    }
    this._lastPsiRaw = psi;

    // Roll: hold last phi when world Up is near-parallel to the screen normal.
    let phi;
    if (this._lastPhiRaw == null) {
      phi = phiRaw;
    } else if (w < GIMBAL_ROLL_W) {
      phi = this._lastPhiRaw;
    } else {
      phi = unwrapDeg(this._lastPhiRaw, phiRaw);
    }
    this._lastPhiRaw = phi;

    // Pitch: asin() output is bounded to [-90, 90], no wraparound to unwrap.
    const theta = thetaRaw;
    this._lastTheta = theta;

    if (this._needsBaseline) {
      this._psi0 = psi;
      this._theta0 = theta;
      this._phi0 = phi;
      this._needsBaseline = false;
    }

    const panXTarget = psi - this._psi0;
    const panYTarget = theta - this._theta0;
    const rollTarget = phi - this._phi0;

    this._sPanX = expSmooth(this._sPanX, panXTarget, this.smoothing);
    this._sPanY = expSmooth(this._sPanY, panYTarget, this.smoothing);
    this._sRoll = expSmooth(this._sRoll, rollTarget, this.smoothing);

    if (this.onUpdate) {
      this.onUpdate({
        panXdeg: this._sPanX,
        panYdeg: this._sPanY,
        rollDeg: this._sRoll,
      });
    }
  }
}
