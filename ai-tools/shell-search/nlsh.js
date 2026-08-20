// nlsh.js — client-side retrieval over the enriched shell-documentation corpus.
//
// Everything runs in the browser: the .kbi is fetched once, chunk bodies come
// back through HTTP Range requests against the .kbc shards, and the query
// embedding is computed locally by a 23.9 MB int8 ONNX encoder. No server, no
// API key, nothing leaves the page.
//
// Loading is progressive on purpose. The .kbi carries BM25 postings, so lexical
// search answers as soon as ~6 MB has arrived; the dense arm joins when the
// encoder finishes and the mode flips to hybrid RRF. That ordering is also the
// honest demo: BM25-over-enriched-corpus is most of the measured win, and the
// dense arm is what closes the vocabulary gap on queries like "recover the
// password", which no lexical index can reach.

import { KBReader, defaultOverFetch } from "./kb-reader.js";
import { WordPieceTokenizer } from "./wordpiece.js";

const QUERY_PREFIX = "Represent this sentence for searching relevant passages: ";

export class ShellSearch {
  constructor() {
    this.kb = null;
    this.tokenizer = null;
    this.session = null;
    this.mode = "loading";
  }

  /** Stage 1: the index alone. Enables lexical search. */
  async loadIndex(kbiUrl, chunksBaseUri, onProgress) {
    const bytes = await fetchWithProgress(kbiUrl, onProgress);
    this.kb = new KBReader(new Uint8Array(bytes), chunksBaseUri);
    this.mode = "lexical";
    return this.kb.manifest;
  }

  /** Stage 2: the encoder. Upgrades the same index to hybrid. */
  async loadEncoder({ ort, modelUrl, dataUrl, tokenizerUrl, wasmPaths }, onProgress) {
    ort.env.wasm.wasmPaths = wasmPaths;
    ort.env.wasm.numThreads = 1;
    this.tokenizer = await WordPieceTokenizer.fromUrl(tokenizerUrl);
    onProgress?.({ stage: "tokenizer" });
    // The graph's weights live in a sibling external-data file; ORT resolves it
    // by the relative name recorded inside the graph, so both must be named as
    // upstream named them.
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
   * Utility-level results. The corpus is one document per utility page, so a
   * hit IS a utility; dedupe defensively anyway and keep rank order.
   */
  async search(query, { k = 8 } = {}) {
    if (!this.kb) throw new Error("index not loaded");
    const t0 = performance.now();
    const qv = await this.embed(query);
    const tEmbed = performance.now() - t0;

    const t1 = performance.now();
    // With an encoder: alpha=0.5 (weighted) rather than RRF — measured 0.480 vs
    // 0.462 gold-in-sources on this corpus, because RRF discards the score
    // magnitudes a two-arm fusion over unequal arms needs.
    //
    // Without one: a genuinely lexical-only pass. `KBReader.search()` always
    // runs its dense leg and `_denseSearch(null)` throws inside
    // `encodeQueryCode`, so there is no public way to ask for BM25 alone, and
    // alpha=0 does not avoid it — the dense leg runs first and is only
    // zero-WEIGHTED afterwards. Reaching for the private `_bm25Search` is the
    // honest option and is safe against a vendored, version-pinned reader; it
    // is the one place this file depends on kb-reader internals, and a
    // lexical-only entry point upstream would remove it.
    const hits = qv
      ? this.kb.search(query, qv, { k, alpha: 0.5, overFetch: defaultOverFetch(k) })
      : this.kb._bm25Search(query).slice(0, k).map(h => this.kb._withChunkId(h));
    const enriched = await this.kb.fetchChunks(hits);
    const tSearch = performance.now() - t1;

    const seen = new Set();
    const results = [];
    for (const h of enriched) {
      const u = h.meta?.utility || h.chunk_id;
      if (seen.has(u)) continue;
      seen.add(u);
      results.push({ utility: u, ...splitCard(h.text), verified: h.verified,
                     explain: h.explain });
    }
    return { results, mode: this.mode, tEmbed, tSearch };
  }
}

/**
 * The enriched page format is the generated card stacked above the verbatim
 * documentation (see nl2sh-dense/enrich.py `render`). Split them so the UI can
 * show the goal-level lines as the summary and keep the tldr examples as the
 * authoritative body — the generated half is a retrieval aid, not documentation
 * to trust over the real page, and the UI has to say which is which.
 */
function splitCard(text) {
  const lines = text.split("\n");
  const card = { summary: "", category: "", intents: [], notFor: [] };
  let i = 0;
  for (; i < lines.length; i++) {
    const l = lines[i];
    if (i === 0 && l && !l.startsWith("Category:") && !l.startsWith("Use when")) {
      card.summary = l; continue;
    }
    if (l.startsWith("Category: ")) { card.category = l.slice(10); continue; }
    if (l.startsWith("Use when you want to: ")) {
      card.intents = l.slice(22).split("; ").filter(Boolean); continue;
    }
    if (l.startsWith("Not for: ")) {
      card.notFor = l.slice(9).split("; ").filter(Boolean); continue;
    }
    break;
  }
  return { ...card, docs: lines.slice(i).join("\n").trim() };
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
