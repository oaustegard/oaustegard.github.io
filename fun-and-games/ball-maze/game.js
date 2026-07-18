/* Ball Maze — tilt-controlled labyrinth PWA.
 *
 * The maze is a perfect maze (recursive backtracker). Walls are merged into
 * axis-aligned rects for collision; the ball is a circle integrated with a
 * fixed timestep and resolved against nearby wall rects each substep.
 * Gravity comes from device orientation (beta/gamma), with keyboard and
 * pointer-drag fallbacks for desktop.
 */
(() => {
  'use strict';

  // ---------------------------------------------------------------- levels
  // Levels are endless and generated at runtime. The grid grows every level
  // until cells would drop below MIN_CELL px on this screen; after that,
  // difficulty keeps ramping through hole count alone. pathHoles sit ON the
  // solution path, offset to one side of the corridor so a narrow safe edge
  // remains; the rest go in dead ends as decoys.
  const MIN_CELL = 22;
  function levelSpec(n, availW, availH) {
    const cols = Math.max(4, Math.min(6 + 2 * (n - 1), Math.floor(availW / MIN_CELL)));
    const rows = Math.max(6, Math.min(9 + 3 * (n - 1), Math.floor(availH / MIN_CELL)));
    const pathHoles = n < 2 ? 0 : Math.min(n - 1, 14);
    const holes = n < 2 ? 0 : pathHoles + Math.min(2 * n - 3, 18);
    return { cols, rows, holes, pathHoles };
  }
  const LEVEL_BONUS = 100;   // × level number on completion
  const HOLE_PENALTY = 25;
  const BEST_KEY = 'ball-maze-best';
  const PROGRESS_KEY = 'ball-maze-progress';

  // physics constants (scaled by cell size where noted)
  const STEP = 1 / 120;      // fixed physics timestep, s
  const MAX_TILT = 28;       // degrees of device tilt for full acceleration
  const ACC = 42;            // × cellSize px/s² at full tilt
  const DAMP = 1.1;          // per-second velocity damping
  const REST = 0.32;         // wall bounce restitution
  const MAXV = 26;           // × cellSize px/s speed cap

  // hole geometry (× cellSize). An on-path hole is offset HOLE_OFFSET from
  // the corridor centerline; the ball falls in within HOLE_FALL × holeR of
  // its center. With wall thickness 0.12 and ball radius 0.27 the ball's
  // center can ride up to 0.17 from the centerline, so the open side leaves
  // a ~0.11-cell band of safe ball-center positions: passable, but tight.
  const BALL_R = 0.27;
  const WALL_T = 0.12;
  const HOLE_R = 0.27;
  const HOLE_OFFSET = 0.14;
  const HOLE_FALL = 0.72;

  // ---------------------------------------------------------------- dom
  const canvas = document.getElementById('board');
  const ctx = canvas.getContext('2d');
  const boardWrap = document.getElementById('board-wrap');
  const levelEl = document.getElementById('level-value');
  const scoreEl = document.getElementById('score-value');
  const bestEl = document.getElementById('best-value');
  const toastEl = document.getElementById('toast');
  const startOverlay = document.getElementById('start-overlay');
  const startBtn = document.getElementById('start-btn');
  const continueBtn = document.getElementById('continue-btn');
  const msgOverlay = document.getElementById('message-overlay');
  const msgTitle = document.getElementById('message-title');
  const msgPoints = document.getElementById('message-points');
  const msgBody = document.getElementById('message-body');
  const msgBtn = document.getElementById('message-btn');

  // ---------------------------------------------------------------- state
  const game = {
    state: 'idle',           // idle | playing | falling | between
    level: 0,                // 0-based level index (endless)
    score: 0,
    best: Number(localStorage.getItem(BEST_KEY)) || 0,
    distAcc: 0,              // px rolled since last distance point
    maze: null,
    ball: { x: 0, y: 0, vx: 0, vy: 0, r: 0 },
    fall: null,              // { hole, t } during fall animation
    tilt: { x: 0, y: 0 },    // smoothed control input, each in [-1, 1]
    raw: { x: 0, y: 0 },     // latest raw input from sensors/keys/drag
  };
  bestEl.textContent = game.best;

  // ---------------------------------------------------------------- maze
  function generateMaze(cols, rows) {
    // cells[r][c] = bitmask of open passages: 1=N 2=E 4=S 8=W
    const cells = Array.from({ length: rows }, () => new Array(cols).fill(0));
    const seen = Array.from({ length: rows }, () => new Array(cols).fill(false));
    const stack = [[0, 0]];
    seen[0][0] = true;
    const DIRS = [
      { dx: 0, dy: -1, bit: 1, opp: 4 },
      { dx: 1, dy: 0, bit: 2, opp: 8 },
      { dx: 0, dy: 1, bit: 4, opp: 1 },
      { dx: -1, dy: 0, bit: 8, opp: 2 },
    ];
    while (stack.length) {
      const [c, r] = stack[stack.length - 1];
      const options = DIRS.filter(d => {
        const nc = c + d.dx, nr = r + d.dy;
        return nc >= 0 && nc < cols && nr >= 0 && nr < rows && !seen[nr][nc];
      });
      if (!options.length) { stack.pop(); continue; }
      const d = options[(Math.random() * options.length) | 0];
      const nc = c + d.dx, nr = r + d.dy;
      cells[r][c] |= d.bit;
      cells[nr][nc] |= d.opp;
      seen[nr][nc] = true;
      stack.push([nc, nr]);
    }
    return cells;
  }

  function solvePath(cells, cols, rows) {
    // BFS from (0,0) to (cols-1, rows-1); returns the ordered path
    // start → goal as an array of [c, r]
    const prev = new Map();
    const queue = [[0, 0]];
    const visited = new Set(['0,0']);
    const moves = [
      { dx: 0, dy: -1, bit: 1 }, { dx: 1, dy: 0, bit: 2 },
      { dx: 0, dy: 1, bit: 4 }, { dx: -1, dy: 0, bit: 8 },
    ];
    while (queue.length) {
      const [c, r] = queue.shift();
      if (c === cols - 1 && r === rows - 1) break;
      for (const m of moves) {
        if (!(cells[r][c] & m.bit)) continue;
        const nc = c + m.dx, nr = r + m.dy, key = nc + ',' + nr;
        if (visited.has(key)) continue;
        visited.add(key);
        prev.set(key, c + ',' + r);
        queue.push([nc, nr]);
      }
    }
    const path = [];
    let key = (cols - 1) + ',' + (rows - 1);
    while (key) {
      path.push(key.split(',').map(Number));
      key = prev.get(key);
    }
    return path.reverse();
  }

  // Level construction is split in two so a resize or orientation flip can
  // re-layout the SAME maze at a new size instead of regenerating it:
  // generateLevelData() holds everything random in cell coordinates;
  // layoutMaze() turns that into pixels.
  function generateLevelData(levelIndex) {
    const availW = boardWrap.clientWidth - 8;
    const availH = boardWrap.clientHeight - 8;
    const spec = levelSpec(levelIndex + 1, availW, availH);
    const { cols, rows } = spec;
    const cells = generateMaze(cols, rows);
    const path = solvePath(cells, cols, rows);
    const pathSet = new Set(path.map(([c, r]) => c + ',' + r));
    const shuffle = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };
    const holeDefs = [];

    // on-path holes: straight corridor cells along the solution path, hole
    // offset perpendicular so the ball can squeeze past on the open side
    const straight = [];
    for (let i = 2; i < path.length - 2; i++) {
      const [pc, pr] = path[i - 1], [c, r] = path[i], [nc, nr] = path[i + 1];
      if (pc === c && nc === c) straight.push({ i, c, r, horizontal: false });
      else if (pr === r && nr === r) straight.push({ i, c, r, horizontal: true });
    }
    shuffle(straight);
    const picked = [];
    for (const s of straight) {
      if (picked.length >= spec.pathHoles) break;
      if (picked.some(p => Math.abs(p.i - s.i) < 3)) continue; // spread out
      picked.push(s);
    }
    for (const { c, r, horizontal } of picked) {
      holeDefs.push({ c, r, horizontal,
                      sign: Math.random() < 0.5 ? -1 : 1, onPath: true });
    }

    // decoy holes in cells off the path, away from start/goal
    const candidates = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (pathSet.has(c + ',' + r)) continue;
        if (c + r < 3) continue;                          // clear of start
        if ((cols - 1 - c) + (rows - 1 - r) < 2) continue; // clear of goal
        candidates.push([c, r]);
      }
    }
    shuffle(candidates);
    for (const [c, r] of candidates.slice(0, spec.holes - holeDefs.length)) {
      holeDefs.push({ c, r, horizontal: false, sign: 0, onPath: false });
    }

    return { cols, rows, cells, path, holeDefs };
  }

  function layoutMaze(data) {
    const { cols, rows, cells } = data;
    const availW = boardWrap.clientWidth - 8;
    const availH = boardWrap.clientHeight - 8;
    const cs = Math.max(8, Math.floor(Math.min(availW / cols, availH / rows)));
    const ox = Math.floor((boardWrap.clientWidth - cols * cs) / 2);
    const oy = Math.floor((boardWrap.clientHeight - rows * cs) / 2);
    const t = Math.max(3, Math.round(cs * WALL_T)); // wall thickness

    // merge wall segments into rects (runs along each grid line)
    const walls = [];
    for (let r = 0; r <= rows; r++) {           // horizontal walls
      let run = -1;
      for (let c = 0; c <= cols; c++) {
        const solid = c < cols &&
          (r === 0 ? !(cells[0][c] & 1) : !(cells[r - 1][c] & 4));
        if (solid && run < 0) run = c;
        if (!solid && run >= 0) {
          walls.push({ x: ox + run * cs - t / 2, y: oy + r * cs - t / 2,
                       w: (c - run) * cs + t, h: t });
          run = -1;
        }
      }
    }
    for (let c = 0; c <= cols; c++) {           // vertical walls
      let run = -1;
      for (let r = 0; r <= rows; r++) {
        const solid = r < rows &&
          (c === 0 ? !(cells[r][0] & 8) : !(cells[r][c - 1] & 2));
        if (solid && run < 0) run = r;
        if (!solid && run >= 0) {
          walls.push({ x: ox + c * cs - t / 2, y: oy + run * cs - t / 2,
                       w: t, h: (r - run) * cs + t });
          run = -1;
        }
      }
    }

    const holes = data.holeDefs.map(({ c, r, horizontal, sign, onPath }) => {
      const off = HOLE_OFFSET * cs * sign;
      return {
        x: ox + (c + 0.5) * cs + (horizontal ? 0 : off),
        y: oy + (r + 0.5) * cs + (horizontal ? off : 0),
        r: cs * HOLE_R,
        onPath,
      };
    });

    const maze = {
      data, cols, rows, cs, ox, oy, wallT: t, walls, holes, path: data.path,
      start: { x: ox + 0.5 * cs, y: oy + 0.5 * cs },
      goal: { x: ox + (cols - 0.5) * cs, y: oy + (rows - 0.5) * cs },
    };
    maze.board = prerenderBoard(maze);
    return maze;
  }

  function buildLevel(levelIndex) {
    return layoutMaze(generateLevelData(levelIndex));
  }

  // ---------------------------------------------------------------- render
  const dpr = () => Math.min(window.devicePixelRatio || 1, 3);

  function prerenderBoard(maze) {
    const scale = dpr();
    const off = document.createElement('canvas');
    off.width = boardWrap.clientWidth * scale;
    off.height = boardWrap.clientHeight * scale;
    const c = off.getContext('2d');
    c.scale(scale, scale);

    const { cols, rows, cs, ox, oy, wallT } = maze;
    const w = cols * cs, h = rows * cs;

    // board surface
    const grad = c.createLinearGradient(ox, oy, ox + w, oy + h);
    grad.addColorStop(0, '#caa05a');
    grad.addColorStop(1, '#a97f3e');
    c.fillStyle = grad;
    c.fillRect(ox, oy, w, h);
    c.strokeStyle = 'rgba(0,0,0,0.25)';
    c.lineWidth = 1;
    c.strokeRect(ox + 0.5, oy + 0.5, w - 1, h - 1);

    // goal cell
    c.fillStyle = 'rgba(46, 160, 87, 0.35)';
    c.fillRect(ox + (cols - 1) * cs, oy + (rows - 1) * cs, cs, cs);
    c.beginPath();
    c.arc(maze.goal.x, maze.goal.y, cs * 0.3, 0, Math.PI * 2);
    c.fillStyle = '#2ea057';
    c.fill();
    c.beginPath();
    c.arc(maze.goal.x, maze.goal.y, cs * 0.3, 0, Math.PI * 2);
    c.strokeStyle = 'rgba(0,0,0,0.3)';
    c.lineWidth = 2;
    c.stroke();

    // holes
    for (const hole of maze.holes) {
      const rim = c.createRadialGradient(hole.x, hole.y, hole.r * 0.2,
                                         hole.x, hole.y, hole.r);
      rim.addColorStop(0, '#050302');
      rim.addColorStop(0.75, '#1c1208');
      rim.addColorStop(1, '#4a3418');
      c.beginPath();
      c.arc(hole.x, hole.y, hole.r, 0, Math.PI * 2);
      c.fillStyle = rim;
      c.fill();
    }

    // walls
    c.fillStyle = '#6b4a1e';
    const rr = wallT / 2;
    for (const wall of maze.walls) {
      c.beginPath();
      if (c.roundRect) c.roundRect(wall.x, wall.y, wall.w, wall.h, rr);
      else c.rect(wall.x, wall.y, wall.w, wall.h);
      c.fill();
    }
    return off;
  }

  function draw() {
    const scale = dpr();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!game.maze) return;
    ctx.drawImage(game.maze.board, 0, 0);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    const b = game.ball;
    let bx = b.x, by = b.y, br = b.r;
    if (game.state === 'falling' && game.fall) {
      const k = Math.min(1, game.fall.t / 0.45);
      bx = b.x + (game.fall.hole.x - b.x) * k;
      by = b.y + (game.fall.hole.y - b.y) * k;
      br = b.r * (1 - k * 0.85);
    }

    // shadow, then steel ball
    ctx.beginPath();
    ctx.arc(bx + br * 0.18, by + br * 0.25, br, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fill();
    const g = ctx.createRadialGradient(bx - br * 0.35, by - br * 0.4, br * 0.1,
                                       bx, by, br);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.35, '#c9cdd4');
    g.addColorStop(1, '#6a7078');
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
  }

  // ---------------------------------------------------------------- physics
  function stepPhysics(dt) {
    const m = game.maze, b = game.ball;
    const cs = m.cs;

    // smooth control input
    game.tilt.x += (game.raw.x - game.tilt.x) * Math.min(1, 12 * dt);
    game.tilt.y += (game.raw.y - game.tilt.y) * Math.min(1, 12 * dt);

    b.vx += game.tilt.x * ACC * cs * dt;
    b.vy += game.tilt.y * ACC * cs * dt;
    const damp = Math.max(0, 1 - DAMP * dt);
    b.vx *= damp;
    b.vy *= damp;
    const vmax = MAXV * cs;
    const speed = Math.hypot(b.vx, b.vy);
    if (speed > vmax) { b.vx *= vmax / speed; b.vy *= vmax / speed; }

    const px = b.x, py = b.y;
    b.x += b.vx * dt;
    b.y += b.vy * dt;

    // collide with walls (circle vs AABB, closest-point)
    for (const w of m.walls) {
      if (b.x + b.r < w.x || b.x - b.r > w.x + w.w ||
          b.y + b.r < w.y || b.y - b.r > w.y + w.h) continue;
      const cx = Math.max(w.x, Math.min(b.x, w.x + w.w));
      const cy = Math.max(w.y, Math.min(b.y, w.y + w.h));
      let dx = b.x - cx, dy = b.y - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 >= b.r * b.r) continue;
      let nx, ny, d;
      if (d2 > 1e-9) {
        d = Math.sqrt(d2);
        nx = dx / d; ny = dy / d;
      } else {
        // center inside the rect (fast ball): push back the way it came
        d = 0;
        const len = Math.hypot(px - b.x, py - b.y) || 1;
        nx = (px - b.x) / len; ny = (py - b.y) / len;
      }
      b.x = cx + nx * b.r;
      b.y = cy + ny * b.r;
      const vn = b.vx * nx + b.vy * ny;
      if (vn < 0) {
        b.vx -= (1 + REST) * vn * nx;
        b.vy -= (1 + REST) * vn * ny;
      }
    }

    // distance points: one per cell-length rolled
    game.distAcc += Math.hypot(b.x - px, b.y - py);
    while (game.distAcc >= cs) {
      game.distAcc -= cs;
      addScore(1);
    }

    // holes
    for (const hole of m.holes) {
      if (Math.hypot(b.x - hole.x, b.y - hole.y) < hole.r * HOLE_FALL) {
        startFall(hole);
        return;
      }
    }

    // goal
    if (Math.hypot(b.x - m.goal.x, b.y - m.goal.y) < cs * 0.35) {
      completeLevel();
    }
  }

  // ---------------------------------------------------------------- scoring
  function addScore(points) {
    game.score = Math.max(0, game.score + points);
    scoreEl.textContent = game.score;
    if (game.score > game.best) {
      game.best = game.score;
      bestEl.textContent = game.best;
      localStorage.setItem(BEST_KEY, String(game.best));
    }
    saveProgress();
  }

  // ---------------------------------------------------------------- progress
  // The run (level + score) survives closing the app: saved on every score
  // change and level transition, restored via the Continue button. A resume
  // regenerates a fresh maze of the saved level — mazes are random anyway.
  function saveProgress(level = game.level) {
    try {
      localStorage.setItem(PROGRESS_KEY,
        JSON.stringify({ level, score: game.score }));
    } catch { /* storage full/blocked — play on without persistence */ }
  }

  function loadProgress() {
    try {
      const p = JSON.parse(localStorage.getItem(PROGRESS_KEY));
      if (p && Number.isInteger(p.level) && p.level >= 0 &&
          Number.isInteger(p.score) && p.score >= 0) {
        return p;
      }
    } catch { /* corrupt entry — treat as no progress */ }
    return null;
  }

  let toastTimer = 0;
  function toast(text) {
    toastEl.textContent = text;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1600);
  }

  // ---------------------------------------------------------------- flow
  function resetBall() {
    const b = game.ball, m = game.maze;
    b.x = m.start.x;
    b.y = m.start.y;
    b.vx = b.vy = 0;
    b.r = m.cs * BALL_R;
  }

  function startLevel(levelIndex) {
    game.level = levelIndex;
    game.maze = buildLevel(levelIndex);
    game.distAcc = 0;
    game.fall = null;
    resetBall();
    levelEl.textContent = String(levelIndex + 1);
    game.state = 'playing';
    saveProgress();
  }

  function startFall(hole) {
    game.state = 'falling';
    game.fall = { hole, t: 0 };
    addScore(-HOLE_PENALTY);
    toast('−' + HOLE_PENALTY + ' Down the hole!');
    if (navigator.vibrate) navigator.vibrate(60);
  }

  function completeLevel() {
    const level = game.level + 1;
    const bonus = LEVEL_BONUS * level;
    addScore(bonus);
    saveProgress(game.level + 1); // quitting at the overlay resumes at next level
    if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
    game.state = 'between';
    const milestone = level % 5 === 0;
    showMessage(
      (milestone ? '🏆 ' : '') + 'Level ' + level + ' complete!',
      '+' + bonus,
      milestone
        ? level + ' levels down, ' + game.score + ' points. The mazes keep coming — how far can you get?'
        : 'Next: a fresh maze, a little meaner.',
      'Level ' + (level + 1),
      () => startLevel(game.level + 1));
  }

  let messageAction = null;
  function showMessage(title, points, body, btnLabel, action) {
    msgTitle.textContent = title;
    msgPoints.textContent = points;
    msgBody.textContent = body;
    msgBtn.textContent = btnLabel;
    messageAction = action;
    msgOverlay.classList.remove('hidden');
  }
  msgBtn.addEventListener('click', () => {
    msgOverlay.classList.add('hidden');
    if (messageAction) messageAction();
  });

  // ---------------------------------------------------------------- loop
  let lastTime = 0;
  let acc = 0;
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - lastTime) / 1000 || 0);
    lastTime = now;

    if (game.state === 'playing') {
      acc += dt;
      while (acc >= STEP) {
        acc -= STEP;
        stepPhysics(STEP);
        if (game.state !== 'playing') { acc = 0; break; }
      }
    } else if (game.state === 'falling' && game.fall) {
      game.fall.t += dt;
      if (game.fall.t >= 0.55) {
        game.fall = null;
        resetBall();
        game.state = 'playing';
      }
    }
    draw();
  }
  requestAnimationFrame(frame);

  // ---------------------------------------------------------------- input
  function handleOrientation(e) {
    if (e.beta == null || e.gamma == null) return;
    // beta/gamma are device axes, and the counter-rotation keeps the UI in
    // device coordinates too, so the identity mapping is always correct
    game.raw.x = Math.max(-1, Math.min(1, e.gamma / MAX_TILT));
    game.raw.y = Math.max(-1, Math.min(1, e.beta / MAX_TILT));
  }

  async function enableTilt() {
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' &&
          typeof DeviceOrientationEvent.requestPermission === 'function') {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res !== 'granted') return false;
      }
      window.addEventListener('deviceorientation', handleOrientation);
      return true;
    } catch {
      return false;
    }
  }

  // keyboard fallback
  const keys = new Set();
  function keysToTilt() {
    let x = 0, y = 0;
    if (keys.has('ArrowLeft') || keys.has('KeyA')) x -= 1;
    if (keys.has('ArrowRight') || keys.has('KeyD')) x += 1;
    if (keys.has('ArrowUp') || keys.has('KeyW')) y -= 1;
    if (keys.has('ArrowDown') || keys.has('KeyS')) y += 1;
    game.raw.x = x * 0.5;
    game.raw.y = y * 0.5;
  }
  window.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
      e.preventDefault();
    }
    keys.add(e.code);
    keysToTilt();
  });
  window.addEventListener('keyup', (e) => { keys.delete(e.code); keysToTilt(); });

  // pointer-drag fallback: tilt follows drag offset from touch point
  let dragOrigin = null;
  boardWrap.addEventListener('pointerdown', (e) => {
    dragOrigin = { x: e.clientX, y: e.clientY };
    boardWrap.setPointerCapture(e.pointerId);
  });
  boardWrap.addEventListener('pointermove', (e) => {
    if (!dragOrigin) return;
    // pointer coords are viewport-based; undo the counter-rotation so the
    // drag matches what the player sees
    const dxv = e.clientX - dragOrigin.x, dyv = e.clientY - dragOrigin.y;
    let dx, dy;
    switch (uiAngle) {
      case 90: dx = -dyv; dy = dxv; break;
      case 270: dx = dyv; dy = -dxv; break;
      case 180: dx = -dxv; dy = -dyv; break;
      default: dx = dxv; dy = dyv;
    }
    game.raw.x = Math.max(-1, Math.min(1, dx / 90));
    game.raw.y = Math.max(-1, Math.min(1, dy / 90));
  });
  const endDrag = () => {
    dragOrigin = null;
    game.raw.x = 0;
    game.raw.y = 0;
  };
  boardWrap.addEventListener('pointerup', endDrag);
  boardWrap.addEventListener('pointercancel', endDrag);

  // ------------------------------------------------------- orientation lock
  // iOS Safari offers no way for a web app to lock orientation, so when the
  // OS flips the viewport to landscape we counter-rotate #app back to the
  // device's natural portrait with a CSS transform. Visually the game never
  // leaves portrait — no OS orientation lock needed. While the fix is
  // active, tilt and drag input use raw device axes (identity mapping),
  // since the UI is already back in device coordinates.
  const appEl = document.getElementById('app');
  let uiAngle = 0; // viewport rotation the fix is currently countering

  function orientationAngle() {
    const a = (screen.orientation && screen.orientation.angle != null)
      ? screen.orientation.angle
      : (window.orientation || 0);
    return ((a % 360) + 360) % 360;
  }

  function applyOrientationFix(forceAngle) {
    uiAngle = forceAngle != null ? forceAngle : orientationAngle();
    const s = appEl.style;
    if (uiAngle === 90 || uiAngle === 270) {
      const w = window.innerHeight, h = window.innerWidth; // device-portrait box
      s.width = w + 'px';
      s.height = h + 'px';
      s.transformOrigin = 'top left';
      s.transform = uiAngle === 90
        ? 'translateY(' + w + 'px) rotate(-90deg)'
        : 'translateX(' + h + 'px) rotate(90deg)';
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

  async function tryNativeLock() {
    // works in installed/fullscreen contexts on Android; iOS throws and we
    // fall back to the CSS counter-rotation above
    try {
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock('portrait');
      }
    } catch { /* not supported here — counter-rotation covers it */ }
  }

  // ---------------------------------------------------------------- resize
  function resizeCanvas() {
    applyOrientationFix();
    const scale = dpr();
    canvas.width = boardWrap.clientWidth * scale;
    canvas.height = boardWrap.clientHeight * scale;
    if (game.maze) {
      // re-layout the SAME maze at the new size and carry the ball across
      // proportionally — an orientation flip must not cost progress
      const old = game.maze, b = game.ball;
      const fx = (b.x - old.ox) / old.cs, fy = (b.y - old.oy) / old.cs;
      game.maze = layoutMaze(old.data);
      const m = game.maze, k = m.cs / old.cs;
      b.x = m.ox + fx * m.cs;
      b.y = m.oy + fy * m.cs;
      b.vx *= k;
      b.vy *= k;
      b.r = m.cs * BALL_R;
    }
  }
  window.addEventListener('resize', () => {
    clearTimeout(resizeCanvas._t);
    resizeCanvas._t = setTimeout(resizeCanvas, 150);
  });
  window.addEventListener('orientationchange', () => {
    clearTimeout(resizeCanvas._t);
    resizeCanvas._t = setTimeout(resizeCanvas, 150);
  });
  resizeCanvas();

  // ---------------------------------------------------------------- wake lock
  let wakeLock = null;
  async function keepAwake() {
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await navigator.wakeLock.request('screen');
      }
    } catch { /* not critical */ }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && game.state !== 'idle') {
      keepAwake();
    }
  });

  // ---------------------------------------------------------------- start
  async function beginGame(level, score) {
    const tiltOk = await enableTilt();
    startOverlay.classList.add('hidden');
    keepAwake();
    tryNativeLock();
    game.score = score;
    scoreEl.textContent = score;
    startLevel(level);
    if (!tiltOk) toast('No tilt sensor — use keys or drag');
  }

  const savedRun = loadProgress();
  if (savedRun && (savedRun.level > 0 || savedRun.score > 0)) {
    continueBtn.textContent = 'Continue · Level ' + (savedRun.level + 1);
    continueBtn.classList.remove('hidden');
    startBtn.textContent = 'Start over';
    startBtn.classList.add('secondary');
  }
  continueBtn.addEventListener('click', () =>
    beginGame(savedRun.level, savedRun.score));
  startBtn.addEventListener('click', () => beginGame(0, 0));

  // expose internals for automated tests when loaded with ?debug
  if (new URLSearchParams(location.search).has('debug')) {
    window.__ballMaze = { game, startLevel, applyOrientationFix, resizeCanvas };
  }

  // ---------------------------------------------------------------- pwa
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
})();
