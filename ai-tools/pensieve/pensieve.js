// pensieve.js — client-side search over two ATProto repos.
//
// Everything runs in the browser: the .kbi and a metadata sidecar are fetched
// once, and the query embedding is computed locally by a 23.9 MB int8 ONNX
// encoder. No server, no API key, nothing about the query leaves the page.
//
// Loading is progressive. The .kbi carries BM25 postings, so lexical search
// answers as soon as the index lands; the dense arm joins when the encoder
// finishes and the mode flips to hybrid. The dense arm is what reaches a post
// you remember by its subject when you cannot remember a word of its wording.
//
// Display comes from meta.json, not from chunk text. The packer's chunk
// normalizer splits on sentence boundaries and inserts a space after every
// period, which turns a URL in a post into "muninn. austegard. com". The
// sidecar carries the record's own fields untouched, and the join key is the
// chunk id, which is available from the index without fetching a shard — so
// this page never issues a Range request at all.

// Cache coherence: the page imports this file as `pensieve.js?v=N` and the
// version rides through to this module's own imports, so the three files can
// never be served as a mismatched set. See the same note in nlsh.js.
const V = new URL(import.meta.url).search;
const { KBReader, defaultOverFetch } = await import("./kb-reader.js" + V);
const { WordPieceTokenizer } = await import("./wordpiece.js" + V);

const QUERY_PREFIX = "Represent this sentence for searching relevant passages: ";

/** NSID -> the app a reader would recognise it as. */
const APPS = [
  [/^app\.bsky\./, "Bluesky"],
  [/^com\.whtwnd\.blog/, "WhiteWind"],
  [/^sh\.tangled\./, "Tangled"],
  [/^place\.wisp\./, "Wisp"],
  [/^com\.kipclip\./, "kipclip"],
  [/^net\.anisota\./, "Anisota"],
  [/^community\.lexicon\.bookmarks/, "Bookmarks"],
  [/^com\.atprotofans\./, "atprotofans"],
];

/** Trailing NSID segment, prettified: app.bsky.feed.post -> post. */
export function kindLabel(nsid) {
  const tail = nsid.split(".").slice(3).join(" ") || nsid.split(".").pop();
  return tail.replace(/\./g, " ");
}

export function appLabel(nsid) {
  for (const [re, name] of APPS) if (re.test(nsid)) return name;
  return nsid.split(".").slice(0, 2).join(".");
}

export class Pensieve {
  constructor() {
    this.kb = null;
    this.meta = null;
    this.tokenizer = null;
    this.session = null;
    this.mode = "loading";
  }

  /** Stage 1: index + sidecar. Enables lexical search. */
  async loadIndex(kbiUrl, chunksBaseUri, metaUrl, onProgress) {
    const [bytes, meta] = await Promise.all([
      fetchWithProgress(kbiUrl, onProgress),
      fetch(metaUrl).then(r => {
        if (!r.ok) throw new Error(`fetch ${metaUrl}: ${r.status}`);
        return r.json();
      }),
    ]);
    this.kb = new KBReader(new Uint8Array(bytes), chunksBaseUri);
    this.meta = meta;
    this.mode = "lexical";
    return this.kb.manifest;
  }

  /** Stage 2: the encoder. Upgrades the same index to hybrid. */
  async loadEncoder({ ort, modelUrl, dataUrl, tokenizerUrl, wasmPaths }, onProgress) {
    ort.env.wasm.wasmPaths = wasmPaths;
    ort.env.wasm.numThreads = 1;
    this.tokenizer = await WordPieceTokenizer.fromUrl(tokenizerUrl);
    onProgress?.({ stage: "tokenizer" });
    // The graph's weights live in a sibling external-data file, resolved by the
    // relative name recorded inside the graph — both must keep upstream's names.
    this.session = await ort.InferenceSession.create(modelUrl, {
      executionProviders: ["wasm"],
      externalData: [{ path: "model_quantized.onnx_data", data: dataUrl }],
    });
    this.ort = ort;
    this.mode = "hybrid";
    onProgress?.({ stage: "encoder" });
  }

  /** L2-normalized 1024-d query vector, or null when the encoder is not up. */
  async embed(text) {
    if (!this.session) return null;
    const { ids, mask, dims } = this.tokenizer.encodeBatch([QUERY_PREFIX + text]);
    const zeros = new BigInt64Array(ids.length);
    const T = this.ort.Tensor;
    const out = await this.session.run({
      input_ids: new T("int64", ids, dims),
      attention_mask: new T("int64", mask, dims),
      token_type_ids: new T("int64", zeros, dims),
    });
    const v = Float32Array.from(out.sentence_embedding.data);
    let n = 0;
    for (const x of v) n += x * x;
    n = Math.sqrt(n) || 1;
    for (let i = 0; i < v.length; i++) v[i] /= n;
    return v;
  }

  /**
   * One result per record, best-ranked chunk wins.
   *
   * `who` and `app` filter after retrieval rather than before, so the pool is
   * over-fetched by 8x: the index has no per-field posting lists, and a filter
   * that ran first would have to score the whole corpus. 8x covers a filter as
   * narrow as Muninn's 98 posts against Oskar's 3,324 for any query that has
   * matches on that side at all.
   */
  async search(query, { k = 10, who = "all", app = "all" } = {}) {
    if (!this.kb) throw new Error("index not loaded");
    const pool = k * 8;

    const t0 = performance.now();
    const qv = await this.embed(query);
    const tEmbed = performance.now() - t0;

    const t1 = performance.now();
    // With an encoder: alpha=0.5 weighted fusion rather than RRF, following the
    // shell-search measurement — RRF discards the score magnitudes a two-arm
    // fusion over unequal arms needs.
    //
    // Without one: `KBReader.search()` always runs its dense leg and
    // `_denseSearch(null)` throws, and alpha=0 does not avoid it (the leg runs
    // first and is only zero-weighted after). `_bm25Search` is the one place
    // this file reaches into reader internals; it is safe against a vendored,
    // version-pinned copy, and a lexical-only entry point upstream would
    // remove the need.
    const hits = qv
      ? this.kb.search(query, qv, { k: pool, alpha: 0.5, overFetch: defaultOverFetch(pool) })
      : this.kb._bm25Search(query).slice(0, pool).map(h => this.kb._withChunkId(h));
    const tSearch = performance.now() - t1;

    const bySlug = new Map();
    for (const h of hits) {
      const slug = String(h.chunk_id || "").split("#")[0].replace(/\.md$/, "");
      const m = this.meta[slug];
      if (!m) continue;
      if (who !== "all" && m.handle !== who) continue;
      if (app !== "all" && appLabel(m.kind) !== app) continue;
      const seen = bySlug.get(slug);
      if (seen) { seen.chunks++; continue; }
      bySlug.set(slug, {
        slug,
        chunks: 1,
        handle: m.handle,
        kind: m.kind,
        app: appLabel(m.kind),
        kindLabel: kindLabel(m.kind),
        title: m.title,
        body: m.body,
        url: m.url,
        details: m.details,
        date: m.date,
        dense_sim: h.dense_sim,
        bm25_score: h.bm25_score,
      });
      if (bySlug.size >= k) break;
    }
    return { results: [...bySlug.values()], mode: this.mode, tEmbed, tSearch,
             pool: hits.length };
  }
}

async function fetchWithProgress(url, onProgress) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`fetch ${url}: ${resp.status}`);
  const total = Number(resp.headers.get("content-length")) || 0;
  if (!resp.body || !total) return await resp.arrayBuffer();
  const reader = resp.body.getReader();
  const parts = [];
  let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    parts.push(value);
    got += value.length;
    onProgress?.({ got, total });
  }
  const buf = new Uint8Array(got);
  let off = 0;
  for (const p of parts) { buf.set(p, off); off += p.length; }
  return buf.buffer;
}
