// Six Degrees of Bluesky: the page. Network rules live in scheduler.js (300 a minute, host caps, 429s), reads
// and the 24-hour cache in api.js, the path search in path.js, the metric tiers in metrics.js. This file wires
// them to the page: the meter, the per-run budget gate, rendering, exports and list making.

import { createScheduler, etaSeconds, MAX_CEILING, CancelledError } from './scheduler.js';
import { createApi, createCache } from './api.js';
import { findPath } from './path.js';
import { TIERS } from './metrics.js';

const BUILD = '2026-11-19a';
const OAUTH_LIB = 'https://cdn.jsdelivr.net/npm/@atproto/oauth-client-browser@0.5.11/+esm';
const SCOPE = 'atproto repo:app.bsky.graph.list repo:app.bsky.graph.listitem';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nf = (n) => (n === null || n === undefined || Number.isNaN(n) ? '–' : Number(n).toLocaleString('en-US'));
const pct = (x, d = 1) => (Number.isFinite(x) ? `${(x * 100).toFixed(d)}%` : '–');
const LS = {
  get(k, d) { try { const v = localStorage.getItem('six-degrees:' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('six-degrees:' + k, JSON.stringify(v)); } catch { /* no storage */ } },
};
const Relay = window.Relay || { start() {}, log() {}, warn() {}, error() {} };
Relay.start({ page: 'six-degrees', build: BUILD });
const log = (msg, cls = '') => {
  const d = document.createElement('div');
  d.textContent = `${new Date().toLocaleTimeString()} ${msg}`;
  if (cls) d.className = cls;
  $('log').append(d); $('log').scrollTop = $('log').scrollHeight;
  (cls === 'bad' ? Relay.error : Relay.log)(msg);
};

// ---------------------------------------------------------------- network

const sched = createScheduler({ initialLog: LS.get('window', []), ceiling: LS.get('ceiling', MAX_CEILING) });
const api = createApi({ sched, cache: createCache() });

// a stale cached copy of this page reloads itself
sched.schedule(location.host, (signal) => fetch(new URL('./build.json', import.meta.url), { cache: 'no-store', signal }))
  .then((r) => (r.ok ? r.json() : null)).then((b) => {
    if (b?.build && b.build !== BUILD && !sessionStorage.getItem('six-degrees:reloaded')) {
      sessionStorage.setItem('six-degrees:reloaded', '1'); location.reload();
    }
  }).catch(() => {});

$('ceiling').value = sched.ceiling;
$('budget').value = LS.get('budget', 500);
$('ceiling').addEventListener('change', () => { $('ceiling').value = sched.setCeiling($('ceiling').value); LS.set('ceiling', sched.ceiling); });
$('budget').addEventListener('change', () => { const v = Math.max(10, Math.floor(+$('budget').value || 500)); $('budget').value = v; LS.set('budget', v); });

const fmtT = (s) => (s < 60 ? `${s} s` : s < 3600 ? `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s` : `${Math.floor(s / 3600)} h ${Math.round((s % 3600) / 60)} min`);
const eta = (n) => fmtT(etaSeconds(n, sched.ceiling, sched.stats().inWindow));
let lastSaved = '';
function renderMeter() {
  const st = sched.stats();
  $('mWin').textContent = st.inWindow;
  $('mCeil').textContent = st.ceiling;
  $('mBar').style.width = `${Math.min(100, (st.inWindow / MAX_CEILING) * 100)}%`;
  $('mMark').style.left = `${(st.ceiling / MAX_CEILING) * 100}%`;
  $('mMark').style.display = st.ceiling < MAX_CEILING ? '' : 'none';
  $('mRun').textContent = nf(st.run);
  $('mQueue').textContent = nf(st.queued + st.active);
  $('paused').textContent = st.paused.map((p) => `${p.host} paused for ${Math.ceil((p.until - Date.now()) / 1000)} s (rate limit)`).join(' · ');
  const snap = JSON.stringify(sched.snapshot());
  if (snap !== lastSaved) { lastSaved = snap; LS.set('window', JSON.parse(snap)); }
}
setInterval(renderMeter, 250);

// ---------------------------------------------------------------- runs, the budget gate, stop

let busy = false, runBudget = 500, gateResolve = null;
function setNext(text) { $('next').textContent = text; }

// Before a step: show its estimate; past the run's budget, wait for a click.
function gate(est, what) {
  const st = sched.stats();
  setNext(`Next step: ${what} — ~${nf(est)} calls, ~${eta(est)} at the current ceiling.`);
  if (st.run + est <= runBudget) return Promise.resolve(true);
  $('gateMsg').textContent = `This run has spent ${nf(st.run)} of its ${nf(runBudget)}-call budget; ${what} needs ~${nf(est)} more (~${eta(est)}).`;
  $('gateBox').classList.add('on');
  Relay.log('gate', { est, run: st.run, budget: runBudget, what });
  return new Promise((resolve) => {
    gateResolve = (go) => {
      gateResolve = null; $('gateBox').classList.remove('on');
      if (go) runBudget = sched.stats().run + est;
      resolve(go);
    };
  });
}
$('gateGo').onclick = () => gateResolve?.(true);
$('gateNo').onclick = () => gateResolve?.(false);
$('stop').onclick = () => { gateResolve?.(false); sched.stop(); log('stopped: queued requests cancelled', 'warn'); };

async function run(name, fn) {
  if (busy) return;
  busy = true;
  document.querySelectorAll('button.run, #find, #load').forEach((b) => { b.disabled = true; });
  $('stop').disabled = false;
  sched.resetRun();
  runBudget = Math.max(10, +$('budget').value || 500);
  const t0 = Date.now();
  log(`${name}: started`);
  try { await fn(); log(`${name}: done, ${nf(sched.stats().run)} calls in ${fmtT(Math.round((Date.now() - t0) / 1000))}`); }
  catch (e) {
    if (e instanceof CancelledError || e?.name === 'CancelledError') log(`${name}: stopped`, 'warn');
    else { log(`${name}: ${e?.message || e}`, 'bad'); console.error(e); }
  } finally {
    busy = false;
    gateResolve?.(false);
    document.querySelectorAll('button.run, #find, #load').forEach((b) => { b.disabled = b.classList.contains('run') && !me; });
    $('stop').disabled = true;
    setNext(`Next step: nothing queued. Last run: ${nf(sched.stats().run)} calls.`);
    refreshCacheCount();
  }
}

// ---------------------------------------------------------------- rendering helpers

const profileUrl = (p) => `https://bsky.app/profile/${encodeURIComponent(p.handle && p.handle !== 'handle.invalid' && !p.handle.startsWith('(') ? p.handle : p.did)}`;
function pcard(p) {
  if (!p) return '<span class="pcard">?</span>';
  const av = p.avatar ? `<img src="${esc(p.avatar)}" alt="" loading="lazy">` : '<span class="ph"></span>';
  return `<a class="pcard" href="${esc(profileUrl(p))}" target="_blank" rel="noopener">${av}<span class="t">
    <div class="n">${esc(p.displayName || p.handle)}</div><div class="h">@${esc(p.handle)}</div>
    <div class="c">${nf(p.followersCount)} followers</div></span></a>`;
}

// rows [{label, n}] or two series side by side
function bars(rows, rows2, names) {
  const max = Math.max(1, ...rows.map((r) => r.n), ...(rows2 || []).map((r) => r.n));
  const tot = rows.reduce((s, r) => s + r.n, 0) || 1, tot2 = rows2 ? rows2.reduce((s, r) => s + r.n, 0) || 1 : 1;
  const labels = rows2 ? [...new Set([...rows.map((r) => String(r.label)), ...rows2.map((r) => String(r.label))])] : rows.map((r) => String(r.label));
  const val = (rs, l) => rs.find((r) => String(r.label) === l)?.n || 0;
  const leg = rows2 ? `<div class="legend"><span><i></i>${esc(names[0])}</span><span><i class="s2"></i>${esc(names[1])}</span></div>` : '';
  return leg + '<div class="chart">' + labels.map((l) => {
    const a = val(rows, l), b = rows2 ? val(rows2, l) : null;
    return `<div class="r"><div class="lab" title="${esc(l)}">${esc(l)}</div><div class="bars">
      <div><i style="width:${(a / max) * 85}%"></i><span>${nf(a)} · ${pct(a / tot, 0)}</span></div>
      ${rows2 ? `<div><i class="s2" style="width:${(b / max) * 85}%"></i><span>${nf(b)} · ${pct(b / tot2, 0)}</span></div>` : ''}
    </div></div>`;
  }).join('') + '</div>';
}
function columns(values, labels, cls = '') {
  const max = Math.max(1, ...values);
  return `<div class="cols">${values.map((v, i) => `<i class="${cls}" style="height:${(v / max) * 100}%" title="${esc(labels[i])}: ${nf(v)}"></i>`).join('')}</div>
    <div class="axis"><span>${esc(labels[0])}</span><span>${esc(labels[Math.floor(labels.length / 2)])}</span><span>${esc(labels[labels.length - 1])}</span></div>`;
}
const stat = (label, v) => `<div class="stat"><b>${v}</b>${esc(label)}</div>`;
const utc = (o) => (o === null || o === undefined ? '–' : `UTC${o >= 0 ? '+' : '−'}${Math.abs(o)}`);

// ---------------------------------------------------------------- result sets: table, CSV, JSON, list

const SETCOLS = ['handle', 'displayName', 'did', 'followersCount', 'followsCount', 'postsCount', 'createdAt'];
const flat = (v) => (Array.isArray(v) ? v.map((x) => x?.val ?? x).join(' ') : v && typeof v === 'object' ? JSON.stringify(v) : v);
function setColumns(rows) {
  const extra = new Set();
  for (const r of rows.slice(0, 200)) for (const k of Object.keys(r)) if (!SETCOLS.includes(k) && !['avatar', 'labels', 'description', 'indexedAt', 'verified', 'verifier'].includes(k)) extra.add(k);
  return [...SETCOLS, ...extra, 'labels'];
}
function download(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
function csv(rows, cols = setColumns(rows)) {
  const cell = (v) => { v = flat(v); v = v === undefined || v === null ? '' : String(v); return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v; };
  return [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n');
}
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

function renderSet(title, rows, context = '') {
  const el = document.createElement('details');
  el.className = 'set';
  const extra = setColumns(rows).filter((c) => !SETCOLS.includes(c) && c !== 'labels');
  const shown = 200;
  const body = (n) => rows.slice(0, n).map((r) => `<tr><td class="acct"><a href="${esc(profileUrl(r))}" target="_blank" rel="noopener">@${esc(r.handle || r.did)}</a><br>${esc(r.displayName || '')}</td>
    <td class="n">${nf(r.followersCount)}</td><td class="n">${nf(r.followsCount)}</td><td class="n">${nf(r.postsCount)}</td><td class="n">${esc((r.createdAt || '').slice(0, 10))}</td>
    ${extra.map((c) => `<td class="n">${esc(flat(r[c]) ?? '')}</td>`).join('')}</tr>`).join('');
  el.innerHTML = `<summary>${esc(title)} <span class="hint">(${nf(rows.length)})</span></summary>
    <div class="bar"><button data-a="csv">CSV</button><button data-a="json">JSON</button><button data-a="list">Make a Bluesky list…</button>
      <span class="mk"><input type="text" value="${esc((context ? context + ': ' : '') + title).slice(0, 64)}" maxlength="64" aria-label="list name"><button data-a="create" class="primary">Create list of ${nf(rows.filter((r) => r.did?.startsWith('did:')).length)}</button><span class="st hint"></span></span></div>
    <div class="tablewrap"><table><thead><tr><th>account</th><th class="n">followers</th><th class="n">follows</th><th class="n">posts</th><th class="n">joined</th>${extra.map((c) => `<th class="n">${esc(c)}</th>`).join('')}</tr></thead>
    <tbody>${body(shown)}</tbody></table></div>${rows.length > shown ? `<button data-a="all">show all ${nf(rows.length)}</button>` : ''}`;
  const name = slug(`${context} ${title}`) || 'accounts';
  el.addEventListener('click', async (ev) => {
    const a = ev.target?.dataset?.a; if (!a) return;
    if (a === 'csv') download(`${name}.csv`, csv(rows), 'text/csv');
    if (a === 'json') download(`${name}.json`, JSON.stringify(rows, null, 1), 'application/json');
    if (a === 'all') { el.querySelector('tbody').innerHTML = body(rows.length); ev.target.remove(); }
    if (a === 'list') {
      if (!oauth.session) { $('handle').focus(); $('acct').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      el.querySelector('.mk').classList.add('on');
    }
    if (a === 'create') {
      const st = el.querySelector('.st'), btn = ev.target;
      btn.disabled = true;
      try { const url = await makeList(el.querySelector('.mk input').value.trim() || title, rows, (m) => { st.textContent = m; }); st.innerHTML = `made: <a href="${esc(url)}" target="_blank" rel="noopener">open the list</a>`; }
      catch (e) { st.textContent = `failed: ${e.message || e}`; st.classList.add('bad'); btn.disabled = false; }
    }
  });
  return el;
}

// tables of lists, starter packs or communities: export only
function exportBar(title, rows, context) {
  const el = document.createElement('div');
  el.className = 'set';
  const name = slug(`${context} ${title}`);
  el.innerHTML = `<div class="bar"><span class="hint">${esc(title)} (${nf(rows.length)}):</span><button data-a="csv">CSV</button><button data-a="json">JSON</button></div>`;
  el.addEventListener('click', (ev) => {
    const a = ev.target?.dataset?.a;
    if (a === 'csv') download(`${name}.csv`, csv(rows, [...new Set(rows.slice(0, 50).flatMap(Object.keys))]), 'text/csv');
    if (a === 'json') download(`${name}.json`, JSON.stringify(rows, null, 1), 'application/json');
  });
  return el;
}

// ---------------------------------------------------------------- OAuth and list making

const REDIRECT = location.origin + location.pathname.replace(/index\.html$/, '');
const isLoopback = ['127.0.0.1', 'localhost', '[::1]'].includes(location.hostname);
const oauth = { client: null, session: null, handle: null };
async function oauthClient() {
  if (oauth.client) return oauth.client;
  const { BrowserOAuthClient } = await import(OAUTH_LIB);
  const clientId = isLoopback
    ? `http://localhost?redirect_uri=${encodeURIComponent(REDIRECT.replace('localhost', '127.0.0.1'))}&scope=${encodeURIComponent(SCOPE + ' transition:generic')}`
    : `${location.origin}/bsky/six-degrees/client-metadata.json`;
  oauth.client = await BrowserOAuthClient.load({ clientId, handleResolver: 'https://bsky.social' });
  return oauth.client;
}
function renderAcct() {
  const on = !!oauth.session;
  $('handle').hidden = on;
  $('signin').textContent = on ? 'Sign out' : 'Sign in';
  $('acctOut').innerHTML = on ? `Signed in as <b>@${esc(oauth.handle || oauth.session.did)}</b>. “Make a Bluesky list…” under any result creates a curated list in your account.`
    : 'Turning a result into a Bluesky list needs you signed in (Bluesky OAuth; no app password). Reading needs nothing. Each table of accounts has a “Make a Bluesky list…” button.';
}
async function initAuth() {
  const back = /[?&#](code|state|error)=/.test(location.search + location.hash);
  if (!back && !LS.get('signedIn', false)) return renderAcct();   // don't load the OAuth library for readers
  try {
    if (isLoopback && location.hostname === 'localhost') { location.replace(location.href.replace('//localhost', '//127.0.0.1')); return; }
    const client = await oauthClient();
    const res = await client.init();
    if (res?.session) {
      oauth.session = res.session;
      LS.set('signedIn', true);
      try { oauth.handle = (await api.resolve(res.session.did)).handle; } catch { /* handle optional */ }
    } else LS.set('signedIn', false);
  } catch (e) {
    log(`sign-in: ${e.message || e}`, 'bad');
    if (/scope/i.test(String(e)) && !LS.get('scopeFallback', false) && LS.get('lastHandle', '')) { LS.set('scopeFallback', true); return signIn(LS.get('lastHandle', '')); }
  }
  renderAcct();
}
async function signIn(h) {
  h = String(h || $('handle').value).trim().replace(/^@/, '');
  if (!h) { $('handle').focus(); return; }
  LS.set('lastHandle', h);
  try { await (await oauthClient()).signInRedirect(h, { scope: LS.get('scopeFallback', false) ? 'atproto transition:generic' : SCOPE }); }
  catch (e) { log(`sign-in: ${e.message || e}`, 'bad'); }
}
$('signin').onclick = async () => {
  if (oauth.session) { try { await oauth.session.signOut?.(); } catch { /* gone already */ } oauth.session = null; LS.set('signedIn', false); renderAcct(); }
  else signIn();
};
$('handle').addEventListener('keydown', (e) => { if (e.key === 'Enter') signIn(); });

// Writes go through the scheduler too, under the PDS's own cap.
async function pdsCall(nsid, body) {
  const s = oauth.session;
  const res = await sched.schedule('your PDS', (signal) => s.fetchHandler(`/xrpc/${nsid}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal }));
  if (!res.ok) throw new Error(`${nsid}: ${res.status} ${(await res.text().catch(() => '')).slice(0, 200)}`);
  return res.json();
}
async function makeList(name, rows, say) {
  const did = oauth.session.did;
  const subjects = [...new Set(rows.map((r) => r.did).filter((d) => d?.startsWith('did:')))];
  const now = new Date().toISOString();
  say('creating the list…');
  const list = await pdsCall('com.atproto.repo.createRecord', { repo: did, collection: 'app.bsky.graph.list',
    record: { $type: 'app.bsky.graph.list', purpose: 'app.bsky.graph.defs#curatelist', name: name.slice(0, 64), description: `Made with austegard.com/bsky/six-degrees on ${now.slice(0, 10)}`, createdAt: now } });
  for (let i = 0; i < subjects.length; i += 200) {
    say(`adding ${Math.min(i + 200, subjects.length)}/${subjects.length}…`);
    await pdsCall('com.atproto.repo.applyWrites', { repo: did, writes: subjects.slice(i, i + 200).map((s) => ({
      $type: 'com.atproto.repo.applyWrites#create', collection: 'app.bsky.graph.listitem',
      value: { $type: 'app.bsky.graph.listitem', subject: s, list: list.uri, createdAt: new Date().toISOString() } })) });
  }
  log(`list “${name}” made with ${subjects.length} accounts`);
  return `https://bsky.app/profile/${did}/lists/${list.uri.split('/').pop()}`;
}

// ---------------------------------------------------------------- path

for (const [id, key] of [['pa', 'pa'], ['pb', 'pb'], ['who', 'who']]) {
  $(id).value = new URLSearchParams(location.search).get(key === 'who' ? 'account' : key === 'pa' ? 'a' : 'b') || LS.get(key, '');
  $(id).addEventListener('change', () => LS.set(key, $(id).value.trim()));
}
$('swap').onclick = () => { const a = $('pa').value; $('pa').value = $('pb').value; $('pb').value = a; LS.set('pa', $('pa').value.trim()); LS.set('pb', $('pb').value.trim()); };
$('cap').value = LS.get('cap', 10);
$('cap').addEventListener('change', () => LS.set('cap', Math.max(1, Math.min(100, +$('cap').value || 10))));
$('mutual').checked = LS.get('mutual', false);
$('mutual').addEventListener('change', () => LS.set('mutual', $('mutual').checked));
$('allp').checked = LS.get('allp', false);
$('allp').addEventListener('change', () => LS.set('allp', $('allp').checked));

const sideWord = (s) => (s === 'forward' ? 'From’s side' : 'To’s side');
function describeStep(s) {
  if (s.side === 'gaps') return `check whether ${s.nodes} unread accounts link up`;
  return `read ring ${s.ring} on ${sideWord(s.side)} (${nf(s.expandable)} of ${nf(s.nodes)} accounts, ${nf(s.pages)} list pages)`;
}

$('find').onclick = () => run('path', async () => {
  const a = $('pa').value.trim(), b = $('pb').value.trim();
  if (!a || !b) { $('pStatus').textContent = 'Give two accounts.'; return; }
  const pageCap = Math.max(1, Math.min(100, +$('cap').value || 10));
  $('pOut').innerHTML = ''; $('pProg').style.width = '0';
  $('pStatus').textContent = 'resolving the two accounts…';
  let steps = 0;
  const r = await findPath(api, a, b, {
    mutual: $('mutual').checked, allPaths: $('allp').checked, maxPaths: 50, pageCap,
    gate: (s) => gate(s.est, describeStep(s)),
    progress: (e) => {
      if (e.phase === 'expand') { steps++; $('pStatus').textContent = describeStep(e) + '…'; $('pProg').style.width = `${Math.min(95, steps * 18)}%`; }
      if (e.phase === 'profiles') $('pStatus').textContent = `follower counts for ${nf(e.n)} new accounts…`;
    },
  });
  $('pProg').style.width = '100%';
  Relay.log('path result', { a, b, hops: r.hops, proven: r.proven, gaps: r.gaps.length, stopped: r.stopped, calls: sched.stats().run });
  if (r.error) log(`path: ${r.error.message || r.error}`, 'bad');
  const ids = [...new Set([...r.paths.flat(), ...r.gaps.map((g) => g.did)])];
  const profs = ids.length ? await api.profiles(ids) : new Map();
  const P = (d) => profs.get(d) || { did: d, handle: d };
  const mode = r.mutual ? 'mutual-follow' : 'follow';
  let verdict;
  if (r.hops === null) {
    verdict = r.proven ? (r.gaps.length ? `No ${mode} path, except possibly through the ${r.gaps.length} accounts too big to read (below).` : `No ${mode} path exists.`)
      : `No ${mode} path found before the search was stopped; one may exist. Rings read: ${r.rings.forward} from ${esc(r.a.handle)}, ${r.rings.backward} from ${esc(r.b.handle)}.`;
  } else if (r.proven && !r.gaps.length) verdict = `<b>${r.hops} hop${r.hops === 1 ? '' : 's'}</b>, proven shortest.`;
  else if (r.proven) verdict = `<b>${r.hops} hops</b>. No shorter path exists unless it runs through one of the ${r.gaps.length} accounts too big to read (raise the page cap to read them).`;
  else verdict = `<b>${r.hops} hops</b> found, <span class="warn">not proven shortest</span>: the search stopped before it could rule out a shorter one.`;
  $('pStatus').textContent = `${nf(sched.stats().run)} calls, ${fmtT(Math.round(r.ms / 1000))}, ${nf(r.visited)} accounts seen`;
  const first = r.paths[0];
  $('pOut').innerHTML = `<p class="verdict">${verdict}</p>` +
    (first ? `<div class="path">${first.map((d) => pcard(P(d))).join('<span class="arrow">→</span>')}</div>` : '') +
    (r.paths.length > 1 ? `<p class="hint">${r.paths.length}${r.paths.length >= 50 ? '+' : ''} shortest paths:</p><ol class="alts">${r.paths.map((p) => `<li>${p.map((d) => esc('@' + P(d).handle)).join(' → ')}</li>`).join('')}</ol>` : '') +
    (r.gaps.length ? `<p class="hint">Not read (over ${pageCap} pages of ${r.mutual ? 'follows or followers' : 'follows on From’s side, followers on To’s side'}): ${r.gaps.slice(0, 40).map((g) => esc('@' + P(g.did).handle)).join(', ')}${r.gaps.length > 40 ? ' …' : ''}</p>` : '') +
    `<p class="hint">Steps: ${r.steps.map((s) => `${s.side === 'gaps' ? 'gap check' : `${sideWord(s.side)} ring ${s.ring}`} (${nf(s.found)} found)`).join(' · ') || 'none needed'}.</p>`;
  if (r.paths.length) {
    const onPath = [...new Set(r.paths.flat())].map(P);
    $('pOut').append(renderSet(r.paths.length > 1 ? 'accounts on the shortest paths' : 'accounts on the path', onPath, `${r.a.handle} to ${r.b.handle}`));
  }
});

// ---------------------------------------------------------------- metrics

let me = null, other = null, ctxData = {};
const ctx = () => ({ api, me, other, data: ctxData });
const tierOut = new Map();

function tierParams(t) {
  if (t.id === 5) return `<div><label>sample size</label><input type="number" data-p="n" min="5" max="1000" value="${t.params.n}"></div>
    <div><label>skip accounts over (pages)</label><input type="number" data-p="pageCap" min="1" max="100" value="${t.params.pageCap}"></div>`;
  if (t.id === 6) return `<div><label>skip accounts over (pages)</label><input type="number" data-p="maxPages" min="1" max="1000" value="${t.params.maxPages}"></div>`;
  if (t.id === 7) return `<div><label>second account</label><input type="text" data-p="other" placeholder="handle" value="${esc(LS.get('other', ''))}"></div>`;
  return '';
}
function renderTiers() {
  $('tiers').innerHTML = TIERS.map((t) => `<div class="tier" data-t="${t.id}"><div><div class="nm">${t.id}. ${esc(t.name)}</div><div class="bl">${esc(t.blurb)}</div></div>
    <div><div class="cost" data-c>…</div><button class="run" data-run="${t.id}" ${me ? '' : 'disabled'}>Run</button></div>
    ${tierParams(t) ? `<div class="params">${tierParams(t)}</div>` : ''}</div>`).join('');
}
renderTiers();

async function refreshEstimates() {
  if (!me) return;
  for (const t of TIERS) {
    const el = document.querySelector(`.tier[data-t="${t.id}"] [data-c]`);
    try {
      if (t.needsOther && !other) { el.textContent = 'give a second account'; continue; }
      if (t.id === 4 && ctxData.listitemCount === undefined) { el.textContent = 'counted when run (1 call)'; continue; }
      const n = await t.estimate(ctx());
      el.textContent = n ? `~${nf(n)} calls · ~${eta(n)}` : 'cached: 0 calls';
    } catch (e) { el.textContent = 'estimate failed'; }
  }
}

$('tiers').addEventListener('change', (ev) => {
  const p = ev.target?.dataset?.p; if (!p) return;
  const t = TIERS.find((x) => x.id === +ev.target.closest('.tier').dataset.t);
  if (p === 'other') { LS.set('other', ev.target.value.trim()); other = null; }
  else t.params[p] = Math.max(+ev.target.min || 1, Math.min(+ev.target.max || 1e6, +ev.target.value || t.params[p]));
  refreshEstimates();
});

$('load').onclick = () => run('load account', async () => {
  const q = $('who').value.trim();
  if (!q) { $('mStatus').textContent = 'Give an account.'; return; }
  await gate(1, 'look up the account');
  me = await api.resolve(q);
  ctxData = {}; other = null;
  for (const el of tierOut.values()) el.remove();
  tierOut.clear();
  $('whoBox').innerHTML = `<div class="who">${me.avatar ? `<img src="${esc(me.avatar)}" alt="">` : ''}<div><div class="n">${esc(me.displayName || me.handle)}</div>
    <div class="h"><a href="${esc(profileUrl(me))}" target="_blank" rel="noopener">@${esc(me.handle)}</a> · ${nf(me.followsCount)} follows · ${nf(me.followersCount)} followers · ${nf(me.postsCount)} posts · joined ${esc((me.createdAt || '').slice(0, 10))}</div></div></div>`;
  renderTiers();
  await refreshEstimates();
});

$('tiers').addEventListener('click', (ev) => {
  const id = +ev.target?.dataset?.run; if (!id) return;
  const t = TIERS.find((x) => x.id === id);
  run(`tier ${id}`, async () => {
    if (t.needsOther) {
      const q = document.querySelector('.tier[data-t="7"] [data-p="other"]').value.trim();
      if (!q) { $('mStatus').textContent = 'Give a second account.'; return; }
      if (!other || (other.handle !== q && other.did !== q)) { await gate(1, 'look up the second account'); other = await api.resolve(q); }
    }
    $('mStatus').textContent = 'estimating…';
    const est = await t.estimate(ctx());
    if (!(await gate(est, `${t.name} for @${me.handle}`))) { $('mStatus').textContent = 'not run'; return; }
    $('mProg').style.width = '0';
    const res = await t.run(ctx(), (msg, f) => { $('mStatus').textContent = msg; if (f !== undefined) $('mProg').style.width = `${Math.round(f * 100)}%`; });
    $('mProg').style.width = '100%';
    $('mStatus').textContent = `${t.name}: ${nf(sched.stats().run)} calls`;
    Relay.log(`tier ${id} done`, { account: me.handle, calls: sched.stats().run });
    showTier(t, res);
    await refreshEstimates();
  });
});

function showTier(t, res) {
  tierOut.get(t.id)?.remove();
  const el = document.createElement('section');
  el.className = 'card';
  el.innerHTML = `<h2>${t.id}. ${esc(t.name)} · @${esc(me.handle)}</h2>` + (RENDER[t.id]?.(res) || '');
  for (const [name, rows] of Object.entries(res.sets || {})) el.append(renderSet(name, rows, `@${me.handle}`));
  for (const [name, rows] of Object.entries(res.exports || {})) if (rows.length) el.append(exportBar(name, rows, `@${me.handle}`));
  if (t.id === 6) drawEgo(el.querySelector('canvas.ego'), res.graph);
  tierOut.set(t.id, el);
  const after = [...tierOut.keys()].filter((k) => k < t.id).sort((a, b) => b - a)[0];
  if (after) tierOut.get(after).after(el); else $('mOut').prepend(el);
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const ci = (o, d = 1) => `${pct(o.mean, d)} <span class="hint">(95% CI ${pct(o.lo, d)}–${pct(o.hi, d)})</span>`;
const hourLabels = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00 UTC`);
const RENDER = {
  1: (r) => `<div class="stats">${stat('follows', nf(r.counts.follows))}${stat('followers', nf(r.counts.followers))}${stat('mutuals', nf(r.counts.mutuals))}
      ${stat('followed, not following back', nf(r.counts.notBack))}${stat('followers not followed back', nf(r.counts.fans))}${stat('without a profile (deleted, hidden)', nf(r.counts.missingProfiles))}</div>
    <div class="grid2"><div><h3>Account created</h3>${bars(r.follows.years, r.followers.years, ['follows', 'followers'])}</div>
      <div><h3>Posts</h3>${bars(r.follows.posts, r.followers.posts, ['follows', 'followers'])}</div>
      <div><h3>Followers per account followed</h3>${bars(r.follows.ratio, r.followers.ratio, ['follows', 'followers'])}</div>
      <div><h3>Handles</h3>${bars(r.follows.kinds, r.followers.kinds, ['follows', 'followers'])}</div>
      <div><h3>Handle domains, follows</h3>${bars(r.follows.suffixes)}</div>
      <div><h3>Handle domains, followers</h3>${bars(r.followers.suffixes)}</div>
      <div><h3>Labels, follows</h3>${r.follows.labels.length ? bars(r.follows.labels) : '<p class="hint">none</p>'}</div>
      <div><h3>Labels, followers</h3>${r.followers.labels.length ? bars(r.followers.labels) : '<p class="hint">none</p>'}</div></div>
    <p class="hint">Verified: ${nf(r.follows.verified)} follows, ${nf(r.followers.verified)} followers. Trusted verifiers: ${nf(r.follows.verifiers)} follows, ${nf(r.followers.verifiers)} followers. “(self)” labels are ones accounts put on themselves, such as !no-unauthenticated.</p>`,
  2: (r) => `<div class="stats">${stat('follow records', nf(r.records))}${stat('accounts followed', nf(r.subjects))}${stat('shown by the AppView', nf(r.shown))}
      ${stat('not shown (deleted, deactivated, taken down)', nf(r.hidden))}${stat('followed more than once', nf(r.duplicates))}</div>
    <h3>Follows made per month</h3>${r.timeline.length ? columns(r.timeline.map((x) => x.n), r.timeline.map((x) => x.label)) : '<p class="hint">no dated records</p>'}
    <p class="hint">Read from ${esc(r.pds)}. First follow ${esc((r.first || '').slice(0, 10))}, latest ${esc((r.last || '').slice(0, 10))}. A follow’s date is the createdAt its app wrote, so imported follows can carry the import’s date.</p>`,
  3: (r) => `<div class="grid2"><div><h3>Last post of each account followed (${nf(r.n)})</h3>${bars(r.lastPost)}</div>
      <div><h3>Main language of their last 10 posts</h3>${bars(r.langs)}</div>
      <div><h3>@${esc(me.handle)}’s posting hours (last ${nf(r.ownPosts)} posts)</h3>${columns(r.ownHours, hourLabels)}<p class="hint">Its quietest six hours put it near ${utc(r.ownOffset)}${r.ownOffset === null ? ' (too few posts to tell)' : ''}.</p></div>
      <div><h3>Posting hours of its follows</h3>${columns(r.netHours, hourLabels, 's2')}<p class="hint">Taken together they sleep like ${utc(r.netOffset)}. Profiles carry no country; this is a guess from when people are quiet.</p></div></div>`,
  4: (r) => `<div class="stats">${stat('list entries', nf(r.entries))}${stat('curated lists', nf(r.lists))}${stat('starter packs', nf(r.packs))}</div>
    <p class="hint">${r.modlistsLeftOut ? `${nf(r.modlistsLeftOut)} moderation lists left out. ` : ''}From Constellation’s backlinks to the account; lists deleted since are skipped.</p>
    ${r.table.lists.length ? `<h3>Lists</h3><div class="tablewrap"><table><thead><tr><th>list</th><th>owner</th><th class="n">members</th><th class="n">added</th></tr></thead><tbody>${r.table.lists.map((l) => `<tr><td><a href="https://bsky.app/profile/${esc(l.ownerDid)}/lists/${esc(l.uri.split('/').pop())}" target="_blank" rel="noopener">${esc(l.name)}</a>${l.purpose === 'curatelist' ? '' : ` <span class="hint">${esc(l.purpose)}</span>`}</td><td>@${esc(l.owner)}</td><td class="n">${nf(l.items)}</td><td class="n">${esc((l.added || '').slice(0, 10))}</td></tr>`).join('')}</tbody></table></div>` : ''}
    ${r.table.packs.length ? `<h3>Starter packs</h3><div class="tablewrap"><table><thead><tr><th>starter pack</th><th>owner</th><th class="n">members</th><th class="n">joined through it</th></tr></thead><tbody>${r.table.packs.map((p) => `<tr><td><a href="https://bsky.app/starter-pack/${esc(p.uri.split('/')[2])}/${esc(p.uri.split('/').pop())}" target="_blank" rel="noopener">${esc(p.name)}</a></td><td>@${esc(p.owner)}</td><td class="n">${nf(p.items)}</td><td class="n">${nf(p.joined)}</td></tr>`).join('')}</tbody></table></div>` : ''}`,
  5: (r) => `<div class="stats">${stat('density: share of the account’s other follows each one follows', ci(r.density))}${stat('Jaccard, their follows vs the account’s', ci(r.jaccardMe))}${stat('Jaccard between them', ci(r.jaccardPairs))}</div>
    <p class="hint">A random ${nf(r.n)} of the ${nf(r.pool)} accounts followed that have at most ${r.pageCap} pages of follows (${nf(r.excluded)} that follow more were left out, and since they tend to follow more of the others, density may read a little low). Density of ${pct(r.density.mean)} means a typical follow also follows ${pct(r.density.mean)} of the account’s other follows.${r.followsMe !== null ? ` ${nf(r.followsMe)} of the sample follow the account back.` : ''} Intervals: percentile bootstrap over the sampled accounts.</p>`,
  6: (r) => `<div class="stats">${stat('accounts', nf(r.n))}${stat('follow edges among them', nf(r.edges))}${stat('mutual pairs', nf(r.mutualEdges))}${stat('density', pct(r.density, 2))}${stat('modularity', r.modularity.toFixed(3))}</div>
    <p class="hint">${r.skipped ? `${nf(r.skipped)} accounts with over ${r.maxPages} pages of follows left out. ` : ''}${r.failed ? `${nf(r.failed)} could not be read. ` : ''}Communities by Louvain on follow edges either way; bridges by betweenness, with participation = how evenly an account’s links spread over communities (0 = one community).</p>
    <canvas class="ego" width="1400" height="1400"></canvas>
    <h3>Communities</h3><div class="tablewrap"><table><thead><tr><th class="n">#</th><th class="n">size</th><th>most connected inside</th></tr></thead><tbody>${r.communities.slice(0, 20).map((c) => `<tr><td class="n">${c.rank}</td><td class="n">${nf(c.size)}</td><td>${c.top.map((h) => esc('@' + h)).join(', ')}</td></tr>`).join('')}</tbody></table></div>`,
  7: (r) => `<div class="tablewrap"><table><thead><tr><th></th><th class="n">@${esc(r.a.handle)}</th><th class="n">@${esc(r.b.handle)}</th><th class="n">shared</th><th class="n">Jaccard</th></tr></thead><tbody>
    <tr><td>follows</td><td class="n">${nf(r.follows.a)}</td><td class="n">${nf(r.follows.b)}</td><td class="n">${nf(r.follows.shared)}</td><td class="n">${pct(r.follows.jaccard, 2)}</td></tr>
    <tr><td>followers</td><td class="n">${nf(r.followers.a)}</td><td class="n">${nf(r.followers.b)}</td><td class="n">${nf(r.followers.shared)}</td><td class="n">${pct(r.followers.jaccard, 2)}</td></tr></tbody></table></div>
    <p class="hint">@${esc(r.a.handle)} ${r.aFollowsB ? 'follows' : 'does not follow'} @${esc(r.b.handle)}; @${esc(r.b.handle)} ${r.bFollowsA ? 'follows' : 'does not follow'} @${esc(r.a.handle)}.</p>`,
};

// force layout of the ego network, coloured by community; runs in slices so the page stays responsive
function drawEgo(canvas, g) {
  if (!canvas || !g) return;
  const n = g.nodes.length;
  if (n < 2 || n > 3000) { canvas.remove(); return; }
  const ctx2 = canvas.getContext('2d'), W = canvas.width;
  const und = g.out.map(() => new Set());
  g.out.forEach((l, i) => l.forEach((j) => { und[i].add(j); und[j].add(i); }));
  const E = []; und.forEach((s, i) => s.forEach((j) => { if (j > i) E.push([i, j]); }));
  const comms = Math.max(...g.community) + 1;
  const x = new Float64Array(n), y = new Float64Array(n), dx = new Float64Array(n), dy = new Float64Array(n);
  g.community.forEach((c, i) => { const a = (c / comms) * 2 * Math.PI; x[i] = Math.cos(a) * 0.4 + (Math.random() - 0.5) * 0.2; y[i] = Math.sin(a) * 0.4 + (Math.random() - 0.5) * 0.2; });
  const k = 1 / Math.sqrt(n), iters = Math.max(30, Math.min(300, Math.round(4e8 / (n * n))));
  const palette = ['#2d5b8a', '#c0672b', '#1a7f4b', '#8a2d6b', '#9a7b00', '#2d8a85', '#b3261e', '#5b5b9a', '#6b8a2d', '#8a5a2d'];
  let it = 0;
  const draw = () => {
    ctx2.clearRect(0, 0, W, W);
    const px = (v) => (v * 0.46 + 0.5) * W;
    ctx2.globalAlpha = Math.max(0.03, Math.min(0.25, 400 / E.length));
    ctx2.strokeStyle = getComputedStyle(document.body).color;
    ctx2.lineWidth = 1;
    ctx2.beginPath();
    for (const [i, j] of E) { ctx2.moveTo(px(x[i]), px(y[i])); ctx2.lineTo(px(x[j]), px(y[j])); }
    ctx2.stroke();
    ctx2.globalAlpha = 0.9;
    for (let i = 0; i < n; i++) { ctx2.fillStyle = g.community[i] < 10 ? palette[g.community[i]] : '#888'; ctx2.beginPath(); ctx2.arc(px(x[i]), px(y[i]), 2 + Math.min(6, Math.sqrt(und[i].size) / 2), 0, 7); ctx2.fill(); }
  };
  const step = () => {
    const t0 = performance.now();
    while (it < iters && performance.now() - t0 < 30) {
      const temp = 0.08 * (1 - it / iters) + 0.002;
      dx.fill(0); dy.fill(0);
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        const ex = x[i] - x[j], ey = y[i] - y[j], d2 = ex * ex + ey * ey + 1e-6, f = (k * k) / d2;
        dx[i] += ex * f; dy[i] += ey * f; dx[j] -= ex * f; dy[j] -= ey * f;
      }
      for (const [i, j] of E) {
        const ex = x[i] - x[j], ey = y[i] - y[j], d = Math.sqrt(ex * ex + ey * ey) + 1e-6, f = d / k;
        dx[i] -= ex * f; dy[i] -= ey * f; dx[j] += ex * f; dy[j] += ey * f;
      }
      for (let i = 0; i < n; i++) {
        dx[i] -= x[i] * 0.5; dy[i] -= y[i] * 0.5;                   // gravity keeps it on the canvas
        const d = Math.sqrt(dx[i] * dx[i] + dy[i] * dy[i]) + 1e-9, m = Math.min(d, temp);
        x[i] = Math.max(-1, Math.min(1, x[i] + (dx[i] / d) * m)); y[i] = Math.max(-1, Math.min(1, y[i] + (dy[i] / d) * m));
      }
      it++;
    }
    draw();
    if (it < iters) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ---------------------------------------------------------------- cache footer, start

async function refreshCacheCount() { try { $('cacheN').textContent = `${nf(await api.cache.count())} cached items`; } catch { /* none */ } }
$('clearCache').onclick = async () => { await api.cache.clear(); refreshCacheCount(); log('cache cleared'); };
refreshCacheCount();
initAuth();
const qp = new URLSearchParams(location.search);
if (qp.get('go') === '1' && $('pa').value && $('pb').value) $('find').click();
log(`ready (build ${BUILD})`);
