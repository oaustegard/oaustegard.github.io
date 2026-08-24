/* bsky-lib.js - Shared library for Bluesky API interactions */

let BskyAgent;
let publicAgent = null;
let authAgent = null;

/* Initialize the library and load dependencies */
export async function initializeLib() {
    if (BskyAgent) return true;

    try {
        const api = await import('https://esm.sh/@atproto/api@0.18.3');
        BskyAgent = api.BskyAgent;

        /* Initialize the public agent */
        publicAgent = new BskyAgent({
            service: 'https://public.api.bsky.app'
        });

        return true;
    } catch (err) {
        console.error('Failed to initialize Bsky Lib:', err);
        return false;
    }
}

/* Authentication */
export async function login(handle, password) {
    if (!BskyAgent) await initializeLib();

    const agent = new BskyAgent({
        service: 'https://bsky.social'
    });

    try {
        const result = await agent.login({
            identifier: handle,
            password: password
        });

        if (!result.success) {
            throw new Error('Login failed');
        }

        authAgent = agent;

        const sessionData = {
            did: result.data.did,
            handle: result.data.handle,
            accessJwt: result.data.accessJwt,
            refreshJwt: result.data.refreshJwt
        };

        saveSession(sessionData);
        return result.data;
    } catch (err) {
        console.error('Login error:', err);
        throw err;
    }
}

export function logout() {
    authAgent = null;
    localStorage.removeItem('bsky_session');
}

export async function checkStoredSession() {
    if (!BskyAgent) await initializeLib();

    try {
        const storedSession = localStorage.getItem('bsky_session');
        if (storedSession) {
            const sessionData = JSON.parse(storedSession);

            const agent = new BskyAgent({
                service: 'https://bsky.social'
            });

            await agent.resumeSession(sessionData);
            authAgent = agent;
            return sessionData;
        }
    } catch (err) {
        console.error('Failed to resume session:', err);
        localStorage.removeItem('bsky_session');
    }
    return null;
}

function saveSession(sessionData) {
    try {
        localStorage.setItem('bsky_session', JSON.stringify(sessionData));
    } catch (err) {
        console.error('Failed to store session:', err);
    }
}

/* Getters for agents */
export function getAgent() {
    return authAgent || publicAgent;
}

export function getAuthAgent() {
    return authAgent;
}

export function getPublicAgent() {
    return publicAgent;
}

/* Link Resolution */

/*
 * Bluesky short links: go.bsky.app/<code> and bsky.app/<kind>-short/<code>
 * (e.g. starter-pack-short). Both are served by go.bsky.app.
 *
 * Following the redirect from the browser does not work. go.bsky.app answers
 * with a 301 to bsky.app, and bsky.app only sends Access-Control-Allow-Origin
 * for Origin https://bsky.app, so the cross-origin fetch fails on the second
 * hop and response.url is never readable. go.bsky.app does answer
 * `Accept: application/json` with {"url": "<expanded>"} and
 * Access-Control-Allow-Origin: *, which is what this uses instead.
 */
const SHORT_LINK_RE =
    /^(?:https?:\/\/)?(?:go\.bsky\.app\/|bsky\.app\/(?:[a-z]+-)*short\/)([A-Za-z0-9_-]+)\/?(?:[?#].*)?$/i;

export function getShortLinkCode(url) {
    const match = String(url || '').trim().match(SHORT_LINK_RE);
    return match ? match[1] : null;
}

/*
 * Returns the expanded URL. A URL that is not a short link is returned
 * unchanged; a short link that cannot be expanded throws.
 *
 * Those two cases must not share a return value. Returning the input on a
 * failed expansion is indistinguishable from "this was never a short link",
 * and callers act on the difference: resolveStarterPackUri would go on to
 * report "Not a recognized starter pack link" for a link it recognized fine
 * but could not expand, sending the user to check their URL instead of
 * retrying.
 *
 * The cache handling is not optional. go.bsky.app content-negotiates on
 * Accept -- text/html gets a 301 to bsky.app, application/json gets the target
 * as JSON -- but sends no Vary header, with cache-control: max-age=604800. The
 * browser's HTTP cache therefore keys on the URL alone, so a 301 cached from
 * an earlier plain visit to the same short link (clicking it, or any page that
 * fetched it with redirect:'follow') is replayed for this JSON request for a
 * week. With the default redirect:'follow' that stale 301 is followed to
 * bsky.app, which sends CORS headers only for its own origin, and the fetch
 * rejects with a bare TypeError that reads as a network outage.
 *
 * So: cache:'no-store' to bypass the cache, redirect:'manual' so a redirect
 * that arrives anyway becomes a readable opaqueredirect rather than a walk
 * into the CORS wall, and one retry under a different cache key for browsers
 * that serve the cached entry regardless.
 */
function shortLinkRequest(code, cacheBuster) {
    const url = `https://go.bsky.app/${code}` + (cacheBuster ? `?_cb=${cacheBuster}` : '');
    return fetch(url, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        redirect: 'manual'
    });
}

const isRedirect = (response) =>
    response.type === 'opaqueredirect' || (response.status >= 300 && response.status < 400);

export async function resolveSkyLink(url) {
    if (!url) return url;

    const code = getShortLinkCode(url);
    if (!code) return url;

    let response;
    try {
        response = await shortLinkRequest(code);
        if (isRedirect(response)) {
            /* Stale cached 301. Re-ask under a cache key nothing can have poisoned. */
            response = await shortLinkRequest(code, Date.now());
        }
    } catch (err) {
        console.warn('Failed to reach go.bsky.app:', err);
        throw new Error(`Could not reach go.bsky.app to expand short link ${code}. Check your connection and try again.`);
    }

    if (isRedirect(response)) {
        throw new Error(`go.bsky.app redirected instead of expanding short link ${code}. Reload the page to clear a stale cached redirect.`);
    }
    if (response.status === 404) {
        throw new Error(`Bluesky does not know short link ${code}. Check that the link is correct and has not expired.`);
    }
    if (!response.ok) {
        throw new Error(`go.bsky.app returned ${response.status} expanding short link ${code}.`);
    }

    let expanded;
    try {
        expanded = (await response.json()).url;
    } catch (err) {
        console.warn('go.bsky.app returned unparseable JSON:', err);
        expanded = null;
    }
    if (!expanded) {
        throw new Error(`go.bsky.app gave no target for short link ${code}.`);
    }
    /* go.bsky.app copies the query string onto the target, so the cache-buster
       comes back attached. Downstream parsers stop at '?', but leaving it on
       would put it in error messages and anything built from the URL. The
       request is built from the code alone, so ?_cb=<n> is the whole query and
       the anchored match cannot eat a real parameter. */
    return expanded.replace(/\?_cb=\d+$/, '');
}

/*
 * Pull {actor, rkey} out of any starter pack reference. Accepts the three
 * bsky.app URL shapes plus a raw AT-URI. Returns null for anything else.
 * The actor may be a handle; the appview resolves handle authorities in
 * AT-URIs, so no separate resolveHandle round trip is needed.
 */
const STARTER_PACK_RES = [
    /^at:\/\/([^/]+)\/app\.bsky\.graph\.starterpack\/([^/?#]+)/i,
    /bsky\.app\/start\/([^/?#]+)\/([^/?#]+)/i,
    /bsky\.app\/starter-pack\/([^/?#]+)\/([^/?#]+)/i,
    /bsky\.app\/profile\/([^/?#]+)\/starter-pack\/([^/?#]+)/i
];

export function parseStarterPackUrl(url) {
    const value = String(url || '').trim();
    for (const re of STARTER_PACK_RES) {
        const match = value.match(re);
        if (match) {
            const actor = decodeURIComponent(match[1]);
            const rkey = match[2];
            return { actor, rkey, uri: `at://${actor}/app.bsky.graph.starterpack/${rkey}` };
        }
    }
    return null;
}

/* Expand a short link if needed, then return the starter pack's AT-URI. */
export async function resolveStarterPackUri(url) {
    const expanded = await resolveSkyLink(url);
    const parsed = parseStarterPackUrl(expanded);
    if (!parsed) {
        throw new Error(
            'Not a recognized starter pack link. Expected something like ' +
            'https://bsky.app/starter-pack/handle/rkey or https://bsky.app/starter-pack-short/CODE'
        );
    }
    return parsed.uri;
}

/* Common API Helpers */
export async function getProfile(actor) {
    const agent = getAgent();
    if (!agent) throw new Error('Agent not initialized');
    return agent.getProfile({ actor });
}

export async function getLists(actor) {
    const agent = getAgent();
    if (!agent) throw new Error('Agent not initialized');
    return agent.app.bsky.graph.getLists({ actor, limit: 100 });
}

export async function getListMembers(listUri) {
    const agent = getAgent();
    if (!agent) throw new Error('Agent not initialized');

    let members = [];
    let cursor = null;

    do {
        const params = { list: listUri, limit: 100 };
        if (cursor) params.cursor = cursor;

        const response = await agent.app.bsky.graph.getList(params);
        members = members.concat(response.data.items);
        cursor = response.data.cursor;
    } while (cursor);

    return members;
}

export async function createList(name) {
    const agent = getAuthAgent();
    if (!agent) throw new Error('Authentication required');

    return agent.com.atproto.repo.createRecord({
        collection: 'app.bsky.graph.list',
        repo: agent.session.did,
        record: {
            name,
            purpose: 'app.bsky.graph.defs#curatelist',
            createdAt: new Date().toISOString(),
            '$type': 'app.bsky.graph.list'
        }
    });
}

export async function addMemberToList(listUri, memberDid) {
    const agent = getAuthAgent();
    if (!agent) throw new Error('Authentication required');

    return agent.com.atproto.repo.createRecord({
        collection: 'app.bsky.graph.listitem',
        repo: agent.session.did,
        record: {
            subject: memberDid,
            list: listUri,
            createdAt: new Date().toISOString(),
            '$type': 'app.bsky.graph.listitem'
        }
    });
}

export async function getStarterPack(uri) {
    const agent = getAgent();
    if (!agent) throw new Error('Agent not initialized');

    const response = await agent.app.bsky.graph.getStarterPack({ starterPack: uri });
    return response.data.starterPack;
}

export async function getActorStarterPacks(actor) {
    const agent = getAgent();
    if (!agent) throw new Error('Agent not initialized');

    const response = await agent.app.bsky.graph.getActorStarterPacks({ actor });
    return response.data.starterPacks;
}
