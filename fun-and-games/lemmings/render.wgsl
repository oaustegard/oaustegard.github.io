// gPu(lemmings) — drawing: lemming sprites into an overlay, then one thread per screen pixel.

fn hash(x: i32, y: i32) -> u32 {
  var h = bitcast<u32>(x) * 374761393u + bitcast<u32>(y) * 668265263u;
  h = (h ^ (h >> 13u)) * 1274126177u;
  return h ^ (h >> 16u);
}
fn hf(x: i32, y: i32) -> f32 { return f32(hash(x, y) & 1023u) / 1023.0; }
fn vnoise(x: f32, y: f32) -> f32 {
  let i = vec2i(floor(vec2f(x, y))); let f = fract(vec2f(x, y)); let u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hf(i.x, i.y), hf(i.x + 1, i.y), u.x), mix(hf(i.x, i.y + 1), hf(i.x + 1, i.y + 1), u.x), u.y);
}
fn rgb(c: u32) -> vec3f { return vec3f(f32(c & 255u), f32((c >> 8u) & 255u), f32((c >> 16u) & 255u)) / 255.0; }
fn pack(c: vec3f) -> u32 {
  let q = vec3u(clamp(c, vec3f(0.0), vec3f(1.0)) * 255.0 + 0.5);
  return q.x | (q.y << 8u) | (q.z << 16u) | 0xff000000u;
}
fn pal(i: u32) -> vec3f {
  switch (i) {
    case 1u: { return vec3f(0.16, 0.78, 0.24); }
    case 2u: { return vec3f(0.24, 0.35, 0.9); }
    case 3u: { return vec3f(0.94, 0.78, 0.63); }
    case 4u: { return vec3f(1.0, 1.0, 1.0); }
    case 5u: { return vec3f(0.59, 0.37, 0.18); }
    case 6u: { return vec3f(0.88, 0.2, 0.18); }
    case 7u: { return vec3f(0.67, 0.67, 0.7); }
    case 8u: { return vec3f(0.12, 0.12, 0.12); }
    case 9u: { return vec3f(0.98, 0.9, 0.27); }
    case 10u: { return vec3f(0.96, 0.55, 0.16); }
    case 11u: { return vec3f(0.55, 0.78, 1.0); }
    case 12u: { return vec3f(1.0, 0.47, 0.63); }
    default: { return vec3f(0.47, 1.0, 0.47); }
  }
}

fn plot(x: i32, y: i32, c: u32, i: u32) {
  let sy = y - inp.camY;
  if (sy < 0 || sy >= i32(inp.vh)) { return; }
  let sx = x - inp.camX;
  if (sx < 0 || sx >= i32(inp.vw)) { return; }
  atomicMax(&fb[u32(sy) * inp.vw + u32(sx)], ((i + 1u) << 4u) | c);
}

fn drawFrame(fr: u32, x: i32, y: i32, dir: i32, i: u32) {
  for (var row = 0u; row < 16u; row++) {
    let bits = rom[R_SPR + fr * 16u + row];
    if (bits == 0u) { continue; }
    for (var c = 0u; c < 8u; c++) {
      let p = (bits >> (c * 4u)) & 15u;
      if (p == 0u) { continue; }
      let sx = select(x + 3 - i32(c), x + i32(c) - 4, dir > 0);
      plot(sx, y - 15 + i32(row), p, i);
    }
  }
}

@compute @workgroup_size(64) fn sprites(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x;
  if (i >= ldw(W_REL)) { return; }
  let l = lems[i];
  if (l.state == S_NONE) { return; }
  // minimap dot
  let mx = u32(clamp(l.x, 0, LW() - 1)) * inp.vw / u32(LW());
  let my = inp.vh + u32(clamp(l.y - 4, 0, LH() - 1)) * inp.mmh / u32(LH());
  atomicMax(&fb[my * inp.vw + mx], ((i + 1u) << 4u) | 15u);
  if (l.x < inp.camX - 8 || l.x > inp.camX + i32(inp.vw) + 8 || l.y < inp.camY - 4 || l.y > inp.camY + i32(inp.vh) + 20) { return; }
  let m = R_SMETA + l.state * 4u;
  let fr = rom[m] + (l.frame >> rom[m + 2u]) % rom[m + 1u];
  drawFrame(fr, l.x, l.y, l.dir, i);
  if ((l.flags & F_BOMB) != 0u && l.timer > 0 && l.state < S_OHNO) {
    let d = u32((l.timer + TPS - 1) / TPS);
    drawFrame(rom[R_DIGITS] + d, l.x - 1, l.y - 1 - 10, 1, i);
  }
}

fn theme(k: u32) -> vec3f { return rgb(rom[R_THEME + k]); }

fn open(x: i32, y: i32) -> bool { return !isSolid(terr(x, y)); }

fn terrainColor(x: i32, y: i32, m: u32, ci: u32) -> vec3f {
  if (ci != 0u) {
    // a drawn piece: its own shaded colour, a little grain, and lit and shadowed edges
    var c = rgb(rom[R_PAL + ci]) * (0.94 + 0.12 * hf(x, y));
    if (m != M_DECOR) {
      if (open(x, y - 1)) { c = c * 1.18 + vec3f(0.03); }
      else if (open(x, y + 1)) { c *= 0.7; }
    }
    return c;
  }
  if (m == M_STEEL) {
    let tx = x & 7; let ty = y & 7;
    var v = 0.52 + 0.06 * hf(x >> 3, y >> 3);
    if (tx == 0 || ty == 0) { v = 0.74; }
    if (tx == 7 || ty == 7) { v = 0.3; }
    if ((tx == 2 || tx == 5) && (ty == 2 || ty == 5)) { v = 0.86; }
    return vec3f(v, v, v * 1.06);
  }
  if (m == M_BRICK) {
    var c = vec3f(0.86, 0.74, 0.5);
    if (((x + y * 3) % 6 + 6) % 6 == 0) { c *= 0.8; }
    return c;
  }
  let fx = f32(x); let fy = f32(y);
  let n = 0.5 * vnoise(fx / 11.0, fy / 7.0) + 0.3 * vnoise(fx / 4.0, fy / 3.0) + 0.2 * hf(x, y);
  var c = mix(theme(0u), theme(1u), smoothstep(0.25, 0.8, n));
  if (abs(vnoise(fx / 6.0 + 40.0, fy / 6.0) - 0.5) < 0.035) { c *= 0.72; }
  if (hf(x >> 1, y >> 1) > 0.985) { c = mix(c, vec3f(1.0), 0.25); }
  let grass = 1 + i32(hash(x, 99) % 3u);
  var lit = false;
  for (var k = 1; k <= 3; k++) {
    if (open(x, y - k)) { if (k <= grass) { c = theme(2u) * (1.15 - 0.15 * f32(k)); } else { c = mix(c, theme(2u), 0.35); } lit = true; break; }
  }
  if (!lit) {
    if (open(x, y + 1)) { c *= 0.6; }
    else if (open(x - 1, y) || open(x + 1, y)) { c *= 0.8; }
  }
  return c;
}

// the hatch: a wooden box whose doors open over OPEN_TICKS; hx, hy is where lemmings drop from
fn hatchColor(x: i32, y: i32, hx: i32, hy: i32, c: vec3f) -> vec3f {
  let dx = x - hx; let dy = y - hy;
  if (abs(dx) > 15 || dy < -21 || dy > -1) { return c; }
  let wood = vec3f(0.5, 0.31, 0.14) * (0.85 + 0.15 * hf(x, y >> 2));
  if (dy <= -19) { return vec3f(0.33, 0.2, 0.09); }
  if (abs(dx) >= 13 || dy <= -17) { return wood * 1.15; }
  let t = f32(min(ldw(W_TICK), OPEN_TICKS)) / f32(OPEN_TICKS);
  if (f32(abs(dx)) < t * 12.5) { return vec3f(0.03, 0.02, 0.02); }
  var w = wood * 0.9;
  if ((dx & 3) == 0) { w *= 0.75; }
  return w;
}

// the exit: a stone arch with torches; ex, ey is the floor row lemmings walk in on
fn exitColor(x: i32, y: i32, ex: i32, ey: i32, c: vec3f) -> vec3f {
  let dx = abs(x - ex); let dy = y - ey;
  let t = i32(inp.time / 3u);
  if (dx >= 8 && dx <= 10 && dy >= -29 && dy <= -24) {
    let f = hf(x * 7 + t, y + t * 3);
    let h = f32(dy + 29) / 6.0;
    if (f < 0.25 + 0.6 * h) { return mix(vec3f(1.0, 0.95, 0.4), vec3f(0.95, 0.35, 0.08), 1.0 - h + 0.3 * f); }
    return c;
  }
  if (dx > 10 || dy < -23 || dy > 0) { return c; }
  let stone = vec3f(0.62, 0.58, 0.52) * (0.8 + 0.2 * hf(x >> 1, y >> 1));
  if (dy <= -20) { return stone * select(1.0, 0.75, ((x >> 2) & 1) == 0 && dy == -20); }
  if (dx >= 8) { return stone * select(1.0, 0.7, dx == 10); }
  let glow = f32(dy + 20) / 20.0;
  return mix(vec3f(0.12, 0.04, 0.02), vec3f(0.95, 0.55, 0.15), glow * glow * (0.8 + 0.2 * hf(t, x)));
}

// two silhouette layers behind the terrain, scrolling slower than it; the theme picks their shape
fn ridge(bx: f32, kind: u32, near: bool) -> f32 {
  let h = 160.0;
  let s = select(1.0, 0.7, near);
  switch (kind) {
    case 1u: { // crystal spires
      let cell = floor(bx / 14.0); let f = fract(bx / 14.0);
      let tall = 0.25 + 0.75 * hf(i32(cell), select(3, 9, near));
      return select(h * 0.42, h * 0.6, near) + (1.0 - tall * (1.0 - abs(f - 0.5) * 2.0)) * h * 0.35 * s;
    }
    case 2u: { // forest
      let base = select(h * 0.5, h * 0.66, near) + 10.0 * vnoise(bx / 50.0, select(1.0, 5.0, near));
      return base - 9.0 * s * pow(abs(sin(bx * 0.21 + 1.7 * vnoise(bx / 9.0, 2.0))), 3.0);
    }
    case 3u: { // ruined city: flat-topped towers
      let cell = floor(bx / select(18.0, 26.0, near));
      return select(h * 0.4, h * 0.6, near) + h * 0.3 * s * hf(i32(cell), select(11, 17, near));
    }
    default: { // mountains
      return select(h * 0.42, h * 0.62, near) + 22.0 * s * vnoise(bx / 70.0, select(2.0, 7.0, near)) + 7.0 * vnoise(bx / 17.0, select(4.0, 8.0, near));
    }
  }
}

fn sceneColor(x: i32, y: i32) -> vec3f {
  let fy = f32(y) / f32(LH());
  var c = mix(theme(3u), theme(4u), fy);
  let sx = f32(x - inp.camX); let cx = f32(inp.camX);
  let kind = rom[R_THEME + 8u];
  // in a level taller than the view, the ridges sit at the bottom and drop away as the view rises
  let rise = f32(LH() - i32(inp.vh) - inp.camY);
  let by = f32(y - inp.camY) + f32(i32(inp.vh) - 160);
  if (by - rise * 0.5 > ridge(sx + cx * 0.6, kind, true)) { c = mix(theme(7u), theme(4u), 0.15 * fy); }
  else if (by - rise * 0.25 > ridge(sx + cx * 0.3, kind, false)) { c = mix(theme(6u), theme(4u), 0.2 * fy); }
  else {
    let star = hf(x, y * 3 + 5);
    if (star > 0.9965) { c += vec3f(0.5 + 0.4 * sin(f32(inp.time) * 0.05 + star * 900.0)) * (1.0 - fy); }
  }
  let w = ter[u32(y * LW() + x)];
  let m = w & 255u;
  if (m != M_AIR) { c = terrainColor(x, y, m, (w >> 8u) & 255u); }
  else {
    for (var k = 0u; k < rom[R_NWATER]; k++) {
      let o = R_WATER + k * 3u;
      let wy = i32(rom[o + 2u]);
      if (x >= i32(rom[o]) && x <= i32(rom[o + 1u]) && y >= wy - 1) {
        let wave = sin(f32(x) * 0.31 + f32(inp.time) * 0.12) + sin(f32(x) * 0.13 - f32(inp.time) * 0.07);
        let top = wy + i32(round(wave * 0.8));
        if (y >= top) {
          c = theme(5u) * (0.75 + 0.25 * hf(x >> 2, (y + i32(inp.time / 4u)) >> 1));
          if (y == top) { c = mix(c, vec3f(0.9, 0.95, 1.0), 0.6); }
        }
      }
    }
  }
  for (var k = 0u; k < rom[R_NHATCH]; k++) { c = hatchColor(x, y, i32(rom[R_HATCH + k * 2u]), i32(rom[R_HATCH + k * 2u + 1u]), c); }
  for (var k = 0u; k < rom[R_NEXIT]; k++) { c = exitColor(x, y, i32(rom[R_EXIT + k * 2u]), i32(rom[R_EXIT + k * 2u + 1u]), c); }
  return c;
}

fn miniColor(x: i32, y: i32) -> vec3f {
  var m = terr(x, y);
  if (!isSolid(m)) { m = terr(x, y + 2); }
  if (m == M_DECOR) { m = M_AIR; }
  if (m == M_STEEL) { return vec3f(0.6); }
  if (m == M_BRICK) { return vec3f(0.8, 0.7, 0.45); }
  if (m == M_DIRT) { return theme(0u) * 0.9 + vec3f(0.05); }
  for (var k = 0u; k < rom[R_NWATER]; k++) {
    let o = R_WATER + k * 3u;
    if (x >= i32(rom[o]) && x <= i32(rom[o + 1u]) && y >= i32(rom[o + 2u])) { return theme(5u); }
  }
  return vec3f(0.0);
}

@compute @workgroup_size(8, 8) fn composite(@builtin(global_invocation_id) g: vec3u) {
  let vw = inp.vw; let vh = inp.vh;
  if (g.x >= vw || g.y >= vh + inp.mmh) { return; }
  let p = g.y * vw + g.x;
  let o = atomicLoad(&fb[p]);
  atomicStore(&fb[p], 0u);
  var c: vec3f;
  if (g.y < vh) {
    let x = inp.camX + i32(g.x); let y = inp.camY + i32(g.y);
    if (o != 0u) { c = pal(o & 15u); } else { c = sceneColor(x, y); }
    // a ring that shrinks onto the lemming that was just given a skill
    let ai = ldw(W_AIDX); let age = inp.time - ldw(W_ATIME);
    if (ai != 0u && age < 24u) {
      let l = lems[ai - 1u];
      let d = length(vec2f(f32(x - l.x), f32(y - (l.y - 5))));
      let r = 4.0 + f32(24u - age) * 0.6;
      if (abs(d - r) < 0.9) { c = mix(c, vec3f(1.0, 0.92, 0.3), 0.9); }
    }
    let hv = ldw(W_HOV);
    if (hv != 0u) {
      let l = lems[hv - 1u];
      let bx = x - l.x; let by = y - l.y;
      let edge = ((bx == -6 || bx == 5) && by >= -13 && by <= 1) || ((by == -13 || by == 1) && bx >= -6 && bx <= 5);
      if (edge && ((bx + by) & 1) == 0) { c = vec3f(1.0); }
    }
  } else {
    let my = i32(g.y - vh);
    let x = i32(g.x) * LW() / i32(vw); let y = my * LH() / i32(inp.mmh);
    if (o != 0u) { c = pal(15u); } else { c = miniColor(x, y); }
    let v0 = inp.camX * i32(vw) / LW(); let v1 = (inp.camX + i32(vw)) * i32(vw) / LW() - 1;
    let w0 = inp.camY * i32(inp.mmh) / LH(); let w1 = (inp.camY + i32(vh)) * i32(inp.mmh) / LH() - 1;
    let gx = i32(g.x);
    let inX = gx >= v0 && gx <= v1; let inY = my >= w0 && my <= w1;
    if (((gx == v0 || gx == v1) && inY) || ((my == w0 || my == w1) && inX)) { c = vec3f(0.95, 0.85, 0.2); }
    if (my == 0 && (gx < v0 || gx > v1)) { c = vec3f(0.25); }
  }
  atomicStore(&fb[COL + p], pack(c));
}
