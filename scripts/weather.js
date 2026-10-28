/* weather.js: the weather now at Austegarden, drawn on the map of sheet pages (home, its loupe, and band).
   Reads MET Norway's locationforecast once per forecast update (the Expires header, kept in localStorage),
   writes a one-line readout (#wx on the home page, after the coordinates in the sheet bar elsewhere),
   and, where WebGPU is available, draws the sea and the sky under the map lines in a chart engraver's hand:
   wave lines that follow the coast and move in on the shores facing the wind, crest dashes on open water,
   rain rings, snow, and hatched cloud shadows drifting with the wind. Fog fades the map itself (CSS --wx-fog).
   The coast comes from the map SVG on the page: its sea and lake fills are rasterised into a mask, and a
   jump-flood compute pass turns that into the distance from each water texel to the nearest land.
   No WebGPU: readout only. No data: calm default, no readout. prefers-reduced-motion: one still frame.
   ?wx=ws:12,wd:200,cl:90,pr:2,fog:0,t:8,sym:rain previews any weather (values as MET Norway gives them). */
(function () {
  var d = document, b = d.body, mode = b.getAttribute('data-sheet');
  if (mode !== 'full' && mode !== 'band') return;
  var home = mode === 'full', KEY = 'wx1', LAT = 60.5377, LON = 5.2608,
      API = 'https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=' + LAT + '&lon=' + LON,
      still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── data ─────────────────────────────────────────────────────── */

  function pick(j) {
    var ts = j.properties.timeseries, now = Date.now(), e = ts[0];
    for (var i = 0; i < ts.length && Date.parse(ts[i].time) <= now; i++) e = ts[i];
    var x = e.data.instant.details, n = e.data.next_1_hours || e.data.next_6_hours;
    return { t: x.air_temperature, ws: x.wind_speed, wd: x.wind_from_direction, cl: x.cloud_area_fraction,
             fog: x.fog_area_fraction || 0, pr: n && n.details ? n.details.precipitation_amount || 0 : 0,
             sym: n && n.summary ? n.summary.symbol_code : '' };
  }

  function preview() {
    var m = /[?&]wx=([^&]*)/.exec(location.search);
    if (!m) return null;
    var w = { t: 8, ws: 4, wd: 220, cl: 50, fog: 0, pr: 0, sym: 'partlycloudy_day' };
    decodeURIComponent(m[1]).split(',').forEach(function (kv) {
      var p = kv.split(':');
      if (p[0] in w) w[p[0]] = p[0] === 'sym' ? p[1] : parseFloat(p[1]);
    });
    return w;
  }

  /* resolves to the weather, or null when it cannot be had */
  function load() {
    var p = preview();
    if (p) return Promise.resolve(p);
    var c = null;
    try { c = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    if (c && c.exp > Date.now()) return Promise.resolve(c.w);
    return fetch(API, { priority: 'low' }).then(function (r) {
      if (!r.ok) throw r.status;
      var exp = Date.parse(r.headers.get('Expires')) || Date.now() + 18e5;
      return r.json().then(function (j) {
        var w = pick(j);
        try { localStorage.setItem(KEY, JSON.stringify({ exp: exp, w: w })); } catch (e) {}
        return w;
      });
    }).catch(function () { return c ? c.w : null; });
  }

  var DIRS = 'N NNE NE ENE E ESE SE SSE S SSW SW WSW W WNW NW NNW'.split(' ');
  function sky(code) {
    var s = code.replace(/_(day|night|polartwilight)$/, ''),
        w = { clearsky: 'clear sky', fair: 'fair', partlycloudy: 'partly cloudy', cloudy: 'cloudy', fog: 'fog' };
    return w[s] || s.replace(/^light(s(?=s))?/, 'light ').replace(/^heavy/, 'heavy ')
                    .replace('andthunder', ' and thunder').replace('showers', ' showers');
  }

  function readout(w) {
    var deg = Math.round(w.t) + '°', wind = DIRS[Math.round(w.wd / 22.5) % 16] + ' ' + Math.round(w.ws) + ' m/s',
        what = w.sym ? sky(w.sym) : '', src = 'https://www.met.no/en/free-meteorological-data';
    if (home) {
      var el = d.getElementById('wx');
      if (!el) return;
      el.querySelector('dd').innerHTML = deg + 'C' + (what ? ', ' + what : '') + '<br>wind ' + wind +
        ' &middot; <a href="' + src + '">MET Norway</a>';
      el.hidden = false;
    } else {
      var co = d.querySelector('.sheet-bar .coords');
      if (!co) return;
      var a = d.createElement('a');
      a.className = 'wx'; a.href = src;
      a.title = 'Weather now at Austegarden' + (what ? ': ' + what : '') + '. Data from MET Norway (CC BY 4.0)';
      a.textContent = deg + ' ' + wind;
      co.appendChild(d.createTextNode(' · '));
      co.appendChild(a);
    }
  }

  /* shader parameters from the weather; null gives a calm, half-cloudy default */
  function params(w) {
    w = w || { ws: 3, wd: 220, cl: 40, fog: 0, pr: 0, sym: '' };
    var r = (w.wd + 180) * Math.PI / 180, s = w.sym || '',
        wet = /rain|sleet|drizzle/.test(s) || (w.pr > 0 && !/snow/.test(s)), white = /snow|sleet/.test(s);
    return {
      dir: [Math.sin(r), -Math.cos(r)],   /* where the wind blows to, plane x east and y south */
      ws: Math.min(w.ws / 14, 1),
      cl: Math.min(w.cl / 100, 1),
      rain: wet ? Math.min(.06 + w.pr / 8, .5) : 0,
      snow: white ? Math.min(.15 + w.pr / 4, .6) : 0,
      night: /_night$/.test(s) ? 1 : 0,
      fog: Math.min((w.fog || 0) / 100, 1)
    };
  }

  /* ── WebGPU ───────────────────────────────────────────────────── */

  var TEXEL = 2,     /* map units per mask texel */
      MAXT = 80;     /* distance range in texels (160 units, 400 m) */

  var JFA = /* wgsl */ `
@group(0) @binding(0) var mask: texture_2d<f32>;
@group(0) @binding(1) var<storage, read> src: array<vec2i>;
@group(0) @binding(2) var<storage, read_write> dst: array<vec2i>;
@group(0) @binding(3) var<uniform> P: vec4i;   // width, height, step, pass (0 seed, 1 flood, 2 write)
@group(0) @binding(4) var out: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3u) {
  let p = vec2i(gid.xy);
  if (p.x >= P.x || p.y >= P.y) { return; }
  let i = p.y * P.x + p.x;
  if (P.w == 0) {
    dst[i] = select(vec2i(-1), p, textureLoad(mask, p, 0).a < 0.5);   // land texels are the seeds
    return;
  }
  if (P.w == 1) {
    var best = src[i];
    var bd = 1e20;
    if (best.x >= 0) { let v = vec2f(best - p); bd = dot(v, v); }
    for (var dy = -1; dy <= 1; dy++) {
      for (var dx = -1; dx <= 1; dx++) {
        let q = p + vec2i(dx, dy) * P.z;
        if (q.x < 0 || q.y < 0 || q.x >= P.x || q.y >= P.y) { continue; }
        let s = src[q.y * P.x + q.x];
        if (s.x < 0) { continue; }
        let v = vec2f(s - p);
        let dd = dot(v, v);
        if (dd < bd) { bd = dd; best = s; }
      }
    }
    dst[i] = best;
    return;
  }
  let s = src[i];
  var dn = 1.0;
  if (s.x >= 0) { dn = min(length(vec2f(s - p)) / ${MAXT}.0, 1.0); }
  textureStore(out, p, vec4f(textureLoad(mask, p, 0).a, dn, 0.0, 1.0));
}`;

  var DRAW = /* wgsl */ `
struct U {
  res: vec2f, scale: f32, time: f32,   // canvas px; map units per canvas px; seconds
  origin: vec2f, map: vec2f,           // map units at the canvas top left; map size in units
  dir: vec2f, ws: f32, cl: f32,        // wind (blows to), wind 0..1, cloud cover 0..1
  rain: f32, snow: f32, night: f32, px: f32,   // px: canvas px per CSS px
  water: vec4f, ink: vec4f,
  geo: vec4f,                          // metres per map unit; map origin in metres east and south of the sheet's top left
};
@group(0) @binding(0) var<uniform> u: U;
@group(0) @binding(1) var tex: texture_2d<f32>;
@group(0) @binding(2) var smp: sampler;

const MAXD = ${MAXT * TEXEL}.0;

@vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
  let p = vec2f(f32((i << 1u) & 2u), f32(i & 2u));
  return vec4f(p * 2.0 - 1.0, 0.0, 1.0);
}

fn hash(p: vec2f) -> f32 {
  let q = bitcast<vec2u>(vec2i(floor(p)));
  var h = q.x * 1664525u + q.y * 1013904223u + 374761393u;
  h = (h ^ (h >> 16u)) * 2246822519u;
  h = (h ^ (h >> 13u)) * 3266489917u;
  return f32(h ^ (h >> 16u)) / 4294967295.0;
}
fn noise(p: vec2f) -> f32 {
  let i = floor(p); let f = fract(p); let w = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2f(1.0, 0.0)), w.x), mix(hash(i + vec2f(0.0, 1.0)), hash(i + vec2f(1.0, 1.0)), w.x), w.y);
}
fn fbm(p0: vec2f) -> f32 {
  var p = p0; var a = 0.5; var s = 0.0;
  for (var k = 0; k < 5; k++) { s += a * noise(p); p = mat2x2f(1.6, 1.2, -1.2, 1.6) * p; a *= 0.5; }
  return s / 0.97;
}
// coverage of a stroke of width w CSS px, at distance dm map units from its centre line
fn stroke(dm: f32, w: f32) -> f32 {
  let x = abs(dm) / u.scale;
  let h = 0.5 * w * u.px;
  return 1.0 - smoothstep(h - 0.6, h + 0.6, x);
}

@fragment fn fs(@builtin(position) fc: vec4f) -> @location(0) vec4f {
  let m = u.origin + fc.xy * u.scale;
  let uv = m / u.map;
  let inside = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
  let s = textureSampleLevel(tex, smp, uv, 0.0);
  let wet = smoothstep(0.35, 0.65, s.r) * inside;
  let dist = s.g * MAXD;
  let e = vec2f(${TEXEL}.0 * 1.5) / u.map;
  let g = vec2f(textureSampleLevel(tex, smp, uv + vec2f(e.x, 0.0), 0.0).g - textureSampleLevel(tex, smp, uv - vec2f(e.x, 0.0), 0.0).g,
                textureSampleLevel(tex, smp, uv + vec2f(0.0, e.y), 0.0).g - textureSampleLevel(tex, smp, uv - vec2f(0.0, e.y), 0.0).g);
  let out = g / max(length(g), 1e-6);          // points out to sea
  let t = u.time;
  let k1 = max(1.0, u.scale * u.px);           // map units per CSS px, at least one
  var wa = 0.0;

  // 1. wave lines that follow the coast, spaced like a chart's, rolling in on the shores the wind faces
  let S = 6.0 * k1;
  let face = clamp(dot(u.dir, -out), 0.0, 1.0);
  let wob = (noise(m * 0.03 / k1 + vec2f(t * 0.05, 0.0)) - 0.5) * S * (0.4 + 0.9 * u.ws);
  let ph = (dist + wob) / S + t * (0.08 + 0.3 * u.ws) * (0.3 + 0.7 * face);
  let k = floor(ph + 0.5);
  let n = 1.6 + (1.2 + 2.6 * u.ws) * (0.35 + 0.65 * face);
  let brk = smoothstep(0.25, 0.4, noise(m * 0.06 / k1 + vec2f(k * 7.31, k * 3.17)));
  let coast = stroke((ph - k) * S, 0.9) * smoothstep(S * 0.45, S * 1.05, dist) * (1.0 - smoothstep(S * (n - 1.0), S * n, dist)) * brk;
  wa = max(wa, coast * (0.5 + 0.35 * face));

  // 2. crest dashes on open water, across the wind, riding downwind; more of them as it blows
  let nr = vec2f(-u.dir.y, u.dir.x);
  let cell = vec2f(11.0, 26.0) * k1;
  let q = vec2f(dot(m, u.dir), dot(m, nr)) - vec2f(t * (1.0 + 5.0 * u.ws) * k1, 0.0);
  let id = floor(q / cell);
  let h1 = hash(id); let h2 = hash(id + vec2f(17.0, 5.0)); let h3 = hash(id + vec2f(3.0, 29.0));
  let rel = q - (id + 0.5 + (vec2f(h1, h3) - 0.5) * vec2f(0.4, 0.5)) * cell;
  let life = fract(t * 0.06 + h1 * 7.0);
  let L = cell.y * (0.14 + 0.3 * u.ws) * sin(3.14159 * life);
  let dash = stroke(rel.x + rel.y * rel.y / (cell.y * 1.6), 0.85) * (1.0 - smoothstep(L * 0.55, L, abs(rel.y)));
  wa = max(wa, dash * step(h2, 0.03 + 0.4 * u.ws * sqrt(u.ws)) * smoothstep(S * 1.4, S * 3.5, dist) * 0.55);

  // 3. rain rings
  if (u.rain > 0.0) {
    let rc = 15.0 * k1;
    let rp = m / rc + vec2f(0.37, 0.71);
    let ri = floor(rp);
    let rh = hash(ri + vec2f(41.0, 7.0));
    let rt = t * 0.7 + rh * 13.0;
    let rl = fract(rt); let cyc = floor(rt);
    let ro = vec2f(hash(ri + vec2f(cyc, 3.0)), hash(ri + vec2f(5.0, cyc))) * 0.6 + 0.2;
    let rr = length(rp - ri - ro) * rc;
    let ring = stroke(rr - rl * rc * 0.3, 0.8) * (1.0 - rl) * step(hash(ri + vec2f(cyc, cyc)), u.rain);
    wa = max(wa, ring * 0.45);
  }
  wa *= wet;

  // 4. cloud shadows: hatched, drifting with the wind, the cover set by the forecast
  // in sheet metres, so the home map, the band and the loupe share one sky
  let wm = u.geo.yz + m * u.geo.x;
  let drift = u.dir * t * (2.0 + 14.0 * u.ws);
  let cn = fbm((wm - drift) * 0.00096 + vec2f(0.0, t * 0.003));
  let th = mix(0.8, 0.34, u.cl);
  let cd = smoothstep(th, th + 0.2, cn);
  let hs = 4.5 * k1;
  let hp = (m.x + m.y) / hs;
  let hatch = stroke((fract(hp + 0.5) - 0.5) * hs * 0.7071, 0.7);
  var ia = cd * (0.05 + 0.16 * hatch) + u.cl * 0.025 + u.night * 0.06;

  // 5. snow: ink flecks blowing across
  if (u.snow > 0.0) {
    let sc = 9.0 * k1;
    let sp = (m - u.dir * t * (3.0 + 8.0 * u.ws) * k1 - vec2f(t * 0.7, t * 1.3) * k1) / sc;
    let si = floor(sp);
    let so = vec2f(hash(si), hash(si + vec2f(1.0, 9.0))) * 0.7 + 0.15;
    let fl = 1.0 - smoothstep(0.6, 1.4, length(sp - si - so) * sc / u.scale / u.px);
    ia = max(ia, fl * step(hash(si + vec2f(4.0, 4.0)), u.snow) * 0.5);
  }
  ia *= inside;

  let a = wa * u.water.a + ia * u.ink.a * (1.0 - wa * u.water.a);
  let c = u.water.rgb * wa * u.water.a + u.ink.rgb * ia * u.ink.a * (1.0 - wa * u.water.a);
  return vec4f(c, a);
}`;

  function colour(v) {
    var c = d.createElement('canvas').getContext('2d');
    c.fillStyle = v || '#000'; c.fillRect(0, 0, 1, 1);
    var p = c.getImageData(0, 0, 1, 1).data;
    return [p[0] / 255, p[1] / 255, p[2] / 255];
  }

  /* the map SVG with only its water filled, rasterised to an image of w x h */
  function waterMask(url, w, h) {
    return fetch(url).then(function (r) { return r.text(); }).then(function (svg) {
      svg = svg.replace(/<style>[\s\S]*?<\/style>/, '<style>path{fill:none;stroke:none}.sea{fill:#fff;fill-rule:evenodd}.lk{fill:#fff}</style>');
      var i = new Image(), u = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      i.src = u;
      return i.decode().then(function () {
        var c = d.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(i, 0, 0, w, h);
        URL.revokeObjectURL(u);
        return c;
      });
    });
  }

  function gpu(cv, url, MW, MH, view, geo) {
    var dev, ctx, pipe, bind, ubuf, data = new Float32Array(28), cur = null, aim = null, last = -1e9, raf = 0, on = true;
    var TW = MW / TEXEL, TH = MH / TEXEL;
    return navigator.gpu.requestAdapter({ powerPreference: 'low-power' }).then(function (ad) {
      if (!ad) throw 'no adapter';
      return ad.requestDevice();
    }).then(function (dv) {
      dev = dv;
      return waterMask(url, TW, TH);
    }).then(function (mc) {
      /* compile off the main thread: the first synchronous compile took 0.9 s on an iPhone */
      var fmt = navigator.gpu.getPreferredCanvasFormat(), mod = dev.createShaderModule({ code: DRAW });
      return Promise.all([mc,
        dev.createComputePipelineAsync({ layout: 'auto', compute: { module: dev.createShaderModule({ code: JFA }), entryPoint: 'main' } }),
        dev.createRenderPipelineAsync({ layout: 'auto', vertex: { module: mod, entryPoint: 'vs' },
          fragment: { module: mod, entryPoint: 'fs', targets: [{ format: fmt }] }, primitive: { topology: 'triangle-list' } }), fmt]);
    }).then(function (r) {
      var mc = r[0], jfa = r[1], fmt = r[3], U = GPUTextureUsage, B = GPUBufferUsage;
      pipe = r[2];
      var mask = dev.createTexture({ size: [TW, TH], format: 'rgba8unorm', usage: U.TEXTURE_BINDING | U.COPY_DST | U.RENDER_ATTACHMENT });
      dev.queue.copyExternalImageToTexture({ source: mc }, { texture: mask }, [TW, TH]);
      var field = dev.createTexture({ size: [TW, TH], format: 'rgba8unorm', usage: U.TEXTURE_BINDING | U.STORAGE_BINDING });

      /* jump flood: seed, halve the step down to 1, write mask and distance */
      var bufs = [0, 1].map(function () { return dev.createBuffer({ size: TW * TH * 8, usage: B.STORAGE }); });
      var steps = [[0, 0]];
      for (var st = 1 << Math.ceil(Math.log2(Math.max(TW, TH))) >> 1; st >= 1; st >>= 1) steps.push([st, 1]);
      steps.push([1, 1], [0, 2]);   /* one extra step of 1 (JFA+1) mends most of the flood's misses */
      var enc = dev.createCommandEncoder(), fv = field.createView(), mv = mask.createView();
      steps.forEach(function (s, k) {
        var ub = dev.createBuffer({ size: 16, usage: B.UNIFORM | B.COPY_DST });
        dev.queue.writeBuffer(ub, 0, new Int32Array([TW, TH, s[0], s[1]]));
        var from = bufs[(k + 1) & 1], to = bufs[k & 1];
        var pass = enc.beginComputePass();
        pass.setPipeline(jfa);
        pass.setBindGroup(0, dev.createBindGroup({ layout: jfa.getBindGroupLayout(0), entries: [
          { binding: 0, resource: mv }, { binding: 1, resource: { buffer: from } }, { binding: 2, resource: { buffer: to } },
          { binding: 3, resource: { buffer: ub } }, { binding: 4, resource: fv }] }));
        pass.dispatchWorkgroups(Math.ceil(TW / 8), Math.ceil(TH / 8));
        pass.end();
      });
      dev.queue.submit([enc.finish()]);

      ctx = cv.getContext('webgpu');
      ctx.configure({ device: dev, format: fmt, alphaMode: 'premultiplied' });
      ubuf = dev.createBuffer({ size: data.byteLength, usage: B.UNIFORM | B.COPY_DST });
      bind = dev.createBindGroup({ layout: pipe.getBindGroupLayout(0), entries: [
        { binding: 0, resource: { buffer: ubuf } }, { binding: 1, resource: fv },
        { binding: 2, resource: dev.createSampler({ magFilter: 'linear', minFilter: 'linear' }) }] });
      dev.lost.then(function (i) { on = false; cv.remove(); console.warn('weather.js: device lost', i.message); });

      var dark = matchMedia('(prefers-color-scheme: dark)');
      function inks() {
        var cs = getComputedStyle(d.documentElement), dk = dark.matches;
        data.set(colour(cs.getPropertyValue('--water')).concat(dk ? .75 : .7), 16);
        data.set(colour(cs.getPropertyValue('--ink')).concat(dk ? .55 : .7), 20);
      }
      inks();
      data.set(geo, 24);
      dark.addEventListener('change', function () { inks(); render(); });

      function size() {
        var px = Math.min(devicePixelRatio || 1, 2), w = Math.max(1, Math.round(cv.clientWidth * px)), h = Math.max(1, Math.round(cv.clientHeight * px));
        if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
        return px;
      }

      function render(now) {
        if (!on || !cur) return;
        var px = size(), v = view(cv.clientWidth, cv.clientHeight), t = (now === undefined ? performance.now() : now) / 1000;
        if (still) t = 400;
        for (var key in aim) {
          if (key === 'dir') { cur.dir[0] += (aim.dir[0] - cur.dir[0]) * .05; cur.dir[1] += (aim.dir[1] - cur.dir[1]) * .05; }
          else cur[key] += (aim[key] - cur[key]) * .05;
        }
        var dl = Math.hypot(cur.dir[0], cur.dir[1]) || 1;
        data.set([cv.width, cv.height, v.scale / px, t, v.x, v.y, MW, MH,
                  cur.dir[0] / dl, cur.dir[1] / dl, cur.ws, cur.cl, cur.rain, cur.snow, cur.night, px]);
        dev.queue.writeBuffer(ubuf, 0, data);
        var e = dev.createCommandEncoder(), p = e.beginRenderPass({ colorAttachments: [{ view: ctx.getCurrentTexture().createView(),
          loadOp: 'clear', clearValue: [0, 0, 0, 0], storeOp: 'store' }] });
        p.setPipeline(pipe); p.setBindGroup(0, bind); p.draw(3); p.end();
        dev.queue.submit([e.finish()]);
      }

      function frame(now) {
        raf = 0;
        if (!on || d.hidden) return;
        raf = requestAnimationFrame(frame);
        if (now - last < 33) return;   /* about 30 frames a second is plenty for water */
        last = now; render(now);
      }
      function go() { if (!still && !raf) raf = requestAnimationFrame(frame); else render(); }
      d.addEventListener('visibilitychange', go);
      if (window.ResizeObserver) new ResizeObserver(function () { render(); }).observe(cv);

      return {
        set: function (p) {
          aim = p;
          if (!cur || still) cur = JSON.parse(JSON.stringify(p));
          cv.classList.add('on');
          go();
        },
        render: render,
        pause: function (v) { on = !v; if (on) go(); }
      };
    });
  }

  /* ── wiring ───────────────────────────────────────────────────── */

  function fog(p) { d.documentElement.style.setProperty('--wx-fog', p.fog.toFixed(2)); }

  /* one canvas of sea and sky over a map: url and size in map units, view(W, H) gives the map units at the
     canvas's top left and per CSS px, geo = [metres per unit, origin metres east, origin metres south] of the sheet */
  function paint(p, before, url, MW, MH, view, geo, hook) {
    var cv = d.createElement('canvas');
    cv.className = 'wx-sky'; cv.setAttribute('aria-hidden', 'true');
    before.parentNode.insertBefore(cv, before);
    gpu(cv, url, MW, MH, view, geo.concat(0)).then(function (g) {
      g.set(p);
      if (hook) hook(g);
      else if (window.IntersectionObserver) new IntersectionObserver(function (es) { g.pause(!es[0].isIntersecting); }).observe(cv);
    }).catch(function (e) { cv.remove(); console.warn('weather.js: no sea and sky', e); });
  }

  function start(w) {
    if (w) readout(w);
    var p = params(w);
    fog(p);
    if (!navigator.gpu || (navigator.connection && navigator.connection.saveData)) return;
    if (!home) {
      /* the band is the 2400 x 600 SVG drawn with background-size: cover, centred */
      paint(p, b.firstChild, '/images/map/austegarden-band.svg', 2400, 600, function (W, H) {
        var s = Math.max(W / 2400, H / 600);
        return { x: -(W - 2400 * s) / 2 / s, y: -(H - 600 * s) / 2 / s, scale: 1 / s };
      }, [2.5, 852.9, 1796.3]);
      return;
    }
    var plane = d.getElementById('plane'), lens = d.querySelector('.loupe .lens');
    if (plane) {
      /* sheet.js sets plane.x / plane.y (its translate) and calls plane.onmove as it pans */
      paint(p, plane, plane.getAttribute('data-map'), 2800, 2000, function () {
        var x = plane.x, y = plane.y;
        if (x === undefined) { var t = new DOMMatrix(getComputedStyle(plane).transform); x = t.m41; y = t.m42; }
        return { x: -x, y: -y, scale: 1 };
      }, [2.5, 0, 0], function (g) { plane.onmove = function () { g.render(); }; });
    }
    if (lens) {
      /* the loupe: data-view is the map units at its top left and the units across it */
      var v = lens.getAttribute('data-view').split(' ').map(Number), go = function () {
        paint(p, lens.firstElementChild, lens.getAttribute('data-map'), 2400, 2400, function (W) {
          return { x: v[0], y: v[1], scale: v[2] / W };
        }, [0.5, 3252.9, 1946.3]);
      };
      /* it is a screen or more down the page: start it when it comes near */
      if (window.IntersectionObserver) {
        var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); go(); } }, { rootMargin: '400px' });
        io.observe(lens);
      } else go();
    }
  }

  var wx = load();
  function later() {
    wx.then(function (w) {
      if (window.requestIdleCallback) requestIdleCallback(function () { start(w); }, { timeout: 1500 }); else setTimeout(function () { start(w); }, 100);
    });
  }
  if (d.readyState === 'complete') later(); else addEventListener('load', later);
})();
