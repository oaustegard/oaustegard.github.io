// Byte-level BPE for Pleias Monad's 8,192-token tokenizer, read straight from tokenizer.json.
// tokenizer.json lists a Split step before ByteLevel, but its pattern is given as {"String": ...},
// which the tokenizers library matches as a literal string, not a regex; it never occurs, so the
// step does nothing. What remains is ByteLevel with use_regex=true: the GPT-2 split, bytes mapped
// to characters, then plain BPE over merge ranks. No normalizer, no post-processor: encode() adds
// no special tokens, and Monad's chat markers (<|im_start|>, <|im_end|>, <think>) are ordinary text.
const GPT2 = /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;

function bytesToUnicode() {
  const bs = [];
  for (let i = 33; i <= 126; i++) bs.push(i);
  for (let i = 161; i <= 172; i++) bs.push(i);
  for (let i = 174; i <= 255; i++) bs.push(i);
  const cs = bs.slice();
  let n = 0;
  for (let b = 0; b < 256; b++) if (!bs.includes(b)) { bs.push(b); cs.push(256 + n); n++; }
  const b2u = new Array(256), u2b = new Map();
  bs.forEach((b, i) => { b2u[b] = String.fromCodePoint(cs[i]); u2b.set(String.fromCodePoint(cs[i]), b); });
  return { b2u, u2b };
}
const { b2u: B2U, u2b: U2B } = bytesToUnicode();
const ENC = new TextEncoder();

export class MonadTokenizer {
  constructor(spec) {
    const m = spec.model;
    this.vocab = m.vocab;
    this.size = Math.max(...Object.values(m.vocab)) + 1;
    this.pieces = new Array(this.size);
    for (const [t, i] of Object.entries(m.vocab)) this.pieces[i] = t;
    this.ranks = new Map();
    m.merges.forEach((x, i) => {
      const [a, b] = Array.isArray(x) ? x : x.split(' ');
      this.ranks.set(a + ' ' + b, i);
    });
    this.special = new Set((spec.added_tokens || []).filter((a) => a.special).map((a) => a.id));
    // bytes of each token, for streaming decode
    this.bytes = this.pieces.map((p, i) => (this.special.has(i) || p === undefined)
      ? new Uint8Array(0) : Uint8Array.from(Array.from(p), (ch) => U2B.get(ch)));
    this.cache = new Map();
  }

  bpe(word) {
    const hit = this.cache.get(word);
    if (hit) return hit;
    let w = Array.from(word);
    while (w.length > 1) {
      let best = -1, rank = Infinity;
      for (let i = 0; i < w.length - 1; i++) {
        const r = this.ranks.get(w[i] + ' ' + w[i + 1]);
        if (r !== undefined && r < rank) { rank = r; best = i; }
      }
      if (best < 0) break;
      w = w.slice(0, best).concat([w[best] + w[best + 1]], w.slice(best + 2));
    }
    this.cache.set(word, w);
    return w;
  }

  encode(text) {
    const ids = [];
    for (const b of text.matchAll(GPT2)) {
      let s = '';
      for (const x of ENC.encode(b[0])) s += B2U[x];
      for (const sub of this.bpe(s)) {
        const id = this.vocab[sub];
        if (id === undefined) throw new Error('no vocab entry for ' + JSON.stringify(sub));
        ids.push(id);
      }
    }
    return ids;
  }

  decode(ids) {
    const parts = ids.map((i) => this.bytes[i]);
    const out = new Uint8Array(parts.reduce((s, p) => s + p.length, 0));
    let o = 0;
    for (const p of parts) { out.set(p, o); o += p.length; }
    return new TextDecoder('utf-8').decode(out);
  }

  // Incremental decoder: push(id) returns the newly completed text, holding back bytes of an
  // unfinished UTF-8 character until the next token completes it.
  stream() {
    const dec = new TextDecoder('utf-8');
    return { push: (id) => dec.decode(this.bytes[id], { stream: true }), flush: () => dec.decode() };
  }
}

export async function loadTokenizer(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`tokenizer: HTTP ${r.status}`);
  return new MonadTokenizer(await r.json());
}
