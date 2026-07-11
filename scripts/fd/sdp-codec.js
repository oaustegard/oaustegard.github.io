/* ============================================================
   scripts/fd/sdp-codec.js

   Pure SDP <-> compact-code functions, extracted verbatim from
   fd.html's inline module. No DOM, no WebRTC objects - just byte
   plumbing over SDP strings, plus the outer JSON<->code codec used
   for both invite and reply payloads.

   See scripts/fd/PROTOCOL.md ("Layering") for the module boundary.
   ============================================================ */

/* ---------- blob codec: JSON -> deflate-raw -> base64url ----------
   Prefix char declares the encoding so the two sides need not match
   browser capabilities: '1' = deflated, '0' = plain UTF-8.          */

export function bytesToB64url(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function b64urlToBytes(s) {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - b64.length % 4) % 4));
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function pipeThrough(bytes, stream) {
  const blob = new Blob([bytes]);
  const piped = blob.stream().pipeThrough(stream);
  return new Uint8Array(await new Response(piped).arrayBuffer());
}

/* ---------- format 2: binary SDP packing ----------
   A data-channel-only SDP is ~95% boilerplate both browsers regenerate
   identically. Only the connectivity-relevant fields are packed:

     flags (role + setup) | ufrag | pwd | mid | fingerprint (32 raw
     bytes) | candidates (type/kind, port, address)

   and the receiver splices them into a canonical template before
   setRemoteDescription. TCP candidates are dropped and duplicates
   pruned. Anything unexpected (non-sha-256 fingerprint, missing field,
   exotic candidate) makes packSdp return null and encodeBlob falls back
   to format 1 (deflate of the raw SDP), so the worst case is a longer
   code, never a broken one.

   Candidate flag byte: bits 0-1 type (0 host, 1 srflx, 2 relay),
   bits 2-3 addr kind (0 IPv4, 1 IPv6, 2 hostname, 3 UUID mDNS .local packed as 16 bytes). */

export const SETUP_VALS = ['actpass', 'active', 'passive'];
export const CAND_TYPES = ['host', 'srflx', 'relay'];
export const CAND_PRIO  = [2122260223, 1686052607, 41885695];
export const MAX_CANDS  = 15;

export function parseIPv4(s) {
  const p = s.split('.');
  if (p.length !== 4) return null;
  const out = new Uint8Array(4);
  for (let i = 0; i < 4; i++) {
    const n = Number(p[i]);
    if (!Number.isInteger(n) || n < 0 || n > 255) return null;
    out[i] = n;
  }
  return out;
}

export function parseIPv6(s) {
  /* expand :: and an optional trailing dotted-quad into 16 bytes */
  let head = s, v4 = null;
  if (s.includes('.')) {
    const cut = s.lastIndexOf(':');
    v4 = parseIPv4(s.slice(cut + 1));
    if (!v4) return null;
    head = s.slice(0, cut) + ':0:0'; /* placeholder, replaced below */
  }
  const dbl = head.split('::');
  if (dbl.length > 2) return null;
  const left = dbl[0] ? dbl[0].split(':') : [];
  const right = dbl.length === 2 && dbl[1] ? dbl[1].split(':') : [];
  const fill = 8 - left.length - right.length;
  if (dbl.length === 2 && fill < 0) return null;
  if (dbl.length === 1 && left.length !== 8) return null;
  const groups = dbl.length === 2
    ? left.concat(Array(fill).fill('0'), right)
    : left;
  const out = new Uint8Array(16);
  for (let i = 0; i < 8; i++) {
    const n = parseInt(groups[i], 16);
    if (!Number.isFinite(n) || n < 0 || n > 0xFFFF) return null;
    out[i * 2] = n >> 8;
    out[i * 2 + 1] = n & 0xFF;
  }
  if (v4) out.set(v4, 12);
  return out;
}

export function formatIPv6(b) {
  const g = [];
  for (let i = 0; i < 16; i += 2) g.push(((b[i] << 8) | b[i + 1]).toString(16));
  return g.join(':');
}

let packFailReason = null;   /* why the last packSdp bailed - surfaced in the UI */

export function packSdp(t, sdp) {
  packFailReason = null;
  const fail = (why) => { packFailReason = why; return null; };
  try {
    const get = (re) => { const m = sdp.match(re); return m ? m[1] : null; };
    const ufrag = get(/a=ice-ufrag:([\x21-\x7E]+)/);
    const pwd   = get(/a=ice-pwd:([\x21-\x7E]+)/);
    const mid   = get(/a=mid:([\x21-\x7E]+)/);
    const setup = get(/a=setup:(\w+)/);
    const fpHex = get(/a=fingerprint:sha-256 ([0-9A-Fa-f:]{95})/);
    const setupIdx = SETUP_VALS.indexOf(setup);
    if (!ufrag || !pwd || !mid || !fpHex || setupIdx === -1) {
      return fail('missing field: ' + [!ufrag && 'ufrag', !pwd && 'pwd', !mid && 'mid',
        !fpHex && 'sha-256 fingerprint', setupIdx === -1 && 'setup'].filter(Boolean).join(','));
    }
    if (ufrag.length > 255 || pwd.length > 255 || mid.length > 255) return fail('field too long');
    if (!/m=application \d+ UDP\/DTLS\/SCTP webrtc-datachannel/.test(sdp)) return fail('unexpected m= line');

    const fp = new Uint8Array(32);
    fpHex.split(':').forEach((h, i) => { fp[i] = parseInt(h, 16); });

    /* udp candidates only, component 1, known types, deduped */
    const cands = [];
    const seen = new Set();
    const re = /a=candidate:\S+ (\d+) (udp|UDP) \d+ ([\x21-\x7E]+) (\d+) typ (\w+)/g;
    let m;
    while ((m = re.exec(sdp)) !== null) {
      if (m[1] !== '1') continue;
      const type = CAND_TYPES.indexOf(m[5]);
      if (type === -1) continue;
      const addr = m[3], port = Number(m[4]);
      if (!Number.isInteger(port) || port < 0 || port > 65535) continue;
      const key = addr + ':' + port;
      if (seen.has(key)) continue;
      seen.add(key);
      let kind, bytes;
      const v4 = parseIPv4(addr);
      if (v4) { kind = 0; bytes = v4; }
      else {
        const v6 = parseIPv6(addr);
        if (v6) { kind = 1; bytes = v6; }
        else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.local$/i.test(addr)) {
          /* mDNS obfuscated host (UUID.local) - the dominant candidate type in
             modern browsers and 40%+ of a naive payload. Pack the UUID as 16
             raw bytes instead of a 42-char string. */
          kind = 3;
          bytes = new Uint8Array(16);
          const hex = addr.slice(0, 36).replace(/-/g, '');
          for (let i = 0; i < 16; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        }
        else {
          if (addr.length > 255) continue;
          kind = 2;
          const nm = new TextEncoder().encode(addr);
          bytes = new Uint8Array(1 + nm.length);
          bytes[0] = nm.length;
          bytes.set(nm, 1);
        }
      }
      cands.push({ type, kind, port, bytes });
    }
    if (!cands.length) return fail('no usable UDP candidates (gathering incomplete?)');
    if (cands.length > MAX_CANDS) return fail(cands.length + ' candidates > ' + MAX_CANDS);
    cands.sort((a, b) => a.type - b.type);

    const enc = new TextEncoder();
    const uf = enc.encode(ufrag), pw = enc.encode(pwd), md = enc.encode(mid);
    const parts = [];
    parts.push(Uint8Array.of((t === 'a' ? 1 : 0) | (setupIdx << 1)));
    parts.push(Uint8Array.of(uf.length), uf);
    parts.push(Uint8Array.of(pw.length), pw);
    parts.push(Uint8Array.of(md.length), md);
    parts.push(fp);
    parts.push(Uint8Array.of(cands.length));
    for (const c of cands) {
      parts.push(Uint8Array.of(c.type | (c.kind << 2), c.port >> 8, c.port & 0xFF), c.bytes);
    }
    let total = 0;
    for (const p of parts) total += p.length;
    const out = new Uint8Array(total);
    let off = 0;
    for (const p of parts) { out.set(p, off); off += p.length; }
    return out;
  } catch (e) {
    console.log('[codec] packSdp failed, will fall back:', e.message);
    return fail('exception: ' + e.message);
  }
}

export function unpackSdp(b) {
  let off = 0;
  const need = (n) => { if (off + n > b.length) throw new Error('truncated code'); };
  const dec = new TextDecoder();
  const readStr = () => {
    need(1); const len = b[off++];
    need(len); const s = dec.decode(b.subarray(off, off + len)); off += len;
    return s;
  };
  need(1);
  const flags = b[off++];
  const t = (flags & 1) ? 'a' : 'o';
  const setup = SETUP_VALS[(flags >> 1) & 3];
  if (!setup) throw new Error('bad setup flag');
  const ufrag = readStr(), pwd = readStr(), mid = readStr();
  need(32);
  const fpHex = [...b.subarray(off, off + 32)]
    .map((x) => x.toString(16).padStart(2, '0').toUpperCase()).join(':');
  off += 32;
  need(1);
  const n = b[off++];
  if (n < 1 || n > MAX_CANDS) throw new Error('bad candidate count');
  const candLines = [];
  for (let i = 0; i < n; i++) {
    need(3);
    const flag = b[off++];
    const port = (b[off++] << 8) | b[off++];
    const type = CAND_TYPES[flag & 3];
    const kind = (flag >> 2) & 3;
    if (!type) throw new Error('bad candidate type');
    let addr;
    if (kind === 0) { need(4); addr = b.subarray(off, off + 4).join('.'); off += 4; }
    else if (kind === 1) { need(16); addr = formatIPv6(b.subarray(off, off + 16)); off += 16; }
    else if (kind === 2) { addr = readStr(); }
    else if (kind === 3) {
      need(16);
      const hx = [...b.subarray(off, off + 16)].map((x) => x.toString(16).padStart(2, '0')).join('');
      addr = hx.slice(0,8)+'-'+hx.slice(8,12)+'-'+hx.slice(12,16)+'-'+hx.slice(16,20)+'-'+hx.slice(20)+'.local';
      off += 16;
    }
    else throw new Error('bad address kind');
    const prio = CAND_PRIO[flag & 3] - i;
    const rel = type === 'host' ? '' : ' raddr 0.0.0.0 rport 0';
    candLines.push('a=candidate:' + (i + 1) + ' 1 udp ' + prio + ' ' + addr + ' ' + port + ' typ ' + type + rel);
  }
  const sdp = [
    'v=0',
    'o=- 4611731400430051336 2 IN IP4 127.0.0.1',
    's=-',
    't=0 0',
    'a=group:BUNDLE ' + mid,
    'a=extmap-allow-mixed',
    'a=msid-semantic: WMS',
    'm=application 9 UDP/DTLS/SCTP webrtc-datachannel',
    'c=IN IP4 0.0.0.0'
  ].concat(candLines, [
    'a=ice-ufrag:' + ufrag,
    'a=ice-pwd:' + pwd,
    'a=ice-options:trickle',
    'a=fingerprint:sha-256 ' + fpHex,
    'a=setup:' + setup,
    'a=mid:' + mid,
    'a=sctp-port:5000',
    'a=max-message-size:262144'
  ]).join('\r\n') + '\r\n';
  return { t: t, sdp: sdp };
}

export async function encodeBlob(obj) {
  const packed = packSdp(obj.t, obj.sdp);
  if (packed) {
    console.log('[codec] pack', obj.sdp.length, '->', packed.length, 'bytes');
    return '2' + bytesToB64url(packed);
  }
  const raw = new TextEncoder().encode(JSON.stringify(obj));
  if (typeof CompressionStream === 'function') {
    try {
      const deflated = await pipeThrough(raw, new CompressionStream('deflate-raw'));
      console.log('[codec] deflate', raw.length, '->', deflated.length, 'bytes');
      return '1' + bytesToB64url(deflated);
    } catch (e) {
      console.log('[codec] compression failed, falling back to plain:', e.message);
    }
  }
  return '0' + bytesToB64url(raw);
}

/* human-readable line about which wire format the code took and why */
export function describeCode(code, link) {
  const f = code[0];
  const base = link.length + ' chars, format ' + f;
  if (f === '2') return base + ' (packed SDP - compact)';
  const why = packFailReason ? ' - packing skipped: ' + packFailReason : '';
  if (f === '1') return base + ' (deflated fallback' + why + ')';
  return base + ' (plain fallback' + why + ')';
}

export async function decodeBlob(code) {
  const mode = code[0];
  const bytes = b64urlToBytes(code.slice(1).trim());
  if (mode === '2') return unpackSdp(bytes);
  let raw;
  if (mode === '1') {
    raw = await pipeThrough(bytes, new DecompressionStream('deflate-raw'));
  } else if (mode === '0') {
    raw = bytes;
  } else {
    throw new Error('unrecognized code format');
  }
  return JSON.parse(new TextDecoder().decode(raw));
}
