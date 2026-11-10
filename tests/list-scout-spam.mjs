// node tests/list-scout-spam.mjs
// List Scout's spam signals (bsky/list-scout/spam.js) on made-up accounts shaped like the ones a search for
// baking words turned up on 2026-11-09: product listings, a recipe-link feed, a promo account that repeats
// itself, a now-playing bot, and people. Then the page itself in headless Chromium, given those accounts:
// the filtered ones are left out of the table, the checkbox brings them back, and "all" ticks only what shows.
import { spamSignals, spamReasons } from '../bsky/list-scout/spam.js';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { createRequire } from 'node:module';

let fails = 0, passes = 0;
const ok = (cond, msg) => { if (cond) { passes++; console.log('ok  ', msg); } else { fails++; console.log('FAIL', msg); } };

const link = (uri) => ({ $type: 'app.bsky.embed.external', external: { uri } });
const words = ['oven', 'crumb', 'butter', 'starter', 'proof', 'flour', 'crust', 'tin', 'rack', 'steam', 'yeast', 'salt'];
// a different sentence for every i: the first word spells i in letters, so no two share a beginning
const spell = (i) => [...String(i + 1000)].map((d) => 'abcdefghij'[d]).join('');
const say = (i) => `${spell(i)} ${words[i % 12]} ${words[(i * 5 + 3) % 12]} and some thoughts about ${words[(i * 7 + 1) % 12]} today`;
const acct = (n, f) => Array.from({ length: n }, (_, i) => f(i));
const accounts = {
  listings: acct(100, (i) => ({ text: `Dutch Oven Casserole Pot ${say(i)} #cake #jam #bread #kitchen #deal`, embed: link('https://shop.example/' + i) })),
  recipeFeed: acct(100, (i) => ({ text: `Easy ${say(i)} muffins, recipe on the blog`, embed: link('https://blog.example/' + i) })),
  promo: acct(100, (i) => ({ text: i % 3 ? say(i) : 'Discover how to bake moist, tangy sourdough muffins with our premium starter kit' })),
  nowPlaying: acct(100, (i) => ({ text: `${say(i)} #NowPlaying https://radio.example/${i}` })),
  baker: acct(80, (i) => ({ text: say(i), reply: i % 2 ? { parent: {} } : undefined })),
  blogger: acct(60, (i) => ({ text: say(i), embed: link('https://me.example/' + i), reply: i % 3 === 0 ? { parent: {} } : undefined })),
  greeter: acct(60, (i) => ({ text: i % 2 ? 'good morning!' : say(i), reply: i % 2 ? { parent: {} } : undefined })),
  newcomer: acct(6, (i) => ({ text: 'Discover how to bake moist, tangy sourdough muffins', embed: link('https://x.example'), reply: i % 2 ? { parent: {} } : undefined })),
};
const verdict = (recs) => spamReasons(spamSignals(recs), recs.filter((r) => r.reply).length / recs.length);
const want = { listings: ['mostly links', 'hashtag-heavy'], recipeFeed: ['mostly links'], promo: ['repeats itself'], nowPlaying: ['mostly links'],
               baker: [], blogger: [], greeter: [], newcomer: [] };
for (const [name, recs] of Object.entries(accounts)) {
  const got = verdict(recs);
  ok(JSON.stringify(got) === JSON.stringify(want[name]), `${name}: ${got.join(', ') || 'not spam'}`);
}
const s = spamSignals(accounts.promo);
ok(Math.abs(s.dupFrac - 34 / 100) < 1e-9 && s.linkFrac === 0, `promo: 34 of 100 posts repeat (${s.dupFrac})`);
ok(spamSignals([]).n === 0 && spamReasons(spamSignals([]), 0).length === 0, 'an account with no posts has no reasons');
ok(spamSignals([{ text: 'see #a #b', facets: [{ features: [{ $type: 'app.bsky.richtext.facet#tag' }, { $type: 'app.bsky.richtext.facet#tag' }] }] }]).tagRate === 2, 'hashtags are counted once whether read from facets or text');
ok(spamSignals([{ text: 'x', facets: [{ features: [{ $type: 'app.bsky.richtext.facet#link', uri: 'https://a.example' }] }] }]).linkFrac === 1, 'a link facet counts as a link');

// ---- the page
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ROOT = resolve(new URL('..', import.meta.url).pathname);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css' };
const server = createServer(async (req, res) => {
  try {
    const p = join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' });
    res.end(await readFile(p));
  } catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
// the page's own script, with one line added that lets the test hand it accounts as if a run had finished
await page.route('**/bsky/list-scout/scout.js', async (route) => {
  const body = await readFile(join(ROOT, 'bsky/list-scout/scout.js'), 'utf8');
  await route.fulfill({ contentType: 'text/javascript', body:
    'window.__scout = { show(list) { candidates = list.map((c) => ({ ...c, flags: flags(c), checked: false })); candidates.forEach((c) => { c.checked = looksRight(c); }); render(); $("results").hidden = false; return candidates.map((c) => [c.handle, c.flags, c.checked]); } };\n' + body });
});
await page.goto(`http://127.0.0.1:${server.address().port}/bsky/list-scout/index.html`);
await page.waitForFunction(() => window.__scout, null, { timeout: 30000 });
const r = await page.evaluate(async (accounts) => {
  const { spamSignals, spamReasons } = await import('/bsky/list-scout/spam.js');
  const list = Object.entries(accounts).map(([handle, recs], i) => {
    const replyFrac = recs.filter((x) => x.reply).length / recs.length;
    return { did: 'did:plc:' + i, handle, name: handle, bio: '', hits: 5, followers: 10, share: 0.9, ppd: 5, topicPerDay: 4.5, replyFrac,
             posts: recs.map((x) => ({ text: x.text, p: 0.9 })), spam: spamReasons(spamSignals(recs), replyFrac) };
  });
  const state = window.__scout.show(list);
  const rows = () => [...document.querySelectorAll('#rows tr')].map((tr) => tr.querySelector('.who a').textContent.slice(1));
  const hidden = rows();
  const note = document.getElementById('filteredNote').textContent, count0 = document.getElementById('count').textContent;
  document.getElementById('tickAll').click();
  const tickedHidden = [...document.querySelectorAll('#rows input:checked')].length, count1 = document.getElementById('count').textContent;
  document.getElementById('showFiltered').click();
  const all = rows();
  const tickedAll = [...document.querySelectorAll('#rows input:checked')].length;
  const flagText = [...document.querySelectorAll('#rows tr')].find((tr) => tr.textContent.includes('@listings'))?.querySelector('.flags')?.textContent;
  return { state, hidden, note, count0, count1, tickedHidden, all, tickedAll, flagText };
}, accounts);
await browser.close();
server.close();
const people = ['baker', 'blogger', 'greeter'];
ok(people.every((h) => r.hidden.includes(h)) && !['listings', 'recipeFeed', 'promo', 'nowPlaying'].some((h) => r.hidden.includes(h)),
   `the table leaves out the four spam accounts (shows ${r.hidden.join(', ')})`);
ok(r.hidden.includes('newcomer'), 'an account with few posts is shown, flagged and unticked');
ok(/show 4 filtered out/.test(r.note), `the checkbox says how many are filtered out ("${r.note}")`);
ok(r.state.filter((x) => x[2]).map((x) => x[0]).sort().join() === 'baker,blogger,greeter', `pre-ticked: ${r.state.filter((x) => x[2]).map((x) => x[0]).join(', ')}`);
ok(r.tickedHidden === r.hidden.length && /^4 of 4/.test(r.count1), `"all" ticks only the accounts that show (${r.count1})`);
ok(r.all.length === 8 && r.tickedAll === 4, `ticking the checkbox shows all ${r.all.length} accounts, the filtered ones unticked`);
ok(/mostly links/.test(r.flagText || '') && /hashtag-heavy/.test(r.flagText || ''), `a filtered account shows its reasons (${r.flagText})`);
ok(errors.length === 0, 'no page errors' + errors.slice(0, 2).map((e) => ' | ' + e).join(''));
console.log(`${passes} passed, ${fails} failed`);
process.exit(fails ? 1 : 0);
