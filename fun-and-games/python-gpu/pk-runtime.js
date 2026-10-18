// Runtime for the Python-on-the-GPU demos.
//
// The physics in each demo is a Python function compiled to a WGSL compute shader
// by pykernel (build.py → kernels.js). This file only hosts those shaders: it
// creates buffers from the binding manifest pykernel emits, fills the uniform
// struct by name, dispatches, and checks the GPU against the CPython result baked
// in at build time. Drawing a finished buffer to the screen (FieldView, PointsView)
// is the one hand-written WGSL here, and it does no simulation.

export async function initGPU() {
  if (!navigator.gpu) {
    throw new Error("This browser has no WebGPU. Recent Chrome, Edge and Safari have it; " +
                    "Firefox has it on Windows and macOS.");
  }
  const adapter = await navigator.gpu.requestAdapter({ powerPreference: "high-performance" });
  if (!adapter) throw new Error("WebGPU is present but no GPU adapter was offered.");
  const device = await adapter.requestDevice();
  device.lost.then((info) => {
    if (info.reason !== "destroyed") showFatal(`The GPU device was lost: ${info.message}`);
  });
  return { adapter, device, format: navigator.gpu.getPreferredCanvasFormat() };
}

export function storage(device, data, label = "") {
  const n = typeof data === "number" ? data : data.length;
  const buf = device.createBuffer({
    label, size: Math.max(16, n * 4),
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
  });
  if (typeof data !== "number") device.queue.writeBuffer(buf, 0, Float32Array.from(data));
  buf.length = n;
  return buf;
}

export async function readback(device, buf, n = buf.length) {
  const staging = device.createBuffer({ size: n * 4, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
  const enc = device.createCommandEncoder();
  enc.copyBufferToBuffer(buf, 0, staging, 0, n * 4);
  device.queue.submit([enc.finish()]);
  await staging.mapAsync(GPUMapMode.READ);
  const out = new Float32Array(staging.getMappedRange().slice(0));
  staging.unmap();
  staging.destroy();
  return out;
}

async function compile(device, code, label) {
  const module = device.createShaderModule({ label, code });
  const info = await module.getCompilationInfo();
  const errors = info.messages.filter((m) => m.type === "error");
  if (errors.length) {
    throw new Error(`${label}: WGSL did not compile:\n` +
                    errors.map((m) => `${m.lineNum}:${m.linePos} ${m.message}`).join("\n"));
  }
  return module;
}

// One pykernel kernel: pipeline, uniform struct, cached bind groups.
export class Kernel {
  static async create(device, entry, label) {
    const k = new Kernel();
    k.device = device;
    k.man = entry.manifest;
    k.label = label;
    const module = await compile(device, entry.wgsl, label);
    k.pipeline = await device.createComputePipelineAsync({
      label, layout: "auto", compute: { module, entryPoint: k.man.entry },
    });
    k.usize = Math.ceil(k.man.uniform_size / 16) * 16;
    k.ubytes = new ArrayBuffer(k.usize);
    k.uview = new DataView(k.ubytes);
    k.values = {};
    // queue.writeBuffer lands before the whole submit, so two dispatches of this kernel
    // in one encoder must not share a uniform buffer: dispatch n of an encoder uses slot n.
    k.slots = [];
    k.uses = new WeakMap();
    k.groups = new Map();
    k.maxGroups = device.limits.maxComputeWorkgroupsPerDimension;
    return k;
  }

  set(values) {
    Object.assign(this.values, values);
    return this;
  }

  // buffers: {name: GPUBuffer} for every list[float] parameter. count: invocations.
  dispatch(encoder, buffers, count) {
    for (const u of this.man.uniforms) {
      const v = u.name === "pk_count" ? count : this.values[u.name];
      if (v === undefined) throw new Error(`${this.label}: no value for uniform ${u.name}`);
      if (u.type === "i32") this.uview.setInt32(u.offset, Math.trunc(v), true);
      else this.uview.setFloat32(u.offset, v, true);
    }
    const slot = this.uses.get(encoder) ?? 0;
    this.uses.set(encoder, slot + 1);
    if (slot === this.slots.length) {
      this.slots.push(this.device.createBuffer({ label: `${this.label}.params${slot}`, size: this.usize, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }));
    }
    const ubuf = this.slots[slot];
    this.device.queue.writeBuffer(ubuf, 0, this.ubytes);
    const key = slot + ":" + this.man.buffers.map((b) => {
      const buf = buffers[b.name];
      if (!buf) throw new Error(`${this.label}: no buffer for ${b.name}`);
      return (buf.pkId ??= ++Kernel.nextId);
    }).join(",");
    let group = this.groups.get(key);
    if (!group) {
      const entries = this.man.buffers.map((b) => ({ binding: b.binding, resource: { buffer: buffers[b.name] } }));
      entries.push({ binding: this.man.uniform_binding, resource: { buffer: ubuf } });
      group = this.device.createBindGroup({ layout: this.pipeline.getBindGroupLayout(0), entries });
      this.groups.set(key, group);
    }
    const groups = Math.ceil(count / this.man.workgroup_size);
    if (groups > this.maxGroups) throw new Error(`${this.label}: ${count} invocations is more than one dispatch allows`);
    const pass = encoder.beginComputePass();
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, group);
    pass.dispatchWorkgroups(groups);
    pass.end();
  }

  // Convenience for one-off runs: its own encoder and submit.
  run(buffers, count) {
    const enc = this.device.createCommandEncoder();
    this.dispatch(enc, buffers, count);
    this.device.queue.submit([enc.finish()]);
  }
}
Kernel.nextId = 0;

export async function loadKernels(device, demo) {
  const out = {};
  for (const [name, entry] of Object.entries(demo.kernels)) out[name] = await Kernel.create(device, entry, name);
  return out;
}

// build.py stores check arrays once each, as base64 little-endian f32.
function array(demo, i) {
  const bin = atob(demo.arrays[i]);
  const bytes = new Uint8Array(bin.length);
  for (let k = 0; k < bin.length; k++) bytes[k] = bin.charCodeAt(k);
  return new Float32Array(bytes.buffer);
}

// Re-run every kernel on the fixed input build.py ran through CPython, and compare.
export async function runChecks(device, demo, kernels) {
  const results = [];
  for (const [name, entry] of Object.entries(demo.kernels)) {
    const c = entry.check;
    const bufs = {};
    for (const [b, i] of Object.entries(c.buffers)) bufs[b] = storage(device, array(demo, i), `check.${b}`);
    kernels[name].set(c.uniforms).run(bufs, c.count);
    let total = 0, good = 0, worst = 0;
    for (const [b, i] of Object.entries(c.expect)) {
      const want = array(demo, i);
      const got = await readback(device, bufs[b], want.length);
      for (let i = 0; i < want.length; i++) {
        const err = Math.abs(got[i] - want[i]) / Math.max(1, Math.abs(want[i]));
        total++;
        if (err <= c.tol) good++;
        if (Number.isFinite(err)) worst = Math.max(worst, err); else worst = Infinity;
      }
    }
    for (const b of Object.values(bufs)) b.destroy();
    results.push({ name, total, good, worst, ok: good / total >= c.min_frac, minFrac: c.min_frac, tol: c.tol });
  }
  return results;
}

// ---- drawing (hand-written WGSL; no simulation happens here) -----------------------

const FIELD_WGSL = /* wgsl */ `
struct View {
  size: vec2f,       // field width, height in cells
  canvas: vec2f,     // canvas size in pixels
  lo: f32, hi: f32,  // linear map range
  freq: f32, phase: f32,
  mode: u32,         // 0 linear, 1 cyclic
  nstops: u32,
  useInside: u32,    // 1: negative values draw as 'inside'; 0: they go through the ramp
  pad: f32,
  inside: vec4f,     // colour for negative values
  stops: array<vec4f, 8>,
}
@group(0) @binding(0) var<storage, read> field: array<f32>;
@group(0) @binding(1) var<uniform> view: View;

@vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  let p = vec2f(f32((i << 1u) & 2u), f32(i & 2u));
  return vec4f(p * 2.0 - 1.0, 0.0, 1.0);
}

@fragment fn fs(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  let cell = min(vec2u(pos.xy * view.size / view.canvas), vec2u(view.size) - 1u);
  let v = field[cell.y * u32(view.size.x) + cell.x];
  if (v < 0.0 && view.useInside == 1u) { return view.inside; }
  var t: f32;
  if (view.mode == 1u) { t = fract(v * view.freq + view.phase); }
  else { t = clamp((v - view.lo) / (view.hi - view.lo), 0.0, 1.0); }
  let x = t * f32(view.nstops - 1u);
  let i = min(u32(x), view.nstops - 2u);
  return mix(view.stops[i], view.stops[i + 1u], x - f32(i));
}`;

// Where a view draws. Normally the canvas's WebGPU context. With
// globalThis.__pkOffscreen set (the headless test harness, whose Chromium loses the
// device on any canvas present), it draws into a texture and copies the pixels into
// a 2D canvas laid over the WebGPU one, so a screenshot shows what the shaders drew.
class Surface {
  constructor(gpu, canvas) {
    this.gpu = gpu;
    this.canvas = canvas;
    this.offscreen = !!globalThis.__pkOffscreen;
    if (!this.offscreen) {
      this.ctx = canvas.getContext("webgpu");
      this.ctx.configure({ device: gpu.device, format: gpu.format, alphaMode: "opaque" });
    }
    this.lastCopy = 0;
  }

  view() {
    if (!this.offscreen) return this.ctx.getCurrentTexture().createView();
    const { width: w, height: h } = this.canvas;
    if (!this.tex || this.tex.width !== w || this.tex.height !== h) {
      this.tex?.destroy();
      this.tex = this.gpu.device.createTexture({ size: [w, h], format: this.gpu.format, usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC });
    }
    return this.tex.createView();
  }

  async present() {
    if (!this.offscreen || this.busy || performance.now() - this.lastCopy < 400) return;
    this.busy = true;
    this.lastCopy = performance.now();
    try { await this.copyOut(); } catch (e) { console.warn("offscreen copy failed:", e.message); } finally { this.busy = false; }
  }

  async copyOut() {
    const { width: w, height: h } = this.tex, row = Math.ceil(w * 4 / 256) * 256;
    const buf = this.gpu.device.createBuffer({ size: row * h, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
    const enc = this.gpu.device.createCommandEncoder();
    enc.copyTextureToBuffer({ texture: this.tex }, { buffer: buf, bytesPerRow: row }, [w, h]);
    this.gpu.device.queue.submit([enc.finish()]);
    await buf.mapAsync(GPUMapMode.READ);
    const src = new Uint8Array(buf.getMappedRange()), img = new ImageData(w, h), bgra = this.gpu.format.startsWith("bgra");
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * row + x * 4, o = (y * w + x) * 4;
      img.data[o] = src[i + (bgra ? 2 : 0)]; img.data[o + 1] = src[i + 1]; img.data[o + 2] = src[i + (bgra ? 0 : 2)]; img.data[o + 3] = 255;
    }
    buf.unmap();
    buf.destroy();
    if (!this.overlay) {
      this.overlay = document.createElement("canvas");
      this.overlay.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:1";
      this.canvas.after(this.overlay);
    }
    this.overlay.width = w;
    this.overlay.height = h;
    this.overlay.getContext("2d").putImageData(img, 0, 0);
  }
}

function hex(c) {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255, 1];
}

export class FieldView {
  // Draws a width x height f32 buffer to the canvas through a colour ramp.
  static async create(gpu, canvas) {
    const v = new FieldView();
    v.gpu = gpu;
    v.canvas = canvas;
    v.surface = new Surface(gpu, canvas);
    const module = await compile(gpu.device, FIELD_WGSL, "field-view");
    v.pipeline = await gpu.device.createRenderPipelineAsync({
      layout: "auto",
      vertex: { module, entryPoint: "vs" },
      fragment: { module, entryPoint: "fs", targets: [{ format: gpu.format }] },
    });
    v.ubuf = gpu.device.createBuffer({ size: 192, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    v.groups = new Map();
    v.style({ stops: ["#000000", "#ffffff"] });
    return v;
  }

  // Call after the frame's submit; a no-op except under the offscreen test harness.
  present() { this.surface.present(); }

  // stops: up to 8 hex colours. mode "linear" maps [lo, hi]; "cyclic" wraps v*freq+phase.
  // inside: colour for negative values, or null to send them through the ramp too.
  style({ stops, mode = "linear", lo = 0, hi = 1, freq = 1, phase = 0, inside = "#000000" }) {
    if (stops) this.stops = stops.slice(0, 8).map(hex);
    Object.assign(this, { mode, lo, hi, freq, phase, useInside: inside !== null, inside: hex(inside ?? "#000000") });
    return this;
  }

  draw(encoder, buffer, w, h) {
    const u = new ArrayBuffer(192), f = new Float32Array(u), i = new Uint32Array(u);
    f.set([w, h, this.canvas.width, this.canvas.height, this.lo, this.hi, this.freq, this.phase]);
    i[8] = this.mode === "cyclic" ? 1 : 0;
    i[9] = this.stops.length;
    i[10] = this.useInside ? 1 : 0;
    f.set(this.inside, 12);
    this.stops.forEach((s, k) => f.set(s, 16 + 4 * k));
    this.gpu.device.queue.writeBuffer(this.ubuf, 0, u);
    let group = this.groups.get(buffer);
    if (!group) {
      group = this.gpu.device.createBindGroup({
        layout: this.pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer } }, { binding: 1, resource: { buffer: this.ubuf } }],
      });
      this.groups.set(buffer, group);
    }
    const pass = encoder.beginRenderPass({
      colorAttachments: [{ view: this.surface.view(), loadOp: "clear", storeOp: "store", clearValue: [0, 0, 0, 1] }],
    });
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, group);
    pass.draw(3);
    pass.end();
  }
}

const POINTS_WGSL = /* wgsl */ `
struct View {
  center: vec2f, scale: f32, size: f32,   // world centre, world units per half-height, sprite px
  canvas: vec2f, gain: f32, slow: f32,    // canvas px, brightness, speed for the cool colour
  cool: vec4f, hot: vec4f,
}
@group(0) @binding(0) var<storage, read> x: array<f32>;
@group(0) @binding(1) var<storage, read> y: array<f32>;
@group(0) @binding(2) var<storage, read> vx: array<f32>;
@group(0) @binding(3) var<storage, read> vy: array<f32>;
@group(0) @binding(4) var<uniform> view: View;

struct Out { @builtin(position) pos: vec4f, @location(0) uv: vec2f, @location(1) color: vec3f }

@vertex fn vs(@builtin(vertex_index) v: u32, @builtin(instance_index) i: u32) -> Out {
  let corner = vec2f(f32(v & 1u), f32((v >> 1u) & 1u)) * 2.0 - 1.0;
  let aspect = view.canvas.x / view.canvas.y;
  let p = (vec2f(x[i], y[i]) - view.center) / view.scale;
  var o: Out;
  o.pos = vec4f(p.x / aspect + corner.x * view.size / view.canvas.x,
                p.y + corner.y * view.size / view.canvas.y, 0.0, 1.0);
  o.uv = corner;
  let speed = length(vec2f(vx[i], vy[i]));
  o.color = mix(view.cool.rgb, view.hot.rgb, clamp(speed / view.slow - 0.5, 0.0, 1.0));
  return o;
}

@fragment fn fs(in: Out) -> @location(0) vec4f {
  let a = max(0.0, 1.0 - dot(in.uv, in.uv));
  return vec4f(in.color * a * a * view.gain, 1.0);
}`;

export class PointsView {
  // Additive sprites at (x[i], y[i]), coloured by speed |(vx[i], vy[i])|.
  static async create(gpu, canvas) {
    const v = new PointsView();
    v.gpu = gpu;
    v.canvas = canvas;
    v.surface = new Surface(gpu, canvas);
    const module = await compile(gpu.device, POINTS_WGSL, "points-view");
    const add = { operation: "add", srcFactor: "one", dstFactor: "one" };
    v.pipeline = await gpu.device.createRenderPipelineAsync({
      layout: "auto",
      vertex: { module, entryPoint: "vs" },
      fragment: { module, entryPoint: "fs", targets: [{ format: gpu.format, blend: { color: add, alpha: add } }] },
      primitive: { topology: "triangle-strip" },
    });
    v.ubuf = gpu.device.createBuffer({ size: 64, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    v.opts = { center: [0, 0], scale: 1, size: 3, gain: 0.35, slow: 1, cool: "#4a7bff", hot: "#ffd27a" };
    v.groups = new Map();
    return v;
  }

  present() { this.surface.present(); }

  style(opts) {
    Object.assign(this.opts, opts);
    return this;
  }

  draw(encoder, { x, y, vx, vy }, n) {
    const o = this.opts, u = new Float32Array(16);
    u.set([o.center[0], o.center[1], o.scale, o.size, this.canvas.width, this.canvas.height, o.gain, o.slow]);
    u.set(hex(o.cool), 8);
    u.set(hex(o.hot), 12);
    this.gpu.device.queue.writeBuffer(this.ubuf, 0, u);
    const key = [x, y, vx, vy].map((b) => (b.pkId ??= ++Kernel.nextId)).join(",");
    let group = this.groups.get(key);
    if (!group) {
      group = this.gpu.device.createBindGroup({
        layout: this.pipeline.getBindGroupLayout(0),
        entries: [x, y, vx, vy].map((buffer, binding) => ({ binding, resource: { buffer } }))
          .concat([{ binding: 4, resource: { buffer: this.ubuf } }]),
      });
      this.groups.set(key, group);
    }
    const pass = encoder.beginRenderPass({
      colorAttachments: [{ view: this.surface.view(), loadOp: "clear", storeOp: "store", clearValue: [0.01, 0.01, 0.03, 1] }],
    });
    pass.setPipeline(this.pipeline);
    pass.setBindGroup(0, group);
    pass.draw(4, n);
    pass.end();
  }
}

// ---- page chrome ---------------------------------------------------------------------

export function fitCanvas(canvas, maxPixels = 2.5e6) {
  // Backing store at device resolution, capped so a 4K screen stays interactive.
  const dpr = window.devicePixelRatio || 1;
  let w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
  const k = Math.min(1, Math.sqrt(maxPixels / (w * h)));
  w = Math.max(1, Math.floor(w * k));
  h = Math.max(1, Math.floor(h * k));
  const changed = canvas.width !== w || canvas.height !== h;
  canvas.width = w;
  canvas.height = h;
  return changed;
}

export function showFatal(message) {
  const el = document.getElementById("fatal");
  if (!el) return alert(message);
  el.querySelector(".msg").textContent = message;
  el.hidden = false;
}

export function reportChecks(results) {
  const el = document.getElementById("check");
  if (!el) return;
  const ok = results.every((r) => r.ok);
  el.className = ok ? "check ok" : "check bad";
  el.textContent = (ok ? "✓ GPU matches CPython" : "✗ GPU disagrees with CPython") + " · " +
    results.map((r) => `${r.name} ${r.good}/${r.total}`).join(" · ");
  el.title = results.map((r) =>
    `${r.name}(): ${r.good} of ${r.total} values within ${r.tol} (relative) of the CPython result; ` +
    `needs ${(r.minFrac * 100).toFixed(0)}%. Worst error ${r.worst.toPrecision(3)}.`).join("\n");
}

export function fpsMeter(el) {
  let frames = 0, last = performance.now();
  return () => {
    frames++;
    const now = performance.now();
    if (now - last >= 500) {
      el.textContent = `${Math.round(frames * 1000 / (now - last))} fps`;
      frames = 0;
      last = now;
    }
  };
}

// The code drawer: Python source of the demo and the WGSL pykernel made from it.
const PY_KW = /\b(def|return|if|elif|else|while|for|in|range|and|or|not|import|from|as|break|continue|pass|True|False|None)\b/g;
const WGSL_KW = /\b(fn|let|var|if|else|loop|while|for|break|continue|return|struct|array|vec[234][fiu]?|f32|i32|u32|bool)\b/g;

export function highlight(src, lang) {
  const esc = src.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const kw = lang === "py" ? PY_KW : WGSL_KW;
  const comment = lang === "py" ? /(#.*$)/ : /(\/\/.*$)/;
  const out = [];
  let inDoc = false;
  for (const line of esc.split("\n")) {
    if (lang === "py" && (inDoc || line.trimStart().startsWith('"""'))) {
      const n = (line.match(/"""/g) || []).length;
      if (!inDoc && n === 1) inDoc = true; else if (inDoc && n === 1) inDoc = false;
      out.push(`<span class="c">${line}</span>`);
      continue;
    }
    const m = line.match(comment);
    const code = m ? line.slice(0, m.index) : line;
    const tail = m ? `<span class="c">${m[1]}</span>` : "";
    out.push(code
      .replace(/(@\w+(\([^)]*\))?)/g, '<span class="d">$1</span>')
      .replace(kw, '<span class="k">$1</span>')
      .replace(/\b(\d+\.?\d*(e-?\d+)?[fiu]?)\b/g, '<span class="n">$1</span>') + tail);
  }
  return out.join("\n");
}

export function mountCode(demo) {
  const drawer = document.getElementById("code");
  const tabs = drawer.querySelector(".tabs");
  const pre = drawer.querySelector("pre");
  const views = [["Python", demo.python, "py"]];
  for (const [name, k] of Object.entries(demo.kernels)) views.push([`WGSL · ${name}()`, k.wgsl, "wgsl"]);
  views.forEach(([label, src, lang], i) => {
    const b = document.createElement("button");
    b.textContent = label;
    b.onclick = () => {
      tabs.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
      pre.innerHTML = highlight(src, lang);
      pre.scrollTop = 0;
    };
    tabs.append(b);
    if (i === 0) b.click();
  });
  document.getElementById("toggle-code").onclick = () => { drawer.hidden = !drawer.hidden; };
  drawer.querySelector(".close").onclick = () => { drawer.hidden = true; };
}
