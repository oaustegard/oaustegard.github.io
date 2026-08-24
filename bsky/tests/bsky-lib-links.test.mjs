// Contract tests for the link-resolution helpers in bsky/bsky-lib.js: short-link
// recognition, starter pack URL parsing, and short-link expansion against a
// stubbed fetch. The API helpers below them need a BskyAgent loaded from esm.sh
// and are not exercised here.
// Run: node --test bsky/tests/bsky-lib-links.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getShortLinkCode, parseStarterPackUrl, resolveSkyLink } from '../bsky-lib.js';

const CODE = 'L71zwey';
const DID = 'did:plc:dzvxvsiy3maw4iarpvizsj67';
const RKEY = '3mcvfx27t7u2e';
const EXPANDED = `https://bsky.app/start/${DID}/${RKEY}`;

/* Stand in for go.bsky.app. Returns whatever the case under test needs and
   records the request so the Accept header can be asserted. */
function stubFetch(handler) {
    const calls = [];
    const original = globalThis.fetch;
    globalThis.fetch = async (url, init) => {
        calls.push({ url, init });
        return handler(url, init);
    };
    return { calls, restore: () => { globalThis.fetch = original; } };
}

const jsonResponse = (body, status = 200) => ({
    type: 'cors',
    ok: status >= 200 && status < 300,
    status,
    json: async () => body
});

/* What a cross-origin 3xx looks like under redirect:'manual' */
const opaqueRedirect = () => ({ type: 'opaqueredirect', ok: false, status: 0 });

test('getShortLinkCode recognizes both short-link hosts', () => {
    assert.equal(getShortLinkCode(`https://bsky.app/starter-pack-short/${CODE}`), CODE);
    assert.equal(getShortLinkCode(`https://go.bsky.app/${CODE}`), CODE);
    assert.equal(getShortLinkCode(`bsky.app/starter-pack-short/${CODE}`), CODE);
    assert.equal(getShortLinkCode(`https://bsky.app/starter-pack-short/${CODE}/`), CODE);
    assert.equal(getShortLinkCode(`https://bsky.app/starter-pack-short/${CODE}?utm=x`), CODE);
    assert.equal(getShortLinkCode(`  https://go.bsky.app/${CODE}  `), CODE);
    /* Any <kind>-short path, not just starter packs */
    assert.equal(getShortLinkCode('https://bsky.app/post-short/abc123'), 'abc123');
    /* Codes are not restricted to [A-Za-z0-9] */
    assert.equal(getShortLinkCode('https://go.bsky.app/a-b_c'), 'a-b_c');
});

test('getShortLinkCode rejects non-short links', () => {
    assert.equal(getShortLinkCode('https://bsky.app/starter-pack/user.bsky.social/3l6stg6xfrc23'), null);
    assert.equal(getShortLinkCode('https://go.bsky.app/'), null);
    assert.equal(getShortLinkCode('https://bsky.app/profile/foo.com'), null);
    assert.equal(getShortLinkCode(''), null);
    assert.equal(getShortLinkCode(null), null);
});

test('parseStarterPackUrl accepts every starter pack shape in the wild', () => {
    const want = `at://${DID}/app.bsky.graph.starterpack/${RKEY}`;
    assert.equal(parseStarterPackUrl(EXPANDED).uri, want);
    assert.equal(parseStarterPackUrl(`https://bsky.app/starter-pack/${DID}/${RKEY}`).uri, want);
    assert.equal(parseStarterPackUrl(`https://bsky.app/profile/${DID}/starter-pack/${RKEY}`).uri, want);
    assert.equal(parseStarterPackUrl(want).uri, want);
    /* Handle authorities are kept as-is; the appview resolves them */
    const byHandle = parseStarterPackUrl(`https://bsky.app/starter-pack/dollspace.gay/${RKEY}`);
    assert.equal(byHandle.actor, 'dollspace.gay');
    assert.equal(byHandle.rkey, RKEY);
    /* Query strings do not leak into the rkey */
    assert.equal(parseStarterPackUrl(`https://bsky.app/starter-pack/dollspace.gay/${RKEY}?x=1`).rkey, RKEY);
});

test('parseStarterPackUrl returns null for everything else', () => {
    assert.equal(parseStarterPackUrl(`https://bsky.app/profile/dollspace.gay/lists/${RKEY}`), null);
    assert.equal(parseStarterPackUrl('https://bsky.app/profile/dollspace.gay'), null);
    assert.equal(parseStarterPackUrl(`at://${DID}/app.bsky.graph.list/${RKEY}`), null);
    assert.equal(parseStarterPackUrl('hello world'), null);
    assert.equal(parseStarterPackUrl(null), null);
});

test('resolveSkyLink asks go.bsky.app for JSON rather than following the redirect', async () => {
    const stub = stubFetch(() => jsonResponse({ url: EXPANDED }));
    try {
        assert.equal(await resolveSkyLink(`https://bsky.app/starter-pack-short/${CODE}`), EXPANDED);
        assert.equal(stub.calls.length, 1);
        assert.equal(stub.calls[0].url, `https://go.bsky.app/${CODE}`);
        assert.equal(stub.calls[0].init.headers.Accept, 'application/json');
        /* go.bsky.app sends no Vary, so a 301 cached from a plain visit would
           otherwise be replayed here and followed into bsky.app's CORS wall */
        assert.equal(stub.calls[0].init.cache, 'no-store');
        assert.equal(stub.calls[0].init.redirect, 'manual');
    } finally { stub.restore(); }
});

test('resolveSkyLink retries under a fresh cache key when a stale redirect is served', async () => {
    let n = 0;
    const stub = stubFetch(() => (++n === 1 ? opaqueRedirect() : jsonResponse({ url: `${EXPANDED}?_cb=123` })));
    try {
        /* The cache-buster comes back attached, because go.bsky.app copies the
           query string onto the target. It must not survive into the result. */
        assert.equal(await resolveSkyLink(`https://go.bsky.app/${CODE}`), EXPANDED);
        assert.equal(stub.calls.length, 2);
        assert.equal(stub.calls[0].url, `https://go.bsky.app/${CODE}`);
        assert.match(stub.calls[1].url, new RegExp(`^https://go\\.bsky\\.app/${CODE}\\?_cb=\\d+$`));
    } finally { stub.restore(); }
});

test('resolveSkyLink reports a redirect that survives the retry', async () => {
    const stub = stubFetch(() => opaqueRedirect());
    try {
        await assert.rejects(
            () => resolveSkyLink(`https://go.bsky.app/${CODE}`),
            /redirected instead of expanding/
        );
        assert.equal(stub.calls.length, 2);
    } finally { stub.restore(); }
});

test('resolveSkyLink leaves non-short input alone without a request', async () => {
    const stub = stubFetch(() => { throw new Error('should not fetch'); });
    try {
        const long = `https://bsky.app/starter-pack/dollspace.gay/${RKEY}`;
        assert.equal(await resolveSkyLink(long), long);
        assert.equal(await resolveSkyLink('cats'), 'cats');
        assert.equal(await resolveSkyLink(''), '');
        assert.equal(stub.calls.length, 0);
    } finally { stub.restore(); }
});

/* A failed expansion must not degrade to the input URL. Returning it would be
   indistinguishable from "never a short link", and resolveStarterPackUri would
   then blame the user's URL for a network or lookup failure. */
test('resolveSkyLink throws rather than returning the input when expansion fails', async () => {
    const cases = [
        [() => { throw new TypeError('Failed to fetch'); }, /Could not reach go\.bsky\.app/],
        [() => jsonResponse({}, 404),                       /does not know short link/],
        [() => jsonResponse({}, 500),                       /returned 500/],
        [() => jsonResponse({}),                            /gave no target/],
        [() => ({ ok: true, status: 200, json: async () => { throw new Error('bad json'); } }), /gave no target/]
    ];
    for (const [handler, want] of cases) {
        const stub = stubFetch(handler);
        try {
            await assert.rejects(
                () => resolveSkyLink(`https://go.bsky.app/${CODE}`),
                want
            );
        } finally { stub.restore(); }
    }
});
