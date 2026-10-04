/* sheet.js: the map layer of body[data-sheet="full"] pages (home).
   Pans the fixed map plane with scroll so Austegarden sits behind #place, keeps the
   left-margin kilometre numbers true, and focuses the search box on "/".
   Plane: 2800 x 2000 px, 2.5 m per px, top left = UTM 32N E 291500 / N 6719600. */
(function () {
  var d = document, p = d.getElementById('plane'), q = d.getElementById('q');
  d.addEventListener('keydown', function (e) {
    var t = e.target;
    if (e.key === '/' && q && !e.ctrlKey && !e.metaKey && !e.altKey && !/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && !t.isContentEditable) {
      e.preventDefault(); q.focus();
    }
  });
  if (!p) return;

  var MX = 1541, MY = 1019, W = 2800, H = 2000, N0 = 6719600, M = 2.5;
  var K = d.querySelectorAll('#km i'), pl = d.querySelector('#place .frame > div') || d.getElementById('place');
  var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    ty = -(a + b * (window.pageYOffset || 0));
    p.style.transform = 'translate3d(' + clamp(fx - MX, vw - W, 0) + 'px,' + clamp(ty, vh - H, 0).toFixed(1) + 'px,0)';
    ty = clamp(ty, vh - H, 0);
    ticks();
  }

  function measure() {
    vw = innerWidth; vh = innerHeight;
    if (still) { ty = new DOMMatrix(getComputedStyle(p).transform).m42; ticks(); return; }
    var r = pl ? pl.getBoundingClientRect() : null,
        smax = Math.max(1, d.documentElement.scrollHeight - vh),
        sp = r ? clamp(r.top + (window.pageYOffset || 0) + r.height / 2 - vh / 2, 1, smax) : smax,
        tp = MY - vh / 2;
    fx = r ? r.left + r.width / 2 : vw / 2;
    /* top of the window in plane px: a + b * scroll. Marker centred at sp; window stays inside the plane. */
    b = Math.min(.3, tp / sp, smax > sp ? (H - vh - tp) / (smax - sp) : .3);
    a = tp - b * sp;
    draw();
  }

  if (!still) addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(draw); }, { passive: true });
  addEventListener('resize', function () { requestAnimationFrame(measure); });
  addEventListener('load', measure);
  measure();
})();
