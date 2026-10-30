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
  var home = mode === 'full', KEY = 'wx2', LAT = 60.5377, LON = 5.2608,
      API = 'https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=' + LAT + '&lon=' + LON,
      still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── data ─────────────────────────────────────────────────────── */

  function pick(j) {
    var ts = j.properties.timeseries, now = Date.now(), e = ts[0];
    for (var i = 0; i < ts.length && Date.parse(ts[i].time) <= now; i++) e = ts[i];
    var x = e.data.instant.details, n = e.data.next_1_hours || e.data.next_6_hours;
    return { t: x.air_temperature, ws: x.wind_speed, wd: x.wind_from_direction, cl: x.cloud_area_fraction,
             fog: x.fog_area_fraction || 0, pr: n && n.details ? n.details.precipitation_amount || 0 : 0,
             sym: n && n.summary ? n.summary.symbol_code : '', fc: ahead(ts, i - 1) };
  }

  /* the forecast every three hours for the next twelve, from the hourly part of the series */
  function ahead(ts, i) {
    var out = [];
    for (var k = 3; k <= 12; k += 3) {
      var e = ts[i + k];
      if (!e || !e.data.next_1_hours) break;
      var x = e.data.instant.details, n = e.data.next_1_hours;
      out.push({ at: e.time, t: x.air_temperature, ws: x.wind_speed, wd: x.wind_from_direction,
                 pr: n.details.precipitation_amount || 0, sym: n.summary.symbol_code });
    }
    return out;
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

  /* Norwegian clock time of a date or ISO string */
  function clock(t) {
    var dt = new Date(t);
    try { return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Oslo' }).format(dt); }
    catch (e) { return dt.toISOString().slice(11, 16); }
  }

  /* a small engraved sky symbol for a MET Norway symbol code: sun or moon, cloud, rain, snow, sleet, thunder, fog */
  var SUN = '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>',
      MOON = '<path d="M15.5 3.5a8.5 8.5 0 1 0 5 15 7 7 0 0 1-5-15z"/>',
      CLOUD = '<path d="M7 19h10.5a4 4 0 0 0 .4-8 5.5 5.5 0 0 0-10.6 1.2A3.4 3.4 0 0 0 7 19z"/>';
  function icon(sym) {
    var s = (sym || '').replace(/_(day|night|polartwilight)$/, ''), lit = /_night$/.test(sym) ? MOON : SUN, g = '';
    if (!s) return '';
    if (s === 'clearsky') g = lit;
    else if (s === 'fair' || s === 'partlycloudy') g = '<g transform="translate(-1 -1) scale(.62)">' + lit + '</g><g transform="translate(3 3) scale(.85)">' + CLOUD + '</g>';
    else if (s === 'cloudy') g = CLOUD;
    else if (s === 'fog') g = '<path d="M3 8h18M5 12h14M3 16h18"/>';
    else {
      g = '<g transform="translate(0 -4)">' + CLOUD + '</g>';
      if (/rain|sleet/.test(s)) g += '<path d="M8.5 18l-1.2 3M16.5 18l-1.2 3"/>';
      if (/snow|sleet/.test(s)) g += '<path d="M12.5 19.5h.01M8 22h.01M16 22h.01" stroke-width="2.6"/>';
      if (/thunder/.test(s)) g += '<path d="M12.5 14.5l-2.5 4h3l-2 4"/>';
    }
    return '<svg class="wx-ico" viewBox="0 0 24 24" aria-hidden="true">' + g + '</svg>';
  }

  /* the weather report card in #place: the hour now and the next twelve hours */
  function report(w, src) {
    var card = d.getElementById('wx-card');
    if (!card) return;
    var hh = clock, arrow = function (deg) {   /* the arrow points where the wind blows to */
      return '<i class="wx-arrow" style="transform:rotate(' + Math.round(deg + 180) + 'deg)" aria-hidden="true">&uarr;</i>';
    }, row = function (x, when) {
      return '<tr><th scope="row">' + when + '</th><td>' + icon(x.sym) + sky(x.sym) + '</td><td>' + Math.round(x.t) + '&deg;</td><td>' +
        arrow(x.wd) + DIRS[Math.round(x.wd / 22.5) % 16] + ' ' + Math.round(x.ws) + '</td><td>' +
        (x.pr ? x.pr.toFixed(1) : '&ndash;') + '</td></tr>';
    };
    card.querySelector('tbody').innerHTML = row(w, 'Now') + (w.fc || []).map(function (x) { return row(x, hh(x.at)); }).join('');
    card.querySelector('.src a').href = src;
    card.hidden = false;
  }

  function readout(w) {
    var deg = Math.round(w.t) + '°', wind = DIRS[Math.round(w.wd / 22.5) % 16] + ' ' + Math.round(w.ws) + ' m/s',
        what = w.sym ? sky(w.sym) : '', src = 'https://www.met.no/en/free-meteorological-data';
    if (home) {
      var el = d.getElementById('wx');
      if (!el) return;
      el.querySelector('dd').innerHTML = icon(w.sym) + deg + 'C' + (what ? ', ' + what : '') + '<br>wind ' + wind +
        ' &middot; <a href="' + src + '">MET Norway</a>';
      el.hidden = false;
      report(w, src);
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

  /* ── the tide ─────────────────────────────────────────────────
     Kartverket's Se havnivå predictions for the fjære (from the Bergen gauge), in metres above chart datum, every
     ten minutes from three hours ago to thirty hours ahead, with the high and low waters; kept three hours */
  var TIDE = 'https://vannstand.kartverket.no/tideapi.php?tide_request=locationdata&lat=60.5361&lon=5.2714&refcode=CD&lang=en&dst=0&tzone=0&datatype=',
      tide = null, tideOff = 0,             /* tideOff: minutes ahead of now that the close view shows */
      redrawFjaera = function () {};

  function loadTide() {
    var c = null, now = Date.now();
    try { c = JSON.parse(localStorage.getItem('tide1')); } catch (e) {}
    if (c && c.exp > now) return Promise.resolve(c.v);
    var iso = function (ms) { return new Date(ms).toISOString().slice(0, 16); },
        q = '&fromtime=' + iso(now - 108e5) + '&totime=' + iso(now + 108e6),
        get = function (u) {
          return fetch(TIDE + u + q, { priority: 'low' }).then(function (r) { if (!r.ok) throw r.status; return r.text(); }).then(function (t) {
            return [].map.call(new DOMParser().parseFromString(t, 'text/xml').querySelectorAll('waterlevel'), function (e) {
              return [Date.parse(e.getAttribute('time')), parseFloat(e.getAttribute('value')) / 100, e.getAttribute('flag')];
            });
          });
        };
    return Promise.all([get('PRE&interval=10'), get('TAB')]).then(function (r) {
      if (!r[0].length) throw 'no tide';
      var v = { pre: r[0].map(function (x) { return [x[0], x[1]]; }), tab: r[1] };
      try { localStorage.setItem('tide1', JSON.stringify({ exp: now + 108e5, v: v })); } catch (e) {}
      return v;
    }).catch(function () { return c ? c.v : null; });
  }

  function levelAt(ms) {
    var v = tide.pre, i = 1;
    if (ms <= v[0][0]) return v[0][1];
    while (i < v.length && v[i][0] < ms) i++;
    if (i >= v.length) return v[v.length - 1][1];
    var a = v[i - 1], b_ = v[i];
    return a[1] + (b_[1] - a[1]) * (ms - a[0]) / (b_[0] - a[0]);
  }
  function tideLevel() { return tide ? levelAt(Date.now() + tideOff * 6e4) : 0.95; }

  /* the tide panel in the card: the next 24 hours as a curve, the level at the time shown, a scrubber and play */
  function tideUI(card) {
    var box = card.querySelector('.wx-tide');
    if (!box || !tide) return;
    var now = Date.now(), W = 240, H = 44, lo = 0, hi = 2, svg = box.querySelector('svg'),
        y = function (lv) { return (H - (lv - lo) / (hi - lo) * H).toFixed(1); }, pts = [];
    for (var k = 0; k <= 144; k++) pts.push((k / 144 * W).toFixed(1) + ',' + y(levelAt(now + k * 6e5)));
    svg.querySelector('.tc').setAttribute('points', pts.join(' '));
    box.querySelector('.tide-turns').textContent = tide.tab.filter(function (e) { return e[0] > now && e[0] < now + 864e5; })
      .map(function (e) { return (e[2] === 'high' ? 'High ' : 'Low ') + clock(e[0]) + ' (' + e[1].toFixed(2) + ' m)'; }).join(' · ');
    var input = box.querySelector('input'), out = box.querySelector('output'), mk = svg.querySelector('.tm'), play = box.querySelector('button'), raf = 0;
    function show() {
      var ms = now + tideOff * 6e4, lv = levelAt(ms), dl = levelAt(ms + 6e5) - lv;
      mk.setAttribute('cx', (tideOff / 1440 * W).toFixed(1)); mk.setAttribute('cy', y(lv));
      out.textContent = (tideOff ? clock(ms) : 'Now') + ': ' + lv.toFixed(2) + ' m, ' + (dl > .002 ? 'rising' : dl < -.002 ? 'falling' : 'turning');
      redrawFjaera();
    }
    input.addEventListener('input', function () { tideOff = +input.value; show(); });
    play.addEventListener('click', function () {
      if (raf) { cancelAnimationFrame(raf); raf = 0; play.setAttribute('aria-pressed', 'false'); return; }
      var t0 = performance.now(), o0 = tideOff;
      (function step(ts) {   /* the next 24 hours in 16 seconds, round and round */
        tideOff = Math.round((o0 + (ts - t0) / 16000 * 1440) % 1440);
        input.value = tideOff; show();
        raf = requestAnimationFrame(step);
      })(t0);
      play.setAttribute('aria-pressed', 'true');
    });
    box.hidden = false;
    show();
  }

  /* the close view draws its own water, so the map under it loses the sea's flat tint */
  function stripSea(img) {
    fetch(img.getAttribute('src')).then(function (r) { return r.text(); }).then(function (t) {
      img.src = URL.createObjectURL(new Blob([t.replace(/\.sea\{[^}]*\}/, '.sea{fill:none}')], { type: 'image/svg+xml' }));
    });
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
      sun: /_night$/.test(s) ? 0 : ({ clearsky: 1, fair: .8, partlycloudy: .45 })[s.replace(/_\w+$/, '')] || 0,
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
  geo: vec4f,                          // metres per map unit; map origin in metres east and south of the sheet's top left; close view (0 or 1)
  tide: vec4f,                         // water level (m above chart datum), sunshine 0..1, seabed present (0 or 1)
  bed: vec4f,                          // the seabed texture's box in map units: x0, y0, x1, y1
};
@group(0) @binding(0) var<uniform> u: U;
@group(0) @binding(1) var tex: texture_2d<f32>;
@group(0) @binding(2) var smp: sampler;
@group(0) @binding(3) var bedtex: texture_2d<f32>;   // heights above chart datum, grey v -> v * 255 / 30 - 6 m

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

fn over(dst: vec4f, rgb: vec3f, a: f32) -> vec4f {
  let k = clamp(a, 0.0, 1.0);
  return vec4f(rgb * k + dst.rgb * (1.0 - k), k + dst.a * (1.0 - k));
}

// The close view of the fjære, everything drawn large and fast on purpose. The tide floods the seabed texture to
// the water level: water is tinted by depth, the seabed it bares is stippled, and the waterline is drawn. Wave lines
// follow the depth contours (waves turn to the shore as the water shoals), foam bursts at the waterline, rain rings
// spread on the water and splash on dry ground, the sun glitters on the ripples.
fn bedh(bu: vec2f) -> f32 { return textureSampleLevel(bedtex, smp, bu, 0.0).r * 255.0 / 30.0 - 6.0; }

fn fjaera(m: vec2f, sea: f32, t: f32) -> vec4f {
  let P = 1.0 / (u.scale * u.px);               // CSS px per map unit
  let mp = m * P;                               // map position in CSS px
  let span = u.bed.zw - u.bed.xy;
  let bu = (m - u.bed.xy) / span;
  let inb = step(0.0, bu.x) * step(bu.x, 1.0) * step(0.0, bu.y) * step(bu.y, 1.0) * u.tide.z;
  let h = mix(select(2.5, -2.0, sea > 0.5), bedh(bu), inb);         // metres above chart datum
  let e = 6.0 / vec2f(textureDimensions(bedtex));   // slope over six texels (3 m), smooth enough for clean wave lines
  let g = vec2f(bedh(bu + vec2f(e.x, 0.0)) - bedh(bu - vec2f(e.x, 0.0)),
                bedh(bu + vec2f(0.0, e.y)) - bedh(bu - vec2f(0.0, e.y))) / (2.0 * e * span) * inb;   // m per map unit
  let slope = max(length(g), 0.004);
  let up = g / max(length(g), 1e-5);            // uphill: towards the shore
  let depth = u.tide.x - h;
  let water = sea * smoothstep(-0.01, 0.01, depth);
  let bare = sea * (1.0 - water);               // seabed the tide has left
  let dpx = max(depth, 0.0) / slope * P;        // CSS px out from the waterline
  var o = vec4f(0.0);

  // water, darker as it deepens; the bared seabed, damp near the water, stippled with stones
  o = over(o, u.water.rgb, water * (0.1 + 0.14 * smoothstep(0.0, 6.0, depth)));
  o = over(o, vec3f(0.56, 0.5, 0.36), bare * (0.16 + 0.16 * exp(depth / 0.12)));
  let st = mp / 3.4; let si = floor(st);
  let so = vec2f(hash(si + vec2f(7.0, 1.0)), hash(si + vec2f(2.0, 9.0))) * 0.6 + 0.2;
  let pr = 0.45 + 0.9 * hash(si + vec2f(5.0, 5.0));
  o = over(o, u.ink.rgb, bare * (1.0 - smoothstep(pr * 0.6, pr, length(st - si - so) * 3.4)) * step(hash(si + vec2f(3.0, 3.0)), 0.5) * 0.55);
  // the waterline
  o = over(o, u.water.rgb, sea * (1.0 - smoothstep(0.7, 1.8, abs(depth) / slope * P)) * 0.95);

  // wave lines along the depth contours, rolling in on the shores the wind faces
  let face = clamp(dot(u.dir, up), 0.0, 1.0);
  let wob = (noise(mp / 60.0 + vec2f(t * 0.1, 0.0)) - 0.5) * 4.0 * (0.4 + u.ws);
  let ph = (dpx + wob) / 18.0 + t * (0.5 + 1.6 * u.ws) * (0.35 + 0.65 * face);
  let kk = floor(ph + 0.5);
  let nl = 1.5 + 2.5 * u.ws * (0.3 + 0.7 * face);
  let brk = smoothstep(0.12, 0.28, noise(mp / 30.0 + vec2f(kk * 7.31, kk * 3.17)));
  let line = (1.0 - smoothstep(0.8, 1.9, abs(ph - kk) * 18.0)) * smoothstep(3.0, 9.0, dpx)
           * (1.0 - smoothstep(18.0 * (nl - 1.0), 18.0 * nl, dpx)) * brk;
  o = over(o, u.water.rgb, water * line * (0.6 + 0.4 * face));

  // foam at the waterline, thrown up as each wave line arrives
  let burst = pow(1.0 - fract(ph - dpx / 18.0), 2.5) * (0.4 + 0.6 * face) * (0.3 + u.ws);
  let fe = 3.0 + 12.0 * burst;
  let ft = mp / 2.6; let fi = floor(ft);
  let fo = vec2f(hash(fi + vec2f(2.0, 11.0)), hash(fi + vec2f(13.0, 3.0))) * 0.6 + 0.2;
  let fd = 1.0 - smoothstep(0.45, 1.0, length(ft - fi - fo) * 2.6);
  let fden = (1.0 - smoothstep(fe * 0.5, fe, dpx)) * (0.25 + 0.45 * burst);
  o = over(o, u.water.rgb, water * fd * step(hash(fi + vec2f(floor(t * 6.0), 7.0)), fden) * 0.9);

  // crest dashes on open water, large and fast
  let nr = vec2f(-u.dir.y, u.dir.x);
  let cell = vec2f(30.0, 70.0);
  let q = vec2f(dot(mp, u.dir), dot(mp, nr)) - vec2f(t * (8.0 + 30.0 * u.ws), 0.0);
  let id = floor(q / cell);
  let h1 = hash(id); let h2 = hash(id + vec2f(17.0, 5.0)); let h3 = hash(id + vec2f(3.0, 29.0));
  let rel = q - (id + 0.5 + (vec2f(h1, h3) - 0.5) * vec2f(0.4, 0.5)) * cell;
  let L = cell.y * (0.18 + 0.35 * u.ws) * sin(3.14159 * fract(t * 0.12 + h1 * 7.0));
  let dash = (1.0 - smoothstep(0.6, 1.5, abs(rel.x + rel.y * rel.y / (cell.y * 1.6)))) * (1.0 - smoothstep(L * 0.55, L, abs(rel.y)));
  o = over(o, u.water.rgb, water * dash * step(h2, 0.06 + 0.5 * u.ws) * smoothstep(24.0, 48.0, dpx) * 0.7);

  // rain: big rings on the water, splashes on the bared seabed
  if (u.rain > 0.0) {
    let rc = 34.0;
    let rp = mp / rc + vec2f(0.37, 0.71); let ri = floor(rp);
    let rt = t * 1.3 + hash(ri + vec2f(41.0, 7.0)) * 13.0;
    let rl = fract(rt); let cyc = floor(rt);
    let ro = vec2f(hash(ri + vec2f(cyc, 3.0)), hash(ri + vec2f(5.0, cyc))) * 0.6 + 0.2;
    let rr = length(rp - ri - ro) * rc;
    let on = step(hash(ri + vec2f(cyc, cyc)), min(u.rain * 2.2, 0.95)) * (1.0 - rl);
    o = over(o, u.water.rgb, water * on * (1.0 - smoothstep(0.5, 1.4, abs(rr - rl * 14.0))) * 0.85);
    o = over(o, u.ink.rgb, bare * on * (1.0 - smoothstep(1.0, 2.2, rr)) * 0.5);
  }

  // sunshine: glitter on the ripples, and a little warmth over everything
  if (u.tide.y > 0.0) {
    let gc = mp / 7.0; let gi = floor(gc);
    let gp = vec2f(hash(gi + vec2f(4.0, 8.0)), hash(gi + vec2f(9.0, 1.0))) * 0.7 + 0.15;
    let tw = floor(t * 7.0 + hash(gi) * 40.0);
    let gl = (1.0 - smoothstep(0.4, 1.6, length(gc - gi - gp) * 7.0)) * step(hash(gi + vec2f(tw, 3.0)), u.tide.y * (0.06 + 0.2 * u.ws));
    o = over(o, vec3f(0.95, 0.72, 0.22), water * gl);
    o = over(o, vec3f(0.98, 0.8, 0.35), u.tide.y * 0.05);
  }

  // snow: big flakes drifting with the wind
  if (u.snow > 0.0) {
    let sp = (mp - u.dir * t * (12.0 + 30.0 * u.ws) - vec2f(t * 3.0, t * 6.0)) / 16.0;
    let fl = floor(sp);
    let fp = vec2f(hash(fl), hash(fl + vec2f(1.0, 9.0))) * 0.7 + 0.15;
    o = over(o, u.ink.rgb, (1.0 - smoothstep(1.2, 2.2, length(sp - fl - fp) * 16.0)) * step(hash(fl + vec2f(4.0, 4.0)), u.snow) * 0.6);
  }

  // cloud shadows (the same sky as the maps behind) and the night
  let wm = u.geo.yz + m * u.geo.x;
  let cn = fbm((wm - u.dir * t * (2.0 + 14.0 * u.ws)) * 0.00096 + vec2f(0.0, t * 0.003));
  let th = mix(0.8, 0.34, u.cl);
  let cd = smoothstep(th, th + 0.2, cn);
  let hatch = 1.0 - smoothstep(0.35, 1.0, abs(fract((mp.x + mp.y) / 6.0 + 0.5) - 0.5) * 6.0 * 0.7071);
  o = over(o, u.ink.rgb, cd * (0.05 + 0.14 * hatch) + u.night * 0.1);
  return o;
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
  if (u.geo.w > 0.5) { return fjaera(m, smoothstep(0.35, 0.65, s.r), t) * inside; }
  let k1 = max(1.0, u.scale * u.px);           // map units per CSS px, at least one
  var wa = 0.0;

  // Waves, crests and rain sit halfway between the first, near-invisible pass and the bold one;
  // clouds, snow and glitter stay bold so they read behind the map lines.
  // 1. wave lines that follow the coast, spaced like a chart's, rolling in on the shores the wind faces
  let S = 7.5 * k1;
  let face = clamp(dot(u.dir, -out), 0.0, 1.0);
  let wob = (noise(m * 0.03 / k1 + vec2f(t * 0.05, 0.0)) - 0.5) * S * (0.4 + 0.9 * u.ws);
  let ph = (dist + wob) / S + t * (0.165 + 0.5 * u.ws) * (0.3 + 0.7 * face);
  let k = floor(ph + 0.5);
  let n = 2.05 + (1.35 + 3.05 * u.ws) * (0.35 + 0.65 * face);
  let brk = smoothstep(0.215, 0.36, noise(m * 0.06 / k1 + vec2f(k * 7.31, k * 3.17)));
  let coast = stroke((ph - k) * S, 1.2) * smoothstep(S * 0.45, S * 1.05, dist) * (1.0 - smoothstep(S * (n - 1.0), S * n, dist)) * brk;
  wa = max(wa, coast * (0.625 + 0.3 * face));

  // 2. crest dashes on open water, across the wind, riding downwind; more of them as it blows
  let nr = vec2f(-u.dir.y, u.dir.x);
  let cell = vec2f(13.5, 33.0) * k1;
  let q = vec2f(dot(m, u.dir), dot(m, nr)) - vec2f(t * (1.5 + 7.5 * u.ws) * k1, 0.0);
  let id = floor(q / cell);
  let h1 = hash(id); let h2 = hash(id + vec2f(17.0, 5.0)); let h3 = hash(id + vec2f(3.0, 29.0));
  let rel = q - (id + 0.5 + (vec2f(h1, h3) - 0.5) * vec2f(0.4, 0.5)) * cell;
  let life = fract(t * 0.08 + h1 * 7.0);
  let L = cell.y * (0.17 + 0.35 * u.ws) * sin(3.14159 * life);
  let dash = stroke(rel.x + rel.y * rel.y / (cell.y * 1.6), 1.075) * (1.0 - smoothstep(L * 0.55, L, abs(rel.y)));
  wa = max(wa, dash * step(h2, 0.045 + 0.475 * u.ws) * smoothstep(S * 1.4, S * 3.5, dist) * 0.675);

  // 3. rain rings
  if (u.rain > 0.0) {
    let rc = 20.5 * k1;
    let rp = m / rc + vec2f(0.37, 0.71);
    let ri = floor(rp);
    let rh = hash(ri + vec2f(41.0, 7.0));
    let rt = t * 0.9 + rh * 13.0;
    let rl = fract(rt); let cyc = floor(rt);
    let ro = vec2f(hash(ri + vec2f(cyc, 3.0)), hash(ri + vec2f(5.0, cyc))) * 0.6 + 0.2;
    let rr = length(rp - ri - ro) * rc;
    let ring = stroke(rr - rl * rc * 0.325, 1.05) * (1.0 - rl) * step(hash(ri + vec2f(cyc, cyc)), min(u.rain * 1.5, 0.9));
    wa = max(wa, ring * 0.625);
  }
  // sunshine: gold glitter on the water
  var ga = 0.0;
  if (u.tide.y > 0.0) {
    let gc = m / (8.0 * k1); let gi = floor(gc);
    let gp = vec2f(hash(gi + vec2f(4.0, 8.0)), hash(gi + vec2f(9.0, 1.0))) * 0.7 + 0.15;
    let tw = floor(t * 6.0 + hash(gi) * 40.0);
    ga = (1.0 - smoothstep(0.5, 1.5, length(gc - gi - gp) * 8.0 * k1 / u.scale / u.px)) * step(hash(gi + vec2f(tw, 3.0)), u.tide.y * (0.05 + 0.15 * u.ws)) * wet;
  }
  wa *= wet;

  // 4. cloud shadows: hatched, drifting with the wind, the cover set by the forecast
  // in sheet metres, so the home map, the band and the loupe share one sky
  let wm = u.geo.yz + m * u.geo.x;
  let drift = u.dir * t * (2.0 + 14.0 * u.ws);
  let cn = fbm((wm - drift) * 0.00096 + vec2f(0.0, t * 0.003));
  let th = mix(0.8, 0.34, u.cl);
  let cd = smoothstep(th, th + 0.2, cn);
  let hs = 6.0 * k1;
  let hp = (m.x + m.y) / hs;
  let hatch = stroke((fract(hp + 0.5) - 0.5) * hs * 0.7071, 0.9);
  var ia = cd * (0.08 + 0.26 * hatch) + u.cl * 0.04 + u.night * 0.1;

  // 5. snow: ink flecks blowing across
  if (u.snow > 0.0) {
    let sc = 14.0 * k1;
    let sp = (m - u.dir * t * (6.0 + 16.0 * u.ws) * k1 - vec2f(t * 1.4, t * 2.6) * k1) / sc;
    let si = floor(sp);
    let so = vec2f(hash(si), hash(si + vec2f(1.0, 9.0))) * 0.7 + 0.15;
    let fl = 1.0 - smoothstep(1.0, 2.0, length(sp - si - so) * sc / u.scale / u.px);
    ia = max(ia, fl * step(hash(si + vec2f(4.0, 4.0)), min(u.snow * 1.5, 0.9)) * 0.7);
  }
  ia *= inside;

  let a = wa * u.water.a + ia * u.ink.a * (1.0 - wa * u.water.a);
  let c = u.water.rgb * wa * u.water.a + u.ink.rgb * ia * u.ink.a * (1.0 - wa * u.water.a);
  return over(vec4f(c, a), vec3f(0.95, 0.72, 0.22), ga * inside);
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

  /* one device, one pair of pipelines and one distance field per map, shared by every canvas on the page:
     three devices at once (the sheet and two lenses) stalled device creation in SwiftShader */
  var core = null, fields = {};
  function shared() {
    return core || (core = navigator.gpu.requestAdapter({ powerPreference: 'low-power' }).then(function (ad) {
      if (!ad) throw 'no adapter';
      return ad.requestDevice();
    }).then(function (dev) {
      /* compile off the main thread: the first synchronous compile took 0.9 s on an iPhone */
      var fmt = navigator.gpu.getPreferredCanvasFormat(), mod = dev.createShaderModule({ code: DRAW });
      return Promise.all([
        dev.createComputePipelineAsync({ layout: 'auto', compute: { module: dev.createShaderModule({ code: JFA }), entryPoint: 'main' } }),
        dev.createRenderPipelineAsync({ layout: 'auto', vertex: { module: mod, entryPoint: 'vs' },
          fragment: { module: mod, entryPoint: 'fs', targets: [{ format: fmt }] }, primitive: { topology: 'triangle-list' } })
      ]).then(function (r) {
        var none = dev.createTexture({ size: [1, 1], format: 'rgba8unorm', usage: GPUTextureUsage.TEXTURE_BINDING });
        return { dev: dev, jfa: r[0], pipe: r[1], fmt: fmt, none: none.createView() };
      });
    }));
  }

  /* the map's water mask and the distance from each water texel to land (jump flood), as one texture view */
  function field(c, url, TW, TH) {
    return fields[url] || (fields[url] = waterMask(url, TW, TH).then(function (mc) {
      var dev = c.dev, jfa = c.jfa, U = GPUTextureUsage, B = GPUBufferUsage;
      var mask = dev.createTexture({ size: [TW, TH], format: 'rgba8unorm', usage: U.TEXTURE_BINDING | U.COPY_DST | U.RENDER_ATTACHMENT });
      dev.queue.copyExternalImageToTexture({ source: mc }, { texture: mask }, [TW, TH]);
      var tex = dev.createTexture({ size: [TW, TH], format: 'rgba8unorm', usage: U.TEXTURE_BINDING | U.STORAGE_BINDING });

      /* jump flood: seed, halve the step down to 1, write mask and distance */
      var bufs = [0, 1].map(function () { return dev.createBuffer({ size: TW * TH * 8, usage: B.STORAGE }); });
      var steps = [[0, 0]];
      for (var st = 1 << Math.ceil(Math.log2(Math.max(TW, TH))) >> 1; st >= 1; st >>= 1) steps.push([st, 1]);
      steps.push([1, 1], [0, 2]);   /* one extra step of 1 (JFA+1) mends most of the flood's misses */
      var enc = dev.createCommandEncoder(), fv = tex.createView(), mv = mask.createView();
      steps.forEach(function (s, k) {
        var ub = dev.createBuffer({ size: 16, usage: B.UNIFORM | B.COPY_DST });
        dev.queue.writeBuffer(ub, 0, new Int32Array([TW, TH, s[0], s[1]]));
        var pass = enc.beginComputePass();
        pass.setPipeline(jfa);
        pass.setBindGroup(0, dev.createBindGroup({ layout: jfa.getBindGroupLayout(0), entries: [
          { binding: 0, resource: mv }, { binding: 1, resource: { buffer: bufs[(k + 1) & 1] } }, { binding: 2, resource: { buffer: bufs[k & 1] } },
          { binding: 3, resource: { buffer: ub } }, { binding: 4, resource: fv }] }));
        pass.dispatchWorkgroups(Math.ceil(TW / 8), Math.ceil(TH / 8));
        pass.end();
      });
      dev.queue.submit([enc.finish()]);
      return fv;
    }));
  }

  /* the seabed heights as a texture (a grey PNG made by scripts/map/build_flatoy.py) */
  function seabed(dev, src) {
    return fetch(src).then(function (r) { return r.blob(); }).then(createImageBitmap).then(function (bm) {
      var t = dev.createTexture({ size: [bm.width, bm.height], format: 'rgba8unorm',
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT });
      dev.queue.copyExternalImageToTexture({ source: bm }, { texture: t }, [bm.width, bm.height]);
      return t.createView();
    });
  }

  /* opt (the close view only): bed = { src, box: [x0, y0, x1, y1] map units }, level() = the water level to draw */
  function gpu(cv, url, MW, MH, view, geo, opt) {
    var dev, ctx, pipe, bind, ubuf, data = new Float32Array(36), cur = null, aim = null, last = -1e9, raf = 0, on = true, c, bv;
    opt = opt || {};
    var TW = MW / TEXEL, TH = MH / TEXEL;
    return shared().then(function (cc) {
      c = cc; dev = c.dev; pipe = c.pipe;
      return Promise.all([field(c, url, TW, TH), opt.bed ? seabed(dev, opt.bed.src) : c.none]);
    }).then(function (r) {
      var fv = r[0];
      bv = r[1];
      var fmt = c.fmt, B = GPUBufferUsage;
      ctx = cv.getContext('webgpu');
      ctx.configure({ device: dev, format: fmt, alphaMode: 'premultiplied' });
      ubuf = dev.createBuffer({ size: data.byteLength, usage: B.UNIFORM | B.COPY_DST });
      bind = dev.createBindGroup({ layout: pipe.getBindGroupLayout(0), entries: [
        { binding: 0, resource: { buffer: ubuf } }, { binding: 1, resource: fv },
        { binding: 2, resource: dev.createSampler({ magFilter: 'linear', minFilter: 'linear' }) },
        { binding: 3, resource: bv }] });
      dev.lost.then(function (i) { on = false; cv.remove(); console.warn('weather.js: device lost', i.message); });

      var dark = matchMedia('(prefers-color-scheme: dark)');
      function inks() {
        var cs = getComputedStyle(d.documentElement), dk = dark.matches;
        data.set(colour(cs.getPropertyValue('--water')).concat(dk ? .75 : .7), 16);
        data.set(colour(cs.getPropertyValue('--ink')).concat(dk ? .55 : .7), 20);
      }
      inks();
      data.set(geo, 24);
      if (opt.bed) data.set(opt.bed.box, 32);
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
        data.set([opt.level ? opt.level() : 0.95, cur.sun || 0, opt.bed ? 1 : 0, 0], 28);
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
  function paint(p, before, url, MW, MH, view, geo, hook, opt) {
    var cv = d.createElement('canvas');
    cv.className = 'wx-sky'; cv.setAttribute('aria-hidden', 'true');
    before.parentNode.insertBefore(cv, before);
    gpu(cv, url, MW, MH, view, geo.length > 3 ? geo : geo.concat(0), opt).then(function (g) {
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
    var card = d.getElementById('wx-card');
    if (card) loadTide().then(function (v) { tide = v; tideUI(card); });
    var plane = d.getElementById('plane');
    if (plane) {
      /* sheet.js sets plane.x / plane.y (its translate) and calls plane.onmove as it pans */
      paint(p, plane, plane.getAttribute('data-map'), 2800, 2000, function () {
        var x = plane.x, y = plane.y;
        if (x === undefined) { var t = new DOMMatrix(getComputedStyle(plane).transform); x = t.m41; y = t.m42; }
        return { x: -x, y: -y, scale: 1 };
      }, [2.5, 0, 0], function (g) { plane.onmove = function () { g.render(); }; });
    }
    /* the lenses on the inset map (the loupe, the fjære in the weather report): data-view is the map units at the
       top left and the units across; data-detail draws the surf. Each starts when it comes near the window */
    [].forEach.call(d.querySelectorAll('.lens[data-view]'), function (lens) {
      var v = lens.getAttribute('data-view').split(' ').map(Number), detail = lens.hasAttribute('data-detail'),
          bed = lens.getAttribute('data-bed'), go = function () {
        paint(p, lens.firstElementChild, lens.getAttribute('data-map'), 2400, 2400, function (W) {
          return { x: v[0], y: v[1], scale: v[2] / W };
        }, [0.5, 3252.9, 1946.3, detail ? 1 : 0], detail ? function (g) {
          stripSea(lens.querySelector('img'));
          redrawFjaera = function () { if (still) g.render(); };   /* the animation reads the level every frame */
          if (window.IntersectionObserver) new IntersectionObserver(function (es) { g.pause(!es[0].isIntersecting); }).observe(lens);
        } : null, detail && bed ? { bed: { src: lens.getAttribute('data-bed-src'), box: bed.split(' ').map(Number) }, level: tideLevel } : null);
      };
      if (window.IntersectionObserver) {
        var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); go(); } }, { rootMargin: '400px' });
        io.observe(lens);
      } else go();
    });
  }

  var wx = load();
  function later() {
    wx.then(function (w) {
      if (window.requestIdleCallback) requestIdleCallback(function () { start(w); }, { timeout: 1500 }); else setTimeout(function () { start(w); }, 100);
    });
  }
  if (d.readyState === 'complete') later(); else addEventListener('load', later);
})();
