/* sheet.js: the map layer of body[data-sheet="full"] pages (home).
   Pans the fixed map plane with scroll so Austegarden sits in the loupe's ring in #place (its offset is left on the plane as
   p.x / p.y for weather.js, which hooks p.onmove), keeps the
   left-margin kilometre numbers true, and focuses the search box on "/".
   Plane: 2800 x 2000 px, 2.5 m per px, top left = UTM 32N E 291500 / N 6719600.
   The map image is not in the HTML: it is added after the window load event, when the browser is idle, so
   it never competes with the CSS and the fonts for the first paint (paper first, then the map). A fade-in
   was tried and dropped: the animated layer costs about a third more raster time.
   Without script a <noscript> copy of the image keeps the still composition. */
(function () {
  var d = document, p = d.getElementById('plane'), q = d.getElementById('q'),
      still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  d.addEventListener('keydown', function (e) {
    var t = e.target;
    if (e.key === '/' && q && !e.ctrlKey && !e.metaKey && !e.altKey && !/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && !t.isContentEditable) {
      e.preventDefault(); q.focus();
    }
  });
  if (!p) return;

  function map() {
    var i = new Image();
    i.alt = ''; i.width = 2800; i.height = 2000; i.decoding = 'async';
    i.setAttribute('fetchpriority', 'low');
    i.src = p.getAttribute('data-map');
    p.insertBefore(i, p.firstChild);
  }
  function later() { if (window.requestIdleCallback) requestIdleCallback(map, { timeout: 800 }); else setTimeout(map, 50); }
  if (d.readyState === 'complete') later(); else addEventListener('load', later);

  var MX = 1511, MY = 1041, W = 2800, H = 2000, N0 = 6719600, M = 2.5;
  var K = d.querySelectorAll('#km i'), lp = d.querySelector('#place .loupe'), pl = (lp && !still && lp.querySelector('.spot')) || d.getElementById('place'),
      wrap = p.parentNode, lens = lp && lp.querySelector('.lens'), ln = wrap.querySelectorAll('.leader line');
  /* the ring marks a point a little off the farm (data-at, sheet px): register that point instead */
  var at = (pl.getAttribute('data-at') || '0 0').split(' '), RX = +at[0], RY = +at[1];
  var vw, vh, a, b, fx, raf = 0, ty = 0;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function ticks() {
    for (var i = 0; i < K.length; i++) {
      var y = (N0 - K[i].getAttribute('data-n') * 1000) / M + ty;
      K[i].style.visibility = y > 14 && y < vh - 14 ? 'visible' : 'hidden';
      K[i].style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
    }
  }

  function draw() {
    raf = 0;
    if (a === undefined) return;
    ty = +clamp(-(a + b * (window.pageYOffset || 0)), vh - H, 0).toFixed(1);
    p.x = clamp(fx - MX - RX, vw - W, 0); p.y = ty;
    p.style.transform = 'translate3d(' + p.x + 'px,' + ty + 'px,0)';
    ticks();
    leader();
    if (p.onmove) p.onmove();   /* weather.js redraws the sea in the same frame */
  }

  function measure() {
    vw = innerWidth; vh = innerHeight;
    if (still) { var m = new DOMMatrix(getComputedStyle(p).transform); p.x = m.m41; p.y = ty = m.m42; ticks(); if (p.onmove) p.onmove(); return; }
    var r = pl ? pl.getBoundingClientRect() : null,
        smax = Math.max(1, d.documentElement.scrollHeight - vh),
        sp = r ? clamp(r.top + (window.pageYOffset || 0) + r.height * .5 - vh / 2, 1, smax) : smax,
        tp = MY + RY - vh / 2;
    fx = r ? r.left + r.width * .5 : vw / 2;
    /* top of the window in plane px: a + b * scroll. Marker centred at sp; window stays inside the plane. */
    b = Math.min(.3, tp / sp, smax > sp ? (H - vh - tp) / (smax - sp) : .3);
    a = tp - b * sp;
    draw();
  }

  /* the loupe: while the lens is on screen, show the ring on the sheet and the outer tangents from it to the lens */
  function leader() {
    if (!lens || ln.length < 2 || still) return;
    var lr = lens.getBoundingClientRect(), on = lr.bottom > 0 && lr.top < vh;
    wrap.classList.toggle('loupe-on', on);
    if (!on) return;
    var x1 = p.x + MX + RX, y1 = ty + MY + RY, r1 = 81,
        x2 = lr.left + lr.width / 2, y2 = lr.top + lr.height / 2, r2 = lr.width / 2 + 6,
        dx = x2 - x1, dy = y2 - y1, dd = Math.hypot(dx, dy);
    if (dd <= Math.abs(r1 - r2) + 1) return;
    var c = (r1 - r2) / dd, s = Math.sqrt(1 - c * c), ux = dx / dd, uy = dy / dd;
    for (var k = 0; k < 2; k++) {
      var sg = k ? 1 : -1, nx = ux * c - sg * uy * s, ny = uy * c + sg * ux * s, l = ln[k];
      l.setAttribute('x1', (x1 + r1 * nx).toFixed(1)); l.setAttribute('y1', (y1 + r1 * ny).toFixed(1));
      l.setAttribute('x2', (x2 + r2 * nx).toFixed(1)); l.setAttribute('y2', (y2 + r2 * ny).toFixed(1));
    }
  }

  if (!still) addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(draw); }, { passive: true });
  addEventListener('resize', function () { requestAnimationFrame(measure); });
  /* Measured once the page has loaded, not while it is first laid out: the sections below the first screen are
     skipped (content-visibility) until they near the viewport, and measuring in the first layout would force them. */
  addEventListener('load', function () {
    measure();
    /* a section laid out for the first time changes the page height */
    if (window.ResizeObserver) new ResizeObserver(function () { requestAnimationFrame(measure); }).observe(d.body);
  });
})();
