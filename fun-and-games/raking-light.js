// raking-light.js: relights flat SVG with WebGPU. Paint order becomes height, five compute stages build the
// relief, one fragment pass lights it. Exports the engine (Relighter) and defines the <raking-light> element.
// https://austegard.com/fun-and-games/raking-light.html  ·  source: github.com/oaustegard/experiments/tree/main/raking-light
export const PRESETS = {
  Gallery: { wall: "#d8d3ca", ambient: 0.18, skyK: 7500, exposure: 1.0, mat: "Satin",
    relief: { lift: 22, step: 6, bevel: 10, profile: 0, invert: false, grain: 0.35 },
    lights: [{ x: 0.16, y: 0.1, z: 0.55, k: 3000, power: 1.3, size: 0.06 }, { x: 0.92, y: 0.88, z: 0.9, k: 6500, power: 0.35, size: 0.22 }] },
  Raking: { wall: "#bab4a9", ambient: 0.05, skyK: 7000, exposure: 1.15, mat: "Paper",
    relief: { lift: 16, step: 5, bevel: 6, profile: 2, invert: false, grain: 0.45 },
    lights: [{ x: -0.18, y: 0.42, z: 0.07, k: 2900, power: 3.0, size: 0.03 }] },
  "Golden hour": { wall: "#c9b8a3", ambient: 0.12, skyK: 9500, exposure: 1.0, mat: "Enamel",
    relief: { lift: 26, step: 7, bevel: 14, profile: 0, invert: false, grain: 0.2 },
    lights: [{ x: 1.15, y: 0.78, z: 0.17, k: 2100, power: 2.4, size: 0.05 }, { x: 0.15, y: -0.05, z: 0.75, k: 11000, power: 0.4, size: 0.3 }] },
  Overcast: { wall: "#d3d7da", ambient: 0.42, skyK: 7000, exposure: 1.0, mat: "Clay",
    relief: { lift: 20, step: 8, bevel: 18, profile: 2, invert: false, grain: 0.5 },
    lights: [{ x: 0.5, y: 0.25, z: 1.0, k: 6500, power: 1.0, size: 0.25 }] },
  Letterpress: { wall: "#e2dccf", ambient: 0.2, skyK: 7500, exposure: 1.05, mat: "Paper",
    relief: { lift: 10, step: 5, bevel: 4, profile: 3, invert: true, grain: 0.8 },
    lights: [{ x: 0.04, y: 0.08, z: 0.22, k: 4000, power: 1.9, size: 0.04 }] },
  Studio: { wall: "#2b2d33", ambient: 0.08, skyK: 8000, exposure: 1.1, mat: "Metal",
    relief: { lift: 24, step: 7, bevel: 12, profile: 0, invert: false, grain: 0.15 },
    lights: [{ x: 0.22, y: 0.18, z: 0.45, k: 5200, power: 1.6, size: 0.05 }, { x: 1.1, y: 0.15, z: 0.12, k: 3200, power: 1.6, size: 0.04 }, { x: 0.6, y: 1.1, z: 0.5, k: 7500, power: 0.4, size: 0.2 }] },
};
export const MATERIALS = {
  Paper: { rough: 0.9, metal: 0, spec: 0.25 },
  Satin: { rough: 0.5, metal: 0, spec: 0.6 },
  Enamel: { rough: 0.17, metal: 0, spec: 1.0 },
  Metal: { rough: 0.34, metal: 1, spec: 1.0 },
  Clay: { rough: 0.78, metal: 0, spec: 0.2 },
};
export const PROFILES = ["Round", "Chamfer", "Pillow", "Cove"];
/* ---------- color helpers ---------- */
const s2l = c => c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export function hexLin(hex) { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => s2l(v / 255)); }
export function kelvinSRGB(K) {
  const t = clamp(K, 1000, 40000) / 100;
  const r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592);
  const g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  return [r, g, b].map(v => clamp(v, 0, 255) / 255);
}
export function kelvinLin(K) { const c = kelvinSRGB(K).map(s2l); const y = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; return c.map(v => v / y); }
export const kelvinCSS = K => `rgb(${kelvinSRGB(K).map(v => Math.round(v * 255)).join(" ")})`;
export const KELVIN_TRACK = `linear-gradient(90deg, ${[1800, 2700, 3600, 4600, 5600, 6500, 8000, 10000, 12000].map(kelvinCSS).join(", ")})`;

/* ---------- SVG handling ---------- */
export function normalizeSVG(text) {
  text = text.trim().replace(/&nbsp;/g, "&#160;");
  if (!/<svg\b[^>]*\sxmlns=/i.test(text)) text = text.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  if (/xlink:/.test(text) && !/xmlns:xlink=/.test(text)) text = text.replace(/<svg\b/i, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  const doc = new DOMParser().parseFromString(text, "image/svg+xml");
  const svg = doc.documentElement;
  if (doc.querySelector("parsererror") || svg.nodeName.toLowerCase() !== "svg") throw new Error("That markup is not a valid SVG document.");
  doc.querySelectorAll("script, foreignObject").forEach(e => e.remove());
  doc.querySelectorAll("*").forEach(e => { for (const a of [...e.attributes]) if (/^on/i.test(a.name)) e.removeAttribute(a.name); });
  let w, h;
  const vb = (svg.getAttribute("viewBox") || "").trim().split(/[\s,]+/).map(Number);
  if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) { w = vb[2]; h = vb[3]; }
  else {
    w = parseFloat(svg.getAttribute("width")) || 800; h = parseFloat(svg.getAttribute("height")) || 600;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  }
  return { text: new XMLSerializer().serializeToString(svg), w, h };
}
export const LAYER_A = 0.2; // each painted shape adds 20% white: v = 1 - 0.8^k recovers the stack depth k
export function heightSVG(text) {
  const host = document.createElement("div");
  host.style.cssText = "position:absolute;left:-99999px;top:0;width:10px;height:10px;overflow:hidden;visibility:hidden";
  host.innerHTML = text;
  document.body.appendChild(host);
  const svg = host.querySelector("svg");
  const shapes = svg.querySelectorAll("path,rect,circle,ellipse,polygon,polyline,line,text,tspan,textPath,use,image");
  const none = c => !c || c === "none" || /rgba\([^)]*,\s*0\)$/.test(c);
  const plan = [];
  for (const el of shapes) {
    if (el.closest("defs,clipPath,mask,pattern,marker,symbol")) continue;
    const cs = getComputedStyle(el);
    const isImg = el.tagName.toLowerCase() === "image";
    plan.push([el, isImg || (!none(cs.fill) && parseFloat(cs.fillOpacity) > 0.02), !isImg && !none(cs.stroke) && parseFloat(cs.strokeWidth) > 0]);
  }
  for (const [el, f, s] of plan) {
    if (el.tagName.toLowerCase() === "image") {
      const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      for (const a of ["x", "y", "width", "height", "transform"]) if (el.hasAttribute(a)) r.setAttribute(a, el.getAttribute(a));
      el.replaceWith(r); el = r;
    }
    const st = el.style;
    st.setProperty("fill", f ? "#fff" : "none", "important");
    st.setProperty("fill-opacity", String(LAYER_A), "important");
    st.setProperty("stroke", s ? "#fff" : "none", "important");
    st.setProperty("stroke-opacity", String(LAYER_A), "important");
  }
  svg.querySelectorAll("*").forEach(e => { e.style.setProperty("opacity", "1", "important"); e.style.setProperty("filter", "none", "important"); });
  svg.style.setProperty("opacity", "1", "important");
  const out = new XMLSerializer().serializeToString(svg);
  host.remove();
  return out;
}
export async function svgImage(text, w, h) {
  const doc = new DOMParser().parseFromString(text, "image/svg+xml");
  const svg = doc.documentElement;
  svg.setAttribute("width", w); svg.setAttribute("height", h);
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" }));
  try { const img = new Image(); img.src = url; await img.decode(); return img; }
  finally { setTimeout(() => URL.revokeObjectURL(url), 1000); }
}

/* Stage: content fitted into an 820px-long box with a wall margin for shadows to land on. */
export async function buildStage(src, { margin = 0.124 } = {}) {
  let cw, ch, ar, albedoImg, heightImg = null, mode = 0;
  if (src.kind === "svg") {
    const n = normalizeSVG(src.text);
    ar = n.w / n.h;
    cw = Math.round(ar >= 1 ? 820 : 820 * ar); ch = Math.round(ar >= 1 ? 820 / ar : 820);
    albedoImg = await svgImage(n.text, cw, ch);
    heightImg = await svgImage(heightSVG(n.text), cw, ch);
  } else {
    albedoImg = src.bitmap; ar = albedoImg.width / albedoImg.height; mode = 1;
    cw = Math.round(ar >= 1 ? 820 : 820 * ar); ch = Math.round(ar >= 1 ? 820 / ar : 820);
  }
  const m = Math.round(820 * margin), W = cw + 2 * m, H = ch + 2 * m;
  const alb = document.createElement("canvas"); alb.width = W; alb.height = H;
  alb.getContext("2d", { willReadFrequently: true }).drawImage(albedoImg, m, m, cw, ch);
  const hc = document.createElement("canvas"); hc.width = W; hc.height = H;
  const hx = hc.getContext("2d", { willReadFrequently: true }); hx.fillStyle = "#000"; hx.fillRect(0, 0, W, H);
  if (heightImg) hx.drawImage(heightImg, m, m, cw, ch);
  return { W, H, alb, hc, mode, albData: alb.getContext("2d").getImageData(0, 0, W, H).data, hcData: hx.getImageData(0, 0, W, H).data };
}

/* ---------- WGSL ---------- */
const WGSL_P = /* wgsl */`
struct P { size: vec2f, lift: f32, stepH: f32, bevel: f32, profile: f32, invert: f32, grain: f32,
  mode: f32, alphaA: f32, jstep: f32, grainScale: f32, smoothR: f32, p0: f32, p1: f32, p2: f32 }
@group(0) @binding(0) var<uniform> u: P;
fn inb(p: vec2i) -> bool { return p.x >= 0 && p.y >= 0 && p.x < i32(u.size.x) && p.y < i32(u.size.y); }
fn cl(p: vec2i) -> vec2i { return clamp(p, vec2i(0), vec2i(u.size) - 1); }
`;
const WGSL_LAYERS = WGSL_P + `
@group(0) @binding(1) var hsrc: texture_2d<f32>;
@group(0) @binding(2) var alb: texture_2d<f32>;
@group(0) @binding(3) var outH: texture_storage_2d<r32float, write>;
@compute @workgroup_size(8, 8) fn main(@builtin(global_invocation_id) id: vec3u) {
  let p = vec2i(id.xy); if (!inb(p)) { return; }
  var h = 0.0;
  if (u.mode < 0.5) {
    let v = textureLoad(hsrc, p, 0).r;
    let k = log(max(1.0 - v, 1e-4)) / log(1.0 - u.alphaA);
    let base = u.lift * clamp(k, 0.0, 1.0);
    let extra = u.stepH * max(k - 1.0, 0.0);
    h = select(base + extra, base - extra, u.invert > 0.5);
  } else {
    let a = textureLoad(alb, p, 0);
    let l = sqrt(dot(a.rgb, vec3f(0.2126, 0.7152, 0.0722)));
    let t = select(l, 1.0 - l, u.invert > 0.5);
    h = a.a * (u.lift + t * u.stepH * 3.0);
  }
  textureStore(outH, p, vec4f(h, 0.0, 0.0, 1.0));
}`;
const WGSL_SEED = WGSL_P + `
@group(0) @binding(1) var h0: texture_2d<f32>;
@group(0) @binding(2) var outS: texture_storage_2d<rgba32float, write>;
fn ld(p: vec2i) -> f32 { return textureLoad(h0, cl(p), 0).r; }
@compute @workgroup_size(8, 8) fn main(@builtin(global_invocation_id) id: vec3u) {
  let p = vec2i(id.xy); if (!inb(p)) { return; }
  let c = ld(p);
  let n4 = min(min(ld(p + vec2i(1, 0)), ld(p - vec2i(1, 0))), min(ld(p + vec2i(0, 1)), ld(p - vec2i(0, 1))));
  var o = vec4f(0.0);
  if (c - n4 > 0.15) {
    var lo = c;
    for (var y = -2; y <= 2; y++) { for (var x = -2; x <= 2; x++) { lo = min(lo, ld(p + vec2i(x, y))); } }
    o = vec4f(f32(p.x), f32(p.y), lo, 1.0);
  }
  textureStore(outS, p, o);
}`;
const WGSL_JFA = WGSL_P + `
@group(0) @binding(1) var inS: texture_2d<f32>;
@group(0) @binding(2) var outS: texture_storage_2d<rgba32float, write>;
@compute @workgroup_size(8, 8) fn main(@builtin(global_invocation_id) id: vec3u) {
  let p = vec2i(id.xy); if (!inb(p)) { return; }
  var best = textureLoad(inS, p, 0);
  var bd = 1e20;
  if (best.w > 0.5) { bd = distance(vec2f(p), best.xy); }
  let s = i32(u.jstep);
  for (var y = -1; y <= 1; y++) { for (var x = -1; x <= 1; x++) {
    let q = p + vec2i(x, y) * s;
    if (!inb(q)) { continue; }
    let c = textureLoad(inS, q, 0);
    if (c.w > 0.5) { let d = distance(vec2f(p), c.xy); if (d < bd) { bd = d; best = c; } }
  } }
  textureStore(outS, p, best);
}`;
const WGSL_RELIEF = WGSL_P + `
@group(0) @binding(1) var h0: texture_2d<f32>;
@group(0) @binding(2) var jf: texture_2d<f32>;
@group(0) @binding(3) var outR: texture_storage_2d<r32float, write>;
fn prof(t: f32) -> f32 {
  if (u.profile < 0.5) { return sqrt(max(0.0, 1.0 - (1.0 - t) * (1.0 - t))); }
  if (u.profile < 1.5) { return t; }
  if (u.profile < 2.5) { return t * t * (3.0 - 2.0 * t); }
  return 1.0 - sqrt(max(0.0, 1.0 - t * t));
}
@compute @workgroup_size(8, 8) fn main(@builtin(global_invocation_id) id: vec3u) {
  let p = vec2i(id.xy); if (!inb(p)) { return; }
  let H = textureLoad(h0, p, 0).r;
  let s = textureLoad(jf, p, 0);
  var h = H;
  if (s.w > 0.5 && u.bevel > 0.5 && H > s.z + 0.01) {
    let t = clamp(distance(vec2f(p), s.xy) / u.bevel, 0.0, 1.0);
    h = s.z + (H - s.z) * prof(t);
  }
  textureStore(outR, p, vec4f(h, 0.0, 0.0, 1.0));
}`;
const WGSL_BAKE = WGSL_P + `
@group(0) @binding(1) var rel: texture_2d<f32>;
@group(0) @binding(2) var outB: texture_storage_2d<rgba16float, write>;
fn rl(p: vec2i) -> f32 { return textureLoad(rel, cl(p), 0).r; }
fn hash(p: vec2f) -> f32 {
  let v = vec2u(vec2i(p) + vec2i(65536));
  var h = v.x * 1664525u + v.y * 1013904223u + 374761393u;
  h = h ^ (h >> 16u); h = h * 2246822519u; h = h ^ (h >> 13u); h = h * 3266489917u; h = h ^ (h >> 16u);
  return f32(h) / 4294967295.0;
}
fn vnoise(p: vec2f) -> f32 {
  let i = floor(p); let f = fract(p); let w = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2f(1.0, 0.0)), w.x), mix(hash(i + vec2f(0.0, 1.0)), hash(i + vec2f(1.0, 1.0)), w.x), w.y);
}
fn grainAt(p: vec2f) -> f32 {
  let q = p / max(u.grainScale, 0.5);
  return vnoise(q) * 0.6 + vnoise(q * 2.13 + 17.0) * 0.3 + vnoise(q * 4.7 + 3.0) * 0.1 - 0.5;
}
fn hg(p: vec2i) -> f32 { return rl(p) + u.grain * grainAt(vec2f(p)); }
@compute @workgroup_size(8, 8) fn main(@builtin(global_invocation_id) id: vec3u) {
  let p = vec2i(id.xy); if (!inb(p)) { return; }
  let r = max(1, i32(u.smoothR));
  let fr = f32(2 * r);
  let dx = (hg(p + vec2i(r, 0)) - hg(p - vec2i(r, 0))) * 2.0 + (hg(p + vec2i(r, r)) - hg(p + vec2i(-r, r))) + (hg(p + vec2i(r, -r)) - hg(p + vec2i(-r, -r)));
  let dy = (hg(p + vec2i(0, r)) - hg(p - vec2i(0, r))) * 2.0 + (hg(p + vec2i(r, r)) - hg(p + vec2i(r, -r))) + (hg(p + vec2i(-r, r)) - hg(p + vec2i(-r, -r)));
  let n = normalize(vec3f(-dx / (4.0 * fr), -dy / (4.0 * fr), 1.0));
  let h = rl(p);
  var occ = 0.0;
  for (var i = 0; i < 12; i++) {
    let a = f32(i) * 0.5235988 + 0.26;
    let d = vec2f(cos(a), sin(a));
    var ms = 0.0; var rad = 2.0;
    for (var j = 0; j < 7; j++) {
      let q = vec2i(round(vec2f(p) + d * rad));
      ms = max(ms, (rl(q) - h) / rad);
      rad = rad * 1.85;
    }
    occ += ms / sqrt(1.0 + ms * ms);
  }
  textureStore(outB, p, vec4f(n.x, n.y, h, 1.0 - occ / 12.0));
}`;
const WGSL_RENDER = /* wgsl */`
struct Light { pos: vec4f, col: vec4f }
struct U { size: vec4f, wall: vec4f, sky: vec4f, ground: vec4f, mat: vec4f, misc: vec4f, lights: array<Light, 4> }
@group(0) @binding(0) var<uniform> u: U;
@group(0) @binding(1) var smp: sampler;
@group(0) @binding(2) var bake: texture_2d<f32>;
@group(0) @binding(3) var alb: texture_2d<f32>;
struct VO { @builtin(position) pos: vec4f, @location(0) uv: vec2f }
@vertex fn vs(@builtin(vertex_index) i: u32) -> VO {
  var p = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  var o: VO;
  o.pos = vec4f(p[i], 0.0, 1.0);
  o.uv = vec2f((p[i].x + 1.0) * 0.5, (1.0 - p[i].y) * 0.5);
  return o;
}
fn toSrgb(c: vec3f) -> vec3f {
  let x = clamp(c, vec3f(0.0), vec3f(1.0));
  return select(1.055 * pow(x, vec3f(1.0 / 2.4)) - 0.055, x * 12.92, x <= vec3f(0.0031308));
}
fn aces(x: vec3f) -> vec3f { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), vec3f(0.0), vec3f(1.0)); }
fn heightAt(q: vec2f) -> f32 { return textureSampleLevel(bake, smp, q / u.size.xy, 0.0).z; }
fn shadow(P: vec3f, L: vec3f, alpha: f32) -> f32 {
  let d = L - P;
  let lxy = length(d.xy);
  if (lxy < 0.5) { return 1.0; }
  let dir = d.xy / lxy;
  let slope = d.z / lxy;
  let eL = atan(slope);
  var occ = -1e3;
  var t = 1.5;
  let maxT = min(lxy, u.size.x * 0.8);
  for (var i = 0; i < 80; i++) {
    if (t >= maxT) { break; }
    if (P.z + slope * t > u.mat.z + 1.0) { break; }
    let th = heightAt(P.xy + dir * t);
    occ = max(occ, (th - P.z) / t);
    if (atan(occ) > eL + alpha) { return 0.0; }
    t += clamp(t * 0.07, 0.6, 9.0);
  }
  let v = clamp(0.5 + (eL - atan(occ)) / (2.0 * alpha), 0.0, 1.0);
  return v * v * (3.0 - 2.0 * v);
}
@fragment fn fs(i: VO) -> @location(0) vec4f {
  let uv = i.uv;
  let a = textureSample(alb, smp, uv);
  let b = textureSample(bake, smp, uv);
  let base = mix(u.wall.rgb, a.rgb, a.a);
  let clear = u.misc.w > 0.5;
  if (uv.x < u.misc.x) {
    if (clear) { return vec4f(toSrgb(a.rgb) * a.a, a.a); }
    return vec4f(toSrgb(base), 1.0);
  }
  let N = normalize(vec3f(b.x, b.y, sqrt(max(0.0, 1.0 - b.x * b.x - b.y * b.y))));
  let P = vec3f(uv * u.size.xy, b.z);
  let V = vec3f(0.0, 0.0, 1.0);
  let rough = max(u.ground.w, 0.04);
  let metal = u.mat.x;
  let F0 = mix(vec3f(0.04 * u.mat.y * 2.0), base, metal);
  let diffC = base * (1.0 - metal);
  let ao = clamp(b.w, 0.0, 1.0);
  let hemi = mix(u.ground.rgb, u.sky.rgb, N.z * 0.5 + 0.5);
  let amb = diffC * hemi * u.wall.w + F0 * u.sky.rgb * u.wall.w * 0.15;
  var col = amb * ao;
  var unsh = amb;
  let W2 = u.size.x * u.size.x;
  let a2 = rough * rough * rough * rough;
  let kG = (rough + 1.0) * (rough + 1.0) / 8.0;
  let NV = max(N.z, 1e-3);
  for (var k = 0; k < i32(u.misc.z); k++) {
    let Lp = u.lights[k].pos.xyz;
    let Ld = Lp - P;
    let dist = length(Ld);
    let L = Ld / dist;
    let NL = dot(N, L);
    if (NL <= 0.0) { continue; }
    let att = u.lights[k].pos.w * W2 / (W2 * 0.6 + dist * dist);
    let sh = shadow(P, Lp, u.lights[k].col.w);
    let H = normalize(L + V);
    let NH = max(dot(N, H), 0.0);
    let VH = max(dot(V, H), 0.0);
    let dd = NH * NH * (a2 - 1.0) + 1.0;
    let D = a2 / (3.14159 * dd * dd);
    let G = (NL / (NL * (1.0 - kG) + kG)) * (NV / (NV * (1.0 - kG) + kG));
    let F = F0 + (1.0 - F0) * pow(1.0 - VH, 5.0);
    let spec = min(D * G * F / (4.0 * NL * NV) * 3.14159, vec3f(40.0));
    let c = (diffC * (1.0 - F) + spec) * u.lights[k].col.rgb * att * NL;
    col += c * sh;
    unsh += c;
  }
  let n = fract(sin(dot(i.pos.xy, vec2f(12.9898, 78.233)) + u.misc.y) * 43758.5453);
  let lit = clamp(toSrgb(aces(col * u.sky.w)) + (n - 0.5) / 255.0, vec3f(0.0), vec3f(1.0));
  if (clear) {
    let lw = vec3f(0.2126, 0.7152, 0.0722);
    let sA = 1.0 - clamp(dot(col, lw) / max(dot(unsh, lw), 1e-5), 0.0, 1.0);
    return vec4f(lit * a.a, a.a + (1.0 - a.a) * sA);
  }
  return vec4f(lit, 1.0);
}`;

/* ---------- shared GPU: one device and one set of pipelines for every canvas on the page ---------- */
const JSTEPS = [64, 32, 16, 8, 4, 2, 1, 1];
let gpuPromise = null;
/** Resolves to the shared GPU context, or null when WebGPU is unavailable. */
export function getGPU() {
  if (!gpuPromise) gpuPromise = initGPU().catch(e => { console.error("raking-light:", e); return null; });
  return gpuPromise;
}
async function initGPU() {
  if (!navigator.gpu) return null;
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) return null;
  const device = await adapter.requestDevice();
  const G = { device, format: navigator.gpu.getPreferredCanvasFormat(), lost: false, onLost: new Set() };
  device.lost.then(info => { G.lost = true; gpuPromise = null; G.onLost.forEach(f => f(info)); });
  device.addEventListener("uncapturederror", e => console.error("raking-light:", e.error.message));
  const C = GPUShaderStage.COMPUTE, F = GPUShaderStage.FRAGMENT;
  const uni = { buffer: { type: "uniform" } };
  const unf = { texture: { sampleType: "unfilterable-float" } };
  const sto = f => ({ storageTexture: { access: "write-only", format: f } });
  const layout = (vis, list) => device.createBindGroupLayout({ entries: list.map((r, i) => ({ binding: i, visibility: vis, ...r })) });
  async function module(code, name) {
    const m = device.createShaderModule({ code });
    for (const msg of (await m.getCompilationInfo()).messages) if (msg.type === "error") throw new Error(`WGSL ${name} ${msg.lineNum}:${msg.linePos} ${msg.message}`);
    return m;
  }
  async function comp(code, lay, name) {
    return device.createComputePipelineAsync({ layout: device.createPipelineLayout({ bindGroupLayouts: [lay] }), compute: { module: await module(code, name), entryPoint: "main" } });
  }
  const L = {
    layers: layout(C, [uni, unf, unf, sto("r32float")]),
    seed: layout(C, [uni, unf, sto("rgba32float")]),
    jfa: layout(C, [uni, unf, sto("rgba32float")]),
    relief: layout(C, [uni, unf, unf, sto("r32float")]),
    bake: layout(C, [uni, unf, sto("rgba16float")]),
    render: layout(F, [uni, { sampler: { type: "filtering" } }, { texture: { sampleType: "float" } }, { texture: { sampleType: "float" } }]),
  };
  const rmod = await module(WGSL_RENDER, "render");
  const [layers, seed, jfa, relief, bake, render] = await Promise.all([
    comp(WGSL_LAYERS, L.layers, "layers"), comp(WGSL_SEED, L.seed, "seed"), comp(WGSL_JFA, L.jfa, "jfa"),
    comp(WGSL_RELIEF, L.relief, "relief"), comp(WGSL_BAKE, L.bake, "bake"),
    device.createRenderPipelineAsync({
      layout: device.createPipelineLayout({ bindGroupLayouts: [L.render] }),
      vertex: { module: rmod, entryPoint: "vs" },
      fragment: { module: rmod, entryPoint: "fs", targets: [{ format: G.format }] },
      primitive: { topology: "triangle-list" },
    })]);
  G.L = L; G.pipe = { layers, seed, jfa, relief, bake, render };
  G.sampler = device.createSampler({ magFilter: "linear", minFilter: "linear", addressModeU: "clamp-to-edge", addressModeV: "clamp-to-edge" });
  return G;
}

export function newLight(o) { return Object.assign({ x: 0.2, y: 0.15, z: 0.5, k: 4000, power: 1.2, size: 0.06 }, o); }

/**
 * One relit picture on one canvas. cfg = { relief, mat, room: { wall, transparent, ambient, skyK, exposure }, lights, wipe }.
 * Keeps only the colour and baked relief textures between bakes; the bake's working textures are freed after each run.
 */
export class Relighter {
  static async create(canvas) { const G = await getGPU(); return G ? new Relighter(G, canvas) : null; }
  constructor(G, canvas) {
    this.G = G; this.canvas = canvas; this.stage = null; this.tex = null;
    this.ctx = canvas.getContext("webgpu");
    this.ctx.configure({ device: G.device, format: G.format, alphaMode: "premultiplied" });
    const UB = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST, d = G.device;
    this.bakeU = d.createBuffer({ size: 64, usage: UB });
    this.jfaU = JSTEPS.map(() => d.createBuffer({ size: 64, usage: UB }));
    this.renderU = d.createBuffer({ size: 224, usage: UB });
    this.RU = new Float32Array(56);
  }
  async setSource(src, opts) { const st = await buildStage(src, opts); this.useStage(st); return st; }
  useStage(st) {
    const { device } = this.G, U = GPUTextureUsage, size = [st.W, st.H];
    if (this.tex) Object.values(this.tex).forEach(t => t.destroy());
    this.tex = {
      alb: device.createTexture({ size, format: "rgba8unorm-srgb", usage: U.TEXTURE_BINDING | U.COPY_DST }),
      bake: device.createTexture({ size, format: "rgba16float", usage: U.STORAGE_BINDING | U.TEXTURE_BINDING }),
    };
    device.queue.writeTexture({ texture: this.tex.alb }, st.albData, { bytesPerRow: st.W * 4 }, size);
    this.renderGroup = device.createBindGroup({ layout: this.G.L.render, entries: [
      { binding: 0, resource: { buffer: this.renderU } }, { binding: 1, resource: this.G.sampler },
      { binding: 2, resource: this.tex.bake.createView() }, { binding: 3, resource: this.tex.alb.createView() }] });
    this.stage = st;
  }
  bake(cfg) {
    const st = this.stage, { device } = this.G, U = GPUTextureUsage, size = [st.W, st.H], r = cfg.relief;
    const mk = (format, usage = U.STORAGE_BINDING | U.TEXTURE_BINDING) => device.createTexture({ size, format, usage });
    const T = { hsrc: mk("rgba8unorm", U.TEXTURE_BINDING | U.COPY_DST), h0: mk("r32float"), sA: mk("rgba32float"), sB: mk("rgba32float"), rel: mk("r32float") };
    device.queue.writeTexture({ texture: T.hsrc }, st.hcData, { bytesPerRow: st.W * 4 }, size);
    const raster = st.mode === 1;
    const params = j => new Float32Array([st.W, st.H, r.lift, r.step, raster ? 0 : r.bevel, r.profile, r.invert ? 1 : 0, r.grain,
      st.mode, LAYER_A, j, r.grainScale ?? 3, raster ? 2 : 1, 0, 0, 0]);
    device.queue.writeBuffer(this.bakeU, 0, params(1));
    JSTEPS.forEach((s, i) => device.queue.writeBuffer(this.jfaU[i], 0, params(s)));
    const v = t => t.createView();
    const bg = (lay, res) => device.createBindGroup({ layout: lay, entries: res.map((x, i) => ({ binding: i, resource: x })) });
    const L = this.G.L, P = this.G.pipe, bu = { buffer: this.bakeU };
    const enc = device.createCommandEncoder();
    const wx = Math.ceil(st.W / 8), wy = Math.ceil(st.H / 8);
    const run = (pipe, group) => { const p = enc.beginComputePass(); p.setPipeline(pipe); p.setBindGroup(0, group); p.dispatchWorkgroups(wx, wy); p.end(); };
    run(P.layers, bg(L.layers, [bu, v(T.hsrc), v(this.tex.alb), v(T.h0)]));
    run(P.seed, bg(L.seed, [bu, v(T.h0), v(T.sA)]));
    JSTEPS.forEach((_, i) => run(P.jfa, bg(L.jfa, i % 2 === 0
      ? [{ buffer: this.jfaU[i] }, v(T.sA), v(T.sB)] : [{ buffer: this.jfaU[i] }, v(T.sB), v(T.sA)])));
    run(P.relief, bg(L.relief, [bu, v(T.h0), v(JSTEPS.length % 2 === 0 ? T.sA : T.sB), v(T.rel)]));
    run(P.bake, bg(L.bake, [bu, v(T.rel), v(this.tex.bake)]));
    device.queue.submit([enc.finish()]);
    device.queue.onSubmittedWorkDone().then(() => Object.values(T).forEach(t => t.destroy()));
  }
  writeUniforms(cfg, t) {
    const st = this.stage, r = cfg.room, rl = cfg.relief;
    const clear = !!r.transparent || r.wall === "transparent";
    const wall = clear ? hexLin("#808080") : hexLin(r.wall);
    const maxH = (rl.invert ? rl.lift : rl.lift + rl.step * 9) + rl.grain;
    const lights = cfg.lights.slice(0, 4);
    this.RU.set([st.W, st.H, 0, 0, ...wall, r.ambient, ...kelvinLin(r.skyK), r.exposure, ...wall.map(c => c * 0.6), cfg.mat.rough,
      cfg.mat.metal, cfg.mat.spec, maxH, 0, cfg.wipe ?? -1, t % 1000, lights.length, clear ? 1 : 0]);
    lights.forEach((l, i) => this.RU.set([l.x * st.W, l.y * st.H, l.z * st.W, l.power, ...kelvinLin(l.k), l.size], 24 + i * 8));
    this.G.device.queue.writeBuffer(this.renderU, 0, this.RU);
  }
  draw(view) {
    const enc = this.G.device.createCommandEncoder();
    const pass = enc.beginRenderPass({ colorAttachments: [{ view, loadOp: "clear", storeOp: "store", clearValue: { r: 0, g: 0, b: 0, a: 0 } }] });
    pass.setPipeline(this.G.pipe.render); pass.setBindGroup(0, this.renderGroup); pass.draw(3); pass.end();
    this.G.device.queue.submit([enc.finish()]);
  }
  render(cfg, t = 0) { this.writeUniforms(cfg, t); this.draw(this.ctx.getCurrentTexture().createView()); }
  /** Renders at the stage's own resolution and returns a 2D canvas (straight alpha) for toBlob or drawing. */
  async snapshot(cfg) {
    const st = this.stage, { device, format } = this.G, W = st.W, H = st.H;
    const tex = device.createTexture({ size: [W, H], format, usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC });
    this.writeUniforms({ ...cfg, wipe: -1 }, 0);
    this.draw(tex.createView());
    const bpr = Math.ceil(W * 4 / 256) * 256;
    const buf = device.createBuffer({ size: bpr * H, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
    const enc = device.createCommandEncoder();
    enc.copyTextureToBuffer({ texture: tex }, { buffer: buf, bytesPerRow: bpr }, [W, H]);
    device.queue.submit([enc.finish()]);
    await buf.mapAsync(GPUMapMode.READ);
    const src = new Uint8Array(buf.getMappedRange()), bgra = format.startsWith("bgra");
    const out = document.createElement("canvas"); out.width = W; out.height = H;
    const x = out.getContext("2d"), img = x.createImageData(W, H), d = img.data;
    for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) {
      const s = y * bpr + i * 4, o = (y * W + i) * 4, a = src[s + 3], k = a ? 255 / a : 0;
      d[o] = Math.min(255, src[s + (bgra ? 2 : 0)] * k); d[o + 1] = Math.min(255, src[s + 1] * k); d[o + 2] = Math.min(255, src[s + (bgra ? 0 : 2)] * k); d[o + 3] = a;
    }
    x.putImageData(img, 0, 0);
    buf.unmap(); buf.destroy(); tex.destroy();
    return out;
  }
  destroy() {
    if (this.tex) Object.values(this.tex).forEach(t => t.destroy());
    [this.bakeU, this.renderU, ...this.jfaU].forEach(b => b.destroy());
    try { this.ctx.unconfigure(); } catch (e) { /* already gone */ }
    this.tex = null;
  }
}

/* ---------- <raking-light> ---------- */
const pick = (obj, name) => name && Object.keys(obj).find(k => k.toLowerCase() === name.trim().toLowerCase());
const queue = new Set();
let rafPending = false;
function schedule(el) {
  queue.add(el);
  if (!rafPending) { rafPending = true; requestAnimationFrame(now => { rafPending = false; const els = [...queue]; queue.clear(); els.forEach(e => e.frame(now)); }); }
}
const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

class RakingLightElement extends HTMLElement {
  static observedAttributes = ["src", "margin", "preset", "lighting", "material", "elevation", "step", "bevel", "profile", "grain", "grain-size", "deboss",
    "roughness", "metal", "specular", "ambient", "sky", "exposure", "wall", "light", "lights"];
  constructor() {
    super();
    this.root = this.attachShadow({ mode: "open" });
    this.root.innerHTML = `<style>
      :host { display: block; position: relative; max-width: 100%; }
      canvas { display: block; width: 100%; height: auto; }
      .fb img, ::slotted(svg) { display: block; width: 100%; height: auto; }
    </style><canvas part="canvas" aria-hidden="true" hidden></canvas><div class="fb" hidden><slot></slot></div>`;
    this.canvas = this.root.querySelector("canvas");
    this.fb = this.root.querySelector(".fb");
    this.visible = true; this.needBake = false; this.t0 = performance.now();
    this.onPointer = e => this.pointerLight(e.clientX, e.clientY);
    this.onTilt = e => { if (e.gamma == null || !this.cfg) return; this.aim(0.5 + e.gamma / 60, 0.5 + (e.beta - 40) / 60); };
  }
  connectedCallback() {
    if (!this.hasAttribute("role")) this.setAttribute("role", "img");
    this.start();
  }
  disconnectedCallback() {
    this.unbindLight();
    this.io?.disconnect(); this.ro?.disconnect();
    this.R?.destroy(); this.R = null; this.started = false; this.ready = false;
  }
  attributeChangedCallback(name, oldV, newV) {
    if (!this.ready || oldV === newV) return;
    if (name === "src" || name === "margin") return this.load();
    this.cfg = this.readCfg(); this.needBake = true;
    if (name === "light") this.bindLight();
    schedule(this);
  }
  num(name, d) { const v = parseFloat(this.getAttribute(name)); return Number.isFinite(v) ? v : d; }
  readCfg() {
    const p = PRESETS[pick(PRESETS, this.getAttribute("preset")) || "Gallery"];
    const r = { ...p.relief, grainScale: 3 };
    r.lift = this.num("elevation", r.lift); r.step = this.num("step", r.step); r.bevel = this.num("bevel", r.bevel);
    r.grain = this.num("grain", r.grain); r.grainScale = this.num("grain-size", r.grainScale);
    const prof = PROFILES.findIndex(n => n.toLowerCase() === (this.getAttribute("profile") || "").toLowerCase());
    if (prof >= 0) r.profile = prof;
    if (this.hasAttribute("deboss")) r.invert = this.getAttribute("deboss") !== "false";
    const m = { ...MATERIALS[pick(MATERIALS, this.getAttribute("material")) || p.mat] };
    m.rough = this.num("roughness", m.rough); m.metal = this.num("metal", m.metal); m.spec = this.num("specular", m.spec);
    // Lighting (lights, ambient, sky, exposure) can come from a different setup than the rest of the look.
    // `lights` takes a JSON array, or a setup name as a shorthand for `lighting`.
    const rawLights = (this.getAttribute("lights") || "").trim();
    let custom = null;
    if (rawLights.startsWith("[")) { try { const j = JSON.parse(rawLights); if (Array.isArray(j) && j.length) custom = j; } catch (e) { /* ignore malformed JSON */ } }
    const lp = PRESETS[pick(PRESETS, this.getAttribute("lighting")) || (!custom && pick(PRESETS, rawLights))] || p;
    const room = { wall: this.getAttribute("wall") || "transparent", ambient: this.num("ambient", lp.ambient), skyK: this.num("sky", lp.skyK), exposure: this.num("exposure", lp.exposure) };
    let lights = custom || lp.lights;
    lights = lights.slice(0, 4).map(l => newLight(l));
    this.home = { x: lights[0].x, y: lights[0].y };
    return { relief: r, mat: m, room, lights, wipe: -1 };
  }
  mode() { const m = (this.getAttribute("light") || "pointer").toLowerCase(); return reducedMotion() && m !== "fixed" ? "fixed" : m; }
  async start() {
    if (this.started) return;
    this.started = true;
    const G = await getGPU();
    if (!G || !this.isConnected) return this.fallback();
    G.onLost.add(() => this.fallback());
    this.R = new Relighter(G, this.canvas);
    this.ready = true;
    this.io = new IntersectionObserver(es => { this.visible = es[es.length - 1].isIntersecting; if (this.visible) schedule(this); });
    this.io.observe(this);
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(this);
    await this.load();
  }
  async source() {
    const src = this.getAttribute("src");
    if (src) {
      const res = await fetch(src);
      if (!res.ok) throw new Error(`${src}: HTTP ${res.status}`);
      if (/svg/.test(res.headers.get("content-type") || "") || /\.svg([?#]|$)/i.test(src)) return { kind: "svg", text: await res.text() };
      return { kind: "image", bitmap: await createImageBitmap(await res.blob()) };
    }
    const svg = this.querySelector("svg");
    return svg ? { kind: "svg", text: svg.outerHTML } : null;
  }
  async load() {
    try {
      const src = await this.source();
      if (!src || !this.R) return this.fallback();
      const st = await this.R.setSource(src, { margin: this.num("margin", 0.1) });
      this.canvas.style.aspectRatio = `${st.W} / ${st.H}`;
      this.canvas.hidden = false; this.fb.hidden = true;
      this.cfg = this.readCfg(); this.needBake = true;
      this.bindLight(); this.resize();
      this.dispatchEvent(new Event("load"));
    } catch (e) { console.error("raking-light:", e); this.fallback(); }
  }
  fallback() {
    this.canvas.hidden = true; this.fb.hidden = false;
    const src = this.getAttribute("src");
    if (src && !this.querySelector("svg") && !this.fb.querySelector("img")) {
      const img = document.createElement("img"); img.src = src; img.alt = this.getAttribute("aria-label") || "";
      this.fb.appendChild(img);
    }
  }
  resize() {
    const st = this.R?.stage; if (!st) return;
    const w = this.getBoundingClientRect().width, dpr = Math.min(devicePixelRatio || 1, 2);
    if (!w) return;
    this.canvas.width = Math.max(1, Math.round(w * dpr)); this.canvas.height = Math.max(1, Math.round(w * dpr * st.H / st.W));
    schedule(this);
  }
  bindLight() {
    this.unbindLight();
    const m = this.mode();
    if (m === "pointer") addEventListener("pointermove", this.onPointer, { passive: true });
    if (m === "tilt") addEventListener("deviceorientation", this.onTilt);
    this.bound = m;
  }
  unbindLight() { removeEventListener("pointermove", this.onPointer); removeEventListener("deviceorientation", this.onTilt); }
  pointerLight(cx, cy) {
    const r = this.getBoundingClientRect(); if (!r.width) return;
    this.aim((cx - r.left) / r.width, (cy - r.top) / r.height);
  }
  aim(x, y) {
    if (!this.cfg) return;
    const l = this.cfg.lights[0]; l.x = clamp(x, -0.8, 1.8); l.y = clamp(y, -0.8, 1.8);
    if (this.visible) schedule(this);
  }
  frame(now) {
    if (!this.R?.stage || !this.cfg || !this.visible) return;
    const t = (now - this.t0) / 1000;
    if (this.mode() === "orbit") {
      const l = this.cfg.lights[0]; l.x = 0.5 + 0.62 * Math.cos(t * 0.45); l.y = 0.5 + 0.5 * Math.sin(t * 0.45);
      schedule(this);
    }
    if (this.needBake) { this.R.bake(this.cfg); this.needBake = false; }
    this.R.render(this.cfg, t);
  }
  /** PNG of the current lighting at the baked resolution. */
  async toBlob(type = "image/png") {
    if (!this.R?.stage) throw new Error("raking-light: nothing rendered (no WebGPU or no source)");
    const c = await this.R.snapshot(this.cfg);
    return new Promise(res => c.toBlob(res, type));
  }
}
if (!customElements.get("raking-light")) customElements.define("raking-light", RakingLightElement);

