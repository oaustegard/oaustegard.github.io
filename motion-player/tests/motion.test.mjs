import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  eulerToMatrix,
  viewYawPitchDeg,
  screenRollDeg,
  unwrapDeg,
  rotZ,
  matMul,
  expSmooth,
  MotionEngine,
} from '../motion.js';

const EPS = 1e-6;

function closeTo(actual, expected, eps = 1e-4, msg = '') {
  assert.ok(
    Math.abs(actual - expected) < eps,
    `${msg} expected ${actual} to be within ${eps} of ${expected}`
  );
}

// ---------------------------------------------------------------------------
// Verified test vectors (SPEC.md "Verified test vectors")
// ---------------------------------------------------------------------------

describe('verified test vectors', () => {
  test('vector 1: upright portrait facing North -> psi=0, theta=0, phi=0', () => {
    const m = eulerToMatrix(0, 90, 0);
    const { yaw, pitch } = viewYawPitchDeg(m);
    closeTo(yaw, 0, 1e-4, 'psi');
    closeTo(pitch, 0, 1e-4, 'theta');
    closeTo(screenRollDeg(m), 0, 1e-4, 'phi');
  });

  test('vector 2: turned left (West) -> psi=+90, theta=0', () => {
    const m = eulerToMatrix(90, 90, 0);
    const { yaw, pitch } = viewYawPitchDeg(m);
    closeTo(yaw, 90, 1e-4, 'psi');
    closeTo(pitch, 0, 1e-4, 'theta');
  });

  test('vector 3: pitch — 45deg tilt and flat-on-table', () => {
    const m45 = eulerToMatrix(0, 45, 0);
    closeTo(viewYawPitchDeg(m45).pitch, -45, 1e-4, 'theta at beta=45');

    const mFlat = eulerToMatrix(0, 0, 0);
    closeTo(viewYawPitchDeg(mFlat).pitch, -90, 1e-4, 'theta flat on table');
  });

  test('vector 4: twirl invariance at discrete angles', () => {
    const R0 = eulerToMatrix(0, 90, 0);
    for (const t of [10, 45, 90, 170]) {
      const R = matMul(R0, rotZ(t));
      closeTo(screenRollDeg(R), t, 1e-4, `screenRoll at t=${t}`);
    }
  });

  test('vector 4: 360deg twirl sweep is continuous (no jump > 15deg) and tracks t', () => {
    const R0 = eulerToMatrix(0, 90, 0);
    let prevUnwrapped = null;
    let prevT = null;
    for (let t = 0; t <= 350; t += 10) {
      const R = matMul(R0, rotZ(t));
      const raw = screenRollDeg(R);
      const unwrapped = prevUnwrapped == null ? raw : unwrapDeg(prevUnwrapped, raw);

      if (prevUnwrapped != null) {
        const jump = Math.abs(unwrapped - prevUnwrapped);
        assert.ok(jump <= 15, `jump of ${jump} at t=${t} exceeds 15deg`);
        // Should be tracking the +10deg-per-step ramp closely.
        closeTo(unwrapped - prevUnwrapped, t - prevT, 1e-3, `step size at t=${t}`);
      } else {
        closeTo(unwrapped, 0, 1e-4, 'first sample at t=0');
      }

      prevUnwrapped = unwrapped;
      prevT = t;
    }
    // After sweeping 0..350, the continuous value should have tracked all the
    // way to ~350 (not wrapped back near 0).
    closeTo(prevUnwrapped, 350, 1e-3, 'final unwrapped roll at t=350');
  });

  test('vector 5: unwrapDeg', () => {
    assert.equal(unwrapDeg(170, -170), 190);
    assert.equal(unwrapDeg(-170, 170), -190);
    assert.equal(unwrapDeg(10, 20), 20);
  });
});

// ---------------------------------------------------------------------------
// unwrapDeg — thorough coverage
// ---------------------------------------------------------------------------

describe('unwrapDeg (thorough)', () => {
  test('no wrap needed when next is already close to prev', () => {
    assert.equal(unwrapDeg(0, 0), 0);
    assert.equal(unwrapDeg(5, 5), 5);
    assert.equal(unwrapDeg(-5, -5), -5);
    assert.equal(unwrapDeg(0, 10), 10);
    assert.equal(unwrapDeg(0, -10), -10);
  });

  test('wraps forward across the +180/-180 seam', () => {
    assert.equal(unwrapDeg(170, -170), 190);
    assert.equal(unwrapDeg(350, 5), 365);
  });

  test('wraps backward across the +180/-180 seam', () => {
    assert.equal(unwrapDeg(-170, 170), -190);
    assert.equal(unwrapDeg(5, 350), -10);
  });

  test('handles multi-wrap deltas by choosing the representative within 180', () => {
    // next is nominally 720 away modulo 360, should still resolve near prev.
    assert.equal(unwrapDeg(0, 360), 0);
    assert.equal(unwrapDeg(0, 720), 0);
    assert.equal(unwrapDeg(0, -360), 0);
  });

  test('result is always within 180 degrees of prev', () => {
    for (let prev = -350; prev <= 350; prev += 37) {
      for (let next = -180; next < 180; next += 23) {
        const result = unwrapDeg(prev, next);
        assert.ok(
          Math.abs(result - prev) <= 180 + EPS,
          `unwrapDeg(${prev}, ${next}) = ${result} not within 180 of prev`
        );
      }
    }
  });

  test('result is congruent to next mod 360', () => {
    for (const [prev, next] of [[170, -170], [-170, 170], [10, 20], [0, 90], [300, -60]]) {
      const result = unwrapDeg(prev, next);
      const diff = ((result - next + 540) % 360) - 180; // should be ~0
      closeTo(diff, 0, 1e-6, `unwrapDeg(${prev},${next}) not congruent to next mod 360`);
    }
  });
});

// ---------------------------------------------------------------------------
// Gimbal-guard detectability (matrix-level)
// ---------------------------------------------------------------------------

describe('gimbal guard detectability', () => {
  test('roll: w = hypot(up_dev.x, up_dev.y) < 0.25 for a near-flat pose', () => {
    const m = eulerToMatrix(0, 0, 0); // flat, screen up
    const w = Math.hypot(m[6], m[7]);
    assert.ok(w < 0.25, `expected degenerate w, got ${w}`);
  });

  test('roll: w >= 0.25 for a clearly upright pose', () => {
    const m = eulerToMatrix(0, 90, 0); // upright portrait
    const w = Math.hypot(m[6], m[7]);
    assert.ok(w >= 0.25, `expected non-degenerate w, got ${w}`);
  });

  test('yaw: |v.z| > 0.97 for a near-vertical view axis (flat pose)', () => {
    const m = eulerToMatrix(0, 0, 0);
    const { pitch } = viewYawPitchDeg(m);
    const vz = Math.sin(pitch * Math.PI / 180); // v.z = clamp(sin(theta))... theta itself is asin(vz)
    assert.ok(Math.abs(vz) > 0.97, `expected degenerate |v.z|, got ${Math.abs(vz)}`);
  });

  test('yaw: |v.z| <= 0.97 for an upright pose', () => {
    const m = eulerToMatrix(0, 90, 0);
    const { pitch } = viewYawPitchDeg(m);
    const vz = Math.sin(pitch * Math.PI / 180);
    assert.ok(Math.abs(vz) <= 0.97, `expected non-degenerate |v.z|, got ${Math.abs(vz)}`);
  });

  test('sweeping beta from vertical to flat crosses the w<0.25 threshold', () => {
    // beta=90 upright (w=1) down to beta=0 flat (w=0): threshold must be
    // crossed somewhere so the guard actually engages during real motion.
    let sawAbove = false;
    let sawBelow = false;
    for (let beta = 0; beta <= 90; beta += 5) {
      const m = eulerToMatrix(0, beta, 0);
      const w = Math.hypot(m[6], m[7]);
      if (w >= 0.25) sawAbove = true;
      if (w < 0.25) sawBelow = true;
    }
    assert.ok(sawAbove && sawBelow, 'expected the sweep to cross the gimbal threshold');
  });
});

// ---------------------------------------------------------------------------
// expSmooth helper
// ---------------------------------------------------------------------------

describe('expSmooth', () => {
  test('k=0 leaves the value unchanged', () => {
    assert.equal(expSmooth(5, 100, 0), 5);
  });

  test('k=1 jumps immediately to the target', () => {
    assert.equal(expSmooth(5, 100, 1), 100);
  });

  test('matches the formula smoothed += k*(target-smoothed)', () => {
    closeTo(expSmooth(10, 20, 0.25), 10 + 0.25 * (20 - 10));
    closeTo(expSmooth(-10, 10, 0.5), -10 + 0.5 * (10 - -10));
  });

  test('repeated application converges monotonically toward the target', () => {
    let v = 0;
    const target = 90;
    let prev = v;
    for (let i = 0; i < 50; i++) {
      v = expSmooth(v, target, 0.25);
      assert.ok(v >= prev, 'should move monotonically toward target from below');
      assert.ok(v <= target, 'should never overshoot a constant target');
      prev = v;
    }
    closeTo(v, target, 1e-3, 'should be very close to target after 50 steps');
  });

  test('is stable (no-op) once already at the target', () => {
    assert.equal(expSmooth(42, 42, 0.25), 42);
  });
});

// ---------------------------------------------------------------------------
// MotionEngine
// ---------------------------------------------------------------------------

describe('MotionEngine construction and lifecycle in Node (no DOM)', () => {
  test('is constructible without throwing and without window', () => {
    assert.equal(typeof window, 'undefined');
    const engine = new MotionEngine();
    assert.equal(engine.active, false);
  });

  test('start()/stop() do not throw without a window global', () => {
    const engine = new MotionEngine();
    assert.doesNotThrow(() => engine.start());
    assert.equal(engine.active, true);
    assert.doesNotThrow(() => engine.stop());
    assert.equal(engine.active, false);
  });

  test('recenter() does not throw before start()', () => {
    const engine = new MotionEngine();
    assert.doesNotThrow(() => engine.recenter());
  });

  test('static requestPermission() resolves "unsupported" when DeviceOrientationEvent is absent', async () => {
    assert.equal(typeof globalThis.DeviceOrientationEvent, 'undefined');
    const result = await MotionEngine.requestPermission();
    assert.equal(result, 'unsupported');
  });

  test('static requestPermission() resolves "granted" when the API exists but has no requestPermission', async () => {
    globalThis.DeviceOrientationEvent = function DeviceOrientationEvent() {};
    try {
      const result = await MotionEngine.requestPermission();
      assert.equal(result, 'granted');
    } finally {
      delete globalThis.DeviceOrientationEvent;
    }
  });

  test('static requestPermission() calls requestPermission() and forwards granted/denied', async () => {
    globalThis.DeviceOrientationEvent = function DeviceOrientationEvent() {};
    globalThis.DeviceOrientationEvent.requestPermission = async () => 'granted';
    try {
      assert.equal(await MotionEngine.requestPermission(), 'granted');
    } finally {
      delete globalThis.DeviceOrientationEvent;
    }

    globalThis.DeviceOrientationEvent = function DeviceOrientationEvent() {};
    globalThis.DeviceOrientationEvent.requestPermission = async () => 'denied';
    try {
      assert.equal(await MotionEngine.requestPermission(), 'denied');
    } finally {
      delete globalThis.DeviceOrientationEvent;
    }
  });

  test('static requestPermission() never throws — a throwing requestPermission resolves "denied"', async () => {
    globalThis.DeviceOrientationEvent = function DeviceOrientationEvent() {};
    globalThis.DeviceOrientationEvent.requestPermission = async () => {
      throw new Error('user gesture required');
    };
    try {
      const result = await MotionEngine.requestPermission();
      assert.equal(result, 'denied');
    } finally {
      delete globalThis.DeviceOrientationEvent;
    }
  });
});

describe('MotionEngine sample processing (via direct handler invocation)', () => {
  // The engine's DOM wiring is guarded for Node, but its per-event math is
  // exercised directly by calling the internal handler with a synthetic
  // deviceorientation-shaped event — this is the same code path start()
  // would wire up in a browser.

  test('baselines on first sample, then reports unwrapped deltas (smoothing=1)', () => {
    const samples = [];
    const engine = new MotionEngine({ onUpdate: (s) => samples.push(s), smoothing: 1 });

    // Baseline: upright, facing North.
    engine._onDeviceOrientation({ alpha: 0, beta: 90, gamma: 0 });
    closeTo(samples[0].panXdeg, 0, 1e-4);
    closeTo(samples[0].panYdeg, 0, 1e-4);
    closeTo(samples[0].rollDeg, 0, 1e-4);

    // Turn left 90deg -> psi=+90 -> positive panXdeg.
    engine._onDeviceOrientation({ alpha: 90, beta: 90, gamma: 0 });
    closeTo(samples[1].panXdeg, 90, 1e-3, 'panXdeg after turning left');
    closeTo(samples[1].panYdeg, 0, 1e-3);
  });

  test('recenter() rebaselines on the next sample', () => {
    const samples = [];
    const engine = new MotionEngine({ onUpdate: (s) => samples.push(s), smoothing: 1 });

    engine._onDeviceOrientation({ alpha: 0, beta: 90, gamma: 0 });
    engine._onDeviceOrientation({ alpha: 90, beta: 90, gamma: 0 });
    closeTo(samples[1].panXdeg, 90, 1e-3);

    engine.recenter();
    // Smoothed values snap to 0 immediately on recenter().
    closeTo(engine._sPanX, 0, 1e-9);

    // Same pose as before recenter -> should baseline to ~0 delta now.
    engine._onDeviceOrientation({ alpha: 90, beta: 90, gamma: 0 });
    closeTo(samples[2].panXdeg, 0, 1e-3, 'panXdeg should reset after recenter');
  });

  test('exponential smoothing lags behind the raw target for 0<k<1', () => {
    const samples = [];
    const engine = new MotionEngine({ onUpdate: (s) => samples.push(s), smoothing: 0.25 });

    engine._onDeviceOrientation({ alpha: 0, beta: 90, gamma: 0 }); // baseline
    engine._onDeviceOrientation({ alpha: 90, beta: 90, gamma: 0 }); // target jumps to 90
    // With k=0.25 the first post-baseline sample should be 0.25 * 90 = 22.5,
    // not the full 90.
    closeTo(samples[1].panXdeg, 22.5, 1e-3);
  });

  test('gimbal guards hold last psi/phi at the engine level through a degenerate sample', () => {
    const samples = [];
    const engine = new MotionEngine({ onUpdate: (s) => samples.push(s), smoothing: 1 });

    // Baseline: upright, facing North.
    engine._onDeviceOrientation({ alpha: 0, beta: 90, gamma: 0 });

    // A tilted, non-degenerate pose with a distinctly nonzero roll and yaw.
    engine._onDeviceOrientation({ alpha: 10, beta: 60, gamma: 30 });
    const stablePanX = samples[1].panXdeg;
    const stableRoll = samples[1].rollDeg;
    assert.notEqual(stableRoll, 0, 'setup pose should have nonzero roll for a meaningful hold test');

    // Now a flat pose: w<0.25 (roll degenerate) AND |v.z|>0.97 (yaw
    // degenerate) simultaneously. Both psi and phi must hold their last
    // stable values rather than jumping to the new (undefined) raw reading.
    engine._onDeviceOrientation({ alpha: 999, beta: 0, gamma: 0 });
    closeTo(samples[2].panXdeg, stablePanX, 1e-6, 'yaw should hold through gimbal lock');
    closeTo(samples[2].rollDeg, stableRoll, 1e-6, 'roll should hold through gimbal lock');

    // Sanity check: pitch (theta) is NOT gimbal-guarded and should have
    // moved, proving the engine did process the new sample rather than
    // being stuck entirely.
    assert.notEqual(samples[2].panYdeg, samples[1].panYdeg);
  });

  test('ignores events with null orientation fields (uncalibrated sensor)', () => {
    const samples = [];
    const engine = new MotionEngine({ onUpdate: (s) => samples.push(s), smoothing: 1 });
    engine._onDeviceOrientation({ alpha: null, beta: null, gamma: null });
    assert.equal(samples.length, 0);
  });
});
