// sort-list.js: order buttons for the place-lists on district pages and /tools.html.
// scripts/build_tools.py writes the control (hidden) and the rows; each row carries
// data-added="YYYY-MM-DD". Without JS the generated order stands: newest first.
// The choice is kept per viewer in localStorage ("tool-order").
(function () {
  var KEY = 'tool-order', coll = new Intl.Collator('en', { sensitivity: 'base', numeric: true });
  var name = function (li) { return li.querySelector('.nm').textContent.replace(/^[^0-9A-Za-z]+/, ''); };
  var cmp = {
    az: function (a, b) { return coll.compare(name(a), name(b)) || a._i - b._i; },
    // undated rows are pages git has not seen yet, so the newest
    'new': function (a, b) { var x = a.getAttribute('data-added') || '9999', y = b.getAttribute('data-added') || '9999'; return x < y ? 1 : x > y ? -1 : cmp.az(a, b); }
  };
  [].forEach.call(document.querySelectorAll('.sort-ctl'), function (ctl) {
    var btns = [].slice.call(ctl.querySelectorAll('button[data-sort]'));
    var lists = btns[0].getAttribute('aria-controls').split(/\s+/).map(function (id) { return document.getElementById(id); }).filter(Boolean);
    lists.forEach(function (ul) { [].forEach.call(ul.children, function (li, i) { li._i = i; }); });
    function apply(order, save) {
      if (!cmp[order]) order = 'new';
      btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-sort') === order)); });
      lists.forEach(function (ul) { [].slice.call(ul.children).sort(cmp[order]).forEach(function (li) { ul.appendChild(li); }); });
      if (save) try { localStorage.setItem(KEY, order); } catch (e) {}
    }
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    apply(saved, false);
    ctl.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button[data-sort]') : null;
      if (b) apply(b.getAttribute('data-sort'), true);
    });
    ctl.hidden = false;
  });
})();
