// Tilt Rally engine: track, terrain, cars, physics and the WebGPU renderer. No DOM, so it also runs in a
// Worker (the GPU Bridge renders frames with it on real hardware). The page in index.html owns input and HUD.

export const M = 2048, HW = 7, LAPS = 3;     // samples around the loop, road half-width in metres, race length
const D2R = Math.PI / 180, TAU = Math.PI * 2;
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const wrapAng = (a) => { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; };
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const vsub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const vadd = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const vscale = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const vdot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const vcross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const vnorm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
function mul(a, b) { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; }
function perspective(fovy, aspect, near, far) { const f = 1 / Math.tan(fovy / 2); return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, far / (near - far), -1, 0, 0, (near * far) / (near - far), 0]); }
function lookAt(e, c, up) { const z = vnorm(vsub(e, c)), x = vnorm(vcross(up, z)), y = vcross(z, x);
  return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -vdot(x, e), -vdot(y, e), -vdot(z, e), 1]); }
function rotZ(t) { const c = Math.cos(t), s = Math.sin(t); return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
function invert(a) { const o = new Float32Array(16);
  const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = a;
  const b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10, b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12,
    b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30, b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
  const det = 1 / (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);
  o[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det; o[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det; o[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det; o[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  o[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det; o[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det; o[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det; o[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  o[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det; o[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det; o[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det; o[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  o[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det; o[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det; o[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det; o[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return o; }

// ---------------------------------------------------------------- the wheel: device orientation -> steering + pedal
// Gravity-up in device coordinates from the W3C Euler angles (Z-X'-Y''): independent of alpha (compass), continuous
// through the gamma = ±90 seam that landscape sits on, and the same convention on iOS and Android.
export function upFromOrientation(beta, gamma) { const b = beta * D2R, g = gamma * D2R; return [-Math.cos(b) * Math.sin(g), Math.sin(b), Math.cos(b) * Math.cos(g)]; }
// Steering is rotation about the screen normal (device z). Turning the phone clockwise, as its user sees it, swings
// world-up counter-clockwise in device xy, so the signed angle from the neutral pose is the wheel angle, right positive,
// in either landscape. Pedal is the change in how far the screen faces the sky: top edge pushed away raises up.z.
export function wheelFrom(up, neutral) {
  const wheel = wrapAng(Math.atan2(up[1], up[0]) - Math.atan2(neutral[1], neutral[0]));
  const pitch = Math.asin(clamp(up[2], -1, 1)) - Math.asin(clamp(neutral[2], -1, 1));
  return { wheel, pitch };
}

// ---------------------------------------------------------------- the track
export function buildTrack(seed) {
  const rnd = mulberry32(seed), K = 13, ctrl = [];
  for (let k = 0; k < K; k++) { const th = (k + (rnd() - 0.5) * 0.4) / K * TAU, r = 280 + rnd() * 270; ctrl.push([r * Math.cos(th), r * Math.sin(th)]); }
  let dense = [];
  for (let k = 0; k < K; k++) {
    const p0 = ctrl[(k + K - 1) % K], p1 = ctrl[k], p2 = ctrl[(k + 1) % K], p3 = ctrl[(k + 2) % K];
    for (let s = 0; s < 64; s++) { const t = s / 64, t2 = t * t, t3 = t2 * t;
      dense.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3))); }
  }
  for (let it = 0; it < 40; it++) dense = dense.map((p, i, a) => { const q = a[(i + a.length - 1) % a.length], r = a[(i + 1) % a.length]; return [(q[0] + 2 * p[0] + r[0]) / 4, (q[1] + 2 * p[1] + r[1]) / 4]; });
  const cum = [0]; for (let i = 1; i <= dense.length; i++) cum.push(cum[i - 1] + Math.hypot(dense[i % dense.length][0] - dense[i - 1][0], dense[i % dense.length][1] - dense[i - 1][1]));
  const L = cum[dense.length], ds = L / M;
  const x = new Float32Array(M), z = new Float32Array(M), y = new Float32Array(M);
  let j = 0;
  for (let i = 0; i < M; i++) { const s = i * ds; while (cum[j + 1] < s) j++; const t = (s - cum[j]) / (cum[j + 1] - cum[j]), a = dense[j], b = dense[(j + 1) % dense.length];
    x[i] = lerp(a[0], b[0], t); z[i] = lerp(a[1], b[1], t); }
  const ph = [rnd() * TAU, rnd() * TAU, rnd() * TAU];
  for (let i = 0; i < M; i++) { const th = i / M * TAU; y[i] = 9 * Math.sin(2 * th + ph[0]) + 6 * Math.sin(3 * th + ph[1]) + 3 * Math.sin(5 * th + ph[2]); }
  const tx = new Float32Array(M), tz = new Float32Array(M), kap = new Float32Array(M), bank = new Float32Array(M);
  for (let i = 0; i < M; i++) { const a = (i + M - 1) % M, b = (i + 1) % M; const dx = x[b] - x[a], dz = z[b] - z[a], l = Math.hypot(dx, dz); tx[i] = dx / l; tz[i] = dz / l; }
  for (let i = 0; i < M; i++) { const a = (i + M - 4) % M, b = (i + 4) % M; kap[i] = (tx[a] * tz[b] - tz[a] * tx[b]) / (8 * ds); }   // >0 turns right
  for (let i = 0; i < M; i++) { let s = 0; for (let k = -12; k <= 12; k++) s += kap[(i + k + M) % M]; bank[i] = clamp(-s / 25 * 22, -0.09, 0.09); }
  // AI speed plan: the grip limit per sample, then a backward pass so braking starts early enough
  const vlim = new Float32Array(M);
  for (let i = 0; i < M; i++) { let k = 0; for (let d = -6; d <= 6; d++) k = Math.max(k, Math.abs(kap[(i + d + M) % M])); vlim[i] = Math.min(62, Math.sqrt(18.5 / Math.max(k, 1e-4))); }
  for (let pass = 0; pass < 2; pass++) for (let i = M - 1; i >= 0; i--) vlim[i] = Math.min(vlim[i], Math.sqrt(vlim[(i + 1) % M] ** 2 + 2 * 14 * ds));
  let minR = 1e9; for (let i = 0; i < M; i++) minR = Math.min(minR, 1 / Math.max(Math.abs(kap[i]), 1e-6));
  return { x, y, z, tx, tz, kap, bank, vlim, L, ds, minR, seed };
}

// spatial hash of track samples for nearest-sample queries away from a known hint
function trackGrid(T) { const g = new Map(), C = 40; for (let i = 0; i < M; i++) { const k = Math.floor(T.x[i] / C) + "," + Math.floor(T.z[i] / C); (g.get(k) || g.set(k, []).get(k)).push(i); }
  return (px, pz, r) => { let best = -1, bd = r * r; const c0 = Math.floor((px - r) / C), c1 = Math.floor((px + r) / C), d0 = Math.floor((pz - r) / C), d1 = Math.floor((pz + r) / C);
    for (let a = c0; a <= c1; a++) for (let b = d0; b <= d1; b++) for (const i of g.get(a + "," + b) || []) { const d = (T.x[i] - px) ** 2 + (T.z[i] - pz) ** 2; if (d < bd) { bd = d; best = i; } }
    return best; }; }

// ---------------------------------------------------------------- WGSL
const COMMON = /* wgsl */`
struct U { vp: mat4x4f, ivp: mat4x4f, cam: vec4f, sun: vec4f, fog: vec4f, right: vec4f, up: vec4f };
@group(0) @binding(0) var<uniform> u: U;
fn pcg(v: u32) -> u32 { let s = v * 747796405u + 2891336453u; let w = ((s >> ((s >> 28u) + 4u)) ^ s) * 277803737u; return (w >> 22u) ^ w; }
fn h2(p: vec2i) -> f32 { return f32(pcg(bitcast<u32>(p.x) + pcg(bitcast<u32>(p.y)))) / 4294967295.0; }
fn vnoise(p: vec2f) -> f32 { let i = vec2i(floor(p)); let f = fract(p); let w = f * f * (3.0 - 2.0 * f);
  return mix(mix(h2(i), h2(i + vec2i(1, 0)), w.x), mix(h2(i + vec2i(0, 1)), h2(i + vec2i(1, 1)), w.x), w.y); }
fn fogged(c: vec3f, wp: vec3f) -> vec3f { let d = distance(wp, u.cam.xyz); let f = 1.0 - exp(-d * u.sun.w); return mix(c, u.fog.rgb, clamp(f, 0.0, 1.0)); }
fn lit(n: vec3f, alb: vec3f) -> vec3f { let nd = max(dot(n, u.sun.xyz), 0.0);
  let hemi = mix(vec3f(0.30, 0.28, 0.25), vec3f(0.56, 0.66, 0.80), n.y * 0.5 + 0.5);
  return alb * (hemi * 0.78 + vec3f(1.0, 0.94, 0.84) * nd * 1.05); }
// what a mirror-like surface sees: the sky gradient above the horizon, the valley floor below it
fn env(r: vec3f) -> vec3f {
  let sky = mix(u.fog.rgb, vec3f(0.27, 0.47, 0.78), pow(clamp(r.y, 0.0, 1.0), 0.55));
  let ground = mix(vec3f(0.16, 0.2, 0.12), u.fog.rgb * 0.8, exp(r.y * 12.0));
  return select(ground, sky, r.y > 0.0); }
`;
const SKY = COMMON + /* wgsl */`
struct VO { @builtin(position) p: vec4f, @location(0) ndc: vec2f };
@vertex fn vs(@builtin(vertex_index) i: u32) -> VO { var q = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  var o: VO; o.p = vec4f(q[i], 0.0, 1.0); o.ndc = q[i]; return o; }
@fragment fn fs(i: VO) -> @location(0) vec4f {
  let w = u.ivp * vec4f(i.ndc, 1.0, 1.0); let d = normalize(w.xyz / w.w - u.cam.xyz);
  let t = clamp(d.y, 0.0, 1.0);
  var c = mix(u.fog.rgb, vec3f(0.27, 0.47, 0.78), pow(t, 0.55));
  let s = max(dot(d, u.sun.xyz), 0.0);
  c += vec3f(1.0, 0.86, 0.6) * (pow(s, 6.0) * 0.18 + pow(s, 900.0) * 3.0);
  if (d.y > 0.0) { let cp = d.xz / (d.y + 0.08) * 1.6 + vec2f(u.cam.w * 0.004, 0.0);
    let cl = smoothstep(0.55, 0.85, vnoise(cp) * 0.6 + vnoise(cp * 2.7) * 0.3 + vnoise(cp * 6.1) * 0.1);
    c = mix(c, vec3f(0.97, 0.97, 0.98), cl * smoothstep(0.0, 0.25, d.y) * 0.8); }
  return vec4f(c, 1.0); }
`;
const TERRAIN = COMMON + /* wgsl */`
struct VO { @builtin(position) cp: vec4f, @location(0) wp: vec3f, @location(1) n: vec3f };
@vertex fn vs(@location(0) p: vec3f, @location(1) n: vec3f) -> VO { var o: VO; o.cp = u.vp * vec4f(p, 1.0); o.wp = p; o.n = n; return o; }
@fragment fn fs(i: VO) -> @location(0) vec4f {
  let n = normalize(i.n);
  let n1 = vnoise(i.wp.xz * 0.035); let n2 = vnoise(i.wp.xz * 0.45); let n3 = vnoise(i.wp.xz * 2.3);
  var grass = mix(vec3f(0.20, 0.33, 0.12), vec3f(0.40, 0.46, 0.19), n1) * (0.82 + 0.22 * n2 + 0.1 * n3);
  let rock = vec3f(0.43, 0.41, 0.38) * (0.75 + 0.35 * n2 + 0.15 * n3);
  var c = mix(grass, rock, smoothstep(0.84, 0.66, n.y));
  let snow = smoothstep(150.0, 185.0, i.wp.y + n1 * 40.0) * smoothstep(0.5, 0.72, n.y);
  c = mix(c, vec3f(0.93, 0.95, 0.98), snow);
  return vec4f(fogged(lit(n, c), i.wp), 1.0); }
`;
const ROAD = COMMON + /* wgsl */`
struct VO { @builtin(position) cp: vec4f, @location(0) wp: vec3f, @location(1) n: vec3f, @location(2) uv: vec2f };
@vertex fn vs(@location(0) p: vec3f, @location(1) n: vec3f, @location(2) uv: vec2f) -> VO { var o: VO; o.cp = u.vp * vec4f(p, 1.0); o.wp = p; o.n = n; o.uv = uv; return o; }
@fragment fn fs(i: VO) -> @location(0) vec4f {
  let a = abs(i.uv.x); let v = i.uv.y;
  let grain = vnoise(vec2f(i.uv.x * 60.0, v * 4.0)) * 0.5 + vnoise(vec2f(i.uv.x * 230.0, v * 17.0)) * 0.5;
  var c = vec3f(0.205, 0.21, 0.225) * (0.82 + 0.3 * grain);
  c *= 1.0 - 0.18 * smoothstep(0.5, 0.0, abs(a - 0.42)) * vnoise(vec2f(v * 0.05, 3.0));   // worn racing line
  if (a < 0.022 && fract(v / u.fog.w) < 0.45) { c = vec3f(0.86, 0.85, 0.8); }
  if (a > 0.80 && a < 0.835) { c = vec3f(0.9, 0.9, 0.88); }
  if (a >= 0.86 && a < 1.0) { c = select(vec3f(0.84, 0.12, 0.09), vec3f(0.93, 0.93, 0.91), fract(v / 2.4) < 0.5); }
  if (a >= 1.0) { c = mix(vec3f(0.55, 0.50, 0.42), vec3f(0.36, 0.33, 0.28), grain); }
  if (v < 3.2 && a < 0.86) { let ck = (i32(floor((i.uv.x + 1.0) * 7.0)) + i32(floor(v * 1.4))) % 2; c = select(vec3f(0.08), vec3f(0.95), ck == 0); }
  return vec4f(fogged(lit(normalize(i.n), c), i.wp), 1.0); }
`;
// One shader for everything instanced. Vertex colour alpha is the material: 1 paint (takes the instance tint),
// 0.75 lamp, 0.5 glass, 0.25 wheel rim, 0 matte. Instance tint alpha says what the instance is: >= 1 a car body
// (1 + race number + 0.9 x brake), 0.5..1 a wheel, below 0.5 scenery.
const MESH = COMMON + /* wgsl */`
struct VO { @builtin(position) cp: vec4f, @location(0) wp: vec3f, @location(1) n: vec3f, @location(2) c: vec3f,
  @location(3) @interpolate(flat) mat: f32, @location(4) @interpolate(flat) kind: f32, @location(5) op: vec3f, @location(6) @interpolate(flat) tint: vec3f };
@vertex fn vs(@location(0) p: vec3f, @location(1) n: vec3f, @location(2) c: vec4f,
              @location(3) m0: vec4f, @location(4) m1: vec4f, @location(5) m2: vec4f, @location(6) m3: vec4f, @location(7) tint: vec4f) -> VO {
  let m = mat4x4f(m0, m1, m2, m3); let wp = m * vec4f(p, 1.0);
  var o: VO; o.cp = u.vp * wp; o.wp = wp.xyz; o.n = (m * vec4f(n, 0.0)).xyz; o.op = p; o.tint = tint.rgb;
  o.c = select(c.rgb, tint.rgb * c.rgb, c.a > 0.9); o.mat = c.a; o.kind = tint.a; return o; }
fn seg7(p: vec2f, d: i32) -> bool {
  var masks = array<u32, 10>(0x3Fu, 0x06u, 0x5Bu, 0x4Fu, 0x66u, 0x6Du, 0x7Du, 0x07u, 0x7Fu, 0x6Fu);
  let m = masks[clamp(d, 0, 9)]; let t = 0.2;
  let hz = abs(p.x) < 0.48; let up = p.y > 0.0 && p.y < 0.92; let dn = p.y < 0.0 && p.y > -0.92;
  var on = false;
  if ((m & 1u) != 0u && hz && abs(p.y - 0.84) < t) { on = true; }
  if ((m & 2u) != 0u && up && abs(p.x - 0.42) < t) { on = true; }
  if ((m & 4u) != 0u && dn && abs(p.x - 0.42) < t) { on = true; }
  if ((m & 8u) != 0u && hz && abs(p.y + 0.84) < t) { on = true; }
  if ((m & 16u) != 0u && dn && abs(p.x + 0.42) < t) { on = true; }
  if ((m & 32u) != 0u && up && abs(p.x + 0.42) < t) { on = true; }
  if ((m & 64u) != 0u && hz && abs(p.y) < t) { on = true; }
  return on; }
@fragment fn fs(i: VO) -> @location(0) vec4f {
  var n = normalize(i.n); let v = normalize(u.cam.xyz - i.wp);
  if (dot(n, v) < 0.0 && i.mat > 0.4 && i.mat < 0.6) { n = -n; }
  let car = i.kind >= 1.0; let wheel = i.kind >= 0.5 && i.kind < 1.0;
  var base = i.c; var mat = i.mat;
  if (car && mat > 0.9) {
    let lum = dot(i.tint, vec3f(0.3, 0.55, 0.15));
    let stripe = select(vec3f(0.95, 0.95, 0.93), vec3f(0.06, 0.06, 0.07), lum > 0.55);
    let sx = abs(i.op.x);
    if (i.op.y > 0.6 && sx > 0.09 && sx < 0.2) { base = stripe; }
    // race-number roundel on each door, read the right way round from either side
    let q = vec2f(-sign(i.op.x) * (i.op.z + 0.15), i.op.y - 0.5);
    if (sx > 0.6 && length(q) < 0.22) { base = vec3f(0.96, 0.96, 0.94); if (seg7(q / vec2f(0.075, 0.12), i32(floor(i.kind)) - 1)) { base = vec3f(0.05); } }
  }
  if (wheel && mat > 0.2 && mat < 0.3) {   // five-spoke rim: dark between the spokes, polished on them
    let r = length(i.op.yz); let ang = atan2(i.op.y, i.op.z);
    if (!(cos(ang * 5.0) > 0.35 || r < 0.06 || r > 0.205)) { base = vec3f(0.05); mat = 0.0; }
  }
  let r = reflect(-v, n); let fres = 0.04 + 0.96 * pow(1.0 - max(dot(n, v), 0.0), 5.0);
  let h = normalize(u.sun.xyz + v); let nh = max(dot(n, h), 0.0); let sunv = max(dot(n, u.sun.xyz), 0.0);
  var col: vec3f;
  if (mat > 0.9 && car) {                     // clear-coated paint
    col = lit(n, base * 0.85) + env(r) * (0.05 + fres * 0.85) + vec3f(1.0, 0.95, 0.85) * pow(nh, 160.0) * 2.5 * step(0.0, sunv);
  } else if (mat > 0.6 && mat < 0.9) {        // lamps; tail lamps brighten with the brake
    let brake = fract(i.kind);
    col = base * select(1.8, 1.4 + brake * 4.0, base.r > base.g * 2.0 && car);
  } else if (mat > 0.4 && mat < 0.6) {        // glass
    col = base * 0.25 + env(r) * (0.1 + fres * 0.8) + vec3f(1.0) * pow(nh, 220.0) * 3.0 * step(0.0, sunv);
  } else if (mat > 0.2 && mat < 0.3) {        // polished metal
    col = lit(n, base) * 0.45 + env(r) * base * 0.75 + vec3f(1.0) * pow(nh, 60.0) * 1.2;
  } else {
    col = lit(n, base);
    if (i.kind > 0.0 && i.kind < 0.5) { col += vec3f(1.0, 0.95, 0.85) * pow(nh, 60.0) * i.kind; }
  }
  if (car) { col *= mix(0.5, 1.0, smoothstep(0.18, 0.6, i.op.y)); }   // contact shade low on the body
  if (wheel) { col *= 0.85; }
  return vec4f(fogged(col, i.wp), 1.0); }
`;
const BLOB = COMMON + /* wgsl */`
struct VO { @builtin(position) cp: vec4f, @location(0) q: vec2f, @location(1) a: f32 };
@vertex fn vs(@builtin(vertex_index) vi: u32, @location(0) pa: vec4f, @location(1) pb: vec4f) -> VO {
  var cs = array<vec2f, 6>(vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0), vec2f(-1.0, -1.0), vec2f(1.0, 1.0), vec2f(-1.0, 1.0));
  let q = cs[vi]; let f = vec3f(sin(pa.w), 0.0, cos(pa.w)); let r = vec3f(-f.z, 0.0, f.x);
  let wp = pa.xyz + r * q.x * pb.x + f * q.y * pb.y + vec3f(0.0, 0.07, 0.0);
  var o: VO; o.cp = u.vp * vec4f(wp, 1.0); o.q = q; o.a = pb.z; return o; }
@fragment fn fs(i: VO) -> @location(0) vec4f { let d = length(i.q * vec2f(1.0, 1.0)); let a = (1.0 - smoothstep(0.25, 1.0, d)) * i.a; return vec4f(0.02, 0.03, 0.04, a); }
`;
const SMOKE = COMMON + /* wgsl */`
struct VO { @builtin(position) cp: vec4f, @location(0) q: vec2f, @location(1) life: f32, @location(2) kind: f32, @location(3) wp: vec3f };
@vertex fn vs(@builtin(vertex_index) vi: u32, @location(0) pl: vec4f, @location(1) vk: vec4f) -> VO {
  var cs = array<vec2f, 6>(vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0), vec2f(-1.0, -1.0), vec2f(1.0, 1.0), vec2f(-1.0, 1.0));
  let q = cs[vi]; var o: VO; o.q = q; o.life = pl.w; o.kind = vk.w;
  if (pl.w <= 0.0) { o.cp = vec4f(2.0, 2.0, 2.0, 1.0); o.wp = vec3f(0.0); return o; }
  let size = mix(3.4, 0.45, pl.w);
  let wp = pl.xyz + u.right.xyz * q.x * size + u.up.xyz * q.y * size; o.wp = wp;
  o.cp = u.vp * vec4f(wp, 1.0); return o; }
@fragment fn fs(i: VO) -> @location(0) vec4f {
  let a = (1.0 - smoothstep(0.2, 1.0, length(i.q))) * i.life * select(0.30, 0.24, i.kind > 0.5);
  let base = select(vec3f(0.86, 0.86, 0.86), vec3f(0.62, 0.52, 0.38), i.kind > 0.5);
  return vec4f(fogged(lit(vec3f(0.0, 1.0, 0.0), base), i.wp), a); }
`;
const SMOKE_SIM = /* wgsl */`
struct P { p: vec4f, v: vec4f };
struct E { p: vec4f, v: vec4f };
struct PP { dt: f32, time: f32, count: u32, frame: u32, e: array<E, 8> };
@group(0) @binding(0) var<storage, read_write> ps: array<P>;
@group(0) @binding(1) var<uniform> pp: PP;
fn pcg(v: u32) -> u32 { let s = v * 747796405u + 2891336453u; let w = ((s >> ((s >> 28u) + 4u)) ^ s) * 277803737u; return (w >> 22u) ^ w; }
fn rnd(a: u32, b: u32) -> f32 { return f32(pcg(a * 9781u + pcg(b))) / 4294967295.0; }
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id: vec3u) {
  let i = id.x; if (i >= arrayLength(&ps)) { return; }
  var q = ps[i];
  if (q.p.w > 0.0) {
    let v = q.v.xyz * exp(-1.6 * pp.dt) + vec3f(0.0, 1.1 * pp.dt, 0.0);
    q.v = vec4f(v, q.v.w); q.p = vec4f(q.p.xyz + v * pp.dt, q.p.w - pp.dt / 1.5);
  } else {
    let e = i % 8u;
    if (e < pp.count) { let em = pp.e[e];
      if (rnd(i, pp.frame) < em.p.w * pp.dt) {
        let j = vec3f(rnd(i, pp.frame + 1u), rnd(i, pp.frame + 2u), rnd(i, pp.frame + 3u)) - 0.5;
        q.p = vec4f(em.p.xyz + j * vec3f(0.6, 0.2, 0.6), 1.0);
        q.v = vec4f(em.v.xyz * 0.25 + j * 2.0 + vec3f(0.0, 0.8, 0.0), em.v.w); } }
  }
  ps[i] = q; }
`;
// The valley is carved on the GPU: every terrain vertex finds its nearest track sample (coarse pass over every 8th,
// then a fine pass around it), sinks into a ditch under the road, and blends out to rolling hills and a mountain ring.
const CARVE = /* wgsl */`
struct TP { a: vec4f, b: vec4f };   // a: origin x, origin z, cell, N   b: samples, half-width, ring radius, seed
@group(0) @binding(0) var<storage, read> pts: array<vec4f>;
@group(0) @binding(1) var<storage, read_write> h: array<f32>;
@group(0) @binding(2) var<uniform> tp: TP;
fn pcg(v: u32) -> u32 { let s = v * 747796405u + 2891336453u; let w = ((s >> ((s >> 28u) + 4u)) ^ s) * 277803737u; return (w >> 22u) ^ w; }
fn h2(p: vec2i) -> f32 { return f32(pcg(bitcast<u32>(p.x) + pcg(bitcast<u32>(p.y) + u32(tp.b.w)))) / 4294967295.0; }
fn vnoise(p: vec2f) -> f32 { let i = vec2i(floor(p)); let f = fract(p); let w = f * f * (3.0 - 2.0 * f);
  return mix(mix(h2(i), h2(i + vec2i(1, 0)), w.x), mix(h2(i + vec2i(0, 1)), h2(i + vec2i(1, 1)), w.x), w.y); }
fn fbm(p: vec2f) -> f32 { var s = 0.0; var a = 0.5; var q = p; for (var k = 0; k < 5; k++) { s += a * vnoise(q); q = q * 2.03 + vec2f(17.1, 3.7); a *= 0.5; } return s; }
@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id: vec3u) {
  let N = u32(tp.a.w); let i = id.x; if (i >= N * N) { return; }
  let xz = tp.a.xy + vec2f(f32(i % N), f32(i / N)) * tp.a.z;
  let M = u32(tp.b.x);
  var best = 1e20; var bk = 0u;
  for (var k = 0u; k < M; k += 8u) { let d = pts[k].xz - xz; let dd = dot(d, d); if (dd < best) { best = dd; bk = k; } }
  for (var o = 0u; o < 17u; o++) { let k = (bk + M + o - 8u) % M; let d = pts[k].xz - xz; let dd = dot(d, d); if (dd < best) { best = dd; bk = k; } }
  let d = sqrt(best); let ty = pts[bk].y; let hw = tp.b.y;
  let hills = (fbm(xz / 300.0) - 0.5) * 90.0 + (fbm(xz / 70.0) - 0.5) * 14.0;
  let rr = length(xz) / tp.b.z;
  let ring = smoothstep(1.12, 1.75, rr) * (150.0 + 170.0 * fbm(xz / 210.0 + vec2f(5.0, 9.0)));
  let natural = mix(ty, hills, smoothstep(18.0, 260.0, d)) + ring + (fbm(xz / 25.0) - 0.5) * 2.5 * smoothstep(hw + 4.0, hw + 30.0, d);
  let ditch = ty - 1.4 - abs(pts[bk].w) * d;
  h[i] = mix(ditch, natural, smoothstep(hw + 2.5, hw + 26.0, d)); }
`;

// ---------------------------------------------------------------- meshes: pos3 normal3 colour4 (alpha = material)
const PAINT = 1, LAMP = 0.75, GLASS = 0.5, METAL = 0.25, MATTE = 0;
function Mesh() { const a = []; return {
  a, v(p, n, c) { a.push(p[0], p[1], p[2], n[0], n[1], n[2], c[0], c[1], c[2], c[3]); },
  quad(p0, p1, p2, p3, n, c) { for (const p of [p0, p1, p2, p0, p2, p3]) this.v(p, n, c); },
  box(cx, cy, cz, sx, sy, sz, c) { const x0 = cx - sx / 2, x1 = cx + sx / 2, y0 = cy - sy / 2, y1 = cy + sy / 2, z0 = cz - sz / 2, z1 = cz + sz / 2;
    this.quad([x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1], [1, 0, 0], c); this.quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0], c);
    this.quad([x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [0, 1, 0], c); this.quad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0], c);
    this.quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1], c); this.quad([x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0], [0, 0, -1], c); },
  cone(cx, cy, cz, r, h, segs, c) { for (let s = 0; s < segs; s++) { const t0 = s / segs * TAU, t1 = (s + 1) / segs * TAU;
      const p0 = [cx + r * Math.cos(t0), cy, cz + r * Math.sin(t0)], p1 = [cx + r * Math.cos(t1), cy, cz + r * Math.sin(t1)], ap = [cx, cy + h, cz];
      let n = vnorm(vcross(vsub(p1, p0), vsub(ap, p0))); const mid = (t0 + t1) / 2; if (n[0] * Math.cos(mid) + n[2] * Math.sin(mid) < 0) n = n.map((v) => -v);
      for (const p of [p0, p1, ap]) this.v(p, n, c); } },
  get count() { return a.length / 10; } }; }

// The car body is lofted: 64 cross-sections from nose to tail, each a 12-point half profile (floor, sill, flank,
// shoulder, glasshouse, roof) whose dimensions are smooth functions of the station, with wheel arches lifted out of
// the sill. Mirrored for the other side, smooth normals from the grid, caps at both ends. Length 4.5 m, nose at +z.
export function carMesh() {
  const m = Mesh(), S = 64, Z0 = 2.25, Z1 = -2.25, NP = 12;
  const station = (z) => {
    const tf = clamp((z - 1.72) / 0.53, 0, 1), tr = clamp((-z - 1.95) / 0.3, 0, 1);
    const e = Math.sqrt(1 - tf * tf) * Math.sqrt(1 - tr * tr);
    const w = 0.94 * (0.5 + 0.5 * Math.sqrt(e));
    let yb = z > 0 ? 0.6 + 0.22 * sstep(2.25, 0.9, z) : 0.82 + 0.06 * sstep(-1.0, -2.1, z);
    yb -= (1 - e) * 0.16;
    const y0 = 0.2 + (1 - e) * 0.1;
    const c = Math.min(sstep(0.98, 0.15, z), sstep(-1.9, -0.75, z));
    const yc = yb + c * (1.24 - yb), wc = w * 0.8;
    let ys = 0.34;
    for (const zw of [1.38, -1.38]) { const dz = z - zw; if (Math.abs(dz) < 0.47) ys = Math.max(ys, 0.3 + Math.sqrt(0.47 * 0.47 - dz * dz)); }
    ys = Math.min(ys, yb - 0.17);
    const P = [[0, y0], [0.5 * w, y0], [w * 0.96, ys], [w, ys + 0.06], [w, yb - 0.11], [w * 0.985, yb - 0.04], [w * 0.95, yb],
      [lerp(w * 0.9, wc, c), yb + 0.03], [lerp(w * 0.82, wc * 0.93, c), lerp(yb + 0.04, yb + 0.55 * (yc - yb), c)],
      [lerp(w * 0.66, wc * 0.79, c), lerp(yb + 0.05, yc - 0.035, c)], [lerp(w * 0.36, wc * 0.52, c), lerp(yb + 0.06, yc, c)], [0, lerp(yb + 0.065, yc + 0.006, c)]];
    return { P, c, z };
  };
  const st = []; for (let s = 0; s <= S; s++) st.push(station(Z0 + (Z1 - Z0) * s / S));
  const G = st.map((s) => s.P.map(([x, y]) => [x, y, s.z]));
  const nrm = (s, k) => { const ds = vsub(G[Math.min(S, s + 1)][k], G[Math.max(0, s - 1)][k]), dk = vsub(G[s][Math.min(NP - 1, k + 1)], G[s][Math.max(0, k - 1)]);
    let n = vnorm(vcross(dk, ds)); const out = [G[s][k][0], G[s][k][1] - 0.62, 0]; if (vdot(n, out) < 0) n = vscale(n, -1); return n; };
  const N = G.map((row, s) => row.map((_, k) => nrm(s, k)));
  const matOf = (s, k) => { const c = (st[s].c + st[s + 1].c) / 2, z = (st[s].z + st[s + 1].z) / 2;
    if (k <= 1) return [0.05, 0.05, 0.06, MATTE];
    if ((k === 7 || k === 8) && c > 0.35 && z < 0.55 && z > -1.6) return [0.1, 0.12, 0.15, GLASS];
    if ((k === 9 || k === 10) && c > 0.04 && c < 0.97) return [0.1, 0.12, 0.15, GLASS];
    if (k === 2) return [0.08, 0.08, 0.09, MATTE];       // sill skirt in black
    return [1, 1, 1, PAINT]; };
  for (const side of [1, -1]) {
    const P = (s, k) => [G[s][k][0] * side, G[s][k][1], G[s][k][2]], Nn = (s, k) => [N[s][k][0] * side, N[s][k][1], N[s][k][2]];
    for (let s = 0; s < S; s++) for (let k = 0; k < NP - 1; k++) { const c = matOf(s, k);
      for (const [a, b] of [[s, k], [s + 1, k], [s + 1, k + 1], [s, k], [s + 1, k + 1], [s, k + 1]]) m.v(P(a, b), Nn(a, b), c); }
    for (const [s, nz] of [[0, 1], [S, -1]]) { const cen = [0, G[s].reduce((t, p) => t + p[1], 0) / NP, G[s][0][2]];
      for (let k = 0; k < NP - 1; k++) for (const p of [cen, P(s, k), P(s, k + 1)]) m.v(p, [0, 0, nz], [1, 1, 1, PAINT]); }
  }
  // details: grille, splitter, lamps, wing, mirrors, diffuser and exhaust
  const black = [0.06, 0.06, 0.07, MATTE], dark = [0.12, 0.12, 0.13, MATTE];
  m.box(0, 0.36, 2.19, 0.8, 0.14, 0.12, black);
  m.box(0, 0.21, 2.06, 1.2, 0.04, 0.24, black);
  for (const sx of [-1, 1]) { m.box(sx * 0.54, 0.5, 2.1, 0.36, 0.09, 0.18, [1, 0.97, 0.88, LAMP]); m.box(sx * 0.54, 0.5, 2.0, 0.42, 0.13, 0.12, black); }
  m.box(0, 0.75, -2.215, 1.5, 0.07, 0.06, [1, 0.1, 0.06, LAMP]);
  for (const sx of [-1, 1]) m.box(sx * 0.62, 0.75, -2.21, 0.3, 0.11, 0.06, [1, 0.1, 0.06, LAMP]);
  m.box(0, 0.33, -2.14, 1.4, 0.16, 0.18, black);
  for (const sx of [-0.35, 0.35]) m.box(sx, 0.3, -2.22, 0.12, 0.08, 0.1, [0.6, 0.6, 0.62, METAL]);
  m.box(0, 1.04, -2.02, 1.86, 0.045, 0.38, [1, 1, 1, PAINT]);
  for (const sx of [-1, 1]) { m.box(sx * 0.9, 0.97, -2.02, 0.04, 0.2, 0.42, [1, 1, 1, PAINT]); m.box(sx * 0.42, 0.93, -1.98, 0.05, 0.14, 0.12, dark); }
  for (const sx of [-1, 1]) { m.box(sx * 0.86, 0.94, 0.72, 0.16, 0.09, 0.07, [1, 1, 1, PAINT]); m.box(sx * 0.78, 0.92, 0.74, 0.08, 0.03, 0.04, black); }
  return m;
}
// A wheel centred on the origin with its axle along x and the outer face at +x: tread, sidewalls, recessed rim.
export function wheelMesh() {
  const m = Mesh(), R = 0.34, W = 0.25, RR = 0.23, n = 24, tyre = [0.06, 0.06, 0.065, MATTE], wall = [0.09, 0.09, 0.095, MATTE], rim = [0.78, 0.79, 0.81, METAL];
  for (let s = 0; s < n; s++) { const a0 = s / n * TAU, a1 = (s + 1) / n * TAU, c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
    const T = (x, c, sn, r) => [x, r * c, r * sn];
    const q = [[T(-W / 2, c0, s0, R), T(W / 2, c0, s0, R), T(W / 2, c1, s1, R)], [T(-W / 2, c0, s0, R), T(W / 2, c1, s1, R), T(-W / 2, c1, s1, R)]];
    for (const tri of q) for (const p of tri) m.v(p, [0, p[1] / R, p[2] / R], tyre);
    for (const sx of [1, -1]) { const x = sx * W / 2;
      m.quad(T(x, c0, s0, RR), T(x, c0, s0, R), T(x, c1, s1, R), T(x, c1, s1, RR), [sx, 0, 0], wall); }
    for (const p of [[W / 2 - 0.03, 0, 0], T(W / 2 - 0.01, c0, s0, RR), T(W / 2 - 0.01, c1, s1, RR)]) m.v(p, [1, 0, 0], rim);
    for (const p of [[-W / 2, 0, 0], T(-W / 2, c0, s0, RR), T(-W / 2, c1, s1, RR)]) m.v(p, [-1, 0, 0], wall);
  }
  return m;
}
function treeMesh() { const m = Mesh(); m.box(0, 1.0, 0, 0.45, 2.0, 0.45, [0.33, 0.24, 0.16, MATTE]);
  m.cone(0, 1.4, 0, 2.3, 4.2, 7, [1, 1, 1, PAINT]); m.cone(0, 3.6, 0, 1.7, 3.6, 7, [0.92, 0.95, 0.92, PAINT]); return m; }
function boardMesh() { const m = Mesh(); m.box(-1.1, 0.6, 0, 0.1, 1.2, 0.1, [0.5, 0.5, 0.52, MATTE]); m.box(1.1, 0.6, 0, 0.1, 1.2, 0.1, [0.5, 0.5, 0.52, MATTE]);
  for (let k = 0; k < 6; k++) m.box(-1.25 + 0.5 * k + 0.25, 1.55, 0, 0.5, 0.75, 0.1, k % 2 ? [0.95, 0.95, 0.93, MATTE] : [0.86, 0.12, 0.08, MATTE]); return m; }
function gantryMesh() { const m = Mesh(), w = HW * 1.25 + 0.8, steel = [0.32, 0.33, 0.35, MATTE];
  m.box(-w, 3.6, 0, 0.6, 7.2, 0.6, steel); m.box(w, 3.6, 0, 0.6, 7.2, 0.6, steel);
  m.box(0, 6.8, 0, 2 * w + 0.6, 1.3, 0.5, [0.1, 0.11, 0.12, MATTE]); m.box(0, 6.8, 0, 2 * w - 2, 0.7, 0.6, [1, 0.82, 0.12, MATTE]);
  for (let k = -3; k <= 3; k++) m.box(k * 1.4, 7.7, 0.0, 0.5, 0.3, 0.3, [0.85, 0.1, 0.08, LAMP]);
  return m; }

// basis matrix: forward z, up y, translation p
function basis(p, fwd, up, s = 1) { const Z = vnorm(fwd); const X = vnorm(vcross(up, Z)); const Y = vcross(Z, X);
  return [X[0] * s, X[1] * s, X[2] * s, 0, Y[0] * s, Y[1] * s, Y[2] * s, 0, Z[0] * s, Z[1] * s, Z[2] * s, 0, p[0], p[1], p[2], 1]; }

export const CARS = [
  { name: "You", colour: [1, 0.78, 0.08], number: 7 },
  { name: "Rossa", colour: [0.82, 0.08, 0.07], number: 3 },
  { name: "Blu", colour: [0.08, 0.32, 0.85], number: 5 },
  { name: "Verde", colour: [0.06, 0.5, 0.3], number: 9 },
];

// ---------------------------------------------------------------- engine
export async function createEngine(device, format, { sampleCount = 4, onEvent = () => {} } = {}) {
  const E = { tune: { grip: [20, 13, 7], side: [10, 6, 3], assist: 1, scrub: 20 }, device, format, frames: 0, clock: 0, state: "idle", raceT: 0, input: { steer: 0, thr: 0 }, cars: null, player: null, bump: 0 };
  const emit = (type, data) => { try { onEvent(type, data); } catch (e) { console.error(e); } };

  async function buildWorld(seed) {
    const T = buildTrack(seed), near = trackGrid(T);
    E.T = T; E.near = near; E.cars = null;
    let rmax = 0; for (let i = 0; i < M; i++) rmax = Math.max(rmax, Math.hypot(T.x[i], T.z[i]));
    const N = 400, ext = rmax + 900, cell = 2 * ext / (N - 1), ox = -ext, oz = -ext;
    const pts = new Float32Array(M * 4); for (let i = 0; i < M; i++) pts.set([T.x[i], T.y[i], T.z[i], T.bank[i]], i * 4);
    const ptsBuf = device.createBuffer({ size: pts.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST }); device.queue.writeBuffer(ptsBuf, 0, pts);
    const hBuf = device.createBuffer({ size: N * N * 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC });
    const rb = device.createBuffer({ size: N * N * 4, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
    const tpBuf = device.createBuffer({ size: 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    device.queue.writeBuffer(tpBuf, 0, new Float32Array([ox, oz, cell, N, M, HW, rmax, seed % 9973]));
    const carve = device.createComputePipeline({ layout: "auto", compute: { module: device.createShaderModule({ code: CARVE }), entryPoint: "main" } });
    const enc = device.createCommandEncoder(), cp = enc.beginComputePass();
    cp.setPipeline(carve); cp.setBindGroup(0, device.createBindGroup({ layout: carve.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: ptsBuf } }, { binding: 1, resource: { buffer: hBuf } }, { binding: 2, resource: { buffer: tpBuf } }] }));
    cp.dispatchWorkgroups(Math.ceil(N * N / 64)); cp.end(); enc.copyBufferToBuffer(hBuf, 0, rb, 0, N * N * 4); device.queue.submit([enc.finish()]);
    await rb.mapAsync(GPUMapMode.READ); const H = new Float32Array(rb.getMappedRange().slice(0)); rb.unmap();
    ptsBuf.destroy(); hBuf.destroy(); rb.destroy(); tpBuf.destroy();
    E.H = { H, N, cell, ox, oz };
    const tv = new Float32Array(N * N * 6);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const k = j * N + i, hx = H[j * N + Math.min(N - 1, i + 1)] - H[j * N + Math.max(0, i - 1)], hz = H[Math.min(N - 1, j + 1) * N + i] - H[Math.max(0, j - 1) * N + i];
      const n = vnorm([-hx, 2 * cell, -hz]); tv.set([ox + i * cell, H[k], oz + j * cell, n[0], n[1], n[2]], k * 6); }
    const ti = new Uint32Array((N - 1) * (N - 1) * 6); let q = 0;
    for (let j = 0; j < N - 1; j++) for (let i = 0; i < N - 1; i++) { const a = j * N + i, b = a + 1, c = a + N, d = c + 1; ti.set([a, c, b, b, c, d], q); q += 6; }
    // road: per sample four vertices, skirt / edge / edge / skirt
    const rv = new Float32Array((M + 1) * 4 * 8), ri = new Uint32Array(M * 3 * 6);
    const rowU = [-1.42, -1.16, 1.16, 1.42];
    for (let i = 0; i <= M; i++) { const k = i % M, nx = -T.tz[k], nz = T.tx[k], s = T.bank[k], nrm = vnorm([-nx * s, 1, -nz * s]), v = i * T.ds;
      rowU.forEach((uu, r) => { const lat = uu * HW, edge = Math.sign(uu) * 1.16 * HW, skirt = Math.abs(uu) > 1.3;
        const y = T.y[k] + (skirt ? edge * s - 2.6 : lat * s) + 0.02;
        const L = skirt ? edge * 1.08 + Math.sign(uu) * 1.2 : lat;
        rv.set([T.x[k] + nx * L, y, T.z[k] + nz * L, nrm[0], nrm[1], nrm[2], uu, v], (i * 4 + r) * 8); }); }
    q = 0; for (let i = 0; i < M; i++) { const a = i * 4, b = (i + 1) * 4; for (let r = 0; r < 3; r++) { ri.set([a + r, b + r, a + r + 1, a + r + 1, b + r, b + r + 1], q); q += 6; } }
    // props
    const rnd = mulberry32(seed * 31 + 5), trees = [];
    for (let n = 0; n < 9000 && trees.length < 2400; n++) { const x = (rnd() * 2 - 1) * (rmax + 420), z = (rnd() * 2 - 1) * (rmax + 420);
      const k = near(x, z, HW + 11); if (k >= 0) continue; const y = heightGrid(x, z); if (y > 150 || rnd() < y / 200) continue;
      const s = 0.75 + rnd() * 0.9, g = 0.75 + rnd() * 0.4; trees.push([x, y - 0.3, z, s, 0.24 * g, 0.42 * g, 0.18 * g]); }
    const treeInst = new Float32Array(trees.length * 20);
    trees.forEach((t, k) => { const a = rnd() * TAU; treeInst.set([...basis([t[0], t[1], t[2]], [Math.sin(a), 0, Math.cos(a)], [0, 1, 0], t[3]), t[4], t[5], t[6], 0], k * 20); });
    const boards = [];
    for (let i = 0; i < M; i += 10) { const k = T.kap[i]; if (Math.abs(k) < 1 / 95) continue; const side = -Math.sign(k), nx = -T.tz[i], nz = T.tx[i], L = side * (HW * 1.42 + 2.5);
      const px = T.x[i] + nx * L, pz = T.z[i] + nz * L; boards.push(basis([px, heightGrid(px, pz) - 0.1, pz], [-T.tx[i], 0, -T.tz[i]], [0, 1, 0])); }
    const boardInst = new Float32Array(Math.max(1, boards.length) * 20); boards.forEach((b, k) => boardInst.set([...b, 1, 1, 1, 0], k * 20));
    const gantryInst = new Float32Array([...basis([T.x[0], T.y[0], T.z[0]], [T.tx[0], 0, T.tz[0]], [0, 1, 0]), 1, 1, 1, 0]);
    const vb = (arr, usage = GPUBufferUsage.VERTEX) => { const b = device.createBuffer({ size: Math.max(16, arr.byteLength), usage: usage | GPUBufferUsage.COPY_DST }); device.queue.writeBuffer(b, 0, arr); return b; };
    if (E.res) for (const b of E.res.buffers) b.destroy();
    const car = carMesh(), wheel = wheelMesh(), tree = treeMesh(), board = boardMesh(), gantry = gantryMesh();
    const R = { buffers: [] }; const keep = (b) => (R.buffers.push(b), b);
    R.terrain = { vb: keep(vb(tv)), ib: keep(vb(ti, GPUBufferUsage.INDEX)), n: ti.length };
    R.road = { vb: keep(vb(rv)), ib: keep(vb(ri, GPUBufferUsage.INDEX)), n: ri.length };
    R.car = { vb: keep(vb(new Float32Array(car.a))), n: car.count, inst: keep(device.createBuffer({ size: 8 * 80, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST })), k: 0 };
    R.wheel = { vb: keep(vb(new Float32Array(wheel.a))), n: wheel.count, inst: keep(device.createBuffer({ size: 32 * 80, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST })), k: 0 };
    R.tree = { vb: keep(vb(new Float32Array(tree.a))), n: tree.count, inst: keep(vb(treeInst)), k: trees.length };
    R.board = { vb: keep(vb(new Float32Array(board.a))), n: board.count, inst: keep(vb(boardInst)), k: boards.length };
    R.gantry = { vb: keep(vb(new Float32Array(gantry.a))), n: gantry.count, inst: keep(vb(gantryInst)), k: 1 };
    R.blob = keep(device.createBuffer({ size: 8 * 32, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST }));
    E.res = R;
    if (!E.pipes) makePipelines();
    E.stats = { trees: trees.length, boards: boards.length, minR: T.minR, L: T.L, carTris: car.count / 3, wheelTris: wheel.count / 3 };
  }

  function heightGrid(x, z) { const { H, N, cell, ox, oz } = E.H; const fx = clamp((x - ox) / cell, 0, N - 1.001), fz = clamp((z - oz) / cell, 0, N - 1.001);
    const i = Math.floor(fx), j = Math.floor(fz), a = fx - i, b = fz - j, k = j * N + i;
    return lerp(lerp(H[k], H[k + 1], a), lerp(H[k + N], H[k + N + 1], a), b); }

  function makePipelines() {
    E.ubuf = device.createBuffer({ size: 256, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
    const bgl = device.createBindGroupLayout({ entries: [{ binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: {} }] });
    E.ubg = device.createBindGroup({ layout: bgl, entries: [{ binding: 0, resource: { buffer: E.ubuf } }] });
    const layout = device.createPipelineLayout({ bindGroupLayouts: [bgl] });
    const blend = { color: { srcFactor: "src-alpha", dstFactor: "one-minus-src-alpha" }, alpha: { srcFactor: "one", dstFactor: "one-minus-src-alpha" } };
    const mk = (code, buffers, { depthWrite = true, depthCompare = "less", blended = false } = {}) => { const module = device.createShaderModule({ code });
      return device.createRenderPipeline({ layout, vertex: { module, entryPoint: "vs", buffers }, fragment: { module, entryPoint: "fs", targets: [{ format, blend: blended ? blend : undefined }] },
        primitive: { topology: "triangle-list", cullMode: "none" }, depthStencil: { format: "depth24plus", depthWriteEnabled: depthWrite, depthCompare }, multisample: { count: sampleCount } }); };
    const f3 = (l, o) => ({ shaderLocation: l, offset: o, format: "float32x3" }), f4 = (l, o) => ({ shaderLocation: l, offset: o, format: "float32x4" });
    const inst = { arrayStride: 80, stepMode: "instance", attributes: [f4(3, 0), f4(4, 16), f4(5, 32), f4(6, 48), f4(7, 64)] };
    E.pipes = {
      sky: mk(SKY, [], { depthWrite: false, depthCompare: "always" }),
      terrain: mk(TERRAIN, [{ arrayStride: 24, attributes: [f3(0, 0), f3(1, 12)] }]),
      road: mk(ROAD, [{ arrayStride: 32, attributes: [f3(0, 0), f3(1, 12), { shaderLocation: 2, offset: 24, format: "float32x2" }] }]),
      mesh: mk(MESH, [{ arrayStride: 40, attributes: [f3(0, 0), f3(1, 12), f4(2, 24)] }, inst]),
      blob: mk(BLOB, [{ arrayStride: 32, stepMode: "instance", attributes: [f4(0, 0), f4(1, 16)] }], { depthWrite: false, depthCompare: "less-equal", blended: true }),
      smoke: mk(SMOKE, [{ arrayStride: 32, stepMode: "instance", attributes: [f4(0, 0), f4(1, 16)] }], { depthWrite: false, blended: true }),
    };
    const NP = 4096;
    E.parts = { n: NP, buf: device.createBuffer({ size: NP * 32, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST }),
      ubuf: device.createBuffer({ size: 16 + 8 * 32, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }), data: new ArrayBuffer(16 + 8 * 32) };
    E.parts.pipe = device.createComputePipeline({ layout: "auto", compute: { module: device.createShaderModule({ code: SMOKE_SIM }), entryPoint: "main" } });
    E.parts.bg = device.createBindGroup({ layout: E.parts.pipe.getBindGroupLayout(0), entries: [{ binding: 0, resource: { buffer: E.parts.buf } }, { binding: 1, resource: { buffer: E.parts.ubuf } }] });
  }

  // ---- car physics (shared by player and AI)
  function probe(x, z, hint) {
    const T = E.T; let idx = hint, bd = 1e18;
    const scan = (from, to) => { for (let k = from; k <= to; k++) { const i = (k + M) % M, d = (T.x[i] - x) ** 2 + (T.z[i] - z) ** 2; if (d < bd) { bd = d; idx = i; } } };
    if (hint < 0) { const g = E.near(x, z, 160); if (g >= 0) { idx = g; bd = 1e18; scan(g - 30, g + 30); } else { scan(0, M - 1); } } else scan(hint - 40, hint + 40);
    const nx = -T.tz[idx], nz = T.tx[idx], dx = x - T.x[idx], dz = z - T.z[idx];
    const along = dx * T.tx[idx] + dz * T.tz[idx], lat = dx * nx + dz * nz;
    const j = (idx + (along >= 0 ? 1 : -1) + M) % M, t = Math.min(1, Math.abs(along) / T.ds);
    const cy = lerp(T.y[idx], T.y[j], t), s = lerp(T.bank[idx], T.bank[j], t);
    const a = Math.abs(lat), roadY = cy + lat * s;
    let y, surf;
    if (a <= HW) { y = roadY; surf = 0; }
    else if (a <= HW * 1.16) { y = roadY; surf = 1; }
    else { const ty = heightGrid(x, z); y = a > HW * 1.16 + 5 ? ty : lerp(roadY, Math.min(ty, roadY + 0.4), clamp((a - HW * 1.16) / 5, 0, 1)); surf = 2; }
    return { idx, lat, y, surf };
  }
  E.probe = probe;
  function newCar(i, spec, ai) {
    const T = E.T, row = Math.floor(i / 2), side = i % 2 ? 1 : -1, idx = (M - 10 - row * 9 - (i % 2) * 4 + M) % M;
    const nx = -T.tz[idx], nz = T.tx[idx], x = T.x[idx] + nx * side * 2.6, z = T.z[idx] + nz * side * 2.6;
    return { ...spec, ai, x, z, y: T.y[idx], h: Math.atan2(T.tx[idx], T.tz[idx]), vx: 0, vz: 0, idx, lat: side * 2.6, surf: 0, lap: 0, half: false,
      steer: 0, thr: 0, yawRate: 0, slip: 0, pitch: 0, roll: 0, lean: 0, spin: 0, speed: 0, lapStart: 0, best: Infinity, lapTimes: [], done: false, finish: 0, prog: idx - M,
      lane: side * 2.2, skill: ai ? 0.9 + 0.035 * i : 1, offTime: 0, wrong: 0 };
  }
  function stepCar(c, dt) {
    const T = E.T;
    const fx = Math.sin(c.h), fz = Math.cos(c.h), rx = -fz, rz = fx;
    let vf = c.vx * fx + c.vz * fz, vl = c.vx * rx + c.vz * rz;
    const pr = probe(c.x, c.z, c.idx), surf = pr.surf;
    const TU = E.tune, grip = TU.grip[surf] * c.skill, vmax = [62, 45, 27][surf] * (c.ai ? c.skill : 1), roll = [0.35, 1.2, 3.2][surf];
    // Stability assist (player only): when the wheel asks for more turn than the tyres can give at this speed, ease
    // the throttle and scrub speed, so holding full gas through a fast bend runs wide less instead of off the road.
    const sp0 = Math.abs(vf), geom0 = sp0 * Math.tan(0.6) / 2.6, lim0 = grip / Math.max(sp0, 0.5);
    // how close to the grip limit the wheel is asking for: 0 below 75% of it, 1 at full lock on the limit
    const over = c.ai || geom0 < lim0 ? 0 : TU.assist * clamp((Math.abs(c.steer) - 0.75) / 0.25, 0, 1);
    let a = 0;
    if (c.thr > 0) a = c.thr * 11.5 * Math.max(0, 1 - vf / vmax) * (1 - Math.min(1, over)) - (vf > vmax ? (vf - vmax) * 0.8 : 0);
    else if (c.thr < 0) a = vf > 0.5 ? c.thr * 17 : c.thr * 5 * (vf > -9 ? 1 : 0);
    a -= over * TU.scrub * clamp((sp0 - 12) / 25, 0, 1) * Math.sign(vf);   // gentle in slow corners, hard in fast ones
    a -= Math.sign(vf) * roll + 0.00045 * vf * Math.abs(vf);
    const hf = probe(c.x + fx * 1.4, c.z + fz * 1.4, pr.idx).y, hb = probe(c.x - fx * 1.4, c.z - fz * 1.4, pr.idx).y;
    a -= 9.81 * (hf - hb) / 2.8;
    const nvf = vf + a * dt; vf = (c.thr === 0 && Math.sign(nvf) !== Math.sign(vf) && Math.abs(vf) < 1) ? 0 : nvf;
    const sp = Math.abs(vf), geom = sp * Math.tan(0.6) / 2.6, lim = grip / Math.max(sp, 0.5);
    c.yawRate = lerp(c.yawRate, c.steer * Math.min(geom, lim * 1.06) * Math.sign(vf), 1 - Math.exp(-dt * 12));
    c.h -= c.yawRate * dt;
    vl *= Math.exp(-dt * TU.side[surf]);
    const nfx = Math.sin(c.h), nfz = Math.cos(c.h);
    c.vx = nfx * vf + -nfz * vl; c.vz = nfz * vf + nfx * vl;
    c.slip = Math.abs(vl);
    c.x += c.vx * dt; c.z += c.vz * dt;
    const p2 = probe(c.x, c.z, pr.idx);
    c.y = lerp(c.y, p2.y, 1 - Math.exp(-dt * 30)); c.surf = p2.surf; c.lat = p2.lat;
    const hl = probe(c.x + nfz * 0.9, c.z - nfx * 0.9, p2.idx).y, hr = probe(c.x - nfz * 0.9, c.z + nfx * 0.9, p2.idx).y;
    c.pitch = Math.atan2(hf - hb, 2.8); c.roll = Math.atan2(hr - hl, 1.8);
    c.lean = lerp(c.lean, clamp(c.yawRate * vf * 0.0032, -0.07, 0.07), 1 - Math.exp(-dt * 6));
    c.spin += vf * dt / 0.34;
    // laps: the start line is sample 0; a lap counts only after passing the far side of the loop
    const prev = c.idx; c.idx = p2.idx;
    if (c.idx > M * 0.4 && c.idx < M * 0.6) c.half = true;
    if (prev > M * 0.8 && c.idx < M * 0.2) { if (c.half || c.lap === 0) { c.lap++; c.half = false; onLap(c); } }
    else if (prev < M * 0.2 && c.idx > M * 0.8 && c.lap > 0) { c.lap--; c.half = true; }
    c.prog = (c.lap - 1) * M + c.idx;
    c.speed = vf;
    const tdot = nfx * T.tx[c.idx] + nfz * T.tz[c.idx]; c.wrong = tdot < -0.4 && sp > 4 ? c.wrong + dt : 0;
    c.offTime = Math.abs(c.lat) > 40 ? c.offTime + dt : 0;
    if (Math.abs(c.lat) > 120 || c.offTime > 4) respawn(c);
  }
  function respawn(c) { const T = E.T, i = c.idx; c.x = T.x[i]; c.z = T.z[i]; c.y = T.y[i]; c.h = Math.atan2(T.tx[i], T.tz[i]); c.vx = c.vz = 0; c.yawRate = 0; c.offTime = 0; c.lat = 0; }
  function collide(cars) { for (let a = 0; a < cars.length; a++) for (let b = a + 1; b < cars.length; b++) { const A = cars[a], B = cars[b], dx = B.x - A.x, dz = B.z - A.z, d = Math.hypot(dx, dz);
    if (d > 0.01 && d < 2.4) { const nx = dx / d, nz = dz / d, push = (2.4 - d) / 2; A.x -= nx * push; A.z -= nz * push; B.x += nx * push; B.z += nz * push;
      const rv = (B.vx - A.vx) * nx + (B.vz - A.vz) * nz; if (rv < 0) { const j = -rv * 0.6; A.vx -= nx * j; A.vz -= nz * j; B.vx += nx * j; B.vz += nz * j; }
      if (A === E.player || B === E.player) { E.bump = 0.25; emit("bump"); } } } }
  function drive(c, dt) {      // the AI: aim at a point down the road in its lane, throttle toward the speed plan
    const T = E.T, sp = Math.max(0, c.speed || 0), look = Math.round((9 + sp * 0.55) / T.ds), i = (c.idx + look) % M;
    c.lane = lerp(c.lane, clamp(-T.kap[(c.idx + look * 2) % M] * 260, -3.5, 3.5) + (c.name !== "You" ? (c.name.length % 3 - 1) * 1.2 : 0), dt * 0.6);
    const tx = T.x[i] + -T.tz[i] * c.lane, tz = T.z[i] + T.tx[i] * c.lane, fx = Math.sin(c.h), fz = Math.cos(c.h);
    const dx = tx - c.x, dz = tz - c.z, err = Math.atan2(fx * dz - fz * dx, fx * dx + fz * dz);
    // feed-forward: the turn rate the road needs here, as a share of what the tyres allow, plus the aim correction
    const grip = E.tune.grip[0] * c.skill, cap = Math.min(sp * Math.tan(0.6) / 2.6, grip / Math.max(sp, 0.5) * 1.06);
    const ff = sp * T.kap[(c.idx + Math.round(4 / T.ds)) % M] / Math.max(cap, 1e-3);
    c.steer = clamp(ff + err * 2.6, -1, 1);
    const target = T.vlim[(c.idx + Math.round(6 / T.ds)) % M] * (c.ai ? c.skill : 0.97);
    c.thr = clamp((target - sp) * 0.35, -1, 1);
  }
  function onLap(c) {
    if (c.lap === 1) { c.lapStart = E.raceT; return; }
    const t = E.raceT - c.lapStart; c.lapTimes.push(t); c.best = Math.min(c.best, t); c.lapStart = E.raceT;
    if (c.lap > LAPS && !c.done) { c.done = true; c.finish = E.raceT; if (c === E.player) { E.state = "done"; emit("finish", { order: rank() }); } }
    else if (c === E.player) emit("lap", { lap: c.lap, time: t });
  }
  const rank = () => E.cars.slice().sort((a, b) => (a.done && b.done) ? a.finish - b.finish : a.done ? -1 : b.done ? 1 : b.prog - a.prog);
  E.rank = rank;

  E.newRace = ({ autopilot = false } = {}) => {
    E.cars = [3, 2, 1, 0].map((k) => newCar(k, CARS[k], k !== 0));
    E.player = E.cars.find((c) => c.name === "You"); E.player.autopilot = autopilot;
    E.cam = null; E.raceT = -3.4; E.state = "countdown"; E.input = { steer: 0, thr: 0 };
  };
  E.tick = (dt) => {
    if (!E.cars) return;
    if (E.state === "countdown") {
      E.raceT += dt;
      if (E.raceT >= 0) { E.state = "race"; E.raceT = 0; for (const c of E.cars) c.lapStart = 0; emit("go"); }
      for (const c of E.cars) { c.thr = 0; c.steer = 0; }
      return;
    }
    E.raceT += dt;
    for (const c of E.cars) {
      if (c.done || c.ai || c.autopilot) { drive(c, dt); if (c.done) c.thr = Math.min(c.thr, 0.3); }
      else { c.steer = E.input.steer; c.thr = E.input.thr; }
      stepCar(c, dt);
    }
    collide(E.cars);
  };

  // ---- rendering into any texture view (the canvas, or an offscreen target in a Worker)
  let targets = null;
  function ensureTargets(w, h) {
    if (targets && targets.w === w && targets.h === h) return;
    targets?.color?.destroy(); targets?.depth.destroy();
    targets = { w, h, color: sampleCount > 1 ? device.createTexture({ size: [w, h], sampleCount, format, usage: GPUTextureUsage.RENDER_ATTACHMENT }) : null,
      depth: device.createTexture({ size: [w, h], sampleCount, format: "depth24plus", usage: GPUTextureUsage.RENDER_ATTACHMENT }) };
  }
  const carMatrices = (c) => {
    const f = [Math.sin(c.h) * Math.cos(c.pitch), Math.sin(c.pitch), Math.cos(c.h) * Math.cos(c.pitch)], right = [-Math.cos(c.h), 0, Math.sin(c.h)];
    const up = vnorm([-right[0] * Math.sin(c.roll), Math.cos(c.roll), -right[2] * Math.sin(c.roll)]);
    const bodyUp = vnorm(vadd(up, vscale(right, -c.lean)));     // the body leans out of the corner; the wheels stay planted
    const body = basis([c.x, c.y, c.z], f, bodyUp);
    const Z = vnorm(f), X = vnorm(vcross(up, Z)), Y = vcross(Z, X), wheels = [];
    for (const [ox, oz, front] of [[0.8, 1.38, 1], [-0.8, 1.38, 1], [0.8, -1.38, 0], [-0.8, -1.38, 0]]) {
      const a = front ? c.steer * 0.42 : 0, Zw = vsub(vscale(Z, Math.cos(a)), vscale(X, Math.sin(a))), Xw = vcross(Y, Zw);
      const cs = Math.cos(c.spin), sn = Math.sin(c.spin), Yr = vadd(vscale(Y, cs), vscale(Zw, sn)), Zr = vsub(vscale(Zw, cs), vscale(Y, sn));
      const mx = ox > 0 ? 1 : -1, p = vadd(vadd([c.x, c.y, c.z], vscale(X, ox)), vadd(vscale(Y, 0.34), vscale(Z, oz)));
      wheels.push([Xw[0] * mx, Xw[1] * mx, Xw[2] * mx, 0, ...Yr, 0, ...Zr, 0, ...p, 1]);
    }
    return { body, wheels };
  };
  E.carMatrices = carMatrices;
  // camera: { roll } rolls the picture (the level-horizon option); { eye, look } overrides the chase camera
  E.render = (view, w, h, dt, { roll = 0, eye = null, look = null } = {}) => {
    const { pipes, res } = E, P = E.player;
    ensureTargets(w, h);
    E.clock += dt;
    const fx = Math.sin(P.h), fz = Math.cos(P.h), sp = Math.abs(P.speed || 0);
    let camPos, at;
    if (eye) { camPos = eye; at = look; }
    else {
      const want = [P.x - fx * 7.8, P.y + 2.9, P.z - fz * 7.8];
      if (!E.cam) E.cam = want.slice();
      const k = 1 - Math.exp(-dt * 7);
      for (let i = 0; i < 3; i++) E.cam[i] = lerp(E.cam[i], want[i], k);
      const ground = probe(E.cam[0], E.cam[2], P.idx).y; E.cam[1] = Math.max(E.cam[1], ground + 1.2);
      camPos = E.cam; at = [P.x + fx * 5, P.y + 1.1, P.z + fz * 5];
    }
    const aspect = w / h, fov = (58 + sp * 0.22) * D2R * (aspect < 1 ? 1.35 : 1);
    let view4 = lookAt(camPos, at, [0, 1, 0]);
    const shake = E.bump > 0 ? Math.sin(E.clock * 60) * E.bump * 0.04 : 0; if (E.bump > 0) E.bump -= dt;
    view4 = mul(rotZ(roll + shake), view4);
    const proj = perspective(fov, aspect, 0.3, 4000), vp = mul(proj, view4), ivp = invert(vp);
    const sun = vnorm([-0.45, 0.5, -0.62]);
    const U = new Float32Array(64);
    U.set(vp, 0); U.set(ivp, 16); U.set([...camPos, E.clock], 32); U.set([...sun, 0.00105], 36);
    U.set([0.74, 0.8, 0.86, E.T.L / Math.round(E.T.L / 7)], 40); U.set([view4[0], view4[4], view4[8], E.T.L], 44); U.set([view4[1], view4[5], view4[9], 0], 48);
    device.queue.writeBuffer(E.ubuf, 0, U);
    // cars, wheels and shadows
    const ci = new Float32Array(8 * 20), wi = new Float32Array(32 * 20), bl = new Float32Array(8 * 8);
    E.cars.forEach((c, n) => { const { body, wheels } = carMatrices(c);
      ci.set([...body, ...c.colour, 1 + c.number + (c.thr < -0.05 ? 0.9 : 0)], n * 20);
      wheels.forEach((m, k) => wi.set([...m, 1, 1, 1, 0.6], (n * 4 + k) * 20));
      bl.set([c.x, c.y, c.z, c.h, 1.25, 2.7, 0.6, 0], n * 8); });
    res.car.k = E.cars.length; res.wheel.k = E.cars.length * 4;
    device.queue.writeBuffer(res.car.inst, 0, ci); device.queue.writeBuffer(res.wheel.inst, 0, wi); device.queue.writeBuffer(res.blob, 0, bl);
    // smoke and dust from the rear wheels
    const pd = new DataView(E.parts.data); let ne = 0;
    pd.setFloat32(0, dt, true); pd.setFloat32(4, E.clock, true);
    for (const c of E.cars) { const s = Math.abs(c.speed || 0), dust = c.surf === 2 ? Math.min(1, s / 15) : c.surf === 1 ? Math.min(1, s / 25) * 0.6 : 0, smoke = c.slip > 2.5 ? Math.min(1, (c.slip - 2.5) / 4) : 0;
      const rate = Math.max(dust * 1.6, smoke * 2.2); if (rate <= 0.01 || ne >= 8) continue;
      for (const sx of [-0.9, 0.9]) { if (ne >= 8) break; const fx2 = Math.sin(c.h), fz2 = Math.cos(c.h), o = 16 + ne * 32;
        [c.x - fx2 * 1.4 - fz2 * sx, c.y + 0.25, c.z - fz2 * 1.4 + fx2 * sx, rate, c.vx, 0, c.vz, dust > smoke ? 1 : 0].forEach((v, q) => pd.setFloat32(o + q * 4, v, true)); ne++; } }
    pd.setUint32(8, ne, true); pd.setUint32(12, E.frames, true);
    device.queue.writeBuffer(E.parts.ubuf, 0, E.parts.data);
    const enc = device.createCommandEncoder();
    const cp = enc.beginComputePass(); cp.setPipeline(E.parts.pipe); cp.setBindGroup(0, E.parts.bg); cp.dispatchWorkgroups(E.parts.n / 64); cp.end();
    const color = targets.color ? { view: targets.color.createView(), resolveTarget: view, storeOp: "discard" } : { view, storeOp: "store" };
    const pass = enc.beginRenderPass({ colorAttachments: [{ ...color, loadOp: "clear", clearValue: [0.74, 0.8, 0.86, 1] }],
      depthStencilAttachment: { view: targets.depth.createView(), depthLoadOp: "clear", depthStoreOp: "discard", depthClearValue: 1 } });
    pass.setBindGroup(0, E.ubg);
    pass.setPipeline(pipes.sky); pass.draw(3);
    pass.setPipeline(pipes.terrain); pass.setVertexBuffer(0, res.terrain.vb); pass.setIndexBuffer(res.terrain.ib, "uint32"); pass.drawIndexed(res.terrain.n);
    pass.setPipeline(pipes.road); pass.setVertexBuffer(0, res.road.vb); pass.setIndexBuffer(res.road.ib, "uint32"); pass.drawIndexed(res.road.n);
    pass.setPipeline(pipes.mesh);
    for (const m of [res.tree, res.board, res.gantry, res.car, res.wheel]) { if (!m.k) continue; pass.setVertexBuffer(0, m.vb); pass.setVertexBuffer(1, m.inst); pass.draw(m.n, m.k); }
    pass.setPipeline(pipes.blob); pass.setVertexBuffer(0, res.blob); pass.draw(6, E.cars.length);
    pass.setPipeline(pipes.smoke); pass.setVertexBuffer(0, E.parts.buf); pass.draw(6, E.parts.n);
    pass.end(); device.queue.submit([enc.finish()]);
    E.frames++;
  };
  E.buildWorld = buildWorld;
  return E;
}
