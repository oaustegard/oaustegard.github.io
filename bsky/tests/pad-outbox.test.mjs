// Contract tests for bsky/pad-outbox.js: sealing, and merging participants'
// records through a fake PDS + Constellation.
// Run: node --test bsky/tests/pad-outbox.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as Y from '../yjs.vendor.mjs';
import { PadOutbox, COLLECTION, newKeyString, importKey, seal, unseal } from '../pad-outbox.js';

const DOC = 'abcdefghij234567abcd';
const HOST = 'did:plc:host0000000000000000000';
const GUEST = 'did:plc:guest000000000000000000';

test('seal/unseal round-trips and binds the docId', async () => {
  const key = await importKey(newKeyString());
  const bytes = new TextEncoder().encode('hello pad '.repeat(50));
  const rec = await seal(key, DOC, bytes);
  assert.deepEqual(await unseal(key, DOC, rec), bytes);
  await assert.rejects(unseal(key, 'otherdoc', rec));                     // AAD mismatch
  await assert.rejects(unseal(await importKey(newKeyString()), DOC, rec)); // wrong key
  assert.ok(!JSON.stringify(rec).includes('hello'));
});

test('importKey rejects a key of the wrong length', async () => {
  await assert.rejects(importKey('abc'));
});

/** In-memory PDS for every DID, plus Constellation over the stored records. */
function fakeNetwork() {
  const repos = new Map();   // did -> { record, cid }
  let n = 0;
  globalThis.fetch = async (url, opts = {}) => {
    const u = new URL(url);
    if (u.pathname.endsWith('com.atproto.repo.getRecord')) {
      const r = repos.get(u.searchParams.get('repo'));
      if (!r) return { ok: false, status: 400, json: async () => ({ error: 'RecordNotFound' }) };
      return { ok: true, status: 200, json: async () => ({ uri: 'x', cid: r.cid, value: r.record }) };
    }
    if (u.pathname.endsWith('getBacklinks')) {
      const subject = u.searchParams.get('subject');
      const records = [...repos].filter(([, r]) => r.record.ref === subject)
        .map(([did]) => ({ did, collection: COLLECTION, rkey: DOC }));
      return { ok: true, status: 200, json: async () => ({ records }) };
    }
    throw new Error('unexpected fetch ' + url);
  };
  return repos;
}

function participant(did, repos, key) {
  const ydoc = new Y.Doc();
  const rtc = {
    me: { did, pds: 'https://pds.test' },
    constructor: { resolvePds: async () => 'https://pds.test' },
    async _pdsCall(nsid, { body }) {
      if (nsid.endsWith('putRecord')) repos.set(body.repo, { record: body.record, cid: 'c' + Math.random() });
      if (nsid.endsWith('deleteRecord')) repos.delete(body.repo);
      return {};
    }
  };
  const ob = new PadOutbox({ Y, ydoc, docId: DOC, key, rootDid: HOST, rtc, origin: 'remote', publishMs: 0, discoverMs: 0 });
  return { ydoc, text: ydoc.getText('content'), ob };
}

test('a guest reads the host without logging in, and the host finds the guest', async () => {
  const repos = fakeNetwork();
  const key = await importKey(newKeyString());
  const host = participant(HOST, repos, key);
  const guest = participant(GUEST, repos, key);

  host.text.insert(0, 'from host');
  await host.ob.enablePublishing();
  assert.equal(repos.get(HOST).record.ref, undefined);     // the root carries no ref

  guest.ob.rtc.me = { did: null };                          // not logged in: read-only
  await guest.ob.pollOnce();
  assert.equal(guest.text.toString(), 'from host');
  assert.equal(guest.ob.status.rootFound, true);

  guest.ob.rtc.me = { did: GUEST, pds: 'https://pds.test' };
  guest.text.insert(guest.text.length, ' + guest');
  await guest.ob.enablePublishing();
  assert.equal(repos.get(GUEST).record.ref, `at://${HOST}/${COLLECTION}/${DOC}`);

  await host.ob.pollOnce();                                  // discovers GUEST via backlink
  assert.equal(host.text.toString(), 'from host + guest');
});

test('an unchanged record is not re-applied, and a missing root is reported', async () => {
  const repos = fakeNetwork();
  const key = await importKey(newKeyString());
  const guest = participant(GUEST, repos, key);
  await guest.ob.pollOnce();
  assert.equal(guest.ob.status.rootFound, false);

  const host = participant(HOST, repos, key);
  host.text.insert(0, 'x');
  await host.ob.enablePublishing();
  await guest.ob.pollOnce();
  await guest.ob.pollOnce();
  assert.equal(guest.ob.status.merged, 1);
});

test('unpublish deletes our record and stops writes', async () => {
  const repos = fakeNetwork();
  const key = await importKey(newKeyString());
  const host = participant(HOST, repos, key);
  await host.ob.enablePublishing();
  assert.ok(repos.has(HOST));
  await host.ob.unpublish();
  assert.ok(!repos.has(HOST));
  host.ob.markDirty();
  await host.ob.flush();
  assert.ok(!repos.has(HOST));
});
