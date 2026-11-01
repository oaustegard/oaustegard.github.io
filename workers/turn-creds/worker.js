/**
 * turn-creds — hands browsers short-lived ICE servers for WebRTC pages on
 * austegard.com (bsky/pad.html first).
 *
 * Why: STUN alone only connects peers whose NATs allow hole-punching. Phones
 * on carrier CGNAT and many office networks don't, so the pad's data channel
 * never opens and the guest sees an empty document. A TURN relay fixes that.
 * The relay forwards DTLS-encrypted bytes it cannot read; browsers still
 * prefer a direct path and use the relay only when direct fails.
 *
 * Credentials come from Cloudflare Realtime TURN. Set two secrets:
 *   TURN_KEY_ID         the TURN key's ID   (dash: Realtime > TURN Server)
 *   TURN_KEY_API_TOKEN  that key's API token
 * Without them the worker answers with STUN only, so pages keep working.
 *
 * Deployed as turn-creds.austegard.workers.dev. The Origin allowlist stops
 * other sites' browsers from minting credentials on this account; it does
 * not stop a non-browser client that forges the header.
 */

const ALLOWED_ORIGINS = [
  /^https:\/\/austegard\.com$/,
  /^https:\/\/([a-z0-9-]+\.)?austegard\.pages\.dev$/,
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
];

const STUN_ONLY = [{ urls: ['stun:stun.cloudflare.com:3478', 'stun:stun.l.google.com:19302'] }];
const TTL_S = 6 * 3600;

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const allowed = ALLOWED_ORIGINS.some((re) => re.test(origin));
    const cors = allowed ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {};

    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: allowed ? 204 : 403,
        headers: { ...cors, 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Max-Age': '86400' },
      });
    }
    if (!allowed) return new Response('origin not allowed', { status: 403 });

    let iceServers = STUN_ONLY;
    let relay = false;
    let error = null;
    if (env.TURN_KEY_ID && env.TURN_KEY_API_TOKEN) {
      try {
        const r = await fetch(
          `https://rtc.live.cloudflare.com/v1/turn/keys/${env.TURN_KEY_ID}/credentials/generate-ice-servers`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${env.TURN_KEY_API_TOKEN}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ ttl: TTL_S }),
          },
        );
        if (r.ok) {
          const j = await r.json();
          /* Cloudflare also lists port-53 URLs; browsers block port 53 and
             Cloudflare's own docs say to drop them for browser clients. */
          iceServers = (j.iceServers || []).map((s) => ({
            ...s,
            urls: [].concat(s.urls).filter((u) => !/:53(\?|$)/.test(u)),
          })).filter((s) => s.urls.length);
          relay = iceServers.some((s) => s.urls.some((u) => /^turns?:/.test(u)));
        } else {
          error = `turn api ${r.status}`;
        }
      } catch (e) {
        error = `turn api ${e.message}`;
      }
    } else {
      error = 'TURN secrets not set';
    }

    return Response.json(
      { iceServers, relay, ttl: relay ? TTL_S : null, error },
      { headers: { ...cors, 'Cache-Control': 'no-store' } },
    );
  },
};
