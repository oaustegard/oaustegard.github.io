// gPu(lemmings) — the game tick: begin, pick, assign, fieldStamp, classify, the queue sizes,
// one kernel per lemming state, and the terrain edits.

fn pushEdit(base: u32, ctr: u32, kind: u32, x: i32, y: i32, dir: i32) {
  let n = atomicAdd(&wd[ctr], 1u);
  if (n >= MAXE) { return; }
  let o = base + n * 4u;
  aux[o] = kind; aux[o + 1u] = bitcast<u32>(x); aux[o + 2u] = bitcast<u32>(y); aux[o + 3u] = bitcast<u32>(dir);
}

fn toState(s: u32) { L.state = s; L.frame = 0u; }
fn startFall() { toState(S_FALL); L.fall = 0; }
fn die() { L.state = S_NONE; atomicAdd(&wd[W_DEAD], 1u); }
fn explode() {
  pushEdit(EOFF, W_NREM, K_BOMB, L.x, L.y, 0);
  toState(S_POP);
  sound(3u);
}

// what the blocker field says at a pixel: -1 push left, 1 push right, 0 nothing (stamped this tick)
fn pushDir(x: i32, y: i32) -> i32 {
  if (x < 0 || x >= LW() || y < 0 || y >= LH()) { return 0; }
  let v = aux[FOFF + u32(y * LW() + x)];
  if ((v >> 2u) != (ldw(W_TICK) & 0x3fffffffu)) { return 0; }
  return select(-1, 1, (v & 3u) == 2u);
}

// leaving the level, water and exits; true when the lemming stopped being a free agent
fn hazards() -> bool {
  if (L.y >= LH()) { die(); return true; }
  for (var k = 0u; k < rom[R_NWATER]; k++) {
    let o = R_WATER + k * 3u;
    if (L.x >= i32(rom[o]) && L.x <= i32(rom[o + 1u]) && L.y >= i32(rom[o + 2u])) { toState(S_DROWN); sound(6u); return true; }
  }
  for (var k = 0u; k < rom[R_NEXIT]; k++) {
    let ex = i32(rom[R_EXIT + k * 2u]); let ey = i32(rom[R_EXIT + k * 2u + 1u]);
    if (abs(L.x - ex) <= 2 && L.y <= ey && L.y >= ey - 6) { toState(S_EXIT); sound(5u); return true; }
  }
  return false;
}

// drop onto ground up to three pixels below; false when there is none and the lemming falls
fn followDown() -> bool {
  if (solid(L.x, L.y + 1)) { return true; }
  var d = 1;
  loop { if (d > 3 || solid(L.x, L.y + d + 1)) { break; } d += 1; }
  if (d <= 3) { L.y += d; return true; }
  startFall();
  return false;
}

fn canTake(s: u32) -> bool {
  let st = L.state;
  if (st == S_NONE || st >= S_OHNO) { return false; }
  switch (s) {
    case 0u: { return (L.flags & F_CLIMB) == 0u; }
    case 1u: { return (L.flags & F_FLOAT) == 0u; }
    case 2u: { return (L.flags & F_BOMB) == 0u; }
    default: {
      let busy = st == S_WALK || st == S_SHRUG || st == S_BUILD || st == S_BASH || st == S_MINE || st == S_DIG;
      if (!busy) { return false; }
      let same = (s == 4u && st == S_BUILD) || (s == 5u && st == S_BASH) || (s == 6u && st == S_MINE) || (s == 7u && st == S_DIG);
      return !same;
    }
  }
}

fn applySkill(s: u32) {
  switch (s) {
    case 0u: { L.flags |= F_CLIMB; }
    case 1u: { L.flags |= F_FLOAT; }
    case 2u: { L.flags |= F_BOMB; L.timer = 5 * TPS; }
    case 3u: { toState(S_BLOCK); }
    case 4u: { toState(S_BUILD); L.flags &= 0xffu; }
    case 5u: { toState(S_BASH); }
    case 6u: { toState(S_MINE); }
    default: { toState(S_DIG); }
  }
}

@compute @workgroup_size(1) fn begin() {
  let t = atomicAdd(&wd[W_TICK], 1u) + 1u;
  atomicStore(&wd[W_NREM], 0u);
  atomicStore(&wd[W_NADD], 0u);
  for (var s = 0u; s < NS; s++) { atomicStore(&wd[W_QC + s], 0u); }
  if (ldw(W_DONE) != 0u) { return; }
  if (t == 1u) { sound(0u); }
  let rr = clamp(inp.rr, rom[R_RRMIN], 99u);
  atomicStore(&wd[W_RR], rr);
  if (inp.nuke != 0u) { atomicStore(&wd[W_NUKED], 1u); }
  let nuked = ldw(W_NUKED) != 0u;
  let rel = ldw(W_REL);
  if (nuked) {
    // the original arms one lemming a tick; a crowd gets more at once
    var c = ldw(W_NUKEC);
    let per = max(1u, rel / 64u);
    for (var k = 0u; k < per && c < rel; k++) {
      var l = lems[c];
      if (l.state != S_NONE && l.state < S_OHNO && (l.flags & F_BOMB) == 0u) { l.flags |= F_BOMB; l.timer = 5 * TPS; lems[c] = l; }
      c += 1u;
    }
    atomicStore(&wd[W_NUKEC], c);
  }
  var tl = ldw(W_TIME);
  if (tl > 0u) { tl -= 1u; atomicStore(&wd[W_TIME], tl); }
  let total = rom[R_COUNT];
  if (!nuked && rel < total && t > OPEN_TICKS) {
    var timer = ldw(W_SPAWNT);
    if (timer == 0u) {
      var r = rel;
      let burst = max(rom[R_BURST], 1u);
      for (var h = 0u; h < rom[R_NHATCH]; h++) {
        for (var b = 0u; b < burst && r < total; b++) {
          let hx = i32(rom[R_HATCH + h * 2u]) + (i32(b) - i32(burst / 2u)) * 3;
          let hy = i32(rom[R_HATCH + h * 2u + 1u]);
          lems[r] = Lem(hx, hy, select(-1, 1, (b & 1u) == 0u), S_FALL, 0u, 0, 0u, 0);
          r += 1u;
        }
      }
      atomicStore(&wd[W_REL], r);
      timer = 53u - rr / 2u;
    } else { timer -= 1u; }
    atomicStore(&wd[W_SPAWNT], timer);
  }
  let rel2 = ldw(W_REL);
  let gone = ldw(W_SAVED) + ldw(W_DEAD);
  if ((t > OPEN_TICKS && (rel2 >= total || nuked) && gone >= rel2) || tl == 0u) { atomicStore(&wd[W_DONE], 1u); }
}

// the lemming under the cursor: one that can take the selected skill wins, then the nearest, then the newest
@compute @workgroup_size(64) fn pick(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x;
  if (i >= ldw(W_REL)) { return; }
  L = lems[i];
  if (L.state == S_NONE || L.state >= S_EXIT) { return; }
  let dx = abs(L.x - inp.curX); let dy = abs(L.y - 5 - inp.curY);
  if (dx > inp.pickR || dy > inp.pickR + 2) { return; }
  let cant = select(1u, 0u, inp.skill < 8u && canTake(inp.skill));
  atomicMin(&wd[W_HOVKEY], (cant << 27u) | (u32(dx + dy) << 22u) | (0x3fffffu - i));
}

@compute @workgroup_size(1) fn assign() {
  let key = atomicExchange(&wd[W_HOVKEY], 0xffffffffu);
  if (key == 0xffffffffu) { atomicStore(&wd[W_HOV], 0u); }
  else {
    let i = 0x3fffffu - (key & 0x3fffffu);
    L = lems[i];
    atomicStore(&wd[W_HOV], i + 1u);
    atomicStore(&wd[W_HOVSTATE], L.state);
    atomicStore(&wd[W_HOVFLAGS], L.flags);
  }
  if (inp.click == ldw(W_CLICK)) { return; }
  atomicStore(&wd[W_CLICK], inp.click);
  let s = inp.skill;
  // the result of every click goes to the page, which says what happened
  atomicStore(&wd[W_ASEQ], inp.click);
  atomicStore(&wd[W_ASKILL], s);
  var res = 1u;
  if (s >= 8u) { res = 5u; }
  else if (key == 0xffffffffu) { res = 2u; }
  else if (ldw(W_SKILL + s) == 0u) { res = 4u; }
  else if (!canTake(s)) { res = 3u; }
  atomicStore(&wd[W_ARES], res);
  if (res != 1u || ldw(W_DONE) != 0u) { return; }
  let i = 0x3fffffu - (key & 0x3fffffu);
  atomicStore(&wd[W_AIDX], i + 1u);
  atomicStore(&wd[W_ATIME], inp.time);
  applySkill(s);
  lems[i] = L;
  atomicSub(&wd[W_SKILL + s], 1u);
  atomicStore(&wd[W_HOVSTATE], L.state);
  atomicStore(&wd[W_HOVFLAGS], L.flags);
  sound(1u);
}

// blockers mark the pixels around them, stamped with the tick so the field never needs clearing
@compute @workgroup_size(64) fn fieldStamp(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x;
  if (i >= ldw(W_REL)) { return; }
  let l = lems[i];
  if (l.state != S_BLOCK) { return; }
  let stamp = (ldw(W_TICK) & 0x3fffffffu) << 2u;
  for (var dy = -10; dy <= 0; dy++) {
    let y = l.y + dy;
    if (y < 0 || y >= LH()) { continue; }
    for (var dx = -6; dx <= 6; dx++) {
      let x = l.x + dx;
      if (dx == 0 || x < 0 || x >= LW()) { continue; }
      aux[FOFF + u32(y * LW() + x)] = stamp | select(1u, 2u, dx > 0);
    }
  }
}

@compute @workgroup_size(64) fn classify(@builtin(global_invocation_id) g: vec3u) {
  let i = g.x;
  if (ldw(W_DONE) != 0u || i >= ldw(W_REL)) { return; }
  L = lems[i];
  if (L.state == S_NONE) { return; }
  if ((L.flags & F_BOMB) != 0u && L.timer > 0 && L.state < S_OHNO) {
    L.timer -= 1;
    if (L.timer == 0) {
      let air = L.state == S_FALL || L.state == S_FLOAT || L.state == S_CLIMB || L.state == S_HOIST || L.state == S_JUMP;
      if (air) { explode(); } else { toState(S_OHNO); sound(2u); }
    }
  }
  lems[i] = L;
  let n = atomicAdd(&wd[W_QC + L.state], 1u);
  aux[L.state * MAXL + n] = i;
}

@group(1) @binding(0) var<storage, read_write> args: array<u32>;

@compute @workgroup_size(1) fn queueArgs() {
  for (var s = 0u; s < NS; s++) {
    args[s * 3u] = (ldw(W_QC + s) + 63u) / 64u; args[s * 3u + 1u] = 1u; args[s * 3u + 2u] = 1u;
  }
}

@compute @workgroup_size(1) fn editArgs() {
  args[NS * 3u] = min(ldw(W_NREM), MAXE); args[NS * 3u + 1u] = 1u; args[NS * 3u + 2u] = 1u;
  args[NS * 3u + 3u] = min(ldw(W_NADD), MAXE); args[NS * 3u + 4u] = 1u; args[NS * 3u + 5u] = 1u;
}

// the index of the lemming this thread runs for state s, or -1
fn slot(s: u32, g: u32) -> i32 {
  if (g >= ldw(W_QC + s)) { return -1; }
  return i32(aux[s * MAXL + g]);
}

fn doWalk() {
  let pd = pushDir(L.x, L.y);
  if (pd != 0 && pd != L.dir) { L.dir = pd; }
  let x = L.x + L.dir;
  if (solid(x, L.y)) {
    var h = 1;
    loop { if (h > 7 || !solid(x, L.y - h)) { break; } h += 1; }
    if (h <= 2) { L.x = x; L.y -= h; }
    else if (h <= 6) { L.x = x; toState(S_JUMP); return; }
    else if ((L.flags & F_CLIMB) != 0u) { toState(S_CLIMB); return; }
    else { L.dir = -L.dir; return; }
  } else {
    L.x = x;
    if (!followDown()) { hazards(); return; }
  }
  L.frame += 1u;
  hazards();
}

fn doJump() {
  for (var k = 0; k < 2; k++) { if (solid(L.x, L.y)) { L.y -= 1; } }
  L.frame += 1u;
  if (!solid(L.x, L.y)) { toState(S_WALK); }
}

fn doFall() {
  for (var k = 0; k < 3; k++) {
    if (solid(L.x, L.y + 1)) {
      if (L.fall > 60) { toState(S_SPLAT); sound(4u); } else { toState(S_WALK); }
      L.fall = 0;
      hazards();
      return;
    }
    L.y += 1; L.fall += 1;
    if (L.y >= LH()) { break; }
  }
  L.frame += 1u;
  if ((L.flags & F_FLOAT) != 0u && L.fall > 16) { toState(S_FLOAT); }
  hazards();
}

fn doFloat() {
  L.frame += 1u;
  let steps = select(1, 2, L.frame > 6u);
  for (var k = 0; k < steps; k++) {
    if (solid(L.x, L.y + 1)) { toState(S_WALK); L.fall = 0; hazards(); return; }
    L.y += 1;
  }
  hazards();
}

fn doClimb() {
  L.frame += 1u;
  if (!solid(L.x + L.dir, L.y) && !solid(L.x + L.dir, L.y - 4)) { startFall(); return; }
  if ((L.frame & 1u) == 0u) {
    if (solid(L.x, L.y - 10) || L.y <= 10) { L.dir = -L.dir; L.x += L.dir; startFall(); return; }
    L.y -= 1;
  }
  if (!solid(L.x + L.dir, L.y - 7)) { toState(S_HOIST); }
}

fn doHoist() {
  L.frame += 1u;
  if (L.frame < 8u) { return; }
  L.x += L.dir;
  for (var k = 0; k < 12; k++) { if (!solid(L.x, L.y)) { break; } L.y -= 1; }
  toState(S_WALK);
}

fn doBuild() {
  if (!solid(L.x, L.y + 1)) { startFall(); return; }
  let f = L.frame % 16u;
  var bricks = (L.flags >> 8u) & 255u;
  if (f == 8u) {
    pushEdit(AOFF, W_NADD, K_BRICK, L.x, L.y, L.dir);
    bricks += 1u;
    L.flags = (L.flags & 0xffu) | (bricks << 8u);
    if (bricks >= 10u) { sound(7u); }
  }
  if (f == 15u) {
    let nx = L.x + 2 * L.dir;
    if (solid(L.x + L.dir, L.y - 1) || solid(nx, L.y - 1) || solid(L.x + L.dir, L.y - 9)) {
      L.dir = -L.dir; toState(S_WALK); return;
    }
    L.x = nx; L.y -= 1;
    if (bricks >= 12u) { toState(S_SHRUG); return; }
  }
  L.frame += 1u;
}

fn doShrug() {
  L.frame += 1u;
  if (L.frame >= 8u) { toState(S_WALK); }
}

fn doBash() {
  if (!solid(L.x, L.y + 1) && !solid(L.x, L.y + 2) && !solid(L.x, L.y + 3)) { startFall(); return; }
  let f = L.frame % 16u;
  if (f == 0u) {
    var steel = false; var any = false;
    for (var dx = 1; dx <= 12; dx++) {
      for (var dy = 0; dy <= 9; dy++) {
        let m = terr(L.x + L.dir * dx, L.y - dy);
        if (isSolid(m)) { any = true; if (m == M_STEEL && dx <= 8) { steel = true; } }
      }
    }
    if (steel) { L.dir = -L.dir; toState(S_WALK); sound(7u); return; }
    if (!any) { toState(S_WALK); return; }
    pushEdit(EOFF, W_NREM, K_BASH, L.x, L.y, L.dir);
  }
  if (f == 3u || f == 6u || f == 9u || f == 12u) {
    let x = L.x + L.dir;
    if (solid(x, L.y) && solid(x, L.y - 1)) { L.frame += 1u; return; }   // waiting for the carve
    L.x = x;
    if (solid(L.x, L.y)) { L.y -= 1; }
    else if (!solid(L.x, L.y + 1)) { if (solid(L.x, L.y + 2)) { L.y += 1; } else if (solid(L.x, L.y + 3)) { L.y += 2; } }
  }
  L.frame += 1u;
  hazards();
}

fn inMine(u: i32, v: i32) -> bool { return u >= 0 && v >= -2 && (u - 3) * (u - 3) + (v - 2) * (v - 2) <= 36; }

fn doMine() {
  if (!followDown()) { hazards(); return; }
  let f = L.frame % 24u;
  if (f == 0u) {
    var steel = false;
    for (var u = 0; u <= 9; u++) {
      for (var v = -2; v <= 8; v++) {
        if (inMine(u, v) && terr(L.x + L.dir * u, L.y - v) == M_STEEL) { steel = true; }
      }
    }
    if (steel) { L.dir = -L.dir; toState(S_WALK); sound(7u); return; }
    pushEdit(EOFF, W_NREM, K_MINE, L.x, L.y, L.dir);
  }
  if (f == 12u) {
    L.x += 2 * L.dir;
    if (!followDown()) { hazards(); return; }
  }
  L.frame += 1u;
  hazards();
}

fn doDig() {
  let f = L.frame % 8u;
  if (f == 0u) {
    if (terr(L.x, L.y + 1) == M_STEEL) { toState(S_WALK); sound(7u); return; }
    var any = false;
    for (var dx = -4; dx <= 4; dx++) {
      for (var dy = 1; dy <= 2; dy++) { let m = terr(L.x + dx, L.y + dy); if (m == M_DIRT || m == M_BRICK) { any = true; } }
    }
    if (!any) {
      if (solid(L.x, L.y + 1)) { toState(S_WALK); } else { startFall(); }
      return;
    }
    pushEdit(EOFF, W_NREM, K_DIG, L.x, L.y, 0);
  }
  if (f == 4u) {
    for (var d = 0; d < 2; d++) { if (solid(L.x, L.y + 1)) { break; } L.y += 1; }
  }
  L.frame += 1u;
  hazards();
}

fn doBlock() {
  L.frame += 1u;
  if (!solid(L.x, L.y + 1)) { startFall(); }
}

fn doOhno() {
  L.frame += 1u;
  if (!solid(L.x, L.y + 1)) { L.y += 1; if (L.y >= LH()) { die(); return; } }
  if (L.frame >= 16u) { explode(); }
}

fn doFade(frames: u32, saved: bool) {
  L.frame += 1u;
  if (L.frame < frames) { return; }
  L.state = S_NONE;
  if (saved) { atomicAdd(&wd[W_SAVED], 1u); } else { atomicAdd(&wd[W_DEAD], 1u); }
}

// One entry point per state. Each runs only over the queue classify built for its state.

@compute @workgroup_size(64) fn kWALK(@builtin(global_invocation_id) g: vec3u) {
  let i = slot(S_WALK, g.x);
  if (i < 0) { return; }
  L = lems[i];
  doWalk();
  lems[i] = L;
}

@compute @workgroup_size(64) fn kFALL(@builtin(global_invocation_id) g: vec3u) {
  let i = slot(S_FALL, g.x);
  if (i < 0) { return; }
  L = lems[i];
  doFall();
  lems[i] = L;
}

@compute @workgroup_size(64) fn kFLOAT(@builtin(global_invocation_id) g: vec3u) {
  let i = slot(S_FLOAT, g.x);
  if (i < 0) { return; }
  L = lems[i];
  doFloat();
  lems[i] = L;
}

@compute @workgroup_size(64) fn kCLIMB(@builtin(global_invocation_id) g: vec3u) {
  let i = slot(S_CLIMB, g.x);
  if (i < 0) { return; }
  L = lems[i];
  doClimb();
  lems[i] = L;
}

@compute @workgroup_size(64) fn kHOIST(@builtin(global_invocation_id) g: vec3u) {
  let i = slot(S_HOIST, g.x);
  if (i < 0) { return; }
  L = lems[i];
  doHoist();
  lems[i] = L;
}

@compute @workgroup_size(64) fn kBUILD(@builtin(global_invocation_id) g: vec3u) {
  let i = slot(S_BUILD, g.x);
  if (i < 0) { return; }
  L = lems[i];
  doBuild();
  lems[i] = L;
}

@compute @workgroup_size(64) fn kSHRUG(@builtin(global_invocation_id) g: vec3u) {
  let i = slot(S_SHRUG, g.x);
  if (i < 0) { return; }
  L = lems[i];
  doShrug();
  lems[i] = L;
}

@compute @workgroup_size(64) fn kBASH(@builtin(global_invocation_id) g: vec3u) {
  let i = slot(S_BASH, g.x);
  if (i < 0) { return; }
  L = lems[i];
  doBash();
  lems[i] = L;
}

@compute @workgroup_size(64) fn kMINE(@builtin(global_invocation_id) g: vec3u) {
  let i = slot(S_MINE, g.x);
  if (i < 0) { return; }
  L = lems[i];
  doMine();
  lems[i] = L;
}

@compute @workgroup_size(64) fn kDIG(@builtin(global_invocation_id) g: vec3u) {
  let i = slot(S_DIG, g.x);
  if (i < 0) { return; }
  L = lems[i];
  doDig();
  lems[i] = L;
}

@compute @workgroup_size(64) fn kBLOCK(@builtin(global_invocation_id) g: vec3u) {
  let i = slot(S_BLOCK, g.x);
  if (i < 0) { return; }
  L = lems[i];
  doBlock();
  lems[i] = L;
}

@compute @workgroup_size(64) fn kJUMP(@builtin(global_invocation_id) g: vec3u) {
  let i = slot(S_JUMP, g.x);
  if (i < 0) { return; }
  L = lems[i];
  doJump();
  lems[i] = L;
}

@compute @workgroup_size(64) fn kOHNO(@builtin(global_invocation_id) g: vec3u) {
  let i = slot(S_OHNO, g.x);
  if (i < 0) { return; }
  L = lems[i];
  doOhno();
  lems[i] = L;
}

@compute @workgroup_size(64) fn kEXIT(@builtin(global_invocation_id) g: vec3u) {
  let i = slot(S_EXIT, g.x);
  if (i < 0) { return; }
  L = lems[i];
  doFade(10u, true);
  lems[i] = L;
}

@compute @workgroup_size(64) fn kSPLAT(@builtin(global_invocation_id) g: vec3u) {
  let i = slot(S_SPLAT, g.x);
  if (i < 0) { return; }
  L = lems[i];
  doFade(16u, false);
  lems[i] = L;
}

@compute @workgroup_size(64) fn kDROWN(@builtin(global_invocation_id) g: vec3u) {
  let i = slot(S_DROWN, g.x);
  if (i < 0) { return; }
  L = lems[i];
  doFade(16u, false);
  lems[i] = L;
}

@compute @workgroup_size(64) fn kPOP(@builtin(global_invocation_id) g: vec3u) {
  let i = slot(S_POP, g.x);
  if (i < 0) { return; }
  L = lems[i];
  doFade(12u, false);
  lems[i] = L;
}

fn inMask(kind: u32, u: i32, v: i32) -> bool {
  switch (kind) {
    case 1u: { return !(u >= 7 && (v <= 1 || v >= 8)); }
    case 2u: { return u >= 0 && v >= -2 && (u - 3) * (u - 3) + (v - 2) * (v - 2) <= 36; }
    case 3u: { return true; }
    case 4u: { return u * u * 121 + (v - 5) * (v - 5) * 81 <= 9801; }
    default: { return true; }
  }
}

// one workgroup per edit; its threads share the pixels of the edit's bounding box
fn applyEdit(o: u32, li: u32) {
  let kind = aux[o]; let x = bitcast<i32>(aux[o + 1u]); let y = bitcast<i32>(aux[o + 2u]); let dir = bitcast<i32>(aux[o + 3u]);
  var u0 = 1; var v0 = 0; var bw = 8; var bh = 10;      // bash
  if (kind == K_MINE) { u0 = 0; v0 = -2; bw = 10; bh = 11; }
  if (kind == K_DIG) { u0 = -4; v0 = -2; bw = 9; bh = 2; }
  if (kind == K_BOMB) { u0 = -9; v0 = -6; bw = 19; bh = 23; }
  if (kind == K_BRICK) { u0 = 0; v0 = 0; bw = 6; bh = 1; }
  let mirror = kind != K_DIG && kind != K_BOMB;
  for (var k = i32(li); k < bw * bh; k += 64) {
    let u = u0 + k % bw; let v = v0 + k / bw;
    if (!inMask(kind, u, v)) { continue; }
    let px = x + select(u, dir * u, mirror); let py = y - v;
    if (px < 0 || px >= LW() || py < 0 || py >= LH()) { continue; }
    let p = u32(py * LW() + px);
    let m = ter[p] & 255u;
    if (kind == K_BRICK) { if (!isSolid(m)) { ter[p] = M_BRICK; } }
    else if (m != M_STEEL) { ter[p] = M_AIR; }
  }
}

@compute @workgroup_size(64) fn carve(@builtin(workgroup_id) wg: vec3u, @builtin(local_invocation_index) li: u32) {
  applyEdit(EOFF + wg.x * 4u, li);
}
@compute @workgroup_size(64) fn lay(@builtin(workgroup_id) wg: vec3u, @builtin(local_invocation_index) li: u32) {
  applyEdit(AOFF + wg.x * 4u, li);
}
