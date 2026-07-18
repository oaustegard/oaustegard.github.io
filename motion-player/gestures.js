// gestures.js — Pointer Events gesture recognizer for the Motion Player PWA.
//
// Plain ES module, no dependencies, no DOM access at module top level (all
// DOM/event usage lives inside GestureController's instance methods so the
// module can be imported under Node without throwing).
//
// Relies on the caller having set `touch-action: none` (via CSS) on the
// target element so the browser never intercepts touches for scrolling.

const TAP_MAX_MS = 300;
const TAP_MAX_TRAVEL_PX = 12;
const DOUBLE_TAP_MAX_MS = 350;
const DOUBLE_TAP_MAX_TRAVEL_PX = 40;
const TAP_SUPPRESS_MS = 360; // must exceed DOUBLE_TAP_MAX_MS

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function now() {
  return Date.now();
}

export class GestureController {
  /**
   * @param {EventTarget & { getBoundingClientRect?: () => DOMRect }} el
   * @param {object} cb
   * @param {(dxPx:number, dyPx:number) => void} [cb.onPan]
   * @param {(factor:number, cxPx:number, cyPx:number) => void} [cb.onPinch]
   * @param {() => void} [cb.onTap]
   * @param {() => void} [cb.onDoubleTap]
   */
  constructor(el, cb = {}) {
    this.el = el;
    this.cb = cb;

    /** @type {Map<number, {x:number, y:number}>} */
    this.pointers = new Map();

    this._downTime = 0;
    this._downX = 0;
    this._downY = 0;
    this._moved = false; // travel beyond tap threshold invalidates a tap

    this._pinchStartDist = null;
    this._lastMidpoint = null;

    this._tapTimer = null;
    this._lastTapTime = 0;
    this._lastTapX = 0;
    this._lastTapY = 0;

    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);

    if (el && typeof el.addEventListener === 'function') {
      el.addEventListener('pointerdown', this._onPointerDown);
      el.addEventListener('pointermove', this._onPointerMove);
      el.addEventListener('pointerup', this._onPointerUp);
      el.addEventListener('pointercancel', this._onPointerUp);
    }
  }

  destroy() {
    if (this.el && typeof this.el.removeEventListener === 'function') {
      this.el.removeEventListener('pointerdown', this._onPointerDown);
      this.el.removeEventListener('pointermove', this._onPointerMove);
      this.el.removeEventListener('pointerup', this._onPointerUp);
      this.el.removeEventListener('pointercancel', this._onPointerUp);
    }
    if (this._tapTimer !== null) {
      clearTimeout(this._tapTimer);
      this._tapTimer = null;
    }
    this.pointers.clear();
    this._pinchStartDist = null;
    this._lastMidpoint = null;
  }

  /** Convert a pointer event's client coords into el-local coordinates. */
  _localXY(e) {
    if (this.el && typeof this.el.getBoundingClientRect === 'function') {
      const r = this.el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }
    return { x: e.clientX, y: e.clientY };
  }

  _onPointerDown(e) {
    if (this.el && typeof this.el.setPointerCapture === 'function') {
      try {
        this.el.setPointerCapture(e.pointerId);
      } catch (_err) {
        // ignore — capture is best-effort
      }
    }

    const p = this._localXY(e);
    this.pointers.set(e.pointerId, p);

    if (this.pointers.size === 1) {
      this._downTime = now();
      this._downX = p.x;
      this._downY = p.y;
      this._moved = false;
    } else if (this.pointers.size === 2) {
      // A second finger landed: this can no longer resolve to a tap.
      this._moved = true;
      const pts = [...this.pointers.values()];
      this._pinchStartDist = dist(pts[0], pts[1]);
      this._lastMidpoint = midpoint(pts[0], pts[1]);
    }
  }

  _onPointerMove(e) {
    if (!this.pointers.has(e.pointerId)) return;
    const p = this._localXY(e);
    const prev = this.pointers.get(e.pointerId);
    this.pointers.set(e.pointerId, p);

    if (this.pointers.size === 1) {
      const dx = p.x - prev.x;
      const dy = p.y - prev.y;
      const travel = Math.hypot(p.x - this._downX, p.y - this._downY);
      if (travel > TAP_MAX_TRAVEL_PX) this._moved = true;
      if (dx !== 0 || dy !== 0) {
        if (this.cb.onPan) this.cb.onPan(dx, dy);
      }
    } else if (this.pointers.size === 2) {
      const pts = [...this.pointers.values()];
      const d = dist(pts[0], pts[1]);
      const mid = midpoint(pts[0], pts[1]);

      if (this._pinchStartDist) {
        const factor = d / this._pinchStartDist;
        if (this.cb.onPinch) this.cb.onPinch(factor, mid.x, mid.y);
        this._pinchStartDist = d;
      }

      if (this._lastMidpoint) {
        const dx = mid.x - this._lastMidpoint.x;
        const dy = mid.y - this._lastMidpoint.y;
        if ((dx !== 0 || dy !== 0) && this.cb.onPan) this.cb.onPan(dx, dy);
      }
      this._lastMidpoint = mid;
    }
  }

  _onPointerUp(e) {
    const wasSingle = this.pointers.size === 1;
    const p = this.pointers.has(e.pointerId) ? this.pointers.get(e.pointerId) : this._localXY(e);
    this.pointers.delete(e.pointerId);

    if (this.pointers.size < 2) {
      this._pinchStartDist = null;
    }
    if (this.pointers.size === 2) {
      const pts = [...this.pointers.values()];
      this._lastMidpoint = midpoint(pts[0], pts[1]);
    } else if (this.pointers.size < 1) {
      this._lastMidpoint = null;
    }

    if (wasSingle) {
      const dt = now() - this._downTime;
      const travel = Math.hypot(p.x - this._downX, p.y - this._downY);
      if (dt < TAP_MAX_MS && travel < TAP_MAX_TRAVEL_PX && !this._moved) {
        this._handleTap(p);
      }
    }
  }

  _handleTap(p) {
    const t = now();
    const dt = t - this._lastTapTime;
    const travel = Math.hypot(p.x - this._lastTapX, p.y - this._lastTapY);

    if (this._lastTapTime && dt < DOUBLE_TAP_MAX_MS && travel < DOUBLE_TAP_MAX_TRAVEL_PX) {
      // Double tap: suppress the pending single-tap callback and fire double.
      if (this._tapTimer !== null) {
        clearTimeout(this._tapTimer);
        this._tapTimer = null;
      }
      this._lastTapTime = 0;
      if (this.cb.onDoubleTap) this.cb.onDoubleTap();
      return;
    }

    this._lastTapTime = t;
    this._lastTapX = p.x;
    this._lastTapY = p.y;

    if (this._tapTimer !== null) clearTimeout(this._tapTimer);
    this._tapTimer = setTimeout(() => {
      this._tapTimer = null;
      if (this.cb.onTap) this.cb.onTap();
    }, TAP_SUPPRESS_MS);
  }
}
