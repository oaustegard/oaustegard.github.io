// Drives index.html in headless Chromium with the network mocked: signs in,
// builds a 3-option poll, checks the records written to the PDS, then counts
// results from a mocked repo listing where one account liked two options and one
// option's likes span two pages. Run: node bsky/tests/like-poll.browser.js
const { chromium } = require('playwright');
const path = require('path');
const assert = require('assert');

const DID = 'did:plc:testuser000000000000000';
const PDS = 'https://pds.example.com';
const json = (route, body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const writes = [];
  let n = 0;
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    const nsid = url.pathname.split('/').pop();
    if (url.protocol === 'file:') return route.continue();
    if (nsid === 'com.atproto.identity.resolveHandle') return json(route, { did: DID });
    if (url.host === 'plc.directory') return json(route, { id: DID, service: [{ id: '#atproto_pds', type: 'AtprotoPersonalDataServer', serviceEndpoint: PDS }] });
    if (nsid === 'com.atproto.server.createSession') {
      const b = JSON.parse(route.request().postData());
      assert.equal(b.identifier, DID); assert.equal(b.password, 'abcd-efgh-ijkl-mnop');
      return json(route, { did: DID, handle: 'tester.bsky.social', accessJwt: 'A', refreshJwt: 'R' });
    }
    if (nsid === 'com.atproto.repo.createRecord') {
      assert.equal(route.request().headers().authorization, 'Bearer A');
      const b = JSON.parse(route.request().postData());
      writes.push(b);
      const rkey = b.rkey || `rk${n++}`;
      return json(route, { uri: `at://${DID}/${b.collection}/${rkey}`, cid: `cid-${rkey}` });
    }
    if (nsid === 'com.atproto.repo.getRecord') {
      assert.equal(url.origin, PDS);
      return json(route, { uri: `at://${DID}/app.bsky.feed.post/${url.searchParams.get('rkey')}`, value: { text: 'Lunch?\n\n🗳️ Poll…' } });
    }
    if (nsid === 'com.atproto.repo.listRecords') {
      // Options in the repo after the question: rk0 has direct replies, chain0 the first
      // version's chain (each option's parent is the previous one, root is the question).
      assert.equal(url.origin, PDS);
      assert.equal(url.searchParams.get('reverse'), 'true');
      const root = url.searchParams.get('cursor');
      const rootUri = `at://${DID}/app.bsky.feed.post/${root}`;
      const labels = ['1️⃣ Tacos', '2️⃣ Pho', '3️⃣ Salad'];
      const rec = (rkey, text, parent) => ({ uri: `at://${DID}/app.bsky.feed.post/${rkey}`, value: { text, reply: { root: { uri: rootUri }, parent: { uri: parent } } } });
      const records = [
        { uri: `at://${DID}/app.bsky.feed.post/unrelated`, value: { text: '1️⃣ not a poll option' } },
        rec('rk3', labels[2] + '\n\n♥ like to vote', root === 'chain0' ? `at://${DID}/app.bsky.feed.post/rk2` : rootUri),
        rec('rk1', labels[0] + '\n\n♥ like to vote', rootUri),
        rec('rk2', labels[1] + '\n\n♥ like to vote', root === 'chain0' ? `at://${DID}/app.bsky.feed.post/rk1` : rootUri),
      ];
      return json(route, { records });
    }
    if (url.host === 'constellation.microcosm.blue') {
      // Option rk2 exercises the getLikes fallback.
      const target = url.searchParams.get('target'), cursor = url.searchParams.get('cursor');
      assert.equal(url.searchParams.get('collection'), 'app.bsky.feed.like');
      if (target.endsWith('rk2')) return json(route, { error: 'boom' }, 500);
      if (target.endsWith('rk1')) return cursor ? json(route, { linking_dids: ['c', 'd'], cursor: null }) : json(route, { linking_dids: ['a', 'b'], cursor: 'p2' });
      return json(route, { linking_dids: [], cursor: null });
    }
    if (nsid === 'app.bsky.feed.getLikes') {
      const uri = url.searchParams.get('uri'), cursor = url.searchParams.get('cursor');
      const L = ds => ds.map(d => ({ actor: { did: d } }));
      if (uri.endsWith('rk2')) return json(route, { likes: L(['a', 'e']) });
      return json(route, { likes: [] });
    }
    throw new Error('unexpected request ' + url);
  });
  page.on('pageerror', e => { console.error('pageerror', e); process.exitCode = 1; });

  await page.goto('file://' + path.join(__dirname, '..', 'like-poll.html'));
  await page.fill('#handle', '@Tester');
  await page.fill('#password', 'abcd-efgh-ijkl-mnop');
  await page.click('#loginBtn');
  await page.waitForSelector('#builder:not(.hidden)');
  assert.equal(await page.textContent('#whoami'), '@tester.bsky.social');

  assert(await page.isDisabled('#postBtn'), 'post disabled while empty');
  await page.fill('#question', 'Lunch?');
  const ins = await page.$$('#opts input');
  await ins[0].fill('Tacos'); await ins[1].fill('Pho');
  await page.click('#addOpt');
  await (await page.$$('#opts input'))[2].fill('Salad, see https://example.com/menü.');
  assert.equal(await page.$$eval('#preview .post', ps => ps.length), 4);
  assert(!(await page.isDisabled('#postBtn')));
  await page.screenshot({ path: path.join(require('os').tmpdir(), 'like-poll-builder.png'), fullPage: true });

  await page.click('#postBtn');
  await page.waitForSelector('#postMsg.ok');
  assert.equal(writes.length, 5, 'root + 3 options + threadgate');
  const [root, o1, o2, o3, gate] = writes;
  assert.equal(root.collection, 'app.bsky.feed.post');
  assert(root.record.text.startsWith('Lunch?\n\n🗳️ Poll'));
  assert(!root.record.reply);
  assert.equal(o1.record.text, '1️⃣ Tacos\n\n♥ like to vote');
  const uf = o3.record.facets[0];
  assert.equal(uf.features[0].uri, 'https://example.com/menü');
  assert.equal(Buffer.from(o3.record.text, 'utf8').subarray(uf.index.byteStart, uf.index.byteEnd).toString(), 'https://example.com/menü');
  const rootRef = { uri: `at://${DID}/app.bsky.feed.post/rk0`, cid: 'cid-rk0' };
  for (const o of [o1, o2, o3]) assert.deepEqual(o.record.reply, { root: rootRef, parent: rootRef }, 'every option replies to the question');
  // Credit line: "via Like Poll" with a link facet over exactly "Like Poll" (UTF-8 byte offsets).
  assert(root.record.text.endsWith('\n\nvia Like Poll'));
  const lf = root.record.facets.find(f => f.features[0].uri === 'https://austegard.com/bsky/like-poll.html');
  const b = Buffer.from(root.record.text, 'utf8');
  assert.equal(b.subarray(lf.index.byteStart, lf.index.byteEnd).toString(), 'Like Poll');
  assert(!o1.record.facets, 'no facets on plain option');
  assert.equal(gate.collection, 'app.bsky.feed.threadgate');
  assert.equal(gate.rkey, 'rk0');
  assert.deepEqual(gate.record.allow, []);
  assert.equal(await page.inputValue('#pollUrl'), 'https://bsky.app/profile/tester.bsky.social/post/rk0');

  await page.click('#resultsForm button');
  await page.waitForSelector('#resultsOut table');
  const rows = await page.$$eval('#resultsOut tbody tr', trs => trs.map(tr => [...tr.cells].map(c => c.textContent.trim().replace(/\s+/g, ' '))));
  console.log(rows, await page.textContent('#resultsMsg'));
  assert.deepEqual(rows.map(r => r[2]), ['4', '2', '0'], 'raw likes incl. page 2');
  assert.deepEqual(rows.map(r => r[1].split(' ')[0]), ['3', '1', '0'], 'multi-liker a dropped');
  assert(rows[0][0].includes('Tacos'));
  assert.match(await page.textContent('#resultsMsg'), /4 votes from 5 accounts\. 1 account liked more than one option.*may miss likers/);
  assert.equal(await page.textContent('#resultsOut .question'), 'Lunch?');
  await page.screenshot({ path: path.join(require('os').tmpdir(), 'like-poll-results.png'), fullPage: true });

  // The counter still reads a poll posted as a reply chain.
  await page.fill('#pollUrl', `at://${DID}/app.bsky.feed.post/chain0`);
  await page.click('#resultsForm button');
  await page.waitForFunction(() => /votes from/.test(document.querySelector('#resultsMsg').textContent));
  const chainRows = await page.$$eval('#resultsOut tbody tr', trs => trs.map(tr => tr.cells[2].textContent.trim()));
  assert.deepEqual(chainRows, ['4', '2', '0'], 'chain layout counted');
  await browser.close();
  console.log(process.exitCode ? 'FAIL' : 'PASS');
})().catch(e => { console.error(e); process.exit(1); });
