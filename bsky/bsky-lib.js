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
export async function resolveSkyLink(url) {
    if (!url) return url;

    // Check if it's a go.bsky.app link
    if (url.includes('go.bsky.app/')) {
        try {
            const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
            return response.url;
        } catch (err) {
            console.warn('Failed to resolve go.bsky.app link:', err);
            return url;
        }
    }

    return url;
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
